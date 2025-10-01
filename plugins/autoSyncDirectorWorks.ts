import {definePlugin} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

export const autoSyncDirectorWorks = definePlugin({
  name: 'auto-sync-director-works',
  document: {
    actions: (prev, context) => {
      // Only modify actions for directorWork and director types
      if (context.schemaType !== 'directorWork' && context.schemaType !== 'director') {
        return prev
      }
      
      return prev.map((originalAction) => {
        // Only wrap the publish action
        if (originalAction.action !== 'publish') {
          return originalAction
        }
        
        // Create a wrapper component
        const WrappedAction: DocumentActionComponent = (props) => {
          const originalResult = originalAction(props)
          
          if (!originalResult) return null
          
          return {
            ...originalResult,
            onHandle: async () => {
              // Call original onHandle first
              if (originalResult.onHandle) {
                await originalResult.onHandle()
              }
              
              // Wait a moment for Sanity to fully commit the document
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Then sync
              const client = context.getClient({apiVersion: '2023-01-01'})
              // Use the published ID (without drafts. prefix) since draft is deleted after publish
              const draftId = props.draft?._id || props.published?._id
              const publishedId = draftId?.replace('drafts.', '')
              
              const doc = await client.fetch(
                `*[_id == "${publishedId}"][0]`
              )
              
              // Sync based on document type
              if (context.schemaType === 'directorWork') {
                await syncDirectorWork(client, doc)
              } else if (context.schemaType === 'director') {
                await syncDirector(client, doc)
              }
            }
          }
        }
        
        // Preserve the action property
        WrappedAction.action = 'publish'
        
        return WrappedAction
      })
    }
  }
})

async function syncDirectorWork(client: any, doc: any) {
  // When a directorWork is published, sync the director's works array
  if (doc && doc.director) {
    // Get all PUBLISHED works for this director (exclude drafts)
    const allWorks = await client.fetch(
      `*[_type == "directorWork" && !(_id in path("drafts.**")) && references("${doc.director._ref}")]`
    )
    
    // Update the director's works array with unique _key for each item
    await client.patch(doc.director._ref).set({
      works: allWorks.map((work: any) => ({
        _type: 'reference',
        _ref: work._id,
        _key: work._id
      }))
    }).commit()
  }
}

async function syncDirector(client: any, doc: any) {
  // When a director is published, we could sync all their works
  // For now, we'll just ensure all works pointing to this director are valid
  // Get all directors that currently have works
  const directorsWithWorks = await client.fetch(
    `*[_type == "director" && count(*[_type == "directorWork" && references(^._id)]) > 0]._id`
  )
  
  // Update each director's works array
  for (const directorId of directorsWithWorks) {
    const allWorks = await client.fetch(
      `*[_type == "directorWork" && !(_id in path("drafts.**")) && references("${directorId}")]`
    )
    
    await client.patch(directorId).set({
      works: allWorks.map((work: any) => ({
        _type: 'reference',
        _ref: work._id,
        _key: work._id
      }))
    }).commit()
  }
}
