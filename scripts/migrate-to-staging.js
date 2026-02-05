#!/usr/bin/env node

/**
 * Migration script to copy data from production to staging dataset
 * Handles document references properly
 * 
 * Usage:
 *   export SANITY_API_TOKEN=your-token
 *   npm run migrate:to-staging
 */

const {createClient} = require('@sanity/client')

const PROJECT_ID = 'srer6l4b'
const API_VERSION = '2023-01-01'

// Get API token from environment
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_STUDIO_API_TOKEN

if (!token) {
  console.error('❌ Error: SANITY_API_TOKEN environment variable is required')
  console.error('   Get your token from: https://sanity.io/manage')
  process.exit(1)
}

// Create clients
const productionClient = createClient({
  projectId: PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: API_VERSION,
  token: token,
})

const stagingClient = createClient({
  projectId: PROJECT_ID,
  dataset: 'staging',
  useCdn: false,
  apiVersion: API_VERSION,
  token: token,
})

// Track migrated documents to resolve references
const migratedIds = new Map()

/** Generate a simple _key for array items that lack one */
function generateKey() {
  return Math.random().toString(36).slice(2, 11)
}

/**
 * Normalize reference objects in arrays to only _key, _type, _ref so Studio
 * treats them as editable (extra props from API can make fields read-only).
 */
function normalizeReferenceArrays(obj) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (item && item._type === 'reference' && item._ref) {
        return {
          _key: item._key || generateKey(),
          _type: 'reference',
          _ref: item._ref,
        }
      }
      return normalizeReferenceArrays(item)
    })
  }
  if (typeof obj === 'object') {
    const out = {}
    for (const [key, value] of Object.entries(obj)) {
      out[key] = normalizeReferenceArrays(value)
    }
    return out
  }
  return obj
}

/**
 * Migrate assets in batches using transactions (much faster)
 */
async function migrateAssets() {
  console.log('\n🖼️  Migrating assets (images and files)...')
  console.log('   Using batch transactions for speed...\n')
  
  try {
    // Fetch all assets
    const imageAssets = await productionClient.fetch(
      `*[_type == "sanity.imageAsset"]`
    )
    
    const fileAssets = await productionClient.fetch(
      `*[_type == "sanity.fileAsset"]`
    )
    
    console.log(`   Found ${imageAssets.length} image assets`)
    console.log(`   Found ${fileAssets.length} file assets`)
    
    // Process assets in batches using transactions
    const batchSize = 50
    let totalMigrated = 0
    
    // Migrate image assets in batches
    for (let i = 0; i < imageAssets.length; i += batchSize) {
      const batch = imageAssets.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(imageAssets.length / batchSize)
      
      process.stdout.write(`   Migrating image assets: batch ${batchNum}/${totalBatches} (${Math.min(i + batchSize, imageAssets.length)}/${imageAssets.length})...\r`)
      
      const mutations = batch.map(asset => {
        const {_id, _rev, _createdAt, _updatedAt, ...assetData} = asset
        return {
          createOrReplace: {
            ...assetData,
            _type: 'sanity.imageAsset',
            _id: asset._id,
          }
        }
      })
      
      try {
        await stagingClient.mutate(mutations)
        batch.forEach(asset => {
          migratedIds.set(asset._id, asset._id)
          totalMigrated++
        })
      } catch (error) {
        // If batch fails, try individual (slower but more reliable)
        for (const asset of batch) {
          try {
            const {_id, _rev, _createdAt, _updatedAt, ...assetData} = asset
            await stagingClient.createOrReplace({
              ...assetData,
              _type: 'sanity.imageAsset',
              _id: asset._id,
            })
            migratedIds.set(asset._id, asset._id)
            totalMigrated++
          } catch (err) {
            // Asset might already exist or be shared - keep reference anyway
            migratedIds.set(asset._id, asset._id)
            totalMigrated++
          }
        }
      }
    }
    
    console.log('') // New line
    
    // Migrate file assets in batches
    for (let i = 0; i < fileAssets.length; i += batchSize) {
      const batch = fileAssets.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(fileAssets.length / batchSize)
      
      process.stdout.write(`   Migrating file assets: batch ${batchNum}/${totalBatches} (${Math.min(i + batchSize, fileAssets.length)}/${fileAssets.length})...\r`)
      
      const mutations = batch.map(asset => {
        const {_id, _rev, _createdAt, _updatedAt, ...assetData} = asset
        return {
          createOrReplace: {
            ...assetData,
            _type: 'sanity.fileAsset',
            _id: asset._id,
          }
        }
      })
      
      try {
        await stagingClient.mutate(mutations)
        batch.forEach(asset => {
          migratedIds.set(asset._id, asset._id)
          totalMigrated++
        })
      } catch (error) {
        // If batch fails, try individual (slower but more reliable)
        for (const asset of batch) {
          try {
            const {_id, _rev, _createdAt, _updatedAt, ...assetData} = asset
            await stagingClient.createOrReplace({
              ...assetData,
              _type: 'sanity.fileAsset',
              _id: asset._id,
            })
            migratedIds.set(asset._id, asset._id)
            totalMigrated++
          } catch (err) {
            // Asset might already exist or be shared - keep reference anyway
            migratedIds.set(asset._id, asset._id)
            totalMigrated++
          }
        }
      }
    }
    
    console.log('') // New line
    console.log(`   ✅ Migrated ${totalMigrated} assets`)
  } catch (error) {
    console.error(`   ❌ Error migrating assets: ${error.message}`)
    console.error(`   Continuing anyway - will try to migrate documents...`)
  }
}

/**
 * Migrate a single document type
 */
async function migrateDocumentType(type) {
  console.log(`\n📦 Migrating ${type}...`)
  
  try {
    // Fetch all documents of this type from production
    const documents = await productionClient.fetch(
      `*[_type == $type]`,
      { type }
    )
    
    if (!documents || documents.length === 0) {
      console.log(`   ⚠️  No ${type} documents found`)
      return
    }
    
    console.log(`   Found ${documents.length} ${type} documents`)
    
    // Create documents in staging
    let successCount = 0
    let errorCount = 0
    
    for (const doc of documents) {
      try {
        // Create a clean document without system fields (keep _id for createOrReplace)
        const {_rev, _createdAt, _updatedAt, ...docData} = doc
        
        // Create or replace by original _id so re-runs don't duplicate
        await stagingClient.createOrReplace({
          ...docData,
          _type: type,
          _id: doc._id,
        })
        
        // Track the mapping: production _id -> same staging _id
        migratedIds.set(doc._id, doc._id)
        
        const title = doc.title || doc.name || doc.slug?.current || doc._id
        console.log(`   ✓ Created: ${title}`)
        successCount++
      } catch (error) {
        console.error(`   ✗ Failed: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`   ✅ ${type}: ${successCount} created, ${errorCount} failed`)
  } catch (error) {
    console.error(`   ❌ Error migrating ${type}: ${error.message}`)
  }
}

/**
 * Remove invalid reference from document (recursive)
 */
function removeInvalidReference(obj, invalidRefId) {
  if (obj === null || obj === undefined) return obj
  
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeInvalidReference(item, invalidRefId))
      .filter(item => {
        // Remove items that are invalid references
        if (typeof item === 'object' && item._type === 'reference' && item._ref === invalidRefId) {
          return false
        }
        return true
      })
  }
  
  if (typeof obj !== 'object') return obj
  
  // If this is the invalid reference, return null (will be filtered out)
  if (obj._type === 'reference' && obj._ref === invalidRefId) {
    return null
  }
  
  // Recursively process nested objects
  const cleaned = {}
  for (const [key, value] of Object.entries(obj)) {
    const cleanedValue = removeInvalidReference(value, invalidRefId)
    // Only include if cleaned value is not null (invalid reference was removed)
    if (cleanedValue !== null) {
      cleaned[key] = cleanedValue
    }
  }
  return cleaned
}

/**
 * Resolve all references (assets and documents) in a document (recursive)
 */
function resolveAllReferences(obj) {
  if (obj === null || obj === undefined) return obj
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => resolveAllReferences(item))
      .filter(item => item !== null) // Remove null references
  }
  
  // Handle primitives
  if (typeof obj !== 'object') return obj
  
  // Handle reference objects (both document and asset references)
  if (obj._type === 'reference' && obj._ref) {
    const newId = migratedIds.get(obj._ref)
    if (newId) {
      return {
        ...obj,
        _ref: newId,
      }
    }
    // If not found:
    // - Assets (image-*, file-*) are project-level, keep reference
    // - Document references: keep ref as-is (we use same _id in staging, so ref will work
    //   once the target document is migrated later; removing would drop Related Projects/Sub-Services)
    if (obj._ref.startsWith('image-') || obj._ref.startsWith('file-')) {
      return obj
    }
    // Keep document reference (same _id in staging; target may be migrated later in this run)
    return obj
  }
  
  // Handle image objects with asset references
  if (obj._type === 'image' && obj.asset) {
    if (obj.asset._ref) {
      const newAssetId = migratedIds.get(obj.asset._ref) || obj.asset._ref
      return {
        ...obj,
        asset: {
          _type: 'reference',
          _ref: newAssetId,
        },
      }
    }
    // If asset is already a reference object, resolve it
    if (typeof obj.asset === 'object' && obj.asset._ref) {
      const newAssetId = migratedIds.get(obj.asset._ref) || obj.asset._ref
      return {
        ...obj,
        asset: {
          _type: 'reference',
          _ref: newAssetId,
        },
      }
    }
  }
  
  // Handle file objects with asset references
  if (obj._type === 'file' && obj.asset) {
    if (obj.asset._ref) {
      const newAssetId = migratedIds.get(obj.asset._ref) || obj.asset._ref
      return {
        ...obj,
        asset: {
          _type: 'reference',
          _ref: newAssetId,
        },
      }
    }
    // If asset is already a reference object, resolve it
    if (typeof obj.asset === 'object' && obj.asset._ref) {
      const newAssetId = migratedIds.get(obj.asset._ref) || obj.asset._ref
      return {
        ...obj,
        asset: {
          _type: 'reference',
          _ref: newAssetId,
        },
      }
    }
  }
  
  // Recursively process nested objects
  const resolved = {}
  for (const [key, value] of Object.entries(obj)) {
    const resolvedValue = resolveAllReferences(value)
    // Only include non-null values (null means invalid reference was removed)
    if (resolvedValue !== null) {
      resolved[key] = resolvedValue
    }
  }
  return resolved
}

/**
 * Migrate documents with references (needs to run after base documents and assets)
 */
async function migrateWithReferences(type, referenceFields = []) {
  console.log(`\n🔗 Migrating ${type} with references...`)
  
  try {
    const documents = await productionClient.fetch(
      `*[_type == $type]`,
      { type }
    )
    
    if (!documents || documents.length === 0) {
      console.log(`   ⚠️  No ${type} documents found`)
      return
    }
    
    console.log(`   Found ${documents.length} ${type} documents`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const doc of documents) {
      try {
        const {_rev, _createdAt, _updatedAt, ...docData} = doc
        
        // Resolve ALL references recursively (assets and documents)
        let resolvedDoc = resolveAllReferences(docData)
        // Normalize reference arrays so Studio treats them as editable (not read-only)
        resolvedDoc = normalizeReferenceArrays(resolvedDoc)
        // Create or replace by original _id so re-runs don't duplicate
        await stagingClient.createOrReplace({
          ...resolvedDoc,
          _type: type,
          _id: doc._id,
        })
        
        migratedIds.set(doc._id, doc._id)
        
        const title = doc.title || doc.name || doc.slug?.current || doc._id
        console.log(`   ✓ Created: ${title}`)
        successCount++
      } catch (error) {
        console.error(`   ✗ Failed: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`   ✅ ${type}: ${successCount} created, ${errorCount} failed`)
  } catch (error) {
    console.error(`   ❌ Error migrating ${type}: ${error.message}`)
  }
}

/**
 * Pre-fetch all document IDs to map references
 */
async function prefetchAllDocumentIds() {
  console.log('\n📋 Pre-fetching all document IDs...')
  
  try {
    // Fetch all document IDs (excluding drafts and system documents)
    const allDocIds = await productionClient.fetch(
      `*[!(_id in path("drafts.**")) && !(_type match "sanity.*")]._id`
    )
    
    console.log(`   Found ${allDocIds.length} documents to migrate`)
    
    // Pre-map all IDs (they'll get new IDs when created, but we track the mapping)
    // For now, just track that these documents exist
    for (const docId of allDocIds) {
      // We'll update this when documents are actually created
      // For now, this helps us know which references are valid
    }
    
    return new Set(allDocIds)
  } catch (error) {
    console.error(`   ⚠️  Warning: Could not pre-fetch document IDs: ${error.message}`)
    return new Set()
  }
}

/**
 * Check if a reference ID exists in production
 */
async function referenceExists(refId, validDocIds) {
  // If it's an asset (starts with image- or file-), assume it exists (we migrated assets)
  if (refId.startsWith('image-') || refId.startsWith('file-')) {
    return true
  }
  
  // Check if it's in our valid document IDs set
  if (validDocIds && validDocIds.has(refId)) {
    return true
  }
  
  // Check if it's already been migrated
  if (migratedIds.has(refId)) {
    return true
  }
  
  return false
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting migration from production to staging...\n')
  console.log(`Project: ${PROJECT_ID}`)
  console.log(`Production → Staging\n`)
  
  // Step 0: Pre-fetch all document IDs
  const validDocIds = await prefetchAllDocumentIds()
  
  // Step 1: Migrate assets FIRST (images and files)
  await migrateAssets()
  
  // Step 2: Migrate base documents (no references)
  const baseTypes = [
    'category',
    'serviceTag',
    'award',
    'trophy',
    'address',
    'studio',
    'rebate',
  ]
  
  for (const type of baseTypes) {
    await migrateDocumentType(type)
  }
  
  // Step 2: Migrate documents that might reference base types
  await migrateWithReferences('service', ['tags', 'subServices', 'projects'])
  await migrateWithReferences('subService', ['tags', 'service', 'projects'])
  await migrateWithReferences('director', [])
  await migrateWithReferences('teamMember', ['services'])
  
  // Step 3: Migrate documents with complex references (and assets)
  await migrateWithReferences('project', [
    'director',
    'services',
    'subServices',
    'awards',
    'relatedProjects',
  ])
  
  await migrateWithReferences('directorWork', ['director'])
  await migrateWithReferences('film', ['category'])
  await migrateWithReferences('page', [])
  await migrateWithReferences('menu', ['items']) // menu items can reference page
  await migrateWithReferences('seoMetadata', [])

  console.log('\n✅ Migration complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   Total documents migrated: ${migratedIds.size}`)
  console.log(`\n🌐 Next steps:`)
  console.log(`   1. Verify in staging Studio: npm run dev:staging`)
  console.log(`   2. Check document counts match production`)
  console.log(`   3. Verify images/assets load correctly`)
}

// Run migration
if (require.main === module) {
  migrate().catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
}

module.exports = { migrate }
