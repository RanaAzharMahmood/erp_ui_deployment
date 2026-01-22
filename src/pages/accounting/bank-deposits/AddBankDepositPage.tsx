import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import { useCompanies } from '../../../hooks';
import {
  getBankAccountsApi,
  getBankDepositsApi,
  BankAccount,
  CreateBankDepositRequest,
} from '../../../generated/api/client';

interface LineItem {
  id: string;
  depositTitle: string;
  amount: number;
}

interface DepositFormData {
  companyId: number | '';
  depositEntryNumber: string;
  bankAccount: string;
  depositSlipNumber: string;
  date: string;
  note: string;
  referenceType: string;
  accountType: string;
  depositMethod: string;
  status: 'Submit' | 'Reject';
}

const REFERENCE_TYPES = ['Invoice', 'Receipt', 'Other'];
const ACCOUNT_TYPES = ['Savings', 'Current', 'Fixed Deposit'];
const DEPOSIT_METHODS = ['Cash', 'Cheque', 'Online Transfer', 'RTGS', 'NEFT'];

const AddBankDepositPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DepositFormData>({
    companyId: '',
    depositEntryNumber: '0000000',
    bankAccount: '',
    depositSlipNumber: '',
    date: '',
    note: '',
    referenceType: '',
    accountType: '',
    depositMethod: '',
    status: 'Submit',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', depositTitle: '', amount: 0 },
  ]);
  const { companies: rawCompanies, refetch: refetchCompanies } = useCompanies();
  const companies = rawCompanies.map((c) => ({ id: c.id, name: c.name }));

  // Refetch companies on mount to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [slipImage, setSlipImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load bank accounts from API with localStorage fallback
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        const api = getBankAccountsApi();
        const response = await api.getAll({ isActive: true });
        if (response.success && response.data?.data) {
          const mappedAccounts = response.data.data.map((account: BankAccount) => ({
            id: String(account.id),
            name: account.accountNumber || account.accountName,
          }));
          setBankAccounts(mappedAccounts);
          // Cache for offline access
          localStorage.setItem('bankAccountsDropdown', JSON.stringify(mappedAccounts));
        }
      } catch (error) {
        console.error('Error loading bank accounts from API:', error);
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem('bankAccountsDropdown');
          if (cached) {
            setBankAccounts(JSON.parse(cached));
          } else {
            // Final fallback to mock data
            setBankAccounts([
              { id: '1', name: 'BHI0112545464682' },
              { id: '2', name: 'HBL0098765432100' },
              { id: '3', name: 'MCB0056789012345' },
            ]);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      }
    };

    loadBankAccounts();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStatusChange = useCallback((status: 'Submit' | 'Reject') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const handleLineItemChange = useCallback((id: string, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: String(Date.now()), depositTitle: '', amount: 0 },
    ]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = useCallback(async () => {
    if (!formData.companyId || !formData.bankAccount || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const company = companies.find((c) => c.id === formData.companyId);
      const selectedAccount = bankAccounts.find((acc) => acc.name === formData.bankAccount);
      const bankAccountId = selectedAccount ? Number(selectedAccount.id) : 0;

      // Try API first
      try {
        const api = getBankDepositsApi();
        const createRequest: CreateBankDepositRequest = {
          date: formData.date,
          bankAccountId: bankAccountId,
          amount: totalAmount,
          reference: formData.depositSlipNumber || undefined,
          description: formData.note || undefined,
          depositedBy: formData.depositMethod || undefined,
          companyId: Number(formData.companyId),
        };

        const response = await api.create(createRequest);
        if (response.success) {
          setSuccessMessage('Deposit created successfully!');
          setTimeout(() => {
            navigate('/account/bank-deposit');
          }, 1500);
          return;
        }
      } catch (apiError) {
        console.error('API error, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      const deposits = JSON.parse(localStorage.getItem('bankDeposits') || '[]');

      const newDeposit = {
        id: String(Date.now()),
        companyId: formData.companyId,
        companyName: company?.name || 'EST-Gas',
        date: formData.date,
        bankAccount: formData.bankAccount,
        depositNumber: formData.depositSlipNumber || '01450545',
        depositEntryNumber: formData.depositEntryNumber,
        totalAmount,
        status: formData.status,
        note: formData.note,
        referenceType: formData.referenceType,
        accountType: formData.accountType,
        depositMethod: formData.depositMethod,
        lineItems,
        slipImage,
        createdAt: new Date().toISOString(),
      };

      deposits.push(newDeposit);
      localStorage.setItem('bankDeposits', JSON.stringify(deposits));

      setSuccessMessage('Deposit created successfully (offline mode)!');
      setTimeout(() => {
        navigate('/account/bank-deposit');
      }, 1500);
    } catch (err) {
      console.error('Error creating deposit:', err);
      setError('Failed to create deposit. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, companies, bankAccounts, lineItems, totalAmount, slipImage, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/account/bank-deposit');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Add Deposit" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Deposit Details" icon={<AccountBalanceIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Company*
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange('companyId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    {companies.map((comp) => (
                      <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Deposit Entry Number
                </Typography>
                <TextField
                  fullWidth
                  name="depositEntryNumber"
                  value={formData.depositEntryNumber}
                  onChange={handleInputChange}
                  placeholder="0000000"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Bank Account *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.bankAccount}
                    onChange={(e) => handleSelectChange('bankAccount', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Bank Account</MenuItem>
                    {bankAccounts.map((acc) => (
                      <MenuItem key={acc.id} value={acc.name}>{acc.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Deposit Slip Number
                </Typography>
                <TextField
                  fullWidth
                  name="depositSlipNumber"
                  value={formData.depositSlipNumber}
                  onChange={handleInputChange}
                  placeholder="00000000"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Date *
                </Typography>
                <TextField
                  fullWidth
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Note
                </Typography>
                <TextField
                  fullWidth
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Write note about deposit"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Reference Type *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.referenceType}
                    onChange={(e) => handleSelectChange('referenceType', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select From List</MenuItem>
                    {REFERENCE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
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
                    onChange={(e) => handleSelectChange('accountType', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select type</MenuItem>
                    {ACCOUNT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Deposit Method *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.depositMethod}
                    onChange={(e) => handleSelectChange('depositMethod', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select From List</MenuItem>
                    {DEPOSIT_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Line Items Table */}
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1F2937' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Deposit Title</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.depositTitle}
                          onChange={(e) => handleLineItemChange(item.id, 'depositTitle', e.target.value)}
                          placeholder="Choose"
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleLineItemChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.0 PKR"
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveLineItem(item.id)}
                          sx={{ color: '#EF4444' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddLineItem}
              sx={{
                mt: 2,
                borderColor: '#E5E7EB',
                color: '#374151',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Line Item
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Total Amount: <span style={{ fontWeight: 600 }}>{totalAmount.toFixed(1)} PKR</span>
              </Typography>
            </Box>
          </FormSection>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Upload Deposit Slip */}
          <FormSection title="Upload Deposit Slip" icon={<ImageIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Box
              sx={{
                border: '2px dashed #E5E7EB',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#FF6B35' },
              }}
              onClick={() => document.getElementById('slip-upload')?.click()}
            >
              {slipImage ? (
                <img src={slipImage} alt="Deposit Slip" style={{ maxWidth: '100%', maxHeight: 150 }} />
              ) : (
                <>
                  <DownloadIcon sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Upload Slip Image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    SVG, PNG, JPG or GIF (max. 2Mb)
                  </Typography>
                </>
              )}
            </Box>
            <input
              type="file"
              id="slip-upload"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </FormSection>

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Submit', 'Reject'].map((status) => (
                <Box
                  key={status}
                  onClick={() => handleStatusChange(status as 'Submit' | 'Reject')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '2px solid #FF6B35',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {formData.status === status && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#FF6B35',
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2">{status}</Typography>
                </Box>
              ))}
            </Box>
          </FormSection>

          {/* Download PDF Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              mb: 3,
              py: 1.5,
              textTransform: 'none',
              bgcolor: '#10B981',
              '&:hover': {
                bgcolor: '#059669',
              },
            }}
          >
            Download PDF
          </Button>

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
              {isSubmitting ? 'Creating...' : 'Add Deposit'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

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

export default AddBankDepositPage;
