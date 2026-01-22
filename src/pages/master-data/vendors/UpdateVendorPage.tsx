import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import { VendorForm } from '../../../components/vendors';
import { FormSkeleton } from '../../../components/common';
import { useVendorForm } from '../../../hooks';

const UpdateVendorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    formData,
    fieldErrors,
    vendorExists,
    isLoading,
    isSubmitting,
    error,
    handleInputChange,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    handleDelete,
    navigateToList,
  } = useVendorForm({ vendorId: id });

  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  if (isLoading) {
    return <FormSkeleton showDangerZone />;
  }

  if (!vendorExists) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Vendor not found
        </Typography>
        <Button onClick={navigateToList} variant="contained">
          Back to Vendors
        </Button>
      </Box>
    );
  }

  return (
    <>
      <VendorForm
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={handleInputChange}
        onStatusChange={handleStatusChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onBack={navigateToList}
        onDelete={handleDelete}
        title="Update Vendor"
        submitLabel="Save Changes"
        showDangerZone
        isSubmitting={isSubmitting}
      />

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateVendorPage;
