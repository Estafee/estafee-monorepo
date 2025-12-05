# Deployment Guide - Ubuntu VPS

This guide walks you through deploying the Lending Platform monorepo to an Ubuntu VPS with the domain `estafee.id`.

## Prerequisites

-   Ubuntu VPS (20.04 LTS or newer)
-   Domain: `estafee.id` pointing to your VPS IP
-   SSH access to your VPS
-   Sudo privileges

## Architecture Overview

-   **Frontend**: Next.js app running on port 3000 → `estafee.id`
-   **Backend**: NestJS API running on port 3001 → `api.estafee.id`
-   **Nginx**: Reverse proxy handling SSL/TLS
-   **PM2**: Process manager keeping apps running
-   **Let's Encrypt**: Free SSL certificates

---

## Step 1: Initial VPS Setup

### 1.1 Connect to your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### 1.2 Update system

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Node.js (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x.x
```

### 1.4 Install pnpm

```bash
sudo npm install -g pnpm
pnpm --version
```

### 1.5 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 --version
```

### 1.6 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.7 Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2: DNS Configuration

Configure your DNS records to point to your VPS IP address:

```
A Record: estafee.id → your-vps-ip
A Record: api.estafee.id → your-vps-ip
A Record: www.estafee.id → your-vps-ip (optional)
```

Wait 5-10 minutes for DNS propagation. Verify with:

```bash
dig estafee.id
dig api.estafee.id
```

---

## Step 3: Deploy Application Code

### 3.1 Create application directory

```bash
sudo mkdir -p /var/www/estafee
sudo chown -R $USER:$USER /var/www/estafee
cd /var/www/estafee
```

### 3.2 Clone your repository

```bash
# Clone the repository
git clone https://github.com/Estafee/estafee-monorepo.git
cd estafee-monorepo

# Or upload files via SCP from your local machine:
# scp -r /Users/alvin/Documents/projects/startup-pwm/* user@your-vps-ip:/var/www/estafee/estafee-monorepo/
```

### 3.3 Install dependencies

```bash
cd /var/www/estafee/estafee-monorepo
pnpm install
```

### 3.4 Create environment files

**Frontend environment** (`apps/frontend/.env.production`):

```bash
cat > apps/frontend/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.estafee.id
NODE_ENV=production
EOF
```

**Backend environment** (`apps/backend/.env.production`):

```bash
cat > apps/backend/.env.production << 'EOF'
NODE_ENV=production
PORT=3001

# Database Configuration (PostgreSQL with Prisma)
DATABASE_URL="postgresql://estafee_user:your_secure_password@localhost:5432/estafee_db"

# JWT Secret (generate with: openssl rand -base64 48)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL for CORS
FRONTEND_URL=https://estafee.id
EOF
```

**Important:** Replace `your_secure_password` and `your-super-secret-jwt-key-change-this` with actual secure values.

### 3.5 Setup PostgreSQL Database

**Install PostgreSQL:**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Create database and user:**

```bash
# Switch to postgres user
sudo -u postgres psql

# In psql prompt, run:
CREATE DATABASE estafee_db;
CREATE USER estafee_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE estafee_db TO estafee_user;

# For PostgreSQL 15+, grant schema permissions
\c estafee_db
GRANT ALL ON SCHEMA public TO estafee_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO estafee_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO estafee_user;

# Exit psql
\q
```

### 3.6 Generate Prisma Client and Run Migrations

```bash
cd /var/www/estafee/estafee-monorepo

# Generate Prisma Client
cd apps/backend
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed database if you have seed data
# npx prisma db seed

# Go back to root
cd ../..
```

### 3.7 Build applications

```bash
pnpm build
```

---

## Step 4: Configure PM2

### 4.1 Start applications with PM2

```bash
cd /var/www/estafee/estafee-monorepo

# Create logs directory
mkdir -p logs

# Use the ecosystem config (recommended)
pm2 start ecosystem.config.js --env production

# Or start manually:
# Backend:
pm2 start apps/backend/dist/main.js --name "estafee-backend" --cwd /var/www/estafee/estafee-monorepo

# Frontend:
cd apps/frontend && pm2 start "node_modules/.bin/next start" --name "estafee-frontend"
```

### 4.2 Configure PM2 startup

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Follow the command it outputs (usually something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u youruser --hp /home/youruser
```

### 4.3 Check status

```bash
pm2 status
pm2 logs
```

---

## Step 5: Configure Nginx

### 5.1 Create Nginx configuration

```bash
sudo nano /etc/nginx/sites-available/estafee.id
```

Paste the configuration (see `nginx.conf` file in this repo).

### 5.2 Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/estafee.id /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

### 5.3 Test Nginx configuration

```bash
sudo nginx -t
```

### 5.4 Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## Step 6: Setup SSL with Let's Encrypt

### 6.1 Obtain SSL certificates

```bash
sudo certbot --nginx -d estafee.id -d www.estafee.id -d api.estafee.id
```

Follow the prompts:

-   Enter your email
-   Agree to terms
-   Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 6.2 Test auto-renewal

```bash
sudo certbot renew --dry-run
```

Certbot automatically sets up a cron job to renew certificates before they expire.

---

## Step 7: Firewall Configuration

### 7.1 Configure UFW (Ubuntu Firewall)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Step 8: Verify Deployment

### 8.1 Check applications

```bash
pm2 status
pm2 logs estafee-backend
pm2 logs estafee-frontend
```

### 8.2 Test URLs

-   Frontend: https://estafee.id
-   Backend API: https://api.estafee.id
-   Backend health: https://api.estafee.id (should show "Hello World!" or your API response)

### 8.3 Check SSL

```bash
curl -I https://estafee.id
curl -I https://api.estafee.id
```

---

## Ongoing Maintenance

### Update Application

```bash
cd /var/www/estafee/estafee-monorepo

# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Generate Prisma Client (if schema changed)
cd apps/backend
npx prisma generate

# Run database migrations (if schema changed)
npx prisma db push

# Go back to root and rebuild
cd ../..
pnpm build

# Restart apps
pm2 restart estafee-backend
pm2 restart estafee-frontend

# Or restart all
pm2 restart all
```

### Monitor Applications

```bash
# View logs
pm2 logs

# View specific app logs
pm2 logs estafee-backend
pm2 logs estafee-frontend

# Monitor resources
pm2 monit
```

### Backup Important Files

```bash
# Create backup directory
mkdir -p ~/backup

# Backup environment files
sudo cp /var/www/estafee/estafee-monorepo/apps/backend/.env.production ~/backup/
sudo cp /var/www/estafee/estafee-monorepo/apps/frontend/.env.production ~/backup/

# Backup Nginx config
sudo cp /etc/nginx/sites-available/estafee.id ~/backup/

# Backup PM2 config
cp /var/www/estafee/estafee-monorepo/ecosystem.config.js ~/backup/
```

---

## Troubleshooting

### Frontend not loading

```bash
# Check if frontend is running
pm2 logs estafee-frontend

# Check Next.js standalone mode
ls -la apps/frontend/.next/standalone/

# Restart frontend
pm2 restart estafee-frontend
```

### Backend API not responding

```bash
# Check backend logs
pm2 logs estafee-backend

# Check port
sudo netstat -tulpn | grep 3001

# Restart backend
pm2 restart estafee-backend
```

### SSL certificate issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Port already in use

```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process if needed
sudo kill -9 <PID>
```

### Nginx errors

```bash
# Check Nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Performance Optimization (Optional)

### Enable Gzip compression in Nginx

Already included in the nginx.conf file.

### Enable Nginx caching

```bash
sudo nano /etc/nginx/sites-available/estafee.id
```

Add proxy caching directives for static assets.

### Use CDN

Consider using Cloudflare for:

-   DDoS protection
-   Global CDN
-   Free SSL
-   Improved performance

---

## Security Best Practices

1. **Keep system updated**

    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2. **Use strong passwords and SSH keys**

    ```bash
    # Disable password authentication (SSH keys only)
    sudo nano /etc/ssh/sshd_config
    # Set: PasswordAuthentication no
    sudo systemctl restart sshd
    ```

3. **Regular backups**

    - Database backups (if using)
    - Environment files
    - Application code

4. **Monitor logs**

    ```bash
    pm2 logs
    sudo tail -f /var/log/nginx/access.log
    sudo tail -f /var/log/nginx/error.log
    ```

5. **Setup monitoring** (Optional)
    - PM2 Plus (paid)
    - Uptime Robot (free)
    - New Relic (paid)

---

## Next Steps

1. **Database Setup**: ✅ PostgreSQL configured with Prisma
2. **Database Migrations**: Run `npx prisma studio` to view/edit data in browser
3. **Email Service**: Configure email sending (SendGrid, AWS SES, etc.)
4. **File Storage**: Setup S3 or similar for user uploads (item images, avatars)
5. **CI/CD**: Automate deployments with GitHub Actions
6. **Monitoring**: Setup error tracking (Sentry) and analytics
7. **Scaling**: Consider load balancing for high traffic

---

## Database Management

### View and Edit Data (Prisma Studio)

```bash
cd /var/www/estafee/estafee-monorepo/apps/backend

# Start Prisma Studio (opens at localhost:5555)
npx prisma studio

# Access via SSH tunnel from your local machine:
# ssh -L 5555:localhost:5555 root@your-vps-ip
# Then open http://localhost:5555 in your browser
```

### Backup Database

```bash
# Create backup
pg_dump -U estafee_user -d estafee_db -h localhost -F c -f ~/estafee_backup_$(date +%Y%m%d).dump

# Restore backup
pg_restore -U estafee_user -d estafee_db -h localhost -c ~/estafee_backup_YYYYMMDD.dump
```

### Reset Database (Development only!)

```bash
cd /var/www/estafee/estafee-monorepo/apps/backend

# Reset database and reapply migrations
npx prisma migrate reset

# Or just push schema changes
npx prisma db push
```

---

## Quick Deployment Script

Use the provided `deploy.sh` script for automated deployments:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS: `dig estafee.id`
4. Test SSL: `curl -I https://estafee.id`
5. Check firewall: `sudo ufw status`

---

## Resources

-   [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
-   [Nginx Documentation](https://nginx.org/en/docs/)
-   [Let's Encrypt](https://letsencrypt.org/)
-   [Next.js Deployment](https://nextjs.org/docs/deployment)
-   [NestJS Deployment](https://docs.nestjs.com/deployment)
