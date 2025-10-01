#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---
function print_color {
    COLOR=$1
    TEXT=$2
    echo -e "\e[${COLOR}m${TEXT}\e[0m"
}

function check_root {
    if [ "$EUID" -ne 0 ]; then
        print_color "31" "Please run as root"
        exit 1
    fi
}

# --- Main Script ---
check_root

# --- Load Environment Variables ---
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    print_color "31" ".env file not found!"
    exit 1
fi

# --- Stop existing services to prevent conflicts ---
print_color "33" "Stopping existing services..."
# Stop Caddy as it may be using ports 80/443
systemctl stop caddy || true
systemctl stop nginx || true
systemctl stop postgresql || true
npm install -g pm2
pm2 delete all || true

# --- System Update and Dependency Installation ---
print_color "32" "Updating system and installing dependencies..."
apt-get update
apt-get install -y curl # Ensure curl is available
# Set up NodeSource repository for Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# Install dependencies (npm is included with nodejs from nodesource)
apt-get install -y nginx postgresql postgresql-contrib nodejs certbot python3-certbot-nginx

# --- Start PostgreSQL Service ---
print_color "32" "Starting PostgreSQL service..."
systemctl start postgresql

# --- PostgreSQL Setup ---
print_color "32" "Setting up PostgreSQL..."
PG_USER="$DB_USER"
PG_DB="$DB_DATABASE"
PG_PASS="$DB_PASSWORD"

# Drop existing user and database to ensure a fresh start
print_color "33" "Dropping existing database and user (if they exist)..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $PG_DB;"
sudo -u postgres psql -c "DROP USER IF EXISTS $PG_USER;"

# Create user and database
print_color "32" "Creating new database and user..."
sudo -u postgres psql -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASS';"
sudo -u postgres psql -c "CREATE DATABASE $PG_DB OWNER $PG_USER;"

# Import the database schema
print_color "32" "Importing database schema..."
sudo -u postgres psql -d $PG_DB < database.sql

# --- Application Setup ---
print_color "32" "Setting up the application..."
npm install
npm run build

# --- Firewall Configuration ---
print_color "32" "Configuring firewall..."
apt-get install -y ufw
ufw allow 22/tcp # Allow SSH
ufw allow 80/tcp # Allow HTTP
ufw allow 443/tcp # Allow HTTPS
ufw --force enable
print_color "32" "Firewall enabled and configured."

# --- Nginx Configuration ---
print_color "32" "Configuring Nginx..."
read -p "Please enter the domain name for this server (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_color "31" "Domain name cannot be empty."
    exit 1
fi
cat > /etc/nginx/sites-available/atrium <<EOL
server {
       server_name $DOMAIN;

       location /ws-api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host \$host;
       }
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }

       listen 80; # Listen on port 80 for initial Certbot challenge
   }
EOL

ln -sf /etc/nginx/sites-available/atrium /etc/nginx/sites-enabled/
nginx -t # Test initial Nginx configuration

# --- SSL Certificate with Certbot (Standalone) ---
print_color "32" "Setting up SSL certificate..."
print_color "33" "IMPORTANT: Your domain '$DOMAIN' must be pointing to this server's public IP for this step to succeed."
# Stop Nginx to free up port 80 for Certbot's standalone validation
systemctl stop nginx
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

# --- Reconfigure Nginx for SSL ---
print_color "32" "Reconfiguring Nginx for SSL..."
cat > /etc/nginx/sites-available/atrium <<EOL
server {
    listen 80;
    server_name $DOMAIN;
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
       listen 443 ssl;
       server_name $DOMAIN;
       
       ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

       location /ws-api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host \$host;
       }

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }
   }
EOL

# --- Final Nginx Config Test & Restart ---
print_color "32" "Validating final Nginx configuration..."
nginx -t
print_color "33" "Forcefully clearing ports 80 and 443..."
fuser -k 80/tcp || true
fuser -k 443/tcp || true
print_color "32" "Restarting Nginx with new SSL configuration..."
systemctl restart nginx

# --- Start Application with PM2 ---
print_color "32" "Starting application with pm2..."
pm2 start build/index.js --name atrium-frontend
pm2 start server.js --name atrium-backend
pm2 start telegram_bot.js --name atrium-telegram-bot
pm2 startup
pm2 save

print_color "32" "Setup complete!"
