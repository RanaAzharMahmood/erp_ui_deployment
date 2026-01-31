import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Image as ImageIcon, Circle as CircleIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import DangerZone from '../../../components/common/DangerZone';
import ActionButtons from '../../../components/common/ActionButtons';
import { CompanyFormFields, CompanyFormSkeleton, LogoUpload } from '../../../components/companies';
import { useCompanyForm } from '../../../hooks/useCompanyForm';
import { getCompaniesApi } from '../../../generated/api/client';
import type { Company as ApiCompany } from '../../../generated/api/api';
// import type { Status } from '../../../types/common.types';

// Type for company data (includes fields from both API and extended local fields)
// interface _LocalStorageCompany {
//   id: number;
//   companyName?: string;
//   name?: string;
//   ntnNumber?: string;
//   website?: string;
//   industry?: string;
//   salesTaxNumber?: string;
//   salesTaxRegistrationNo?: string;
//   companyEmail?: string;
//   address?: string;
//   contactName?: string;
//   contactEmail?: string;
//   contactPhone?: string;
//   phone?: string;
//   status?: Status;
//   logo?: string;
//   logoUrl?: string;
//   user?: string;
//   subscriptionEnd?: string;
//   isActive?: boolean;
// }

// Extended company data type that includes both API fields and extended local fields
type ExtendedCompanyData = ApiCompany & {
  companyName?: string;
  salesTaxNumber?: string;
  companyEmail?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  user?: string;
  subscriptionEnd?: string;
};

// Type for API response wrapper
interface CompanyApiResponse {
  data?: ExtendedCompanyData;
}

const UpdateCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const {
    formData,
    setFormData,
    logoPreview,
    setLogoPreview,
    isSubmitting,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    fieldErrors,
    handleInputChange,
    handleStatusChange,
    handleLogoUpload,
    handleLogoRemove,
    handleSubmit,
    handleCancel,
  } = useCompanyForm({ mode: 'update', companyId: id });

  // Load company data from API on mount
  useEffect(() => {
    if (!id) {
      navigate('/companies');
      return;
    }

    const loadCompany = async () => {
      try {
        const companiesApi = getCompaniesApi();
        const response = await companiesApi.v1ApiCompaniesIdGet(Number(id));
        const jsonResponse = await response.json() as CompanyApiResponse;
        const company = jsonResponse?.data;

        if (!company) {
          navigate('/companies');
          return;
        }

        setFormData({
          companyName: company.name || company.companyName || '',
          ntnNumber: company.ntnNumber || '',
          website: company.website || '',
          industry: company.industry || '',
          salesTaxNumber: company.salesTaxRegistrationNo || company.salesTaxNumber || '',
          companyEmail: company.email || company.companyEmail || '',
          address: company.address || '',
          contactName: company.contactName || '',
          contactEmail: company.contactEmail || '',
          contactPhone: company.phone || company.contactPhone || '',
          status: company.isActive === false ? 'Inactive' : 'Active',
          logo: company.logoUrl || company.logo || '',
          user: company.user || '',
          subscriptionEnd: company.subscriptionEnd || '',
        });

        if (company.logoUrl || company.logo) {
          setLogoPreview(company.logoUrl || company.logo || '');
        }

        setIsLoading(false);
      } catch (err: unknown) {
        console.error('Error loading company from API:', err);
        setError('Failed to load company data.');
        navigate('/companies');
      }
    };

    loadCompany();
  }, [id, navigate, setFormData, setLogoPreview]);

  // Handle delete with API
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const companiesApi = getCompaniesApi();

      // Call API to delete
      await companiesApi.v1ApiCompaniesIdDelete(Number(id));

      setSuccessMessage('Company deleted successfully!');

      // Close dialog and navigate
      setDeleteDialogOpen(false);
      setTimeout(() => {
        navigate('/companies');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error deleting company:', err);
      setDeleteError('Failed to delete company. Please try again.');
      setIsDeleting(false);
    }
  }, [id, navigate, setSuccessMessage]);

  if (isLoading) {
    return <CompanyFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <PageHeader title="Edit Company" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <CompanyFormFields
            formData={formData}
            fieldErrors={fieldErrors}
            onInputChange={handleInputChange}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Company Logo */}
          <FormSection title="Company Logo" icon={<ImageIcon />} sx={{ mb: 3 }}>
            <LogoUpload
              logoPreview={logoPreview}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={handleLogoRemove}
              showEditDelete
            />
          </FormSection>

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <StatusSelector value={formData.status} onChange={handleStatusChange} />
          </FormSection>

          {/* Action Buttons */}
          <ActionButtons
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />

          {/* Danger Zone */}
          <Box sx={{ mt: 3 }}>
            <DangerZone
              onDelete={() => setDeleteDialogOpen(true)}
              itemName="company"
              isDeleting={isDeleting}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Company</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be undone
            and all associated data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Company'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error || !!deleteError}
        autoHideDuration={6000}
        onClose={() => {
          setError('');
          setDeleteError('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setError('');
            setDeleteError('');
          }}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error || deleteError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateCompanyPage;
