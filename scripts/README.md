# Migration Scripts

## migrate-to-staging.js

Migrates data from production dataset to staging dataset, properly handling document references.

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
