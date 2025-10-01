#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---
print_info() {
    echo "--------------------------------------------------"
    echo "$1"
    echo "--------------------------------------------------"
}

# --- Main Setup Logic ---

# 1. UPDATE SYSTEM & INSTALL DEPENDENCIES
print_info "Updating system and installing dependencies (Node.js, PostgreSQL, Git)..."
sudo apt-get update
sudo apt-get install -y curl git postgresql postgresql-contrib

# Install Node.js v18 using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
node -v
npm -v
psql --version

# 2. SETUP POSTGRESQL DATABASE
print_info "Setting up PostgreSQL database..."
DB_NAME="xekupanel"
DB_USER="postgres"
DB_PASS="xekupanel"

# Check if the user and database already exist to make the script re-runnable
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$USER_EXISTS" = "1" ]; then
    echo "User '$DB_USER' already exists. Setting password."
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
else
    echo "User '$DB_USER' does not exist. Creating user and setting password."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
fi

if [ "$DB_EXISTS" = "1" ]; then
    echo "Database '$DB_NAME' already exists."
else
    echo "Database '$DB_NAME' does not exist. Creating database."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi

# 3. POPULATE DATABASE SCHEMA
print_info "Populating the database with the schema from database.sql..."
# Use PGPASSWORD to avoid interactive password prompt
export PGPASSWORD=$DB_PASS
psql -h localhost -U $DB_USER -d $DB_NAME -f database.sql
unset PGPASSWORD
echo "Database population complete."

# 4. SETUP APPLICATION ENVIRONMENT
print_info "Setting up application environment..."

# Create .env file from .env.example or the provided values
if [ -f ".env" ]; then
    echo ".env file already exists. Skipping creation."
else
    echo "Creating .env file..."
    cp .env.example .env
    # You can add sed commands here to automatically fill in values if needed
    # For now, we'll rely on the user to edit it.
    echo "IMPORTANT: .env file created. Please review it and fill in any missing secrets like TELEGRAM_BOT_TOKEN."
fi

# 5. INSTALL NODE.JS DEPENDENCIES
print_info "Installing Node.js project dependencies..."
npm install

# 6. BUILD AND RUN THE APPLICATION
print_info "Building the application and starting all services..."
echo "The application will be started using 'npm run start'."
echo "This will run the Vite server, the backend server, and the Telegram bot concurrently."
echo "To stop the application, press Ctrl+C in the terminal."

# The 'npm run start' command from your package.json builds and then runs everything.
npm run start

print_info "Setup complete. The application is now running."
