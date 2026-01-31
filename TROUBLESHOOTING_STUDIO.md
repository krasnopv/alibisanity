# Troubleshooting Studio "Workspace: missing context value" Error

## Error: "Workspace: missing context value"

This error occurs when the Sanity Studio build doesn't have the correct configuration embedded.

## Common Causes

1. **Build done with wrong environment variables**
2. **Studio build missing projectId/dataset configuration**
3. **Configuration not embedded in static build**

## Solution: Rebuild the Studio

The Studio needs to be rebuilt with the correct environment variables. The build process embeds the configuration into the static files.

### Option 1: Trigger GitHub Actions Workflow

1. Go to GitHub → Actions
2. Select "Deploy Staging Studio to Server"
3. Click "Run workflow"
4. Type `deploy` → Run

This will:
- Build the Studio with correct environment variables
- Create a new Docker image
- Deploy to the server

### Option 2: Rebuild Locally and Deploy

```bash
# Build locally
npm run build:staging

# Build Docker image
npm run docker:build:staging

# Test locally
npm run docker:up:staging
```

### Option 3: Manual Rebuild on Server

If you have access to the server:

```bash
ssh -p 2219 deployer@46.62.255.49
cd /opt/alibi-studio

# Pull latest code (if using git)
# Or copy files manually

# Rebuild container
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d
```

## Verify Build Configuration

The build should show:
- `SANITY_PROJECT_ID=srer6l4b`
- `SANITY_DATASET=staging`
- `SANITY_STUDIO_TITLE="Alibi (Staging)"`

## Check Build Logs

After rebuilding, check the build logs:

```bash
# In GitHub Actions, check the "Build staging Studio" step
# Look for environment variables being set

# On server, check container logs
docker logs alibi-studio-staging
```

## Not Related to Migration

This error is **not** related to data migration. It's a Studio build/configuration issue. The migration script handles data, but the Studio build needs correct configuration embedded.

## Quick Fix

The fastest solution is to trigger a fresh GitHub Actions deployment, which will rebuild the Studio with the correct configuration.
