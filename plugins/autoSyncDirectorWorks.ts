import {definePlugin} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

export const autoSyncDirectorWorks = definePlugin({
  name: 'auto-sync-director-works',
  document: {
    actions: (prev, context) => {
      // Only modify actions for directorWork, director, and project types
      if (context.schemaType !== 'directorWork' && context.schemaType !== 'director' && context.schemaType !== 'project') {
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
              const client = context.getClient({apiVersion: '2023-01-01'})
              
              // Capture the draft data BEFORE publishing (to preserve manual selections)
              const draftData = props.draft
              const draftId = draftData?._id || props.published?._id
              const publishedId = draftId?.replace('drafts.', '')
              
              // Call original onHandle to publish
              if (originalResult.onHandle) {
                await originalResult.onHandle()
              }
              
              // Wait a moment for Sanity to fully commit the document
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Fetch the published document
              const doc = await client.fetch(
                `*[_id == "${publishedId}"][0]`
              )
              
              // For directors, use draft data if available to preserve manual selections
              if (context.schemaType === 'director' && draftData) {
                const docWithDraftWorks = {
                  ...doc,
                  works: draftData.works || doc.works
                }
                await syncDirector(client, docWithDraftWorks)
              } else {
              // Sync based on document type
              if (context.schemaType === 'directorWork') {
                await syncDirectorWork(client, doc)
              } else if (context.schemaType === 'director') {
                await syncDirector(client, doc)
                } else if (context.schemaType === 'project') {
                  await syncProject(client, doc)
                }
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
  // When a director is published, sync their works and update Projects
  const directorId = doc._id
  
  // Preserve the manually selected works from the document
  const manualWorks = doc.works && Array.isArray(doc.works) 
    ? doc.works.filter((work: any) => work._ref).map((work: any) => ({
        _type: 'reference',
        _ref: work._ref,
        _key: work._key || work._ref
      }))
    : []
  
  // Get all directorWorks that reference this director (auto-synced)
  const autoSyncedDirectorWorks = await client.fetch(
      `*[_type == "directorWork" && !(_id in path("drafts.**")) && references("${directorId}")]`
    )
    
  // Get all work references from manual selection
  const manualWorkRefs = manualWorks.map((w: any) => w._ref)
  
  // Fetch the actual documents to determine their type
  const manualWorkDocs = manualWorkRefs.length > 0 
    ? await client.fetch(
        `*[_id in ${JSON.stringify(manualWorkRefs)} && !(_id in path("drafts.**"))]`
      )
    : []
  
  // Separate projects and directorWorks from manual selection
  const projectRefs = manualWorkDocs
    .filter((work: any) => work._type === 'project')
    .map((work: any) => work._id)
  
  // Update all Projects to reference this director
  for (const projectRef of projectRefs) {
    try {
      await client.patch(projectRef).set({
        director: {
          _type: 'reference',
          _ref: directorId
        }
      }).commit()
    } catch (error) {
      console.error(`Error syncing project ${projectRef}:`, error)
    }
  }
  
  // Create a map of manually selected works by ref for deduplication
  const manualWorksMap = new Map(manualWorks.map((w: any) => [w._ref, w]))
  
  // Add auto-synced directorWorks that aren't already in manual selection
  const autoSyncedWorks = autoSyncedDirectorWorks
    .filter((work: any) => !manualWorksMap.has(work._id))
    .map((work: any) => ({
        _type: 'reference',
        _ref: work._id,
        _key: work._id
      }))
  
  // Combine: preserve manual selection + add auto-synced directorWorks
  const allWorks = [...manualWorks, ...autoSyncedWorks]
  
  // Only update if there are changes to avoid unnecessary writes
  await client.patch(directorId).set({
    works: allWorks
  }).commit()
}

async function syncProject(client: any, doc: any) {
  // When a project is published, find directors that have this project in their works
  // and ensure the project references them
  if (doc && doc._id) {
    const projectId = doc._id
    
    // Find all directors that have this project in their works array
    // We need to check the works array for references to this project
    const allDirectors = await client.fetch(
      `*[_type == "director" && !(_id in path("drafts.**"))]`
    )
    
    const directorsWithThisProject = allDirectors
      .filter((director: any) => 
        director.works && 
        Array.isArray(director.works) && 
        director.works.some((work: any) => work._ref === projectId)
      )
      .map((director: any) => director._id)
    
    // Update the project to reference the first director found
    // (Projects can only reference one director based on the schema)
    if (directorsWithThisProject.length > 0) {
      const directorId = directorsWithThisProject[0]
      try {
        await client.patch(projectId).set({
          director: {
            _type: 'reference',
            _ref: directorId
          }
    }).commit()
      } catch (error) {
        console.error(`Error syncing project director reference:`, error)
      }
    }
  }
}
