import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  Typography,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import { ImageUploadSection, CompanyAccessSection } from '../../../components/users/UserFormComponents';
import { useCompanyAccess } from '../../../hooks/useCompanyAccess';
import { useCompanies } from '../../../hooks';
import { optimizeImage, validateImage } from '../../../utils/imageOptimizer';
import type { UserFormData } from '../../../types/common.types';
import { getUsersApi } from '../../../generated/api/client';
import type { CreateUserRequest } from '../../../generated/api/api';

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    cnic: '',
    phone: '',
    about: '',
    imageUrl: '',
    status: 'Active',
    companyAccess: [],
  });
  const [password, setPassword] = useState('');
  const [contactNo2, setContactNo2] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Get companies from hook with refetch capability
  const { companies: companiesData, refetch: refetchCompanies } = useCompanies();
  const companies = companiesData.map((c) => ({ id: c.id, name: c.name }));

  // Refetch companies on mount to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  // Use the shared company access hook
  const {
    extendedCompanyAccess,
    selectedCompanyId,
    setSelectedCompanyId,
    handleAddCompany,
    handleRemoveCompany,
    handleUpdateCompanyRole,
    handleTogglePermission,
    handleSelectAll,
    handleModuleToggle,
    totalPermissions,
    uniqueRoles,
  } = useCompanyAccess({
    companies,
    onError: setError,
  });

  // Memoized input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Memoized status change handler
  const handleStatusChange = useCallback((status: 'Active' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  // Optimized image upload with compression
  const handleImageUpload = useCallback(async (file: File) => {
    const validation = validateImage(file, 2);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const optimizedImage = await optimizeImage(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
        format: 'image/jpeg',
      });

      setImagePreview(optimizedImage);
      setFormData((prev) => ({ ...prev, imageUrl: optimizedImage }));
    } catch (error) {
      console.error('Error optimizing image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, []);

  // Memoized image removal handler
  const handleImageRemove = useCallback(() => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  }, []);

  // Memoized submit handler with API
  const handleSubmit = useCallback(async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.email ||
      !password ||
      extendedCompanyAccess.length === 0
    ) {
      setError('Please fill in all required fields and add at least one company');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const usersApi = getUsersApi();

      // Prepare API payload
      const payload: CreateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || undefined,
        password: password,
        roleId: extendedCompanyAccess[0]?.roleId || 4,
        companyIds: extendedCompanyAccess.map((access) => access.companyId),
        permissionIds: [],
      };

      // Call API
      await usersApi.v1ApiUsersPost(payload);

      setSuccessMessage('User created successfully!');

      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, password, extendedCompanyAccess, navigate]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Add User" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* User Information */}
          <FormSection title="User Information" icon={<BusinessIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  First Name *
                </Typography>
                <TextField
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Harry"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  CNIC *
                </Typography>
                <TextField
                  fullWidth
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  placeholder="00000-0000000-0"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Contact No
                </Typography>
                <TextField
                  fullWidth
                  value={contactNo2}
                  onChange={(e) => setContactNo2(e.target.value)}
                  placeholder="+92 123 4567"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Contact No *
                </Typography>
                <TextField
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+92 123 4567"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Password *
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  About User
                </Typography>
                <TextField
                  fullWidth
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  placeholder="Write something About User"
                  multiline
                  rows={2}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
            </Grid>
          </FormSection>

          <Box sx={{ mt: 3 }}>
            {/* Company Access and Rules */}
            <FormSection title="Company Access And Rules" icon={<BusinessIcon />}>
              <Divider sx={{ mb: 3, mt: -1 }} />
              <CompanyAccessSection
                companies={companies}
                companyAccess={extendedCompanyAccess}
                selectedCompanyId={selectedCompanyId}
                onSelectedCompanyChange={setSelectedCompanyId}
                onAddCompany={handleAddCompany}
                onRemoveCompany={handleRemoveCompany}
                onRoleChange={handleUpdateCompanyRole}
                onPermissionToggle={handleTogglePermission}
                onSelectAll={handleSelectAll}
                onModuleToggle={handleModuleToggle}
              />
            </FormSection>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* User Image */}
          <FormSection title="User image" icon={<ImageIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <ImageUploadSection
              imagePreview={imagePreview}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              inputId="user-image-upload-add"
            />
          </FormSection>

          {/* Summary */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SendIcon sx={{ color: '#FF6B35', fontSize: 20, transform: 'rotate(-45deg)' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Summary
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#FF6B35' }}>
                  Companies:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B35' }}>
                  {extendedCompanyAccess.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#FF6B35' }}>
                  Roles Assign:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B35' }}>
                  {uniqueRoles}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#FF6B35' }}>
                  Total Permissions:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B35' }}>
                  {totalPermissions}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <StatusSelector
              value={formData.status}
              onChange={handleStatusChange}
              options={['Active', 'Inactive']}
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
              {isSubmitting ? 'Creating...' : 'Add User'}
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
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
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

export default AddUserPage;
