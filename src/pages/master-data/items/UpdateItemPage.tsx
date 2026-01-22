import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { ItemFormFields, ItemFormActions } from '../../../components/items';
import { ItemFormSkeleton } from '../../../components/forms';
import { useItemForm } from '../../../hooks/useItemForm';

const UpdateItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    formData,
    fieldErrors,
    categories,
    companies,
    isSubmitting,
    isDeleting,
    loading,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleUpdate,
    handleDelete,
    handleCancel,
  } = useItemForm({ itemId: id });

  if (loading) {
    return <ItemFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Edit Item" showBackButton />

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
            mode="edit"
            status={formData.status}
            isSubmitting={isSubmitting}
            isDeleting={isDeleting}
            error={error}
            successMessage={successMessage}
            onStatusChange={handleStatusChange}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onErrorClose={() => setError('')}
            onSuccessClose={() => setSuccessMessage('')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpdateItemPage;
