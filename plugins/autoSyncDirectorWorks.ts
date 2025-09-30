import {definePlugin} from 'sanity'

export const autoSyncDirectorWorks = definePlugin({
  name: 'auto-sync-director-works',
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'directorWork') {
        return prev.map((originalAction) => {
          if (originalAction.action === 'publish') {
            return {
              ...originalAction,
              onHandle: async () => {
                // Call the original publish action first
                await originalAction.onHandle?.()
                
                // Then sync the director's works
                const client = context.getClient({apiVersion: '2023-01-01'})
                const doc = await client.fetch(
                  `*[_id == "${context.draft?._id || context.published?._id}"][0]`
                )
                
                if (doc && doc.director) {
                  // Get all works for this director
                  const allWorks = await client.fetch(
                    `*[_type == "directorWork" && references("${doc.director._ref}")]`
                  )
                  
                  // Update the director's works array
                  await client.patch(doc.director._ref).set({
                    works: allWorks.map(work => ({_type: 'reference', _ref: work._id}))
                  }).commit()
                }
              }
            }
          }
          return originalAction
        })
      }
      return prev
    }
  }
})

