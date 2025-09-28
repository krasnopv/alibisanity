import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
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
            // Films Group
            S.listItem()
              .title('Films')
              .icon(() => '🎬')
              .child(
                S.list()
                  .title('Films')
                  .items([
                    S.listItem()
                      .title('All Films')
                      .id('all-films')
                      .icon(() => '🎬')
                      .child(S.documentList().id('all-films-list').filter('_type == "film"')),
                    S.listItem()
                      .title('Categories')
                      .id('categories')
                      .icon(() => '📂')
                      .child(S.documentList().id('categories-list').filter('_type == "category"')),
                  ])
              ),
            // Awards
            S.listItem()
              .title('Awards')
              .icon(() => '🏆')
              .id('awards')
              .child(S.documentList().id('awards-list').filter('_type == "award"')),
            // Services
            S.listItem()
              .title('Services')
              .icon(() => '🛠️')
              .id('services')
              .child(S.documentList().id('services-list').filter('_type == "service"')),
            // Addresses
            S.listItem()
              .title('Addresses')
              .icon(() => '📍')
              .id('addresses')
              .child(S.documentList().id('addresses-list').filter('_type == "address"')),
          ])
    }), 
    visionTool()
    // duplicateActionV2() // Temporarily disabled to fix React hook error
  ],

  schema: {
    types: schemaTypes,
  },
})
