import {defineField, defineType} from 'sanity'

export const menuItemType = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          {title: 'Custom URL', value: 'custom'},
          {title: 'Page', value: 'page'},
          {title: 'Expander (sub-items)', value: 'expander'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      description: 'For custom links (e.g. #services, #footer, or full URL)',
      hidden: ({parent}) => parent?.linkType !== 'custom',
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => parent?.linkType !== 'page',
    }),
    defineField({
      name: 'subItems',
      title: 'Sub-items',
      type: 'array',
      of: [{type: 'menuSubItem'}],
      hidden: ({parent}) => parent?.linkType !== 'expander',
    }),
  ],
  preview: {
    select: {label: 'label'},
    prepare: ({label}) => ({title: label || 'Menu item'}),
  },
})

export const menuSubItemType = defineType({
  name: 'menuSubItem',
  title: 'Menu Sub-item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          {title: 'Service', value: 'service'},
          {title: 'Custom URL', value: 'custom'},
          {title: 'Page', value: 'page'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      hidden: ({parent}) => parent?.linkType !== 'service',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      hidden: ({parent}) => parent?.linkType !== 'custom',
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => parent?.linkType !== 'page',
    }),
  ],
  preview: {
    select: {label: 'label'},
    prepare: ({label}) => ({title: label || 'Sub-item'}),
  },
})

export default defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "Main Menu Sidebar"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      of: [{type: 'menuItem'}],
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare: ({title}) => ({title: title || 'Menu'}),
  },
})
