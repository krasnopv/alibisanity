import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'seoMetadata',
  title: 'SEO Metadata',
  type: 'document',
  fields: [
    defineField({
      name: 'pagePath',
      title: 'Page Path / Slug',
      type: 'string',
      description: 'The URL path or slug for this page (e.g., "/projects/my-project", "home", "/services/animation")',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The main title for the page. Will be appended with "| Alibi Studios" if not already included.',
      validation: (Rule) => Rule.required().max(60)
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      description: 'A brief description of the page (recommended: 150-160 characters)',
      validation: (Rule) => Rule.required().max(160)
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'SEO keywords for this page',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image displayed when sharing on social media (recommended: 1200x630px)',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for the image'
        }
      ]
    }),
    defineField({
      name: 'url',
      title: 'Canonical URL',
      type: 'url',
      description: 'The full canonical URL for this page (e.g., https://alibistudios.co/projects/my-project)',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'type',
      title: 'Open Graph Type',
      type: 'string',
      description: 'The type of content',
      options: {
        list: [
          { title: 'Website', value: 'website' },
          { title: 'Article', value: 'article' },
          { title: 'Profile', value: 'profile' }
        ],
        layout: 'radio'
      },
      initialValue: 'website',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'publishedTime',
      title: 'Published Date',
      type: 'datetime',
      description: 'When the content was published (for articles)',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 15
      }
    }),
    defineField({
      name: 'modifiedTime',
      title: 'Last Modified Date',
      type: 'datetime',
      description: 'When the content was last modified',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 15
      }
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Author name for articles',
      initialValue: 'Alibi Studios'
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      description: 'Section/category for articles (e.g., "VFX", "Animation", "Production")'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Content tags for articles',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'robots',
      title: 'Robots Settings',
      type: 'object',
      description: 'Search engine indexing settings',
      fields: [
        {
          name: 'index',
          title: 'Allow Indexing',
          type: 'boolean',
          initialValue: true,
          description: 'Allow search engines to index this page'
        },
        {
          name: 'follow',
          title: 'Follow Links',
          type: 'boolean',
          initialValue: true,
          description: 'Allow search engines to follow links on this page'
        },
        {
          name: 'noindex',
          title: 'No Index',
          type: 'boolean',
          initialValue: false,
          description: 'Prevent search engines from indexing this page'
        },
        {
          name: 'nofollow',
          title: 'No Follow',
          type: 'boolean',
          initialValue: false,
          description: 'Prevent search engines from following links'
        }
      ]
    }),
    defineField({
      name: 'twitter',
      title: 'Twitter Card Settings',
      type: 'object',
      description: 'Twitter-specific metadata',
      fields: [
        {
          name: 'card',
          title: 'Card Type',
          type: 'string',
          options: {
            list: [
              { title: 'Summary', value: 'summary' },
              { title: 'Summary Large Image', value: 'summary_large_image' },
              { title: 'App', value: 'app' },
              { title: 'Player', value: 'player' }
            ]
          },
          initialValue: 'summary_large_image'
        },
        {
          name: 'creator',
          title: 'Twitter Creator',
          type: 'string',
          description: 'Twitter handle of content creator (e.g., @alibistudios)',
          initialValue: '@alibistudios'
        },
        {
          name: 'site',
          title: 'Twitter Site',
          type: 'string',
          description: 'Twitter handle of the site (e.g., @alibistudios)',
          initialValue: '@alibistudios'
        }
      ]
    }),
    defineField({
      name: 'structuredData',
      title: 'Structured Data (JSON-LD)',
      type: 'object',
      description: 'Additional structured data for rich snippets',
      fields: [
        {
          name: 'type',
          title: 'Schema Type',
          type: 'string',
          options: {
            list: [
              { title: 'Organization', value: 'Organization' },
              { title: 'Article', value: 'Article' },
              { title: 'WebPage', value: 'WebPage' },
              { title: 'VideoObject', value: 'VideoObject' },
              { title: 'Person', value: 'Person' }
            ]
          },
          initialValue: 'Organization'
        },
        {
          name: 'name',
          title: 'Name',
          type: 'string'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text'
        },
        {
          name: 'logo',
          title: 'Logo URL',
          type: 'url'
        },
        {
          name: 'sameAs',
          title: 'Social Media Links',
          type: 'array',
          of: [{ type: 'url' }],
          description: 'Array of social media profile URLs'
        }
      ]
    }),
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Internal notes about this SEO entry (not published)'
    })
  ],
  preview: {
    select: {
      title: 'title',
      path: 'pagePath',
      image: 'ogImage'
    },
    prepare({ title, path, image }) {
      return {
        title: title || 'Untitled SEO',
        subtitle: path || 'No path set',
        media: image
      }
    }
  },
  orderings: [
    {
      title: 'Page Path',
      name: 'pagePathAsc',
      by: [{ field: 'pagePath', direction: 'asc' }]
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
})

