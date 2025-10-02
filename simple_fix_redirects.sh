#!/bin/bash

# Simple fix for redirect loops with Cloudflare domains

echo "Creating simple Nginx configuration..."

cat <<'EOF' > /etc/nginx/sites-available/xekku-panel
# HTTP server - handle all HTTP traffic without redirects for Cloudflare domains
server {
    listen 80;
    server_name cbinfodesk.shop stephenhawkinswheelchair.fun *.stephenhawkinswheelchair.fun;
    
    # Only redirect main domain to HTTPS, not Cloudflare domains
    if ($host = cbinfodesk.shop) {
        return 301 https://$host$request_uri;
    }
    
    # For all other domains (Cloudflare), serve directly
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS server for main domain only
server {
    listen 443 ssl;
    server_name cbinfodesk.shop;

    ssl_certificate /etc/letsencrypt/live/cbinfodesk.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cbinfodesk.shop/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Apply the configuration
rm -f /etc/nginx/sites-enabled/xekku-panel
ln -s /etc/nginx/sites-available/xekku-panel /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx

echo "Simple configuration applied!"
echo "Test your domains:"
echo "- https://cbinfodesk.shop"
echo "- https://stephenhawkinswheelchair.fun/?id=dXNlcg=="