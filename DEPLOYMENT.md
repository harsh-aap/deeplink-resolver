# Deployment Guide

## Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: v12 or higher
- **PM2**: Installed globally (`npm install -g pm2`)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd deeplinking-app
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```env
NODE_ENV=production
PORT=8000
LOG_LEVEL=info

DB_HOST=localhost
DB_NAME=your_production_db
DB_USER=your_db_user
DB_PASS=your_secure_password
DB_PORT=5432

# Optional: CORS configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### 3. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE your_production_db;
CREATE USER your_db_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_production_db TO your_db_user;
```

Run migrations:

```bash
npm run db:migrate
```

## Deployment

### Build the Application

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Start with PM2

```bash
npm run start:prod
```

This starts the application using PM2 in cluster mode with 2 instances.

### PM2 Management Commands

```bash
# Check application status
npm run status

# View logs
npm run logs

# Restart application
npm run restart

# Stop application
npm run stop

# Save PM2 process list (to restart on reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Production Checklist

- [ ] Environment variables are properly configured
- [ ] Database is created and migrations are run
- [ ] Application builds without errors (`npm run build`)
- [ ] PM2 is installed globally
- [ ] Logs directory exists and is writable
- [ ] Firewall allows traffic on the application port
- [ ] SSL/TLS certificate is configured (if using HTTPS)
- [ ] CORS origins are properly configured for production

## Nginx Reverse Proxy (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### View Application Logs

```bash
# Real-time logs
pm2 logs deeplink-resolver

# Error logs only
pm2 logs deeplink-resolver --err

# Output logs only
pm2 logs deeplink-resolver --out
```

### Monitor Resources

```bash
pm2 monit
```

## Troubleshooting

### Application Won't Start

1. Check environment variables: `cat .env`
2. Verify database connection: Test PostgreSQL credentials
3. Check PM2 logs: `pm2 logs deeplink-resolver --lines 100`
4. Ensure build succeeded: `ls -la dist/`

### Database Connection Issues

1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Test connection: `psql -h DB_HOST -U DB_USER -d DB_NAME`
3. Check firewall rules if database is on a different server

### High Memory Usage

Adjust PM2 configuration in `ecosystem.config.js`:
- Reduce `instances` count
- Lower `max_memory_restart` threshold

## Updates and Maintenance

### Deploying Updates

```bash
# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm install

# Build application
npm run build

# Run new migrations (if any)
npm run db:migrate

# Restart with zero downtime
npm run restart
```

### Database Rollback

```bash
npm run db:migrate:undo
```

## Health Check

Test the health endpoint:

```bash
curl http://localhost:8000/api/deeplink/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "DeepLink Service Running 🚀"
}
```
