# Sanity Environment Setup Plan

## Overview

This document explains how to set up multiple environments (production, staging/testing) for your Sanity project.

## Option 1: Multiple Datasets (Recommended)

**Best for:** Most use cases - same project, different data

### Advantages:
- ✅ Same project ID (simpler management)
- ✅ Same schema across environments
- ✅ Easy to copy data between datasets
- ✅ No additional project setup needed
- ✅ Cost-effective (one project, multiple datasets)

### Structure:
```
Project: srer6l4b
├── Dataset: production (live data)
└── Dataset: staging (testing data)
```

### Implementation Steps:

1. **Create the staging dataset** in Sanity:
   ```bash
   sanity dataset create staging
   ```

2. **Use environment variables** to switch between datasets
3. **Update config files** to read from environment
4. **Add npm scripts** for different environments

---

## Option 2: Multiple Projects

**Best for:** Complete isolation, different billing, different teams

### Advantages:
- ✅ Complete isolation
- ✅ Separate billing/quotas
- ✅ Different access controls
- ✅ Independent deployments

### Disadvantages:
- ❌ More complex to manage
- ❌ Schema changes need to be synced manually
- ❌ Higher cost (multiple projects)

---

## Recommended Implementation: Multiple Datasets

### Step 1: Create Environment Files

Create `.env.local` (for local development):
```env
SANITY_PROJECT_ID=srer6l4b
SANITY_DATASET=production
SANITY_STUDIO_TITLE=Alibi (Production)
```

Create `.env.staging.local` (for staging):
```env
SANITY_PROJECT_ID=srer6l4b
SANITY_DATASET=staging
SANITY_STUDIO_TITLE=Alibi (Staging)
```

### Step 2: Update Configuration Files

**sanity.config.ts** - Use environment variables:
```typescript
export default defineConfig({
  name: 'default',
  title: process.env.SANITY_STUDIO_TITLE || 'Alibi',
  projectId: process.env.SANITY_PROJECT_ID || 'srer6l4b',
  dataset: process.env.SANITY_DATASET || 'production',
  // ... rest of config
})
```

**sanity.cli.ts** - Use environment variables:
```typescript
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || 'srer6l4b',
    dataset: process.env.SANITY_DATASET || 'production'
  },
  // ... rest of config
})
```

### Step 3: Add NPM Scripts

Update `package.json`:
```json
{
  "scripts": {
    "dev": "sanity dev",
    "dev:staging": "cross-env SANITY_DATASET=staging SANITY_STUDIO_TITLE='Alibi (Staging)' sanity dev",
    "dev:production": "cross-env SANITY_DATASET=production SANITY_STUDIO_TITLE='Alibi (Production)' sanity dev",
    "build": "sanity build",
    "build:staging": "cross-env SANITY_DATASET=staging SANITY_STUDIO_TITLE='Alibi (Staging)' sanity build",
    "build:production": "cross-env SANITY_DATASET=production SANITY_STUDIO_TITLE='Alibi (Production)' sanity build",
    "deploy": "sanity deploy",
    "deploy:staging": "cross-env SANITY_DATASET=staging sanity deploy --staging",
    "deploy:production": "cross-env SANITY_DATASET=production sanity deploy"
  }
}
```

### Step 4: Install cross-env (for cross-platform env vars)

```bash
npm install --save-dev cross-env
```

---

## Visual Indicators

To make it clear which environment you're in:

1. **Different Studio titles** (already in plan above)
2. **Color coding** - Add a banner/header component
3. **Dataset badge** - Show current dataset in UI

---

## Data Management

### Copying Data Between Environments

**From Production to Staging:**
```bash
# Export from production
sanity dataset export production production-backup.tar.gz

# Import to staging
sanity dataset import production-backup.tar.gz staging
```

**Selective copying:**
- Use Sanity's export/import tools
- Or use GROQ queries to copy specific documents
- Or use the Sanity CLI migration scripts

---

## Deployment Strategy

### Your Current Setup

You're using the **default Sanity.io Studio interface** (accessed through the Sanity dashboard at `sanity.io`), not custom deployed Studio URLs. This is perfectly fine and works well with multiple datasets!

### How Multiple Datasets Work with Default Studio

When using the default Sanity Studio interface:

1. **You access Studio through:** `https://sanity.io/manage` → Your project → Open Studio
2. **The Studio connects to ONE dataset at a time** (the one configured in `sanity.config.ts`)
3. **To switch datasets:** You change the `dataset` in your config and restart/reload

### Two Approaches for Multiple Environments

#### Option A: Local Development with Environment Switching (Recommended)

**For local development and testing:**

- Run Studio locally with different datasets using environment variables
- Switch between staging/production datasets locally
- Use the default Sanity Studio for production work

**Workflow:**
```bash
# Work with staging dataset locally
npm run dev:staging

# Work with production dataset locally  
npm run dev:production

# For production, use the default Sanity Studio at sanity.io
```

**Benefits:**
- ✅ Simple - no custom deployments needed
- ✅ Test changes locally before applying to production
- ✅ Use default Studio for production (familiar interface)
- ✅ Easy dataset switching

#### Option B: Custom Deployed Studios (Optional)

If you want **separate Studio URLs** for staging and production:

1. **Staging Studio:** `https://alibi-staging.sanity.studio` (uses `staging` dataset)
2. **Production Studio:** `https://alibi.sanity.studio` (uses `production` dataset)

**How to set up custom deployments:**

1. **Build staging Studio:**
   ```bash
   npm run build:staging
   sanity deploy --staging
   ```

2. **Build production Studio:**
   ```bash
   npm run build:production
   sanity deploy
   ```

**When to use custom deployments:**
- You want separate URLs for different teams
- You need to restrict access to staging Studio
- You want staging Studio accessible without Sanity dashboard login
- You need different Studio configurations per environment

### Option C: Self-Hosted Docker Deployment (Your Use Case)

**Yes, you can deploy a staging Studio to a server in Docker!**

This is perfect for:
- Running staging Studio on your own server
- Docker containerization
- Custom domain/hosting
- Team access without Sanity dashboard login

**How it works:**

1. **Build the Studio for staging:**
   ```bash
   npm run build:staging
   ```
   This creates a `dist/` folder with the Studio configured for `staging` dataset.

2. **Deploy to your server:**
   - Copy `dist/` to your server
   - Run in Docker container
   - Serve via nginx/apache/node server

3. **Docker Example:**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY dist/ ./dist/
   COPY package.json ./
   RUN npm install -g serve
   EXPOSE 3000
   CMD ["serve", "-s", "dist", "-l", "3000"]
   ```

4. **Result:** Staging Studio accessible at your server URL (e.g., `https://staging.alibistudios.co`)

**Key Points:**
- ✅ **Dataset is baked in at build time** - the `dist/` folder contains Studio configured for `staging` dataset
- ✅ **No runtime switching** - each build targets one dataset
- ✅ **Separate deployments** - build staging Studio separately from production
- ✅ **Docker-friendly** - static files, easy to containerize

### Recommended Setup for Your Case

You have **three options**:

#### Option 1: Default Studio + Local Testing (Simplest)
- **Production:** Use default Studio at `sanity.io` → `production` dataset
- **Staging:** Run `npm run dev:staging` locally → `staging` dataset

#### Option 2: Default Studio + Docker Staging (Your Plan)
- **Production:** Use default Studio at `sanity.io` → `production` dataset
- **Staging:** Deploy staging Studio to Docker on server → `staging` dataset
  - Build: `npm run build:staging`
  - Deploy `dist/` to Docker container
  - Access at your staging URL

#### Option 3: Both Deployed (Full Control)
- **Production:** Deploy production Studio to Docker/server → `production` dataset
- **Staging:** Deploy staging Studio to Docker/server → `staging` dataset
  - Both self-hosted, full control

### Docker Deployment Workflow

**For Staging Studio on Docker:**

1. **Build staging Studio:**
   ```bash
   npm run build:staging
   ```

2. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY dist/ ./dist/
   RUN npm install -g serve
   EXPOSE 3000
   ENV NODE_ENV=production
   CMD ["serve", "-s", "dist", "-l", "3000"]
   ```

3. **Build Docker image:**
   ```bash
   docker build -t alibi-studio-staging .
   ```

4. **Run container:**
   ```bash
   docker run -d -p 3000:3000 --name alibi-studio-staging alibi-studio-staging
   ```

5. **Access:** `http://your-server:3000` or configure reverse proxy

**Important:** The dataset is set at **build time**, not runtime. So:
- `npm run build:staging` → Studio connects to `staging` dataset
- `npm run build:production` → Studio connects to `production` dataset

### Important Notes

- ✅ **Default Studio** connects to the dataset specified in `sanity.config.ts`
- ✅ **Local Studio** can use environment variables to switch datasets
- ✅ **Deployed Studio** (Docker/self-hosted) has dataset baked in at build time
- ✅ **Same codebase** - both use the same schema and plugins
- ✅ **Different datasets** - staging and production data are separate
- ⚠️ **Build-time configuration** - dataset must be set when building, not at runtime

---

## Workflow Recommendations

1. **Development:**
   - Work in `staging` dataset locally
   - Test schema changes in staging first
   - Test content changes in staging

2. **Testing:**
   - Deploy staging Studio
   - Test with staging dataset
   - Get approval from stakeholders

3. **Production:**
   - Copy approved content from staging → production
   - Deploy production Studio
   - Monitor for issues

---

## Security Considerations

1. **Access Control:**
   - Staging: Can be more permissive (for testing)
   - Production: Strict access control

2. **API Tokens:**
   - Use different tokens for staging vs production
   - Store in environment variables
   - Never commit tokens to git

3. **Frontend Integration:**
   - Use different API endpoints for staging/production
   - Configure in your frontend app's environment variables

---

## Frontend App Integration

In your frontend app, you'll need:

**Staging:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=srer6l4b
NEXT_PUBLIC_SANITY_DATASET=staging
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
```

**Production:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=srer6l4b
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01
```

---

## Quick Start Checklist

- [ ] Create `staging` dataset: `sanity dataset create staging`
- [ ] Install `cross-env`: `npm install --save-dev cross-env`
- [ ] Update `sanity.config.ts` to use env vars
- [ ] Update `sanity.cli.ts` to use env vars
- [ ] Add npm scripts for staging/production
- [ ] Test local staging: `npm run dev:staging`
- [ ] Test local production: `npm run dev:production`
- [ ] Deploy staging Studio
- [ ] Update frontend app to support staging dataset
- [ ] Document the workflow for your team

---

## Alternative: Using dotenv

If you prefer using `.env` files with `dotenv`:

1. Install: `npm install --save-dev dotenv`
2. Create `.env.staging` and `.env.production`
3. Load in config: `require('dotenv').config({ path: '.env.staging' })`

But `cross-env` is simpler for this use case.
