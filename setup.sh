#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Prompt for User Input ---
echo "--- Xekku Panel VPS Setup ---"
echo "Checking for existing environment variables..."

if [ -z "$DOMAIN_NAME" ]; then
  read -p "Enter your domain name (e.g., your-domain.com): " DOMAIN_NAME
fi

if [ -z "$DB_NAME" ]; then
  read -p "Enter the desired database name: " DB_NAME
fi

if [ -z "$DB_USER" ]; then
  read -p "Enter the desired database username: " DB_USER
fi

if [ -z "$DB_PASSWORD" ]; then
  read -s -p "Enter the desired database password: " DB_PASSWORD
  echo ""
fi

# --- System Update and Dependency Installation ---
echo "--- Updating system packages... ---"
apt-get update
apt-get upgrade -y

echo "--- Installing dependencies (Nginx, PostgreSQL, Node.js, Certbot, PM2)... ---"
# lsof is needed to check for processes on a given port
apt-get install -y nginx postgresql postgresql-contrib git curl lsof
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
apt-get install -y certbot python3-certbot-nginx
npm install pm2 -g

# --- Database Configuration ---
echo "--- Configuring PostgreSQL database... ---"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "ALTER ROLE $DB_USER SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE $DB_USER SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE $DB_USER SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# --- Application Setup ---
echo "--- Cloning and setting up the application... ---"
# Remove existing directory to ensure a fresh clone
rm -rf /var/www/xekku-panel
# Create parent directory if it doesn't exist
mkdir -p /var/www
# Clone the repository
git clone https://github.com/yaxeku/atrium2.git /var/www/xekku-panel
cd /var/www/xekku-panel

echo "--- Installing Node.js dependencies... ---"
echo "Ensuring a clean installation by removing old dependencies..."
rm -rf node_modules package-lock.json
npm install

echo "--- Initializing database schema... ---"
sudo -u postgres psql -d $DB_NAME -f /var/www/xekku-panel/database.sql

# --- Nginx and SSL Configuration ---
echo "--- Configuring Nginx and obtaining SSL certificate... ---"
# Create a directory for Certbot's ACME challenges
mkdir -p /var/www/certbot
# Remove ALL default/existing Nginx configs to prevent conflicts
rm -f /etc/nginx/sites-enabled/*

# Create a temporary Nginx config for the HTTP challenge
cat <<EOF > /etc/nginx/sites-available/$DOMAIN_NAME
server {
    listen 80;
    server_name $DOMAIN_NAME;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
EOF

# Enable the site and restart Nginx
rm -f /etc/nginx/sites-enabled/$DOMAIN_NAME
ln -s /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/

# Forcefully kill any process on port 80 to prevent conflicts
if lsof -t -i:80 > /dev/null; then
  echo "A process is already using port 80. Killing it..."
  kill -9 $(lsof -t -i:80)
fi

systemctl restart nginx

# Obtain the certificate using the webroot method
certbot certonly --webroot -w /var/www/certbot -d $DOMAIN_NAME --non-interactive --agree-tos -m admin@$DOMAIN_NAME

# Overwrite the temporary config with the final, SSL-enabled configuration
cat <<EOF > /etc/nginx/sites-available/$DOMAIN_NAME
server {
    listen 80;
    server_name $DOMAIN_NAME;
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
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
    }
}
EOF

# --- Start Application with PM2 ---
echo "--- Starting the application with PM2... ---"
# Ensure port 3000 is free before starting the app
if lsof -t -i:3000 > /dev/null; then
  echo "A process is already using port 3000. Killing it..."
  kill -9 $(lsof -t -i:3000)
fi
# Stop and delete any existing PM2 process with the same name
pm2 delete "xekku-panel" || true

# Build the application first
npm run build

# Start the application using the npm start script
pm2 start npm --name "xekku-panel" -- start
pm2 startup
pm2 save

# --- Finalizing Setup ---
echo "--- Applying final Nginx configuration... ---"
# Test the final configuration and restart Nginx
nginx -t
systemctl restart nginx

echo "---"
echo "---"
echo "Deployment Complete!"
echo "Your Xekku Panel is now running."
echo "You can access it at: https://$DOMAIN_NAME"
echo "Remember to edit /var/www/xekku-panel/.env with your secret keys."
echo "To view logs, run: pm2 logs xekku-panel"
echo "---"
