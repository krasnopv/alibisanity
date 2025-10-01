import {definePlugin} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

export const autoSyncProjectServices = definePlugin({
  name: 'auto-sync-project-services',
  document: {
    actions: (prev, context) => {
      // Only modify actions for project and service types
      if (context.schemaType !== 'project' && context.schemaType !== 'service') {
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
              if (context.schemaType === 'project') {
                await syncProjectServices(client, doc)
              } else if (context.schemaType === 'service') {
                await syncServiceProjects(client, doc)
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

async function syncProjectServices(client: any, doc: any) {
  console.log('🔍 Currently selected services in project:', doc?.services?.map((s: any) => s._ref))
  
  // Get all services that currently have this project in their projects array
  const servicesWithThisProject = await client.fetch(
    `*[_type == "service" && references("${doc._id}")]._id`
  )
  
  console.log('🔍 Services that currently reference this project:', servicesWithThisProject)
  
  // Get the list of services this project currently references
  const currentServiceIds = doc?.services?.map((s: any) => s._ref) || []
  
  // Combine both lists - services currently selected AND services that used to have this project
  const allServicesToUpdate = [...new Set([...currentServiceIds, ...servicesWithThisProject])]
  
  console.log('🔄 Updating these services:', allServicesToUpdate)
  
  // For each service, update its projects array based on current reality
  for (const serviceId of allServicesToUpdate) {
    // Get all PUBLISHED projects that currently reference this service (exclude drafts)
    const allProjects = await client.fetch(
      `*[_type == "project" && !(_id in path("drafts.**")) && references("${serviceId}")]`
    )
    
    console.log(`📝 Service ${serviceId} will have ${allProjects.length} projects:`, allProjects.map((p: any) => p.title))
    
    // Update the service's projects array with unique _key for each item
    await client.patch(serviceId).set({
      projects: allProjects.map((project: any) => ({
        _type: 'reference',
        _ref: project._id,
        _key: project._id
      }))
    }).commit()
    
    console.log(`✅ Service ${serviceId} updated!`)
  }
  
  console.log('✨ All services synced!')
}

async function syncServiceProjects(client: any, doc: any) {
  if (doc && doc.projects && doc.projects.length > 0) {
    for (const projectRef of doc.projects) {
      // Get all PUBLISHED services that reference this project (exclude drafts)
      const allServices = await client.fetch(
        `*[_type == "service" && !(_id in path("drafts.**")) && references("${projectRef._ref}")]`
      )
      
      // Update the project's services array with unique _key for each item
      await client.patch(projectRef._ref).set({
        services: allServices.map((service: any) => ({
          _type: 'reference',
          _ref: service._id,
          _key: service._id // Use the service ID as the key for uniqueness
        }))
      }).commit()
    }
  }
}
