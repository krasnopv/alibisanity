import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'directorWork',
  title: 'Director Work',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Work Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle/Type',
      type: 'string',
      description: 'e.g., "Feature Film", "TV Series", "Short Film", "Documentary"'
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().min(1900).max(new Date().getFullYear())
    }),
    defineField({
      name: 'image',
      title: 'Work Image',
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
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'url',
      title: 'External URL',
      type: 'url',
      description: 'Link to IMDb, official website, or trailer'
    }),
    defineField({
      name: 'director',
      title: 'Director',
      type: 'reference',
      to: [{type: 'director'}],
      validation: (Rule) => Rule.required(),
      description: 'The director who created this work'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which works appear (lower numbers first)'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      year: 'year',
      directorName: 'director.name',
      media: 'image'
    },
    prepare(selection) {
      const {title, subtitle, year, directorName} = selection
      return {
        title: title,
        subtitle: `${subtitle} (${year}) - ${directorName || 'No director'}`
      }
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
