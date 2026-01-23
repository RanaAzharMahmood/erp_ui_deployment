import React from 'react';
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Circle as CircleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  CustomerFormData,
  CUSTOMER_STATUS_OPTIONS,
} from '../../types/customer.types';
import { CustomerFieldErrors } from '../../hooks/useCustomerForm';
import { useCompanies } from '../../hooks';

interface CustomerFormProps {
  formData: CustomerFormData;
  fieldErrors?: CustomerFieldErrors;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange?: (e: SelectChangeEvent) => void;
}


const iconBoxStyle = {
  width: 40,
  height: 40,
  borderRadius: '8px',
  bgcolor: 'rgba(255, 107, 53, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const iconStyle = { color: '#FF6B35', fontSize: 24 };

const radioStyle = {
  color: '#FF6B35',
  '&.Mui-checked': {
    color: '#FF6B35',
  },
};

export const CustomerDetailsCard: React.FC<
  Pick<CustomerFormProps, 'formData' | 'fieldErrors' | 'onInputChange' | 'onSelectChange'>
> = ({ formData, fieldErrors = {}, onInputChange, onSelectChange }) => {
  const { companies, loading: companiesLoading } = useCompanies();

  return (
    <Card
      sx={{ p: 3, mb: 3, borderRadius: 2 }}
      role="group"
      aria-labelledby="customer-details-title"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={iconBoxStyle} aria-hidden="true">
          <PersonIcon sx={iconStyle} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }} id="customer-details-title">
          Customer Details
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Enter customer name"
            required
            size="small"
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
            inputProps={{
              'aria-required': true,
              'aria-invalid': !!fieldErrors.name,
              'aria-describedby': fieldErrors.name ? 'customer-name-error' : undefined,
            }}
            FormHelperTextProps={{
              id: 'customer-name-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder="customer@example.com"
            required
            size="small"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            inputProps={{
              'aria-required': true,
              'aria-invalid': !!fieldErrors.email,
              'aria-describedby': fieldErrors.email ? 'customer-email-error' : undefined,
            }}
            FormHelperTextProps={{
              id: 'customer-email-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="+1 234 567 8900"
            size="small"
            error={!!fieldErrors.phone}
            helperText={fieldErrors.phone}
            inputProps={{
              'aria-invalid': !!fieldErrors.phone,
              'aria-describedby': fieldErrors.phone ? 'customer-phone-error' : undefined,
            }}
            FormHelperTextProps={{
              id: 'customer-phone-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" error={!!fieldErrors.companyId} required>
            <InputLabel id="customer-company-label">Company</InputLabel>
            <Select
              name="companyId"
              value={String(formData.companyId)}
              label="Company"
              onChange={onSelectChange}
              disabled={companiesLoading}
              labelId="customer-company-label"
              aria-required="true"
              aria-invalid={!!fieldErrors.companyId}
              aria-describedby={fieldErrors.companyId ? 'customer-company-error' : undefined}
            >
              <MenuItem value="">
                <em>{companiesLoading ? 'Loading companies...' : 'Select a company'}</em>
              </MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={String(company.id)}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.companyId && (
              <FormHelperText id="customer-company-error">
                {fieldErrors.companyId}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax ID"
            name="taxId"
            value={formData.taxId}
            onChange={onInputChange}
            placeholder="XX-XXXXXXX"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Payment Terms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={onInputChange}
            placeholder="Net 30"
            size="small"
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export const AddressDetailsCard: React.FC<
  Pick<CustomerFormProps, 'formData' | 'fieldErrors' | 'onInputChange'>
> = ({ formData, onInputChange }) => {
  return (
    <Card
      sx={{ p: 3, mb: 3, borderRadius: 2 }}
      role="group"
      aria-labelledby="address-details-title"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={iconBoxStyle} aria-hidden="true">
          <LocationIcon sx={iconStyle} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }} id="address-details-title">
          Address Details
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="123 Main Street"
            multiline
            rows={2}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            placeholder="New York"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="State/Province"
            name="state"
            value={formData.state}
            onChange={onInputChange}
            placeholder="NY"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            onChange={onInputChange}
            placeholder="United States"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={onInputChange}
            placeholder="10001"
            size="small"
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export const FinancialDetailsCard: React.FC<
  Pick<CustomerFormProps, 'formData' | 'fieldErrors' | 'onInputChange'>
> = ({ formData, fieldErrors = {}, onInputChange }) => {
  return (
    <Card
      sx={{ p: 3, mb: 3, borderRadius: 2 }}
      role="group"
      aria-labelledby="financial-details-title"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={iconBoxStyle} aria-hidden="true">
          <MoneyIcon sx={iconStyle} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }} id="financial-details-title">
          Financial Details
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Credit Limit"
            name="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={onInputChange}
            placeholder="50000"
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={!!fieldErrors.creditLimit}
            helperText={fieldErrors.creditLimit}
            inputProps={{
              'aria-invalid': !!fieldErrors.creditLimit,
              'aria-describedby': fieldErrors.creditLimit ? 'credit-limit-error' : undefined,
            }}
            FormHelperTextProps={{
              id: 'credit-limit-error',
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={onInputChange}
            placeholder="Additional notes about this customer..."
            multiline
            rows={3}
            size="small"
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export const CustomerStatusCard: React.FC<
  Pick<CustomerFormProps, 'formData' | 'onStatusChange'>
> = ({ formData, onStatusChange }) => {
  return (
    <Card
      sx={{ p: 3, borderRadius: 2 }}
      role="group"
      aria-labelledby="customer-status-title"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={iconBoxStyle} aria-hidden="true">
          <CircleIcon sx={iconStyle} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }} id="customer-status-title">
          Status
        </Typography>
      </Box>

      <FormControl component="fieldset">
        <RadioGroup
          name="status"
          value={formData.status}
          onChange={onStatusChange}
          aria-label="Customer status"
        >
          {CUSTOMER_STATUS_OPTIONS.map((status) => (
            <FormControlLabel
              key={status}
              value={status}
              control={<Radio sx={radioStyle} />}
              label={status}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Card>
  );
};

// Legacy export for backward compatibility
export const CompanyDetailsCard = AddressDetailsCard;

const CustomerForm: React.FC<CustomerFormProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  onStatusChange,
  onSelectChange,
}) => {
  return (
    <>
      <CustomerDetailsCard
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
      />
      <AddressDetailsCard
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={onInputChange}
      />
      <FinancialDetailsCard
        formData={formData}
        fieldErrors={fieldErrors}
        onInputChange={onInputChange}
      />
      <CustomerStatusCard formData={formData} onStatusChange={onStatusChange} />
    </>
  );
};

export default CustomerForm;
