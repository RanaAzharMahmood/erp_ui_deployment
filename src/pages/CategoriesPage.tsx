import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import CategoryIcon from '@mui/icons-material/Category'
import { Category } from '../types'
import { useDebounce } from '../hooks/useDebounce'
import TableSkeleton from '../components/common/TableSkeleton'
import { getCategoriesApi } from '../generated/api/client'
import type { Category as ApiCategory } from '../generated/api'

const INITIAL_CATEGORY: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState(INITIAL_CATEGORY)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper function to map API Category to local Category
  const mapApiCategoryToLocal = (apiCategory: ApiCategory): Category => {
    return {
      id: apiCategory.id?.toString() || '',
      name: apiCategory.categoryName || '',
      description: apiCategory.description || '',
      createdAt: apiCategory.createdAt
        ? new Date(apiCategory.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: apiCategory.updatedAt
        ? new Date(apiCategory.updatedAt).toISOString()
        : new Date().toISOString(),
    }
  }

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch) return categories
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (category.description &&
          category.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
    )
  }, [debouncedSearch, categories])

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const api = getCategoriesApi()
      const response = await api.v1ApiCategoriesGet(true) // Get only active categories
      if (response.data) {
        const mappedCategories = response.data.map(mapApiCategoryToLocal)
        setCategories(mappedCategories)
      } else {
        setCategories([])
      }
    } catch (err: any) {
      console.error('Error loading categories:', err)
      setError(err?.message || 'Failed to load categories')
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('erp_categories')
      if (stored) {
        setCategories(JSON.parse(stored))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditingCategory(null)
      setFormData(INITIAL_CATEGORY)
    }
    setError('')
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingCategory(null)
    setFormData(INITIAL_CATEGORY)
    setError('')
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    setError('')
    try {
      if (editingCategory) {
        // Update existing category
        const categoryId = parseInt(editingCategory.id)
        if (isNaN(categoryId)) {
          setError('Invalid category ID')
          return
        }

        const api = getCategoriesApi()
        const response = await api.v1ApiCategoriesIdPut(
          {
            categoryName: formData.name,
            description: formData.description || undefined,
          },
          categoryId
        )

        if (response.data) {
          const updatedCategory = mapApiCategoryToLocal(response.data)
          setCategories(
            categories.map((c) => (c.id === editingCategory.id ? updatedCategory : c))
          )
          handleClose()
        }
      } else {
        // Create new category
        const api = getCategoriesApi()
        const response = await api.v1ApiCategoriesPost({
          categoryName: formData.name,
          description: formData.description || undefined,
        })

        if (response.data) {
          const newCategory = mapApiCategoryToLocal(response.data)
          setCategories([...categories, newCategory])
          handleClose()
        }
      }
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err?.message || 'Failed to save category. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    const categoryId = parseInt(id)
    if (isNaN(categoryId)) {
      alert('Invalid category ID')
      return
    }

    try {
      const api = getCategoriesApi()
      await api.v1ApiCategoriesIdDelete(categoryId)
      // Remove from local state
      setCategories(categories.filter((c) => c.id !== id))
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('categoriesUpdated'))
    } catch (err: any) {
      console.error('Error deleting category:', err)
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete category'
      alert(errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            bgcolor: '#FF6B35',
            '&:hover': {
              bgcolor: '#FF8E53',
            },
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search categories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" display="block">
                      {categories.length === 0
                        ? 'No categories found. Click "Add Category" to create one.'
                        : 'No categories match your search.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CategoryIcon color="primary" fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(category.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(category.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(category)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(category.id)
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Category Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CategoriesPage

