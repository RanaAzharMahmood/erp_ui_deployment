import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import FormSection from '../components/common/FormSection';
import StatusSelector from '../components/common/StatusSelector';
import DangerZone from '../components/common/DangerZone';
import ActionButtons from '../components/common/ActionButtons';
import LazyImage from '../components/common/LazyImage';
import { optimizeImage, validateImage } from '../utils/imageOptimizer';
import type { CompanyFormData, Status } from '../types/common.types';

// Memoized Logo Upload Component for better performance
const LogoUploadSection = memo(
  ({
    logoPreview,
    onLogoUpload,
    onLogoRemove,
  }: {
    logoPreview: string;
    onLogoUpload: (file: File) => Promise<void>;
    onLogoRemove: () => void;
  }) => {
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onLogoUpload(file);
      }
    };

    return (
      <Box
        sx={{
          position: 'relative',
          border: '2px dashed #E0E0E0',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: logoPreview ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        {logoPreview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <LazyImage
              src={logoPreview}
              alt="Company Logo"
              width={200}
              height={120}
              borderRadius="8px"
              objectFit="contain"
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => document.getElementById('logo-upload')?.click()}
                sx={{
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <EditIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onLogoRemove}
                sx={{
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18, color: '#EF5350' }} />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{ cursor: 'pointer' }}
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
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
            <Box sx={{ typography: 'body2', fontWeight: 500, mb: 0.5 }}>
              Upload Company logo
            </Box>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
              SVG, PNG, JPG or GIF (max. 2MB)
            </Box>
          </Box>
        )}
        <input
          type="file"
          id="logo-upload"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />
      </Box>
    );
  }
);

LogoUploadSection.displayName = 'LogoUploadSection';

const UpdateCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<CompanyFormData>({
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
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load company data on mount
  useEffect(() => {
    if (!id) {
      navigate('/companies');
      return;
    }

    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    const company = companies.find((c: any) => c.id === id);

    if (!company) {
      navigate('/companies');
      return;
    }

    setFormData({
      companyName: company.companyName || '',
      ntnNumber: company.ntnNumber || company.user || '',
      website: company.website || '',
      industry: company.industry || '',
      salesTaxNumber: company.salesTaxNumber || '',
      companyEmail: company.companyEmail || '',
      address: company.address || '',
      contactName: company.contactName || '',
      contactEmail: company.contactEmail || '',
      contactPhone: company.contactPhone || '',
      status: company.status || 'Active',
      logo: company.logo || '',
    });

    if (company.logo) {
      setLogoPreview(company.logo);
    }
  }, [id, navigate]);

  // Memoized input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Memoized status change handler
  const handleStatusChange = useCallback((status: Status) => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  // Optimized logo upload with image compression
  const handleLogoUpload = useCallback(async (file: File) => {
    // Validate image
    const validation = validateImage(file, 2);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Optimize image (resize to max 200x200, 80% quality)
      const optimizedLogo = await optimizeImage(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
        format: 'image/jpeg',
      });

      setLogoPreview(optimizedLogo);
      setFormData((prev) => ({ ...prev, logo: optimizedLogo }));
    } catch (error) {
      console.error('Error optimizing image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, []);

  // Memoized logo removal handler
  const handleLogoRemove = useCallback(() => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, logo: '' }));
  }, []);

  // Memoized submit handler
  const handleSubmit = useCallback(async () => {
    // Validation
    if (
      !formData.companyName ||
      !formData.ntnNumber ||
      !formData.industry ||
      !formData.companyEmail
    ) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing companies
      const companies = JSON.parse(localStorage.getItem('companies') || '[]');

      // Find and update company
      const updatedCompanies = companies.map((company: any) =>
        company.id === id
          ? {
              ...company,
              ...formData,
              user: formData.ntnNumber,
              updatedAt: new Date().toISOString(),
            }
          : company
      );

      // Save to localStorage
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));

      // Navigate back with slight delay for better UX
      setTimeout(() => {
        navigate('/companies');
      }, 300);
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Failed to update company. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, id, navigate]);

  // Memoized delete handler
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      // Get existing companies
      const companies = JSON.parse(localStorage.getItem('companies') || '[]');

      // Filter out deleted company
      const updatedCompanies = companies.filter((company: any) => company.id !== id);

      // Save to localStorage
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));

      // Close dialog and navigate
      setDeleteDialogOpen(false);
      setTimeout(() => {
        navigate('/companies');
      }, 300);
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
      setIsDeleting(false);
    }
  }, [id, navigate]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    navigate('/companies');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <PageHeader title="Edit Company" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Company Information */}
          <FormSection title="Company Information" icon={<BusinessIcon />}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Input your email"
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
                  placeholder="www.incognogas.com"
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
                  placeholder="e.g incognito"
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
                  placeholder="Incogno Gas — powering progress with trust and energy..."
                  multiline
                  rows={4}
                  size="small"
                />
              </Grid>
            </Grid>
          </FormSection>

          <Box sx={{ mt: 3 }}>
            {/* Primary Contact */}
            <FormSection title="Primary Contact" icon={<PersonIcon />}>
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
            </FormSection>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Company Logo */}
          <FormSection title="Company Logo" icon={<ImageIcon />} sx={{ mb: 3 }}>
            <LogoUploadSection
              logoPreview={logoPreview}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={handleLogoRemove}
            />
          </FormSection>

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <StatusSelector value={formData.status} onChange={handleStatusChange} />
          </FormSection>

          {/* Action Buttons */}
          <ActionButtons
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />

          {/* Danger Zone */}
          <Box sx={{ mt: 3 }}>
            <DangerZone
              onDelete={() => setDeleteDialogOpen(true)}
              itemName="company"
              isDeleting={isDeleting}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Company</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be undone
            and all associated data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Company'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpdateCompanyPage;
