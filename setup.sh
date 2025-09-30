#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
DB_USER="xekupanel"
#DB_PASS=$(openssl rand -hex 12) # Generate a random password
DB_PASS=!xekupanel! # For simplicity, using a fixed password. Change as needed.
DB_NAME="xekupanel"
DOMAIN="cbinfodesk.shop" # Replace with your actual domain
GIT_REPO="https://github.com/yaxeku/atrium2.git"

# --- System Update and Dependencies ---
echo "Updating and upgrading the system..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx postgresql postgresql-contrib

# --- PostgreSQL Setup ---
echo "Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if user and database already exist
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "PostgreSQL user '$DB_USER' already exists. Skipping creation."
else
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "PostgreSQL database '$DB_NAME' already exists. Skipping creation."
else
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
fi

# --- Node.js and NVM Setup ---
echo "Installing Node.js via nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install 18 # Install Node.js v18 LTS
nvm use 18

# --- Project Setup ---
echo "Cloning project repository..."
if [ -d "atrium2" ]; then
    echo "Project directory already exists. Skipping clone."
    cd atrium2
    git pull
else
    git clone $GIT_REPO
    cd atrium2
fi

echo "Installing project dependencies..."
npm install

# --- Environment Configuration ---
echo "Configuring environment variables..."
cp .env.example .env

sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_HOST=.*/DB_HOST=localhost/" .env
sed -i "s/DB_PORT=.*/DB_PORT=5432/" .env

# --- Database Schema Setup ---
echo "Setting up database schema..."
PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB_NAME -f database.sql

# --- Build the Project ---
echo "Building the project..."
npm run build

# --- PM2 Setup ---
echo "Setting up PM2..."
npm install pm2 -g
pm2 start server.js --name "atrium-backend"
pm2 startup
pm2 save

# --- Nginx Configuration ---
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/atrium > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/atrium /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# --- Firewall Configuration ---
echo "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

echo "----------------------------------------"
echo "Setup Complete!"
echo "Your application is now running."
echo "Domain: http://$DOMAIN"
echo "Database User: $DB_USER"
echo "Database Password: $DB_PASS"
echo "Database Name: $DB_NAME"
echo "----------------------------------------"
