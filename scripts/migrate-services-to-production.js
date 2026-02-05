#!/usr/bin/env node

/**
 * Migration script to copy newly created Services (and their dependencies)
 * from staging dataset to production dataset.
 *
 * "Newly created" = Services that exist in staging but not in production (by _id).
 * Also migrates any serviceTags and subServices referenced by those services
 * that exist in staging but not in production.
 *
 * Usage:
 *   export SANITY_API_TOKEN=your-token
 *   npm run migrate:services-to-production
 *
 * Options (env):
 *   MIGRATE_ALL_SERVICES=1  Migrate all staging services into production (overwrite/create)
 */

const { createClient } = require('@sanity/client')

const PROJECT_ID = 'srer6l4b'
const API_VERSION = '2023-01-01'

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_STUDIO_API_TOKEN
const migrateAll = process.env.MIGRATE_ALL_SERVICES === '1'

if (!token) {
  console.error('❌ Error: SANITY_API_TOKEN environment variable is required')
  console.error('   Get your token from: https://sanity.io/manage')
  process.exit(1)
}

const stagingClient = createClient({
  projectId: PROJECT_ID,
  dataset: 'staging',
  useCdn: false,
  apiVersion: API_VERSION,
  token: token,
})

const productionClient = createClient({
  projectId: PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: API_VERSION,
  token: token,
})

function generateKey() {
  return Math.random().toString(36).slice(2, 11)
}

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

async function getExistingIds(client, type) {
  const ids = await client.fetch(`*[_type == $type]._id`, { type })
  return new Set(ids)
}

async function migrateDocumentById(client, doc) {
  const { _rev, _createdAt, _updatedAt, ...docData } = doc
  const normalized = normalizeReferenceArrays(docData)
  await client.createOrReplace({
    ...normalized,
    _type: doc._type,
    _id: doc._id,
  })
}

async function migrateServiceTagsToProduction(idsToMigrate) {
  if (idsToMigrate.size === 0) return 0
  console.log(`\n📦 Migrating ${idsToMigrate.size} serviceTag(s)...`)
  const docs = await stagingClient.fetch(
    `*[_type == "serviceTag" && _id in $ids]`,
    { ids: Array.from(idsToMigrate) }
  )
  let n = 0
  for (const doc of docs) {
    try {
      await migrateDocumentById(productionClient, doc)
      console.log(`   ✓ ${doc.title || doc._id}`)
      n++
    } catch (e) {
      console.error(`   ✗ ${doc._id}: ${e.message}`)
    }
  }
  console.log(`   ✅ ${n} serviceTag(s) migrated`)
  return n
}

async function migrateSubServicesToProduction(idsToMigrate) {
  if (idsToMigrate.size === 0) return 0
  console.log(`\n📦 Migrating ${idsToMigrate.size} subService(s)...`)
  const docs = await stagingClient.fetch(
    `*[_type == "subService" && _id in $ids]`,
    { ids: Array.from(idsToMigrate) }
  )
  let n = 0
  for (const doc of docs) {
    try {
      await migrateDocumentById(productionClient, doc)
      console.log(`   ✓ ${doc.title || doc._id}`)
      n++
    } catch (e) {
      console.error(`   ✗ ${doc._id}: ${e.message}`)
    }
  }
  console.log(`   ✅ ${n} subService(s) migrated`)
  return n
}

async function migrateServicesToProduction(services) {
  if (services.length === 0) return 0
  console.log(`\n📦 Migrating ${services.length} service(s)...`)
  let n = 0
  for (const doc of services) {
    try {
      await migrateDocumentById(productionClient, doc)
      console.log(`   ✓ ${doc.title || doc._id}`)
      n++
    } catch (e) {
      console.error(`   ✗ ${doc._id}: ${e.message}`)
    }
  }
  console.log(`   ✅ ${n} service(s) migrated`)
  return n
}

function collectRefIds(doc, refKey) {
  const set = new Set()
  const refs = doc[refKey]
  if (!Array.isArray(refs)) return set
  for (const item of refs) {
    const ref = item && (item._ref || item)
    if (typeof ref === 'string') set.add(ref)
  }
  return set
}

/** Recursively collect all asset refs (image-*, file-*) from an object */
function collectAssetRefs(obj, out) {
  if (obj === null || obj === undefined) return
  if (Array.isArray(obj)) {
    obj.forEach((item) => collectAssetRefs(item, out))
    return
  }
  if (typeof obj !== 'object') return
  if (obj._type === 'reference' && typeof obj._ref === 'string') {
    if (obj._ref.startsWith('image-') || obj._ref.startsWith('file-')) out.add(obj._ref)
    return
  }
  if (obj.asset && obj.asset._ref) {
    const ref = obj.asset._ref
    if (ref.startsWith('image-') || ref.startsWith('file-')) out.add(ref)
  }
  for (const value of Object.values(obj)) collectAssetRefs(value, out)
}

async function migrateAssetsToProduction(assetIds) {
  const imageIds = [...assetIds].filter((id) => id.startsWith('image-'))
  const fileIds = [...assetIds].filter((id) => id.startsWith('file-'))
  if (imageIds.length === 0 && fileIds.length === 0) return

  console.log('\n🖼️  Migrating assets (images and files) referenced by services...')
  let total = 0

  for (const id of imageIds) {
    try {
      const asset = await stagingClient.fetch(`*[_id == $id][0]`, { id })
      if (asset) {
        const { _rev, _createdAt, _updatedAt, ...data } = asset
        await productionClient.createOrReplace({ ...data, _type: 'sanity.imageAsset', _id: asset._id })
        total++
      }
    } catch (e) {
      console.error(`   ✗ ${id}: ${e.message}`)
    }
  }
  for (const id of fileIds) {
    try {
      const asset = await stagingClient.fetch(`*[_id == $id][0]`, { id })
      if (asset) {
        const { _rev, _createdAt, _updatedAt, ...data } = asset
        await productionClient.createOrReplace({ ...data, _type: 'sanity.fileAsset', _id: asset._id })
        total++
      }
    } catch (e) {
      console.error(`   ✗ ${id}: ${e.message}`)
    }
  }
  console.log(`   ✅ ${total} asset(s) migrated`)
}

async function migrate() {
  console.log('🚀 Migrating Services from Staging → Production\n')
  console.log(`Project: ${PROJECT_ID}`)
  console.log(migrateAll ? 'Mode: All staging services (create or overwrite)\n' : 'Mode: Newly created only (in staging, not in production)\n')

  const prodServiceIds = await getExistingIds(productionClient, 'service')
  const prodTagIds = await getExistingIds(productionClient, 'serviceTag')
  const prodSubIds = await getExistingIds(productionClient, 'subService')

  let stagingServices
  if (migrateAll) {
    stagingServices = await stagingClient.fetch(`*[_type == "service"]`)
  } else {
    const stagingServiceIds = await stagingClient.fetch(`*[_type == "service"]._id`)
    const newIds = stagingServiceIds.filter((id) => !prodServiceIds.has(id))
    if (newIds.length === 0) {
      console.log('✅ No new services in staging to migrate.')
      return
    }
    stagingServices = await stagingClient.fetch(
      `*[_type == "service" && _id in $ids]`,
      { ids: newIds }
    )
  }

  if (!stagingServices || stagingServices.length === 0) {
    console.log('✅ No services to migrate.')
    return
  }

  console.log(`Found ${stagingServices.length} service(s) to migrate.`)

  const tagRefs = new Set()
  const subRefs = new Set()
  for (const s of stagingServices) {
    collectRefIds(s, 'tags').forEach((id) => tagRefs.add(id))
    collectRefIds(s, 'subServices').forEach((id) => subRefs.add(id))
  }

  const newTagIds = [...tagRefs].filter((id) => !prodTagIds.has(id))
  const newSubIds = [...subRefs].filter((id) => !prodSubIds.has(id))

  // Collect asset refs from services and from subServices we're migrating
  const assetRefs = new Set()
  stagingServices.forEach((s) => collectAssetRefs(s, assetRefs))
  if (newSubIds.length > 0) {
    const stagingSubServices = await stagingClient.fetch(
      `*[_type == "subService" && _id in $ids]`,
      { ids: newSubIds }
    )
    stagingSubServices.forEach((s) => collectAssetRefs(s, assetRefs))
  }
  await migrateAssetsToProduction(assetRefs)

  await migrateServiceTagsToProduction(new Set(newTagIds))
  await migrateSubServicesToProduction(new Set(newSubIds))
  await migrateServicesToProduction(stagingServices)

  console.log('\n✅ Migration complete.')
  console.log('\n🌐 Next steps:')
  console.log('   1. Verify in Production Studio')
  console.log('   2. Check service pages and related projects/sub-services')
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  })
}

module.exports = { migrate }
