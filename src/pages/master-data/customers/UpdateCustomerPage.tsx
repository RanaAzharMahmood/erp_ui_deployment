import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Alert, Snackbar } from '@mui/material';
import {
  CustomerDetailsCard,
  AddressDetailsCard,
  FinancialDetailsCard,
  CustomerStatusCard,
  CustomerFormActions,
  CustomerPageLayout,
} from '../../../components/customers';
import { FormSkeleton } from '../../../components/common';
import { useCustomerForm } from '../../../hooks/useCustomerForm';

const UpdateCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    formData,
    fieldErrors,
    customerExists,
    isLoading,
    isSaving,
    error,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    navigateToList,
  } = useCustomerForm({ customerId: id });

  if (isLoading) {
    return <FormSkeleton showDangerZone />;
  }

  if (!customerExists) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Customer not found
        </Typography>
        <Button onClick={navigateToList} variant="contained">
          Back to Customers
        </Button>
      </Box>
    );
  }

  const leftColumn = (
    <>
      <CustomerDetailsCard
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
      />
      <AddressDetailsCard
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={handleInputChange}
      />
      <FinancialDetailsCard
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={handleInputChange}
      />
    </>
  );

  const rightColumn = (
    <>
      <Box sx={{ mb: 3 }}>
        <CustomerStatusCard formData={formData} onStatusChange={handleStatusChange} />
      </Box>
      <CustomerFormActions
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitLabel={isSaving ? 'Saving...' : 'Save Changes'}
        onDelete={handleDelete}
        isSubmitting={isSaving}
      />
    </>
  );

  return (
    <>
      <CustomerPageLayout
        title="Update Customer"
        onBack={navigateToList}
        leftColumn={leftColumn}
        rightColumn={rightColumn}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateCustomerPage;
