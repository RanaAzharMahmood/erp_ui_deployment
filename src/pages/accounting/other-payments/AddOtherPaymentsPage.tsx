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
  Payment as PaymentIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';

interface LineItem {
  id: string;
  paymentDetails: string;
  amount: string;
}

interface OtherPaymentFormData {
  companyId: number | '';
  paymentNumber: string;
  paymentName: string;
  accountType: string;
  reference: string;
  contactName: string;
  paymentMethod: string;
  note: string;
  status: 'Submit' | 'Draft';
}

const ACCOUNT_TYPES = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];
const REFERENCES = ['Sales', 'Expense', 'Purchase', 'Receipt', 'Payment'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];

const AddOtherPaymentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<OtherPaymentFormData>({
    companyId: '',
    paymentNumber: '0000000',
    paymentName: '',
    accountType: '',
    reference: '',
    contactName: '',
    paymentMethod: '',
    note: '',
    status: 'Submit',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', paymentDetails: 'Choose', amount: '0.0' },
  ]);

  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load companies and existing payment if editing
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
        const savedPayments = localStorage.getItem('otherPayments');
        if (savedPayments) {
          const payments = JSON.parse(savedPayments);
          const payment = payments.find((p: { id: string }) => p.id === id);
          if (payment) {
            setFormData({
              companyId: payment.companyId || '',
              paymentNumber: payment.paymentNumber || payment.number || '0000000',
              paymentName: payment.paymentName || '',
              accountType: payment.accountType || '',
              reference: payment.reference || '',
              contactName: payment.contactName || '',
              paymentMethod: payment.paymentMethod || '',
              note: payment.note || '',
              status: payment.status || 'Submit',
            });
            if (payment.lineItems) {
              setLineItems(payment.lineItems);
            }
            if (payment.slipImage) {
              setSlipImage(payment.slipImage);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [id, isEditMode]);

  const handleInputChange = useCallback((field: keyof OtherPaymentFormData, value: string | number) => {
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
      paymentDetails: '',
      amount: '0.0',
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
        setSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const calculateTotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [lineItems]);

  const handleSubmit = useCallback(async () => {
    if (!formData.paymentName || !formData.accountType || !formData.reference || !formData.contactName || !formData.paymentMethod) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedPayments = localStorage.getItem('otherPayments');
      const payments = savedPayments ? JSON.parse(savedPayments) : [];

      const company = companies.find((c) => c.id === formData.companyId);
      const paymentData = {
        id: isEditMode ? id : Date.now().toString(),
        ...formData,
        number: formData.paymentNumber,
        companyName: company?.name || 'EST-Gas',
        date: new Date().toISOString().split('T')[0],
        lineItems,
        slipImage,
        totalAmount: calculateTotal(),
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode) {
        const index = payments.findIndex((p: { id: string }) => p.id === id);
        if (index !== -1) {
          payments[index] = { ...payments[index], ...paymentData };
        }
      } else {
        payments.push(paymentData);
      }

      localStorage.setItem('otherPayments', JSON.stringify(payments));
      setSuccessMessage(isEditMode ? 'Payment updated successfully!' : 'Payment created successfully!');
      setTimeout(() => navigate('/account/other-payments'), 1500);
    } catch (err) {
      setError('Failed to save payment');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, lineItems, slipImage, companies, navigate, isEditMode, id, calculateTotal]);

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <PageHeader
        title="Other Payments"
        backPath="/account/other-payments"
      />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <FormSection title="Payments Details" icon={<PaymentIcon sx={{ color: '#FF6B35' }} />}>
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
                    Payment Number *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.paymentNumber}
                    onChange={(e) => handleInputChange('paymentNumber', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Payment Name *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write about Payment name"
                    value={formData.paymentName}
                    onChange={(e) => handleInputChange('paymentName', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
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
                      <MenuItem value="">Select type</MenuItem>
                      {ACCOUNT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Referance *
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select one option</MenuItem>
                      {REFERENCES.map((ref) => (
                        <MenuItem key={ref} value={ref}>{ref}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Contact Name *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write Name"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Payment Methords *
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select one option</MenuItem>
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>{method}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Note
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add Note"
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Grid>
              </Grid>

              {/* Line Items Table */}
              <Box sx={{ mt: 3 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#1F2937' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Payment Details</TableCell>
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
                              size="small"
                              value={item.paymentDetails}
                              onChange={(e) => handleLineItemChange(item.id, 'paymentDetails', e.target.value)}
                              placeholder="Choose"
                              sx={{ bgcolor: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.amount}
                              onChange={(e) => handleLineItemChange(item.id, 'amount', e.target.value)}
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

              {/* Total Amount */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Total Amount: <strong>{calculateTotal().toFixed(1)} PKR</strong>
                </Typography>
              </Box>
            </FormSection>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Upload Slip */}
            <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ImageIcon sx={{ color: '#FF6B35' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upload Slip
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
                {slipImage ? (
                  <img src={slipImage} alt="Slip" style={{ maxWidth: '100%', maxHeight: 150 }} />
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

              {(['Submit', 'Draft'] as const).map((status) => (
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
                onClick={() => navigate('/account/other-payments')}
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
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  bgcolor: '#FF6B35',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#E55A2B' },
                }}
              >
                Add Deposit
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

export default AddOtherPaymentsPage;
