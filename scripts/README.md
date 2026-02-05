# Migration Scripts

## migrate-to-staging.js

Migrates data from production dataset to staging dataset, properly handling document references.

## migrate-services-to-production.js

Migrates **newly created** Services (and their dependencies) from staging dataset to production.

- **Newly created** = Services that exist in staging but not in production (by `_id`).
- Also migrates any **serviceTag** and **subService** documents referenced by those services that exist in staging but not in production.
- Uses the same document `_id` in production so references (e.g. from projects) stay valid.

### Usage

1. **Get API Token:** (same as migrate-to-staging – Editor permissions)
2. **Set environment:**
   ```bash
   export SANITY_API_TOKEN=your-token-here
   ```
3. **Run migration (new services only):**
   ```bash
   npm run migrate:services-to-production
   ```
4. **Optional – migrate all staging services (create or overwrite in production):**
   ```bash
   MIGRATE_ALL_SERVICES=1 npm run migrate:services-to-production
   ```

### What it does

- Finds services in staging that are not in production.
- Migrates referenced serviceTags and subServices that are missing in production.
- Creates/overwrites services in production with the same `_id` (references preserved).
- Does not migrate assets; Sanity assets are project-level and shared across datasets.

## migrate-studios-to-production.js

Migrates **newly created** Studios (and their dependencies) from staging to production.

- **Newly created** = Studios that exist in staging but not in production (by `_id`).
- Also migrates any **address** documents referenced by those studios that exist in staging but not in production.
- Migrates referenced **image/file assets** (logo, featured image) from staging to production so references stay valid.

### Usage

1. **API token:** Same as above (`SANITY_API_TOKEN` with Editor permissions).
2. **New studios only:**
   ```bash
   npm run migrate:studios-to-production
   ```
3. **All staging studios (create or overwrite):**
   ```bash
   MIGRATE_ALL_STUDIOS=1 npm run migrate:studios-to-production
   ```

### What it does

- Finds studios in staging that are not in production.
- Migrates referenced assets (images/files), then addresses, then studios.
- Uses the same `_id` in production so references stay valid.

---

## migrate-to-staging.js (details)

### Usage

1. **Get API Token:**
   - Go to [sanity.io/manage](https://sanity.io/manage)
   - Settings → API → Tokens
   - Create token with **Editor** permissions

2. **Set Environment Variable:**
   ```bash
   export SANITY_API_TOKEN=your-token-here
   ```

3. **Run Migration:**
   ```bash
   npm run migrate:to-staging
   ```

### What It Does

- ✅ Copies all document types from production to staging
- ✅ Resolves document references properly
- ✅ Handles arrays of references
- ✅ Creates documents in correct dependency order
- ✅ Maps old document IDs to new ones

### Document Order

The script migrates documents in this order to handle dependencies:

1. Base documents (no references): category, serviceTag, award, trophy, address, studio, rebate
2. Documents with simple references: service, subService, director, teamMember
3. Documents with complex references: project, directorWork, film, page, seoMetadata

### Requirements

- Node.js installed
- `@sanity/client` package (included with Sanity)
- API token with write permissions
- Staging dataset must exist

### Troubleshooting

**Error: "SANITY_API_TOKEN is required"**
- Make sure you've set the environment variable
- Get token from Sanity.io manage panel

**Error: "Dataset not found"**
- Create staging dataset first: `sanity dataset create staging`

**Error: "Permission denied"**
- Make sure your API token has Editor permissions
- Check you have access to the project

---

## Server Maintenance Scripts

### docker-cleanup.sh

Safely removes unused Docker resources (stopped containers, unused images, volumes, build cache) without affecting running containers.

**Usage:**
```bash
# Copy to server
scp -P 2219 scripts/docker-cleanup.sh deployer@server:/opt/alibi-studio/

# Run manually
/opt/alibi-studio/docker-cleanup.sh

# Set up weekly cron job (Monday 4am)
crontab -e
# Add: 0 4 * * 1 /opt/alibi-studio/docker-cleanup.sh
```

**What it does:**
- ✅ Removes stopped containers
- ✅ Removes dangling/unused images (older than 7 days)
- ✅ Removes unused volumes
- ✅ Prunes build cache
- ✅ Keeps running containers safe
- ✅ Logs everything to `/opt/alibi-studio/docker-cleanup.log`

See `scripts/DOCKER_CLEANUP_SETUP.md` for detailed setup instructions.

### check-server-deployment.sh

Diagnostic script to check server readiness for deployment (directory permissions, disk space, Docker status, etc.).

**Usage:**
```bash
# Copy to server and run
scp -P 2219 scripts/check-server-deployment.sh deployer@server:/tmp/
ssh -p 2219 deployer@server
bash /tmp/check-server-deployment.sh
```
