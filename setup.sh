#!/bin/bash

# Don't exit immediately on error, we want to handle errors gracefully
set +e

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

function check_command {
    if ! command -v $1 &> /dev/null; then
        print_color "33" "$1 could not be found, installing..."
        return 1
    else
        print_color "32" "$1 is already installed"
        return 0
    fi
}

function stop_service {
    service_name=$1
    if systemctl is-active --quiet $service_name; then
        print_color "33" "Stopping $service_name..."
        systemctl stop $service_name
    else
        print_color "33" "$service_name is not running or not installed. Skipping..."
    fi
}

# --- Main Script ---
check_root

# --- Load Environment Variables ---
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
    print_color "32" "Environment variables loaded successfully"
else
    print_color "31" ".env file not found!"
    print_color "33" "Creating default .env file..."
    cp .env.example .env || {
        print_color "31" "Failed to create .env file. Please create it manually."
        exit 1
    }
fi

# --- Check and Install Basic Requirements ---
print_color "36" "Checking basic requirements..."

# Check if apt-get is available (Debian/Ubuntu)
if ! command -v apt-get &> /dev/null; then
    print_color "31" "This script requires apt-get (Debian/Ubuntu). Please adapt it for your distribution."
    exit 1
fi

# Ensure curl is installed first as we need it for Node.js
check_command "curl" || {
    print_color "33" "Installing curl..."
    apt-get update && apt-get install -y curl || {
        print_color "31" "Failed to install curl. Exiting."
        exit 1
    }
}

# --- Stop existing services to prevent conflicts ---
print_color "36" "Checking and stopping existing services..."

# Check systemctl availability
if command -v systemctl &> /dev/null; then
    stop_service "caddy"
    stop_service "nginx"
    stop_service "postgresql"
else
    print_color "33" "systemctl not found. Skipping service management..."
fi

# Check and install Node.js if needed
if ! check_command "node"; then
    print_color "33" "Installing Node.js..."
    # Safely setup NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || {
        print_color "31" "Failed to setup Node.js repository. Exiting."
        exit 1
    }
    apt-get install -y nodejs || {
        print_color "31" "Failed to install Node.js. Exiting."
        exit 1
    }
fi

# Install pm2 globally if needed
if ! check_command "pm2"; then
    print_color "33" "Installing pm2..."
    npm install -g pm2 || {
        print_color "31" "Failed to install pm2. Check if npm is working correctly."
        exit 1
    }
fi

# Stop any existing pm2 processes
if command -v pm2 &> /dev/null; then
    print_color "33" "Stopping PM2 processes..."
    pm2 delete all 2>/dev/null || print_color "33" "No PM2 processes to stop"
fi

# --- System Update and Initial Setup ---
print_color "36" "Updating system and installing dependencies..."
apt-get update || {
    print_color "31" "Failed to update package lists. Check your internet connection and try again."
    exit 1
}
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

# Check if user and database exist, create if they don't
if ! sudo -u postgres psql -t -c '\du' | cut -d \| -f 1 | grep -qw $PG_USER; then
    sudo -u postgres psql -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASS';"
fi
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $PG_DB; then
    sudo -u postgres psql -c "CREATE DATABASE $PG_DB OWNER $PG_USER;"
fi

# Clear existing data and import the database schema
print_color "32" "Clearing database and importing schema..."
sudo -u postgres psql -d $PG_DB -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
sudo -u postgres psql -d $PG_DB < database.sql

# --- Application Setup ---
print_color "32" "Setting up the application..."

# Clean installation directories
print_color "33" "Cleaning up previous installation..."
rm -rf node_modules package-lock.json .svelte-kit build

# Install dependencies with legacy peer deps to handle conflicts
print_color "33" "Installing dependencies..."
npm install --no-audit --legacy-peer-deps || {
    print_color "31" "Failed to install dependencies. Retrying with force..."
    npm install --no-audit --force
}

# Install TypeScript types
print_color "33" "Installing additional TypeScript types..."
npm install --save-dev @types/node || true

# Run SvelteKit sync before building
print_color "33" "Syncing SvelteKit..."
npm run check || {
    print_color "31" "SvelteKit sync failed. Please check the errors above."
    exit 1
}

# Build the application
print_color "33" "Building the application..."
npm run build || {
    print_color "31" "Build failed. Please check the errors above."
    exit 1
}

# --- Nginx Configuration ---
print_color "32" "Configuring Nginx..."
read -p "Please enter the domain name for this server (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_color "31" "Domain name cannot be empty."
    exit 1
fi
cat > /etc/nginx/sites-available/atrium <<EOL
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

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
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
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
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

# --- Application Health Check Function ---
function check_port {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=1

    print_color "33" "Waiting for $service to start on port $port..."
    while ! nc -z localhost $port; do
        if [ $attempt -eq $max_attempts ]; then
            print_color "31" "$service failed to start on port $port after $max_attempts attempts"
            print_color "33" "Checking logs..."
            pm2 logs --lines 50 $service
            return 1
        fi
        print_color "33" "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 2
        ((attempt++))
    done
    print_color "32" "$service successfully started on port $port"
    return 0
}

# --- Start Application with PM2 ---
print_color "32" "Starting application with pm2..."

# Kill any existing Node.js processes
print_color "33" "Cleaning up existing Node.js processes..."
pkill -f "node" || true

# Clear PM2 processes and save clean state
pm2 delete all 2>/dev/null || true
pm2 save --force

# Start frontend
print_color "36" "Starting frontend service..."
if [ ! -f "build/index.js" ]; then
    print_color "31" "Build directory not found. Checking alternate locations..."
    if [ -f ".svelte-kit/build/index.js" ]; then
        BUILD_DIR=".svelte-kit/build"
    else
        print_color "31" "Could not find build directory. Please ensure the application was built successfully."
        exit 1
    fi
else
    BUILD_DIR="build"
fi

NODE_ENV=production pm2 start $BUILD_DIR/index.js --name atrium-frontend --log-date-format 'YYYY-MM-DD HH:mm:ss.SSS' || {
    print_color "31" "Failed to start frontend service"
    pm2 logs atrium-frontend --lines 50
    exit 1
}
check_port 3000 "atrium-frontend" || exit 1

# Start backend
print_color "36" "Starting backend service..."
NODE_ENV=production pm2 start server.js --name atrium-backend --log-date-format 'YYYY-MM-DD HH:mm:ss.SSS' || {
    print_color "31" "Failed to start backend service"
    pm2 logs atrium-backend --lines 50
    exit 1
}
check_port 3001 "atrium-backend" || exit 1

# Start telegram bot
print_color "36" "Starting telegram bot..."
NODE_ENV=production pm2 start telegram_bot.js --name atrium-telegram-bot --log-date-format 'YYYY-MM-DD HH:mm:ss.SSS' || {
    print_color "31" "Failed to start telegram bot"
    pm2 logs atrium-telegram-bot --lines 50
    exit 1
}

# Save PM2 process list and generate startup script
print_color "36" "Saving PM2 process list..."
pm2 save --force

print_color "36" "Setting up PM2 startup script..."
pm2 startup || {
    print_color "31" "Failed to setup PM2 startup script"
    exit 1
}

# --- Verify All Services ---
print_color "36" "Verifying all services..."

# Check if all PM2 processes are running
if ! pm2 list | grep -q "online"; then
    print_color "31" "Some PM2 processes are not running. Current status:"
    pm2 list
    print_color "31" "Check the logs above for more details"
    exit 1
fi

# Final Nginx check
if ! systemctl is-active --quiet nginx; then
    print_color "31" "Nginx is not running. Attempting to start..."
    systemctl start nginx || {
        print_color "31" "Failed to start Nginx. Check the logs:"
        journalctl -u nginx -n 50
        exit 1
    }
fi

print_color "32" "Setup complete! Services status:"
print_color "36" "-----------------------------------"
pm2 list
print_color "36" "-----------------------------------"
systemctl status nginx --no-pager | grep "Active:"
print_color "36" "-----------------------------------"
print_color "33" "If you experience any issues, check the logs with:"
print_color "36" "PM2 logs: 'pm2 logs'"
print_color "36" "Nginx logs: 'journalctl -u nginx'"
