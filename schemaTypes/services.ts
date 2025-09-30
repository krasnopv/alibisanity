import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Underline', value: 'underline'},
              {title: 'Code', value: 'code'}
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          }
        }
      ]
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Link to the service or related website'
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
    }),
    // Field 1: Tags
    defineField({
      name: 'tags',
      title: 'Service Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'serviceTag' }]
        }
      ],
      description: 'Tags associated with this service'
    }),

    // Field 2: Homepage Visibility
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      description: 'Display this service in the homepage services section',
      initialValue: false
    }),

    // Field 3: Homepage Order
    defineField({
      name: 'homepageOrder',
      title: 'Homepage Display Order',
      type: 'number',
      description: 'Order for homepage display (lower numbers appear first)',
      hidden: ({ document }) => !document?.showOnHomepage
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ]
})