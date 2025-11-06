import React, {useState, useEffect} from 'react'
import {definePlugin} from 'sanity'
import {Upload, Film, Folder} from 'lucide-react'
import {useClient} from 'sanity'

// Bulk Import Films Tool Component
function BulkImportFilmsTool() {
  const [files, setFiles] = useState<File[]>([])
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const client = useClient({apiVersion: '2023-05-03'})

  // Fetch categories on mount
  useEffect(() => {
    client
      .fetch('*[_type == "category"] | order(name asc)')
      .then((cats: any[]) => {
        setCategories(cats)
        if (cats.length > 0) {
          setCategoryId(cats[0]._id)
        }
      })
      .catch((err: any) => {
        console.error('Error fetching categories:', err)
      })
  }, [client])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
  }

  const extractTitleFromFilename = (filename: string): string => {
    // Remove extension
    let title = filename.replace(/\.[^/.]+$/, '')
    // Replace underscores and hyphens with spaces
    title = title.replace(/[_-]/g, ' ')
    // Capitalize first letter of each word
    title = title
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    return title
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      alert('Please select at least one image file')
      return
    }

    if (!categoryId) {
      alert('Please select a category')
      return
    }

    setLoading(true)
    setProgress(`Starting upload of ${files.length} images...`)

    try {
      const createdFilms = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`)

        // Upload image asset
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        })

        // Extract title from filename
        const title = extractTitleFromFilename(file.name)

        // Create film document
        const filmDoc = {
          _type: 'film',
          title: title,
          category: {
            _type: 'reference',
            _ref: categoryId,
          },
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
        }

        // Create film document (as draft)
        const createdFilm = await client.create(filmDoc)
        createdFilms.push(createdFilm)
      }

      setProgress(`Successfully created ${createdFilms.length} films!`)
      alert(`Successfully created ${createdFilms.length} films!`)
      
      // Reset form
      setFiles([])
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      setProgress('')
    } catch (error: any) {
      console.error('Error during bulk import:', error)
      alert(`Error: ${error.message || 'Failed to import films'}`)
      setProgress(`Error: ${error.message || 'Failed to import films'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{padding: '2rem', maxWidth: '800px'}}>
      <h1 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Bulk Import Films</h1>
      <p style={{marginBottom: '2rem', color: '#666'}}>
        Upload multiple images to create films. Each image filename will be used as the film title.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '1.5rem'}}>
          <label htmlFor="category-select" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
            Category (required for all films):
          </label>
          <select
            id="category-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loading || categories.length === 0}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            {categories.length === 0 ? (
              <option value="">Loading categories...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{marginBottom: '1.5rem'}}>
          <label htmlFor="file-input" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
            Select Images (multiple files allowed):
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {files.length > 0 && (
            <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#666'}}>
              {files.length} file(s) selected
              <ul style={{marginTop: '0.5rem', paddingLeft: '1.5rem'}}>
                {files.map((file, idx) => (
                  <li key={idx}>
                    {file.name} → "{extractTitleFromFilename(file.name)}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {progress && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: loading ? '#e3f2fd' : '#e8f5e9',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            {progress}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || files.length === 0 || !categoryId}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#2276fc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Importing...' : `Import ${files.length || 0} Film(s)`}
        </button>
      </form>
    </div>
  )
}

export const bulkImportFilms = definePlugin({
  name: 'bulk-import-films',
  structure: {
    tools: (prev) => {
      return [
        ...prev,
        {
          name: 'bulk-import-films',
          title: 'Bulk Import Films',
          icon: Upload,
          component: BulkImportFilmsTool,
        },
      ]
    },
  },
})

// Export the component for use in structure
export {BulkImportFilmsTool}

