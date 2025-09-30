import {definePlugin} from 'sanity'
import {Sync} from 'lucide-react'

export const updateDirectorWorks = definePlugin({
  name: 'update-director-works',
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'directorWork') {
        return [
          ...prev,
          {
            name: 'syncDirectorWorks',
            title: 'Sync Director Works',
            icon: Sync,
            onHandle: async () => {
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
                
                // Show success message
                context.snapshot.setToast({
                  title: 'Success',
                  description: `Updated director with ${allWorks.length} works`,
                  status: 'success'
                })
              }
            }
          }
        ]
      }
      return prev
    }
  }
})
