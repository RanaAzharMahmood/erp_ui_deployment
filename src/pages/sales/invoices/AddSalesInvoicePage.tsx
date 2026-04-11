import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Print as PrintIcon,
  Inventory as InventoryIcon,
  PostAdd as PostAddIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import InvoiceFormSkeleton from '../../../components/common/InvoiceFormSkeleton';
import { useCompanies } from '../../../hooks';
import { useCompany } from '../../../contexts/CompanyContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getSalesInvoicesApi,
  getPartiesApi,
  getTaxesApi,
  getItemsApi,
} from '../../../generated/api/client';
import type {
  LineItem,
  SalesInvoiceFormData,
  CompanyOption,
  CustomerOption,
  TaxOption,
  ItemOption,
  InvoiceStatus,
  SelectChangeValue,
} from '../../../types/invoice.types';

const PAYMENT_METHODS = ['Hand in Cash', 'Bank Transfer (Online)', 'Cheque'];

const AddSalesInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const today = new Date().toISOString().split('T')[0];
  const { companies: companiesData } = useCompanies();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  const [formData, setFormData] = useState<SalesInvoiceFormData>({
    companyId: (!isAdmin && selectedCompany) ? selectedCompany.id : '',
    customerId: '',
    invoiceNumber: '',
    date: today,
    dueDate: '',
    paymentMethod: '',
    accountNumber: '',
    remarks: '',
    status: 'Draft',
    taxId: '',
    paidAmount: 0,
    discount: 0,
    stockConfirmed: false,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 },
  ]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [taxes, setTaxes] = useState<TaxOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [dataLoadWarning, setDataLoadWarning] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isReturned, setIsReturned] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [rawStatus, setRawStatus] = useState('');
  const [originalLineQuantities, setOriginalLineQuantities] = useState<Record<string, number>>({});
  const invoiceSectionRef = useRef<HTMLDivElement>(null);

  // Derive companies from hook data - use c.name as the hook normalizes to 'name' field
  const companies: CompanyOption[] = (companiesData || []).map((c) => ({ id: c.id, name: c.name || '' }));

  // Check if payment method requires image upload and account number (any non-cash method)
  const requiresImageAndAccount = formData.paymentMethod !== '' && formData.paymentMethod !== 'Hand in Cash';

  // Fetch invoice number when companyId changes (for new invoices only)
  useEffect(() => {
    if (isEditMode) return;
    const fetchInvoiceNumber = async () => {
      try {
        const api = getSalesInvoicesApi();
        const companyId = formData.companyId ? Number(formData.companyId) : undefined;
        const response = await api.getNextNumber(companyId);
        setFormData((prev) => ({ ...prev, invoiceNumber: response.data.nextNumber }));
      } catch (err) {
        console.error('Error fetching next invoice number from API:', err);
      }
    };
    fetchInvoiceNumber();
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
        setCustomers(partiesList.map((c) => ({
          id: String(c.id),
          name: c.partyName || c.name || '',
        })));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load customers';
        setDataLoadWarning(msg);
        setCustomers([]);
      }
    };
    loadCustomers();
  }, [formData.companyId]);

  // Load taxes and existing invoice from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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

        // Load existing invoice for edit mode
        if (isEditMode && id) {
          try {
            const api = getSalesInvoicesApi();
            const response = await api.getById(Number(id));
            const invoice = response.data as any;
            if (invoice) {
              // Extract taxId from first line item if available
              const lineTaxId = invoice.lines?.[0]?.taxId ? String(invoice.lines[0].taxId) : '';
              setRawStatus(invoice.status || '');
              if (invoice.status === 'returned') {
                setIsReturned(true);
              }
              const apiStatusMap: Record<string, InvoiceStatus> = {
                draft: 'Draft',
                posted: 'Posted',
                sent: 'Posted',
                partially_paid: 'Partially Paid',
                paid: 'Paid',
                overdue: 'Overdue',
                cancelled: 'Cancelled',
                returned: 'Returned',
              };
              // Reverse-calculate the discount percentage from the stored
              // amount so the input can display it in the new % UI.
              const loadedGross = (invoice.lines || []).reduce(
                (sum: number, l: any) => sum + Number(l.lineTotal || 0),
                0,
              );
              const storedDiscount = Number(invoice.discountAmount) || 0;
              const discountPercent = loadedGross > 0
                ? Math.round((storedDiscount / loadedGross) * 100)
                : 0;
              setFormData({
                companyId: invoice.companyId || '',
                customerId: String(invoice.customerId) || '',
                invoiceNumber: invoice.invoiceNumber,
                date: invoice.date,
                dueDate: invoice.dueDate || '',
                paymentMethod: invoice.paymentMethod || '',
                accountNumber: invoice.accountNumber || '',
                remarks: invoice.notes || invoice.remarks || '',
                status: apiStatusMap[invoice.status] || 'Draft',
                taxId: lineTaxId,
                paidAmount: invoice.paidAmount || 0,
                discount: discountPercent,
                stockConfirmed: invoice.stockConfirmed || false,
              });
              if (invoice.lines) {
                setLineItems(invoice.lines.map((l: any) => ({
                  id: String(l.id || Date.now()),
                  itemId: String(l.itemId),
                  quantity: l.quantity,
                  rate: l.unitPrice,
                  amount: l.lineTotal,
                })));
                // Store original quantities per item for stock warning adjustment in edit mode
                if (invoice.stockConfirmed) {
                  const origQty: Record<string, number> = {};
                  for (const l of invoice.lines) {
                    const itemId = String(l.itemId);
                    origQty[itemId] = (origQty[itemId] || 0) + Number(l.quantity);
                  }
                  setOriginalLineQuantities(origQty);
                }
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
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditMode, id]);

  // Load items filtered by company when companyId changes
  useEffect(() => {
    const loadItems = async () => {
      try {
        const itemsApi = getItemsApi();
        const companyIdParam = formData.companyId ? Number(formData.companyId) : undefined;
        const itemsResponse = await itemsApi.v1ApiItemsGet(undefined, undefined, companyIdParam);
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
        } else {
          setItems([]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load items';
        setDataLoadWarning(msg);
        setItems([]);
      }
    };

    loadItems();
  }, [formData.companyId]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: SelectChangeValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear line items when company changes (items may no longer be valid)
    if (name === 'companyId') {
      setLineItems([{ id: '1', itemId: '', quantity: 0, rate: 0, amount: 0 }]);
    }
  }, []);

  const handleLineItemChange = useCallback((id: string, field: string, value: string | number) => {
    // Prevent negative values for numeric fields
    const sanitizedValue = (field === 'quantity' || field === 'rate') && typeof value === 'number' && value < 0 ? 0 : value;
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: sanitizedValue };
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

  // Calculate totals. `formData.discount` is a percentage (0-99); the actual
  // discount amount is derived from the gross amount at render time.
  const grossAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const selectedTax = taxes.find((t) => t.id === formData.taxId);
  const taxAmount = selectedTax ? (grossAmount * selectedTax.percentage) / 100 : 0;
  const discountAmount = (grossAmount * (formData.discount || 0)) / 100;
  const subtotal = grossAmount + taxAmount - discountAmount;
  const balance = subtotal - formData.paidAmount;

  const handleSubmit = useCallback(async () => {
    const errors: Record<string, string> = {};

    if (!formData.customerId) {
      errors.customerId = 'Customer is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }
    if (requiresImageAndAccount && !receiptImage) {
      errors.receiptImage = 'Receipt image is required for Bank Transfer and Cheque payments';
    }
    if (requiresImageAndAccount && !formData.accountNumber) {
      errors.accountNumber = 'Account number is required';
    }

    const validLines = lineItems.filter(l => l.itemId);
    if (validLines.length === 0) {
      errors.lineItems = 'At least one line item is required';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors below');
      return;
    }

    // Stock validation — only when stock delivery is confirmed
    if (formData.stockConfirmed) {
      const stockByItem: Record<string, number> = {};
      for (const l of validLines) {
        stockByItem[l.itemId] = (stockByItem[l.itemId] || 0) + l.quantity;
      }
      for (const [itemId, totalQty] of Object.entries(stockByItem)) {
        const itemOption = items.find(i => i.id === itemId);
        if (!itemOption) continue;
        // In edit mode, stock was already deducted — add back original quantities
        const effectiveStock = itemOption.currentStock + (originalLineQuantities[itemId] || 0);
        if (totalQty > effectiveStock) {
          errors.lineItems = `Insufficient stock for ${itemOption.name}: requested ${totalQty}, available ${effectiveStock}`;
          setFieldErrors(errors);
          setError(errors.lineItems);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const api = getSalesInvoicesApi();

      // Prepare API request data
      const apiData = {
        date: formData.date,
        dueDate: formData.dueDate || undefined,
        customerId: Number(formData.customerId),
        // formData.discount is a percentage; backend expects the amount.
        discount: discountAmount,
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

      if (isEditMode && id) {
        // Status is auto-derived on the backend from paidAmount/totalAmount - do not send it
        await api.update(Number(id), apiData);
      } else {
        await api.create(apiData);
      }
      setSuccessMessage(isEditMode ? 'Invoice updated successfully!' : 'Invoice created successfully!');

      setTimeout(() => {
        navigate('/sales/invoice');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error saving invoice:', err);
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message || 'Failed to save invoice. Please try again.';
      setError(message);
      setIsSubmitting(false);
    }
  }, [formData, lineItems, receiptImage, navigate, isEditMode, id, requiresImageAndAccount, items, selectedTax, originalLineQuantities]);

  const handleCancel = useCallback(() => {
    navigate('/sales/invoice');
  }, [navigate]);

  const handlePrint = useCallback(async () => {
    try {
      const { downloadInvoicePdf } = await import('../../../components/pdf/downloadInvoicePdf');
      const company = companiesData.find((c) => c.id === Number(formData.companyId));
      const customer = customers.find((c) => c.id === formData.customerId);
      const validLines = lineItems.filter((l) => l.itemId);
      const taxRate = selectedTax ? selectedTax.percentage : 0;

      await downloadInvoicePdf({
        variant: 'sales',
        documentNumber: formData.invoiceNumber || 'draft',
        date: formData.date,
        company: {
          name: company?.name || 'Company',
          logoUrl: company?.logoUrl,
          salesTaxNumber: company?.salesTaxRegistrationNo,
          ntnNumber: company?.ntnNumber,
          representator: company?.contactName,
          phone: company?.phone,
          address: company?.address,
        },
        party: {
          name: customer?.name || 'Customer',
        },
        lines: validLines.map((l) => ({
          quantity: l.quantity,
          description: items.find((i) => i.id === l.itemId)?.name || '',
          unitPrice: l.rate,
          taxRatePercent: taxRate,
        })),
        discountPercent: formData.discount || 0,
        paidAmount: formData.paidAmount || 0,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  }, [formData, lineItems, companiesData, customers, items, selectedTax]);

  const handlePostInvoice = useCallback(async () => {
    if (!id) return;
    setIsPosting(true);
    try {
      const api = getSalesInvoicesApi();
      await api.post(Number(id));
      setRawStatus('posted');
      setFormData((prev) => ({ ...prev, status: 'Posted' as InvoiceStatus }));
      setSuccessMessage('Invoice posted successfully! Journal entry created.');
    } catch (err: unknown) {
      console.error('Error posting invoice:', err);
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to post invoice. Please try again.');
    } finally {
      setIsPosting(false);
    }
  }, [id]);

  const canPost = isEditMode && (rawStatus === 'draft' || rawStatus === 'sent') && formData.stockConfirmed;

  // Stock warning helper for inline display
  const getStockWarning = (itemId: string) => {
    if (!itemId) return null;
    const totalQty = lineItems
      .filter(l => l.itemId === itemId)
      .reduce((sum, l) => sum + l.quantity, 0);
    const itemOption = items.find(i => i.id === itemId);
    if (!itemOption) return null;
    // In edit mode, stock was already deducted for original quantities — add them back
    const effectiveStock = itemOption.currentStock + (originalLineQuantities[itemId] || 0);
    if (totalQty > effectiveStock) {
      return `Exceeds stock (${effectiveStock} available)`;
    }
    return null;
  };

  // Show skeleton while loading
  if (isLoading) {
    return <InvoiceFormSkeleton />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title={isEditMode ? 'Update Sales Invoice' : 'Sales Invoice'} backPath="/sales/invoice" />

      {dataLoadWarning && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setDataLoadWarning('')}>
          {dataLoadWarning} — Some dropdowns may be empty. Contact your administrator to assign the required permissions.
        </Alert>
      )}

      {isReturned && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This invoice has been returned and cannot be edited.
        </Alert>
      )}

      <Grid container spacing={3} sx={isReturned ? { pointerEvents: 'none', opacity: 0.7 } : undefined}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <div ref={invoiceSectionRef}>
          <FormSection title="Sales Invoice" icon={<ReceiptIcon />}>
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
                    sx={{ bgcolor: 'white' }}
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
                <FormControl fullWidth size="small" error={!!fieldErrors.customerId}>
                  <Select
                    value={formData.customerId}
                    onChange={(e) => {
                      handleSelectChange('customerId', e.target.value as SelectChangeValue);
                      setFieldErrors((prev) => ({ ...prev, customerId: '' }));
                    }}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Customer</MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.customerId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {fieldErrors.customerId}
                    </Typography>
                  )}
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
                            sx={{ bgcolor: 'white' }}
                          >
                            <MenuItem value="" disabled>Select Item</MenuItem>
                            {items
                              .filter((i) => i.id === item.itemId || !lineItems.some((l) => l.id !== item.id && l.itemId === i.id))
                              .map((i) => (
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
                          inputProps={{ min: 0 }}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                        />
                        {getStockWarning(item.itemId) && (
                          <Typography variant="caption" sx={{ color: '#EF4444', mt: 0.5, display: 'block' }}>
                            {getStockWarning(item.itemId)}
                          </Typography>
                        )}
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
                          inputProps={{ min: 0 }}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
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

            {fieldErrors.lineItems && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {fieldErrors.lineItems}
              </Typography>
            )}

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
                  <TextField
                    type="number"
                    value={formData.discount || ''}
                    onChange={(e) => {
                      const raw = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      const clamped = Math.min(99, Math.max(0, isNaN(raw) ? 0 : raw));
                      handleSelectChange('discount', clamped);
                    }}
                    size="small"
                    inputProps={{ min: 0, max: 99, step: 1 }}
                    sx={{ width: 80, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                  <Typography variant="body2">%</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Paid Amount:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">PKR</Typography>
                  <TextField
                    type="number"
                    value={formData.paidAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value));
                      handleSelectChange('paidAmount', isNaN(val) ? 0 : val);
                    }}
                    size="small"
                    inputProps={{ min: 0 }}
                    sx={{ width: 100, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>Balance:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{balance.toFixed(2)} PKR</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Amount:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#FF6B35' }}>{subtotal.toFixed(2)} PKR</Typography>
              </Box>
            </Box>
          </FormSection>
          </div>
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
              {fieldErrors.receiptImage && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {fieldErrors.receiptImage}
                </Typography>
              )}
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
            </FormSection>
          )}

          {/* Stock Delivered Checkbox */}
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
              label="Stock Delivered"
            />
          </FormSection>

          {/* Status - Auto-derived from paid amount, read-only */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            {(() => {
              const total = subtotal;
              const paid = Number(formData.paidAmount) || 0;
              let derivedLabel = 'Draft';
              let derivedColor = '#F59E0B';
              if (formData.status === 'Cancelled') {
                derivedLabel = 'Cancelled';
                derivedColor = '#6B7280';
              } else if (formData.status === 'Returned') {
                derivedLabel = 'Returned';
                derivedColor = '#8B5CF6';
              } else if (total > 0 && paid >= total) {
                derivedLabel = 'Paid';
                derivedColor = '#10B981';
              } else if (paid > 0) {
                derivedLabel = 'Partially Paid';
                derivedColor = '#06B6D4';
              } else if (formData.status === 'Posted') {
                derivedLabel = 'Posted';
                derivedColor = '#3B82F6';
              }
              return (
                <Box>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '16px',
                      bgcolor: `${derivedColor}1A`,
                      border: `1px solid ${derivedColor}`,
                      color: derivedColor,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {derivedLabel}
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: '#6B7280' }}>
                    Status is automatically determined by the paid amount.
                  </Typography>
                </Box>
              );
            })()}
          </FormSection>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            {isEditMode && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handlePrint}
                startIcon={<PrintIcon />}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  borderColor: '#FF6B35',
                  color: '#FF6B35',
                  '&:hover': {
                    borderColor: '#E55A2B',
                    bgcolor: '#FFF7ED',
                  },
                }}
              >
                Download PDF
              </Button>
            )}
            {canPost && (
              <Button
                fullWidth
                variant="contained"
                onClick={handlePostInvoice}
                disabled={isPosting}
                startIcon={<PostAddIcon />}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  bgcolor: '#3B82F6',
                  '&:hover': {
                    bgcolor: '#2563EB',
                  },
                }}
              >
                {isPosting ? 'Posting...' : 'Post Invoice'}
              </Button>
            )}
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
                disabled={isSubmitting || isReturned}
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
