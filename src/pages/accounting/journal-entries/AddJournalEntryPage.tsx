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
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import { useCompanies } from '../../../hooks';
import { useCompany } from '../../../contexts/CompanyContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getJournalEntriesApi, getChartOfAccountsApi } from '../../../generated/api/client';

interface Account {
  id: number;
  accountCode: string;
  accountName: string;
}

interface LineItem {
  id: string;
  accountId: number | '';
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

const MEMO_TYPES = ['Memorandum Entries', 'Debit Memos/Credit Memos'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];
const REFERENCE_TYPES = ['Sales', 'Purchase', 'Expense', 'Tax Adjustment', 'Opening Balance'];
const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Cost of Sales', 'Expense'];

const emptyLine = (): LineItem => ({
  id: Date.now().toString() + Math.random(),
  accountId: '',
  accountName: '',
  debit: '0',
  credit: '0',
});

const AddJournalEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  const [formData, setFormData] = useState<JournalEntryFormData>({
    companyId: (!isAdmin && selectedCompany) ? selectedCompany.id : '',
    journalNumber: '',
    date: today,
    memo: '',
    paymentMethod: '',
    referenceType: '',
    accountType: '',
    status: 'Draft',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLine(), emptyLine()]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const { companies: rawCompanies, refetch: refetchCompanies } = useCompanies();
  const companies = rawCompanies.map((c) => ({ id: c.id, name: c.name }));

  useEffect(() => { refetchCompanies(); }, [refetchCompanies]);

  // Sync companyId for non-admin users once selectedCompany is available from context
  useEffect(() => {
    if (!isAdmin && selectedCompany && !formData.companyId) {
      setFormData((prev) => ({ ...prev, companyId: selectedCompany.id }));
    }
  }, [isAdmin, selectedCompany, formData.companyId]);

  const [chequeImage, setChequeImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load accounts whenever the selected company changes
  useEffect(() => {
    const companyId = formData.companyId;
    if (!companyId) {
      setAccounts([]);
      return;
    }
    const load = async () => {
      try {
        const api = getChartOfAccountsApi();
        const res = await api.getAllAccounts({ companyId: companyId as number, isActive: true });
        if (res.success && res.data) {
          setAccounts(res.data.map((a) => ({
            id: a.id,
            accountCode: a.accountCode,
            accountName: a.accountName,
          })));
        }
      } catch (err) {
        console.error('Failed to load accounts', err);
      }
    };
    load();
  }, [formData.companyId]);

  // Auto-generate journal number for new entries
  useEffect(() => {
    if (isEditMode) return;
    const gen = async () => {
      try {
        const api = getJournalEntriesApi();
        const res = await api.getAll({ limit: 1 });
        const next = (res.data?.total ?? 0) + 1;
        setFormData((p) => ({ ...p, journalNumber: `JE-${String(next).padStart(6, '0')}` }));
      } catch {
        setFormData((p) => ({ ...p, journalNumber: 'JE-000001' }));
      }
    };
    gen();
  }, [isEditMode]);

  // Load existing entry if editing
  useEffect(() => {
    if (!isEditMode || !id) return;
    const load = async () => {
      try {
        const api = getJournalEntriesApi();
        const res = await api.getById(parseInt(id, 10));
        if (res.success && res.data) {
          const entry = res.data;
          setFormData({
            companyId: entry.companyId || '',
            journalNumber: entry.entryNumber || '',
            date: entry.date || '',
            memo: entry.description || '',
            paymentMethod: '',
            referenceType: entry.reference || '',
            accountType: '',
            status: entry.status === 'posted' ? 'Approved' : entry.status === 'void' ? 'Pending' : 'Draft',
          });
          if (entry.lines) {
            setLineItems(entry.lines.map((line) => ({
              id: String(line.id ?? Date.now()),
              accountId: line.accountId,
              accountName: line.accountName ?? '',
              debit: String(line.debit ?? 0),
              credit: String(line.credit ?? 0),
            })));
          }
        }
      } catch {
        setError('Failed to load journal entry');
      }
    };
    load();
  }, [id, isEditMode]);

  const handleInputChange = useCallback((field: keyof JournalEntryFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // When user picks an account in a line — set both accountId and accountName
  const handleLineAccountChange = useCallback((itemId: string, accountId: number | '') => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const found = accounts.find((a) => a.id === accountId);
        return {
          ...item,
          accountId,
          accountName: found ? `${found.accountCode} - ${found.accountName}` : '',
        };
      })
    );
  }, [accounts]);

  const handleLineFieldChange = useCallback((itemId: string, field: 'debit' | 'credit', value: string) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  }, []);

  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, emptyLine()]);
  }, []);

  const handleRemoveLineItem = useCallback((itemId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setChequeImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const totalDebit = lineItems.reduce((s, i) => s + (parseFloat(i.debit) || 0), 0);
  const totalCredit = lineItems.reduce((s, i) => s + (parseFloat(i.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleSubmit = useCallback(async () => {
    if (!formData.date || !formData.referenceType || !formData.companyId) {
      setError('Please fill in all required fields');
      return;
    }

    const missingAccount = lineItems.some((l) => !l.accountId);
    if (missingAccount) {
      setError('Please select an account for every line item');
      return;
    }

    if (!isBalanced) {
      setError('Total Debit must equal Total Credit');
      return;
    }

    setIsSubmitting(true);
    try {
      const api = getJournalEntriesApi();
      const payload = {
        companyId: formData.companyId as number,
        date: formData.date,
        description: formData.memo || undefined,
        reference: formData.referenceType || undefined,
        lines: lineItems.map((item) => ({
          accountId: item.accountId as number,
          debit: parseFloat(item.debit) || 0,
          credit: parseFloat(item.credit) || 0,
        })),
      };

      if (isEditMode && id) {
        await api.update(parseInt(id, 10), payload);
      } else {
        await api.create(payload);
      }

      setSuccessMessage(isEditMode ? 'Journal entry updated successfully!' : 'Journal entry created successfully!');
      setTimeout(() => navigate('/account/journal-entry'), 1500);
    } catch (err: any) {
      console.error('Error saving journal entry:', err);
      setError(err?.message ?? 'Failed to save journal entry');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, isBalanced, navigate, isEditMode, id]);

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
                {isAdmin && (
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
                        <MenuItem value="">Select Company</MenuItem>
                        {companies.map((c) => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Journal Number
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    value={formData.journalNumber}
                    InputProps={{ readOnly: true }}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Date*
                  </Typography>
                  <TextField
                    fullWidth size="small" type="date"
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
                      displayEmpty sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select Memo type</MenuItem>
                      {MEMO_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Payment Method
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      displayEmpty sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select Method</MenuItem>
                      {PAYMENT_METHODS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
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
                      displayEmpty sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select From List</MenuItem>
                      {REFERENCE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Type
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      displayEmpty sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select type</MenuItem>
                      {ACCOUNT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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
                        <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={item.accountId}
                                onChange={(e) => handleLineAccountChange(item.id, e.target.value as number | '')}
                                displayEmpty
                                sx={{ bgcolor: 'white' }}
                              >
                                <MenuItem value="">
                                  {accounts.length === 0 && formData.companyId
                                    ? <em>Loading...</em>
                                    : <em>Select Account</em>}
                                </MenuItem>
                                {accounts.map((a) => (
                                  <MenuItem key={a.id} value={a.id}>
                                    {a.accountCode} - {a.accountName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth size="small" type="number"
                              value={item.debit}
                              onChange={(e) => handleLineFieldChange(item.id, 'debit', e.target.value)}
                              placeholder="0.00"
                              sx={{ bgcolor: 'white' }}
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth size="small" type="number"
                              value={item.credit}
                              onChange={(e) => handleLineFieldChange(item.id, 'credit', e.target.value)}
                              placeholder="0.00"
                              sx={{ bgcolor: 'white' }}
                              inputProps={{ min: 0 }}
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
                  mt: 3, p: 2,
                  bgcolor: isBalanced ? '#E5E7EB' : '#FEE2E2',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total Debit = Total Credit
                </Typography>
                <Typography variant="caption" sx={{ color: isBalanced ? '#6B7280' : '#EF4444' }}>
                  {totalDebit.toFixed(2)} PKR = {totalCredit.toFixed(2)} PKR
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Upload Cheque Image</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  border: '2px dashed #E5E7EB', borderRadius: 1, p: 4,
                  textAlign: 'center', cursor: 'pointer',
                  '&:hover': { borderColor: '#FF6B35' },
                }}
                component="label"
              >
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                {chequeImage ? (
                  <img src={chequeImage} alt="Cheque" style={{ maxWidth: '100%', maxHeight: 150 }} />
                ) : (
                  <>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '50%', bgcolor: '#FFF7ED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mx: 'auto', mb: 1,
                    }}>
                      <ImageIcon sx={{ color: '#FF6B35' }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Upload Cheque Image</Typography>
                    <Typography variant="caption" color="text.secondary">SVG, PNG, JPG or GIF (max. 2Mb)</Typography>
                  </>
                )}
              </Box>
            </Card>

            {/* Status */}
            <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CircleIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Status</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {(['Draft', 'Approved', 'Pending'] as const).map((status) => (
                <Box
                  key={status}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer' }}
                  onClick={() => handleInputChange('status', status)}
                >
                  <Box sx={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `2px solid ${formData.status === status ? '#FF6B35' : '#D1D5DB'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {formData.status === status && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF6B35' }} />
                    )}
                  </Box>
                  <Typography variant="body2">{status}</Typography>
                </Box>
              ))}
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined" fullWidth
                onClick={() => navigate('/account/journal-entry')}
                sx={{ py: 1.5, borderColor: '#E5E7EB', color: '#374151', textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained" fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ py: 1.5, bgcolor: '#FF6B35', textTransform: 'none', '&:hover': { bgcolor: '#E55A2B' } }}
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
