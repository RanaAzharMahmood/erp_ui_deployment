import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  AccountBalance as AccountBalanceIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';

interface BankAccountFormData {
  companyId: number | '';
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  branchName: string;
  date: string;
  details: string;
  status: 'Active' | 'Inactive';
}

const BANK_NAMES = ['HBL', 'MCB', 'UBL', 'Allied Bank', 'Bank Alfalah', 'Meezan Bank', 'Faysal Bank'];

const AddBankAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<BankAccountFormData>({
    companyId: '',
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    branchName: '',
    date: '',
    details: '',
    status: 'Active',
  });

  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load companies and existing account if editing
  useEffect(() => {
    try {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies);
        setCompanies(parsed.map((c: { id: number; companyName: string }) => ({
          id: c.id,
          name: c.companyName,
        })));
      }

      if (isEditMode && id) {
        const savedAccounts = localStorage.getItem('bankAccounts');
        if (savedAccounts) {
          const accounts = JSON.parse(savedAccounts);
          const account = accounts.find((a: { id: string }) => a.id === id);
          if (account) {
            setFormData({
              companyId: account.companyId || '',
              bankName: account.bankName || '',
              accountTitle: account.accountTitle || '',
              accountNumber: account.accountNumber || '',
              branchName: account.branchName || '',
              date: account.date || '',
              details: account.details || '',
              status: account.status || 'Active',
            });
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [id, isEditMode]);

  const handleInputChange = useCallback((field: keyof BankAccountFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.bankName || !formData.accountTitle || !formData.accountNumber || !formData.branchName || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedAccounts = localStorage.getItem('bankAccounts');
      const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];

      const company = companies.find((c) => c.id === formData.companyId);
      const accountData = {
        id: isEditMode ? id : Date.now().toString(),
        ...formData,
        companyName: company?.name || 'EST-Gas',
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode) {
        const index = accounts.findIndex((a: { id: string }) => a.id === id);
        if (index !== -1) {
          accounts[index] = { ...accounts[index], ...accountData };
        }
      } else {
        accounts.push(accountData);
      }

      localStorage.setItem('bankAccounts', JSON.stringify(accounts));
      setSuccessMessage(isEditMode ? 'Bank account updated successfully!' : 'Bank account created successfully!');
      setTimeout(() => navigate('/account/bank-account'), 1500);
    } catch (err) {
      setError('Failed to save bank account');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, companies, navigate, isEditMode, id]);

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <PageHeader
        title={isEditMode ? 'Update Bank Account' : 'Add Bank'}
        backPath="/account/bank-account"
      />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <FormSection title="Bank Details" icon={<AccountBalanceIcon sx={{ color: '#FF6B35' }} />}>
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
                      <MenuItem value="">EST Gas</MenuItem>
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
                    Bank Name *
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">List Of Bank</MenuItem>
                      {BANK_NAMES.map((name) => (
                        <MenuItem key={name} value={name}>{name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Title *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write account Name"
                    value={formData.accountTitle}
                    onChange={(e) => handleInputChange('accountTitle', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Bank account Number *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="00000"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Branch Name *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write Branch Name"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Date *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Details
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    placeholder="Write details about Account"
                    value={formData.details}
                    onChange={(e) => handleInputChange('details', e.target.value)}
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
                onClick={() => navigate('/account/bank-account')}
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

export default AddBankAccountPage;
