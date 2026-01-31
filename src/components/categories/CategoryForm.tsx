import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../common/PageHeader';
import FormSection from '../common/FormSection';
import StatusSelector from '../common/StatusSelector';
import DangerZone from '../common/DangerZone';
import { CategoryFormData, Company, CategoryFieldErrors } from '../../hooks/useCategoryForm';

// Type for select change value (string for most selects, number for IDs, boolean for toggles)
type SelectChangeValue = string | number | boolean;

export interface CategoryFormProps {
  mode: 'create' | 'edit';
  formData: CategoryFormData;
  fieldErrors?: CategoryFieldErrors;
  companies: Company[];
  isSubmitting: boolean;
  isDeleting?: boolean;
  error: string;
  successMessage: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: SelectChangeValue) => void;
  onStatusChange: (status: 'Active' | 'Inactive') => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onErrorClose: () => void;
  onSuccessClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  formData,
  fieldErrors = {},
  companies,
  isSubmitting,
  isDeleting = false,
  error,
  successMessage,
  onInputChange,
  onSelectChange,
  onStatusChange,
  onSubmit,
  onCancel,
  onDelete,
  onErrorClose,
  onSuccessClose,
}) => {
  const isCreateMode = mode === 'create';
  const pageTitle = isCreateMode ? 'Create Category' : 'Edit Category';
  const submitButtonText = isCreateMode
    ? isSubmitting
      ? 'Creating...'
      : 'Create Category'
    : isSubmitting
    ? 'Saving...'
    : 'Save Changes';
  const SubmitIcon = isCreateMode ? AddIcon : SaveIcon;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={pageTitle} showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Item Category" icon={<CategoryIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500 }}
                  id="category-name-label"
                >
                  Category Name *
                </Typography>
                <TextField
                  fullWidth
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={onInputChange}
                  placeholder="Gas"
                  size="small"
                  error={!!fieldErrors.categoryName}
                  helperText={fieldErrors.categoryName}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  inputProps={{
                    'aria-required': true,
                    'aria-invalid': !!fieldErrors.categoryName,
                    'aria-describedby': fieldErrors.categoryName ? 'category-name-error' : undefined,
                    'aria-labelledby': 'category-name-label',
                  }}
                  FormHelperTextProps={{
                    id: 'category-name-error',
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500 }}
                  id="category-company-label"
                >
                  Company
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => onSelectChange('companyId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                    aria-labelledby="category-company-label"
                  >
                    <MenuItem value="">Select Company</MenuItem>
                    {companies.map((comp) => (
                      <MenuItem key={comp.id} value={comp.id}>
                        {comp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500 }}
                  id="category-description-label"
                >
                  Description
                </Typography>
                <TextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  placeholder="Write About Category"
                  multiline
                  rows={4}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  inputProps={{
                    'aria-labelledby': 'category-description-label',
                  }}
                />
              </Grid>
            </Grid>
          </FormSection>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <StatusSelector
              value={formData.status}
              onChange={onStatusChange}
              options={['Active', 'Inactive']}
              aria-label="Category status"
            />
          </FormSection>

          {/* Danger Zone (only for edit mode) */}
          {!isCreateMode && onDelete && (
            <DangerZone onDelete={onDelete} itemName="Category" isDeleting={isDeleting} />
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: isCreateMode ? 0 : 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                textTransform: 'none',
                borderColor: '#E5E7EB',
                color: '#374151',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
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
              startIcon={<SubmitIcon />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B',
                },
              }}
            >
              {submitButtonText}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={onSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onSuccessClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={onErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryForm;
