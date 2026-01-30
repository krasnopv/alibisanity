# Dataset Creation and Migration Guide

## Creating a Dataset

### Option 1: Via Sanity.io Web Interface (Easiest)

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project (`srer6l4b`)
3. Go to **Settings** → **API** → **Datasets**
4. Click **Add dataset**
5. Enter name: `staging`
6. Click **Create**

### Option 2: Via CLI

```bash
sanity dataset create staging
```

## Migrating Data from Production to Staging

### Method 1: Migration Script (Recommended - Handles References)

**⚠️ Important:** The standard `sanity dataset import` command doesn't handle document references properly. Use the migration script instead.

#### Step 1: Get API Token

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **Settings** → **API** → **Tokens**
4. Click **Add API token**
5. Name it "Migration Token"
6. Set permissions: **Editor**
7. Copy the token

#### Step 2: Set Environment Variable

```bash
export SANITY_API_TOKEN=your-token-here
```

Or create `.env.local` file:
```env
SANITY_API_TOKEN=your-token-here
```

#### Step 3: Run Migration Script

```bash
npm run migrate:to-staging
```

This script:
- ✅ Copies all documents from production to staging
- ✅ Resolves document references properly
- ✅ Handles arrays of references
- ✅ Creates documents in correct order
- ✅ Maps old IDs to new IDs

**Note:** The script migrates documents in the correct order to handle dependencies.

### Method 2: Full Dataset Export/Import (Alternative - May Have Reference Issues)

**⚠️ Warning:** This method may fail with reference errors. Use Method 1 (migration script) instead.

If you still want to try this:

#### Step 1: Export Production Dataset

```bash
# Export entire production dataset
sanity dataset export production production-backup.tar.gz
```

#### Step 2: Import to Staging

```bash
# Import to staging dataset
sanity dataset import production-backup.tar.gz staging
```

**Note:** This may fail with "references to other projects/datasets not permitted" error. If it does, use Method 1 instead.

### Method 3: Selective Migration (Using GROQ Queries)

For selective copying of specific document types:

#### Step 1: Export Specific Document Types

```bash
# Export only projects
sanity dataset export production projects-backup.tar.gz --filter '_type == "project"'

# Export only services
sanity dataset export production services-backup.tar.gz --filter '_type == "service"'

# Export multiple types
sanity dataset export production content-backup.tar.gz --filter '_type in ["project", "service", "director"]'
```

#### Step 2: Import to Staging

```bash
sanity dataset import projects-backup.tar.gz staging
sanity dataset import services-backup.tar.gz staging
```

### Method 4: Using Sanity Migration Scripts (Custom)

Create a migration script to copy specific documents:

#### Create Migration Script

Create `scripts/migrate-to-staging.js`:

```javascript
import {createClient} from '@sanity/client'

// Production client
const productionClient = createClient({
  projectId: 'srer6l4b',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: process.env.SANITY_API_TOKEN, // Required for write operations
})

// Staging client
const stagingClient = createClient({
  projectId: 'srer6l4b',
  dataset: 'staging',
  useCdn: false,
  apiVersion: '2023-01-01',
  token: process.env.SANITY_API_TOKEN, // Required for write operations
})

async function migrateDocuments(documentType) {
  console.log(`Migrating ${documentType}...`)
  
  // Fetch from production
  const documents = await productionClient.fetch(`*[_type == "${documentType}"]`)
  
  console.log(`Found ${documents.length} ${documentType} documents`)
  
  // Create in staging
  for (const doc of documents) {
    try {
      // Remove _id and _rev to create new documents
      const {_id, _rev, ...docData} = doc
      
      await stagingClient.create({
        ...docData,
        _type: documentType,
      })
      
      console.log(`✓ Created ${documentType}: ${doc.title || doc.name || doc._id}`)
    } catch (error) {
      console.error(`✗ Failed to create ${documentType}: ${error.message}`)
    }
  }
  
  console.log(`✓ Migration complete for ${documentType}`)
}

// Migrate specific types
async function migrate() {
  const typesToMigrate = [
    'project',
    'service',
    'director',
    'film',
    'award',
    // Add other types as needed
  ]
  
  for (const type of typesToMigrate) {
    await migrateDocuments(type)
  }
  
  console.log('✅ All migrations complete!')
}

migrate().catch(console.error)
```

#### Run Migration Script

```bash
# Set your API token
export SANITY_API_TOKEN=your-token-here

# Run migration
node scripts/migrate-to-staging.js
```

### Method 5: Using Sanity CLI Copy Command

Sanity CLI has a built-in copy command:

```bash
# Copy all documents from production to staging
sanity documents copy production staging

# Copy specific document types
sanity documents copy production staging --filter '_type == "project"'
```

## Migration Best Practices

### 1. Start Fresh (Recommended for First Time)

```bash
# 1. Create empty staging dataset
sanity dataset create staging

# 2. Export production
sanity dataset export production backup.tar.gz

# 3. Import to staging
sanity dataset import backup.tar.gz staging
```

### 2. Selective Migration

Only copy what you need for testing:

```bash
# Copy only essential content types
sanity dataset export production backup.tar.gz \
  --filter '_type in ["project", "service", "director", "film"]'

sanity dataset import backup.tar.gz staging
```

### 3. Incremental Updates

After initial migration, update specific documents:

```bash
# Export only recently modified documents
sanity dataset export production recent.tar.gz \
  --filter '_updatedAt > "2024-01-01T00:00:00Z"'

sanity dataset import recent.tar.gz staging
```

## Handling Assets (Images, Files)

### Important Note

When you export/import datasets:
- ✅ **Documents** are copied
- ✅ **Asset references** are copied
- ⚠️ **Assets themselves** may need separate handling

### Option 1: Assets Are Shared

If both datasets are in the same project, assets are typically shared. The export/import should handle asset references correctly.

### Option 2: Manual Asset Migration

If assets don't copy automatically:

```bash
# Export assets separately
sanity dataset export production assets.tar.gz --filter '_type == "sanity.imageAsset" || _type == "sanity.fileAsset"'

# Import assets
sanity dataset import assets.tar.gz staging
```

## Verification

After migration, verify the data:

### Check Document Counts

```bash
# Count documents in production
sanity exec --with-user-token 'sanity.client.fetch("count(*[_type == \"project\"])")' --dataset production

# Count documents in staging
sanity exec --with-user-token 'sanity.client.fetch("count(*[_type == \"project\"])")' --dataset staging
```

### Check in Studio

1. Open staging Studio: `npm run dev:staging`
2. Verify documents are present
3. Check images/assets load correctly

## Common Issues

### Issue: "Dataset already exists"

If staging dataset already exists:

```bash
# Delete existing staging dataset (WARNING: This deletes all data!)
sanity dataset delete staging

# Create new one
sanity dataset create staging
```

### Issue: "Permission denied"

Make sure you have:
- Write access to the project
- API token with appropriate permissions
- Correct project ID

### Issue: "Assets not loading"

1. Check asset references in documents
2. Verify assets exist in Sanity
3. Re-export/import if needed

## Quick Reference

```bash
# Create dataset
sanity dataset create staging

# Migrate using script (RECOMMENDED - handles references)
export SANITY_API_TOKEN=your-token
npm run migrate:to-staging

# Export production (for backup)
sanity dataset export production backup.tar.gz

# Check dataset list
sanity dataset list
```

## Troubleshooting

### Error: "references to other projects/datasets not permitted"

**Solution:** Use the migration script instead of `sanity dataset import`:

```bash
export SANITY_API_TOKEN=your-token
npm run migrate:to-staging
```

The script properly handles document references by:
1. **Migrating assets first** (images and files)
2. Creating documents in the correct order
3. Mapping old document IDs to new ones
4. Resolving references after documents are created

### Error: "references non-existent document" (image/file assets)

**Solution:** The updated migration script now:
1. **Migrates assets first** before documents
2. Uses `createOrReplace` to preserve asset IDs
3. Handles asset references in nested structures
4. Keeps asset references if assets are project-level (shared)

**If you still see asset errors:**
- Assets in Sanity are project-level (shared across datasets)
- The script will keep asset references as-is if migration fails
- This is normal - assets should work even if not explicitly migrated

## Recommended Workflow

### Initial Setup

1. Create staging dataset (via web or CLI)
2. Export production: `sanity dataset export production backup.tar.gz`
3. Import to staging: `sanity dataset import backup.tar.gz staging`
4. Verify in staging Studio

### Ongoing Updates

1. Test changes in staging
2. When ready, copy specific documents to production
3. Or re-export/import for full sync

## API Token Setup

For write operations, you need an API token:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **Settings** → **API** → **Tokens**
4. Click **Add API token**
5. Give it a name (e.g., "Migration Token")
6. Set permissions: **Editor** (for write access)
7. Copy the token

Use it:
```bash
export SANITY_API_TOKEN=your-token-here
```

Or in scripts:
```javascript
token: process.env.SANITY_API_TOKEN
```

## Summary

✅ **Create dataset:** Via web interface or CLI
✅ **Full migration:** Export/import entire dataset
✅ **Selective migration:** Use filters or scripts
✅ **Assets:** Usually handled automatically
✅ **Verification:** Check in Studio or via CLI

Choose the method that best fits your needs!
