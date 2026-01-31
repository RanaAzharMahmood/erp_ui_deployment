import React from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { VendorFormData } from './types';
import { VendorFieldErrors } from '../../hooks/useVendorForm';

interface VendorFormProps {
  formData: VendorFormData;
  fieldErrors?: VendorFieldErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onStatusChange: (checked: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onBack: () => void;
  title: string;
  submitLabel: string;
  onDelete?: () => void;
  showDangerZone?: boolean;
  isSubmitting?: boolean;
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

const PAYMENT_TERMS_OPTIONS = [
  { value: 'Net 15', label: 'Net 15' },
  { value: 'Net 30', label: 'Net 30' },
  { value: 'Net 45', label: 'Net 45' },
  { value: 'Net 60', label: 'Net 60' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
  { value: 'COD', label: 'Cash on Delivery' },
];

const VendorForm: React.FC<VendorFormProps> = ({
  formData,
  fieldErrors = {},
  onInputChange,
  onStatusChange,
  onSubmit,
  onCancel,
  onBack,
  title,
  submitLabel,
  onDelete,
  showDangerZone = false,
  isSubmitting = false,
}) => {
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={onBack}
          aria-label="Go back"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
          {title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Vendor Details Card */}
          <Card
            sx={{ p: 3, mb: 3, borderRadius: 2 }}
            role="group"
            aria-labelledby="vendor-details-title"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle} aria-hidden="true">
                <LocalShippingIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }} id="vendor-details-title">
                Vendor Details
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Enter vendor name"
                  required
                  size="small"
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  inputProps={{
                    'aria-required': true,
                    'aria-invalid': !!fieldErrors.name,
                    'aria-describedby': fieldErrors.name ? 'vendor-name-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-name-error',
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
                  placeholder="vendor@example.com"
                  size="small"
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.email,
                    'aria-describedby': fieldErrors.email ? 'vendor-email-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-email-error',
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
                    'aria-describedby': fieldErrors.phone ? 'vendor-phone-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-phone-error',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  name="taxId"
                  value={formData.taxId}
                  onChange={onInputChange}
                  placeholder="Tax identification number"
                  size="small"
                  error={!!fieldErrors.taxId}
                  helperText={fieldErrors.taxId}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.taxId,
                    'aria-describedby': fieldErrors.taxId ? 'vendor-taxid-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-taxid-error',
                  }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Address Details Card */}
          <Card
            sx={{ p: 3, mb: 3, borderRadius: 2 }}
            role="group"
            aria-labelledby="vendor-address-title"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle} aria-hidden="true">
                <BusinessIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }} id="vendor-address-title">
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
                  placeholder="Street address"
                  multiline
                  rows={2}
                  size="small"
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.address,
                    'aria-describedby': fieldErrors.address ? 'vendor-address-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-address-error',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={onInputChange}
                  placeholder="City"
                  size="small"
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.city,
                    'aria-describedby': fieldErrors.city ? 'vendor-city-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-city-error',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={onInputChange}
                  placeholder="State or Province"
                  size="small"
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.state,
                    'aria-describedby': fieldErrors.state ? 'vendor-state-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-state-error',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={onInputChange}
                  placeholder="Country"
                  size="small"
                  error={!!fieldErrors.country}
                  helperText={fieldErrors.country}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.country,
                    'aria-describedby': fieldErrors.country ? 'vendor-country-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-country-error',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={onInputChange}
                  placeholder="Postal/ZIP code"
                  size="small"
                  error={!!fieldErrors.postalCode}
                  helperText={fieldErrors.postalCode}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.postalCode,
                    'aria-describedby': fieldErrors.postalCode ? 'vendor-postalcode-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-postalcode-error',
                  }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Banking Details Card */}
          <Card
            sx={{ p: 3, borderRadius: 2 }}
            role="group"
            aria-labelledby="vendor-banking-title"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle} aria-hidden="true">
                <AccountBalanceIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }} id="vendor-banking-title">
                Banking & Payment Details
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Terms"
                  name="paymentTerms"
                  select
                  value={formData.paymentTerms}
                  onChange={onInputChange}
                  size="small"
                  error={!!fieldErrors.paymentTerms}
                  helperText={fieldErrors.paymentTerms}
                  SelectProps={{
                    'aria-label': 'Payment Terms',
                  }}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.paymentTerms,
                    'aria-describedby': fieldErrors.paymentTerms ? 'vendor-paymentterms-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-paymentterms-error',
                  }}
                >
                  <MenuItem value="">
                    <em>Select payment terms</em>
                  </MenuItem>
                  {PAYMENT_TERMS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={onInputChange}
                  placeholder="Bank name"
                  size="small"
                  error={!!fieldErrors.bankName}
                  helperText={fieldErrors.bankName}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.bankName,
                    'aria-describedby': fieldErrors.bankName ? 'vendor-bankname-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-bankname-error',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  name="bankAccountNo"
                  value={formData.bankAccountNo}
                  onChange={onInputChange}
                  placeholder="Account number"
                  size="small"
                  error={!!fieldErrors.bankAccountNo}
                  helperText={fieldErrors.bankAccountNo}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.bankAccountNo,
                    'aria-describedby': fieldErrors.bankAccountNo ? 'vendor-bankaccount-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-bankaccount-error',
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
                  placeholder="Additional notes about this vendor"
                  multiline
                  rows={3}
                  size="small"
                  error={!!fieldErrors.notes}
                  helperText={fieldErrors.notes}
                  inputProps={{
                    'aria-invalid': !!fieldErrors.notes,
                    'aria-describedby': fieldErrors.notes ? 'vendor-notes-error' : undefined,
                  }}
                  FormHelperTextProps={{
                    id: 'vendor-notes-error',
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status Card */}
          <Card
            sx={{ p: 3, borderRadius: 2, mb: showDangerZone ? 3 : 0 }}
            role="group"
            aria-labelledby="vendor-status-title"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={iconBoxStyle} aria-hidden="true">
                <LocalShippingIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }} id="vendor-status-title">
                Status
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => onStatusChange(e.target.checked)}
                  inputProps={{
                    'aria-label': 'Vendor active status',
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FF6B35',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FF6B35',
                    },
                  }}
                />
              }
              label={formData.isActive ? 'Active' : 'Inactive'}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formData.isActive
                ? 'This vendor is active and can be used in transactions.'
                : 'This vendor is inactive and will not appear in selection lists.'}
            </Typography>
          </Card>

          {/* Danger Zone Card */}
          {showDangerZone && onDelete && (
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 3,
                border: '2px solid #EF5350',
                bgcolor: 'rgba(239, 83, 80, 0.02)',
              }}
              role="group"
              aria-labelledby="vendor-danger-zone-title"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    bgcolor: 'rgba(239, 83, 80, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  <WarningIcon sx={{ color: '#EF5350', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF5350' }} id="vendor-danger-zone-title">
                  Danger Zone
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mb: 2 }}>
                Deleting a vendor will deactivate it. This action can be reversed by
                reactivating the vendor.
              </Alert>

              <Button
                fullWidth
                variant="contained"
                onClick={onDelete}
                disabled={isSubmitting}
                aria-label="Delete this vendor"
                sx={{
                  bgcolor: 'rgba(239, 83, 80, 0.15)',
                  color: '#EF5350',
                  textTransform: 'none',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(239, 83, 80, 0.25)',
                  },
                }}
              >
                Delete Vendor
              </Button>
            </Card>
          )}

          {/* Action Buttons */}
          <Box sx={{ mt: showDangerZone ? 0 : 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                textTransform: 'none',
                borderColor: '#E0E0E0',
                color: '#666666',
                '&:hover': {
                  borderColor: '#BDBDBD',
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onSubmit}
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#FF8E53',
                },
              }}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorForm;
