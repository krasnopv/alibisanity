# Docker Cleanup Setup Guide

This guide explains how to set up automatic Docker cleanup on your server to run every Monday at 4am.

## What the Script Does

The `docker-cleanup.sh` script safely removes:
- ✅ Stopped containers
- ✅ Dangling/untagged images
- ✅ Unused images (older than 7 days)
- ✅ Unused volumes
- ✅ Build cache (older than 7 days)

**It does NOT remove:**
- ❌ Running containers (your staging Studio stays running)
- ❌ Images currently in use
- ❌ Volumes attached to containers

## Step 1: Copy Script to Server

From your local machine:

```bash
# Copy the script to server
scp -P 2219 scripts/docker-cleanup.sh deployer@your-server:/opt/alibi-studio/

# Or if you're already on the server, download it:
# wget https://raw.githubusercontent.com/your-repo/scripts/docker-cleanup.sh
```

## Step 2: Make Script Executable

SSH to your server:

```bash
ssh -p 2219 deployer@your-server

# Make script executable
chmod +x /opt/alibi-studio/docker-cleanup.sh

# Test it manually first (optional but recommended)
sudo /opt/alibi-studio/docker-cleanup.sh
```

## Step 3: Log File Location

The script logs to `/opt/alibi-studio/docker-cleanup.log` (same directory as the script). No setup needed - the script creates the log file automatically if it doesn't exist.

If for some reason it can't write there, it will fall back to `~/docker-cleanup.log`.

## Step 4: Set Up Cron Job

### Option A: Edit Crontab Directly (Recommended)

```bash
# Edit crontab
crontab -e

# Add this line (runs every Monday at 4:00 AM):
0 4 * * 1 /opt/alibi-studio/docker-cleanup.sh

# Save and exit (Ctrl+X, then Y, then Enter in nano)
```

### Option B: Add via Command Line

```bash
# Add cron job
(crontab -l 2>/dev/null; echo "0 4 * * 1 /opt/alibi-studio/docker-cleanup.sh") | crontab -

# Verify it was added
crontab -l
```

## Cron Schedule Explanation

```
0 4 * * 1
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, where 0 and 7 = Sunday, 1 = Monday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**`0 4 * * 1`** = Every Monday at 4:00 AM

### Other Schedule Examples

- **Every day at 4am:** `0 4 * * *`
- **Every Monday at 2am:** `0 2 * * 1`
- **Every Sunday at 3am:** `0 3 * * 0`
- **Every week on Monday at 4am:** `0 4 * * 1` (what we're using)

## Step 5: Verify Cron Job

```bash
# List all cron jobs
crontab -l

# Check cron service status
sudo systemctl status cron
# or on some systems:
sudo systemctl status crond
```

## Step 6: Test the Script

Before relying on cron, test it manually:

```bash
# Run the script manually
sudo /opt/alibi-studio/docker-cleanup.sh

# Check the log
tail -f /var/log/docker-cleanup.log

# Verify your containers are still running
docker ps
```

You should see:
- ✅ Your `alibi-studio-staging` container still running
- ✅ Cleanup log showing what was removed
- ✅ Disk space freed up

## Step 7: Monitor Logs

Check the cleanup log anytime:

```bash
# View last cleanup
tail -n 50 /opt/alibi-studio/docker-cleanup.log

# Watch log in real-time (during cleanup)
tail -f /opt/alibi-studio/docker-cleanup.log

# Search for errors
grep -i error /opt/alibi-studio/docker-cleanup.log
```

## Troubleshooting

### Cron Job Not Running

1. **Check cron service:**
   ```bash
   sudo systemctl status cron
   sudo systemctl start cron  # if not running
   ```

2. **Check cron logs:**
   ```bash
   # On Ubuntu/Debian
   sudo tail -f /var/log/syslog | grep CRON
   
   # On CentOS/RHEL
   sudo tail -f /var/log/cron
   ```

3. **Verify script path:**
   ```bash
   which docker  # Should show /usr/bin/docker or similar
   ls -la /opt/alibi-studio/docker-cleanup.sh  # Should exist and be executable
   ```

4. **Test script manually:**
   ```bash
   /opt/alibi-studio/docker-cleanup.sh
   ```

### Permission Issues

If the script fails with permission errors:

```bash
# Make sure deployer user can run docker commands
sudo usermod -aG docker deployer

# Log out and back in for group changes to take effect
# Or run:
newgrp docker

# Test docker access
docker ps
```

### Script Needs Sudo

If the script needs sudo (shouldn't if user is in docker group):

```bash
# Edit crontab to use sudo
crontab -e

# Change to:
0 4 * * 1 sudo /opt/alibi-studio/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1

# Or better: configure passwordless sudo for this script
sudo visudo
# Add line:
deployer ALL=(ALL) NOPASSWD: /opt/alibi-studio/docker-cleanup.sh
```

## Manual Cleanup Commands

If you want to clean up Docker manually anytime:

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove build cache
docker builder prune -a -f

# Full system cleanup (keeps running containers)
docker system prune -a -f --volumes
```

## Safety Notes

✅ **Safe to run:** The script only removes unused resources
✅ **Running containers protected:** Your staging Studio will keep running
✅ **Current images protected:** Images in use won't be removed
✅ **Logs everything:** All actions are logged for review

⚠️ **Note:** The script removes images older than 7 days. If you have old images you want to keep, they'll be removed. Adjust the `until=168h` (7 days) in the script if needed.

## Quick Reference

```bash
# Copy script to server
scp -P 2219 scripts/docker-cleanup.sh deployer@server:/opt/alibi-studio/

# SSH to server
ssh -p 2219 deployer@server

# Make executable
chmod +x /opt/alibi-studio/docker-cleanup.sh

# Test manually
/opt/alibi-studio/docker-cleanup.sh

# Add cron job (Monday 4am)
(crontab -l 2>/dev/null; echo "0 4 * * 1 /opt/alibi-studio/docker-cleanup.sh") | crontab -

# Verify cron job
crontab -l

# View logs
tail -f /opt/alibi-studio/docker-cleanup.log
```
