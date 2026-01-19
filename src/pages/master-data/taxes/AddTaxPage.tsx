import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Add as AddIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';

interface TaxFormData {
  taxId: string;
  taxName: string;
  taxPercentage: string;
  taxDate: string;
  note: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

const TAX_PERCENTAGES = ['5', '10', '12', '15', '16', '17', '18', '19', '20'];

const AddTaxPage: React.FC = () => {
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
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    if (!formData.taxId || !formData.taxPercentage) {
      setError('Tax ID and Tax Percentage are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const taxes = JSON.parse(localStorage.getItem('taxes') || '[]');

      const newTax = {
        id: String(Date.now()),
        taxId: formData.taxId,
        taxName: formData.taxName,
        taxPercentage: parseFloat(formData.taxPercentage),
        taxDate: formData.taxDate,
        note: formData.note,
        isActive: formData.status === 'Active',
        status: formData.status,
        createdAt: new Date().toISOString(),
      };

      taxes.push(newTax);
      localStorage.setItem('taxes', JSON.stringify(taxes));

      setSuccessMessage('Tax created successfully!');
      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err) {
      console.error('Error creating tax:', err);
      setError('Failed to create tax. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/tax');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Add Tax" showBackButton />

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
                  placeholder="T121"
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
                  placeholder="GST"
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
                    <MenuItem value="" disabled>12 %</MenuItem>
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
                  placeholder="dd/mm/yy"
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
                  placeholder="Write note about Tax"
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
              {isSubmitting ? 'Creating...' : 'Add Voucher'}
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

export default AddTaxPage;
