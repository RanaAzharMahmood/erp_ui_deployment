import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Receipt as ReceiptIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';

interface LineItem {
  id: string;
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface SalesReturnFormData {
  companyId: number | '';
  customerId: string;
  returnNumber: string;
  originalInvoice: string;
  date: string;
  returnReason: string;
  paymentMethod: string;
  accountNumber: string;
  remarks: string;
  status: 'Active' | 'Completed' | 'Pending';
  taxId: string;
  refundAmount: number;
}

const PAYMENT_METHODS = ['Hand in Cash', 'Bank Transfer (Online)', 'Cheque'];

const AddSalesReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<SalesReturnFormData>({
    companyId: '',
    customerId: '',
    returnNumber: '',
    originalInvoice: '',
    date: '',
    returnReason: '',
    paymentMethod: '',
    accountNumber: '',
    remarks: '',
    status: 'Pending',
    taxId: '',
    refundAmount: 0,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', item: '', quantity: 0, rate: 0, amount: 0 },
  ]);
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [salesInvoices, setSalesInvoices] = useState<Array<{ id: string; invoiceNumber: string; customerId: string }>>([]);
  const [taxes, setTaxes] = useState<Array<{ id: string; name: string; percentage: number }>>([]);
  const [items, setItems] = useState<Array<{ id: string; name: string; rate: number }>>([]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if payment method requires image upload and account number
  const requiresImageAndAccount = formData.paymentMethod === 'Bank Transfer (Online)' || formData.paymentMethod === 'Cheque';

  // Generate return number
  const generateReturnNumber = useCallback(() => {
    const savedReturns = localStorage.getItem('salesReturns');
    const returns = savedReturns ? JSON.parse(savedReturns) : [];
    const nextNumber = returns.length + 1;
    return `SR-${String(nextNumber).padStart(6, '0')}`;
  }, []);

  // Load data
  useEffect(() => {
    try {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies);
        setCompanies(parsed.map((c: any) => ({ id: c.id, name: c.companyName })));
      }

      const savedCustomers = localStorage.getItem('customers');
      if (savedCustomers) {
        const parsed = JSON.parse(savedCustomers);
        setCustomers(parsed.map((c: any) => ({ id: c.id, name: c.customerName || c.name })));
      }

      const savedInvoices = localStorage.getItem('salesInvoices');
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices);
        setSalesInvoices(parsed.map((i: any) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          customerId: i.customerId,
        })));
      }

      const savedTaxes = localStorage.getItem('taxes');
      if (savedTaxes) {
        const parsed = JSON.parse(savedTaxes);
        setTaxes(parsed.map((t: any) => ({
          id: t.id,
          name: t.taxName,
          percentage: t.taxPercentage,
        })));
      }

      const savedItems = localStorage.getItem('inventoryItems');
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        setItems(parsed.map((i: any) => ({
          id: i.id,
          name: i.itemName || i.name,
          rate: i.salePrice || i.rate || 0,
        })));
      }

      // Generate return number for new returns
      if (!isEditMode) {
        setFormData((prev) => ({ ...prev, returnNumber: generateReturnNumber() }));
      }

      // Load existing return for edit mode
      if (isEditMode && id) {
        const savedReturns = localStorage.getItem('salesReturns');
        if (savedReturns) {
          const returns = JSON.parse(savedReturns);
          const returnData = returns.find((r: any) => r.id === id);
          if (returnData) {
            setFormData({
              companyId: returnData.companyId || '',
              customerId: returnData.customerId || '',
              returnNumber: returnData.returnNumber,
              originalInvoice: returnData.originalInvoice || '',
              date: returnData.date,
              returnReason: returnData.returnReason || '',
              paymentMethod: returnData.paymentMethod || '',
              accountNumber: returnData.accountNumber || '',
              remarks: returnData.remarks || '',
              status: returnData.status,
              taxId: returnData.taxId || '',
              refundAmount: returnData.refundAmount || 0,
            });
            if (returnData.lineItems) {
              setLineItems(returnData.lineItems);
            }
            if (returnData.receiptImage) {
              setReceiptImage(returnData.receiptImage);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [isEditMode, id, generateReturnNumber]);

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

  const handleStatusChange = useCallback((status: 'Active' | 'Completed' | 'Pending') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const handleLineItemChange = useCallback((id: string, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto-calculate amount
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          // If item is selected, auto-fill rate
          if (field === 'item') {
            const selectedItem = items.find((i) => i.name === value);
            if (selectedItem) {
              updated.rate = selectedItem.rate;
              updated.amount = updated.quantity * selectedItem.rate;
            }
          }
          return updated;
        }
        return item;
      })
    );
  }, [items]);

  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { id: String(Date.now()), item: '', quantity: 0, rate: 0, amount: 0 },
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
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Calculate totals
  const grossAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const selectedTax = taxes.find((t) => t.id === formData.taxId);
  const taxAmount = selectedTax ? (grossAmount * selectedTax.percentage) / 100 : 0;
  const netAmount = grossAmount + taxAmount;

  const handleSubmit = useCallback(async () => {
    if (!formData.customerId || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate image upload for Bank Transfer and Cheque
    if (requiresImageAndAccount && !receiptImage) {
      setError('Receipt image is required for Bank Transfer and Cheque payments');
      return;
    }

    if (requiresImageAndAccount && !formData.accountNumber) {
      setError('Account number is required for Bank Transfer and Cheque payments');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const returns = JSON.parse(localStorage.getItem('salesReturns') || '[]');
      const company = companies.find((c) => c.id === formData.companyId);
      const customer = customers.find((c) => c.id === formData.customerId);
      const firstItem = lineItems.find((l) => l.item)?.item || '';
      const totalQuantity = lineItems.reduce((sum, l) => sum + (l.quantity || 0), 0);

      const returnData = {
        id: isEditMode ? id : String(Date.now()),
        companyId: formData.companyId,
        companyName: company?.name || 'GST Gas',
        customerId: formData.customerId,
        customerName: customer?.name || '',
        returnNumber: formData.returnNumber,
        originalInvoice: formData.originalInvoice,
        date: formData.date,
        returnReason: formData.returnReason,
        paymentMethod: formData.paymentMethod,
        accountNumber: formData.accountNumber,
        remarks: formData.remarks,
        item: firstItem,
        quantity: totalQuantity,
        grossAmount,
        netAmount,
        taxAmount,
        refundAmount: formData.refundAmount,
        status: formData.status,
        lineItems,
        receiptImage,
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode) {
        const index = returns.findIndex((r: any) => r.id === id);
        if (index !== -1) {
          returns[index] = { ...returns[index], ...returnData };
        }
      } else {
        returns.push(returnData);
      }

      localStorage.setItem('salesReturns', JSON.stringify(returns));

      setSuccessMessage(isEditMode ? 'Return updated successfully!' : 'Return created successfully!');
      setTimeout(() => {
        navigate('/sales/return');
      }, 1500);
    } catch (err) {
      console.error('Error saving return:', err);
      setError('Failed to save return. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, companies, customers, lineItems, grossAmount, netAmount, taxAmount, receiptImage, navigate, isEditMode, id, requiresImageAndAccount]);

  const handleCancel = useCallback(() => {
    navigate('/sales/return');
  }, [navigate]);

  // Filter invoices by selected customer
  const filteredInvoices = salesInvoices.filter((inv) => !formData.customerId || inv.customerId === formData.customerId);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={isEditMode ? 'Update Sales Return' : 'Return Sales Invoice'} backPath="/sales/return" />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Return Sales Invoice" icon={<ReceiptIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Company
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange('companyId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">EST Gas</MenuItem>
                    {companies.map((comp) => (
                      <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Return Number
                </Typography>
                <TextField
                  fullWidth
                  name="returnNumber"
                  value={formData.returnNumber}
                  onChange={handleInputChange}
                  size="small"
                  disabled
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Customer *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.customerId}
                    onChange={(e) => handleSelectChange('customerId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Customer</MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Original Invoice
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.originalInvoice}
                    onChange={(e) => handleSelectChange('originalInvoice', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">Select Invoice</MenuItem>
                    {filteredInvoices.map((inv) => (
                      <MenuItem key={inv.id} value={inv.id}>{inv.invoiceNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  Return Reason
                </Typography>
                <TextField
                  fullWidth
                  name="returnReason"
                  value={formData.returnReason}
                  onChange={handleInputChange}
                  placeholder="Enter return reason"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Payment Method
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Method</MenuItem>
                    {PAYMENT_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Conditional Account Number Field */}
              {requiresImageAndAccount && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Account Number *
                  </Typography>
                  <TextField
                    fullWidth
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={requiresImageAndAccount ? 12 : 6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Remarks
                </Typography>
                <TextField
                  fullWidth
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter your remarks"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
            </Grid>

            {/* Line Items Table */}
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1F2937' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rate</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.item}
                            onChange={(e) => handleLineItemChange(item.id, 'item', e.target.value)}
                            displayEmpty
                            sx={{ bgcolor: 'white' }}
                          >
                            <MenuItem value="" disabled>Select Item</MenuItem>
                            {items.map((i) => (
                              <MenuItem key={i.id} value={i.name}>{i.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="0.0 PKR"
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.amount}
                          disabled
                          size="small"
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }}
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
              Add Line Item
            </Button>

            {/* Summary Section */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Gross:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{grossAmount.toFixed(2)} PKR</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>Net Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{netAmount.toFixed(2)} PKR</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">Tax:</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={formData.taxId}
                    onChange={(e) => handleSelectChange('taxId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">Select Tax</MenuItem>
                    {taxes.map((tax) => (
                      <MenuItem key={tax.id} value={tax.id}>{tax.name} ({tax.percentage}%)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Refund Amount:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">PKR</Typography>
                  <TextField
                    type="number"
                    value={formData.refundAmount}
                    onChange={(e) => handleSelectChange('refundAmount', parseFloat(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 100, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Box>
              </Box>
            </Box>
          </FormSection>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Upload Receipt Image - Only show for Bank Transfer and Cheque */}
          {requiresImageAndAccount && (
            <FormSection
              title={formData.paymentMethod === 'Cheque' ? 'Upload Cheque Image *' : 'Upload Receipt Image *'}
              icon={<ImageIcon />}
              sx={{ mb: 3 }}
            >
              <Divider sx={{ mb: 3, mt: -1 }} />
              <Box
                sx={{
                  border: `2px dashed ${receiptImage ? '#10B981' : '#E5E7EB'}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#FF6B35' },
                }}
                onClick={() => document.getElementById('receipt-upload')?.click()}
              >
                {receiptImage ? (
                  <img src={receiptImage} alt="Receipt" style={{ maxWidth: '100%', maxHeight: 150 }} />
                ) : (
                  <>
                    <DownloadIcon sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formData.paymentMethod === 'Cheque' ? 'Upload Cheque Image' : 'Upload Receipt Image'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SVG, PNG, JPG or GIF (max. 2Mb)
                    </Typography>
                  </>
                )}
              </Box>
              <input
                type="file"
                id="receipt-upload"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </FormSection>
          )}

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Active', 'Completed', 'Pending'].map((status) => (
                <Box
                  key={status}
                  onClick={() => handleStatusChange(status as 'Active' | 'Completed' | 'Pending')}
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
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B',
                },
              }}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Return' : 'Save Return'}
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

export default AddSalesReturnPage;
