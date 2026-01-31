import React from 'react';
import { Grid, TextField } from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import FormSection from '../common/FormSection';
import type { CompanyFormData } from '../../types/common.types';

interface CompanyFormFieldsProps {
  formData: CompanyFormData;
  fieldErrors?: {
    companyName?: string;
    ntnNumber?: string;
    industry?: string;
    companyEmail?: string;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

/**
 * Shared company form fields component
 * Used by both AddCompanyPage and UpdateCompanyPage
 * Includes accessibility improvements with ARIA attributes
 */
const CompanyFormFields: React.FC<CompanyFormFieldsProps> = ({
  formData,
  fieldErrors = {},
  onInputChange,
}) => {
  return (
    <>
      {/* Company Information */}
      <FormSection title="Company Information" icon={<BusinessIcon />}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={onInputChange}
              placeholder="Enter company name"
              required
              size="small"
              error={!!fieldErrors.companyName}
              helperText={fieldErrors.companyName}
              inputProps={{
                'aria-required': true,
                'aria-invalid': !!fieldErrors.companyName,
                'aria-describedby': fieldErrors.companyName ? 'company-name-error' : undefined,
              }}
              FormHelperTextProps={{
                id: 'company-name-error',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="NTN Number"
              name="ntnNumber"
              value={formData.ntnNumber}
              onChange={onInputChange}
              placeholder="1451566"
              required
              size="small"
              error={!!fieldErrors.ntnNumber}
              helperText={fieldErrors.ntnNumber}
              inputProps={{
                'aria-required': true,
                'aria-invalid': !!fieldErrors.ntnNumber,
                'aria-describedby': fieldErrors.ntnNumber ? 'company-ntn-error' : undefined,
              }}
              FormHelperTextProps={{
                id: 'company-ntn-error',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website || ''}
              onChange={onInputChange}
              placeholder="www.example.com"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Industry"
              name="industry"
              value={formData.industry}
              onChange={onInputChange}
              placeholder="Gas & Fuel"
              required
              size="small"
              error={!!fieldErrors.industry}
              helperText={fieldErrors.industry}
              inputProps={{
                'aria-required': true,
                'aria-invalid': !!fieldErrors.industry,
                'aria-describedby': fieldErrors.industry ? 'company-industry-error' : undefined,
              }}
              FormHelperTextProps={{
                id: 'company-industry-error',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sales Tax Number"
              name="salesTaxNumber"
              value={formData.salesTaxNumber || ''}
              onChange={onInputChange}
              placeholder="AA000000"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Email"
              name="companyEmail"
              type="email"
              value={formData.companyEmail}
              onChange={onInputChange}
              placeholder="example@example.com"
              required
              size="small"
              error={!!fieldErrors.companyEmail}
              helperText={fieldErrors.companyEmail}
              inputProps={{
                'aria-required': true,
                'aria-invalid': !!fieldErrors.companyEmail,
                'aria-describedby': fieldErrors.companyEmail ? 'company-email-error' : undefined,
              }}
              FormHelperTextProps={{
                id: 'company-email-error',
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address || ''}
              onChange={onInputChange}
              placeholder="Enter company address"
              multiline
              rows={4}
              size="small"
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Primary Contact */}
      <FormSection title="Primary Contact" icon={<PersonIcon />} sx={{ mt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Name"
              name="contactName"
              value={formData.contactName || ''}
              onChange={onInputChange}
              placeholder="John Herry"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail || ''}
              onChange={onInputChange}
              placeholder="example@example.com"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contact Phone Number"
              name="contactPhone"
              value={formData.contactPhone || ''}
              onChange={onInputChange}
              placeholder="045 4515 545485"
              size="small"
            />
          </Grid>
        </Grid>
      </FormSection>
    </>
  );
};

export default CompanyFormFields;
