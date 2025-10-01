#!/bin/bash

# =============================================================================
# Atrium Production Deployment Script
# =============================================================================
# This script automates the deployment of the Atrium application on a fresh
# Ubuntu server.
#
# --- HOW TO USE ---
# 1. Configure your local `.env` file with your production secrets.
# 2. Copy this script (`production_setup.sh`) and your `.env` file to the
#    target VPS (e.g., using `scp`).
# 3. Connect to your VPS via SSH.
# 4. Make the script executable: `chmod +x production_setup.sh`
# 5. Run the script: `./production_setup.sh`
#
# The script will then perform all necessary setup steps.
#
# !!! SECURITY WARNING !!!
# This script is configured to install and run the application in the /root
# directory. This is NOT a recommended practice for production environments
# as it runs the application with the highest possible privileges. For better
# security, consider using a dedicated non-root user.
# =============================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---
print_info() {
    echo "--------------------------------------------------"
    echo "$1"
    echo "--------------------------------------------------"
}

# --- Script Variables ---
# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found. Please create one based on .env.example."
    exit 1
fi

# Check for required variables
: "${DATABASE_URL?DATABASE_URL not set in .env}"
: "${JWT_SECRET?JWT_SECRET not set in .env}"
: "${BOT_TOKEN?BOT_TOKEN not set in .env}"

# Extract DB details from DATABASE_URL
DB_USER=$(echo $DATABASE_URL | awk -F'[:/@]' '{print $4}')
DB_PASSWORD=$(echo $DATABASE_URL | awk -F'[:/@]' '{print $5}')
DB_NAME=$(echo $DATABASE_URL | awk -F'[:/@]' '{print $7}')

DOMAIN_NAME=""
# APP_DIR is set to clone the repository into the /root/ folder.
APP_DIR="/root/atrium2"

# --- User Input ---
print_info "Atrium Production Setup"
read -p "Enter your domain name (e.g., atrium.example.com): " DOMAIN_NAME

# --- Main Setup Logic ---

# 1. INITIAL SERVER SETUP
print_info "Step 1: Initial Server Setup"

print_info "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential

# 2. INSTALL DEPENDENCIES
print_info "Step 2: Installing Dependencies"

print_info "Installing Node.js v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

print_info "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_info "Setting up PostgreSQL database and user..."
# Drop existing database and user to ensure a clean state
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"

echo "Creating PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
echo "Database and user created successfully."

print_info "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_info "Installing PM2..."
sudo npm install -g pm2

# 3. APPLICATION SETUP
print_info "Step 3: Setting up the Atrium Application"

print_info "Cloning the application repository into $APP_DIR..."
if [ -d "$APP_DIR" ]; then
    echo "Application directory already exists. Skipping clone."
else
    git clone https://github.com/yaxeku/atrium2.git $APP_DIR
fi

print_info "Creating .env file..."
# Use a heredoc to create the .env file with the variables.
cat > "$APP_DIR/.env" << EOL
# Application Port
PORT=8080

# Database Connection URL
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

# JSON Web Token Secret
JWT_SECRET=$JWT_SECRET

# Telegram Bot Token
BOT_TOKEN=$BOT_TOKEN

# SvelteKit App URL (for API calls from the frontend)
VITE_APP_URL=https://$DOMAIN_NAME
EOL

echo ".env file created successfully."

print_info "Installing application dependencies..."
cd $APP_DIR && npm ci --production

print_info "Building the application..."
cd $APP_DIR && npm run build

# 4. CONFIGURE PM2 AND NGINX
print_info "Step 4: Configuring PM2 and Nginx"

print_info "Creating PM2 ecosystem file..."
cat > "$APP_DIR/ecosystem.config.js" << EOL
module.exports = {
  apps: [
    {
      name: 'atrium-app',
      script: 'build/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 8080 }
    },
    {
      name: 'atrium-server',
      script: 'server.js',
      instances: 1,
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'atrium-bot',
      script: 'bot.js',
      instances: 1,
      env: { NODE_ENV: 'production' }
    }
  ]
};
EOL

print_info "Starting application with PM2..."
cd $APP_DIR && pm2 start ecosystem.config.js
pm2 save
# Setup PM2 to start on boot for the root user
sudo pm2 startup ubuntu -u root --hp /root

print_info "Configuring Nginx..."
sudo bash -c "cat > /etc/nginx/sites-available/atrium" << EOL
server {
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOL

print_info "Enabling Nginx site..."
sudo ln -sfn /etc/nginx/sites-available/atrium /etc/nginx/sites-enabled/atrium
sudo nginx -t
sudo systemctl restart nginx

print_info "Obtaining SSL certificate with Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m admin@$DOMAIN_NAME
sudo systemctl restart nginx

# 5. SECURITY SETUP
print_info "Step 5: Configuring Firewall"

sudo apt-get install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# --- Final Instructions ---
print_info "Deployment Complete!"
echo "Your Atrium application is now deployed and running."
echo "You can access it at: https://$DOMAIN_NAME"
echo ""
echo "To monitor your application, you can use the following commands:"
echo "  pm2 list"
echo "  pm2 logs atrium-app"
echo ""
echo "Setup is finished."
