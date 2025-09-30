# Sanity + Next.js Setup Guide

## 1. Install Sanity Client in Next.js Project

```bash
npm install @sanity/client @sanity/image-url
```

## 2. Create Sanity Client Configuration

Create `lib/sanity.js` in your Next.js project:

```javascript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Sanity client for data fetching
export const client = createClient({
  projectId: 'srer6l4b',
  dataset: 'production',
  useCdn: true, // Set to false if you want fresh data
  apiVersion: '2023-05-03',
})

// Image URL builder
const builder = imageUrlBuilder(client)

export const urlFor = (source) => builder.image(source)
```

## 3. Environment Variables

Create `.env.local` in your Next.js project:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=srer6l4b
NEXT_PUBLIC_SANITY_DATASET=production
```

## 4. Example Usage in Next.js

```javascript
// pages/index.js or app/page.js
import { client } from '../lib/sanity'

export async function getStaticProps() {
  // Fetch films
  const films = await client.fetch(`
    *[_type == "film"] {
      _id,
      title,
      description,
      year,
      category->name,
      image
    }
  `)

  // Fetch categories
  const categories = await client.fetch(`
    *[_type == "category"] {
      _id,
      name,
      color,
      slug
    }
  `)

  return {
    props: {
      films,
      categories
    }
  }
}
```

## 5. API Endpoints

### Content API:
- **Base URL:** `https://srer6l4b.api.sanity.io/v2023-05-03/data/query/production`
- **Method:** POST
- **Body:** GROQ query

### Images:
- **Base URL:** `https://cdn.sanity.io/images/srer6l4b/production/`
- **Usage:** `https://cdn.sanity.io/images/srer6l4b/production/[image-ref]`

## 6. Studio vs API URLs

- **Studio URL:** `https://alibi-studio.sanity.studio/` (for content management)
- **API URL:** `https://srer6l4b.api.sanity.io/` (for data fetching)
- **Images:** `https://cdn.sanity.io/images/srer6l4b/production/` (for images)

## 7. GraphQL API (Optional)

If you prefer GraphQL:

```bash
npm run deploy-graphql
```

Then use: `https://srer6l4b.api.sanity.io/v2023-05-03/graphql/production`
