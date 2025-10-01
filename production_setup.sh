#!/bin/bash

# =============================================================================
# Atrium Production Deployment Script
# =============================================================================
# This script automates the deployment of the Atrium application on a fresh
# Ubuntu server. It handles system updates, dependency installation,
# application setup, and configuration of Nginx, PM2, and UFW.
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
# We'll prompt the user for these values.
DOMAIN_NAME=""
DB_PASSWORD=""
JWT_SECRET=""
BOT_TOKEN=""
APP_USER="atrium"
DB_NAME="atrium"
DB_USER="atrium"
APP_DIR="/home/$APP_USER/apps/atrium"

# --- User Input ---
print_info "Atrium Production Setup: Please provide the following details."

read -p "Enter your domain name (e.g., atrium.example.com): " DOMAIN_NAME
read -sp "Enter a secure password for the PostgreSQL database user: " DB_PASSWORD
echo
read -p "Enter a secure random string for the JWT secret: " JWT_SECRET
read -p "Enter your Telegram Bot Token: " BOT_TOKEN

# --- Main Setup Logic ---

# 1. INITIAL SERVER SETUP
print_info "Step 1: Initial Server Setup"

print_info "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential

print_info "Creating application user '$APP_USER'..."
if id "$APP_USER" &>/dev/null; then
    echo "User '$APP_USER' already exists. Skipping creation."
else
    sudo adduser --disabled-password --gecos "" $APP_USER
    sudo usermod -aG sudo $APP_USER
    echo "User '$APP_USER' created."
fi

# Switch to the new user for the rest of the script
# Note: This is a tricky part in scripts. A better approach for a fully automated
# script is to run commands as the user, e.g., sudo -u $APP_USER ...
# For simplicity here, we'll assume the admin runs this and we use sudo.

print_info "The rest of the script will run commands in the context of the '$APP_USER' user where appropriate."

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
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "PostgreSQL user '$DB_USER' already exists."
else
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "PostgreSQL user '$DB_USER' created."
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Database '$DB_NAME' already exists."
else
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo "Database '$DB_NAME' created."
fi

print_info "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_info "Installing PM2..."
sudo npm install -g pm2

# 3. APPLICATION SETUP
print_info "Step 3: Setting up the Atrium Application"

print_info "Cloning the application repository..."
sudo -u $APP_USER mkdir -p /home/$APP_USER/apps
if [ -d "$APP_DIR" ]; then
    echo "Application directory already exists. Skipping clone."
else
    sudo -u $APP_USER git clone https://github.com/yaxeku/atrium2.git $APP_DIR
fi

print_info "Creating .env file..."
# Use a heredoc to create the .env file with the variables.
sudo -u $APP_USER bash -c "cat > $APP_DIR/.env" << EOL
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
sudo -u $APP_USER -- sh -c "cd $APP_DIR && npm ci --production"

print_info "Building the application..."
sudo -u $APP_USER -- sh -c "cd $APP_DIR && npm run build"

# 4. CONFIGURE PM2 AND NGINX
print_info "Step 4: Configuring PM2 and Nginx"

print_info "Creating PM2 ecosystem file..."
sudo -u $APP_USER bash -c "cat > $APP_DIR/ecosystem.config.js" << EOL
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
sudo -u $APP_USER -- sh -c "cd $APP_DIR && pm2 start ecosystem.config.js"
sudo pm2 save
sudo pm2 startup ubuntu -u $APP_USER --hp /home/$APP_USER

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
