#!/bin/bash

# Deployment Script for Estafee Platform
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment for Estafee Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/estafee/estafee-monorepo"
BACKEND_DIR="$APP_DIR/apps/backend"
FRONTEND_DIR="$APP_DIR/apps/frontend"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if running on server
if [ ! -d "$APP_DIR" ]; then
    print_error "App directory $APP_DIR not found!"
    print_info "This script should be run on your VPS server."
    exit 1
fi

cd $APP_DIR

# Pull latest changes
print_info "Pulling latest changes from repository..."
if git pull origin main; then
    print_success "Code updated successfully"
else
    print_error "Failed to pull latest changes"
    print_info "Make sure you have git configured and the repository is accessible"
    exit 1
fi

# Install dependencies
print_info "Installing dependencies..."
if pnpm install; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build applications
print_info "Building applications..."
if pnpm build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p $APP_DIR/logs

# Restart PM2 applications
print_info "Restarting applications..."
if pm2 restart ecosystem.config.js --env production; then
    print_success "Applications restarted"
else
    print_error "Failed to restart applications"
    exit 1
fi

# Save PM2 process list
pm2 save

# Check application status
print_info "Checking application status..."
pm2 status

# Reload Nginx
print_info "Reloading Nginx..."
if sudo systemctl reload nginx; then
    print_success "Nginx reloaded"
else
    print_error "Failed to reload Nginx"
fi

# Show logs
print_success "Deployment completed successfully! 🎉"
echo ""
print_info "Quick commands:"
echo "  View logs:        pm2 logs"
echo "  Check status:     pm2 status"
echo "  Monitor:          pm2 monit"
echo "  Restart all:      pm2 restart all"
echo ""
print_info "URLs:"
echo "  Frontend:  https://estafee.id"
echo "  Backend:   https://api.estafee.id"
echo ""

# Optional: Show recent logs
print_info "Recent application logs:"
pm2 logs --lines 20 --nostream
