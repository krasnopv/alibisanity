// Simple duplication helper for Sanity Vision tool
// Copy and paste this into the Vision tool to duplicate documents

// First, get the document you want to duplicate
const documentId = "YOUR_DOCUMENT_ID_HERE" // Replace with actual document ID

// Fetch the document
const doc = await client.fetch(`*[_id == "${documentId}"][0]`)

if (!doc) {
  console.log("Document not found")
} else {
  console.log("Found document:", doc.title || doc.name)
  
  // Create a clean copy
  const duplicatedDoc = {
    _type: doc._type,
    title: doc.title ? `${doc.title} (Copy)` : undefined,
    name: doc.name ? `${doc.name} (Copy)` : undefined,
    description: doc.description,
    year: doc.year,
    category: doc.category,
    slug: doc.slug ? {
      ...doc.slug,
      current: doc.slug.current ? `${doc.slug.current}-copy` : undefined
    } : undefined,
    color: doc.color
  }
  
  // Remove undefined values
  Object.keys(duplicatedDoc).forEach(key => {
    if (duplicatedDoc[key] === undefined) {
      delete duplicatedDoc[key]
    }
  })
  
  console.log("Creating duplicate with data:", duplicatedDoc)
  
  // Create the new document
  const newDoc = await client.create(duplicatedDoc)
  console.log("Successfully created duplicate:", newDoc._id)
}
