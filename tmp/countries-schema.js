// Sanity schema for Countries content
// This schema can be used in a separate Sanity project

export const countriesSchema = {
  name: 'countries',
  title: 'Countries',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Country Name',
      type: 'string',
      description: 'Name of the country (e.g., "France", "UK")',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'URL-friendly identifier (e.g., "fr", "uk")',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'code',
      title: 'Country Code',
      type: 'string',
      description: 'Two-letter country code (e.g., "FR", "UK")',
      validation: (Rule) => Rule.required().max(2)
    },
    {
      name: 'intro',
      title: 'Introduction Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          description: 'Main title for the country section'
        },
        {
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
        }
      ]
    },
    {
      name: 'sections',
      title: 'Content Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'eligibleExpenses',
          title: 'Eligible Expenses Section',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Eligible expenses include:',
              description: 'Section title (default: "Eligible expenses include:")'
            },
            {
              name: 'points',
              title: 'List of Points',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'point',
                      title: 'Point',
                      type: 'string',
                      validation: (Rule) => Rule.required()
                    },
                    {
                      name: 'description',
                      title: 'Description',
                      type: 'text',
                      description: 'Optional detailed description for this point'
                    }
                  ],
                  preview: {
                    select: {
                      title: 'point'
                    }
                  }
                }
              ],
              description: 'List of eligible expenses'
            }
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
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Qualifying requirements',
              description: 'Section title (default: "Qualifying requirements")'
            },
            {
              name: 'points',
              title: 'List of Requirements',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'requirement',
                      title: 'Requirement',
                      type: 'string',
                      validation: (Rule) => Rule.required()
                    },
                    {
                      name: 'description',
                      title: 'Description',
                      type: 'text',
                      description: 'Optional detailed description for this requirement'
                    }
                  ],
                  preview: {
                    select: {
                      title: 'requirement'
                    }
                  }
                }
              ],
              description: 'List of qualifying requirements'
            }
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
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'How to apply?',
              description: 'Section title (default: "How to apply?")'
            },
            {
              name: 'steps',
              title: 'Application Steps',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'step',
                      title: 'Step',
                      type: 'string',
                      validation: (Rule) => Rule.required()
                    },
                    {
                      name: 'description',
                      title: 'Description',
                      type: 'text',
                      description: 'Optional detailed description for this step'
                    }
                  ],
                  preview: {
                    select: {
                      title: 'step'
                    }
                  }
                }
              ],
              description: 'Step-by-step application process'
            }
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
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Custom section title'
            },
            {
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
            }
          ],
          preview: {
            select: {
              title: 'title'
            }
          }
        }
      ],
      description: 'Content sections for this country'
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'SEO title for search engines'
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'SEO description for search engines'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'code'
    }
  }
};

// Alternative simplified schema for easier management
export const countriesSimpleSchema = {
  name: 'countriesSimple',
  title: 'Countries (Simple)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Country Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required()
    },
    {
      name: 'code',
      title: 'Country Code',
      type: 'string',
      validation: (Rule) => Rule.required().max(2)
    },
    {
      name: 'introTitle',
      title: 'Introduction Title',
      type: 'string'
    },
    {
      name: 'introDescription',
      title: 'Introduction Description',
      type: 'text'
    },
    {
      name: 'eligibleExpensesTitle',
      title: 'Eligible Expenses Title',
      type: 'string',
      initialValue: 'Eligible expenses include:'
    },
    {
      name: 'eligibleExpenses',
      title: 'Eligible Expenses List',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'qualifyingRequirementsTitle',
      title: 'Qualifying Requirements Title',
      type: 'string',
      initialValue: 'Qualifying requirements'
    },
    {
      name: 'qualifyingRequirements',
      title: 'Qualifying Requirements List',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'howToApplyTitle',
      title: 'How to Apply Title',
      type: 'string',
      initialValue: 'How to apply?'
    },
    {
      name: 'howToApply',
      title: 'How to Apply Steps',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'customSections',
      title: 'Custom Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'content',
              title: 'Content',
              type: 'text'
            }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'code'
    }
  }
};
