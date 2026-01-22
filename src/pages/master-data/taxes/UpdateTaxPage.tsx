import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Divider } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import DangerZone from '../../../components/common/DangerZone';
import { TaxForm, TaxFormActions, TaxFormSkeleton, TaxNotifications } from '../../../components/taxes';
import { useTaxForm } from '../../../hooks/useTaxForm';

const UpdateTaxPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    formData,
    fieldErrors,
    isSubmitting,
    isDeleting,
    loading,
    error,
    successMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    setError,
    setSuccessMessage,
  } = useTaxForm({ mode: 'update', taxId: id });

  if (loading) {
    return <TaxFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Update Tax" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <TaxForm
            formData={formData}
            fieldErrors={fieldErrors}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            placeholders={{
              taxId: 'T546',
              taxName: 'GST 2024',
              note: 'its GSt applied in 2024',
            }}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <StatusSelector
              value={formData.status}
              onChange={handleStatusChange as (status: 'Active' | 'Prospect' | 'Inactive') => void}
              options={['Active', 'Inactive']}
            />
          </FormSection>

          {/* Danger Zone */}
          <DangerZone
            onDelete={handleDelete}
            itemName="Tax"
            isDeleting={isDeleting}
          />

          {/* Action Buttons */}
          <TaxFormActions
            mode="update"
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </Grid>
      </Grid>

      <TaxNotifications
        successMessage={successMessage}
        error={error}
        onSuccessClose={() => setSuccessMessage('')}
        onErrorClose={() => setError('')}
      />
    </Box>
  );
};

export default UpdateTaxPage;
