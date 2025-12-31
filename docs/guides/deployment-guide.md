# Deployment Guide

This guide covers deploying the QR Project V3 to production, including environment configuration, build process, and server setup.

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Supabase production database is set up
- [ ] GHL webhook URLs are updated to production
- [ ] SSL/TLS certificates are configured
- [ ] Database tables and indexes are optimized
- [ ] Application has been tested in staging
- [ ] Backup strategy is in place

---

## Production Environment Setup

### Server Requirements

**Minimum Specifications:**
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 20 GB SSD
- **OS:** Ubuntu 20.04 LTS or later
- **Node.js:** 18.x or later
- **npm:** 9.x or later

**Recommended Specifications:**
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 40 GB SSD

### Install Node.js

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

### Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Navigate to web root
cd /var/www

# Clone repository
git clone <repository-url> qr-project
cd qr-project

# Checkout production branch (if using)
git checkout main
```

### 2. Install Dependencies

```bash
# Install production dependencies
npm ci --production=false

# This installs all dependencies including devDependencies
# needed for the build process
```

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
nano .env.local
```

Add production environment variables:

```bash
# ============================================
# Production API URLs
# ============================================
NEXT_PUBLIC_API_BASE_URL=https://qr.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://qr.yourdomain.com

# ============================================
# Supabase Production Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# ============================================
# GoHighLevel Production Configuration
# ============================================
NEXT_PUBLIC_GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_ACCESS_TOKEN=your-production-ghl-token
NEXT_PUBLIC_GHL_LOCATION_ID=your-ghl-location-id

# ============================================
# Node Environment
# ============================================
NODE_ENV=production
```

**Security:** Set proper file permissions:

```bash
chmod 600 .env.local
```

### 4. Build Application

```bash
# Build Next.js application
npm run build
```

**Expected Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB         XXX kB
├ ○ /admin-portal                        XXX kB         XXX kB
└ ○ /auth                                XXX kB         XXX kB
...
```

### 5. Start Application with PM2

```bash
# Start application
pm2 start npm --name "qr-project" -- start

# Or directly with Node.js
pm2 start server.prod.js --name "qr-project"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the instructions provided
```

### 6. Verify Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs qr-project

# Monitor application
pm2 monit
```

Application should be running on port **4001**.

---

## Nginx Configuration

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Nginx as Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/qr-project
```

Add configuration:

```nginx
# Upstream for Node.js application
upstream qr_app {
    server localhost:4001;
    keepalive 64;
}

# HTTP Server (redirect to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name qr.yourdomain.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name qr.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/qr.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qr.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size
    client_max_body_size 10M;

    # Proxy settings
    location / {
        proxy_pass http://qr_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.IO configuration
    location /socket.io/ {
        proxy_pass http://qr_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://qr_app;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Public files
    location /public/ {
        proxy_pass http://qr_app;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/qr-project /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL/TLS Configuration

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain SSL Certificate

```bash
# Get certificate for your domain
sudo certbot --nginx -d qr.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### Auto-Renewal

Certbot sets up auto-renewal automatically. Verify:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

## Database Setup (Production)

### 1. Supabase Production Project

1. Create a new Supabase project for production
2. Run all table creation SQL (see [Getting Started - Database Setup](/docs/guides/getting-started.md#database-setup))
3. Set up Row Level Security (RLS) policies

### 2. Enable RLS (Row Level Security)

```sql
-- Enable RLS on tables
ALTER TABLE ghl_qr_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_qr_fields ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
-- (Your API routes use service role key)
```

### 3. Create Indexes for Performance

```sql
-- Indexes for ghl_qr_orders
CREATE INDEX idx_orders_location_id ON ghl_qr_orders(location_id);
CREATE INDEX idx_orders_contact_id ON ghl_qr_orders(contact_id);
CREATE INDEX idx_orders_event_id ON ghl_qr_orders(event_id);
CREATE INDEX idx_orders_date_added ON ghl_qr_orders(date_added DESC);

-- Indexes for ghl_qr_tickets
CREATE INDEX idx_tickets_order_id ON ghl_qr_tickets(order_id);
CREATE INDEX idx_tickets_status ON ghl_qr_tickets(status);

-- Indexes for ghl_qr_users
CREATE INDEX idx_users_email ON ghl_qr_users(email);
```

### 4. Set Up Backups

Enable Supabase automatic backups:
1. Go to **Database** → **Backups** in Supabase dashboard
2. Configure backup schedule (daily recommended)
3. Test restore process

---

## GHL Webhook Configuration

### Update Webhook URL

1. Log in to GoHighLevel
2. Navigate to **Settings** → **Integrations** → **Webhooks**
3. Update webhook URL to production:
   ```
   https://qr.yourdomain.com/api/ghl/webhook-qr
   ```
4. Test webhook with a test order

### Verify Webhook Reception

```bash
# Monitor logs for webhook events
pm2 logs qr-project --lines 100

# Should see:
# "Webhook received: [order_id]"
# "QR code generated and sent to GHL"
```

---

## Monitoring and Logging

### PM2 Monitoring

```bash
# View real-time logs
pm2 logs qr-project

# Monitor CPU/Memory usage
pm2 monit

# View detailed info
pm2 info qr-project

# Restart application
pm2 restart qr-project

# Stop application
pm2 stop qr-project
```

### Application Logs

Logs are written to `/logs` directory (via Winston):

```bash
# View sync logs
tail -f logs/ghl-order-sync/*.log

# View error logs
tail -f logs/error.log
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Performance Optimization

### 1. Enable Gzip Compression (Nginx)

Add to Nginx configuration:

```nginx
# Inside http block of /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;
```

### 2. Configure Cache Headers

Next.js automatically handles static file caching. Nginx configuration above includes caching for `_next/static/`.

### 3. Database Query Optimization

- Use indexes (already created above)
- Limit query results with pagination
- Use connection pooling (Supabase handles this)

### 4. Memory Allocation

Increase Node.js memory if needed:

```bash
# Edit PM2 ecosystem file
pm2 ecosystem

# Or start with increased memory
NODE_OPTIONS='--max-old-space-size=4096' pm2 start server.prod.js
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Secure Environment Variables

```bash
# Ensure .env.local has restricted permissions
chmod 600 .env.local

# Never commit .env.local to Git
# (Already in .gitignore)
```

### 3. Keep System Updated

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm update

# Rebuild after updates
npm run build
pm2 restart qr-project
```

### 4. Rate Limiting

Consider implementing rate limiting for API routes:

```typescript
// middleware.ts or API route
// Implement rate limiting logic
```

---

## Backup Strategy

### Application Backup

```bash
# Backup application code
tar -czf qr-project-backup-$(date +%Y%m%d).tar.gz /var/www/qr-project

# Backup to remote storage (example)
scp qr-project-backup-*.tar.gz user@backup-server:/backups/
```

### Database Backup

Supabase handles automatic backups. For manual backup:

1. Go to Supabase dashboard → **Database** → **Backups**
2. Click **Download backup**
3. Store securely offsite

### Environment Variables Backup

```bash
# Backup .env.local (securely!)
cp .env.local .env.backup
# Store in secure location (NOT in Git)
```

---

## Troubleshooting Production Issues

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs qr-project --err

# Common issues:
# - Port 4001 already in use
# - Missing environment variables
# - Database connection failed

# Restart application
pm2 restart qr-project
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart application
pm2 restart qr-project

# Increase Node.js memory limit
NODE_OPTIONS='--max-old-space-size=8192' pm2 restart qr-project
```

### Socket.IO Connection Issues

- Verify Nginx Socket.IO configuration
- Check firewall allows WebSocket connections
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct

### SSL Certificate Errors

```bash
# Renew certificate manually
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop current application
pm2 stop qr-project

# 2. Revert to previous Git commit
git log  # Find previous commit hash
git checkout <previous-commit-hash>

# 3. Reinstall dependencies
npm ci

# 4. Rebuild
npm run build

# 5. Restart
pm2 restart qr-project
```

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application is accessible via HTTPS
- [ ] SSL certificate is valid
- [ ] Login/logout works
- [ ] Admin portal loads
- [ ] SuperAdmin portal loads
- [ ] GHL webhooks are received
- [ ] QR codes are generated
- [ ] Data sync works
- [ ] Socket.IO connects
- [ ] Logs are being written
- [ ] PM2 shows application running
- [ ] Database queries work
- [ ] All API endpoints respond
- [ ] No console errors in browser

---

## Continuous Deployment (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/qr-project
            git pull origin main
            npm ci
            npm run build
            pm2 restart qr-project
```

---

## Monitoring Services (Recommended)

Consider implementing:
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry
- **Performance Monitoring:** New Relic, Datadog
- **Log Aggregation:** Logtail, Papertrail

---

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly:** Check logs for errors
- **Monthly:** Update dependencies (`npm update`)
- **Quarterly:** Security audit (`npm audit`)
- **Yearly:** Review and optimize database

---

**Production Deployment Complete!**

Your QR Project V3 application is now running in production with proper security, monitoring, and backup strategies in place.

---

**Last Updated:** December 31, 2025
