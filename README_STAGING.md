# Staging Deployment - Quick Start

## Overview

Staging Studio deployment is now ready! This allows you to:
- Test schema changes in a separate `staging` dataset
- Deploy staging Studio to `admin.alibistudios.co`
- Keep production completely separate and unchanged

## What's Been Set Up

✅ **Configuration Files:**
- `sanity.config.ts` - Uses environment variables (defaults to production)
- `sanity.cli.ts` - Uses environment variables (defaults to production)
- `package.json` - Added staging scripts

✅ **Docker Files:**
- `Dockerfile.staging` - Multi-stage build for staging
- `docker-compose.staging.yml` - Docker Compose config

✅ **Nginx Configuration:**
- `nginx-admin-http.conf` - HTTP config (before SSL)
- `nginx-admin-https.conf` - HTTPS config (after SSL)

✅ **GitHub Actions:**
- `.github/workflows/deploy-staging.yml` - Automated deployment

✅ **Documentation:**
- `ENVIRONMENT_SETUP.md` - Complete environment setup guide
- `DOCKER_DEPLOYMENT.md` - Docker deployment guide
- `NGINX_SETUP.md` - Nginx setup instructions
- `PRODUCTION_SAFETY.md` - Production safety guarantee
- `STAGING_DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

## Quick Start (3 Steps)

### 1. Create Staging Dataset

```bash
sanity dataset create staging
```

### 2. Configure GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions`

Add:
- `STAGING_SERVER_HOST` - Your server IP
- `STAGING_SERVER_USER` - SSH user (e.g., `deployer`)
- `STAGING_SERVER_PORT` - SSH port (e.g., `2219`, optional)
- `STAGING_SERVER_SSH_KEY` - Private SSH key (see below)

#### How to Get the SSH Key

**Option A: Generate a New SSH Key Pair**

1. Generate a new SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/staging_deploy
   ```
   Or use RSA:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions-staging" -f ~/.ssh/staging_deploy
   ```

2. Add the **public key** to your server:
   ```bash
   ssh-copy-id -i ~/.ssh/staging_deploy.pub -p 2219 deployer@your-server
   ```
   Or manually:
   ```bash
   cat ~/.ssh/staging_deploy.pub | ssh -p 2219 deployer@your-server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```

3. Get the **private key** content:
   ```bash
   cat ~/.ssh/staging_deploy
   ```
   Copy the entire output (including `-----BEGIN` and `-----END` lines)

4. Paste it into GitHub secret `STAGING_SERVER_SSH_KEY`

**Option B: Use an Existing SSH Key (Recommended if you already have one)**

If you already have an SSH key that works with your server (e.g., for your frontend app):

1. Get the private key content:
   ```bash
   cat ~/.ssh/id_rsa
   # or
   cat ~/.ssh/id_ed25519
   # or wherever your existing key is located
   ```
   Copy the entire output (including `-----BEGIN` and `-----END` lines)

2. Paste it into GitHub secret `STAGING_SERVER_SSH_KEY`

**Note:** You can use the same SSH key for multiple deployments (frontend, Sanity, etc.) as long as it has access to the server. No need to create a separate key unless you want to manage them separately.

**Important:** Never share your private key! Only add it to GitHub Secrets.

### 3. Deploy

**Option A: Automatic (on push to main)**
```bash
git push origin main
```

**Option B: Manual**
1. GitHub → Actions → "Deploy Staging Studio to Server"
2. Click "Run workflow"
3. Type `deploy` → Run

**Deployment Location on Server:**
- **Directory:** `/opt/alibi-studio/`
- **Docker Container:** `alibi-studio-staging`
- **Port:** `3200` (internal), proxied via Nginx to `admin.alibistudios.co`
- **Files:**
  - `alibi-studio-staging.tar.gz` - Docker image (temporary, removed after deployment)
  - `docker-compose.staging.yml` - Docker Compose configuration

## Verify Production is Safe

✅ **Production commands unchanged:**
- `npm run dev` → Production (default)
- `npm run build` → Production (default)
- `npx sanity deploy` → Production (default)
- `npm run deploy` → Production (default)

✅ **Production Studio:**
- Still works at `sanity.io` → Your project → Open Studio
- Uses `production` dataset
- No changes to deployment

## Staging Commands

```bash
# Local development
npm run dev:staging          # Run staging Studio locally

# Build
npm run build:staging         # Build staging Studio

# Docker (local testing)
npm run docker:build:staging  # Build Docker image
npm run docker:up:staging     # Start container
npm run docker:down:staging   # Stop container
```

## Access Points

- **Staging Studio:** `https://admin.alibistudios.co` (after nginx setup)
- **Production Studio:** `sanity.io` → Your project → Open Studio

## Next Steps

1. **Create staging dataset** (if not done)
2. **Add GitHub secrets** (required for deployment)
3. **Deploy via GitHub Actions** (automatic or manual)
4. **Set up nginx** (see `NGINX_SETUP.md`)
5. **Set up SSL** (see `NGINX_SETUP.md`)

## Documentation

- **Full Setup Guide:** `ENVIRONMENT_SETUP.md`
- **Docker Guide:** `DOCKER_DEPLOYMENT.md`
- **Nginx Guide:** `NGINX_SETUP.md`
- **Deployment Checklist:** `STAGING_DEPLOYMENT_CHECKLIST.md`
- **Production Safety:** `PRODUCTION_SAFETY.md`

## Support

If you encounter issues:
1. Check `STAGING_DEPLOYMENT_CHECKLIST.md` troubleshooting section
2. Check GitHub Actions logs
3. Check Docker logs: `docker logs alibi-studio-staging`
4. Check nginx logs: `sudo tail -f /var/log/nginx/admin-alibi-studio-error.log`

## Summary

✅ Production: **Completely unchanged and safe**
✅ Staging: **Ready to deploy**
✅ Documentation: **Complete**
✅ Automation: **GitHub Actions ready**

You're all set! 🚀
