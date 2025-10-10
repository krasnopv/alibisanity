import {definePlugin} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

export const autoSyncWorkRelations = definePlugin({
  name: 'auto-sync-work-relations',
  document: {
    actions: (prev, context) => {
      // Only modify actions for project, service, and subService types
      if (!['project', 'service', 'subService'].includes(context.schemaType)) {
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
                await syncProjectRelations(client, doc)
              } else if (context.schemaType === 'service') {
                await syncServiceRelations(client, doc)
              } else if (context.schemaType === 'subService') {
                await syncSubServiceRelations(client, doc)
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

async function syncProjectRelations(client: any, doc: any) {
  // When a project is published, sync all related services and sub-services
  
  // Get all services that currently have this project in their projects array
  const servicesWithThisProject = await client.fetch(
    `*[_type == "service" && references("${doc._id}")]._id`
  )
  
  // Get all sub-services that currently have this project in their projects array
  const subServicesWithThisProject = await client.fetch(
    `*[_type == "subService" && references("${doc._id}")]._id`
  )
  
  // Get the list of services and sub-services this project currently references
  const currentServiceIds = doc?.services?.map((s: any) => s._ref) || []
  const currentSubServiceIds = doc?.subServices?.map((s: any) => s._ref) || []
  
  // Combine both lists - services/sub-services currently selected AND those that used to have this project
  const allServicesToUpdate = [...new Set([...currentServiceIds, ...servicesWithThisProject])]
  const allSubServicesToUpdate = [...new Set([...currentSubServiceIds, ...subServicesWithThisProject])]
  
  // Update services
  for (const serviceId of allServicesToUpdate) {
    const allProjects = await client.fetch(
      `*[_type == "project" && !(_id in path("drafts.**")) && references("${serviceId}")]`
    )
    
    await client.patch(serviceId).set({
      projects: allProjects.map((project: any) => ({
        _type: 'reference',
        _ref: project._id,
        _key: project._id
      }))
    }).commit()
  }
  
  // Update sub-services
  for (const subServiceId of allSubServicesToUpdate) {
    const allProjects = await client.fetch(
      `*[_type == "project" && !(_id in path("drafts.**")) && references("${subServiceId}")]`
    )
    
    await client.patch(subServiceId).set({
      projects: allProjects.map((project: any) => ({
        _type: 'reference',
        _ref: project._id,
        _key: project._id
      }))
    }).commit()
  }
}

async function syncServiceRelations(client: any, doc: any) {
  // When a service is published, sync all related projects and sub-services
  
  // Get all projects that currently have this service in their services array
  const projectsWithThisService = await client.fetch(
    `*[_type == "project" && references("${doc._id}")]._id`
  )
  
  // Get all sub-services that currently have this service in their services array
  const subServicesWithThisService = await client.fetch(
    `*[_type == "subService" && references("${doc._id}")]._id`
  )
  
  // Get the list of projects and sub-services this service currently references
  const currentProjectIds = doc?.projects?.map((p: any) => p._ref) || []
  const currentSubServiceIds = doc?.subServices?.map((s: any) => s._ref) || []
  
  // Combine both lists
  const allProjectsToUpdate = [...new Set([...currentProjectIds, ...projectsWithThisService])]
  const allSubServicesToUpdate = [...new Set([...currentSubServiceIds, ...subServicesWithThisService])]
  
  // Update projects
  for (const projectId of allProjectsToUpdate) {
    const allServices = await client.fetch(
      `*[_type == "service" && !(_id in path("drafts.**")) && references("${projectId}")]`
    )
    
    await client.patch(projectId).set({
      services: allServices.map((service: any) => ({
        _type: 'reference',
        _ref: service._id,
        _key: service._id
      }))
    }).commit()
  }
  
  // Update sub-services
  for (const subServiceId of allSubServicesToUpdate) {
    const allServices = await client.fetch(
      `*[_type == "service" && !(_id in path("drafts.**")) && references("${subServiceId}")]`
    )
    
    await client.patch(subServiceId).set({
      services: allServices.map((service: any) => ({
        _type: 'reference',
        _ref: service._id,
        _key: service._id
      }))
    }).commit()
  }
}

async function syncSubServiceRelations(client: any, doc: any) {
  // When a sub-service is published, sync all related projects and services
  
  // Get all projects that currently have this sub-service in their subServices array
  const projectsWithThisSubService = await client.fetch(
    `*[_type == "project" && references("${doc._id}")]._id`
  )
  
  // Get all services that currently have this sub-service in their subServices array
  const servicesWithThisSubService = await client.fetch(
    `*[_type == "service" && references("${doc._id}")]._id`
  )
  
  // Get the list of projects and services this sub-service currently references
  const currentProjectIds = doc?.projects?.map((p: any) => p._ref) || []
  const currentServiceIds = doc?.services?.map((s: any) => s._ref) || []
  
  // Combine both lists
  const allProjectsToUpdate = [...new Set([...currentProjectIds, ...projectsWithThisSubService])]
  const allServicesToUpdate = [...new Set([...currentServiceIds, ...servicesWithThisSubService])]
  
  // Update projects
  for (const projectId of allProjectsToUpdate) {
    const allSubServices = await client.fetch(
      `*[_type == "subService" && !(_id in path("drafts.**")) && references("${projectId}")]`
    )
    
    await client.patch(projectId).set({
      subServices: allSubServices.map((subService: any) => ({
        _type: 'reference',
        _ref: subService._id,
        _key: subService._id
      }))
    }).commit()
  }
  
  // Update services
  for (const serviceId of allServicesToUpdate) {
    const allSubServices = await client.fetch(
      `*[_type == "subService" && !(_id in path("drafts.**")) && references("${serviceId}")]`
    )
    
    await client.patch(serviceId).set({
      subServices: allSubServices.map((subService: any) => ({
        _type: 'reference',
        _ref: subService._id,
        _key: subService._id
      }))
    }).commit()
  }
}






