import React from 'react';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import {
  PartyDetailsSection,
  ContactDetailsSection,
  CompanyStatusSection,
  PartyFormActions,
  PartyNotifications,
} from '../../../components/parties';
import { usePartyForm } from '../../../hooks/usePartyForm';

const AddPartyPage: React.FC = () => {
  const {
    formData,
    companies,
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
  } = usePartyForm({ mode: 'add' });

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Add party" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <PartyDetailsSection
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />

          <ContactDetailsSection
            formData={formData}
            companies={companies}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            title="Contact Details"
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <CompanyStatusSection
            formData={formData}
            companies={companies}
            onSelectChange={handleSelectChange}
            onStatusChange={handleStatusChange}
          />

          <PartyFormActions
            mode="add"
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </Grid>
      </Grid>

      <PartyNotifications
        successMessage={successMessage}
        error={error}
        onCloseSuccess={() => setSuccessMessage('')}
        onCloseError={() => setError('')}
      />
    </Box>
  );
};

export default AddPartyPage;
