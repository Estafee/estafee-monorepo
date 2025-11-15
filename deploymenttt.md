# Quick Deployment Checklist

Use this checklist to deploy your application to your Ubuntu VPS with domain `estafee.id`.

## Pre-deployment

-   [ ] VPS is running Ubuntu 20.04 LTS or newer
-   [ ] You have SSH access to the VPS
-   [ ] Domain `estafee.id` DNS is configured:
    -   [ ] A record: `estafee.id` → VPS IP
    -   [ ] A record: `api.estafee.id` → VPS IP
-   [ ] Git repository is accessible (or files ready to upload)

## Initial VPS Setup (One-time)

-   [ ] Update system: `sudo apt update && sudo apt upgrade -y`
-   [ ] Install Node.js 20: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`
-   [ ] Install pnpm: `sudo npm install -g pnpm`
-   [ ] Install PM2: `sudo npm install -g pm2`
-   [ ] Install Nginx: `sudo apt install -y nginx`
-   [ ] Install Certbot: `sudo apt install -y certbot python3-certbot-nginx`

## Deploy Application

-   [ ] Create app directory: `sudo mkdir -p /var/www/estafee && sudo chown -R $USER:$USER /var/www/estafee`
-   [ ] Upload/clone your code to `/var/www/estafee`
-   [ ] Create environment files:
    -   [ ] `apps/frontend/.env.production` (use `.env.example` as template)
    -   [ ] `apps/backend/.env.production` (use `.env.example` as template)
-   [ ] Install dependencies: `cd /var/www/estafee && pnpm install`
-   [ ] Build: `pnpm build`
-   [ ] Create logs directory: `mkdir -p /var/www/estafee/logs`

## Configure PM2

-   [ ] Update `ecosystem.config.js` paths if needed
-   [ ] Start apps: `pm2 start ecosystem.config.js --env production`
-   [ ] Save PM2 config: `pm2 save`
-   [ ] Setup PM2 startup: `pm2 startup` (follow the command it outputs)
-   [ ] Check status: `pm2 status`

## Configure Nginx

-   [ ] Copy nginx.conf to server: `sudo cp nginx.conf /etc/nginx/sites-available/estafee.id`
-   [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/estafee.id /etc/nginx/sites-enabled/`
-   [ ] Remove default: `sudo rm /etc/nginx/sites-enabled/default`
-   [ ] Test config: `sudo nginx -t`
-   [ ] Reload Nginx: `sudo systemctl reload nginx`

## Setup SSL

-   [ ] Get SSL certificate: `sudo certbot --nginx -d estafee.id -d www.estafee.id -d api.estafee.id`
-   [ ] Follow prompts (enter email, agree to terms, redirect HTTP → HTTPS)
-   [ ] Test auto-renewal: `sudo certbot renew --dry-run`

## Configure Firewall

-   [ ] Allow OpenSSH: `sudo ufw allow OpenSSH`
-   [ ] Allow Nginx: `sudo ufw allow 'Nginx Full'`
-   [ ] Enable firewall: `sudo ufw enable`
-   [ ] Check status: `sudo ufw status`

## Verify Deployment

-   [ ] Check PM2: `pm2 status`
-   [ ] Test frontend: Visit `https://estafee.id`
-   [ ] Test backend: Visit `https://api.estafee.id`
-   [ ] Check SSL: Both should show 🔒 in browser
-   [ ] Check logs: `pm2 logs`

## Future Deployments

Just run:

```bash
cd /var/www/estafee
./deploy.sh
```

Or manually:

```bash
cd /var/www/estafee
git pull
pnpm install
pnpm build
pm2 restart all
```

## Troubleshooting

If something goes wrong:

1. **Check PM2 logs**: `pm2 logs`
2. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Check app status**: `pm2 status`
4. **Restart apps**: `pm2 restart all`
5. **Check ports**: `sudo netstat -tulpn | grep -E '3000|3001'`
6. **Verify DNS**: `dig estafee.id` and `dig api.estafee.id`

## Important Notes

-   Backend runs on port 3001
-   Frontend runs on port 3000
-   Nginx proxies external requests to these ports
-   SSL certificates auto-renew (check with `sudo certbot certificates`)
-   PM2 auto-restarts apps on crash
-   Update `/var/www/estafee/ecosystem.config.js` if you change paths

## Need Help?

See `DEPLOYMENT.md` for detailed instructions.
