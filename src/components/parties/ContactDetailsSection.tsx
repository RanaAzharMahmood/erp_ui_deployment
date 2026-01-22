import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Box,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import FormSection from '../common/FormSection';
import { PartyFormData, Company } from './types';

// Type for select change value (string for most selects, number for IDs, boolean for toggles)
type SelectChangeValue = string | number | boolean;

interface ContactDetailsSectionProps {
  formData: PartyFormData;
  companies: Company[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: SelectChangeValue) => void;
  showCompanySelector?: boolean;
  title?: string;
}

const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({
  formData,
  companies,
  onInputChange,
  onSelectChange,
  showCompanySelector = false,
  title = 'Contact Details',
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <FormSection title={title} icon={<PersonIcon />}>
        <Divider sx={{ mb: 3, mt: -1 }} />
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
              id="contact-name-label"
            >
              Name *
            </Typography>
            <TextField
              fullWidth
              name="contactName"
              value={formData.contactName}
              onChange={onInputChange}
              placeholder="Harry John"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              inputProps={{
                'aria-required': true,
                'aria-labelledby': 'contact-name-label',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
              id="contact-cnic-label"
            >
              CNIC *
            </Typography>
            <TextField
              fullWidth
              name="contactCnic"
              value={formData.contactCnic}
              onChange={onInputChange}
              placeholder="00000-0000000-0"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              inputProps={{
                'aria-required': true,
                'aria-labelledby': 'contact-cnic-label',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
              id="contact-email-label"
            >
              Email
            </Typography>
            <TextField
              fullWidth
              name="contactEmail"
              value={formData.contactEmail}
              onChange={onInputChange}
              placeholder="example@example.com"
              type="email"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              inputProps={{
                'aria-labelledby': 'contact-email-label',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
              id="contact-number-label"
            >
              Contact Number *
            </Typography>
            <TextField
              fullWidth
              name="contactNumber"
              value={formData.contactNumber}
              onChange={onInputChange}
              placeholder="+92 000 0000000"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              inputProps={{
                'aria-required': true,
                'aria-labelledby': 'contact-number-label',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={showCompanySelector ? 6 : 12}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, fontWeight: 500 }}
              id="contact-activity-label"
            >
              Principal Activity
            </Typography>
            <TextField
              fullWidth
              name="principalActivity"
              value={formData.principalActivity}
              onChange={onInputChange}
              placeholder="Sales Agent,"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              inputProps={{
                'aria-labelledby': 'contact-activity-label',
              }}
            />
          </Grid>
          {showCompanySelector && (
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{ mb: 0.5, fontWeight: 500 }}
                id="contact-company-label"
              >
                Select Company
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.companyId}
                  onChange={(e) => onSelectChange('companyId', e.target.value)}
                  displayEmpty
                  sx={{ bgcolor: 'white' }}
                  aria-labelledby="contact-company-label"
                >
                  <MenuItem value="">Select Company</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </FormSection>
    </Box>
  );
};

export default ContactDetailsSection;
