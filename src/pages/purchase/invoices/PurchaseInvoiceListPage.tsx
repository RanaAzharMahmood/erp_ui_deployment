import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
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
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { getPurchaseInvoicesApi } from '../../../generated/api/client';

interface PurchaseInvoice {
  id: string;
  billNumber: string;
  companyName: string;
  vendorName: string;
  item: string;
  quantity: number;
  netAmount: number;
  status: 'Active' | 'Paid' | 'Overdue' | 'Pending';
  date: string;
  createdAt: string;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof PurchaseInvoice;

const PurchaseInvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load invoices from API with localStorage fallback
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const purchaseInvoicesApi = getPurchaseInvoicesApi();
        const response = await purchaseInvoicesApi.getAll();
        if (response.data?.data) {
          const apiInvoices = response.data.data.map((inv) => ({
            id: String(inv.id),
            billNumber: inv.billNumber,
            companyName: inv.companyName || '',
            vendorName: inv.vendorName || '',
            item: inv.item || '',
            quantity: inv.quantity || 0,
            netAmount: inv.netAmount || 0,
            status: inv.status as 'Active' | 'Paid' | 'Overdue' | 'Pending',
            date: inv.date,
            createdAt: inv.createdAt || '',
          }));
          setInvoices(apiInvoices);
          // Sync to localStorage for offline access
          localStorage.setItem('purchaseInvoices', JSON.stringify(apiInvoices));
        }
      } catch (err) {
        console.error('Error loading purchase invoices from API, using localStorage fallback:', err);
        // Fallback to localStorage
        try {
          const savedInvoices = localStorage.getItem('purchaseInvoices');
          if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          }
        } catch (localErr) {
          console.error('Error loading from localStorage:', localErr);
          setError('Failed to load purchase invoices. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

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
        invoice.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.item.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || invoice.companyName === filters.company;
      const matchesVendor = !filters.vendor || invoice.vendorName === filters.vendor;
      const matchesStatus = !filters.status || invoice.status === filters.status;

      return matchesSearch && matchesCompany && matchesVendor && matchesStatus;
    });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      let aValue: string | number = a[orderBy];
      let bValue: string | number = b[orderBy];

      // Handle numeric sorting
      if (orderBy === 'quantity' || orderBy === 'netAmount') {
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
        // Try API delete first
        const purchaseInvoicesApi = getPurchaseInvoicesApi();
        await purchaseInvoicesApi.delete(Number(deleteDialog.id));

        // Update local state
        const updatedInvoices = invoices.filter((i) => i.id !== deleteDialog.id);
        setInvoices(updatedInvoices);
        localStorage.setItem('purchaseInvoices', JSON.stringify(updatedInvoices));
        setSuccessMessage('Purchase invoice deleted successfully!');
      } catch (err) {
        console.error('Error deleting purchase invoice from API, using localStorage fallback:', err);
        // Fallback to localStorage only
        try {
          const updatedInvoices = invoices.filter((i) => i.id !== deleteDialog.id);
          setInvoices(updatedInvoices);
          localStorage.setItem('purchaseInvoices', JSON.stringify(updatedInvoices));
          setSuccessMessage('Purchase invoice deleted successfully!');
        } catch (localErr) {
          console.error('Error deleting from localStorage:', localErr);
          setError('Failed to delete purchase invoice. Please try again.');
        }
      } finally {
        setDeleting(false);
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [invoices, deleteDialog.id]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
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
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Purchase Invoice</Typography>
        <TableSkeleton rows={5} columns={9} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Purchase Invoice
        </Typography>
      </Box>

      {/* Toolbar */}
      <Card sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
          Add Purchase Invoice
        </Button>
      </Card>

      {/* Filter Popover */}
      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 350, border: `2px solid ${COLORS.primary}`, borderRadius: 1 }}>
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
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
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
      <Card sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <TableContainer>
          <Table aria-label="Purchase invoices list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'billNumber' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'billNumber'}
                    direction={orderBy === 'billNumber' ? order : 'asc'}
                    onClick={() => handleSort('billNumber')}
                  >
                    Bill Number
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
                  aria-sort={orderBy === 'item' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'item'}
                    direction={orderBy === 'item' ? order : 'asc'}
                    onClick={() => handleSort('item')}
                  >
                    Item
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'quantity' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'quantity'}
                    direction={orderBy === 'quantity' ? order : 'asc'}
                    onClick={() => handleSort('quantity')}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'netAmount' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'netAmount'}
                    direction={orderBy === 'netAmount' ? order : 'asc'}
                    onClick={() => handleSort('netAmount')}
                  >
                    Net Amount
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
                    <TableCell>{invoice.billNumber}</TableCell>
                    <TableCell>{invoice.companyName}</TableCell>
                    <TableCell>{invoice.vendorName}</TableCell>
                    <TableCell>{invoice.item}</TableCell>
                    <TableCell>{invoice.quantity}</TableCell>
                    <TableCell>{invoice.netAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        size="small"
                        sx={{
                          bgcolor: invoice.status === 'Active' || invoice.status === 'Paid'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : invoice.status === 'Overdue'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: invoice.status === 'Active' || invoice.status === 'Paid'
                            ? '#10B981'
                            : invoice.status === 'Overdue'
                            ? '#EF4444'
                            : '#F59E0B',
                          fontWeight: 500,
                          border: `1px solid ${
                            invoice.status === 'Active' || invoice.status === 'Paid'
                              ? '#10B981'
                              : invoice.status === 'Overdue'
                              ? '#EF4444'
                              : '#F59E0B'
                          }`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditInvoice(invoice.id)}
                        sx={{ color: '#10B981' }}
                        aria-label={`Edit invoice ${invoice.billNumber}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(invoice.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete invoice ${invoice.billNumber}`}
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
      </Card>

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
