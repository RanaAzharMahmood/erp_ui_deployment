import React from 'react';
import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import {
  CustomerDetailsCard,
  AddressDetailsCard,
  FinancialDetailsCard,
  CustomerStatusCard,
  CustomerFormActions,
  CustomerPageLayout,
} from '../../../components/customers';
import { useCustomerForm } from '../../../hooks/useCustomerForm';

const AddCustomerPage: React.FC = () => {
  const {
    formData,
    fieldErrors,
    isSaving,
    error,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    navigateToList,
  } = useCustomerForm();

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
      <CustomerStatusCard formData={formData} onStatusChange={handleStatusChange} />
      <Box sx={{ mt: 3 }}>
        <CustomerFormActions
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          submitLabel={isSaving ? 'Saving...' : 'Add Customer'}
          isSubmitting={isSaving}
        />
      </Box>
    </>
  );

  return (
    <>
      <CustomerPageLayout
        title="Add Customer"
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

export default AddCustomerPage;
