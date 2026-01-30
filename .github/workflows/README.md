# GitHub Actions Workflows

## Deploy Staging Studio

**Workflow:** `deploy-staging.yml`

### How It Works

This workflow deploys the Sanity Studio staging environment to your Docker server.

### Trigger Options

#### Option 1: Manual Deployment (Recommended)
1. Go to GitHub → Actions tab
2. Select "Deploy Staging Studio to Server"
3. Click "Run workflow"
4. Type `deploy` in the confirmation field
5. Click "Run workflow"

#### Option 2: Automatic on Push to Main
The workflow will automatically trigger when you push to `main` branch, but **only if** you've changed:
- Schema files (`schemaTypes/**`)
- Plugins (`plugins/**`)
- Configuration files (`sanity.config.ts`, `sanity.cli.ts`, `package.json`)
- Docker files (`Dockerfile.staging`, `docker-compose.staging.yml`)

### Required GitHub Secrets

Add these secrets in: `Settings` → `Secrets and variables` → `Actions`

- **STAGING_SERVER_HOST**: Your server IP or hostname (e.g., `46.62.255.49`)
- **STAGING_SERVER_USER**: SSH user (e.g., `deployer`)
- **STAGING_SERVER_PORT**: SSH port (default: `2219`, can be omitted if using default)
- **STAGING_SERVER_SSH_KEY**: Private SSH key for server access

### What the Workflow Does

1. ✅ Checks out code from repository
2. ✅ Installs dependencies
3. ✅ Builds staging Studio (`npm run build:staging`)
4. ✅ Builds Docker image
5. ✅ Saves Docker image as tar.gz
6. ✅ Copies image and docker-compose.yml to server
7. ✅ Stops existing container
8. ✅ Loads new Docker image
9. ✅ Starts new container
10. ✅ Runs health check

### Server Setup

The server should have:
- Docker and Docker Compose installed
- Directory `/opt/alibi-studio/` created and owned by deployer user
- SSH access configured with the SSH key

### Access

After deployment, the staging Studio will be accessible at:
- `http://your-server:3200`

### Troubleshooting

**Workflow fails:**
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Check SSH key has proper permissions
- Ensure server has Docker installed

**Container won't start:**
- SSH to server: `ssh -p 2219 deployer@your-server`
- Check logs: `cd /opt/alibi-studio && docker-compose -f docker-compose.staging.yml logs`
- Check container status: `docker ps -a | grep alibi-studio-staging`

**Port conflict:**
- Edit `docker-compose.staging.yml` on server to use different port
- Or stop conflicting service
