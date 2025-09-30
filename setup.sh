#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Update and upgrade the system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js and npm
sudo apt-get install -y nodejs npm

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a new PostgreSQL user and database
sudo -u postgres psql <<'EOF'
CREATE USER myuser WITH PASSWORD 'mypassword';
CREATE DATABASE mydatabase;
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
\q
EOF

# Clone the project repository
git clone https://github.com/your-username/your-project.git
cd your-project

# Install project dependencies
npm install

# Create a .env file from the example
cp .env.example .env

# Set the database connection details in the .env file
sed -i 's/DB_USER=.*/DB_USER=myuser/' .env
sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=mypassword/' .env
sed -i 's/DB_DATABASE=.*/DB_DATABASE=mydatabase/' .env

# Set up the database schema
psql -U myuser -d mydatabase -f database.sql

# Build the project
npm run build

# Start the server
npm start &

# Install and configure Nginx
sudo apt-get install -y nginx

# Create a new Nginx configuration file
sudo tee /etc/nginx/sites-available/your-project > /dev/null <<'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the new Nginx configuration
sudo ln -s /etc/nginx/sites-available/your-project /etc/nginx/sites-enabled/

# Test the Nginx configuration and restart the service
sudo nginx -t
sudo systemctl restart nginx

echo "Setup complete. Your application is now running and accessible at http://your-domain.com"
