import {definePlugin} from 'sanity'

export const duplicateActionV2 = definePlugin({
  name: 'duplicate-action-v2',
  document: {
    actions: (prev, context) => {
      // Only add duplicate action for film and category documents
      if (!['film', 'category'].includes(context.schemaType)) {
        return prev
      }

      return [
        ...prev,
        {
          name: 'duplicate',
          title: 'Duplicate',
          icon: () => '📋',
          onHandle: () => {
            const {documentId, schemaType} = context
            
            // Use the document actions context to get the client
            const client = context.getClient({apiVersion: '2023-05-03'})
            
            // Create a simple duplication process
            client.fetch(`*[_id == "${documentId}"][0]`)
              .then((doc) => {
                if (!doc) {
                  alert('Document not found')
                  return
                }
                
                // Create a clean copy without system fields
                const cleanDoc = {
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
                Object.keys(cleanDoc).forEach(key => {
                  if (cleanDoc[key] === undefined) {
                    delete cleanDoc[key]
                  }
                })
                
                // Create the new document
                return client.create(cleanDoc)
              })
              .then((newDoc) => {
                if (newDoc) {
                  // Show success message
                  alert(`Successfully duplicated ${schemaType}!`)
                  // Refresh the page to show the new document
                  window.location.reload()
                }
              })
              .catch((error) => {
                console.error('Error duplicating document:', error)
                alert('Error duplicating document. Check console for details.')
              })
          }
        }
      ]
    }
  }
})
