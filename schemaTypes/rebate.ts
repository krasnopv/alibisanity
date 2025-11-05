import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'rebate',
  title: 'Rebate',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Rebate Name',
      type: 'string',
      description: 'Name of the rebate (e.g., "Film Production Tax Credit", "Digital Media Rebate")',
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
      description: 'URL-friendly identifier',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'intro',
      title: 'Introduction Section',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          description: 'Main title for the rebate section'
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
                {title: 'H4', value: 'h4'},
                {title: 'H5', value: 'h5'},
                {title: 'H6', value: 'h6'},
              ],
              lists: [
                {title: 'Bullet', value: 'bullet'},
                {title: 'Number', value: 'number'}
              ],
              marks: {
                decorators: [
                  {title: 'Strong', value: 'strong'},
                  {title: 'Emphasis', value: 'em'},
                  {title: 'Code', value: 'code'}
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url'
                      }
                    ]
                  }
                ]
              }
            }
          ],
          description: 'Rich text description for the introduction'
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true
          },
          description: 'Optional image for the introduction section'
        })
      ]
    }),
    defineField({
      name: 'sections',
      title: 'Content Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'eligibleExpenses',
          title: 'Eligible Expenses Section',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Eligible expenses include:',
              description: 'Section title (default: "Eligible expenses include:")'
            }),
            defineField({
              name: 'points',
              title: 'List of Points',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'point',
                      title: 'Point',
                      type: 'string',
                      validation: (Rule) => Rule.required()
                    }),
                    defineField({
                      name: 'description',
                      title: 'Description',
                      type: 'text',
                      description: 'Optional detailed description for this point'
                    })
                  ],
                  preview: {
                    select: {
                      title: 'point'
                    }
                  }
                }
              ],
              description: 'List of eligible expenses'
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true
              },
              description: 'Optional image for this section'
            })
          ],
          preview: {
            select: {
              title: 'title'
            }
          }
        },
        {
          type: 'object',
          name: 'qualifyingRequirements',
          title: 'Qualifying Requirements Section',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Qualifying requirements',
              description: 'Section title (default: "Qualifying requirements")'
            }),
            defineField({
              name: 'points',
              title: 'List of Requirements',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'requirement',
                      title: 'Requirement',
                      type: 'string',
                      validation: (Rule) => Rule.required()
                    }),
                    defineField({
                      name: 'description',
                      title: 'Description',
                      type: 'text',
                      description: 'Optional detailed description for this requirement'
                    })
                  ],
                  preview: {
                    select: {
                      title: 'requirement'
                    }
                  }
                }
              ],
              description: 'List of qualifying requirements'
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true
              },
              description: 'Optional image for this section'
            })
          ],
          preview: {
            select: {
              title: 'title'
            }
          }
        },
        {
          type: 'object',
          name: 'howToApply',
          title: 'How to Apply Section',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'How to apply?',
              description: 'Section title (default: "How to apply?")'
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
                    {title: 'H4', value: 'h4'},
                    {title: 'H5', value: 'h5'},
                    {title: 'H6', value: 'h6'},
                  ],
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Number', value: 'number'}
                  ],
                  marks: {
                    decorators: [
                      {title: 'Strong', value: 'strong'},
                      {title: 'Emphasis', value: 'em'},
                      {title: 'Code', value: 'code'}
                    ],
                    annotations: [
                      {
                        title: 'URL',
                        name: 'link',
                        type: 'object',
                        fields: [
                          {
                            title: 'URL',
                            name: 'href',
                            type: 'url'
                          }
                        ]
                      }
                    ]
                  }
                }
              ],
              description: 'Rich text description for how to apply'
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true
              },
              description: 'Optional image for this section'
            })
          ],
          preview: {
            select: {
              title: 'title'
            }
          }
        },
        {
          type: 'object',
          name: 'customSection',
          title: 'Custom Content Section',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Custom section title'
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    {title: 'Normal', value: 'normal'},
                    {title: 'H1', value: 'h1'},
                    {title: 'H2', value: 'h2'},
                    {title: 'H3', value: 'h3'},
                    {title: 'H4', value: 'h4'},
                    {title: 'H5', value: 'h5'},
                    {title: 'H6', value: 'h6'},
                  ],
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Number', value: 'number'}
                  ],
                  marks: {
                    decorators: [
                      {title: 'Strong', value: 'strong'},
                      {title: 'Emphasis', value: 'em'},
                      {title: 'Code', value: 'code'}
                    ],
                    annotations: [
                      {
                        title: 'URL',
                        name: 'link',
                        type: 'object',
                        fields: [
                          {
                            title: 'URL',
                            name: 'href',
                            type: 'url'
                          }
                        ]
                      }
                    ]
                  }
                }
              ],
              description: 'Rich text content for custom section'
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true
              },
              description: 'Optional image for this section'
            })
          ],
          preview: {
            select: {
              title: 'title'
            }
          }
        }
      ],
      description: 'Content sections for this rebate'
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'SEO title for search engines'
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'SEO description for search engines'
        })
      ]
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order for displaying rebates (lower numbers appear first)'
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current'
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
