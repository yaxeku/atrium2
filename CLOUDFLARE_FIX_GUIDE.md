# Cloudflare Error 526 Fix Guide

## 🚨 Problem: Error 526 - Invalid SSL Certificate

**What's happening:**
- Cloudflare is trying to connect to your server with SSL
- Connected domain `stephenhawkinswheelchair.fun` doesn't have SSL certificate
- Only main domain `cbinfodesk.shop` has SSL certificate

## 🔧 Solution Steps

### 1. Run the Fix Script
```bash
chmod +x fix_cloudflare_ssl.sh
sudo ./fix_cloudflare_ssl.sh
```

### 2. Configure Cloudflare Settings

**For stephenhawkinswheelchair.fun:**
1. **Login to Cloudflare Dashboard**
2. **Select Domain:** `stephenhawkinswheelchair.fun`
3. **Go to:** SSL/TLS → Overview
4. **Set SSL Mode:** `Flexible`
5. **Save and Wait:** 2-3 minutes for propagation

### 3. Verify DNS Settings

**For stephenhawkinswheelchair.fun:**
- **Type:** A Record
- **Name:** @ (or stephenhawkinswheelchair)
- **Value:** Your server IP
- **Proxy Status:** ✅ Proxied (orange cloud)

**Optional www subdomain:**
- **Type:** CNAME
- **Name:** www
- **Value:** stephenhawkinswheelchair.fun
- **Proxy Status:** ✅ Proxied (orange cloud)

## 🎯 How It Works

### Main Domain (cbinfodesk.shop)
- **Protocol:** HTTPS ✅
- **SSL Certificate:** Let's Encrypt ✅
- **Access:** Admin/Login only
- **Cloudflare Mode:** Full (Strict) ✅

### Connected Domains (stephenhawkinswheelchair.fun)
- **Protocol:** HTTP ✅
- **SSL Certificate:** None (not needed)
- **Access:** Target interfaces only
- **Cloudflare Mode:** Flexible ✅

## 🌐 SSL Modes Explained

### Flexible (For Connected Domains)
```
Visitor → [HTTPS] → Cloudflare → [HTTP] → Your Server
```
- ✅ Visitor sees HTTPS (secure)
- ✅ No SSL certificate needed on server
- ✅ Perfect for target domains

### Full (For Main Domain)
```
Visitor → [HTTPS] → Cloudflare → [HTTPS] → Your Server
```
- ✅ End-to-end encryption
- ✅ Requires SSL certificate on server
- ✅ Perfect for admin domain

## 🧪 Testing

### Test Admin Access (Should work with HTTPS)
```bash
curl -I https://cbinfodesk.shop/admin/login
# Should return: 200 OK
```

### Test Target Interface (Should work with HTTP)
```bash
curl -I "http://stephenhawkinswheelchair.fun/?id=dXNlcg=="
# Should return: 200 OK
```

### Test Socket.io (Should work)
```bash
curl -I http://stephenhawkinswheelchair.fun/socket.io/
# Should return: 200 OK
```

## 🔍 Troubleshooting

### If Error 526 Persists:
1. **Wait longer:** Cloudflare changes can take up to 24 hours
2. **Check SSL mode:** Ensure it's set to "Flexible"
3. **Purge cache:** Cloudflare Dashboard → Caching → Purge Everything
4. **Check logs:** `sudo tail -f /var/log/nginx/error.log`

### If Target Interface Doesn't Load:
1. **Check Nginx:** `sudo nginx -t && sudo systemctl status nginx`
2. **Check PM2:** `pm2 status && pm2 logs`
3. **Check URL:** Ensure `?id=` parameter is included

### If Socket.io Doesn't Connect:
1. **Check port:** `sudo netstat -tlnp | grep 3001`
2. **Check PM2:** `pm2 logs xekku-panel-socket`
3. **Test direct:** `curl http://YOUR-SERVER-IP:3001/socket.io/`

## 🎯 Expected Results

After fixing:
- ✅ `https://cbinfodesk.shop/admin/login` → Admin access
- ✅ `http://stephenhawkinswheelchair.fun/?id=dXNlcg==` → Target interface
- ✅ Real-time Socket.io connection
- ✅ No more Error 526

## 📞 Quick Fix Commands

```bash
# Fix Nginx configuration
sudo ./fix_cloudflare_ssl.sh

# Restart services
sudo systemctl reload nginx
pm2 restart all

# Check status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```