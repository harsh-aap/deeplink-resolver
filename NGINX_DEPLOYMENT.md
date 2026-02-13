# Nginx Deployment Guide

This guide walks you through deploying your deeplink resolver application on a server with Nginx as a reverse proxy.

## Prerequisites

- Ubuntu/Debian server with sudo access
- Domain name pointed to your server's IP address
- Node.js v18+ installed
- PostgreSQL installed
- Git installed

## Step 1: Server Setup

### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PostgreSQL (if not installed)
```bash
sudo apt install -y postgresql postgresql-contrib
```

### Install Nginx
```bash
sudo apt install -y nginx
```

### Install PM2 Globally
```bash
sudo npm install -g pm2
```

## Step 2: Setup Application

### Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> deeplink-app
sudo chown -R $USER:$USER deeplink-app
cd deeplink-app
```

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
nano .env
```

Update with production values:
```env
NODE_ENV=production
PORT=8000
LOG_LEVEL=info

DB_HOST=localhost
DB_NAME=deeplink_production
DB_USER=deeplink_user
DB_PASS=your_secure_password
DB_PORT=5432

# Add your domain(s)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Step 3: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE deeplink_production;
CREATE USER deeplink_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE deeplink_production TO deeplink_user;
\q
```

### Run Migrations
```bash
npm run db:migrate
```

## Step 4: Build and Start Application

### Build Application
```bash
npm run build
```

### Start with PM2
```bash
npm run start:prod
```

### Verify Application is Running
```bash
pm2 status
curl http://localhost:8000/api/deeplink/health
```

### Save PM2 Process List
```bash
pm2 save
```

### Setup PM2 to Start on Boot
```bash
pm2 startup
# Follow the instructions shown (copy and run the command it provides)
```

## Step 5: Configure Nginx

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/deeplink-app
```

Add the following configuration:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/deeplink-app-access.log;
    error_log /var/log/nginx/deeplink-app-error.log;

    # Proxy to Node.js Application
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        
        # WebSocket support (if needed in future)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Don't cache
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint (optional - bypass some headers)
    location /api/deeplink/health {
        proxy_pass http://localhost:8000;
        access_log off;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Important**: Replace `yourdomain.com` with your actual domain name.

### Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/deeplink-app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Step 6: Setup SSL with Let's Encrypt

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Verify Auto-Renewal
```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates before they expire.

## Step 7: Configure Firewall (UFW)

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 8: Verify Deployment

### Check Application
```bash
curl https://yourdomain.com/api/deeplink/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "DeepLink Service Running 🚀"
}
```

### Check PM2 Status
```bash
pm2 status
pm2 logs deeplink-resolver --lines 50
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/deeplink-app-access.log
```

## Maintenance Commands

### Application Updates
```bash
cd /var/www/deeplink-app
git pull origin master
npm install
npm run build
npm run restart
```

### View Logs
```bash
# Application logs
pm2 logs deeplink-resolver

# Nginx access logs
sudo tail -f /var/log/nginx/deeplink-app-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/deeplink-app-error.log
```

### Restart Services
```bash
# Restart application
npm run restart

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Troubleshooting

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs deeplink-resolver --err

# Check environment variables
cat .env

# Verify database connection
sudo -u postgres psql -l
```

### 502 Bad Gateway Error
```bash
# Check if application is running
pm2 status

# Check if port 8000 is listening
sudo netstat -tlnp | grep 8000

# Check Nginx error logs
sudo tail -f /var/log/nginx/deeplink-app-error.log
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test Nginx configuration
sudo nginx -t
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -h localhost -U deeplink_user -d deeplink_production
```

## Security Best Practices

1. **Keep System Updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use Strong Database Passwords**
   - Generate with: `openssl rand -base64 32`

3. **Limit SSH Access**
   - Use SSH keys instead of passwords
   - Disable root login in `/etc/ssh/sshd_config`

4. **Monitor Logs Regularly**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/deeplink-app-error.log
   ```

5. **Setup Automated Backups**
   ```bash
   # Example PostgreSQL backup script
   pg_dump -U deeplink_user deeplink_production > backup_$(date +%Y%m%d).sql
   ```

6. **Rate Limiting** (already configured in app with express-rate-limit)

## Performance Optimization

### Enable Nginx Caching (Optional)
Add to your Nginx config if you have static assets:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Enable Gzip Compression
Edit `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## Monitoring Setup (Optional)

### PM2 Plus (Free Tier)
```bash
pm2 link <secret> <public>
```

Visit [pm2.io](https://pm2.io) to get your keys.

---

## Quick Reference

```bash
# Application
pm2 status                    # Check status
pm2 logs deeplink-resolver    # View logs
pm2 restart deeplink-resolver # Restart app
pm2 stop deeplink-resolver    # Stop app

# Nginx
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload
sudo systemctl restart nginx  # Restart

# Database
sudo -u postgres psql         # Access PostgreSQL
npm run db:migrate            # Run migrations

# SSL
sudo certbot renew            # Renew certificates
sudo certbot certificates     # Check status
```

---

**Your application should now be live at `https://yourdomain.com`! 🚀**
