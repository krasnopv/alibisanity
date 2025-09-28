import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'award',
  title: 'Award',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Award Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear() + 1)
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Oscars', value: 'oscars'},
          {title: 'Emmys', value: 'emmys'},
          {title: 'BAFTA', value: 'bafta'},
          {title: 'Visual Effects Society', value: 'ves'},
          {title: 'Rose d\'Or', value: 'rose-dor'},
          {title: 'Royal Television Society', value: 'rts'},
          {title: 'Creative Circle', value: 'creative-circle'},
          {title: 'British Arrows', value: 'british-arrows'},
          {title: 'Clio', value: 'clio'},
          {title: 'LIA', value: 'lia'},
          {title: 'NYX Game Award', value: 'nyx'},
          {title: 'Webby', value: 'webby'},
          {title: 'Other', value: 'other'}
        ]
      }
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'icon',
      title: 'Icon Image',
      type: 'image',
      description: 'Upload an image file for the award icon',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'count',
      title: 'Count/Year',
      type: 'string',
      description: 'e.g., "x 2", "2023", or leave empty'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
    })
  ],
  orderings: [
    {
      title: 'Year (Newest First)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }]
    },
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ]
})