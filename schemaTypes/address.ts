import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'address',
  title: 'Office Address',
  type: 'document',
  fields: [
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'country',
      title: 'Country Code',
      type: 'string',
      options: {
        list: [
          {title: 'United States', value: 'us'},
          {title: 'United Kingdom', value: 'uk'},
          {title: 'France', value: 'fr'},
          {title: 'Finland', value: 'fi'},
          {title: 'Canada', value: 'ca'},
          {title: 'Spain', value: 'es'},
          {title: 'Turkey', value: 'tr'},
          {title: 'Germany', value: 'de'},
          {title: 'Italy', value: 'it'},
          {title: 'Netherlands', value: 'nl'},
          {title: 'Belgium', value: 'be'},
          {title: 'Switzerland', value: 'ch'},
          {title: 'Austria', value: 'at'},
          {title: 'Sweden', value: 'se'},
          {title: 'Norway', value: 'no'},
          {title: 'Denmark', value: 'dk'},
          {title: 'Poland', value: 'pl'},
          {title: 'Portugal', value: 'pt'},
          {title: 'Greece', value: 'gr'},
          {title: 'Ireland', value: 'ie'},
          {title: 'Czech Republic', value: 'cz'},
          {title: 'Hungary', value: 'hu'},
          {title: 'Romania', value: 'ro'},
          {title: 'Bulgaria', value: 'bg'},
          {title: 'Croatia', value: 'hr'},
          {title: 'Slovakia', value: 'sk'},
          {title: 'Slovenia', value: 'si'},
          {title: 'Lithuania', value: 'lt'},
          {title: 'Latvia', value: 'lv'},
          {title: 'Estonia', value: 'ee'},
          {title: 'Luxembourg', value: 'lu'},
          {title: 'Malta', value: 'mt'},
          {title: 'Cyprus', value: 'cy'},
          {title: 'Iceland', value: 'is'},
          {title: 'Liechtenstein', value: 'li'},
          {title: 'Monaco', value: 'mc'},
          {title: 'San Marino', value: 'sm'},
          {title: 'Vatican City', value: 'va'},
          {title: 'Andorra', value: 'ad'},
          {title: 'Albania', value: 'al'},
          {title: 'Bosnia and Herzegovina', value: 'ba'},
          {title: 'North Macedonia', value: 'mk'},
          {title: 'Montenegro', value: 'me'},
          {title: 'Serbia', value: 'rs'},
          {title: 'Moldova', value: 'md'},
          {title: 'Ukraine', value: 'ua'}
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ]
})