import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import FormSection from '../common/FormSection';
import { TaxFormData, TAX_PERCENTAGES } from './taxTypes';
import { TaxFieldErrors } from '../../hooks/useTaxForm';

// Type for select change value (string for most selects, number for IDs, boolean for toggles)
type SelectChangeValue = string | number | boolean;

interface TaxFormProps {
  formData: TaxFormData;
  fieldErrors?: TaxFieldErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: SelectChangeValue) => void;
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
  onSelectChange,
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
          <FormControl fullWidth size="small" error={!!fieldErrors.taxPercentage}>
            <Select
              value={formData.taxPercentage}
              onChange={(e) => onSelectChange('taxPercentage', e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
              aria-required="true"
              aria-invalid={!!fieldErrors.taxPercentage}
              aria-describedby={fieldErrors.taxPercentage ? 'tax-percentage-error' : undefined}
              aria-labelledby="tax-percentage-label"
            >
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              {TAX_PERCENTAGES.map((pct) => (
                <MenuItem key={pct} value={pct}>
                  {pct}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.taxPercentage && (
              <FormHelperText id="tax-percentage-error">{fieldErrors.taxPercentage}</FormHelperText>
            )}
          </FormControl>
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
