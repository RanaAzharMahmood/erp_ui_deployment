import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Chip,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Popover,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
  PostAdd as PostAddIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import PageError from '../../../components/common/PageError';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { exportToCsv } from '../../../utils/csvExport';
import { COLORS } from '../../../constants/colors';
import { getPurchaseInvoicesApi, getCompaniesApi } from '../../../generated/api/client';

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  vendorName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Draft' | 'Posted' | 'Received' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Returned';
  rawStatus: string;
  stockConfirmed: boolean;
  date: string;
  createdAt: string;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof PurchaseInvoice;

const PurchaseInvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    vendor: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Sorting state
  const [orderBy, setOrderBy] = useState<OrderBy>('date');
  const [order, setOrder] = useState<Order>('desc');

  // Load invoices from API
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const purchaseInvoicesApi = getPurchaseInvoicesApi();
      const response = await purchaseInvoicesApi.getAll();
      if (response.data?.data) {
        const statusMap: Record<string, PurchaseInvoice['status']> = {
          draft: 'Draft',
          posted: 'Posted',
          sent: 'Received',
          received: 'Received',
          partially_paid: 'Partially Paid',
          paid: 'Paid',
          overdue: 'Overdue',
          cancelled: 'Cancelled',
          returned: 'Returned',
        };
        const apiInvoices = response.data.data.map((inv: any) => ({
          id: String(inv.id),
          invoiceNumber: inv.invoiceNumber,
          companyName: inv.companyName || '',
          vendorName: inv.vendorName || '',
          totalAmount: inv.totalAmount || 0,
          paidAmount: inv.paidAmount || 0,
          dueDate: inv.dueDate || '',
          status: (statusMap[inv.status] ?? 'Draft') as PurchaseInvoice['status'],
          rawStatus: inv.status || '',
          stockConfirmed: !!inv.stockConfirmed,
          date: inv.date,
          createdAt: inv.createdAt || '',
        }));
        setInvoices(apiInvoices);
      }
    } catch (err) {
      console.error('Error loading purchase invoices from API:', err);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Handle sort
  const handleSort = useCallback((property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = invoices.filter((invoice) => {
      const matchesSearch =
        !searchTerm ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || invoice.companyName === filters.company;
      const matchesVendor = !filters.vendor || invoice.vendorName === filters.vendor;
      const matchesStatus = !filters.status || invoice.status === filters.status;

      return matchesSearch && matchesCompany && matchesVendor && matchesStatus;
    });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      let aValue: string | number = a[orderBy] as string | number;
      let bValue: string | number = b[orderBy] as string | number;

      // Handle numeric sorting
      if (orderBy === 'totalAmount' || orderBy === 'paidAmount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        // Handle string sorting
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [invoices, searchTerm, filters, orderBy, order]);

  const handleAddInvoice = useCallback(() => {
    navigate('/purchase/invoice/add');
  }, [navigate]);

  const handleEditInvoice = useCallback((id: string) => {
    navigate(`/purchase/invoice/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      setDeleting(true);
      try {
        const purchaseInvoicesApi = getPurchaseInvoicesApi();
        await purchaseInvoicesApi.delete(Number(deleteDialog.id));

        // Update local state
        const updatedInvoices = invoices.filter((i) => i.id !== deleteDialog.id);
        setInvoices(updatedInvoices);
        setSuccessMessage('Purchase invoice deleted successfully!');
      } catch (err) {
        console.error('Error deleting purchase invoice:', err);
        const message = err instanceof Error ? err.message : 'Failed to delete purchase invoice. Please try again.';
        setError(message);
      } finally {
        setDeleting(false);
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [invoices, deleteDialog.id]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

  const handlePostInvoice = useCallback(async (id: string) => {
    try {
      const purchaseInvoicesApi = getPurchaseInvoicesApi();
      await purchaseInvoicesApi.post(Number(id));
      setSuccessMessage('Purchase invoice posted successfully! GL entry created.');
      await loadInvoices();
    } catch (err) {
      console.error('Error posting purchase invoice:', err);
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      const message = apiError?.response?.data?.message || apiError?.message || 'Failed to post purchase invoice. Please try again.';
      setError(message);
    }
  }, [loadInvoices]);

  const handleDownloadPdf = useCallback(async (id: string) => {
    try {
      const purchaseInvoicesApi = getPurchaseInvoicesApi();
      const [invoiceRes, companiesRes] = await Promise.all([
        purchaseInvoicesApi.getById(Number(id)),
        getCompaniesApi().v1ApiCompaniesGet(),
      ]);
      const invoice = invoiceRes.data as unknown as {
        billNumber?: string;
        invoiceNumber?: string;
        date?: string;
        companyId?: number;
        vendor?: { partyName?: string };
        discountAmount?: number;
        paidAmount?: number;
        lines?: Array<{
          quantity?: number;
          unitPrice?: number;
          lineTotal?: number;
          taxAmount?: number;
          item?: { itemName?: string };
        }>;
      };
      const companiesList = (companiesRes.data as unknown as Array<{
        id?: number;
        name?: string;
        companyName?: string;
        logoUrl?: string;
        salesTaxRegistrationNo?: string;
        ntnNumber?: string;
        contactName?: string;
        phone?: string;
        address?: string;
      }>) || [];
      const company = companiesList.find((c) => c.id === invoice.companyId);

      const lines = (invoice.lines || []).map((l) => {
        const quantity = Number(l.quantity || 0);
        const unitPrice = Number(l.unitPrice || 0);
        const valueEx = quantity * unitPrice;
        const taxAmount = Number(l.taxAmount || 0);
        const taxRatePercent = valueEx > 0 ? Math.round((taxAmount / valueEx) * 100) : 0;
        return {
          quantity,
          description: l.item?.itemName || '',
          unitPrice,
          taxRatePercent,
        };
      });

      const grossTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
      const storedDiscount = Number(invoice.discountAmount || 0);
      const discountPercent = grossTotal > 0 ? Math.round((storedDiscount / grossTotal) * 100) : 0;

      const { downloadInvoicePdf } = await import('../../../components/pdf/downloadInvoicePdf');
      await downloadInvoicePdf({
        variant: 'purchase',
        documentNumber: invoice.billNumber || invoice.invoiceNumber || String(id),
        date: invoice.date || '',
        company: {
          name: company?.name || company?.companyName || 'Company',
          logoUrl: company?.logoUrl,
          salesTaxNumber: company?.salesTaxRegistrationNo,
          ntnNumber: company?.ntnNumber,
          representator: company?.contactName,
          phone: company?.phone,
          address: company?.address,
        },
        party: {
          name: invoice.vendor?.partyName || 'Vendor',
        },
        lines,
        discountPercent,
        paidAmount: Number(invoice.paidAmount || 0),
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  }, []);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      company: '',
      vendor: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(invoices.map((i) => i.companyName).filter(Boolean));
    return Array.from(names);
  }, [invoices]);

  const vendorNames = useMemo(() => {
    const names = new Set(invoices.map((i) => i.vendorName).filter(Boolean));
    return Array.from(names);
  }, [invoices]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Table>
          <TableBody>
            <TableSkeleton rows={5} columns={9} />
          </TableBody>
        </Table>
      </Box>
    );
  }

  if (loadError) {
    return <PageError error={loadError} onRetry={loadInvoices} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, border: '1px solid #E0E0E0', borderRadius: '12px', bgcolor: '#FFFFFF', px: 2, height: 70 }}>
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={handleFilterClick}
          sx={{
            borderColor: '#E5E7EB',
            color: '#374151',
            textTransform: 'none',
          }}
        >
          Filter
        </Button>

        <TextField
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={() => exportToCsv('purchase-invoices', filteredAndSortedInvoices, [
            { header: 'Invoice Number', value: 'invoiceNumber' },
            { header: 'Company', value: 'companyName' },
            { header: 'Vendor', value: 'vendorName' },
            { header: 'Total Amount', value: 'totalAmount' },
            { header: 'Paid Amount', value: 'paidAmount' },
            { header: 'Due Date', value: 'dueDate' },
            { header: 'Status', value: 'status' },
            { header: 'Date', value: 'date' },
          ])}
          sx={{
            borderColor: '#10B981',
            color: '#10B981',
            textTransform: 'none',
            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.04)' },
          }}
        >
          Export to CSV
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddInvoice}
          sx={{
            bgcolor: COLORS.primary,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.primaryHover },
          }}
        >
          Add Purchase Invoice
        </Button>
      </Box>

      {/* Filter Popover */}
      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 350, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Company</InputLabel>
            <Select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              label="Select Company"
            >
              <MenuItem value="">All</MenuItem>
              {companyNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Vendor</InputLabel>
            <Select
              value={filters.vendor}
              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
              label="Select Vendor"
            >
              <MenuItem value="">All</MenuItem>
              {vendorNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Date Range To"
              type="date"
              size="small"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="From"
              type="date"
              size="small"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Posted">Posted</MenuItem>
              <MenuItem value="Received">Received</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Returned">Returned</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              sx={{
                borderColor: '#10B981',
                color: '#10B981',
                textTransform: 'none',
              }}
            >
              Save Filter
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={handleClearFilters}
              sx={{ color: '#6B7280', textTransform: 'none' }}
            >
              Clear Filter
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleFilterClose}
              sx={{
                bgcolor: COLORS.primary,
                textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryHover },
              }}
            >
              Apply Filter
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Table */}
      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table aria-label="Purchase invoices list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'invoiceNumber' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'invoiceNumber'}
                    direction={orderBy === 'invoiceNumber' ? order : 'asc'}
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    Invoice Number
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'companyName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'companyName'}
                    direction={orderBy === 'companyName' ? order : 'asc'}
                    onClick={() => handleSort('companyName')}
                  >
                    Company
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'vendorName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'vendorName'}
                    direction={orderBy === 'vendorName' ? order : 'asc'}
                    onClick={() => handleSort('vendorName')}
                  >
                    Vendor
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'totalAmount' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'totalAmount'}
                    direction={orderBy === 'totalAmount' ? order : 'asc'}
                    onClick={() => handleSort('totalAmount')}
                  >
                    Total Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'paidAmount' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'paidAmount'}
                    direction={orderBy === 'paidAmount' ? order : 'asc'}
                    onClick={() => handleSort('paidAmount')}
                  >
                    Paid Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'dueDate' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'dueDate'}
                    direction={orderBy === 'dueDate' ? order : 'asc'}
                    onClick={() => handleSort('dueDate')}
                  >
                    Due Date
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'status' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'date' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No purchase invoices found. Click "Add Purchase Invoice" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.companyName}</TableCell>
                    <TableCell>{invoice.vendorName}</TableCell>
                    <TableCell>{invoice.totalAmount.toLocaleString()} PKR</TableCell>
                    <TableCell>{invoice.paidAmount.toLocaleString()} PKR</TableCell>
                    <TableCell>{invoice.dueDate || '—'}</TableCell>
                    <TableCell>
                      {(() => {
                        const color =
                          invoice.status === 'Paid' || invoice.status === 'Received'
                            ? '#10B981'
                            : invoice.status === 'Posted'
                            ? '#3B82F6'
                            : invoice.status === 'Partially Paid'
                            ? '#06B6D4'
                            : invoice.status === 'Overdue'
                            ? '#EF4444'
                            : invoice.status === 'Returned'
                            ? '#8B5CF6'
                            : invoice.status === 'Cancelled'
                            ? '#6B7280'
                            : '#F59E0B'; // Draft
                        return (
                          <Chip
                            label={invoice.status}
                            size="small"
                            sx={{
                              bgcolor: `${color}1A`,
                              color,
                              fontWeight: 500,
                              border: `1px solid ${color}`,
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      {(invoice.rawStatus === 'draft' || invoice.rawStatus === 'sent') && invoice.stockConfirmed && (
                        <IconButton
                          size="small"
                          onClick={() => handlePostInvoice(invoice.id)}
                          sx={{ color: '#3B82F6' }}
                          aria-label={`Post invoice ${invoice.invoiceNumber}`}
                          title="Post invoice (creates GL entry)"
                        >
                          <PostAddIcon fontSize="small" />
                        </IconButton>
                      )}
                      {(invoice.rawStatus === 'paid' || invoice.rawStatus === 'partially_paid' || invoice.rawStatus === 'posted') && (
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPdf(invoice.id)}
                          sx={{ color: '#FF6B35' }}
                          aria-label={`Download PDF for invoice ${invoice.invoiceNumber}`}
                          title="Download PDF"
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEditInvoice(invoice.id)}
                        sx={{ color: '#10B981' }}
                        aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(invoice.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                        disabled={deleting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
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

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default PurchaseInvoiceListPage;
