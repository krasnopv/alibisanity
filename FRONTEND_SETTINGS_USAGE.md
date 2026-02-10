# Using Settings (Custom Fields) in Front-End

This guide shows how to fetch and use Settings documents (like "Contact Email") in your Next.js front-end application.

## Setup

Make sure you have the Sanity client configured in your Next.js project:

```javascript
// lib/sanity.js
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'srer6l4b',
  dataset: 'production', // or 'staging' for staging
  useCdn: true,
  apiVersion: '2023-01-01',
})
```

## Fetching Settings by Name

### Option 1: Fetch Single Setting by Title (Recommended)

```javascript
// lib/settings.js
import { client } from './sanity'

/**
 * Get a setting value by its title/name
 * @param {string} settingName - The "Settings Name" (e.g., "Contact Email")
 * @returns {Promise<string|null>} The value or null if not found
 */
export async function getSetting(settingName) {
  const setting = await client.fetch(
    `*[_type == "option" && title == $name][0].value`,
    { name: settingName }
  )
  return setting || null
}

// Usage example:
const contactEmail = await getSetting('Contact Email')
```

### Option 2: Fetch All Settings as a Map

```javascript
// lib/settings.js
import { client } from './sanity'

/**
 * Get all settings as a key-value object
 * @returns {Promise<Object>} Object with title as key, value as value
 */
export async function getAllSettings() {
  const settings = await client.fetch(
    `*[_type == "option"] {
      title,
      value
    }`
  )
  
  // Convert to object: { "Contact Email": "email@example.com", ... }
  return settings.reduce((acc, setting) => {
    acc[setting.title] = setting.value
    return acc
  }, {})
}

// Usage example:
const settings = await getAllSettings()
const contactEmail = settings['Contact Email']
```

## Usage in Next.js

### Server-Side Rendering (SSR) / Static Generation

```javascript
// pages/contact.js or app/contact/page.js
import { getSetting } from '../lib/settings'

export async function getStaticProps() {
  const contactEmail = await getSetting('Contact Email')
  
  return {
    props: {
      contactEmail: contactEmail || 'No email set'
    },
    revalidate: 60 // Revalidate every 60 seconds (ISR)
  }
}

export default function ContactPage({ contactEmail }) {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
    </div>
  )
}
```

### Client-Side Fetching (React Hook)

```javascript
// hooks/useSettings.js
import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'

export function useSetting(settingName) {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSetting() {
      try {
        setLoading(true)
        const setting = await client.fetch(
          `*[_type == "option" && title == $name][0].value`,
          { name: settingName }
        )
        setValue(setting || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSetting()
  }, [settingName])

  return { value, loading, error }
}

// Usage in component:
import { useSetting } from '../hooks/useSettings'

export default function ContactSection() {
  const { value: contactEmail, loading } = useSetting('Contact Email')

  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <h2>Contact</h2>
      <p>Email: {contactEmail || 'Not set'}</p>
    </div>
  )
}
```

### API Route (Next.js API)

```javascript
// pages/api/settings/[name].js or app/api/settings/[name]/route.js
import { client } from '../../../lib/sanity'

// Pages Router (pages/api/settings/[name].js)
export default async function handler(req, res) {
  const { name } = req.query
  
  try {
    const value = await client.fetch(
      `*[_type == "option" && title == $name][0].value`,
      { name }
    )
    
    res.status(200).json({ value: value || null })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// App Router (app/api/settings/[name]/route.js)
export async function GET(request, { params }) {
  const { name } = params
  
  try {
    const value = await client.fetch(
      `*[_type == "option" && title == $name][0].value`,
      { name }
    )
    
    return Response.json({ value: value || null })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// Usage:
// fetch('/api/settings/Contact Email')
```

## Complete Example: Contact Page

```javascript
// pages/contact.js
import { getSetting } from '../lib/settings'

export async function getStaticProps() {
  const contactEmail = await getSetting('Contact Email')
  const phoneNumber = await getSetting('Contact Phone') // if you have one
  
  return {
    props: {
      contactEmail: contactEmail || null,
      phoneNumber: phoneNumber || null,
    },
    revalidate: 3600 // Revalidate every hour
  }
}

export default function ContactPage({ contactEmail, phoneNumber }) {
  return (
    <div>
      <h1>Contact Us</h1>
      
      {contactEmail && (
        <div>
          <strong>Email:</strong>{' '}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </div>
      )}
      
      {phoneNumber && (
        <div>
          <strong>Phone:</strong>{' '}
          <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
        </div>
      )}
    </div>
  )
}
```

## TypeScript Support

```typescript
// lib/settings.ts
import { client } from './sanity'

export async function getSetting(settingName: string): Promise<string | null> {
  const setting = await client.fetch<string | null>(
    `*[_type == "settings" && title == $name][0].value`,
    { name: settingName }
  )
  return setting || null
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await client.fetch<Array<{ title: string; value: string }>>(
      `*[_type == "option"] {
      title,
      value
    }`
  )
  
  return settings.reduce((acc, setting) => {
    acc[setting.title] = setting.value
    return acc
  }, {} as Record<string, string>)
}
```

## Common Use Cases

### 1. Footer Contact Info

```javascript
// components/Footer.js
import { getSetting } from '../lib/settings'

export async function Footer() {
  const contactEmail = await getSetting('Contact Email')
  const address = await getSetting('Company Address')
  
  return (
    <footer>
      {contactEmail && <p>Email: {contactEmail}</p>}
      {address && <p>Address: {address}</p>}
    </footer>
  )
}
```

### 2. Header/Contact Button

```javascript
// components/Header.js
'use client'
import { useSetting } from '../hooks/useSettings'

export default function Header() {
  const { value: contactEmail } = useSetting('Contact Email')
  
  return (
    <header>
      {contactEmail && (
        <a href={`mailto:${contactEmail}`}>Contact</a>
      )}
    </header>
  )
}
```

### 3. Meta Tags / SEO

```javascript
// pages/_app.js or app/layout.js
import { getSetting } from '../lib/settings'

export async function generateMetadata() {
  const siteName = await getSetting('Site Name')
  const siteDescription = await getSetting('Site Description')
  
  return {
    title: siteName || 'Default Site Name',
    description: siteDescription || 'Default description',
  }
}
```

## Error Handling

```javascript
// lib/settings.js with error handling
import { client } from './sanity'

export async function getSetting(settingName) {
  try {
    const setting = await client.fetch(
      `*[_type == "option" && title == $name][0].value`,
      { name: settingName }
    )
    return setting || null
  } catch (error) {
    console.error(`Error fetching setting "${settingName}":`, error)
    return null
  }
}
```

## Caching Considerations

- **Static Generation**: Use `getStaticProps` with `revalidate` for ISR (Incremental Static Regeneration)
- **CDN**: Sanity CDN is enabled by default (`useCdn: true`)
- **Client-Side**: Consider adding React Query or SWR for better caching

```javascript
// Using SWR for client-side caching
import useSWR from 'swr'

const fetcher = async (name) => {
  const response = await fetch(`/api/settings/${name}`)
  const data = await response.json()
  return data.value
}

export function useSetting(settingName) {
  const { data, error, isLoading } = useSWR(
    settingName,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  )
  
  return { value: data, loading: isLoading, error }
}
```

## Quick Reference

**GROQ Query:**
```groq
*[_type == "option" && title == "Contact Email"][0].value
```

**Get all settings:**
```groq
*[_type == "option"] {
  title,
  value
}
```

**Get multiple specific settings:**
```groq
*[_type == "option" && title in ["Contact Email", "Contact Phone", "Site Name"]] {
  title,
  value
}
```
