import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
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
      name: 'role',
      title: 'Role/Position',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'industries',
      title: 'Industries',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'locations',
      title: 'Locations (City, Country)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'service',
      title: 'Service/Department',
      type: 'string',
      options: {
        list: [
          { title: 'Creative Direction', value: 'Creative Direction' },
          { title: 'Production', value: 'Production' },
          { title: 'Post Production', value: 'Post Production' },
          { title: 'Marketing', value: 'Marketing' },
          { title: 'Business Development', value: 'Business Development' },
          { title: 'Operations', value: 'Operations' }
        ]
      }
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
      description: 'Select services this team member is associated with for filtering'
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'LinkedIn' },
                  { title: 'Twitter', value: 'Twitter' },
                  { title: 'Instagram', value: 'Instagram' },
                  { title: 'Facebook', value: 'Facebook' },
                  { title: 'YouTube', value: 'YouTube' },
                  { title: 'Vimeo', value: 'Vimeo' },
                  { title: 'Behance', value: 'Behance' },
                  { title: 'Dribbble', value: 'Dribbble' },
                  { title: 'IMDB', value: 'IMDB' }
                ]
              }
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.uri({
                scheme: ['http', 'https']
              })
            },
            {
              name: 'icon',
              title: 'Icon Name',
              type: 'string',
              description: 'Icon identifier for the platform'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'bioTitle',
      title: 'Bio Title',
      type: 'string',
      description: 'Optional title for the bio section. If empty, the role will be used.'
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
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
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order for displaying team members (lower numbers appear first)'
    })
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'role',
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
