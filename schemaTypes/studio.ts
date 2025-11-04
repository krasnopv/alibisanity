import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Studio Name',
      type: 'string',
      description: 'Name of the studio',
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
      description: 'Rich text description of the studio',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Studio Image',
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
          description: 'Optional caption for the studio image'
        }
      ],
      description: 'Image for the studio. Images will be automatically optimized for web display.',
      validation: (Rule) => Rule.required().custom((value: any) => {
        if (!value) return 'Studio image is required'
        
        // Check if it's an image asset
        if (value.asset && value.asset._ref) {
          return true
        }
        
        return 'Please upload a valid image file'
      })
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order for displaying studios (lower numbers appear first)'
    })
  ],
  preview: {
    select: {
      title: 'name',
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

