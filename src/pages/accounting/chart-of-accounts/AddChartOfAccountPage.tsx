import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import { useCompanies } from '../../../hooks';
import {
  getChartOfAccountsApi,
  CreateChartOfAccountRequest,
  UpdateChartOfAccountRequest,
  AccountType,
} from '../../../generated/api/client';

interface ChartOfAccountFormData {
  companyId: number | '';
  accountCode: string;
  accountName: string;
  accountType: AccountType | '';
  parentId: number | '';
  description: string;
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
];

const AddChartOfAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const typeFromQuery = searchParams.get('type') as AccountType | null;
  const parentIdFromQuery = searchParams.get('parent');

  const [formData, setFormData] = useState<ChartOfAccountFormData>({
    companyId: '',
    accountCode: '',
    accountName: '',
    accountType: typeFromQuery || '',
    parentId: parentIdFromQuery ? Number(parentIdFromQuery) : '',
    description: '',
    openingBalance: 0,
    currentBalance: 0,
    status: 'Active',
  });

  const [parentAccounts, setParentAccounts] = useState<Array<{ id: number; name: string; code: string }>>([]);
  const { companies: rawCompanies, refetch: refetchCompanies } = useCompanies();
  const companies = rawCompanies.map((c) => ({ id: c.id, name: c.name }));

  // Refetch companies on mount to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load parent accounts based on account type
  useEffect(() => {
    const loadParentAccounts = async () => {
      if (!formData.accountType) return;

      try {
        const api = getChartOfAccountsApi();
        const response = await api.getAllAccounts({
          accountType: formData.accountType,
          isActive: true
        });

        if (response.success && response.data) {
          setParentAccounts(response.data.map((account) => ({
            id: account.id,
            name: account.accountName,
            code: account.accountCode,
          })));
        }
      } catch (err) {
        console.error('Error loading parent accounts:', err);
        setParentAccounts([]);
      }
    };

    loadParentAccounts();
  }, [formData.accountType]);

  // Load existing account if editing
  useEffect(() => {
    const loadAccount = async () => {
      if (!isEditMode || !id) return;

      try {
        const api = getChartOfAccountsApi();
        const response = await api.getAccountById(Number(id));
        if (response.success && response.data) {
          const account = response.data;
          setFormData({
            companyId: account.companyId || '',
            accountCode: account.accountCode || '',
            accountName: account.accountName || '',
            accountType: account.accountType || '',
            parentId: account.parentId || '',
            description: account.description || '',
            openingBalance: account.openingBalance || 0,
            currentBalance: account.currentBalance || 0,
            status: account.isActive ? 'Active' : 'Inactive',
          });
        } else {
          setError('Failed to load chart of account');
        }
      } catch (apiError) {
        console.error('Error loading chart of account:', apiError);
        setError('Failed to load chart of account');
      }
    };

    loadAccount();
  }, [id, isEditMode]);

  const handleInputChange = useCallback((field: keyof ChartOfAccountFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.accountCode || !formData.accountName || !formData.accountType || !formData.companyId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const api = getChartOfAccountsApi();

      if (isEditMode && id) {
        // Update existing account
        const updateRequest: UpdateChartOfAccountRequest = {
          accountCode: formData.accountCode,
          accountName: formData.accountName,
          accountType: formData.accountType as AccountType,
          parentId: formData.parentId ? Number(formData.parentId) : null,
          description: formData.description || undefined,
          openingBalance: formData.openingBalance,
          currentBalance: formData.currentBalance,
          isActive: formData.status === 'Active',
        };

        const response = await api.updateAccount(Number(id), updateRequest);
        if (response.success) {
          setSuccessMessage('Chart of account updated successfully!');
          setTimeout(() => navigate('/account/chart-of-account'), 1500);
        } else {
          setError('Failed to update chart of account');
        }
      } else {
        // Create new account
        const createRequest: CreateChartOfAccountRequest = {
          accountCode: formData.accountCode,
          accountName: formData.accountName,
          accountType: formData.accountType as AccountType,
          parentId: formData.parentId ? Number(formData.parentId) : undefined,
          description: formData.description || undefined,
          openingBalance: formData.openingBalance,
          currentBalance: formData.currentBalance,
          companyId: Number(formData.companyId),
        };

        const response = await api.createAccount(createRequest);
        if (response.success) {
          setSuccessMessage('Chart of account created successfully!');
          setTimeout(() => navigate('/account/chart-of-account'), 1500);
        } else {
          setError('Failed to create chart of account');
        }
      }
    } catch (err: any) {
      console.error('Error saving chart of account:', err);
      setError(err.message || 'Failed to save chart of account');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, isEditMode, id]);

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <PageHeader
        title={isEditMode ? 'Update Chart of Account' : 'Add Chart of Account'}
        backPath="/account/chart-of-account"
      />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <FormSection title="Account Details" icon={<AccountTreeIcon sx={{ color: '#FF6B35' }} />}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Select Company*
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.companyId}
                      onChange={(e) => handleInputChange('companyId', e.target.value as number)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
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

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Type *
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select Account Type</MenuItem>
                      {ACCOUNT_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Code *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter account code"
                    value={formData.accountCode}
                    onChange={(e) => handleInputChange('accountCode', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Name *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter account name"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Parent Account
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.parentId}
                      onChange={(e) => handleInputChange('parentId', e.target.value as number)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                      disabled={!formData.accountType}
                    >
                      <MenuItem value="">None (Root Account)</MenuItem>
                      {parentAccounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Opening Balance
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0.00"
                    value={formData.openingBalance}
                    onChange={(e) => handleInputChange('openingBalance', Number(e.target.value))}
                    sx={{ bgcolor: 'white' }}
                    disabled={isEditMode}
                  />
                </Grid>

                {isEditMode && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                      Current Balance
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="0.00"
                      value={formData.currentBalance}
                      onChange={(e) => handleInputChange('currentBalance', Number(e.target.value))}
                      sx={{ bgcolor: 'white' }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    placeholder="Enter account description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>
              </Grid>
            </FormSection>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Status */}
            <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CircleIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <StatusSelector
                value={formData.status}
                onChange={(status) => handleInputChange('status', status)}
                options={['Active', 'Inactive']}
              />
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/account/chart-of-account')}
                sx={{
                  py: 1.5,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={isEditMode ? <SaveIcon /> : <AddIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  bgcolor: '#FF6B35',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#E55A2B' },
                }}
              >
                {isEditMode ? 'Save Changes' : 'Add Account'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AddChartOfAccountPage;
