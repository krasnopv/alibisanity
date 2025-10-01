import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {autoSyncDirectorWorks} from './plugins/autoSyncDirectorWorks'
import {autoSyncProjectServices} from './plugins/autoSyncProjectServices'
import { 
  FileText, 
  Film, 
  Folder, 
  Trophy, 
  Wrench, 
  MapPin, 
  Tag, 
  User, 
  Award,
  Video,
  Users,
  Briefcase
} from 'lucide-react'
// import {duplicateActionV2} from './plugins/duplicateActionV2'

export default defineConfig({
  name: 'default',
  title: 'Alibi',

  projectId: 'srer6l4b',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Pages Group
            S.listItem()
            .title('Pages')
            .icon(FileText)
            .id('pages')
            .child(S.documentList().id('pages-list').filter('_type == "page"').apiVersion('2023-01-01')),

            // Films Group
            S.listItem()
              .title('Films')
              .icon(Film)
              .child(
                S.list()
                  .title('Films')
                  .items([
                    S.listItem()
                      .title('All Films')
                      .id('all-films')
                      .icon(Film)
                      .child(S.documentList().id('all-films-list').filter('_type == "film"').apiVersion('2023-01-01')),
                    S.listItem()
                      .title('Categories')
                      .id('categories')
                      .icon(Folder)
                      .child(S.documentList().id('categories-list').filter('_type == "category"').apiVersion('2023-01-01')),
                  ])
              ),
            // Awards
            S.listItem()
              .title('Awards')
              .icon(Trophy)
              .id('awards')
              .child(S.documentList().id('awards-list').filter('_type == "award"').apiVersion('2023-01-01')),
            // Our Work Group
            S.listItem()
              .title('Our Work')
              .icon(Briefcase)
              .child(
                S.list()
                  .title('Our Work')
                  .items([
                    S.listItem()
                      .title('Projects')
                      .id('projects')
                      .icon(Briefcase)
                      .child(S.documentList().id('projects-list').filter('_type == "project"').apiVersion('2023-01-01')),
                    S.listItem()
                      .title('Services')
                      .id('services')
                      .icon(Wrench)
                      .child(S.documentList().id('services-list').filter('_type == "service"').apiVersion('2023-01-01')),
                  ])
              ),
            // Addresses
            S.listItem()
              .title('Addresses')
              .icon(MapPin)
              .id('addresses')
              .child(S.documentList().id('addresses-list').filter('_type == "address"').apiVersion('2023-01-01')),
            // Tags
            S.listItem()
              .title('Tags')
              .icon(Tag)
              .id('tags')
              .child(S.documentList().id('tags-list').filter('_type == "serviceTag"').apiVersion('2023-01-01')),
            
            // Directors Group
            S.listItem()
              .title('Directors')
              .icon(User)
              .child(
                S.list()
                  .title('Directors')
                  .items([
                    S.listItem()
                      .title('All Directors')
                      .id('all-directors')
                      .icon(User)
                      .child(S.documentList().id('all-directors-list').filter('_type == "director"').apiVersion('2023-01-01')),
                    S.listItem()
                      .title('Trophies/Awards')
                      .id('trophies')
                      .icon(Award)
                      .child(S.documentList().id('trophies-list').filter('_type == "trophy"').apiVersion('2023-01-01')),
                    S.listItem()
                      .title('Director Works')
                      .id('director-works')
                      .icon(Video)
                      .child(S.documentList().id('director-works-list').filter('_type == "directorWork"').apiVersion('2023-01-01')),
                  ])
              ),
            
            // Team Members
            S.listItem()
              .title('Team Members')
              .icon(Users)
              .id('team-members')
              .child(S.documentList().id('team-members-list').filter('_type == "teamMember"').apiVersion('2023-01-01')),
            
          ])
    }), 
    visionTool(),
    // duplicateActionV2() // Temporarily disabled to fix React hook error
    autoSyncDirectorWorks(),
    autoSyncProjectServices()
  ],

  schema: {
    types: schemaTypes,
  },
})
