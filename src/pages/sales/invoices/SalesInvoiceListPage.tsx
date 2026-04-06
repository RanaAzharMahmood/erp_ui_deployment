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
  Print as PrintIcon,
  GridOn as GridIcon,
  PostAdd as PostAddIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import PageError from '../../../components/common/PageError';
import { COLORS } from '../../../constants/colors';
import { getSalesInvoicesApi } from '../../../generated/api/client';

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: string;
  status: 'Draft' | 'Posted' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Pending' | 'Returned' | 'Cancelled';
  rawStatus: string;
  stockConfirmed: boolean;
  date: string;
  createdAt: string;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof SalesInvoice;

const SalesInvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    customer: '',
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
      const salesInvoicesApi = getSalesInvoicesApi();
      const response = await salesInvoicesApi.getAll();
      if (response.data?.data) {
        const apiInvoices = response.data.data.map((inv: any) => {
          const total = inv.totalAmount || 0;
          const paid = inv.paidAmount || 0;
          const statusLabel: SalesInvoice['status'] =
            inv.status === 'paid' ? 'Paid'
            : inv.status === 'partially_paid' ? 'Partially Paid'
            : inv.status === 'posted' ? 'Posted'
            : inv.status === 'overdue' ? 'Overdue'
            : inv.status === 'returned' ? 'Returned'
            : inv.status === 'cancelled' ? 'Cancelled'
            : inv.status === 'draft' ? 'Draft'
            : 'Pending';
          return {
            id: String(inv.id),
            invoiceNumber: inv.invoiceNumber,
            companyName: inv.companyName || '',
            customerName: inv.customerName || '',
            totalAmount: total,
            paidAmount: paid,
            balance: total - paid,
            paymentMethod: inv.paymentMethod || '-',
            status: statusLabel,
            rawStatus: inv.status || '',
            stockConfirmed: !!inv.stockConfirmed,
            date: inv.date,
            createdAt: inv.createdAt || '',
          };
        });
        setInvoices(apiInvoices);
      }
    } catch (err) {
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
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || invoice.companyName === filters.company;
      const matchesCustomer = !filters.customer || invoice.customerName === filters.customer;
      const matchesStatus = !filters.status || invoice.status === filters.status;

      return matchesSearch && matchesCompany && matchesCustomer && matchesStatus;
    });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      let aValue: string | number = a[orderBy] as string | number;
      let bValue: string | number = b[orderBy] as string | number;

      // Handle numeric sorting
      if (orderBy === 'totalAmount' || orderBy === 'paidAmount' || orderBy === 'balance') {
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
    navigate('/sales/invoice/add');
  }, [navigate]);

  const handleEditInvoice = useCallback((id: string) => {
    navigate(`/sales/invoice/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      setDeleting(true);
      try {
        const salesInvoicesApi = getSalesInvoicesApi();
        await salesInvoicesApi.delete(Number(deleteDialog.id));

        // Update local state
        const updatedInvoices = invoices.filter((i) => i.id !== deleteDialog.id);
        setInvoices(updatedInvoices);
        setSuccessMessage('Sales invoice deleted successfully!');
      } catch (err) {
        console.error('Error deleting sales invoice:', err);
        const apiError = err as { response?: { data?: { message?: string } } };
        const message = apiError?.response?.data?.message || 'Failed to delete sales invoice. Please try again.';
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
      const salesInvoicesApi = getSalesInvoicesApi();
      await salesInvoicesApi.post(Number(id));
      setSuccessMessage('Sales invoice posted successfully! GL entry created.');
      await loadInvoices();
    } catch (err) {
      console.error('Error posting sales invoice:', err);
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      const message = apiError?.response?.data?.message || apiError?.message || 'Failed to post sales invoice. Please try again.';
      setError(message);
    }
  }, [loadInvoices]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      company: '',
      customer: '',
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

  const customerNames = useMemo(() => {
    const names = new Set(invoices.map((i) => i.customerName).filter(Boolean));
    return Array.from(names);
  }, [invoices]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Sales Invoice</Typography>
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
          startIcon={<PrintIcon />}
          sx={{
            borderColor: '#10B981',
            color: '#10B981',
            textTransform: 'none',
            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.04)' },
          }}
        >
          Print List
        </Button>

        <Button
          variant="outlined"
          startIcon={<GridIcon />}
          sx={{
            borderColor: '#10B981',
            color: '#10B981',
            textTransform: 'none',
            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.04)' },
          }}
        >
          Export To CSV
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
          Add Sales Invoice
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
            <InputLabel>Select Customer</InputLabel>
            <Select
              value={filters.customer}
              onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
              label="Select Customer"
            >
              <MenuItem value="">All</MenuItem>
              {customerNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Date Range From"
              type="date"
              size="small"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
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
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Returned">Returned</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
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
          <Table aria-label="Sales invoices list">
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
                  aria-sort={orderBy === 'customerName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'customerName'}
                    direction={orderBy === 'customerName' ? order : 'asc'}
                    onClick={() => handleSort('customerName')}
                  >
                    Customer
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
                  aria-sort={orderBy === 'balance' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'balance'}
                    direction={orderBy === 'balance' ? order : 'asc'}
                    onClick={() => handleSort('balance')}
                  >
                    Balance
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'paymentMethod' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'paymentMethod'}
                    direction={orderBy === 'paymentMethod' ? order : 'asc'}
                    onClick={() => handleSort('paymentMethod')}
                  >
                    Payment
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
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No sales invoices found. Click "Add Sales Invoice" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.companyName}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{invoice.totalAmount.toFixed(2)} PKR</TableCell>
                    <TableCell>{invoice.paidAmount.toFixed(2)} PKR</TableCell>
                    <TableCell sx={{ color: invoice.balance > 0 ? '#EF4444' : '#10B981', fontWeight: 500 }}>{invoice.balance.toFixed(2)} PKR</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell>
                      {(() => {
                        const color =
                          invoice.status === 'Paid'
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
                            : '#F59E0B'; // Draft / Pending
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
                      <IconButton
                        size="small"
                        onClick={() => handleEditInvoice(invoice.id)}
                        sx={{ color: '#4CAF50' }}
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

export default SalesInvoiceListPage;
