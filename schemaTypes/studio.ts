import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
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
      name: 'logo',
      title: 'Logo',
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
        }
      ],
      description: 'Logo image for the studio'
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
      ]
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
      description: 'Main featured image for the studio. Recommended size: 1200x675px (16:9 aspect ratio). Images will be automatically optimized for web display.'
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'reference',
      to: [{type: 'address'}],
      description: 'Select the address for this studio'
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
      title: 'title',
      address: 'address.city',
      media: 'image'
    },
    prepare(selection) {
      const {title, address} = selection
      return {
        title: title,
        subtitle: address || 'No address'
      }
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



