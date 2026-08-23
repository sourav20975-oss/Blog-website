# How to Host a Next.js App in Production on an Ubuntu VPS

Vercel is great, but sometimes you need full control of your own box: custom binaries, no cold starts, predictable pricing. This guide walks through deploying a Next.js app on an **Ubuntu VPS** using **NGINX** (reverse proxy) and **PM2** (process manager), plus free HTTPS via Certbot.

If your app uses MongoDB, install it first using [the official Ubuntu guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/).

## Step 1: Install the Necessary Packages

SSH into your server and run:

```bash
# Update package index
apt update

# Install NGINX web server
apt install nginx -y

# Add Node.js repository
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2
```

## Step 2: Build Your Next.js App

Clone/copy your project onto the server, then inside the project directory:

```bash
npm install
npm run build
npm run start   # sanity check — should serve on :3000
```

## Step 3: Configure NGINX

Create a directory for logs:

```bash
mkdir -p /opt/nextjs/logs/
```

Create `/etc/nginx/sites-available/yourapp` with:

```nginx
server {
    server_name yourdomain.com;
    access_log /opt/nextjs/logs/access.log;
    error_log /opt/nextjs/logs/error.log error;

    # Serve pre-built static assets directly (fast!)
    location /_next/ {
        alias /home/deploy/.next/;
        expires 30d;
        access_log on;
    }

    # Everything else proxies to the Node server
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it and reload:

```bash
ln -s /etc/nginx/sites-available/yourapp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## Step 4: Configure PM2

Instead of typing flags every time, define an ecosystem file — `ecosystem.config.js` in your project root:

```js
module.exports = {
  apps: [
    {
      name: 'my-nextjs-app',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/deploy',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // ...your env vars here (secrets belong in this file, NOT in git)
      },
    },
  ],
};
```

## Step 5: Start With PM2

```bash
pm2 start ecosystem.config.js
pm2 logs my-nextjs-app   # verify it boots
pm2 startup              # make PM2 restart after server reboot
```

Your site is now live through NGINX on port 80!

## Optional: Free HTTPS With Certbot

```bash
# Install Certbot
sudo apt update
sudo apt install python3-certbot-nginx

# Issue certificate for your domain
sudo certbot --nginx -d yourdomain.com

# Verify config and reload
sudo nginx -t
sudo systemctl reload nginx

# Auto-renewal is installed by default; test it
sudo certbot renew --dry-run
```

Open `https://yourdomain.com` — padlock should be green.

## Architecture Recap

```
Browser ──HTTPS──▶ NGINX (:80/:443)
                    ├── /_next/*  → static files straight from disk
                    └── everything else → proxy_pass :3000 → PM2 ▶ Next.js
```

- **NGINX** terminates TLS and serves static assets
- **PM2** keeps Node alive, restarts on crashes and reboots

That's it — production-grade hosting on your own terms. Happy deploying!

> Source: adapted from CodeWithHarry's blog — [codewithharry.com/blogpost/hosting-a-next-js-app-in-production-on-ubuntu-vps](https://www.codewithharry.com/blogpost/hosting-a-next-js-app-in-production-on-ubuntu-vps)
