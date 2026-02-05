#!/usr/bin/env node

/**
 * Migration script to copy newly created Studios (and their dependencies)
 * from staging dataset to production dataset.
 *
 * "Newly created" = Studios that exist in staging but not in production (by _id).
 * Also migrates any address documents referenced by those studios that exist
 * in staging but not in production, and all referenced image/file assets.
 *
 * Usage:
 *   export SANITY_API_TOKEN=your-token
 *   npm run migrate:studios-to-production
 *
 * Options (env):
 *   MIGRATE_ALL_STUDIOS=1  Migrate all staging studios into production (overwrite/create)
 */

const { createClient } = require('@sanity/client')

const PROJECT_ID = 'srer6l4b'
const API_VERSION = '2023-01-01'

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_STUDIO_API_TOKEN
const migrateAll = process.env.MIGRATE_ALL_STUDIOS === '1'

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

async function migrateAddressesToProduction(idsToMigrate) {
  if (idsToMigrate.size === 0) return 0
  console.log(`\n📦 Migrating ${idsToMigrate.size} address(es)...`)
  const docs = await stagingClient.fetch(
    `*[_type == "address" && _id in $ids]`,
    { ids: Array.from(idsToMigrate) }
  )
  let n = 0
  for (const doc of docs) {
    try {
      await migrateDocumentById(productionClient, doc)
      const label = doc.city || doc.street || doc._id
      console.log(`   ✓ ${label}`)
      n++
    } catch (e) {
      console.error(`   ✗ ${doc._id}: ${e.message}`)
    }
  }
  console.log(`   ✅ ${n} address(es) migrated`)
  return n
}

async function migrateStudiosToProduction(studios) {
  if (studios.length === 0) return 0
  console.log(`\n📦 Migrating ${studios.length} studio(s)...`)
  let n = 0
  for (const doc of studios) {
    try {
      await migrateDocumentById(productionClient, doc)
      console.log(`   ✓ ${doc.title || doc._id}`)
      n++
    } catch (e) {
      console.error(`   ✗ ${doc._id}: ${e.message}`)
    }
  }
  console.log(`   ✅ ${n} studio(s) migrated`)
  return n
}

function collectSingleRef(doc, refKey) {
  const ref = doc[refKey]
  if (!ref) return null
  if (typeof ref === 'string') return ref
  if (ref && ref._ref) return ref._ref
  return null
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

  console.log('\n🖼️  Migrating assets (images and files) referenced by studios...')
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
  console.log('🚀 Migrating Studios from Staging → Production\n')
  console.log(`Project: ${PROJECT_ID}`)
  console.log(migrateAll ? 'Mode: All staging studios (create or overwrite)\n' : 'Mode: Newly created only (in staging, not in production)\n')

  const prodStudioIds = await getExistingIds(productionClient, 'studio')
  const prodAddressIds = await getExistingIds(productionClient, 'address')

  let stagingStudios
  if (migrateAll) {
    stagingStudios = await stagingClient.fetch(`*[_type == "studio"]`)
  } else {
    const stagingStudioIds = await stagingClient.fetch(`*[_type == "studio"]._id`)
    const newIds = stagingStudioIds.filter((id) => !prodStudioIds.has(id))
    if (newIds.length === 0) {
      console.log('✅ No new studios in staging to migrate.')
      return
    }
    stagingStudios = await stagingClient.fetch(
      `*[_type == "studio" && _id in $ids]`,
      { ids: newIds }
    )
  }

  if (!stagingStudios || stagingStudios.length === 0) {
    console.log('✅ No studios to migrate.')
    return
  }

  console.log(`Found ${stagingStudios.length} studio(s) to migrate.`)

  const addressRefs = new Set()
  for (const s of stagingStudios) {
    const ref = collectSingleRef(s, 'address')
    if (ref) addressRefs.add(ref)
  }
  const newAddressIds = [...addressRefs].filter((id) => !prodAddressIds.has(id))

  const assetRefs = new Set()
  stagingStudios.forEach((s) => collectAssetRefs(s, assetRefs))
  await migrateAssetsToProduction(assetRefs)

  await migrateAddressesToProduction(new Set(newAddressIds))
  await migrateStudiosToProduction(stagingStudios)

  console.log('\n✅ Migration complete.')
  console.log('\n🌐 Next steps:')
  console.log('   1. Verify in Production Studio')
  console.log('   2. Check studio pages and address references')
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  })
}

module.exports = { migrate }
