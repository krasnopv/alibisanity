import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'address',
  title: 'Office Address',
  type: 'document',
  fields: [
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'country',
      title: 'Country Code',
      type: 'string',
      options: {
        list: [
          {title: 'United States', value: 'us'},
          {title: 'United Kingdom', value: 'uk'},
          {title: 'France', value: 'fr'},
          {title: 'Finland', value: 'fi'},
          {title: 'Canada', value: 'ca'},
          {title: 'Spain', value: 'es'}
        ]
      },
      validation: (Rule) => Rule.required()
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
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ]
})