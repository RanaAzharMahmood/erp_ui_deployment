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

interface SalesInvoiceFormData {
  companyId: number | '';
  customerId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  paymentMethod: string;
  accountNumber: string;
  remarks: string;
  status: 'Paid' | 'Overdue' | 'Pending';
  taxId: string;
  paidAmount: number;
  discount: number;
}

const PAYMENT_METHODS = ['Hand in Cash', 'Bank Transfer (Online)', 'Cheque'];

const AddSalesInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<SalesInvoiceFormData>({
    companyId: '',
    customerId: '',
    invoiceNumber: '',
    date: '',
    dueDate: '',
    paymentMethod: '',
    accountNumber: '',
    remarks: '',
    status: 'Paid',
    taxId: '',
    paidAmount: 0,
    discount: 0,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', item: '', quantity: 0, rate: 0, amount: 0 },
  ]);
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [taxes, setTaxes] = useState<Array<{ id: string; name: string; percentage: number }>>([]);
  const [items, setItems] = useState<Array<{ id: string; name: string; rate: number }>>([]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if payment method requires image upload and account number
  const requiresImageAndAccount = formData.paymentMethod === 'Bank Transfer (Online)' || formData.paymentMethod === 'Cheque';

  // Generate invoice number
  const generateInvoiceNumber = useCallback(() => {
    const savedInvoices = localStorage.getItem('salesInvoices');
    const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
    const nextNumber = invoices.length + 1;
    return `SI-${String(nextNumber).padStart(6, '0')}`;
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

      // Generate invoice number for new invoices
      if (!isEditMode) {
        setFormData((prev) => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
      }

      // Load existing invoice for edit mode
      if (isEditMode && id) {
        const savedInvoices = localStorage.getItem('salesInvoices');
        if (savedInvoices) {
          const invoices = JSON.parse(savedInvoices);
          const invoice = invoices.find((i: any) => i.id === id);
          if (invoice) {
            setFormData({
              companyId: invoice.companyId || '',
              customerId: invoice.customerId || '',
              invoiceNumber: invoice.invoiceNumber,
              date: invoice.date,
              dueDate: invoice.dueDate || '',
              paymentMethod: invoice.paymentMethod || '',
              accountNumber: invoice.accountNumber || '',
              remarks: invoice.remarks || '',
              status: invoice.status,
              taxId: invoice.taxId || '',
              paidAmount: invoice.paidAmount || 0,
              discount: invoice.discount || 0,
            });
            if (invoice.lineItems) {
              setLineItems(invoice.lineItems);
            }
            if (invoice.receiptImage) {
              setReceiptImage(invoice.receiptImage);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [isEditMode, id, generateInvoiceNumber]);

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

  const handleStatusChange = useCallback((status: 'Paid' | 'Overdue' | 'Pending') => {
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
  const subtotal = grossAmount + taxAmount - formData.discount;
  const balance = subtotal - formData.paidAmount;

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
      const invoices = JSON.parse(localStorage.getItem('salesInvoices') || '[]');
      const company = companies.find((c) => c.id === formData.companyId);
      const customer = customers.find((c) => c.id === formData.customerId);
      const firstItem = lineItems.find((l) => l.item)?.item || '';
      const totalQuantity = lineItems.reduce((sum, l) => sum + (l.quantity || 0), 0);

      const invoiceData = {
        id: isEditMode ? id : String(Date.now()),
        companyId: formData.companyId,
        companyName: company?.name || 'GST Gas',
        customerId: formData.customerId,
        customerName: customer?.name || '',
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        paymentMethod: formData.paymentMethod,
        accountNumber: formData.accountNumber,
        remarks: formData.remarks,
        item: firstItem,
        quantity: totalQuantity,
        grossAmount,
        netAmount: subtotal,
        taxAmount,
        discount: formData.discount,
        paidAmount: formData.paidAmount,
        balance,
        status: formData.status,
        lineItems,
        receiptImage,
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode) {
        const index = invoices.findIndex((i: any) => i.id === id);
        if (index !== -1) {
          invoices[index] = { ...invoices[index], ...invoiceData };
        }
      } else {
        invoices.push(invoiceData);
      }

      localStorage.setItem('salesInvoices', JSON.stringify(invoices));

      setSuccessMessage(isEditMode ? 'Invoice updated successfully!' : 'Invoice created successfully!');
      setTimeout(() => {
        navigate('/sales/invoice');
      }, 1500);
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Failed to save invoice. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, companies, customers, lineItems, grossAmount, subtotal, taxAmount, balance, receiptImage, navigate, isEditMode, id, requiresImageAndAccount]);

  const handleCancel = useCallback(() => {
    navigate('/sales/invoice');
  }, [navigate]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={isEditMode ? 'Update Sales Invoice' : 'Sales Invoice'} backPath="/sales/invoice" />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Sales Invoice" icon={<ReceiptIcon />}>
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
                  Invoice Number
                </Typography>
                <TextField
                  fullWidth
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
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
                  Due Date
                </Typography>
                <TextField
                  fullWidth
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  InputLabelProps={{ shrink: true }}
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
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{subtotal.toFixed(2)} PKR</Typography>
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
                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  sx={{ color: '#FF6B35', textTransform: 'none' }}
                >
                  Add Discount
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Paid Amount:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">PKR</Typography>
                  <TextField
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleSelectChange('paidAmount', parseFloat(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 100, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>Balance:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{balance.toFixed(1)} PKR</Typography>
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
              {['Paid', 'Overdue', 'Pending'].map((status) => (
                <Box
                  key={status}
                  onClick={() => handleStatusChange(status as 'Paid' | 'Overdue' | 'Pending')}
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Invoice' : 'Save Invoice'}
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

export default AddSalesInvoicePage;
