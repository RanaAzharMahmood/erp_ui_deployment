import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { getCompaniesApi } from '../../../generated/api/client';
import type { ApiCompaniesBody } from '../../../generated/api/api';

interface CompanyFormData {
  companyName: string;
  ntnNumber: string;
  website: string;
  industry: string;
  salesTaxNumber: string;
  companyEmail: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Active' | 'Prospect' | 'Inactive';
  logo?: string;
}

const initialFormState: CompanyFormData = {
  companyName: '',
  ntnNumber: '',
  website: '',
  industry: '',
  salesTaxNumber: '',
  companyEmail: '',
  address: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  status: 'Active',
  logo: '',
};

const AddCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyFormData>(initialFormState);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as 'Active' | 'Prospect' | 'Inactive',
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.companyName ||
      !formData.ntnNumber ||
      !formData.industry ||
      !formData.companyEmail
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const companiesApi = getCompaniesApi();

      // Prepare API payload
      const payload: ApiCompaniesBody = {
        name: formData.companyName,
        address: formData.address || undefined,
        city: undefined, // Not in form yet
        phone: formData.contactPhone || undefined,
        logoUrl: formData.logo || undefined,
        ntnNumber: formData.ntnNumber || undefined,
        salesTaxRegistrationNo: formData.salesTaxNumber || undefined,
      };

      // Call API
      await companiesApi.v1ApiCompaniesPost(payload);

      // Also save to localStorage for offline support
      const existingCompanies = JSON.parse(
        localStorage.getItem('companies') || '[]'
      );

      const newCompany = {
        ...formData,
        id: Date.now(),
        companyName: formData.companyName,
        industry: formData.industry,
        user: formData.ntnNumber,
        status: formData.status,
        subscriptionEnd: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0],
        logo: formData.logo,
      };

      localStorage.setItem(
        'companies',
        JSON.stringify([...existingCompanies, newCompany])
      );

      setSuccessMessage('Company created successfully!');

      // Navigate back to companies list after a short delay
      setTimeout(() => {
        navigate('/companies');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating company:', err);
      setError('Failed to create company. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 3,
          color: '#1A1A1A',
        }}
      >
        Add Company
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Company Information Card */}
          <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Company Information
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NTN Number"
                  name="ntnNumber"
                  value={formData.ntnNumber}
                  onChange={handleInputChange}
                  placeholder="1451566"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="www.example.com"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="Gas & Fuel"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sales Tax Number"
                  name="salesTaxNumber"
                  value={formData.salesTaxNumber}
                  onChange={handleInputChange}
                  placeholder="AA000000"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Email"
                  name="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Tell about the company"
                  multiline
                  rows={4}
                  size="small"
                />
              </Grid>
            </Grid>
          </Card>

          {/* Primary Contact Card */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Primary Contact
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="John Herry"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Phone Number"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="045 4515 545485"
                  size="small"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Company Logo Card */}
          <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Company Logo
              </Typography>
            </Box>

            <Box
              sx={{
                border: '2px dashed #E0E0E0',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#FF6B35',
                  bgcolor: 'rgba(255, 107, 53, 0.02)',
                },
              }}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {logoPreview ? (
                <Avatar
                  src={logoPreview}
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                  }}
                />
              ) : (
                <IconButton
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'rgba(255, 107, 53, 0.1)',
                    mb: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 107, 53, 0.2)',
                    },
                  }}
                >
                  <ImageIcon sx={{ color: '#FF6B35', fontSize: 32 }} />
                </IconButton>
              )}
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                hidden
                onChange={handleLogoUpload}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Upload Company logo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                SVG, PNG, JPG or GIF (max. 2MB)
              </Typography>
            </Box>
          </Card>

          {/* Status Card */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircleIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status
              </Typography>
            </Box>

            <FormControl component="fieldset">
              <RadioGroup
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
              >
                <FormControlLabel
                  value="Active"
                  control={
                    <Radio
                      sx={{
                        color: '#FF6B35',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  value="Prospect"
                  control={
                    <Radio
                      sx={{
                        color: '#FF6B35',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label="Prospect"
                />
                <FormControlLabel
                  value="Inactive"
                  control={
                    <Radio
                      sx={{
                        color: '#FF6B35',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label="Inactive"
                />
              </RadioGroup>
            </FormControl>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            px: 4,
            py: 1,
            textTransform: 'none',
            borderColor: '#E0E0E0',
            color: '#666666',
            '&:hover': {
              borderColor: '#BDBDBD',
              bgcolor: 'rgba(0, 0, 0, 0.02)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            px: 4,
            py: 1,
            textTransform: 'none',
            bgcolor: '#FF6B35',
            '&:hover': {
              bgcolor: '#FF8E53',
            },
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Creating...
            </>
          ) : (
            'Add Company'
          )}
        </Button>
      </Box>

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

export default AddCompanyPage;
