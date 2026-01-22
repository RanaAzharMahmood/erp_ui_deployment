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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import { useCompanies } from '../../../hooks';
import { getJournalEntriesApi } from '../../../generated/api/client';

interface LineItem {
  id: string;
  accountName: string;
  debit: string;
  credit: string;
}

interface JournalEntryFormData {
  companyId: number | '';
  journalNumber: string;
  date: string;
  memo: string;
  paymentMethod: string;
  referenceType: string;
  accountType: string;
  status: 'Draft' | 'Approved' | 'Pending';
}

// Memo types - Mandatory when Reference type is Adjustment/Opening Balance
const MEMO_TYPES = ['Memorandum Entries', 'Debit Memos/Credit Memos'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];
// Reference types
const REFERENCE_TYPES = ['Sales', 'Purchase', 'Expense', 'Tax Adjustment', 'Opening Balance'];
// Account types
const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
// Parent accounts for account selection (used in line items)
const PARENT_ACCOUNTS = [
  '110-Current',
  '111-Cash',
  '112-Bank',
  '113-Inventory',
  '120-Non Current Assets',
  '121-Fixed Assets',
  '202-Equity',
];

const AddJournalEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<JournalEntryFormData>({
    companyId: '',
    journalNumber: '',
    date: '',
    memo: '',
    paymentMethod: '',
    referenceType: '',
    accountType: '',
    status: 'Draft',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', accountName: 'Assets', debit: '2400582.0', credit: '0' },
    { id: '2', accountName: 'Assets', debit: '0', credit: '2400582.0' },
  ]);

  const { companies: rawCompanies, refetch: refetchCompanies } = useCompanies();
  const companies = rawCompanies.map((c) => ({ id: c.id, name: c.name }));

  // Refetch companies on mount to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);
  const [chequeImage, setChequeImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Generate auto journal number
  const generateJournalNumber = useCallback(async () => {
    try {
      const api = getJournalEntriesApi();
      const response = await api.getAll({ limit: 1 });
      if (response.success && response.data) {
        const nextNumber = (response.data.total || 0) + 1;
        return `JE-${String(nextNumber).padStart(6, '0')}`;
      }
    } catch (err) {
      console.error('Error generating journal number from API:', err);
    }
    // Fallback to a default starting number
    return `JE-000001`;
  }, []);

  // Check if memo is required (when reference type is Tax Adjustment or Opening Balance)
  const isMemoRequired = formData.referenceType === 'Tax Adjustment' || formData.referenceType === 'Opening Balance';

  // Load existing entry if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isEditMode && id) {
          // Try to load from API first
          try {
            const api = getJournalEntriesApi();
            const response = await api.getById(parseInt(id, 10));
            if (response.success && response.data) {
              const entry = response.data;
              setFormData({
                companyId: entry.companyId || '',
                journalNumber: entry.entryNumber || '',
                date: entry.date || '',
                memo: entry.description || '',
                paymentMethod: '',
                referenceType: entry.reference || '',
                accountType: '',
                status: entry.status === 'draft' ? 'Draft' : entry.status === 'posted' ? 'Approved' : 'Pending',
              });
              if (entry.lines) {
                setLineItems(entry.lines.map((line) => ({
                  id: String(line.id || Date.now()),
                  accountName: line.accountName || '',
                  debit: String(line.debit || 0),
                  credit: String(line.credit || 0),
                })));
              }
              return;
            }
          } catch (apiErr) {
            console.error('Error loading entry from API:', apiErr);
            setError('Failed to load journal entry');
          }
        } else {
          // Auto-generate journal number for new entries
          const journalNumber = await generateJournalNumber();
          setFormData((prev) => ({ ...prev, journalNumber }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, [id, isEditMode, generateJournalNumber]);

  const handleInputChange = useCallback((field: keyof JournalEntryFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLineItemChange = useCallback((itemId: string, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  }, []);

  const handleAddLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      accountName: '',
      debit: '0',
      credit: '0',
    };
    setLineItems((prev) => [...prev, newItem]);
  }, []);

  const handleRemoveLineItem = useCallback((itemId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChequeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const calculateTotals = useCallback(() => {
    const totalDebit = lineItems.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  }, [lineItems]);

  const handleSubmit = useCallback(async () => {
    if (!formData.journalNumber || !formData.date || !formData.referenceType || !formData.accountType) {
      setError('Please fill in all required fields');
      return;
    }

    // Memo is mandatory when reference type is Tax Adjustment or Opening Balance
    if (isMemoRequired && !formData.memo) {
      setError('Memo is required for Tax Adjustment and Opening Balance entries');
      return;
    }

    const { isBalanced } = calculateTotals();
    if (!isBalanced) {
      setError('Total Debit must equal Total Credit');
      return;
    }

    setIsSubmitting(true);
    try {
      const api = getJournalEntriesApi();
      const company = companies.find((c) => c.id === formData.companyId);
      const entryData = {
        companyId: formData.companyId as number,
        entryNumber: formData.journalNumber,
        date: formData.date,
        description: formData.memo,
        reference: formData.referenceType,
        status: formData.status === 'Draft' ? 'draft' : formData.status === 'Approved' ? 'posted' : 'pending',
        lines: lineItems.map((item) => ({
          accountName: item.accountName,
          debit: parseFloat(item.debit) || 0,
          credit: parseFloat(item.credit) || 0,
        })),
      };

      if (isEditMode && id) {
        await api.update(parseInt(id, 10), entryData);
      } else {
        await api.create(entryData);
      }

      setSuccessMessage(isEditMode ? 'Journal entry updated successfully!' : 'Journal entry created successfully!');
      setTimeout(() => navigate('/account/journal-entry'), 1500);
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError('Failed to save journal entry');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, companies, navigate, isEditMode, id, calculateTotals, isMemoRequired]);

  const { totalDebit, totalCredit, isBalanced } = calculateTotals();

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <PageHeader
        title={isEditMode ? 'Update Journal Entry' : 'Add Journal Entry'}
        backPath="/account/journal-entry"
      />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <FormSection title="Journal Entry" icon={<DescriptionIcon sx={{ color: '#FF6B35' }} />}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Select Company
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.companyId}
                      onChange={(e) => handleInputChange('companyId', e.target.value as number)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
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
                    Journal Number*
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Number"
                    value={formData.journalNumber}
                    onChange={(e) => handleInputChange('journalNumber', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Date*
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

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Memo
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.memo}
                      onChange={(e) => handleInputChange('memo', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select Memo type</MenuItem>
                      {MEMO_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Payment Method*
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select Method</MenuItem>
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>{method}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Reference Type*
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.referenceType}
                      onChange={(e) => handleInputChange('referenceType', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select From List</MenuItem>
                      {REFERENCE_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Type*
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select type</MenuItem>
                      {ACCOUNT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Line Items Table */}
              <Box sx={{ mt: 3 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#1F2937' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Account Name</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Debit</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Credit</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={item.accountName}
                                onChange={(e) => handleLineItemChange(item.id, 'accountName', e.target.value)}
                                displayEmpty
                                sx={{ bgcolor: 'white' }}
                              >
                                <MenuItem value="">Select Account</MenuItem>
                                {PARENT_ACCOUNTS.map((account) => (
                                  <MenuItem key={account} value={account}>{account}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.debit}
                              onChange={(e) => handleLineItemChange(item.id, 'debit', e.target.value)}
                              placeholder="0.0 PKR"
                              sx={{ bgcolor: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.credit}
                              onChange={(e) => handleLineItemChange(item.id, 'credit', e.target.value)}
                              placeholder="0.0 PKR"
                              sx={{ bgcolor: 'white' }}
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
                  startIcon={<AddIcon />}
                  onClick={handleAddLineItem}
                  sx={{
                    mt: 2,
                    color: '#374151',
                    bgcolor: '#F3F4F6',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#E5E7EB' },
                  }}
                >
                  Line Item
                </Button>
              </Box>

              {/* Balance Indicator */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: isBalanced ? '#E5E7EB' : '#FEE2E2',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total Debit = Total Credit
                </Typography>
                <Typography variant="caption" sx={{ color: isBalanced ? '#6B7280' : '#EF4444' }}>
                  {totalDebit.toFixed(1)} PKR = {totalCredit.toFixed(1)} PKR
                </Typography>
              </Box>
            </FormSection>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Upload Cheque Image */}
            <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ImageIcon sx={{ color: '#FF6B35' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upload Cheque Image
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  border: '2px dashed #E5E7EB',
                  borderRadius: 1,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#FF6B35' },
                }}
                component="label"
              >
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                {chequeImage ? (
                  <img src={chequeImage} alt="Cheque" style={{ maxWidth: '100%', maxHeight: 150 }} />
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: '#FFF7ED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                      }}
                    >
                      <ImageIcon sx={{ color: '#FF6B35' }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Upload Cheque Image
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SVG, PNG, JPG or GIF (max. 2Mb)
                    </Typography>
                  </>
                )}
              </Box>
            </Card>

            {/* Status */}
            <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CircleIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {(['Draft', 'Approved', 'Pending'] as const).map((status) => (
                <Box
                  key={status}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleInputChange('status', status)}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `2px solid ${formData.status === status ? '#FF6B35' : '#D1D5DB'}`,
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
            </Card>

            {/* Download PDF Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                mb: 2,
                py: 1.5,
                borderColor: '#10B981',
                color: '#10B981',
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#059669',
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                },
              }}
            >
              Download PDF
            </Button>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/account/journal-entry')}
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
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  bgcolor: '#FF6B35',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#E55A2B' },
                }}
              >
                {isEditMode ? 'Save Changes' : 'Save Journal'}
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

export default AddJournalEntryPage;
