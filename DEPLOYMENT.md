# Deployment Guide for VPS

This guide covers deploying the AlienSpark OPS Console to a VPS (Virtual Private Server).

## Prerequisites

- A VPS with Ubuntu 20.04+ or similar Linux distribution
- SSH access to the server
- Domain name (optional, but recommended)
- SSL certificates (for HTTPS)

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Install Docker on your VPS:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. **Copy project files to your VPS:**
   ```bash
   scp -r ./alienspark-ops user@your-vps:/var/www/
   ```

3. **Configure environment variables:**
   ```bash
   cd /var/www/alienspark-ops
   cp .env.production.example .env
   nano .env  # Edit with your actual Supabase credentials
   ```

4. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

5. **Set up SSL with Nginx (optional but recommended):**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtain SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: PM2 Deployment

1. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Install PM2 globally:**
   ```bash
   sudo npm install -g pm2
   ```

3. **Copy project files:**
   ```bash
   scp -r ./alienspark-ops user@your-vps:/var/www/
   ```

4. **Configure environment variables:**
   ```bash
   cd /var/www/alienspark-ops
   cp .env.production.example .env
   nano .env
   ```

5. **Build and start:**
   ```bash
   npm ci --production
   npm run build
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

6. **Set up Nginx:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/alienspark-ops
   sudo ln -s /etc/nginx/sites-available/alienspark-ops /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Environment Variables

Required environment variables for production:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_APP_NAME=AlienSpark OPS Console
VITE_APP_URL=https://your-domain.com
VITE_ENVIRONMENT=production
```

## Post-Deployment

### Health Check
Visit `http://your-domain.com/health` to verify the application is running.

### Logs
```bash
# Docker
docker logs -f alienspark-ops-app-1

# PM2
pm2 logs alienspark-ops
```

### Updates
To update the application:
```bash
# Docker
docker-compose pull
docker-compose up -d --build

# PM2
git pull
npm ci --production
npm run build
pm2 restart alienspark-ops
```

## Security Checklist

- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set up firewall (only allow HTTP/HTTPS)
- [ ] Configure rate limiting in nginx
- [ ] Enable security headers
- [ ] Set up monitoring and alerts
- [ ] Regular backups of data
- [ ] Keep dependencies updated

## Troubleshooting

### Application won't start
Check logs: `pm2 logs` or `docker logs`

### Database connection issues
Verify environment variables are correctly set.

### SSL certificate issues
Run: `sudo certbot --nginx -d your-domain.com --force-renewal`

## Support

For issues, check the Supabase dashboard and VPS logs.
