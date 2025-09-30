import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'trophy',
  title: 'Trophy/Award',
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
      validation: (Rule) => Rule.required().min(1900).max(new Date().getFullYear())
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Best Director', value: 'best-director'},
          {title: 'Outstanding Director', value: 'outstanding-director'},
          {title: 'Best Film', value: 'best-film'},
          {title: 'Best Short Film', value: 'best-short-film'},
          {title: 'Best Documentary', value: 'best-documentary'},
          {title: 'Other', value: 'other'}
        ]
      }
    }),
    defineField({
      name: 'icon',
      title: 'Trophy Icon',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility'
        }
      ]
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which trophies appear (lower numbers first)'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'year',
      media: 'icon'
    }
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    },
    {
      title: 'Year (Newest First)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }]
    }
  ]
})
