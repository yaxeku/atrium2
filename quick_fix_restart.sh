#!/bin/bash

echo "==================================="
echo "   Quick Fix & Restart             "
echo "==================================="

# Navigate to app directory
cd /var/www/xekku-panel

echo "--- Stopping PM2 processes ---"
pm2 stop all
pm2 delete all

echo "--- Rebuilding application ---"
npm run build

echo "--- Starting main application ---"
pm2 start --name "xekku-panel" npm -- start

echo "--- Starting Socket.io server ---"
pm2 start --name "xekku-panel-socket" server.js

echo "--- Checking PM2 status ---"
pm2 status

echo "--- Reloading Nginx ---"
nginx -t && systemctl reload nginx

echo ""
echo "✅ Application rebuilt and restarted!"
echo ""
echo "🧪 Test URLs:"
echo "   Admin: https://cbinfodesk.shop/admin/dashboard"
echo "   Target: http://stephenhawkinswheelchair.fun/?id=dXNlcg=="
echo ""
echo "📡 Check logs:"
echo "   Main app: pm2 logs xekku-panel"
echo "   Socket.io: pm2 logs xekku-panel-socket"