import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Film Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color code for the category (e.g., #FF0066)'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
    }),
    defineField({
      name: 'films',
      title: 'Films in this Category',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'film'}]
        }
      ],
      description: 'Films that belong to this category (automatically populated)'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      filmsCount: 'films.length'
    },
    prepare(selection) {
      const {title, subtitle, filmsCount} = selection
      return {
        title: title,
        subtitle: `${subtitle || 'No description'} • ${filmsCount || 0} films`
      }
    }
  }
})