import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Circle as CircleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import DangerZone from '../../../components/common/DangerZone';

interface CategoryFormData {
  categoryName: string;
  companyId: number | '';
  description: string;
  status: 'Active' | 'Inactive';
}

const UpdateCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    categoryName: '',
    companyId: '',
    description: '',
    status: 'Active',
  });
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    try {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies);
        setCompanies(parsed.map((c: any) => ({ id: c.id, name: c.companyName })));
      }

      const savedCategories = localStorage.getItem('categories');
      if (savedCategories && id) {
        const categories = JSON.parse(savedCategories);
        const category = categories.find((c: any) => String(c.id) === id);
        if (category) {
          setFormData({
            categoryName: category.categoryName || '',
            companyId: category.companyId || '',
            description: category.description || '',
            status: category.isActive ? 'Active' : 'Inactive',
          });
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStatusChange = useCallback((status: 'Active' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.categoryName) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const categories = JSON.parse(localStorage.getItem('categories') || '[]');
      const company = companies.find(c => c.id === formData.companyId);

      const updatedCategories = categories.map((cat: any) => {
        if (String(cat.id) === id) {
          return {
            ...cat,
            categoryName: formData.categoryName,
            companyId: formData.companyId,
            companyName: company?.name || cat.companyName,
            description: formData.description,
            isActive: formData.status === 'Active',
            updatedAt: new Date().toISOString(),
          };
        }
        return cat;
      });

      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      setSuccessMessage('Category updated successfully!');
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, companies, id, navigate]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const categories = JSON.parse(localStorage.getItem('categories') || '[]');
      const updatedCategories = categories.filter((c: any) => String(c.id) !== id);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
      setIsDeleting(false);
    }
  }, [id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/categories');
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Edit Category" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Item Category" icon={<CategoryIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Category Name *
                </Typography>
                <TextField
                  fullWidth
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  placeholder="Gas"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Company
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange('companyId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">Select Company</MenuItem>
                    {companies.map((comp) => (
                      <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write About Category"
                  multiline
                  rows={4}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
            </Grid>
          </FormSection>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <StatusSelector
              value={formData.status}
              onChange={handleStatusChange}
              options={['Active', 'Inactive']}
            />
          </FormSection>

          {/* Danger Zone */}
          <DangerZone
            onDelete={handleDelete}
            itemName="Category"
            isDeleting={isDeleting}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                textTransform: 'none',
                borderColor: '#E5E7EB',
                color: '#374151',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B',
                },
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateCategoryPage;
