import React from 'react';
import {
  Box,
  Card,
  Typography,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import Select, { MultiValue } from 'react-select';
import FormSection from '../common/FormSection';
import StatusSelector from '../common/StatusSelector';
import { PartyFormData, Company } from './types';

// Type for select change value (string for most selects, number for IDs, boolean for toggles, or array of numbers for multi-select)
type SelectChangeValue = string | number | boolean | number[];

// Type for react-select option
interface CompanyOption {
  value: number;
  label: string;
}

interface CompanyStatusSectionProps {
  formData: PartyFormData;
  companies: Company[];
  onSelectChange: (name: string, value: SelectChangeValue) => void;
  onStatusChange: (status: 'Active' | 'Inactive') => void;
}

const CompanyStatusSection: React.FC<CompanyStatusSectionProps> = ({
  formData,
  companies,
  onSelectChange,
  onStatusChange,
}) => {
  // Convert companies to react-select options
  const companyOptions: CompanyOption[] = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  // Get selected values for react-select
  const selectedValues = companyOptions.filter((option) =>
    formData.companyIds.includes(option.value)
  );

  // Handle multi-select change
  const handleCompanyChange = (newValue: MultiValue<CompanyOption>) => {
    const selectedIds = newValue ? newValue.map((option) => option.value) : [];
    onSelectChange('companyIds', selectedIds);
  };

  // Custom styles for react-select to match MUI design
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '40px',
      backgroundColor: 'white',
      borderColor: '#E5E7EB',
      '&:hover': {
        borderColor: '#D1D5DB',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#374151',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: '#FF6B35',
      '&:hover': {
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        color: '#FF6B35',
      },
    }),
  };

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
            Companies
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }} id="party-company-select-label">
          Select Companies
        </Typography>
        <Select
          isMulti
          name="companies"
          options={companyOptions}
          value={selectedValues}
          onChange={handleCompanyChange}
          placeholder="Select Companies"
          styles={customSelectStyles}
          aria-labelledby="party-company-select-label"
        />
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
