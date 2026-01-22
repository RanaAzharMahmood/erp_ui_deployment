import React from 'react';
import { Box, Grid, Snackbar, Alert } from '@mui/material';
import { Image as ImageIcon, Circle as CircleIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import ActionButtons from '../../../components/common/ActionButtons';
import { CompanyFormFields, LogoUpload } from '../../../components/companies';
import { useCompanyForm } from '../../../hooks/useCompanyForm';

const AddCompanyPage: React.FC = () => {
  const {
    formData,
    logoPreview,
    isSubmitting,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    handleInputChange,
    handleStatusChange,
    handleLogoUpload,
    handleLogoRemove,
    handleSubmit,
    handleCancel,
  } = useCompanyForm({ mode: 'create' });

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <PageHeader title="Add Company" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <CompanyFormFields
            formData={formData}
            onInputChange={handleInputChange}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Company Logo */}
          <FormSection title="Company Logo" icon={<ImageIcon />} sx={{ mb: 3 }}>
            <LogoUpload
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
            submitLabel="Add Company"
            isSubmitting={isSubmitting}
          />
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

export default AddCompanyPage;
