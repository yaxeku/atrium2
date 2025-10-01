#!/bin/bash

# =============================================================================
# Atrium Production Deployment Script
# =============================================================================
# This script automates the deployment of the Atrium application on a fresh
# Ubuntu server.
#
# --- HOW TO USE ---
# 1. Configure your local `.env` file with your production secrets.
# 2. Copy this script (`setup.sh`) and your `.env` file to the
#    target VPS (e.g., using `scp`).
# 3. Connect to your VPS via SSH.
# 4. Make the script executable: `chmod +x setup.sh`
# 5. Run the script: `sudo ./setup.sh`
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
    set -a
    source .env
    set +a
else
    echo "Error: .env file not found. Please create one based on .env.example."
    exit 1
fi

# Check for required variables from .env and provide clear error messages
if [ -z "${DB_USER}" ]; then echo "ERROR: DB_USER is not set in your .env file."; exit 1; fi
if [ -z "${DB_PASSWORD}" ]; then echo "ERROR: DB_PASSWORD is not set in your .env file."; exit 1; fi
if [ -z "${DB_DATABASE}" ]; then echo "ERROR: DB_DATABASE is not set in your .env file."; exit 1; fi
if [ -z "${JWT_SECRET}" ]; then echo "ERROR: JWT_SECRET is not set in your .env file."; exit 1; fi
if [ -z "${TELEGRAM_BOT_TOKEN}" ]; then echo "ERROR: TELEGRAM_BOT_TOKEN is not set in your .env file."; exit 1; fi

# Use localhost and 5432 as defaults if DB_HOST/DB_PORT are not set in .env
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

DOMAIN_NAME=""
APP_DIR="/root/atrium2"

# --- User Input ---
print_info "Atrium Production Setup"
read -p "Enter your domain name (e.g., atrium.example.com): " DOMAIN_NAME

# --- Main Setup Logic ---

# 1. INITIAL SERVER SETUP
print_info "Step 1: Initial Server Setup"
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git build-essential

# 2. INSTALL DEPENDENCIES
print_info "Step 2: Installing Dependencies"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

print_info "Setting up PostgreSQL database and user..."
# The following commands ensure a clean slate by dropping the existing database
# and user (if they exist) before creating them again.
# The "could not change directory" warning is harmless and can be ignored.
echo "Dropping existing database (if any) for a fresh start..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_DATABASE;"
if [ "$DB_USER" = "postgres" ]; then
    echo "Configuring password for existing 'postgres' superuser..."
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';"
else
    echo "Creating dedicated application user '$DB_USER'..."
    sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
fi
sudo -u postgres psql -c "CREATE DATABASE $DB_DATABASE OWNER $DB_USER;"
echo "Database and user created successfully."

# This step was critically missing. We now populate the new database with the required tables.
print_info "Populating the database with the application schema..."
# We must clone the repo first to get access to database.sql
if [ ! -d "$APP_DIR" ]; then
    git clone https://github.com/yaxeku/atrium2.git $APP_DIR
fi
# We must pipe the sql file into psql because the 'postgres' user does not have
# permission to read files in the /root directory.
cat $APP_DIR/database.sql | sudo -u postgres psql -d $DB_DATABASE
echo "Database schema populated successfully."

apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
npm install -g pm2

# 3. APPLICATION SETUP
print_info "Step 3: Setting up the Atrium Application"
# The repository is now cloned before this step, so we just confirm it exists.
if [ ! -d "$APP_DIR" ]; then
    echo "ERROR: Application directory was not found. Cloning failed."
    exit 1
fi

print_info "Copying and configuring .env file..."
cp .env "$APP_DIR/.env"
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE"
grep -qF "PORT=" "$APP_DIR/.env" && sed -i "s/PORT=.*/PORT=8080/" "$APP_DIR/.env" || echo "PORT=8080" >> "$APP_DIR/.env"
grep -qF "VITE_APP_URL=" "$APP_DIR/.env" && sed -i "s|VITE_APP_URL=.*|VITE_APP_URL=https://$DOMAIN_NAME|" "$APP_DIR/.env" || echo "VITE_APP_URL=https://$DOMAIN_NAME" >> "$APP_DIR/.env"
grep -qF "DATABASE_URL=" "$APP_DIR/.env" && sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$APP_DIR/.env" || echo "DATABASE_URL=$DATABASE_URL" >> "$APP_DIR/.env"

# SvelteKit requires private env variables to be prefixed with `PRIVATE_` to be exposed during build.
# We will rename the variables in the .env file that the application will use.
sed -i 's/^\(JWT_SECRET\)/PRIVATE_\1/' "$APP_DIR/.env"
sed -i 's/^\(MAIL_SERVER_URL\)/PRIVATE_\1/' "$APP_DIR/.env"
sed -i 's/^\(MAIL_AUTH_HEADER\)/PRIVATE_\1/' "$APP_DIR/.env"
sed -i 's/^\(MAIL_AUTH_VALUE\)/PRIVATE_\1/' "$APP_DIR/.env"

echo ".env file configured for production."

print_info "Installing dependencies and building application..."
# The error "Cannot find module @rollup/rollup-linux-x64-gnu" is a known npm bug
# with optional dependencies. The official workaround is to perform a clean install.
cd $APP_DIR
echo "Performing a clean install to prevent build errors..."
rm -rf node_modules package-lock.json
npm install

print_info "Building the application..."
npm run build

print_info "Pruning development dependencies for production..."
npm prune --production

# 4. CONFIGURE PM2 AND NGINX
print_info "Step 4: Configuring PM2 and Nginx"
# The ecosystem file must end in .cjs because the project uses "type": "module" in package.json
cat > "$APP_DIR/ecosystem.config.cjs" << EOL
module.exports = {
  apps: [
    {
      name: 'atrium-app',
      script: 'build/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'atrium-server',
      script: 'server.js',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 8080 } // Assign a dedicated port
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
cd $APP_DIR
# Stop and delete any old running instances of the app to ensure a clean start
pm2 delete ecosystem.config.cjs || true
pm2 start ecosystem.config.cjs
pm2 save
# The `pm2 startup` command generates a command that needs to be run with sudo.
# We capture that specific command from the output and then execute it.
STARTUP_CMD=$(sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u root | grep 'sudo env')

if [ -n "$STARTUP_CMD" ]; then
  echo "Executing PM2 startup command..."
  eval "$STARTUP_CMD"
else
  echo "ERROR: Could not automatically determine the PM2 startup command."
  echo "Please run 'pm2 startup' manually and execute the command it provides."
  exit 1
fi

print_info "Configuring Nginx..."
# This configuration was incorrect. The socket.io location block was misplaced.
# The corrected version is now generated by Certbot and then modified.
# We will create a temporary file first, let certbot modify it, then add the socket.io proxy.
cat > /etc/nginx/sites-available/atrium << EOL
server {
    server_name $DOMAIN_NAME;

    location /src/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
ln -sfn /etc/nginx/sites-available/atrium /etc/nginx/sites-enabled/atrium
nginx -t
systemctl restart nginx

print_info "Obtaining SSL certificate with Certbot..."
# !!! IMPORTANT FOR CLOUDFLARE USERS !!!
# If you are using Cloudflare, you MUST temporarily disable the proxy (set to "DNS Only" / grey cloud)
# for your domain before this step. Certbot needs to connect directly to your server to issue the
# SSL certificate. You can re-enable the proxy (orange cloud) after the script is finished.
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m admin@$DOMAIN_NAME

print_info "Adding WebSocket proxy to Nginx configuration..."
# After Certbot creates the SSL config, we add the socket.io proxy to it.
# This uses sed to insert the location block before the final closing brace `}`.
sed -i '/^}$/i \
    location /socket.io/ { \
        proxy_pass http://localhost:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade \$http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host \$host; \
    }' /etc/nginx/sites-available/atrium

systemctl restart nginx
ln -sfn /etc/nginx/sites-available/atrium /etc/nginx/sites-enabled/atrium
nginx -t
systemctl restart nginx

>>>>>>> Stashed changes

# 5. SECURITY SETUP
print_info "Step 5: Configuring Firewall"
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
# Allow all Nginx traffic (for both http and https)
ufw allow 'Nginx Full'
>>>>>>> Stashed changes

# --- Final Instructions ---
print_info "Deployment Complete!"
echo "Your Atrium application is now deployed and running."
echo "You can access it at: https://$DOMAIN_NAME"
echo "To monitor your application, use: pm2 list"
echo "Setup is finished."
