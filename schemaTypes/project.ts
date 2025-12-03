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
      name: 'director',
      title: 'Related Director',
      type: 'reference',
      to: [{type: 'director'}],
      description: 'Director associated with this project. Automatically synced when this project is added to a director\'s works'
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
      title: 'Featured Image',
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
          description: 'Optional caption for the featured image'
        }
      ],
      description: 'Main featured image for the project. Recommended size: 1200x675px (16:9 aspect ratio). Images will be automatically optimized for web display.',
      validation: (Rule) => Rule.required().custom((value: any) => {
        if (!value) return 'Featured image is required'
        
        // Check if it's an image asset
        if (value.asset && value.asset._ref) {
          return true
        }
        
        return 'Please upload a valid image file'
      })
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
            hotspot: true,
            accept: 'image/*',
            // Store original filename for reference
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
              name: 'people',
              title: 'People',
              type: 'array',
              of: [
                {
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
                }
              ],
              description: 'Add multiple people for this credit'
            },
          ]
        }
      ]
    }),
    defineField({
      name: 'awards',
      title: 'Awards',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'award'}]
        }
      ],
      description: 'Select awards won by this project'
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
      name: 'subServices',
      title: 'Related Sub-Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'subService'}]
        }
      ],
      description: 'Select sub-services related to this project'
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
    }),
    defineField({
      name: 'hideProject',
      title: 'Hide Project',
      type: 'boolean',
      description: 'Check to hide this project from listings',
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
