import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'carousel',
  title: 'Carousel',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Internal name for this carousel (shown when selecting on pages)',
    }),
    defineField({
      name: 'heading',
      title: 'Title',
      type: 'string',
      description: 'Optional heading displayed above the carousel on the page',
    }),
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'slide',
          title: 'Slide',
          fields: [
            defineField({
              name: 'usePlaceholder',
              title: 'Use placeholder',
              type: 'boolean',
              initialValue: false,
              options: {
                layout: 'checkbox',
              },
              description:
                'Use a placeholder instead of an image. A caption is required only when no image is uploaded.',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional when an image is uploaded',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as {
                    usePlaceholder?: boolean
                    image?: {asset?: {_ref?: string}}
                  }
                  const hasImage = Boolean(parent?.image?.asset?._ref)
                  if (hasImage) {
                    return true
                  }
                  if (parent?.usePlaceholder && !value?.trim()) {
                    return 'Caption is required when using a placeholder without an image'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Alternative text for accessibility',
                },
              ],
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as {usePlaceholder?: boolean}
                  if (!parent?.usePlaceholder && !value) {
                    return 'Image is required unless "Use placeholder" is enabled'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'imageAlignHorizontal',
              title: 'Horizontal alignment',
              type: 'string',
              options: {
                list: [
                  {title: 'Left', value: 'left'},
                  {title: 'Center', value: 'center'},
                  {title: 'Right', value: 'right'},
                ],
                layout: 'radio',
              },
              initialValue: 'center',
              hidden: ({parent}) => parent?.usePlaceholder === true,
              description: 'How the image is aligned horizontally within the slide frame',
            }),
            defineField({
              name: 'imageAlignVertical',
              title: 'Vertical alignment',
              type: 'string',
              options: {
                list: [
                  {title: 'Top', value: 'top'},
                  {title: 'Center', value: 'center'},
                  {title: 'Bottom', value: 'bottom'},
                ],
                layout: 'radio',
              },
              initialValue: 'center',
              hidden: ({parent}) => parent?.usePlaceholder === true,
              description: 'How the image is aligned vertically within the slide frame',
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              usePlaceholder: 'usePlaceholder',
              media: 'image',
            },
            prepare({title, usePlaceholder, media}) {
              const label = title || (usePlaceholder ? 'Placeholder slide' : 'Slide')
              return {
                title: usePlaceholder && !media ? `${label} (placeholder)` : label,
                media,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Carousel Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Full Width', value: 'fullWidth'},
          {title: 'Contained', value: 'contained'},
          {title: 'Cards', value: 'cards'},
        ],
        layout: 'radio',
      },
      initialValue: 'fullWidth',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cardsPerView',
      title: 'Cards per view',
      type: 'number',
      description: 'Number of cards visible at once when using the cards layout',
      initialValue: 3,
      hidden: ({document}) => document?.layout !== 'cards',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const layout = (context.document as {layout?: string})?.layout
          if (layout === 'cards') {
            if (value == null || !Number.isInteger(value) || value < 1) {
              return 'Cards per view must be a whole number of at least 1'
            }
            if (value > 6) {
              return 'Cards per view cannot exceed 6'
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'scrolling',
      title: 'Scrolling',
      type: 'string',
      options: {
        list: [
          {title: 'Auto', value: 'auto'},
          {title: 'Manual', value: 'manual'},
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'autoPlayDelay',
      title: 'Auto-play Delay (seconds)',
      type: 'number',
      description: 'Time between slide transitions when scrolling is set to auto',
      initialValue: 5,
      hidden: ({document}) => document?.scrolling !== 'auto',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const scrolling = (context.document as {scrolling?: string})?.scrolling
          if (scrolling === 'auto' && (value == null || value <= 0)) {
            return 'Delay must be greater than 0 when auto scrolling is enabled'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      name: 'title',
      heading: 'heading',
      slides: 'slides',
      layout: 'layout',
      cardsPerView: 'cardsPerView',
      media: 'slides.0.image',
    },
    prepare({name, heading, slides, layout, cardsPerView, media}) {
      const count = Array.isArray(slides) ? slides.length : 0
      const slideLabel = count ? `${count} slide${count === 1 ? '' : 's'}` : 'No slides'
      const cardsLabel =
        layout === 'cards' && cardsPerView ? ` · ${cardsPerView} per view` : ''
      return {
        title: name || 'Untitled carousel',
        subtitle: heading ? `${heading} · ${slideLabel}${cardsLabel}` : `${slideLabel}${cardsLabel}`,
        media,
      }
    },
  },
})
