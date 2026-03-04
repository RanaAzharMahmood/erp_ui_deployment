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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Image as ImageIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import InvoiceFormSkeleton from '../../../components/common/InvoiceFormSkeleton';
import { useCompanies } from '../../../hooks';
import {
  getPartiesApi,
  getTaxesApi,
  getItemsApi,
  getPurchaseInvoicesApi,
} from '../../../generated/api/client';
import type {
  LineItem,
  PurchaseInvoiceFormData,
  CompanyOption,
  VendorOption,
  TaxOption,
  ItemOption,
  InvoiceStatus,
  SelectChangeValue,
} from '../../../types/invoice.types';

const PAYMENT_METHODS = ['Hand in Cash', 'Bank Transfer (Online)', 'Cheque'];

const AddPurchaseInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const today = new Date().toISOString().split('T')[0];
  const { companies: companiesData } = useCompanies();

  const [formData, setFormData] = useState<PurchaseInvoiceFormData>({
    companyId: '',
    vendorId: '',
    billNumber: '',
    date: today,
    dueDate: '',
    paymentMethod: '',
    accountNumber: '',
    remarks: '',
    status: 'Paid',
    taxId: '',
    paidAmount: 0,
    discount: 0,
    stockConfirmed: false,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 },
  ]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [taxes, setTaxes] = useState<TaxOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Derive companies from hook data - use c.name as the hook normalizes to 'name' field
  const companies: CompanyOption[] = (companiesData || []).map((c) => ({ id: c.id, name: c.name || '' }));

  // Check if payment method requires image upload and account number
  const requiresImageAndAccount = formData.paymentMethod !== '' && formData.paymentMethod !== 'Hand in Cash';

  // Fetch bill number when companyId changes (for new invoices only)
  useEffect(() => {
    if (isEditMode) return;
    const fetchBillNumber = async () => {
      try {
        const api = getPurchaseInvoicesApi();
        const companyId = formData.companyId ? Number(formData.companyId) : undefined;
        const response = await api.getNextNumber(companyId);
        if (response.data?.nextNumber) {
          setFormData((prev) => ({ ...prev, billNumber: response.data.nextNumber }));
        }
      } catch (err) {
        console.error('Error fetching next bill number from API:', err);
      }
    };
    fetchBillNumber();
  }, [formData.companyId, isEditMode]);

  // Fetch vendors when companyId changes
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const partiesApi = getPartiesApi();
        const companyIdParam = formData.companyId ? Number(formData.companyId) : undefined;
        const partiesResponse = await partiesApi.v1ApiPartiesGet(true, 'Vendor', companyIdParam);
        const raw = partiesResponse as any;
        const partiesList: Array<{ id?: number; partyName?: string; name?: string }> =
          Array.isArray(raw) ? raw
          : Array.isArray(raw?.data?.data) ? raw.data.data
          : Array.isArray(raw?.data) ? raw.data
          : [];
        setVendors(partiesList.map((c) => ({ id: String(c.id), name: c.partyName || c.name || '' })));
      } catch (err) {
        console.error('Error loading vendors from API:', err);
        setVendors([]);
      }
    };
    loadVendors();
  }, [formData.companyId]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load taxes from API
        try {
          const taxesApi = getTaxesApi();
          const taxesResponse = await taxesApi.getAll();
          const taxesData = taxesResponse.data as { data?: Array<{ id?: number; name?: string; rate?: number; percentage?: number }> } | Array<{ id?: number; name?: string; rate?: number; percentage?: number }> | undefined;
          if (taxesData && 'data' in taxesData && taxesData.data) {
            setTaxes(taxesData.data.map((t) => ({
              id: String(t.id),
              name: t.name || '',
              percentage: t.percentage || 0,
            })));
          } else if (Array.isArray(taxesData)) {
            setTaxes(taxesData.map((t) => ({
              id: String(t.id),
              name: t.name || '',
              percentage: t.rate || t.percentage || 0,
            })));
          }
        } catch (err) {
          console.error('Error loading taxes from API:', err);
          setTaxes([]);
        }

        // Load items from API
        try {
          const itemsApi = getItemsApi();
          const itemsResponse = await itemsApi.v1ApiItemsGet(undefined);
          if (itemsResponse.data) {
            setItems(itemsResponse.data.map((i: { id?: number; itemName?: string; purchasePrice?: number; unitPrice?: number; currentStock?: number; isActive?: boolean }) => ({
              id: String(i.id),
              name: i.itemName || '',
              rate: i.purchasePrice || i.unitPrice || 0,
              currentStock: i.currentStock || 0,
              isActive: i.isActive !== false,
            })));
          }
        } catch (err) {
          console.error('Error loading items from API:', err);
          setItems([]);
        }

        // Load existing invoice for edit mode
        if (isEditMode && id) {
          try {
            const purchaseInvoicesApi = getPurchaseInvoicesApi();
            const invoiceResponse = await purchaseInvoicesApi.getById(Number(id));
            if (invoiceResponse.data) {
              const invoice = invoiceResponse.data as any;
              setFormData({
                companyId: invoice.companyId || '',
                vendorId: String(invoice.vendorId || ''),
                billNumber: invoice.billNumber || '',
                date: invoice.date || '',
                dueDate: invoice.dueDate || '',
                paymentMethod: invoice.paymentMethod || '',
                accountNumber: invoice.accountNumber || '',
                remarks: invoice.remarks || '',
                status: (invoice.status === 'paid' ? 'Paid' : invoice.status === 'overdue' ? 'Overdue' : 'Pending') as InvoiceStatus,
                taxId: '',
                paidAmount: invoice.paidAmount || 0,
                discount: invoice.discountAmount || 0,
                stockConfirmed: invoice.stockConfirmed || false,
              });
              if (invoice.lines) {
                setLineItems((invoice.lines as Array<{ id?: number; itemId?: number; itemName?: string; quantity?: number; unitPrice?: number; lineTotal?: number }>).map((l) => ({
                  id: String(l.id || Date.now()),
                  itemId: String(l.itemId),
                  quantity: l.quantity || 0,
                  rate: l.unitPrice || 0,
                  amount: l.lineTotal || 0,
                })));
              }
              if (invoice.receiptImage) {
                setReceiptImage(invoice.receiptImage);
              }
            }
          } catch (err) {
            console.error('Error loading invoice from API:', err);
            setError('Failed to load invoice. Please try again.');
          }
        }
      } catch (err: unknown) {
        console.error('Error loading data:', err);
      } finally {
        if (isEditMode) {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [isEditMode, id]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: SelectChangeValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStatusChange = useCallback((status: InvoiceStatus) => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const handleLineItemChange = useCallback((id: string, field: string, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto-calculate amount
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          // If item is selected, auto-fill rate
          if (field === 'itemId') {
            const selectedItem = items.find((i) => i.id === value);
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
      { id: String(Date.now()), itemId: '', quantity: 0, rate: 0, amount: 0 },
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
    if (!formData.vendorId || !formData.date) {
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
      // Prepare API request data
      const selectedTax = taxes.find((t) => t.id === formData.taxId);
      const apiData = {
        date: formData.date,
        dueDate: formData.dueDate || undefined,
        vendorId: Number(formData.vendorId),
        discount: formData.discount,
        paidAmount: formData.paidAmount,
        paymentMethod: formData.paymentMethod || undefined,
        accountNumber: formData.accountNumber || undefined,
        remarks: formData.remarks || undefined,
        companyId: formData.companyId ? Number(formData.companyId) : 1,
        lines: lineItems.filter(l => l.itemId).map((l) => ({
          itemId: Number(l.itemId),
          description: items.find(i => i.id === l.itemId)?.name || '',
          quantity: l.quantity,
          unitPrice: l.rate,
          taxId: formData.taxId ? Number(formData.taxId) : undefined,
          taxAmount: selectedTax ? (l.amount * selectedTax.percentage) / 100 : 0,
          lineTotal: l.amount,
        })),
        receiptImage: receiptImage || undefined,
        stockConfirmed: formData.stockConfirmed,
      };

      // Save via API
      const purchaseInvoicesApi = getPurchaseInvoicesApi();
      if (isEditMode && id) {
        await purchaseInvoicesApi.update(Number(id), {
          ...apiData,
          status: formData.status === 'Paid' ? 'paid' : formData.status === 'Overdue' ? 'overdue' : 'draft',
        });
      } else {
        await purchaseInvoicesApi.create(apiData);
      }
      setSuccessMessage(isEditMode ? 'Invoice updated successfully!' : 'Invoice created successfully!');

      setTimeout(() => {
        navigate('/purchase/invoice');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error saving invoice:', err);
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message || 'Failed to save invoice. Please try again.';
      setError(message);
      setIsSubmitting(false);
    }
  }, [formData, items, taxes, lineItems, receiptImage, navigate, isEditMode, id, requiresImageAndAccount]);

  const handleCancel = useCallback(() => {
    navigate('/purchase/invoice');
  }, [navigate]);

  // Show skeleton while loading in edit mode
  if (isLoading) {
    return <InvoiceFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={isEditMode ? 'Update Purchase Invoice' : 'Purchase Invoice'} backPath="/purchase/invoice" />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Purchase Invoice" icon={<ReceiptIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Company
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange('companyId', e.target.value as SelectChangeValue)}
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
                  Bill Number
                </Typography>
                <TextField
                  fullWidth
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={handleInputChange}
                  size="small"
                  disabled
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Vendor *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.vendorId}
                    onChange={(e) => handleSelectChange('vendorId', e.target.value as SelectChangeValue)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Vendor</MenuItem>
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
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
                  inputProps={{ min: today }}
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
                  inputProps={{ min: today }}
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
                    onChange={(e) => handleSelectChange('paymentMethod', e.target.value as SelectChangeValue)}
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
                            value={item.itemId}
                            onChange={(e) => handleLineItemChange(item.id, 'itemId', e.target.value as string)}
                            displayEmpty
                            sx={{ bgcolor: 'white' }}
                          >
                            <MenuItem value="" disabled>Select Item</MenuItem>
                            {items.map((i) => (
                              <MenuItem key={i.id} value={i.id} disabled={!i.isActive} sx={!i.isActive ? { opacity: 0.5 } : undefined}>
                                {i.name}{!i.isActive ? ' (Inactive)' : ''} — Stock: {i.currentStock}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0"
                          size="small"
                          inputProps={{ min: 0 }}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(item.id, 'rate', Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0.0 PKR"
                          size="small"
                          inputProps={{ min: 0 }}
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
                    onChange={(e) => handleSelectChange('taxId', e.target.value as SelectChangeValue)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">Select Tax</MenuItem>
                    {taxes.map((tax) => (
                      <MenuItem key={tax.id} value={tax.id}>{tax.name} ({tax.percentage}%)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Discount:</Typography>
                  <Typography variant="body2">PKR</Typography>
                  <TextField
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleSelectChange('discount', Math.max(0, parseFloat(e.target.value) || 0))}
                    size="small"
                    inputProps={{ min: 0 }}
                    sx={{ width: 100, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Paid Amount:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">PKR</Typography>
                  <TextField
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleSelectChange('paidAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                    size="small"
                    inputProps={{ min: 0 }}
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

          {/* Stock Received Checkbox */}
          <FormSection title="Stock Confirmation" icon={<InventoryIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.stockConfirmed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stockConfirmed: e.target.checked }))}
                  disabled={formData.stockConfirmed && isEditMode}
                  sx={{ color: '#FF6B35', '&.Mui-checked': { color: '#FF6B35' } }}
                />
              }
              label="Stock Received"
            />
          </FormSection>

          {/* Status - Only show in edit mode */}
          {isEditMode && (
            <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2, mt: -1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(['Paid', 'Overdue', 'Pending'] as const).map((status) => (
                  <Box
                    key={status}
                    onClick={() => handleStatusChange(status)}
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
          )}

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

export default AddPurchaseInvoicePage;
