#!/bin/bash

echo "==================================="
echo "  Fixing Database Setup Issue      "
echo "==================================="

# Stop all running PM2 processes first
echo "--- Stopping PM2 processes... ---"
pm2 stop all
pm2 delete all

# Kill any Node.js processes that might be using the database
echo "--- Killing any remaining Node.js processes... ---"
pkill -f node || true
pkill -f npm || true

# Wait a moment for processes to fully stop
sleep 3

# Check what's using the database
echo "--- Checking database connections... ---"
sudo -u postgres psql -c "SELECT pid, usename, application_name, client_addr FROM pg_stat_activity WHERE datname = 'xekupanel';"

# Terminate active database connections
echo "--- Terminating active database connections... ---"
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'xekupanel' AND pid <> pg_backend_pid();"

# Wait a moment
sleep 2

# Now drop and recreate the database
echo "--- Dropping and recreating database... ---"
sudo -u postgres dropdb xekupanel || true
sudo -u postgres createdb xekupanel
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'xekupanel';"

# Create the database schema
echo "--- Creating database schema... ---"
sudo -u postgres psql -d xekupanel -f database.sql

echo "✅ Database setup complete!"
echo ""
echo "🚀 Now you can run the rest of setup.sh safely:"
echo "   1. PM2 processes stopped"
echo "   2. Database connections terminated"
echo "   3. Fresh database created"
echo ""
echo "Continue with: sudo ./setup.sh"