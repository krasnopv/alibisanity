#!/bin/bash

# Docker cleanup script for server
# Safely removes unused Docker resources without affecting running containers
# Run weekly via cron to keep server clean

set -e

# Use a log file location the user can write to
LOG_FILE="/opt/alibi-studio/docker-cleanup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure log directory exists and is writable
LOG_DIR=$(dirname "$LOG_FILE")
mkdir -p "$LOG_DIR"
touch "$LOG_FILE" 2>/dev/null || {
    echo "Warning: Cannot write to $LOG_FILE, using ~/docker-cleanup.log instead"
    LOG_FILE="$HOME/docker-cleanup.log"
}

# Function to log messages
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[$DATE] $1"
}

log "========================================="
log "Starting Docker cleanup..."

# Get disk space before cleanup
BEFORE=$(df -h / | awk 'NR==2 {print $4}')
log "Disk space before cleanup: $BEFORE"

# 1. Remove stopped containers (safe - only stopped ones)
log "Removing stopped containers..."
STOPPED=$(docker ps -a -q -f status=exited | wc -l)
if [ "$STOPPED" -gt 0 ]; then
    docker ps -a -q -f status=exited | xargs -r docker rm
    log "Removed $STOPPED stopped container(s)"
else
    log "No stopped containers to remove"
fi

# 2. Remove dangling images (untagged, safe)
log "Removing dangling images..."
DANGLING=$(docker images -f "dangling=true" -q | wc -l)
if [ "$DANGLING" -gt 0 ]; then
    docker images -f "dangling=true" -q | xargs -r docker rmi
    log "Removed $DANGLING dangling image(s)"
else
    log "No dangling images to remove"
fi

# 3. Remove unused images (but keep currently used ones)
# This removes images that aren't tagged and aren't used by any container
log "Removing unused images (keeping active ones)..."
UNUSED_IMAGES=$(docker images --format "{{.ID}}" | wc -l)
# We'll use docker image prune but keep images used by running/stopped containers
docker image prune -af --filter "until=168h" 2>&1 | tee -a "$LOG_FILE" || true
log "Cleaned up old unused images (older than 7 days)"

# 4. Remove unused volumes (safe - only unused)
log "Removing unused volumes..."
UNUSED_VOLUMES=$(docker volume ls -q -f dangling=true | wc -l)
if [ "$UNUSED_VOLUMES" -gt 0 ]; then
    docker volume ls -q -f dangling=true | xargs -r docker volume rm
    log "Removed $UNUSED_VOLUMES unused volume(s)"
else
    log "No unused volumes to remove"
fi

# 5. Prune build cache (safe - only cache)
log "Pruning build cache..."
docker builder prune -af --filter "until=168h" 2>&1 | tee -a "$LOG_FILE" || true
log "Cleaned up build cache (older than 7 days)"

# 6. System prune (removes all unused resources, but keeps running containers)
log "Running system prune (keeps running containers)..."
docker system prune -af --filter "until=168h" --volumes 2>&1 | tee -a "$LOG_FILE" || true

# Get disk space after cleanup
AFTER=$(df -h / | awk 'NR==2 {print $4}')
log "Disk space after cleanup: $AFTER"

# Show what's still running
log ""
log "Active containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" | tee -a "$LOG_FILE"

log ""
log "Docker cleanup completed successfully!"
log "========================================="
