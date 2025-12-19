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
      },
      description: 'URL-friendly identifier for this service. Without a slug, the service page will not be accessible.',
      validation: (Rule) => Rule.custom((value) => {
        if (!value || !value.current) {
          return 'Without a slug, the service page will not be accessible on the website.'
        }
        return true
      }).warning()
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
      name: 'heroVideoLink',
      title: 'Hero Video Link',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Video Type',
          type: 'string',
          options: {
            list: [
              { title: 'Vimeo', value: 'vimeo' },
              { title: 'YouTube', value: 'youtube' },
              { title: 'Custom', value: 'custom' }
            ],
            layout: 'radio'
          },
          validation: (Rule) => Rule.required(),
          initialValue: 'vimeo',
          description: 'Select the video platform or custom link'
        },
        {
          name: 'url',
          title: 'Video URL',
          type: 'url',
          validation: (Rule) => Rule.custom((value, context) => {
            const parent = context.parent as any
            if (!parent?.type) {
              return true
            }
            if (!value || typeof value !== 'string') {
              return 'Video URL is required'
            }
            if (parent.type === 'vimeo' && !value.includes('vimeo.com')) {
              return 'Please enter a valid Vimeo URL'
            }
            if (parent.type === 'youtube' && !value.includes('youtube.com') && !value.includes('youtu.be')) {
              return 'Please enter a valid YouTube URL'
            }
            return true
          }),
          description: 'Enter the video URL (Vimeo, YouTube, or custom link)'
        }
      ],
      description: 'Link to a video from Vimeo, YouTube, or a custom source'
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
          name: 'reel',
          title: 'Reel',
          fields: [
            {
              name: 'thumbnail',
              title: 'Thumbnail',
              type: 'image',
              options: {
                hotspot: true
              },
              fields: [
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                  description: 'Caption for the thumbnail image'
                }
              ],
              validation: (Rule) => Rule.required()
            },
            {
              name: 'type',
              title: 'Video Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Vimeo', value: 'vimeo' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Custom', value: 'custom' }
                ],
                layout: 'radio'
              },
              validation: (Rule) => Rule.required(),
              initialValue: 'vimeo',
              description: 'Select the video platform or custom link'
            },
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any
                if (!parent?.type) {
                  return true
                }
                if (!value || typeof value !== 'string') {
                  return 'Video URL is required'
                }
                if (parent.type === 'vimeo' && !value.includes('vimeo.com')) {
                  return 'Please enter a valid Vimeo URL'
                }
                if (parent.type === 'youtube' && !value.includes('youtube.com') && !value.includes('youtu.be')) {
                  return 'Please enter a valid YouTube URL'
                }
                return true
              }),
              description: 'Enter the video URL (Vimeo, YouTube, or custom link)'
            }
          ],
          preview: {
            select: {
              thumbnail: 'thumbnail',
              caption: 'thumbnail.caption',
              type: 'type',
              url: 'url'
            },
            prepare({thumbnail, caption, type, url}) {
              return {
                title: caption || 'Reel',
                subtitle: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}${url ? ` - ${url}` : ''}`,
                media: thumbnail
              }
            }
          }
        }
      ],
      description: 'Collection of video reels for this service'
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