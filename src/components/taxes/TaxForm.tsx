import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import FormSection from '../common/FormSection';
import { TaxFormData } from './taxTypes';
import { TaxFieldErrors } from '../../hooks/useTaxForm';

interface TaxFormProps {
  formData: TaxFormData;
  fieldErrors?: TaxFieldErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholders?: {
    taxId?: string;
    taxName?: string;
    note?: string;
  };
}

const TaxForm: React.FC<TaxFormProps> = ({
  formData,
  fieldErrors = {},
  onInputChange,
  placeholders = {},
}) => {
  const {
    taxId: taxIdPlaceholder = 'T121',
    taxName: taxNamePlaceholder = 'GST',
    note: notePlaceholder = 'Write note about Tax',
  } = placeholders;

  return (
    <FormSection title="Tax Details" icon={<DescriptionIcon />}>
      <Divider sx={{ mb: 3, mt: -1 }} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="tax-id-label"
          >
            Tax Id *
          </Typography>
          <TextField
            fullWidth
            name="taxId"
            value={formData.taxId}
            onChange={onInputChange}
            placeholder={taxIdPlaceholder}
            size="small"
            error={!!fieldErrors.taxId}
            helperText={fieldErrors.taxId}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-invalid': !!fieldErrors.taxId,
              'aria-describedby': fieldErrors.taxId ? 'tax-id-error' : undefined,
              'aria-labelledby': 'tax-id-label',
            }}
            FormHelperTextProps={{
              id: 'tax-id-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="tax-name-label"
          >
            Tax Name
          </Typography>
          <TextField
            fullWidth
            name="taxName"
            value={formData.taxName}
            onChange={onInputChange}
            placeholder={taxNamePlaceholder}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'tax-name-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="tax-percentage-label"
          >
            Tax %age *
          </Typography>
          <TextField
            fullWidth
            name="taxPercentage"
            type="number"
            value={formData.taxPercentage}
            onChange={onInputChange}
            placeholder="1 - 99"
            size="small"
            error={!!fieldErrors.taxPercentage}
            helperText={fieldErrors.taxPercentage}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{
              min: 1,
              max: 99,
              step: 1,
              'aria-required': true,
              'aria-invalid': !!fieldErrors.taxPercentage,
              'aria-describedby': fieldErrors.taxPercentage ? 'tax-percentage-error' : undefined,
              'aria-labelledby': 'tax-percentage-label',
            }}
            FormHelperTextProps={{
              id: 'tax-percentage-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="tax-date-label"
          >
            Tax Date
          </Typography>
          <TextField
            fullWidth
            name="taxDate"
            type="date"
            value={formData.taxDate}
            onChange={onInputChange}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              'aria-labelledby': 'tax-date-label',
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="tax-note-label"
          >
            Note
          </Typography>
          <TextField
            fullWidth
            name="note"
            value={formData.note}
            onChange={onInputChange}
            placeholder={notePlaceholder}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'tax-note-label',
            }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default TaxForm;
