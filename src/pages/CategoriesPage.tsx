import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CategoryIcon from '@mui/icons-material/Category'
import { Category } from '../types'

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

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const stored = localStorage.getItem('erp_categories')
    setCategories(stored ? JSON.parse(stored) : [])
    setLoading(false)
  }

  const saveCategories = (newCategories: Category[]) => {
    localStorage.setItem('erp_categories', JSON.stringify(newCategories))
    setCategories(newCategories)
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('categoriesUpdated'))
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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...editingCategory,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
      saveCategories(updated)
    } else {
      const newCategory: Category = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveCategories([...categories, newCategory])
    }
    handleClose()
  }

  const handleDelete = (id: string) => {
    // Check if category is used by any products
    const products = JSON.parse(localStorage.getItem('erp_products') || '[]')
    const isUsed = products.some((p: { categoryId: string }) => p.categoryId === id)

    if (isUsed) {
      alert('Cannot delete category that is assigned to products')
      return
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      saveCategories(categories.filter((c) => c.id !== id))
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No categories found. Click "Add Category" to create one.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CategoryIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        {category.name}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpen(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(category.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {category.description && (
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

