import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import DangerZone from '../../../components/common/DangerZone';
import {
  PartyDetailsSection,
  ContactDetailsSection,
  CompanyStatusSection,
  PartyFormActions,
  PartyFormSkeleton,
  PartyNotifications,
} from '../../../components/parties';
import { usePartyForm } from '../../../hooks/usePartyForm';

const UpdatePartyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    formData,
    companies,
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
  } = usePartyForm({ partyId: id, mode: 'update' });

  if (loading) {
    return <PartyFormSkeleton showDangerZone />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Update Party" showBackButton />

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
            showCompanySelector
            title="Customer Details"
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

          <DangerZone onDelete={handleDelete} itemName="Party" isDeleting={isDeleting} />

          <PartyFormActions
            mode="update"
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

export default UpdatePartyPage;
