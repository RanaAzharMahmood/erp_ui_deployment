import React from 'react';
import {
  Box,
  Card,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Circle as CircleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import FormSection from '../common/FormSection';
import StatusSelector from '../common/StatusSelector';
import { PartyFormData, Company } from './types';

// Type for select change value (string for most selects, number for IDs, boolean for toggles)
type SelectChangeValue = string | number | boolean;

interface CompanyStatusSectionProps {
  formData: PartyFormData;
  companies: Company[];
  selectedCompanies: number[];
  onSelectChange: (name: string, value: SelectChangeValue) => void;
  onStatusChange: (status: 'Active' | 'Inactive') => void;
  onAddCompany: () => void;
  mode: 'add' | 'update';
}

const CompanyStatusSection: React.FC<CompanyStatusSectionProps> = ({
  formData,
  companies,
  selectedCompanies,
  onSelectChange,
  onStatusChange,
  onAddCompany,
  mode,
}) => {
  return (
    <>
      {/* Company Selection Card */}
      <Card
        sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}
        role="group"
        aria-labelledby="party-company-section-title"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: 'rgba(255, 107, 53, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <BusinessIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }} id="party-company-section-title">
            Status
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {mode === 'update' && selectedCompanies.length > 0 ? (
          <>
            {selectedCompanies.map((compId) => {
              const comp = companies.find((c) => c.id === compId);
              return (
                <Box key={compId} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }} id={`party-company-label-${compId}`}>
                    Select Company
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={compId}
                      sx={{ bgcolor: 'white' }}
                      disabled
                      aria-labelledby={`party-company-label-${compId}`}
                    >
                      <MenuItem value={compId}>{comp?.name}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              );
            })}
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }} id="party-company-select-label">
              Select Company
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <Select
                value={formData.companyId}
                onChange={(e) => onSelectChange('companyId', e.target.value)}
                displayEmpty
                sx={{ bgcolor: 'white' }}
                aria-labelledby="party-company-select-label"
              >
                <MenuItem value="">Select Company</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddCompany}
          aria-label="Add another company to this party"
          sx={{
            mb: mode === 'add' ? 3 : 1,
            borderColor: '#E5E7EB',
            color: '#374151',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#D1D5DB',
              bgcolor: '#F9FAFB',
            },
          }}
        >
          Add Company
        </Button>
      </Card>

      {/* Status Section */}
      <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
        <Divider sx={{ mb: 2, mt: -1 }} />
        <StatusSelector
          value={formData.status}
          onChange={onStatusChange}
          options={['Active', 'Inactive']}
        />
      </FormSection>
    </>
  );
};

export default CompanyStatusSection;
