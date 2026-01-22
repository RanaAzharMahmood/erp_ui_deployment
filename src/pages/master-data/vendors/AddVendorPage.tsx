import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { VendorForm } from '../../../components/vendors';
import { useVendorForm } from '../../../hooks';

const AddVendorPage: React.FC = () => {
  const {
    formData,
    fieldErrors,
    isSubmitting,
    error,
    handleInputChange,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    navigateToList,
  } = useVendorForm();

  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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
        title="Add Vendor"
        submitLabel="Add Vendor"
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

export default AddVendorPage;
