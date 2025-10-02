#!/bin/bash

# SSL Certificate Update Script for Additional Domains
# This script adds a new domain to your existing SSL certificate

set -e

# Check if domain parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <new-domain>"
  echo "Example: $0 stephenhawkinswheelchair.fun"
  exit 1
fi

NEW_DOMAIN=$1
MAIN_DOMAIN="cbinfodesk.shop"

echo "Adding $NEW_DOMAIN to SSL certificate..."

# Stop nginx temporarily
systemctl stop nginx

# Obtain certificate for both domains
certbot certonly --standalone \
  -d $MAIN_DOMAIN \
  -d $NEW_DOMAIN \
  --expand \
  --non-interactive \
  --agree-tos \
  --email admin@$MAIN_DOMAIN

# Update Nginx configuration to handle both domains
cat <<EOF > /etc/nginx/sites-available/xekku-panel
# Redirect HTTP to HTTPS for both domains
server {
    listen 80;
    server_name $MAIN_DOMAIN $NEW_DOMAIN;
    return 301 https://\$host\$request_uri;
}

# Main SSL configuration for both domains
server {
    listen 443 ssl;
    server_name $MAIN_DOMAIN $NEW_DOMAIN;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$MAIN_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$MAIN_DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
rm -f /etc/nginx/sites-enabled/xekku-panel
ln -s /etc/nginx/sites-available/xekku-panel /etc/nginx/sites-enabled/

# Test and restart nginx
nginx -t
systemctl start nginx

echo "SSL certificate updated successfully!"
echo "Both $MAIN_DOMAIN and $NEW_DOMAIN should now work with SSL"
echo ""
echo "Next steps:"
echo "1. Update Cloudflare SSL mode to 'Full (strict)' for $NEW_DOMAIN"
echo "2. Test both domains:"
echo "   https://$MAIN_DOMAIN"
echo "   https://$NEW_DOMAIN"