import React, { memo } from 'react';
import {
  Box,
  IconButton,
  Button,
  Card,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import LazyImage from '../common/LazyImage';
import { PERMISSION_MODULES, type ExtendedUserCompanyAccess } from '../../types/user-form.types';

// Re-export for convenience
export { PERMISSION_MODULES, type ExtendedUserCompanyAccess } from '../../types/user-form.types';

// ============================================================================
// ImageUploadSection Component
// ============================================================================

export interface ImageUploadSectionProps {
  imagePreview: string;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove: () => void;
  inputId?: string;
}

export const ImageUploadSection = memo(
  ({
    imagePreview,
    onImageUpload,
    onImageRemove,
    inputId = 'image-upload',
  }: ImageUploadSectionProps) => {
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onImageUpload(file);
      }
    };

    return (
      <Box
        sx={{
          position: 'relative',
          border: '1px solid #E5E7EB',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          bgcolor: '#FAFAFA',
        }}
        role="group"
        aria-labelledby="image-upload-title"
      >
        <Typography id="image-upload-title" className="visually-hidden" sx={{ position: 'absolute', left: '-9999px' }}>
          User Image Upload
        </Typography>
        {imagePreview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <LazyImage
              src={imagePreview}
              alt="User profile image preview"
              width={160}
              height={160}
              borderRadius="8px"
              objectFit="cover"
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: -40,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => document.getElementById(inputId)?.click()}
                aria-label="Change user image"
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #E5E7EB',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <EditIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onImageRemove}
                aria-label="Remove user image"
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #E5E7EB',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16, color: '#EF5350' }} />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{ cursor: 'pointer', py: 4 }}
            onClick={() => document.getElementById(inputId)?.click()}
            role="button"
            tabIndex={0}
            aria-label="Click to upload user image"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById(inputId)?.click();
              }
            }}
          >
            <IconButton
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'rgba(255, 107, 53, 0.1)',
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 107, 53, 0.2)',
                },
              }}
              aria-hidden="true"
              tabIndex={-1}
            >
              <ImageIcon sx={{ color: '#FF6B35', fontSize: 28 }} />
            </IconButton>
            <Box sx={{ typography: 'body2', fontWeight: 500, mb: 0.5 }}>
              Upload User Image
            </Box>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
              SVG, PNG, JPG or GIF (max. 2MB)
            </Box>
          </Box>
        )}
        <input
          type="file"
          id={inputId}
          accept="image/*"
          hidden
          onChange={handleFileSelect}
          aria-label="Upload user image file"
        />
      </Box>
    );
  }
);

ImageUploadSection.displayName = 'ImageUploadSection';

// ============================================================================
// CompanyAccessCard Component
// ============================================================================

export interface CompanyAccessCardProps {
  access: ExtendedUserCompanyAccess;
  companies: Array<{ id: number; name: string }>;
  onRemove: () => void;
  onRoleChange: (role: string) => void;
  onPermissionToggle: (moduleId: string, permission: string) => void;
  onSelectAll: (checked: boolean) => void;
  onModuleToggle: (moduleId: string, checked: boolean) => void;
  isFirst?: boolean;
}

export const CompanyAccessCard = memo(({
  access,
  onRemove,
  onRoleChange,
  onPermissionToggle,
  onSelectAll,
  onModuleToggle,
}: CompanyAccessCardProps) => {
  const allSelected = PERMISSION_MODULES.every(module =>
    module.permissions.every(perm => access.modulePermissions[module.id]?.includes(perm))
  );

  const cardTitleId = `company-access-${access.companyId}-title`;

  return (
    <Card
      sx={{ p: 2.5, mb: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}
      role="group"
      aria-labelledby={cardTitleId}
    >
      <Typography id={cardTitleId} className="visually-hidden" sx={{ position: 'absolute', left: '-9999px' }}>
        Company Access for {access.companyName}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id={`company-name-label-${access.companyId}`}>Company Name *</InputLabel>
          <Select
            value={access.companyId}
            label="Company Name *"
            disabled
            labelId={`company-name-label-${access.companyId}`}
            aria-required="true"
          >
            <MenuItem value={access.companyId}>{access.companyName}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id={`role-label-${access.companyId}`}>Role</InputLabel>
          <Select
            value={access.roleName}
            onChange={(e) => onRoleChange(e.target.value)}
            label="Role"
            labelId={`role-label-${access.companyId}`}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </Select>
        </FormControl>
        <IconButton
          size="small"
          onClick={onRemove}
          aria-label={`Remove ${access.companyName} access`}
          sx={{ color: '#EF5350', alignSelf: 'center' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5, color: '#374151' }} id={`permissions-label-${access.companyId}`}>
        Permissions
      </Typography>

      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}
        role="group"
        aria-labelledby={`permissions-label-${access.companyId}`}
      >
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              sx={{
                color: '#FF6B35',
                '&.Mui-checked': { color: '#FF6B35' },
              }}
              inputProps={{
                'aria-label': 'Select all permissions',
              }}
            />
          }
          label={<Typography variant="body2">All</Typography>}
        />

        {PERMISSION_MODULES.map((module) => {
          const moduleAllSelected = module.permissions.every(
            perm => access.modulePermissions[module.id]?.includes(perm)
          );
          const moduleSomeSelected = module.permissions.some(
            perm => access.modulePermissions[module.id]?.includes(perm)
          );

          return (
            <Box key={module.id} role="group" aria-labelledby={`module-${module.id}-${access.companyId}`}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={moduleAllSelected}
                    indeterminate={moduleSomeSelected && !moduleAllSelected}
                    onChange={(e) => onModuleToggle(module.id, e.target.checked)}
                    sx={{
                      color: '#FF6B35',
                      '&.Mui-checked': { color: '#FF6B35' },
                      '&.MuiCheckbox-indeterminate': { color: '#FF6B35' },
                    }}
                    inputProps={{
                      'aria-label': `Select all ${module.name} permissions`,
                    }}
                  />
                }
                label={<Typography variant="body2" id={`module-${module.id}-${access.companyId}`}>{module.name}</Typography>}
              />
              <Box sx={{ ml: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {module.permissions.map((perm) => (
                  <FormControlLabel
                    key={perm}
                    control={
                      <Checkbox
                        size="small"
                        checked={access.modulePermissions[module.id]?.includes(perm) || false}
                        onChange={() => onPermissionToggle(module.id, perm)}
                        sx={{
                          color: '#FF6B35',
                          '&.Mui-checked': { color: '#FF6B35' },
                        }}
                        inputProps={{
                          'aria-label': `${perm} permission for ${module.name}`,
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {perm}
                      </Typography>
                    }
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
});

CompanyAccessCard.displayName = 'CompanyAccessCard';

// ============================================================================
// CompanyAccessSection Component
// ============================================================================

export interface CompanyAccessSectionProps {
  companies: Array<{ id: number; name: string }>;
  companyAccess: ExtendedUserCompanyAccess[];
  selectedCompanyId: number | '';
  onSelectedCompanyChange: (companyId: number | '') => void;
  onAddCompany: () => void;
  onRemoveCompany: (companyId: number) => void;
  onRoleChange: (companyId: number, role: string) => void;
  onPermissionToggle: (companyId: number, moduleId: string, permission: string) => void;
  onSelectAll: (companyId: number, checked: boolean) => void;
  onModuleToggle: (companyId: number, moduleId: string, checked: boolean) => void;
}

export const CompanyAccessSection = memo(({
  companies,
  companyAccess,
  selectedCompanyId,
  onSelectedCompanyChange,
  onAddCompany,
  onRemoveCompany,
  onRoleChange,
  onPermissionToggle,
  onSelectAll,
  onModuleToggle,
}: CompanyAccessSectionProps) => {
  const availableCompanies = companies.filter(
    (company) => !companyAccess.some((access) => access.companyId === company.id)
  );

  return (
    <>
      {/* Company selector and Add Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
        <FormControl sx={{ minWidth: 300 }} size="small">
          <InputLabel id="select-company-label">Select Company</InputLabel>
          <Select
            value={selectedCompanyId}
            onChange={(e) => onSelectedCompanyChange(e.target.value as number | '')}
            label="Select Company"
            sx={{ bgcolor: 'white' }}
            labelId="select-company-label"
          >
            <MenuItem value="">Select a company</MenuItem>
            {availableCompanies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddCompany}
          disabled={!selectedCompanyId}
          aria-label="Add selected company to user access"
          sx={{
            borderColor: '#E5E7EB',
            color: '#374151',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#D1D5DB',
              bgcolor: '#F9FAFB',
            },
            '&.Mui-disabled': {
              borderColor: '#E5E7EB',
              color: '#9CA3AF',
            },
          }}
        >
          Add Company
        </Button>
      </Box>

      {availableCompanies.length === 0 && companyAccess.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          All available companies have been added.
        </Alert>
      )}

      {/* Company Access Cards */}
      {companyAccess.map((access) => (
        <CompanyAccessCard
          key={access.companyId}
          access={access}
          companies={companies}
          onRemove={() => onRemoveCompany(access.companyId)}
          onRoleChange={(role) => onRoleChange(access.companyId, role)}
          onPermissionToggle={(moduleId, perm) =>
            onPermissionToggle(access.companyId, moduleId, perm)
          }
          onSelectAll={(checked) => onSelectAll(access.companyId, checked)}
          onModuleToggle={(moduleId, checked) =>
            onModuleToggle(access.companyId, moduleId, checked)
          }
        />
      ))}

      {companyAccess.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: '#FAFAFA',
            borderRadius: 2,
            border: '1px dashed #E5E7EB',
          }}
        >
          <Typography color="text.secondary">
            No companies added yet. Select a company from the dropdown above and click "Add Company".
          </Typography>
        </Box>
      )}
    </>
  );
});

CompanyAccessSection.displayName = 'CompanyAccessSection';
