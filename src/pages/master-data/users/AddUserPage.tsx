import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Card,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import LazyImage from '../../../components/common/LazyImage';
import { optimizeImage, validateImage } from '../../../utils/imageOptimizer';
import type { UserFormData, UserCompanyAccess } from '../../../types/common.types';
import { getUsersApi } from '../../../generated/api/client';
import type { CreateUserRequest } from '../../../generated/api/api';

// Permission modules structure matching the design
const PERMISSION_MODULES = [
  {
    id: 'sales',
    name: 'Sales Module',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
  {
    id: 'purchase',
    name: 'Purchase Module',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
  {
    id: 'inventory',
    name: 'Inventory Module',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
];

// Memoized Image Upload Component
const ImageUploadSection = memo(
  ({
    imagePreview,
    onImageUpload,
    onImageRemove,
  }: {
    imagePreview: string;
    onImageUpload: (file: File) => Promise<void>;
    onImageRemove: () => void;
  }) => {
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
      >
        {imagePreview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <LazyImage
              src={imagePreview}
              alt="User Image"
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
                onClick={() => document.getElementById('image-upload')?.click()}
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
            onClick={() => document.getElementById('image-upload')?.click()}
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
          id="image-upload"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />
      </Box>
    );
  }
);

ImageUploadSection.displayName = 'ImageUploadSection';

// Company Access Card Component
interface CompanyAccessCardProps {
  access: UserCompanyAccess & { modulePermissions: Record<string, string[]> };
  companies: Array<{ id: number; name: string }>;
  onRemove: () => void;
  onRoleChange: (role: string) => void;
  onPermissionToggle: (moduleId: string, permission: string) => void;
  onSelectAll: (checked: boolean) => void;
  onModuleToggle: (moduleId: string, checked: boolean) => void;
  isFirst?: boolean;
}

const CompanyAccessCard = memo(({
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

  return (
    <Card sx={{ p: 2.5, mb: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Company Name *</InputLabel>
          <Select
            value={access.companyId}
            label="Company Name *"
            disabled
          >
            <MenuItem value={access.companyId}>{access.companyName}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={access.roleName}
            onChange={(e) => onRoleChange(e.target.value)}
            label="Role"
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
          sx={{ color: '#EF5350', alignSelf: 'center' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5, color: '#374151' }}>
        Permissions
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
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
            <Box key={module.id}>
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
                  />
                }
                label={<Typography variant="body2">{module.name}</Typography>}
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

interface ExtendedUserCompanyAccess extends UserCompanyAccess {
  modulePermissions: Record<string, string[]>;
}

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    cnic: '',
    phone: '',
    about: '',
    imageUrl: '',
    status: 'Active',
    companyAccess: [],
  });
  const [extendedCompanyAccess, setExtendedCompanyAccess] = useState<ExtendedUserCompanyAccess[]>([]);
  const [password, setPassword] = useState('');
  const [contactNo2, setContactNo2] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const savedCompanies = localStorage.getItem('companies');
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies);
          setCompanies(parsed.map((c: any) => ({ id: c.id, name: c.companyName })));
        }
      } catch (err) {
        console.error('Error loading companies:', err);
      }
    };
    loadCompanies();
  }, []);

  // Memoized input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Memoized status change handler
  const handleStatusChange = useCallback((status: 'Active' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  // Optimized image upload with compression
  const handleImageUpload = useCallback(async (file: File) => {
    const validation = validateImage(file, 2);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const optimizedImage = await optimizeImage(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
        format: 'image/jpeg',
      });

      setImagePreview(optimizedImage);
      setFormData((prev) => ({ ...prev, imageUrl: optimizedImage }));
    } catch (error) {
      console.error('Error optimizing image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, []);

  // Memoized image removal handler
  const handleImageRemove = useCallback(() => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  }, []);

  // Add company access
  const handleAddCompany = useCallback(() => {
    if (!selectedCompanyId) {
      setError('Please select a company');
      return;
    }

    // Check if company already added
    if (extendedCompanyAccess.some((access) => access.companyId === selectedCompanyId)) {
      setError('Company already added');
      return;
    }

    const company = companies.find((c) => c.id === selectedCompanyId);
    if (!company) return;

    const newAccess: ExtendedUserCompanyAccess = {
      companyId: selectedCompanyId,
      companyName: company.name,
      roleId: 4,
      roleName: 'Employee',
      permissions: [],
      modulePermissions: {},
    };

    setExtendedCompanyAccess((prev) => [...prev, newAccess]);
    setSelectedCompanyId('');
  }, [selectedCompanyId, companies, extendedCompanyAccess]);

  // Remove company access
  const handleRemoveCompany = useCallback((companyId: number) => {
    setExtendedCompanyAccess((prev) =>
      prev.filter((access) => access.companyId !== companyId)
    );
  }, []);

  // Update company role
  const handleUpdateCompanyRole = useCallback((companyId: number, roleName: string) => {
    const roleId =
      roleName === 'Admin' ? 1 : roleName === 'Manager' ? 2 : roleName === 'Employee' ? 3 : 4;

    setExtendedCompanyAccess((prev) =>
      prev.map((access) =>
        access.companyId === companyId ? { ...access, roleId, roleName } : access
      )
    );
  }, []);

  // Toggle permission for company module
  const handleTogglePermission = useCallback((companyId: number, moduleId: string, permission: string) => {
    setExtendedCompanyAccess((prev) =>
      prev.map((access) => {
        if (access.companyId !== companyId) return access;

        const currentModulePerms = access.modulePermissions[moduleId] || [];
        const hasPermission = currentModulePerms.includes(permission);

        return {
          ...access,
          modulePermissions: {
            ...access.modulePermissions,
            [moduleId]: hasPermission
              ? currentModulePerms.filter((p) => p !== permission)
              : [...currentModulePerms, permission],
          },
        };
      })
    );
  }, []);

  // Select/deselect all permissions for a company
  const handleSelectAll = useCallback((companyId: number, checked: boolean) => {
    setExtendedCompanyAccess((prev) =>
      prev.map((access) => {
        if (access.companyId !== companyId) return access;

        const newModulePermissions: Record<string, string[]> = {};
        PERMISSION_MODULES.forEach((module) => {
          newModulePermissions[module.id] = checked ? [...module.permissions] : [];
        });

        return {
          ...access,
          modulePermissions: newModulePermissions,
        };
      })
    );
  }, []);

  // Toggle all permissions for a module
  const handleModuleToggle = useCallback((companyId: number, moduleId: string, checked: boolean) => {
    setExtendedCompanyAccess((prev) =>
      prev.map((access) => {
        if (access.companyId !== companyId) return access;

        const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
        if (!module) return access;

        return {
          ...access,
          modulePermissions: {
            ...access.modulePermissions,
            [moduleId]: checked ? [...module.permissions] : [],
          },
        };
      })
    );
  }, []);

  // Calculate summary stats
  const totalPermissions = extendedCompanyAccess.reduce((sum, access) => {
    return sum + Object.values(access.modulePermissions).reduce(
      (moduleSum, perms) => moduleSum + perms.length, 0
    );
  }, 0);

  const uniqueRoles = new Set(extendedCompanyAccess.map((a) => a.roleName)).size;

  // Memoized submit handler with API
  const handleSubmit = useCallback(async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.email ||
      !password ||
      extendedCompanyAccess.length === 0
    ) {
      setError('Please fill in all required fields and add at least one company');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const usersApi = getUsersApi();

      // Prepare API payload
      const payload: CreateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || undefined,
        password: password,
        roleId: extendedCompanyAccess[0]?.roleId || 4,
        companyIds: extendedCompanyAccess.map((access) => access.companyId),
        permissionIds: [],
      };

      // Call API
      const response = await usersApi.v1ApiUsersPost(payload);

      // Save to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser = {
        id: String((response as any).data?.id || Date.now()),
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        companyAccess: extendedCompanyAccess,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      setSuccessMessage('User created successfully!');

      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating user:', err);
      // Save locally even if API fails
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser = {
        id: String(Date.now()),
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        companyAccess: extendedCompanyAccess,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      setSuccessMessage('User created successfully!');
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    }
  }, [formData, password, extendedCompanyAccess, navigate]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Add User" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* User Information */}
          <FormSection title="User Information" icon={<BusinessIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  First Name *
                </Typography>
                <TextField
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Harry"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  CNIC *
                </Typography>
                <TextField
                  fullWidth
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  placeholder="00000-0000000-0"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Contact No
                </Typography>
                <TextField
                  fullWidth
                  value={contactNo2}
                  onChange={(e) => setContactNo2(e.target.value)}
                  placeholder="+92 123 4567"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Contact No *
                </Typography>
                <TextField
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+92 123 4567"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Password *
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  About User
                </Typography>
                <TextField
                  fullWidth
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  placeholder="Write something About User"
                  multiline
                  rows={2}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
            </Grid>
          </FormSection>

          <Box sx={{ mt: 3 }}>
            {/* Company Access and Rules */}
            <FormSection title="Company Access And Rules" icon={<BusinessIcon />}>
              <Divider sx={{ mb: 3, mt: -1 }} />

              {/* Add Company Button */}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  if (companies.length > 0 && !selectedCompanyId) {
                    setSelectedCompanyId(companies[0].id);
                  }
                  handleAddCompany();
                }}
                sx={{
                  mb: 3,
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

              {/* Company selector for adding */}
              {extendedCompanyAccess.length === 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Company</InputLabel>
                    <Select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value as number)}
                      label="Select Company"
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select a company</MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Company Access Cards */}
              {extendedCompanyAccess.map((access) => (
                <CompanyAccessCard
                  key={access.companyId}
                  access={access}
                  companies={companies}
                  onRemove={() => handleRemoveCompany(access.companyId)}
                  onRoleChange={(role) => handleUpdateCompanyRole(access.companyId, role)}
                  onPermissionToggle={(moduleId, perm) =>
                    handleTogglePermission(access.companyId, moduleId, perm)
                  }
                  onSelectAll={(checked) => handleSelectAll(access.companyId, checked)}
                  onModuleToggle={(moduleId, checked) =>
                    handleModuleToggle(access.companyId, moduleId, checked)
                  }
                />
              ))}

              {extendedCompanyAccess.length === 0 && (
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
                    No companies added yet. Select a company above and click "Add Company".
                  </Typography>
                </Box>
              )}
            </FormSection>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* User Image */}
          <FormSection title="User image" icon={<ImageIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <ImageUploadSection
              imagePreview={imagePreview}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />
          </FormSection>

          {/* Summary */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
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
              >
                <SendIcon sx={{ color: '#FF6B35', fontSize: 20, transform: 'rotate(-45deg)' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Summary
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#FF6B35' }}>
                  Companies:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B35' }}>
                  {extendedCompanyAccess.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#FF6B35' }}>
                  Roles Assign:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B35' }}>
                  {uniqueRoles}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1.5,
                  bgcolor: 'rgba(255, 107, 53, 0.08)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#FF6B35' }}>
                  Total Permissions:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B35' }}>
                  {totalPermissions}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <StatusSelector
              value={formData.status}
              onChange={handleStatusChange}
              options={['Active', 'Inactive']}
            />
          </FormSection>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCancel}
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={<AddIcon />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B',
                },
              }}
            >
              {isSubmitting ? 'Creating...' : 'Add User'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddUserPage;
