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
  getPurchaseInvoicesApi,
  getPurchaseReturnsApi,
} from '../../../generated/api/client';
import type {
  LineItem,
  PurchaseReturnFormData,
  CompanyOption,
  VendorOption,
  ItemOption,
  PurchaseInvoiceOption,
  ReturnStatus,
  SelectChangeValue,
} from '../../../types/invoice.types';

const PAYMENT_METHODS = ['Hand in Cash', 'Bank Transfer (Online)', 'Cheque'];

const AddPurchaseReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const today = new Date().toISOString().split('T')[0];
  const { companies: companiesData } = useCompanies();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  const [formData, setFormData] = useState<PurchaseReturnFormData>({
    companyId: (!isAdmin && selectedCompany) ? selectedCompany.id : '',
    vendorId: '',
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
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceOption[]>([]);
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Derive companies from hook data - use c.name as the hook normalizes to 'name' field
  const companies: CompanyOption[] = (companiesData || []).map((c) => ({ id: c.id, name: c.name || '' }));

  // Check if payment method requires image upload and account number
  const requiresImageAndAccount = formData.paymentMethod !== '' && formData.paymentMethod !== 'Hand in Cash';

  // Fetch return number when companyId changes (for new returns only)
  useEffect(() => {
    if (isEditMode) return;
    const fetchReturnNumber = async () => {
      try {
        const api = getPurchaseReturnsApi();
        const companyId = formData.companyId ? Number(formData.companyId) : undefined;
        const response = await api.getNextNumber(companyId);
        if (response.data?.nextNumber) {
          setFormData((prev) => ({ ...prev, returnNumber: response.data.nextNumber }));
        }
      } catch (err) {
        console.error('Error fetching next return number from API:', err);
      }
    };
    fetchReturnNumber();
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

  // Load purchase invoices filtered by company
  useEffect(() => {
    const loadInvoices = async () => {
      if (!formData.companyId) {
        setPurchaseInvoices([]);
        return;
      }
      try {
        const invoicesApi = getPurchaseInvoicesApi();
        const invoicesResponse = await invoicesApi.getAll({ companyId: Number(formData.companyId), excludeReturned: !isEditMode, stockConfirmed: true });
        if (invoicesResponse.data?.data) {
          setPurchaseInvoices(invoicesResponse.data.data.map((i) => ({
            id: String(i.id),
            billNumber: i.invoiceNumber || '',
            vendorId: String(i.vendorId) || '',
          })));
        }
      } catch (err) {
        console.error('Error loading purchase invoices from API:', err);
        setPurchaseInvoices([]);
      }
    };
    loadInvoices();
  }, [formData.companyId]);

  // Prefill line items when an invoice is selected
  useEffect(() => {
    if (!formData.originalInvoice) return;
    const loadInvoiceDetails = async () => {
      try {
        const invoicesApi = getPurchaseInvoicesApi();
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
        // Load inventory items from API
        try {
          const itemsApi = getItemsApi();
          const itemsResponse = await itemsApi.v1ApiItemsGet(undefined);
          const itemsData = itemsResponse.data as { data?: Array<{ id?: number; itemName?: string; purchasePrice?: number; unitPrice?: number }> } | Array<{ id?: number; itemName?: string; purchasePrice?: number; unitPrice?: number }> | undefined;
          if (itemsData && 'data' in itemsData && itemsData.data) {
            setItems(itemsData.data.map((i) => ({
              id: String(i.id),
              name: i.itemName || '',
              rate: i.purchasePrice || i.unitPrice || 0,
              currentStock: (i as any).currentStock || 0,
              isActive: (i as any).isActive !== false,
            })));
          } else if (Array.isArray(itemsData)) {
            setItems(itemsData.map((i) => ({
              id: String(i.id),
              name: i.itemName || '',
              rate: i.purchasePrice || i.unitPrice || 0,
              currentStock: (i as any).currentStock || 0,
              isActive: (i as any).isActive !== false,
            })));
          }
        } catch (err) {
          console.error('Error loading inventory items from API:', err);
          setItems([]);
          setError('Failed to load items. Please refresh the page.');
        }

        // Load existing return for edit mode
        if (isEditMode && id) {
          try {
            const purchaseReturnsApi = getPurchaseReturnsApi();
            const returnResponse = await purchaseReturnsApi.getById(Number(id));
            if (returnResponse.data) {
              const returnData = returnResponse.data;
              const mappedStatus = (returnData.status === 'approved' || returnData.status === 'completed' ? 'Approved' : returnData.status === 'cancelled' ? 'Rejected' : 'Pending') as ReturnStatus;
              setOriginalStatus(mappedStatus);
              setFormData({
                companyId: returnData.companyId || '',
                vendorId: String(returnData.vendorId) || '',
                returnNumber: returnData.returnNumber,
                originalInvoice: returnData.purchaseInvoiceId ? String(returnData.purchaseInvoiceId) : '',
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
            console.error('Error loading return data from API:', err);
            setError('Failed to load return data. Please try again.');
          }
        }
      } catch (err: unknown) {
        console.error('Error loading data:', err);
      } finally {
        // Set loading to false after data is loaded
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
      // Reset vendor, invoice, and line items when company changes
      setFormData((prev) => ({ ...prev, companyId: value as number | '', vendorId: '', originalInvoice: '', refundAmount: 0 }));
      setLineItems([{ id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 }]);
      resetInvoiceSummary();
    } else if (name === 'vendorId') {
      // Reset invoice when vendor changes
      setFormData((prev) => ({ ...prev, vendorId: String(value), originalInvoice: '', refundAmount: 0 }));
      setLineItems([{ id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 }]);
      resetInvoiceSummary();
      setFieldErrors((prev) => ({ ...prev, vendorId: '' }));
    } else if (name === 'originalInvoice') {
      setFormData((prev) => ({ ...prev, originalInvoice: String(value) }));
      // Reset invoice summary and lines when invoice is cleared
      if (!value) {
        setLineItems([{ id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 }]);
        resetInvoiceSummary();
      }
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
    const errors: Record<string, string> = {};

    if (!formData.vendorId) errors.vendorId = 'Vendor is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (requiresImageAndAccount && !receiptImage) errors.receiptImage = 'Receipt image is required for Bank Transfer and Cheque payments';
    if (requiresImageAndAccount && !formData.accountNumber) errors.accountNumber = 'Account number is required';
    if (!lineItems.some(l => l.itemId)) errors.lineItems = 'At least one line item is required';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors below');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      // Prepare API request data
      const apiData = {
        date: formData.date,
        vendorId: Number(formData.vendorId),
        purchaseInvoiceId: formData.originalInvoice ? Number(formData.originalInvoice) : undefined,
        subtotal: grossAmount,
        taxAmount: invoiceTax,
        totalAmount: netAmount,
        reason: formData.returnReason || undefined,
        notes: formData.remarks || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        accountNumber: formData.accountNumber || undefined,
        receiptImage: receiptImage || undefined,
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
      const purchaseReturnsApi = getPurchaseReturnsApi();
      if (isEditMode && id) {
        // Only call update if the return is still in draft status
        if (originalStatus === 'Pending') {
          await purchaseReturnsApi.update(Number(id), apiData);
        }

        // Handle status changes via dedicated API endpoints
        if (formData.status !== originalStatus) {
          if (formData.status === 'Approved') {
            await purchaseReturnsApi.approve(Number(id));
          } else if (formData.status === 'Rejected') {
            await purchaseReturnsApi.cancel(Number(id));
          }
        }
      } else {
        await purchaseReturnsApi.create(apiData);
      }
      setSuccessMessage(isEditMode ? 'Return updated successfully!' : 'Return created successfully!');

      setTimeout(() => {
        navigate('/purchase/return');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error saving return:', err);
      const message = err instanceof Error ? err.message : 'Failed to save return. Please try again.';
      setError(message);
      setIsSubmitting(false);
    }
  }, [formData, items, lineItems, receiptImage, navigate, isEditMode, id, requiresImageAndAccount]);

  const handleCancel = useCallback(() => {
    navigate('/purchase/return');
  }, [navigate]);

  // Whether an invoice has been selected (lock down prefilled fields)
  const hasInvoice = Boolean(formData.originalInvoice);

  // Filter invoices by selected vendor
  const filteredInvoices = purchaseInvoices.filter((inv) => !formData.vendorId || inv.vendorId === formData.vendorId);

  // Show skeleton while loading in edit mode
  if (isLoading) {
    return <ReturnFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={isEditMode ? 'Update Purchase Return' : 'Return Purchase Invoice'} backPath="/purchase/return" />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <FormSection title="Return Purchase Invoice" icon={<ReceiptIcon />}>
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
                  Select Vendor *
                </Typography>
                <FormControl fullWidth size="small" error={!!fieldErrors.vendorId}>
                  <Select
                    value={formData.vendorId}
                    onChange={(e) => handleSelectChange('vendorId', e.target.value as SelectChangeValue)}
                    displayEmpty
                    disabled={hasInvoice}
                    sx={{ bgcolor: hasInvoice ? '#F3F4F6' : 'white' }}
                  >
                    <MenuItem value="" disabled>Select Vendor</MenuItem>
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.vendorId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {fieldErrors.vendorId}
                    </Typography>
                  )}
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
                      <MenuItem key={inv.id} value={inv.id}>{inv.billNumber}</MenuItem>
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
                  onChange={(e) => {
                    handleInputChange(e);
                    setFieldErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  size="small"
                  error={!!fieldErrors.date}
                  helperText={fieldErrors.date}
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
                    onChange={(e) => {
                      handleInputChange(e);
                      setFieldErrors((prev) => ({ ...prev, accountNumber: '' }));
                    }}
                    placeholder="Enter account number"
                    size="small"
                    error={!!fieldErrors.accountNumber}
                    helperText={fieldErrors.accountNumber}
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
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value));
                            handleLineItemChange(item.id, 'quantity', isNaN(val) ? 0 : val);
                          }}
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
                          value={item.rate || ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value));
                            handleLineItemChange(item.id, 'rate', isNaN(val) ? 0 : val);
                          }}
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
                          value={item.amount || ''}
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

            {fieldErrors.lineItems && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {fieldErrors.lineItems}
              </Typography>
            )}

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
                onChange={(e) => {
                  handleImageUpload(e);
                  setFieldErrors((prev) => ({ ...prev, receiptImage: '' }));
                }}
              />
              {fieldErrors.receiptImage && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {fieldErrors.receiptImage}
                </Typography>
              )}
            </FormSection>
          )}

          {/* Status - Only show in edit mode */}
          {isEditMode && (
            <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2, mt: -1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(['Pending', 'Approved', 'Rejected'] as const).map((status) => {
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

export default AddPurchaseReturnPage;
