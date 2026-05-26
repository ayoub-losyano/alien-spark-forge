#!/bin/bash
# Deployment script for VPS

set -e

echo "======================================"
echo "AlienSpark OPS Console - Deployment"
echo "======================================"

# Configuration
APP_NAME="alienspark-ops"
APP_DIR="/var/www/alienspark-ops"
REPO_URL="https://github.com/your-org/alienspark-ops.git"
BRANCH="main"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root or with sudo"
    exit 1
fi

# Navigate to app directory
cd "$APP_DIR" || { error "Directory $APP_DIR does not exist"; exit 1; }

# Pull latest changes
log "Pulling latest changes from $BRANCH..."
git pull origin "$BRANCH"

# Install dependencies
log "Installing dependencies..."
npm ci --production

# Build application
log "Building application..."
npm run build

# Restart PM2
log "Restarting PM2..."
pm2 restart "$APP_NAME" || pm2 start ecosystem.config.js --env production

# Reload nginx
log "Reloading nginx..."
nginx -s reload

# Cleanup
log "Cleaning up..."
pm2 flush

log "======================================"
log "Deployment completed successfully!"
log "======================================"
