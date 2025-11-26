import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
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
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Used for SEO meta description'
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      description: 'Video file for the hero section'
    }),
    defineField({
      name: 'heroVideoPoster',
      title: 'Hero Video Poster',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility'
        }
      ],
      description: 'Poster image shown before video loads'
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Poster image shown before video loads'
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main heading for the hero section'
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 2,
      description: 'Subtitle text for the hero section'
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      of: [
        // Page Title section (toggle)
        {
          type: 'object',
          name: 'pageTitleSection',
          title: 'Page Title',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            {
              name: 'enabled',
              title: 'Enable',
              type: 'boolean',
              initialValue: true
            }
          ],
          preview: {
            select: { enabled: 'enabled' },
            prepare({enabled}) {
              return { title: 'Page Title', subtitle: enabled ? 'Enabled' : 'Disabled' }
            }
          }
        },
        // Grid section (select schema type)
        {
          type: 'object',
          name: 'gridSection',
          title: 'Grid',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            {
              name: 'schemaType',
              title: 'Schema Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Services', value: 'service' },
                  { title: 'Projects', value: 'project' },
                  { title: 'Sub-Services', value: 'subService' },
                  { title: 'Team Members', value: 'teamMember' },
                  { title: 'Films', value: 'film' },
                  { title: 'Awards', value: 'award' }
                ],
                layout: 'radio'
              },
              validation: (Rule) => Rule.required(),
              description: 'Select which schema type to display in the grid'
            },
            {
              name: 'filters',
              title: 'Filters (Optional)',
              type: 'object',
              fields: [
                {
                  name: 'featured',
                  title: 'Featured Only',
                  type: 'boolean',
                  description: 'Show only featured items (if schema supports it)'
                },
                {
                  name: 'limit',
                  title: 'Limit Results',
                  type: 'number',
                  description: 'Maximum number of items to display (leave empty for all)'
                }
              ],
              description: 'Optional filters to apply to the grid items'
            }
          ],
          preview: {
            select: { schemaType: 'schemaType' },
            prepare({schemaType}) {
              return { 
                title: 'Grid', 
                subtitle: schemaType ? `${schemaType.charAt(0).toUpperCase() + schemaType.slice(1)}s` : 'No schema selected' 
              }
            }
          }
        },
        // Text section (Title + WYSIWYG copy + URL)
        {
          type: 'object',
          name: 'textSection',
          title: 'Text Section',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'copy',
              title: 'Copy',
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
                    {title: 'Quote', value: 'blockquote'}
                  ],
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Number', value: 'number'}
                  ],
                  marks: {
                    decorators: [
                      {title: 'Strong', value: 'strong'},
                      {title: 'Emphasis', value: 'em'},
                      {title: 'Underline', value: 'underline'},
                      {title: 'Code', value: 'code'}
                    ],
                    annotations: [
                      {
                        title: 'URL',
                        name: 'link',
                        type: 'object',
                        fields: [
                          { title: 'URL', name: 'href', type: 'url' }
                        ]
                      }
                    ]
                  }
                }
              ]
            },
            {
              name: 'url',
              title: 'URL',
              type: 'object',
              fields: [
                {
                  name: 'type',
                  title: 'URL Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Internal Page', value: 'internal' },
                      { title: 'External URL', value: 'external' }
                    ],
                    layout: 'radio'
                  },
                  validation: (Rule) => Rule.required(),
                  initialValue: 'internal'
                },
                {
                  name: 'internalPage',
                  title: 'Internal Page',
                  type: 'reference',
                  to: [{type: 'page'}],
                  hidden: ({parent}) => parent?.type !== 'internal',
                  validation: (Rule) => Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.type === 'internal' && !value) {
                      return 'Internal page is required when internal is selected'
                    }
                    return true
                  })
                },
                {
                  name: 'externalUrl',
                  title: 'External URL',
                  type: 'url',
                  hidden: ({parent}) => parent?.type !== 'external',
                  validation: (Rule) => Rule.custom((value, context) => {
                    const parent = context.parent as any
                    if (parent?.type === 'external' && !value) {
                      return 'External URL is required when external is selected'
                    }
                    return true
                  })
                }
              ],
              description: 'Link to an internal page or external URL'
            }
          ],
          preview: {
            select: { title: 'title', url: 'url' },
            prepare({title, url}) {
              return { 
                title: 'Text Section', 
                subtitle: title || 'Untitled',
                media: url ? 'URL' : undefined
              }
            }
          }
        },
        // Films section (toggle with title/subtitle)
        {
          type: 'object',
          name: 'filmsSection',
          title: 'Films',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            {
              name: 'enabled',
              title: 'Enable',
              type: 'boolean',
              initialValue: true
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Section title for the films section'
            },
            {
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
              description: 'Section subtitle for the films section'
            }
          ],
          preview: {
            select: { enabled: 'enabled', title: 'title' },
            prepare({enabled, title}) {
              return { 
                title: 'Films', 
                subtitle: enabled ? (title || 'Enabled') : 'Disabled' 
              }
            }
          }
        },
        // Awards section (toggle with title/subtitle)
        {
          type: 'object',
          name: 'awardsSection',
          title: 'Awards',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            {
              name: 'enabled',
              title: 'Enable',
              type: 'boolean',
              initialValue: true
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Section title for the awards section'
            },
            {
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
              description: 'Section subtitle for the awards section'
            }
          ],
          preview: {
            select: { enabled: 'enabled', title: 'title' },
            prepare({enabled, title}) {
              return { 
                title: 'Awards', 
                subtitle: enabled ? (title || 'Enabled') : 'Disabled' 
              }
            }
          }
        },
        // CTA section
        {
          type: 'object',
          name: 'ctaSection',
          title: 'CTA Section',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            {
              name: 'title',
              title: 'Title',
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
                    {title: 'Quote', value: 'blockquote'}
                  ],
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Number', value: 'number'}
                  ],
                  marks: {
                    decorators: [
                      {title: 'Strong', value: 'strong'},
                      {title: 'Emphasis', value: 'em'},
                      {title: 'Underline', value: 'underline'},
                      {title: 'Code', value: 'code'}
                    ],
                    annotations: [
                      {
                        title: 'URL',
                        name: 'link',
                        type: 'object',
                        fields: [
                          { title: 'URL', name: 'href', type: 'url' }
                        ]
                      }
                    ]
                  }
                }
              ],
              validation: (Rule) => Rule.required(),
              description: 'Call-to-action title with rich text formatting'
            }
          ],
          preview: {
            select: { title: 'title' },
            prepare({title}) {
              const titleText = title?.[0]?.children?.[0]?.text || 'No title set'
              return { 
                title: 'CTA Section', 
                subtitle: titleText 
              }
            }
          }
        },
        // Get in Touch section
        {
          type: 'object',
          name: 'getInTouchSection',
          title: 'Get in Touch',
          fields: [
            {
              name: 'sectionId',
              title: 'Section ID',
              type: 'string',
              description: 'Unique identifier for this section (used for navigation and styling)'
            },
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string'
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
                    {title: 'Quote', value: 'blockquote'}
                  ],
                  lists: [
                    {title: 'Bullet', value: 'bullet'},
                    {title: 'Number', value: 'number'}
                  ],
                  marks: {
                    decorators: [
                      {title: 'Strong', value: 'strong'},
                      {title: 'Emphasis', value: 'em'},
                      {title: 'Underline', value: 'underline'},
                      {title: 'Code', value: 'code'}
                    ],
                    annotations: [
                      {
                        title: 'URL',
                        name: 'link',
                        type: 'object',
                        fields: [
                          { title: 'URL', name: 'href', type: 'url' }
                        ]
                      }
                    ]
                  }
                }
              ]
            }),
            defineField({
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              description: 'Text to display on the button'
            }),
            defineField({
              name: 'email',
              title: 'Email',
              type: 'string',
              validation: (Rule) => Rule.email().required(),
              description: 'Email address for contact'
            })
          ],
          preview: {
            select: { title: 'title', email: 'email' },
            prepare({title, email}) {
              return { 
                title: 'Get in Touch', 
                subtitle: title ? `${title}${email ? ` - ${email}` : ''}` : email || 'Untitled'
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'seoImage',
      title: 'SEO Image',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Image used for social media sharing'
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true
    })
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'image'
    }
  }
})