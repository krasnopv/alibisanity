import React, {useState, useEffect, useMemo} from 'react'
import {definePlugin, useClient, useSchema} from 'sanity'
import {Trash2, Edit, X, Check, CheckSquare, Square} from 'lucide-react'
import {
  Box,
  Card,
  Stack,
  Flex,
  Button,
  Text,
  Heading,
  TextInput,
  Select,
  Label,
  Dialog,
  Spinner,
} from '@sanity/ui'

// Bulk Edit Tool Component
function BulkEditTool() {
  const [selectedSchemaType, setSelectedSchemaType] = useState<string>('')
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [filter, setFilter] = useState('')
  const client = useClient({apiVersion: '2023-05-03'})

  // Available schema types for bulk editing
  const schemaTypes = [
    {value: 'film', label: 'Films'},
    {value: 'project', label: 'Projects'},
    {value: 'service', label: 'Services'},
    {value: 'subService', label: 'Sub-Services'},
    {value: 'category', label: 'Categories'},
    {value: 'director', label: 'Directors'},
    {value: 'directorWork', label: 'Director Works'},
    {value: 'teamMember', label: 'Team Members'},
    {value: 'award', label: 'Awards'},
    {value: 'page', label: 'Pages'},
    {value: 'studio', label: 'Studios'},
  ]

  // Fetch documents when schema type changes
  useEffect(() => {
    if (!selectedSchemaType) {
      setDocuments([])
      return
    }

    setLoading(true)
    client
      .fetch(`*[_type == "${selectedSchemaType}"] | order(_createdAt desc)`)
      .then((docs: any[]) => {
        setDocuments(docs)
        setSelectedIds(new Set())
      })
      .catch((err: any) => {
        console.error('Error fetching documents:', err)
        alert('Error loading documents')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedSchemaType, client])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!filter) return documents
    const lowerFilter = filter.toLowerCase()
    return documents.filter((doc) => {
      const title = doc.title || doc.name || doc.slug?.current || doc._id
      return String(title).toLowerCase().includes(lowerFilter)
    })
  }, [documents, filter])

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredDocuments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDocuments.map((doc) => doc._id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.size} item(s)? This action cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const deletePromises = Array.from(selectedIds).map((id) => {
        const cleanId = id.replace('drafts.', '')
        return client.delete(cleanId)
      })

      await Promise.all(deletePromises)
      alert(`Successfully deleted ${selectedIds.size} item(s)`)
      
      // Refresh documents
      const docs = await client.fetch(`*[_type == "${selectedSchemaType}"] | order(_createdAt desc)`)
      setDocuments(docs)
      setSelectedIds(new Set())
    } catch (error: any) {
      console.error('Error deleting documents:', error)
      alert(`Error: ${error.message || 'Failed to delete documents'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkEdit = () => {
    if (selectedIds.size === 0) return
    setShowBulkEditModal(true)
  }

  const handleBulkEditSave = async (updates: Record<string, any>) => {
    if (selectedIds.size === 0) return

    setLoading(true)
    try {
      const updatePromises = Array.from(selectedIds).map((id) => {
        const cleanId = id.replace('drafts.', '')
        const patch = client.patch(cleanId)

        Object.entries(updates).forEach(([field, value]) => {
          // Handle reference objects (they are objects, not primitives)
          if (value && typeof value === 'object' && value._type === 'reference') {
            patch.set({[field]: value})
          } else if (value !== null && value !== undefined && value !== '') {
            patch.set({[field]: value})
          }
        })

        return patch.commit()
      })

      await Promise.all(updatePromises)
      alert(`Successfully updated ${selectedIds.size} item(s)`)
      
      // Refresh documents
      const docs = await client.fetch(`*[_type == "${selectedSchemaType}"] | order(_createdAt desc)`)
      setDocuments(docs)
      setSelectedIds(new Set())
      setShowBulkEditModal(false)
    } catch (error: any) {
      console.error('Error updating documents:', error)
      alert(`Error: ${error.message || 'Failed to update documents'}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Stack space={3}>
          <Heading size={1}>Bulk Edit & Delete</Heading>
          <Text muted>
            Select multiple items to edit common fields or delete them.
          </Text>
        </Stack>

        <Card padding={3} radius={2} tone="default">
          <Stack space={3}>
            <Label>Select Document Type</Label>
            <Select
              value={selectedSchemaType}
              onChange={(e) => setSelectedSchemaType(e.currentTarget.value)}
            >
              <option value="">-- Select a type --</option>
              {schemaTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Stack>
        </Card>

        {selectedSchemaType && (
          <Stack space={3}>
            <Flex gap={2} align="center" wrap="wrap">
              <Box flex={1} style={{maxWidth: '400px'}}>
                <TextInput
                  placeholder="Filter documents..."
                  value={filter}
                  onChange={(e) => setFilter(e.currentTarget.value)}
                />
              </Box>
              {selectedIds.size > 0 && (
                <Flex gap={2} align="center">
                  <Text weight="medium">{selectedIds.size} selected</Text>
                  <Button
                    text="Clear"
                    mode="ghost"
                    onClick={handleClearSelection}
                    disabled={loading}
                  />
                  <Button
                    text="Edit"
                    tone="primary"
                    icon={Edit}
                    onClick={handleBulkEdit}
                    disabled={loading}
                  />
                  <Button
                    text="Delete"
                    tone="critical"
                    icon={Trash2}
                    onClick={handleBulkDelete}
                    disabled={loading}
                  />
                </Flex>
              )}
            </Flex>

            {loading && documents.length === 0 ? (
              <Card padding={6} radius={2} tone="default">
                <Flex justify="center" align="center">
                  <Spinner />
                </Flex>
              </Card>
            ) : filteredDocuments.length === 0 ? (
              <Card padding={6} radius={2} tone="default">
                <Text align="center" muted>
                  No documents found{filter ? ' matching filter' : ''}
                </Text>
              </Card>
            ) : (
              <Card radius={2} tone="default" overflow="auto">
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr>
                      <th style={{padding: '12px', textAlign: 'left', width: '40px'}}>
                        <Button
                          mode="bleed"
                          onClick={handleSelectAll}
                          padding={1}
                        >
                          {selectedIds.size === filteredDocuments.length && filteredDocuments.length > 0 ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </Button>
                      </th>
                      <th style={{padding: '12px', textAlign: 'left'}}>
                        <Text weight="semibold" size={1}>Title/Name</Text>
                      </th>
                      <th style={{padding: '12px', textAlign: 'left'}}>
                        <Text weight="semibold" size={1}>ID</Text>
                      </th>
                      <th style={{padding: '12px', textAlign: 'left'}}>
                        <Text weight="semibold" size={1}>Created</Text>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => {
                      const title = doc.title || doc.name || doc.slug?.current || doc._id
                      const isSelected = selectedIds.has(doc._id)
                      return (
                        <tr
                          key={doc._id}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'var(--card-hovered-bg-color)' : 'transparent',
                          }}
                          onClick={() => handleToggleSelect(doc._id)}
                        >
                          <td style={{padding: '12px'}} onClick={(e) => e.stopPropagation()}>
                            <Button
                              mode="bleed"
                              onClick={() => handleToggleSelect(doc._id)}
                              padding={1}
                            >
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </Button>
                          </td>
                          <td style={{padding: '12px'}}>
                            <Text weight={isSelected ? 'semibold' : 'regular'}>{title}</Text>
                          </td>
                          <td style={{padding: '12px'}}>
                            <Text size={1} muted style={{fontFamily: 'monospace'}}>
                              {doc._id}
                            </Text>
                          </td>
                          <td style={{padding: '12px'}}>
                            <Text size={1} muted>
                              {doc._createdAt ? new Date(doc._createdAt).toLocaleDateString() : '-'}
                            </Text>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </Stack>
        )}

        {showBulkEditModal && selectedSchemaType && (
          <BulkEditModal
            selectedIds={Array.from(selectedIds)}
            schemaType={selectedSchemaType}
            onClose={() => setShowBulkEditModal(false)}
            onSave={handleBulkEditSave}
          />
        )}
      </Stack>
    </Box>
  )
}

// Bulk Edit Modal Component
function BulkEditModal({
  selectedIds,
  schemaType,
  onClose,
  onSave,
}: {
  selectedIds: string[]
  schemaType: string
  onClose: () => void
  onSave: (updates: Record<string, any>) => Promise<void>
}) {
  const [updates, setUpdates] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const client = useClient({apiVersion: '2023-05-03'})

  // Reset updates when schema type changes
  useEffect(() => {
    setUpdates({})
  }, [schemaType])

  // Get schema to determine editable fields
  const schema = useSchema()
  const schemaDef = schema.get(schemaType)

  // Fetch categories when editing films
  useEffect(() => {
    if (schemaType === 'film') {
      setLoadingCategories(true)
      client
        .fetch(`*[_type == "category"] | order(name asc)`)
        .then((cats: any[]) => {
          // Deduplicate categories by _id
          const uniqueCats = Array.from(
            new Map(cats.map((cat) => [cat._id, cat])).values()
          )
          setCategories(uniqueCats)
        })
        .catch((err: any) => {
          console.error('Error fetching categories:', err)
        })
        .finally(() => {
          setLoadingCategories(false)
        })
    } else {
      // Clear categories when not editing films
      setCategories([])
    }
  }, [schemaType, client])

  // Get common editable fields
  const editableFields = React.useMemo(() => {
    if (!schemaDef || !schemaDef.fields) return []
    return schemaDef.fields
      .filter((field: any) => {
        const fieldName = field.name
        const type = field.type?.name || field.type
        const isReference = type === 'reference' || field.type?.type?.name === 'reference'
        
        // Exclude category field for films (handled separately)
        if (schemaType === 'film' && fieldName === 'category') {
          return false
        }
        
        // Exclude all reference types (they need special handling)
        if (isReference) {
          return false
        }
        
        // Include common simple types only
        return ['string', 'number', 'boolean', 'slug', 'url', 'email', 'text'].includes(type)
      })
      .map((field: any) => ({
        name: field.name,
        title: field.type?.title || field.name,
        type: field.type?.name || field.type,
      }))
  }, [schemaDef, schemaType])

  // Check if category field exists for films
  const hasCategoryField = React.useMemo(() => {
    if (schemaType !== 'film') return false
    if (!schemaDef || !schemaDef.fields) return false
    return schemaDef.fields.some((field: any) => field.name === 'category')
  }, [schemaType, schemaDef])

  const handleFieldChange = (fieldName: string, value: any) => {
    setUpdates((prev) => ({
      ...prev,
      [fieldName]: value === '' ? null : value,
    }))
  }

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === '') {
      setUpdates((prev) => {
        const next = {...prev}
        delete next.category
        return next
      })
    } else {
      setUpdates((prev) => ({
        ...prev,
        category: {
          _type: 'reference',
          _ref: categoryId,
        },
      }))
    }
  }

  const handleSave = async () => {
    if (Object.keys(updates).length === 0) {
      alert('No changes to save')
      return
    }

    setLoading(true)
    try {
      await onSave(updates)
      onClose()
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to update documents'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      header={
        <Heading size={1}>Bulk Edit {selectedIds.length} Items</Heading>
      }
      id="bulk-edit-modal"
      onClose={onClose}
      width={1}
      zOffset={1000}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text muted>
            Update the following fields for all selected items. Leave fields empty to keep existing values.
          </Text>

          <Stack space={3}>
            {/* Category field for Films */}
            {hasCategoryField && (
              <Stack space={2}>
                <Label>Category</Label>
                {loadingCategories ? (
                  <Text muted>Loading categories...</Text>
                ) : (
                  <Select
                    value={updates.category?._ref || ''}
                    onChange={(e) => handleCategoryChange(e.currentTarget.value)}
                  >
                    <option value="">Keep existing</option>
                    {categories
                      .filter((cat, index, self) => 
                        index === self.findIndex((c) => c._id === cat._id)
                      )
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </Select>
                )}
              </Stack>
            )}

            {editableFields.length === 0 && !hasCategoryField ? (
              <Text muted italic>No editable fields found for this document type.</Text>
            ) : (
              editableFields
                .filter((field: any) => {
                  // Double-check: exclude category field for films
                  if (schemaType === 'film' && field.name === 'category') {
                    return false
                  }
                  return true
                })
                .map((field: any) => (
                  <Stack space={2} key={field.name}>
                    <Label>{field.title || field.name}</Label>
                  {field.type === 'boolean' ? (
                    <Select
                      value={updates[field.name] === undefined ? '' : updates[field.name] ? 'true' : 'false'}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.currentTarget.value === '' ? undefined : e.currentTarget.value === 'true')
                      }
                    >
                      <option value="">Keep existing</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </Select>
                  ) : field.type === 'number' ? (
                    <TextInput
                      type="number"
                      value={updates[field.name] ?? ''}
                      onChange={(e) => handleFieldChange(field.name, e.currentTarget.value ? Number(e.currentTarget.value) : null)}
                      placeholder="Keep existing"
                    />
                  ) : (
                    <TextInput
                      type="text"
                      value={updates[field.name] ?? ''}
                      onChange={(e) => handleFieldChange(field.name, e.currentTarget.value)}
                      placeholder="Keep existing"
                    />
                  )}
                </Stack>
              ))
            )}
          </Stack>

          <Flex gap={2} justify="flex-end">
            <Button
              text="Cancel"
              mode="ghost"
              onClick={onClose}
              disabled={loading}
            />
            <Button
              text={loading ? 'Saving...' : 'Save Changes'}
              tone="primary"
              icon={!loading ? Check : undefined}
              onClick={handleSave}
              disabled={loading || Object.keys(updates).length === 0}
            />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  )
}

export const bulkEdit = definePlugin({
  name: 'bulk-edit',
  structure: {
    tools: (prev) => {
      return [
        ...prev,
        {
          name: 'bulk-edit',
          title: 'Bulk Edit & Delete',
          icon: Edit,
          component: BulkEditTool,
        },
      ]
    },
  },
})

// Export the component for use in structure
export {BulkEditTool}
