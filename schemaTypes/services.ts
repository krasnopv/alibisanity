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
      name: 'reels',
      title: 'Reels',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Video Type',
              type: 'string',
              options: {
                list: [
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Vimeo', value: 'vimeo' },
                  { title: 'Uploaded Video', value: 'upload' }
                ],
                layout: 'radio'
              },
              validation: (Rule) => Rule.required()
            },
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              hidden: ({parent}) => !parent?.type || parent?.type === 'upload',
              description: 'YouTube or Vimeo URL (e.g., https://www.youtube.com/watch?v=... or https://vimeo.com/...)',
              validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any
                if (parent?.type && parent.type !== 'upload' && !value) {
                  return 'Video URL is required for YouTube/Vimeo videos'
                }
                return true
              })
            },
            {
              name: 'videoFile',
              title: 'Uploaded Video',
              type: 'file',
              options: {
                accept: 'video/*'
              },
              hidden: ({parent}) => parent?.type !== 'upload',
              validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any
                if (parent?.type === 'upload' && !value) {
                  return 'Video file is required when uploading'
                }
                return true
              })
            },
            {
              name: 'thumbnail',
              title: 'Video Thumbnail',
              type: 'image',
              options: {
                hotspot: true,
                accept: 'image/*',
                storeOriginalFilename: true
              },
              fields: [
                {
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Alternative text for accessibility'
                },
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                  description: 'Optional caption for the thumbnail'
                }
              ],
              description: 'Custom thumbnail for the video. Recommended size: 800x450px (16:9 aspect ratio). Images will be automatically optimized for web display.',
              validation: (Rule) => Rule.custom((value: any) => {
                if (!value) return true // Optional field
                
                // Check if it's an image asset
                if (value.asset && value.asset._ref) {
                  return true
                }
                
                return 'Please upload a valid image file'
              })
            }
          ],
          preview: {
            select: {
              type: 'type',
              url: 'url',
              media: 'thumbnail'
            },
            prepare(selection) {
              const {type, url} = selection
              const typeLabel = type === 'youtube' ? 'YouTube' : type === 'vimeo' ? 'Vimeo' : 'Uploaded Video'
              return {
                title: typeLabel,
                subtitle: url || 'Video file',
                media: selection.media
              }
            }
          }
        }
      ],
      description: 'Add video reels - YouTube, Vimeo, or uploaded videos'
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