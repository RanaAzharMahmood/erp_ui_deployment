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
  Divider,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Circle as CircleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import DangerZone from '../../../components/common/DangerZone';

interface TaxFormData {
  taxId: string;
  taxName: string;
  taxPercentage: string;
  taxDate: string;
  note: string;
  status: 'Active' | 'Inactive';
}

const TAX_PERCENTAGES = ['5', '10', '12', '15', '16', '17', '18', '19', '20'];

const UpdateTaxPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TaxFormData>({
    taxId: '',
    taxName: '',
    taxPercentage: '',
    taxDate: '',
    note: '',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load tax data
  useEffect(() => {
    try {
      const savedTaxes = localStorage.getItem('taxes');
      if (savedTaxes && id) {
        const taxes = JSON.parse(savedTaxes);
        const tax = taxes.find((t: any) => t.id === id);
        if (tax) {
          setFormData({
            taxId: tax.taxId || '',
            taxName: tax.taxName || '',
            taxPercentage: String(tax.taxPercentage || ''),
            taxDate: tax.taxDate || '',
            note: tax.note || '',
            status: tax.isActive ? 'Active' : 'Inactive',
          });
        }
      }
    } catch (err) {
      console.error('Error loading tax:', err);
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
    if (!formData.taxId || !formData.taxPercentage) {
      setError('Tax ID and Tax Percentage are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const taxes = JSON.parse(localStorage.getItem('taxes') || '[]');

      const updatedTaxes = taxes.map((tax: any) => {
        if (tax.id === id) {
          return {
            ...tax,
            taxId: formData.taxId,
            taxName: formData.taxName,
            taxPercentage: parseFloat(formData.taxPercentage),
            taxDate: formData.taxDate,
            note: formData.note,
            isActive: formData.status === 'Active',
            status: formData.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return tax;
      });

      localStorage.setItem('taxes', JSON.stringify(updatedTaxes));

      setSuccessMessage('Tax updated successfully!');
      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err) {
      console.error('Error updating tax:', err);
      setError('Failed to update tax. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, id, navigate]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this tax? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const taxes = JSON.parse(localStorage.getItem('taxes') || '[]');
      const updatedTaxes = taxes.filter((t: any) => t.id !== id);
      localStorage.setItem('taxes', JSON.stringify(updatedTaxes));

      setSuccessMessage('Tax deleted successfully!');
      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err) {
      console.error('Error deleting tax:', err);
      setError('Failed to delete tax. Please try again.');
      setIsDeleting(false);
    }
  }, [id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/tax');
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
      <PageHeader title="Update Tax" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Tax Details" icon={<DescriptionIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Tax Id *
                </Typography>
                <TextField
                  fullWidth
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="T546"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Tax Name
                </Typography>
                <TextField
                  fullWidth
                  name="taxName"
                  value={formData.taxName}
                  onChange={handleInputChange}
                  placeholder="GST 2024"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Tax %age *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.taxPercentage}
                    onChange={(e) => handleSelectChange('taxPercentage', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select</MenuItem>
                    {TAX_PERCENTAGES.map((pct) => (
                      <MenuItem key={pct} value={pct}>{pct}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Tax Date
                </Typography>
                <TextField
                  fullWidth
                  name="taxDate"
                  type="date"
                  value={formData.taxDate}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Note
                </Typography>
                <TextField
                  fullWidth
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="its GSt applied in 2024"
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
              onChange={handleStatusChange as (status: 'Active' | 'Prospect' | 'Inactive') => void}
              options={['Active', 'Inactive']}
            />
          </FormSection>

          {/* Danger Zone */}
          <DangerZone
            onDelete={handleDelete}
            itemName="Tax"
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

export default UpdateTaxPage;
