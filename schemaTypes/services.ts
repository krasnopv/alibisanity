import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      }
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
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
        },
        {
          type: 'object',
          name: 'htmlBlock',
          title: 'HTML Block',
          fields: [
            {
              name: 'html',
              title: 'HTML Code',
              type: 'text',
              description: 'Enter raw HTML code here'
            }
          ],
          preview: {
            select: {
              title: 'html'
            },
            prepare(selection) {
              const {title} = selection
              return {
                title: title ? title.substring(0, 50) + '...' : 'HTML Block'
              }
            }
          }
        }
      ]
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
        },
        {
          type: 'object',
          name: 'htmlBlock',
          title: 'HTML Block',
          fields: [
            {
              name: 'html',
              title: 'HTML Code',
              type: 'text',
              description: 'Enter raw HTML code here'
            }
          ],
          preview: {
            select: {
              title: 'html'
            },
            prepare(selection) {
              const {title} = selection
              return {
                title: title ? title.substring(0, 50) + '...' : 'HTML Block'
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      description: 'Video file for the hero section'
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility'
        }
      ],
      description: 'Hero image for the service page'
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
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

    // Field 2: Featured Visibility
    defineField({
      name: 'featured',
      title: 'Featured (show in Menu and Homepage)',
      type: 'boolean',
      description: 'Display this service as featured',
      initialValue: false
    }),

    // Field 3: Show in Services
    defineField({
      name: 'showInServices',
      title: 'Show in Services',
      type: 'boolean',
      description: 'Display this service in the services section',
      initialValue: true
    }),

    // Field 4: Featured Order
    defineField({
      name: 'featuredOrder',
      title: 'Featured Display Order',
      type: 'number',
      description: 'Order for featured display (lower numbers appear first)',
      hidden: ({ document }) => !document?.featured
    }),

    // Field 4: Related Projects
    defineField({
      name: 'projects',
      title: 'Related Projects',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'project'}]
        }
      ],
      description: 'Projects that use this service'
    }),

    // Field 5: Related Sub-Services
    defineField({
      name: 'subServices',
      title: 'Related Sub-Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'subService'}]
        }
      ],
      description: 'Sub-services related to this service'
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