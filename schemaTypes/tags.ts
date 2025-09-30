import {defineField, defineType} from 'sanity'

export default defineType({

  name: 'serviceTag',
  title: 'Service Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tag Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'color',
      title: 'Tag Color',
      type: 'string',
      description: 'Hex color code (e.g., #FF0066)',
      validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/, {
        name: 'hex color',
        invert: true
      })
    }),
  ]
})