import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'option',
  title: 'Option',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Option Name',
      type: 'string',
      description: 'Name for this option (e.g., "Contact Email", "Site Name")',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Option'
      }
    }
  }
})
