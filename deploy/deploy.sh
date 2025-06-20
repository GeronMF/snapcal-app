#!/bin/bash

# SnapCal Production Deployment Script

set -e

echo "🚀 Starting SnapCal deployment..."

# Configuration
PROJECT_DIR="/var/www/snapcal"
BACKUP_DIR="/var/backups/snapcal"
LOG_FILE="/var/log/snapcal-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Create directories if they don't exist
log "Creating necessary directories..."
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p /var/log
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Backup current version
if [ -d "backend" ]; then
    log "Creating backup of current version..."
    BACKUP_NAME="snapcal-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r . $BACKUP_DIR/$BACKUP_NAME
    log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Pull latest changes
log "Pulling latest changes from git..."
git pull origin main || error "Failed to pull latest changes"

# Set proper permissions
log "Setting proper permissions..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    log "Creating .env file..."
    cp backend/env.example backend/.env
    warning "Please edit backend/.env with your production settings"
fi

# Build and start services
log "Building and starting Docker services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
log "Waiting for services to start..."
sleep 30

# Check service status
log "Checking service status..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ All services are running successfully!"
else
    error "❌ Some services failed to start"
fi

# Test API health
log "Testing API health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "✅ API is responding correctly"
else
    warning "⚠️  API health check failed"
fi

# Clean up old backups (keep last 5)
log "Cleaning up old backups..."
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm -rf

log "🎉 Deployment completed successfully!"
log "📊 Check logs: docker-compose -f docker-compose.prod.yml logs -f"
log "🌐 Your app should be available at: https://snapcal.fun"

# Install backend dependencies
log "Installing backend dependencies..."
cd backend
npm install

log "🎉 Deployment completed successfully!"
log "📊 Check logs: docker-compose -f docker-compose.prod.yml logs -f"
log "🌐 Your app should be available at: https://snapcal.fun"

npm run start:sqlite 

cd C:\Projects\Mob\SnapCal13052025\backend 