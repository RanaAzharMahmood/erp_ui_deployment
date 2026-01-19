import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Inventory as InventoryIcon,
  Circle as CircleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';

interface ItemFormData {
  itemCode: string;
  itemHashCode: string;
  itemName: string;
  categoryId: number | '';
  unitPrice: string;
  purchasePrice: string;
  salePrice: string;
  unitOfMeasure: string;
  openingStock: string;
  closingStock: string;
  companyId: number | '';
  description: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

const UNITS = ['KG', 'Metric Ton', 'Piece', 'Liter', 'Meter'];

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ItemFormData>({
    itemCode: '',
    itemHashCode: '',
    itemName: '',
    categoryId: '',
    unitPrice: '',
    purchasePrice: '',
    salePrice: '',
    unitOfMeasure: '',
    openingStock: '',
    closingStock: '',
    companyId: '',
    description: '',
    status: 'Active',
  });
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load categories and companies
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed.map((c: any) => ({ id: c.id, name: c.categoryName })));
      }

      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies);
        setCompanies(parsed.map((c: any) => ({ id: c.id, name: c.companyName })));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

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

  const handleStatusChange = useCallback((status: 'Active' | 'Prospect' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.itemCode || !formData.itemHashCode || !formData.itemName || !formData.categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const items = JSON.parse(localStorage.getItem('items') || '[]');
      const category = categories.find(c => c.id === formData.categoryId);
      const company = companies.find(c => c.id === formData.companyId);

      const newItem = {
        id: String(Date.now()),
        itemCode: formData.itemCode,
        itemHashCode: formData.itemHashCode,
        itemName: formData.itemName,
        categoryId: formData.categoryId,
        categoryName: category?.name || '',
        companyId: formData.companyId,
        companyName: company?.name || '',
        unitPrice: parseFloat(formData.unitPrice) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        unitOfMeasure: formData.unitOfMeasure,
        openingStock: parseFloat(formData.openingStock) || 0,
        currentStock: parseFloat(formData.closingStock) || 0,
        description: formData.description,
        isActive: formData.status === 'Active',
        createdAt: new Date().toISOString(),
      };

      items.push(newItem);
      localStorage.setItem('items', JSON.stringify(items));

      setSuccessMessage('Item created successfully!');
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create item. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, categories, companies, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/inventory');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Create Item" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Item Details" icon={<InventoryIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Item Id *
                </Typography>
                <TextField
                  fullWidth
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  placeholder="G1215"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Item Hash Code *
                </Typography>
                <TextField
                  fullWidth
                  name="itemHashCode"
                  value={formData.itemHashCode}
                  onChange={handleInputChange}
                  placeholder="REW01245"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Item Name *
                </Typography>
                <TextField
                  fullWidth
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  placeholder="LPG Gas"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Category *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => handleSelectChange('categoryId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Unite Price
                </Typography>
                <TextField
                  fullWidth
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  placeholder="00"
                  size="small"
                  type="number"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Purchase Price
                </Typography>
                <TextField
                  fullWidth
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="00"
                  size="small"
                  type="number"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Sales Price
                </Typography>
                <TextField
                  fullWidth
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  placeholder="00"
                  size="small"
                  type="number"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Measuring Units
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.unitOfMeasure}
                    onChange={(e) => handleSelectChange('unitOfMeasure', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Unit</MenuItem>
                    {UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Open Stocks
                </Typography>
                <TextField
                  fullWidth
                  name="openingStock"
                  value={formData.openingStock}
                  onChange={handleInputChange}
                  placeholder="Enter Open Stocks in  KG"
                  size="small"
                  type="number"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Close Stocks
                </Typography>
                <TextField
                  fullWidth
                  name="closingStock"
                  value={formData.closingStock}
                  onChange={handleInputChange}
                  placeholder="Enter Close Stocks in  KG"
                  size="small"
                  type="number"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                    <MenuItem value="" disabled>Select Company</MenuItem>
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
                  placeholder="Write About Item"
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
              options={['Active', 'Prospect', 'Inactive']}
            />
          </FormSection>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
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
              startIcon={<AddIcon />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B',
                },
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Item'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
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

      {/* Error Snackbar */}
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

export default AddItemPage;
