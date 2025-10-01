import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'fullTitle',
      title: 'Full Title',
      type: 'string',
      description: 'Complete title for detailed view',
      validation: (Rule) => Rule.required(),
      options: {
        layout: 'dropdown'
      }
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
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
            {title: 'H1', value: 'h1'},
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
              {title: 'Emphasis', value: 'em'}
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              }
            ]
          }
        }
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
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
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'videoTrailer',
      title: 'Video Trailer',
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
          description: 'Custom thumbnail for the video (optional)'
        }
      ],
      description: 'Add a video trailer for the project - YouTube, Vimeo, or uploaded video'
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'role',
              title: 'Role',
              type: 'string',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'person',
              title: 'Person',
              type: 'object',
              fields: [
                {
                  name: 'type',
                  title: 'Person Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Team Member', value: 'teamMember' },
                      { title: 'Manual Entry', value: 'manual' }
                    ],
                    layout: 'radio'
                  },
                  validation: (Rule) => Rule.required()
                },
                {
                  name: 'teamMember',
                  title: 'Team Member',
                  type: 'reference',
                  to: [{type: 'teamMember'}],
                  hidden: ({parent}) => parent?.type !== 'teamMember',
                  validation: (Rule) => Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.type === 'teamMember' && !value) {
                      return 'Team member is required when team member is selected'
                    }
                    return true
                  })
                },
                {
                  name: 'manualName',
                  title: 'Manual Name',
                  type: 'string',
                  hidden: ({parent}) => parent?.type !== 'manual',
                  validation: (Rule) => Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.type === 'manual' && !value) {
                      return 'Manual name is required when manual entry is selected'
                    }
                    return true
                  })
                }
              ]
            },
            {
              name: 'award',
              title: 'Award',
              type: 'reference',
              to: [{type: 'award'}],
              description: 'Optional award for this credit'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'images',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
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
          ]
        }
      ],
      description: 'Additional images for the project gallery'
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'project'}]
        }
      ],
      description: 'Select related projects to show at the bottom'
    }),
    defineField({
      name: 'services',
      title: 'Related Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'service'}]
        }
      ],
      description: 'Select services related to this project'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order for displaying projects (lower numbers appear first)'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Check to show this project on the /immersive page as a featured project',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'image'
    }
  },
  orderings: [
    {
      title: 'Order',
      name: 'order',
      by: [
        { field: 'order', direction: 'asc' },
        { field: '_createdAt', direction: 'asc' }
      ]
    }
  ]
})
