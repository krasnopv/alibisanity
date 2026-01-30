# Docker Deployment Guide for Staging Studio

## Overview

This guide explains how to deploy the Sanity Studio for **staging** environment using Docker, following the same pattern as your front-end application.

**Production Studio** uses the default Sanity.io Studio (accessed through `sanity.io` dashboard).

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install `cross-env` which is needed for environment variable handling.

### 2. Create Staging Dataset

If you haven't already, create the staging dataset:

```bash
sanity dataset create staging
```

## Local Development

### Run Staging Studio Locally

```bash
npm run dev:staging
```

This runs the Studio locally connected to the `staging` dataset.

### Run Production Studio Locally

```bash
npm run dev:production
```

This runs the Studio locally connected to the `production` dataset.

## Docker Deployment (Staging Only)

### Build Docker Image

```bash
npm run docker:build:staging
```

Or manually:
```bash
docker build -f Dockerfile.staging -t alibi-studio-staging .
```

### Start Container

```bash
npm run docker:up:staging
```

Or manually:
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Stop Container

```bash
npm run docker:down:staging
```

Or manually:
```bash
docker-compose -f docker-compose.staging.yml down
```

## Access

- **Staging Studio (Docker):** `http://your-server:3200`
- **Production Studio:** Use default Sanity Studio at `sanity.io` → Your project → Open Studio

## Port Configuration

- Front-end app: `3100:3000`
- Staging Studio: `3200:3000`
- Production Studio: Uses default Sanity.io (no Docker)

## Dockerfile Structure

The `Dockerfile.staging` follows the same multi-stage build pattern as your front-end:

1. **deps stage:** Installs npm dependencies
2. **builder stage:** Builds the Studio with staging dataset configuration
3. **runner stage:** Serves the static files using `serve`

## Environment Variables

The dataset is set at **build time** in the Dockerfile:

```dockerfile
ENV SANITY_DATASET=staging
ENV SANITY_STUDIO_TITLE="Alibi (Staging)"
```

This means:
- ✅ Each build targets a specific dataset
- ✅ No runtime dataset switching
- ✅ Staging and production are completely separate

## Workflow

1. **Development:** Use `npm run dev:staging` to test locally
2. **Build:** Run `npm run docker:build:staging` to create Docker image
3. **Deploy:** Run `npm run docker:up:staging` to start container
4. **Production:** Use default Sanity Studio at `sanity.io` for production work

## Troubleshooting

### Container won't start

Check logs:
```bash
docker logs alibi-studio-staging
```

### Port conflict

If port 3200 is already in use, edit `docker-compose.staging.yml`:
```yaml
ports:
  - "3201:3000"  # Change to available port
```

### Rebuild after schema changes

After updating schemas, rebuild the Docker image:
```bash
npm run docker:down:staging
npm run docker:build:staging
npm run docker:up:staging
```

## Network Configuration

The staging Studio uses the same `alibi-network` as your front-end app, so they can communicate if needed.

## Production

**Production Studio does NOT use Docker.** It uses the default Sanity.io Studio interface:
- Access through: `sanity.io` → Your project → Open Studio
- Connects to: `production` dataset
- No Docker deployment needed

## GitHub Actions Deployment

### Automatic Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy-staging.yml`) that can automatically deploy the staging Studio when you push to `main` branch.

**To enable automatic deployment:**

1. **Set up GitHub Secrets:**
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add these secrets:
     - `STAGING_SERVER_HOST`: Your server IP (e.g., `46.62.255.49`)
     - `STAGING_SERVER_USER`: SSH user (e.g., `deployer`)
     - `STAGING_SERVER_PORT`: SSH port (e.g., `2219`, optional if using default)
     - `STAGING_SERVER_SSH_KEY`: Private SSH key for server access

2. **Push to main:**
   ```bash
   git add .
   git commit -m "Update schemas"
   git push origin main
   ```

3. **Deployment will trigger automatically** if you changed:
   - Schema files
   - Plugins
   - Configuration files
   - Docker files

### Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub → Actions tab
2. Select "Deploy Staging Studio to Server"
3. Click "Run workflow"
4. Type `deploy` to confirm
5. Click "Run workflow"

### Server Setup

Before first deployment, ensure your server has:

```bash
# Create deployment directory
sudo mkdir -p /opt/alibi-studio
sudo chown deployer:deployer /opt/alibi-studio
```

The workflow will handle the rest automatically.
