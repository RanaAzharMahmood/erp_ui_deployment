import React from 'react';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { ItemFormFields, ItemFormActions } from '../../../components/items';
import { useItemForm } from '../../../hooks/useItemForm';

const AddItemPage: React.FC = () => {
  const {
    formData,
    fieldErrors,
    categories,
    companies,
    isSubmitting,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleCreate,
    handleCancel,
  } = useItemForm();

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Create Item" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <ItemFormFields
            formData={formData}
            fieldErrors={fieldErrors}
            categories={categories}
            companies={companies}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <ItemFormActions
            mode="create"
            status={formData.status}
            isSubmitting={isSubmitting}
            error={error}
            successMessage={successMessage}
            onStatusChange={handleStatusChange}
            onSubmit={handleCreate}
            onCancel={handleCancel}
            onErrorClose={() => setError('')}
            onSuccessClose={() => setSuccessMessage('')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddItemPage;
