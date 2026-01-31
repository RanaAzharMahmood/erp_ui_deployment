import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import FormSection from '../common/FormSection';
import { PartyFormData } from './types';

// Type for select change value (string for most selects, number for IDs, boolean for toggles)
type SelectChangeValue = string | number | boolean;

interface PartyDetailsSectionProps {
  formData: PartyFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: SelectChangeValue) => void;
}

const PartyDetailsSection: React.FC<PartyDetailsSectionProps> = ({
  formData,
  onInputChange,
  onSelectChange,
}) => {
  return (
    <FormSection title="Party Details" icon={<BusinessIcon />}>
      <Divider sx={{ mb: 3, mt: -1 }} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="party-name-label"
          >
            Party Name *
          </Typography>
          <TextField
            fullWidth
            name="partyName"
            value={formData.partyName}
            onChange={onInputChange}
            placeholder="EST Gas"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-labelledby': 'party-name-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="party-type-label"
          >
            Party Type *
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={formData.partyType}
              onChange={(e) => onSelectChange('partyType', e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
              aria-required="true"
              aria-labelledby="party-type-label"
            >
              <MenuItem value="" disabled>
                Select Party
              </MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="Vendor">Vendor</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="party-ntn-label"
          >
            NTN Number *
          </Typography>
          <TextField
            fullWidth
            name="ntnNumber"
            value={formData.ntnNumber}
            onChange={onInputChange}
            placeholder="00000000"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-labelledby': 'party-ntn-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="party-taxoffice-label"
          >
            Tax Office
          </Typography>
          <TextField
            fullWidth
            name="taxOffice"
            value={formData.taxOffice}
            onChange={onInputChange}
            placeholder="Lahore"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'party-taxoffice-label',
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="party-salestax-label"
          >
            Sales Tex Number *
          </Typography>
          <TextField
            fullWidth
            name="salesTaxNumber"
            value={formData.salesTaxNumber}
            onChange={onInputChange}
            placeholder="000-0000"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-labelledby': 'party-salestax-label',
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="party-address-label"
          >
            Address
          </Typography>
          <TextField
            fullWidth
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="Write Your Address"
            multiline
            rows={4}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'party-address-label',
            }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default PartyDetailsSection;
