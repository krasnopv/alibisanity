# Nginx Setup Guide for Admin Subdomain

This guide explains how to set up nginx for the Sanity Studio staging environment at `admin.alibistudios.co`.

## Overview

- **Domain:** `admin.alibistudios.co`
- **Backend:** Docker container on port `3200`
- **Purpose:** Access to Sanity Studio staging environment

## Setup Steps

### Step 1: Copy Configuration File to Server

**For HTTP (before SSL):**
```bash
scp -P 2219 nginx-admin-http.conf deployer@46.62.255.49:/tmp/admin-alibi-studio.conf
```

**For HTTPS (after SSL):**
```bash
scp -P 2219 nginx-admin-https.conf deployer@46.62.255.49:/tmp/admin-alibi-studio.conf
```

**Note:** Use `-P 2219` (capital P) to specify the SSH port. Replace `46.62.255.49` with your server IP if different.

### Step 2: SSH to Server

```bash
ssh -p 2219 deployer@your-server
```

### Step 3: Install Configuration

```bash
# Copy to sites-available
sudo cp /tmp/admin-alibi-studio.conf /etc/nginx/sites-available/admin-alibi-studio

# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/admin-alibi-studio /etc/nginx/sites-enabled/

# Remove default site if it exists (optional)
sudo rm /etc/nginx/sites-enabled/default
```

### Step 4: Test Configuration

```bash
# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 5: Set Up SSL (Recommended)

**Option A: Using Certbot (Recommended)**

```bash
# Install certbot if not already installed
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d admin.alibistudios.co

# Certbot will automatically:
# - Get the certificate
# - Update the nginx config with SSL paths
# - Set up auto-renewal
```

**Option B: Manual SSL Setup**

1. First, use `nginx-admin-http.conf` and set it up
2. Get SSL certificate manually
3. Replace with `nginx-admin-https.conf` and update certificate paths

### Step 6: Verify DNS

Make sure your DNS has an A record pointing to your server IP:

```
admin.alibistudios.co  A  your-server-ip
```

### Step 7: Test Access

**Before SSL:**
- HTTP: `http://admin.alibistudios.co`

**After SSL:**
- HTTPS: `https://admin.alibistudios.co`
- HTTP should redirect to HTTPS

## Configuration Details

### Port Mapping

- **Nginx listens on:** Port 80 (HTTP) and 443 (HTTPS)
- **Proxies to:** `localhost:3200` (Docker container)
- **Container port:** 3000 (internal)

### Key Settings

- **Client body size:** 50M (for Sanity Studio file uploads)
- **Timeouts:** 120s (longer for large operations)
- **Static file caching:** 7 days
- **Gzip compression:** Enabled

### Security Headers

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: max-age=31536000 (HTTPS only)

## Troubleshooting

### Nginx won't start

```bash
# Check configuration syntax
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Can't access the site

1. **Check DNS:**
   ```bash
   dig admin.alibistudios.co
   # or
   nslookup admin.alibistudios.co
   ```

2. **Check if container is running:**
   ```bash
   docker ps | grep alibi-studio-staging
   curl http://localhost:3200
   ```

3. **Check nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

4. **Check firewall:**
   ```bash
   sudo ufw status
   # Make sure ports 80 and 443 are open
   ```

### SSL certificate issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check auto-renewal
sudo systemctl status certbot.timer
```

### Container not responding

```bash
# Check container logs
docker logs alibi-studio-staging

# Restart container
cd /opt/alibi-studio
docker-compose -f docker-compose.staging.yml restart
```

## Maintenance

### Update Configuration

1. Edit the config file:
   ```bash
   sudo nano /etc/nginx/sites-available/admin-alibi-studio
   ```

2. Test and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Renew SSL Certificate

Certbot should auto-renew, but you can manually renew:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### View Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/admin-alibi-studio-access.log

# Error logs
sudo tail -f /var/log/nginx/admin-alibi-studio-error.log
```

## Quick Reference

```bash
# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/admin-alibi-studio-error.log
```

## Security Considerations

1. **Access Control:** Consider adding IP whitelist or basic auth for staging
2. **Firewall:** Ensure only necessary ports are open
3. **SSL:** Always use HTTPS in production
4. **Updates:** Keep nginx and certificates updated

## Adding Basic Auth (Optional)

If you want to password-protect the staging Studio:

```nginx
# Add to location / block
auth_basic "Restricted Access";
auth_basic_user_file /etc/nginx/.htpasswd;
```

Create password file:
```bash
sudo apt-get install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```
