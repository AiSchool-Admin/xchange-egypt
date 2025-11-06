# Xchange Deployment Guide

This guide covers deploying the Xchange platform to various hosting providers.

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Redis configured
- [ ] Storage (R2) configured
- [ ] Domain name ready (optional)
- [ ] SSL certificate (handled by hosting provider)

---

## 🚀 Deployment Options

### Option 1: Railway.app (Recommended for MVP)

**Cost**: ~$5-10/month

#### Backend Deployment

1. **Create Railway account**: https://railway.app

2. **Create new project**:
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Initialize project
   cd backend
   railway init
   ```

3. **Add PostgreSQL**:
   - In Railway dashboard: New → Database → PostgreSQL
   - Railway will auto-set `DATABASE_URL`

4. **Add Redis**:
   - In Railway dashboard: New → Database → Redis
   - Railway will auto-set `REDIS_URL`

5. **Set environment variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   # ... (see .env.example)
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

7. **Run migrations**:
   ```bash
   railway run pnpm prisma migrate deploy
   ```

8. **Get public URL**:
   - Railway dashboard → Settings → Generate Domain

---

#### Frontend Deployment (Vercel)

1. **Create Vercel account**: https://vercel.com

2. **Import repository**:
   - Vercel Dashboard → Import Project
   - Select your GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: Next.js

3. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_APP_NAME=Xchange
   NEXT_PUBLIC_DEFAULT_LOCALE=ar
   ```

4. **Deploy**:
   - Vercel will auto-deploy on every push to main branch

5. **Custom domain** (optional):
   - Vercel Dashboard → Settings → Domains
   - Add: www.xchange.eg

---

### Option 2: Render.com (Alternative)

**Cost**: Free tier available, then $7/month

1. **Create Render account**: https://render.com

2. **Create Web Service** (Backend):
   - New → Web Service
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `pnpm start`

3. **Add PostgreSQL**:
   - Dashboard → New → PostgreSQL
   - Copy `DATABASE_URL`

4. **Set environment variables** in Render dashboard

5. **Deploy**

---

### Option 3: DigitalOcean App Platform

**Cost**: $12/month

1. **Create DigitalOcean account**

2. **Create App**:
   - Apps → Create App
   - Connect GitHub
   - Select repository

3. **Configure services**:
   - Backend: Node.js
   - Database: Managed PostgreSQL ($15/month)
   - Redis: Managed Redis ($15/month)

4. **Set environment variables**

5. **Deploy**

---

### Option 4: Self-Hosted (VPS)

**Cost**: ~$5-20/month (VPS)

#### Prerequisites
- VPS with Ubuntu 22.04
- Domain name (optional)

#### Steps

1. **Connect to VPS**:
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install dependencies**:
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs

   # Install pnpm
   npm install -g pnpm

   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib

   # Install Redis
   apt install -y redis-server

   # Install Nginx
   apt install -y nginx

   # Install PM2 (process manager)
   npm install -g pm2
   ```

3. **Setup database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE xchange;
   CREATE USER xchange_user WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE xchange TO xchange_user;
   \q
   ```

4. **Clone repository**:
   ```bash
   cd /var/www
   git clone https://github.com/AiSchool-Admin/xchange-egypt.git
   cd xchange-egypt/backend
   ```

5. **Setup backend**:
   ```bash
   # Install dependencies
   pnpm install

   # Create .env
   cp .env.example .env
   nano .env  # Edit with your values

   # Run migrations
   pnpm prisma migrate deploy

   # Build
   pnpm build

   # Start with PM2
   pm2 start dist/app.js --name xchange-api
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx** (reverse proxy):
   ```nginx
   # /etc/nginx/sites-available/xchange
   server {
       listen 80;
       server_name api.xchange.eg;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/xchange /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Setup SSL** (with Let's Encrypt):
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d api.xchange.eg
   ```

---

## 🗄️ Database Migrations

### Production Migrations

```bash
# On Railway
railway run pnpm prisma migrate deploy

# On self-hosted
cd /var/www/xchange-egypt/backend
pnpm prisma migrate deploy
```

### Rollback (if needed)

```bash
# Prisma doesn't support automatic rollback
# You need to create a new migration that reverts changes

pnpm prisma migrate dev --name rollback_feature_name
```

---

## 📊 Monitoring & Logging

### Option 1: PM2 Logs (Self-hosted)

```bash
# View logs
pm2 logs xchange-api

# Monitor
pm2 monit
```

### Option 2: Railway Logs

- Railway Dashboard → Deployments → Logs

### Option 3: Sentry (Error Tracking)

```bash
# Install
pnpm add @sentry/node

# Configure in app.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

---

## 🔄 CI/CD Pipeline

Automated deployment via GitHub Actions (already configured in `.github/workflows/ci.yml`).

**Triggers**:
- Push to `main` branch → Deploy to production
- Push to `develop` branch → Deploy to staging
- Pull requests → Run tests only

---

## 🧪 Environment-Specific Configurations

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/xchange_dev
```

### Staging
```env
NODE_ENV=production
DATABASE_URL=postgresql://staging-db-url
```

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url
```

---

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] Database backups enabled
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured
- [ ] Firewall rules set
- [ ] Regular security updates
- [ ] Secrets not in code
- [ ] CORS properly configured

---

## 📈 Scaling

### Horizontal Scaling
- Railway: Auto-scaling available on Pro plan
- Self-hosted: Use load balancer (Nginx) with multiple instances

### Database Scaling
- Connection pooling (PgBouncer)
- Read replicas
- Managed database services

### Caching
- Redis for session & data caching
- CDN for static assets (Cloudflare)

---

## 🆘 Troubleshooting

### Server not starting

```bash
# Check logs
railway logs  # Railway
pm2 logs      # Self-hosted

# Check environment variables
railway variables  # Railway
```

### Database connection issues

```bash
# Test connection
railway run pnpm prisma db push

# Check DATABASE_URL format
postgresql://user:password@host:5432/database
```

### Redis connection issues

```bash
# Test Redis
redis-cli ping

# Check REDIS_URL
redis://host:6379
```

---

## 📝 Maintenance

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U xchange_user xchange > backup.sql

# Restore
psql -U xchange_user xchange < backup.sql
```

### Update Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update all
pnpm update

# Update specific package
pnpm update package-name
```

---

**For support, contact: devops@xchange.eg (placeholder)**
