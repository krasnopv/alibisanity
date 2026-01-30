# Production Safety Guarantee

## ✅ Production is Protected

This document confirms that **production remains completely unchanged** and continues to work exactly as before staging was implemented.

## Production Configuration (Unchanged)

### Default Behavior

All existing commands work **exactly as before** and use **production** by default:

```bash
# These commands use PRODUCTION (default behavior)
npm run dev          # → production dataset
npm run build        # → production dataset  
npm run deploy       # → production dataset (Sanity.io)
npm start            # → production dataset
```

### Configuration Files

**sanity.config.ts:**
- Default: `dataset: 'production'`
- Only changes if `SANITY_DATASET` environment variable is set
- Production Studio at `sanity.io` uses defaults (production)

**sanity.cli.ts:**
- Default: `dataset: 'production'`
- Only changes if `SANITY_DATASET` environment variable is set
- Production deployment uses defaults (production)

## Staging Configuration (New, Optional)

Staging is **completely separate** and **optional**:

```bash
# These commands use STAGING (explicit, new)
npm run dev:staging      # → staging dataset (explicit)
npm run build:staging    # → staging dataset (explicit)
npm run docker:build:staging  # → staging Docker (explicit)
```

### Staging Files (New, Don't Affect Production)

- `Dockerfile.staging` - Only used for staging
- `docker-compose.staging.yml` - Only used for staging
- `.github/workflows/deploy-staging.yml` - Only deploys staging
- `nginx-admin-http.conf` - Only for staging subdomain
- `nginx-admin-https.conf` - Only for staging subdomain

## Verification Checklist

### ✅ Production Commands Still Work

- [x] `npm run dev` → Uses production dataset (default)
- [x] `npm run build` → Uses production dataset (default)
- [x] `npm run deploy` → Deploys to Sanity.io (default)
- [x] Default Sanity Studio → Uses production dataset

### ✅ Production Studio Unchanged

- [x] Access: `sanity.io` → Your project → Open Studio
- [x] Dataset: `production` (default)
- [x] Deployment: Uses existing `appId: 'uueornnq3xvsv0kiefmm4ycc'`
- [x] No Docker deployment for production

### ✅ Staging is Separate

- [x] Separate npm scripts (explicit `:staging` suffix)
- [x] Separate Docker files
- [x] Separate GitHub Actions workflow
- [x] Separate nginx configuration
- [x] Separate dataset (`staging`)

## Environment Variables

### Default Behavior (Production)

When **no environment variables** are set:
- `SANITY_DATASET` → defaults to `'production'`
- `SANITY_PROJECT_ID` → defaults to `'srer6l4b'`
- `SANITY_STUDIO_TITLE` → defaults to `'Alibi'`

### Staging Behavior (Explicit)

Staging **only** works when explicitly set:
- `npm run dev:staging` → Sets `SANITY_DATASET=staging`
- `npm run build:staging` → Sets `SANITY_DATASET=staging`
- Docker builds → Sets `SANITY_DATASET=staging` in Dockerfile

## GitHub Actions

### Production Deployment

**No changes to production deployment:**
- Production still uses default Sanity.io Studio
- No GitHub Actions workflow for production
- Production deployment unchanged

### Staging Deployment

**New, separate workflow:**
- `.github/workflows/deploy-staging.yml` → Only deploys staging
- Only triggers on staging-related file changes
- Does not affect production

## What Changed vs What Didn't

### ✅ What Didn't Change (Production Safe)

- Default `npm run dev` command
- Default `npm run build` command
- Default `npm run deploy` command
- `sanity.config.ts` defaults (production)
- `sanity.cli.ts` defaults (production)
- Production Studio at `sanity.io`
- Production dataset access
- Production deployment process

### ➕ What Was Added (Staging Only)

- New npm scripts with `:staging` suffix
- New Docker files for staging
- New GitHub Actions workflow for staging
- New nginx configs for staging subdomain
- Environment variable support (backward compatible)

## Testing Production

To verify production still works:

```bash
# 1. Test default dev (should use production)
npm run dev
# Should show: dataset: 'production'

# 2. Test default build (should use production)
npm run build
# Should build with production dataset

# 3. Test production Studio
# Go to sanity.io → Your project → Open Studio
# Should connect to production dataset
```

## Rollback Plan

If anything goes wrong, you can:

1. **Remove staging files** (production unaffected):
   ```bash
   rm Dockerfile.staging
   rm docker-compose.staging.yml
   rm .github/workflows/deploy-staging.yml
   ```

2. **Remove staging scripts** from package.json (production unaffected)

3. **Production will continue working** as before

## Summary

✅ **Production is 100% safe and unchanged**
✅ **All existing commands work as before**
✅ **Staging is completely optional and separate**
✅ **No breaking changes to production**
✅ **Backward compatible**

You can safely use staging without any risk to production!
