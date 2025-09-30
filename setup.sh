#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
DB_USER="postgres"
#DB_PASS=$(openssl rand -hex 12) # Generate a random password
DB_PASS=xekupanel # For simplicity, using a fixed password. Change as needed.
DB_NAME="xekupanel"
DOMAIN="cbinfodesk.shop" # Replace with your actual domain
GIT_REPO="https://github.com/yaxeku/atrium2.git"

# --- Sourcing NVM for PM2 ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# --- Cleanup Previous Installation ---
echo "--- Cleaning up previous installation... ---"

if command -v pm2 &> /dev/null; then
    echo "PM2 found. Cleaning up processes..."
    pm2 delete atrium-frontend || echo "atrium-frontend not found."
    pm2 delete atrium-backend || echo "atrium-backend not found."
    pm2 save --force
else
    echo "PM2 not found, skipping cleanup."
fi

if [ -f "/etc/nginx/sites-enabled/atrium" ]; then
    echo "Removing Nginx site configuration..."
    sudo rm /etc/nginx/sites-enabled/atrium
    sudo systemctl reload nginx
fi
if [ -f "/etc/nginx/sites-available/atrium" ]; then
    sudo rm /etc/nginx/sites-available/atrium
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Dropping PostgreSQL database '$DB_NAME'..."
    sudo -u postgres psql -c "DROP DATABASE $DB_NAME WITH (FORCE);"
fi
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "Dropping PostgreSQL user '$DB_USER'..."
    sudo -u postgres psql -c "DROP USER $DB_USER;"
fi

echo "--- Cleanup complete. Starting fresh installation. ---"

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
echo "FRONTEND_URL=https://$DOMAIN" >> .env

# --- Database Schema Setup ---
echo "Setting up database schema..."
PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB_NAME -f database.sql

# --- Create Default User ---
echo "Creating default user..."
tee create_user.js > /dev/null <<'EOF'
import pkg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const saltRounds = 10;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

async function createUser(username, password, rank = 'user', guild = 'default') {
    if (!username || !password) {
        console.error('Username and password are required.');
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const insertQuery = 'INSERT INTO users (username, password, rank, guild) VALUES ($1, $2, $3, $4)';
        await pool.query(insertQuery, [username, hashedPassword, rank, guild]);
        console.log(`User '${username}' created successfully.`);
    } catch (error) {
        console.error(`Error creating user '${username}':`, error);
    } finally {
        pool.end();
    }
}

const defaultUser = process.env.DEFAULT_ADMIN || 'admin';
const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';

createUser(defaultUser, defaultPassword);
EOF

node create_user.js
rm create_user.js

# --- Build the Project ---
echo "Building the project..."
npm run build

# --- PM2 Setup ---
echo "Setting up PM2..."
npm install pm2 -g
pm2 start ecosystem.config.cjs
pm2 startup
pm2 save

# --- Web Server Conflict Resolution ---
echo "Checking for and disabling conflicting web servers..."
if systemctl is-active --quiet apache2; then
    echo "Apache2 is running. Stopping and disabling it to prevent conflicts."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
fi
if systemctl is-active --quiet caddy; then
    echo "Caddy is running. Stopping and disabling it to prevent conflicts."
    sudo systemctl stop caddy
    sudo systemctl disable caddy
fi

# --- Nginx Configuration ---
echo "Configuring Nginx for HTTP..."
sudo tee /etc/nginx/sites-available/atrium > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN;

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/atrium /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# --- SSL/TLS Setup with Certbot ---
echo "Setting up SSL/TLS with Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m "admin@$DOMAIN"

# --- Update Nginx Configuration for HTTPS ---
echo "Updating Nginx configuration for HTTPS..."
sudo tee /etc/nginx/sites-available/atrium > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN;

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Proxy to the SvelteKit frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Proxy API and WebSocket connections to the backend server
    location ~ ^/(api|socket\.io)/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo nginx -t
sudo systemctl restart nginx

# --- Firewall Configuration ---
echo "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

echo "----------------------------------------"
echo "Setup Complete!"
echo "Your application is now running."
echo "Domain: https://$DOMAIN"
echo "Database User: $DB_USER"
echo "Database Password: $DB_PASS"
echo "Database Name: $DB_NAME"
echo "----------------------------------------"
