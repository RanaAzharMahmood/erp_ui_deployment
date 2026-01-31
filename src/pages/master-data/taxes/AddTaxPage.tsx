import React from 'react';
import { Box, Grid, Divider } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import { TaxForm, TaxFormActions, TaxNotifications } from '../../../components/taxes';
import { useTaxForm } from '../../../hooks/useTaxForm';

const AddTaxPage: React.FC = () => {
  const {
    formData,
    fieldErrors,
    isSubmitting,
    error,
    successMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    setError,
    setSuccessMessage,
  } = useTaxForm({ mode: 'add' });

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Add Tax" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <TaxForm
            formData={formData}
            fieldErrors={fieldErrors}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            placeholders={{
              taxId: 'T121',
              taxName: 'GST',
              note: 'Write note about Tax',
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
              options={['Active', 'Prospect', 'Inactive']}
            />
          </FormSection>

          {/* Action Buttons */}
          <TaxFormActions
            mode="add"
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

export default AddTaxPage;
