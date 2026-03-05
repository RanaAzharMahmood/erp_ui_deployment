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
import ReturnFormSkeleton from '../../../components/common/ReturnFormSkeleton';
import { useCompanies } from '../../../hooks';
import { useCompany } from '../../../contexts/CompanyContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getPartiesApi,
  getItemsApi,
  getSalesInvoicesApi,
  getSalesReturnsApi,
} from '../../../generated/api/client';
import type {
  LineItem,
  SalesReturnFormData,
  CompanyOption,
  CustomerOption,
  ItemOption,
  SalesInvoiceOption,
  ReturnStatus,
  SelectChangeValue,
} from '../../../types/invoice.types';

const PAYMENT_METHODS = ['Hand in Cash', 'Bank Transfer (Online)', 'Cheque'];

const AddSalesReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const today = new Date().toISOString().split('T')[0];
  const { companies: companiesData } = useCompanies();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  const [formData, setFormData] = useState<SalesReturnFormData>({
    companyId: (!isAdmin && selectedCompany) ? selectedCompany.id : '',
    customerId: '',
    returnNumber: '',
    originalInvoice: '',
    date: today,
    returnReason: '',
    paymentMethod: '',
    accountNumber: '',
    remarks: '',
    status: 'Pending',
    refundAmount: 0,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 },
  ]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoiceTax, setInvoiceTax] = useState(0);
  const [invoicePaidAmount, setInvoicePaidAmount] = useState(0);
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Derive companies from hook data - use c.name as the hook normalizes to 'name' field
  const companies: CompanyOption[] = (companiesData || []).map((c) => ({ id: c.id, name: c.name || '' }));

  // Check if payment method requires image upload and account number
  const requiresImageAndAccount = formData.paymentMethod !== '' && formData.paymentMethod !== 'Hand in Cash';

  // Generate return number when companyId changes (for new returns only)
  useEffect(() => {
    if (isEditMode) return;
    // TODO: Replace with backend API call when endpoint is available
    const returnNumber = `SR-${String(Date.now()).slice(-6)}`;
    setFormData((prev) => ({ ...prev, returnNumber }));
  }, [formData.companyId, isEditMode]);

  // Fetch customers when companyId changes
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const partiesApi = getPartiesApi();
        const companyIdParam = formData.companyId ? Number(formData.companyId) : undefined;
        const partiesResponse = await partiesApi.v1ApiPartiesGet(true, 'Customer', companyIdParam);
        const raw = partiesResponse as any;
        const partiesList: Array<{ id?: number; partyName?: string; name?: string }> =
          Array.isArray(raw) ? raw
          : Array.isArray(raw?.data?.data) ? raw.data.data
          : Array.isArray(raw?.data) ? raw.data
          : [];
        setCustomers(partiesList.map((c) => ({ id: String(c.id), name: c.partyName || c.name || '' })));
      } catch (err) {
        console.error('Error loading customers from API:', err);
        setCustomers([]);
      }
    };
    loadCustomers();
  }, [formData.companyId]);

  // Load sales invoices filtered by company
  useEffect(() => {
    const loadInvoices = async () => {
      if (!formData.companyId) {
        setSalesInvoices([]);
        return;
      }
      try {
        const invoicesApi = getSalesInvoicesApi();
        const invoicesResponse = await invoicesApi.getAll({ companyId: Number(formData.companyId), excludeReturned: !isEditMode, stockConfirmed: true });
        if (invoicesResponse.data?.data) {
          setSalesInvoices(invoicesResponse.data.data.map((i) => ({
            id: String(i.id),
            invoiceNumber: i.invoiceNumber || '',
            customerId: String(i.customerId) || '',
          })));
        }
      } catch (err) {
        console.error('Error loading invoices from API:', err);
        setSalesInvoices([]);
      }
    };
    loadInvoices();
  }, [formData.companyId]);

  // Prefill line items when an invoice is selected
  useEffect(() => {
    if (!formData.originalInvoice) return;
    const loadInvoiceDetails = async () => {
      try {
        const invoicesApi = getSalesInvoicesApi();
        const response = await invoicesApi.getById(Number(formData.originalInvoice));
        const inv = response.data;
        if (inv?.lines && inv.lines.length > 0) {
          setLineItems(inv.lines.map((l) => ({
            id: String(l.id || Date.now()),
            itemId: String(l.itemId),
            quantity: l.quantity,
            rate: l.unitPrice,
            amount: l.lineTotal,
          })));
        }
        // Prefill invoice summary fields
        if (inv) {
          setInvoiceDiscount(inv.discountAmount || 0);
          setInvoiceTax(inv.taxAmount || 0);
          setInvoicePaidAmount(inv.paidAmount || 0);
          setFormData((prev) => ({ ...prev, refundAmount: inv.paidAmount || 0 }));
        }
      } catch (err) {
        console.error('Error loading invoice details:', err);
      }
    };
    loadInvoiceDetails();
  }, [formData.originalInvoice]);

  // Load items and existing return data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load items from API
        try {
          const itemsApi = getItemsApi();
          const itemsResponse = await itemsApi.v1ApiItemsGet(undefined);
          const itemsData = itemsResponse.data as { data?: Array<{ id?: number; itemName?: string; salePrice?: number; unitPrice?: number }> } | Array<{ id?: number; itemName?: string; salePrice?: number; unitPrice?: number }> | undefined;
          if (itemsData && 'data' in itemsData && itemsData.data) {
            setItems(itemsData.data.map((i) => ({
              id: String(i.id),
              name: i.itemName || '',
              rate: i.salePrice || i.unitPrice || 0,
              currentStock: (i as any).currentStock || 0,
              isActive: (i as any).isActive !== false,
            })));
          } else if (Array.isArray(itemsData)) {
            setItems(itemsData.map((i) => ({
              id: String(i.id),
              name: i.itemName || '',
              rate: i.salePrice || i.unitPrice || 0,
              currentStock: (i as any).currentStock || 0,
              isActive: (i as any).isActive !== false,
            })));
          }
        } catch (err) {
          console.error('Error loading items from API:', err);
          setItems([]);
          setError('Failed to load items. Please refresh the page.');
        }

        // Load existing return for edit mode
        if (isEditMode && id) {
          try {
            const salesReturnsApi = getSalesReturnsApi();
            const returnResponse = await salesReturnsApi.getById(Number(id));
            if (returnResponse.data) {
              const returnData = returnResponse.data;
              const mappedStatus = (returnData.status === 'approved' || returnData.status === 'completed' ? 'Approved' : returnData.status === 'cancelled' ? 'Rejected' : 'Pending') as ReturnStatus;
              setOriginalStatus(mappedStatus);
              setFormData({
                companyId: returnData.companyId || '',
                customerId: String(returnData.customerId) || '',
                returnNumber: returnData.returnNumber,
                originalInvoice: returnData.salesInvoiceId ? String(returnData.salesInvoiceId) : '',
                date: returnData.date,
                returnReason: returnData.reason || '',
                paymentMethod: '',
                accountNumber: '',
                remarks: returnData.notes || '',
                status: mappedStatus,
                refundAmount: returnData.totalAmount || 0,
              });
              if (returnData.lines) {
                setLineItems(returnData.lines.map((l) => ({
                  id: String(l.id || Date.now()),
                  itemId: String(l.itemId),
                  quantity: l.quantity,
                  rate: l.unitPrice,
                  amount: l.lineTotal,
                })));
              }
            }
          } catch (err) {
            console.error('Error loading return from API:', err);
            setError('Failed to load return data. Please try again.');
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

  const resetInvoiceSummary = useCallback(() => {
    setInvoiceDiscount(0);
    setInvoiceTax(0);
    setInvoicePaidAmount(0);
  }, []);

  const handleSelectChange = useCallback((name: string, value: SelectChangeValue) => {
    if (name === 'companyId') {
      // Reset customer, invoice, and line items when company changes
      setFormData((prev) => ({ ...prev, companyId: value as number | '', customerId: '', originalInvoice: '', refundAmount: 0 }));
      setLineItems([{ id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 }]);
      resetInvoiceSummary();
    } else if (name === 'customerId') {
      // Reset invoice when customer changes
      setFormData((prev) => ({ ...prev, customerId: String(value), originalInvoice: '', refundAmount: 0 }));
      setLineItems([{ id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 }]);
      resetInvoiceSummary();
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, [resetInvoiceSummary]);

  const handleStatusChange = useCallback((status: ReturnStatus) => {
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
  const netAmount = grossAmount - invoiceDiscount + invoiceTax;

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
      // Prepare API request data
      const apiData = {
        date: formData.date,
        customerId: Number(formData.customerId),
        salesInvoiceId: formData.originalInvoice ? Number(formData.originalInvoice) : undefined,
        reason: formData.returnReason || undefined,
        notes: formData.remarks || undefined,
        companyId: formData.companyId ? Number(formData.companyId) : 1,
        lines: lineItems.filter(l => l.itemId).map((l) => ({
          itemId: Number(l.itemId),
          description: items.find(i => i.id === l.itemId)?.name || '',
          quantity: l.quantity,
          unitPrice: l.rate,
          taxAmount: 0,
          lineTotal: l.amount,
        })),
      };

      // Save via API
      const salesReturnsApi = getSalesReturnsApi();
      if (isEditMode && id) {
        // Only call update if the return is still in draft status
        if (originalStatus === 'Pending') {
          await salesReturnsApi.update(Number(id), apiData);
        }

        // Handle status changes via dedicated API endpoints
        if (formData.status !== originalStatus) {
          if (formData.status === 'Approved') {
            await salesReturnsApi.approve(Number(id));
          } else if (formData.status === 'Rejected') {
            await salesReturnsApi.cancel(Number(id));
          }
        }
      } else {
        await salesReturnsApi.create(apiData);
      }
      setSuccessMessage(isEditMode ? 'Return updated successfully!' : 'Return created successfully!');

      setTimeout(() => {
        navigate('/sales/return');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error saving return:', err);
      const message = err instanceof Error ? err.message : 'Failed to save return. Please try again.';
      setError(message);
      setIsSubmitting(false);
    }
  }, [formData, items, lineItems, receiptImage, navigate, isEditMode, id, requiresImageAndAccount]);

  const handleCancel = useCallback(() => {
    navigate('/sales/return');
  }, [navigate]);

  // Whether an invoice has been selected (lock down prefilled fields)
  const hasInvoice = Boolean(formData.originalInvoice);

  // Filter invoices by selected customer
  const filteredInvoices = salesInvoices.filter((inv) => !formData.customerId || inv.customerId === formData.customerId);

  // Show skeleton while loading in edit mode
  if (isLoading) {
    return <ReturnFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={isEditMode ? 'Update Sales Return' : 'Return Sales Invoice'} backPath="/sales/return" />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Return Sales Invoice" icon={<ReceiptIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              {isAdmin && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Company
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange('companyId', e.target.value as SelectChangeValue)}
                    displayEmpty
                    disabled={hasInvoice}
                    sx={{ bgcolor: hasInvoice ? '#F3F4F6' : 'white' }}
                  >
                    {companies.map((comp) => (
                      <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              )}
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
                    onChange={(e) => handleSelectChange('customerId', e.target.value as SelectChangeValue)}
                    displayEmpty
                    disabled={hasInvoice}
                    sx={{ bgcolor: hasInvoice ? '#F3F4F6' : 'white' }}
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
                    onChange={(e) => handleSelectChange('originalInvoice', e.target.value as SelectChangeValue)}
                    displayEmpty
                    disabled={isEditMode}
                    sx={{ bgcolor: isEditMode ? '#F3F4F6' : 'white' }}
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
                  inputProps={{ min: today }}
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
                            disabled={hasInvoice}
                            sx={{ bgcolor: hasInvoice ? '#F3F4F6' : 'white' }}
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
                          disabled={hasInvoice}
                          inputProps={{ min: 0 }}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: hasInvoice ? '#F3F4F6' : 'white' } }}
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
                          disabled={hasInvoice}
                          inputProps={{ min: 0 }}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: hasInvoice ? '#F3F4F6' : 'white' } }}
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
                      {!hasInvoice && (
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveLineItem(item.id)}
                          sx={{ color: '#EF4444' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {!hasInvoice && (
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
            )}

            {/* Summary Section */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 400, ml: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Gross Amount:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{grossAmount.toFixed(2)} PKR</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Discount:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>- {invoiceDiscount.toFixed(2)} PKR</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Tax:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{invoiceTax.toFixed(2)} PKR</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Net Amount:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{netAmount.toFixed(2)} PKR</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Actual Paid Amount:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{invoicePaidAmount.toFixed(2)} PKR</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Refund Amount:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">PKR</Typography>
                  <TextField
                    type="number"
                    value={formData.refundAmount}
                    onChange={(e) => handleSelectChange('refundAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                    size="small"
                    inputProps={{ min: 0 }}
                    sx={{ width: 120, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
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

          {/* Status - Only show in edit mode */}
          {isEditMode && (
            <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2, mt: -1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(['Pending', 'Approved', 'Rejected'] as const).map((status) => {
                  // Pending can't be re-selected once moved to Approved/Rejected
                  const isDisabled = (status === 'Pending' && originalStatus !== 'Pending')
                    || (originalStatus === 'Approved' && status !== 'Approved' && status !== 'Rejected')
                    || (originalStatus === 'Rejected');
                  return (
                  <Box
                    key={status}
                    onClick={() => !isDisabled && handleStatusChange(status)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.4 : 1,
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
                  );
                })}
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
