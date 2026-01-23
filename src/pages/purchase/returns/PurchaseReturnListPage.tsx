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
import { getPurchaseReturnsApi } from '../../../generated/api/client';

interface PurchaseReturn {
  id: string;
  billNumber: string;
  companyName: string;
  vendorName: string;
  item: string;
  quantity: number;
  netAmount: number;
  status: 'Active' | 'Completed' | 'Pending';
  date: string;
  createdAt: string;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof PurchaseReturn;

const PurchaseReturnListPage: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
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

  // Load returns from API
  useEffect(() => {
    const loadReturns = async () => {
      try {
        const purchaseReturnsApi = getPurchaseReturnsApi();
        const response = await purchaseReturnsApi.getAll();
        if (response.data?.data) {
          const apiReturns = response.data.data.map((ret) => {
            // Get first line item name and total quantity from lines
            const firstItem = ret.lines?.[0]?.itemName || '';
            const totalQuantity = ret.lines?.reduce((sum, l) => sum + (l.quantity || 0), 0) || 0;
            return {
              id: String(ret.id),
              billNumber: ret.returnNumber,
              companyName: ret.companyName || '',
              vendorName: ret.vendorName || '',
              item: firstItem,
              quantity: totalQuantity,
              netAmount: ret.totalAmount || 0,
              status: (ret.status === 'completed' ? 'Completed' : ret.status === 'approved' ? 'Active' : 'Pending') as 'Active' | 'Completed' | 'Pending',
              date: ret.date,
              createdAt: ret.createdAt || '',
            };
          });
          setReturns(apiReturns);
        }
      } catch (err) {
        console.error('Error loading purchase returns from API:', err);
        setError('Failed to load purchase returns. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadReturns();
  }, []);

  // Handle sort
  const handleSort = useCallback((property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Filter and sort returns
  const filteredAndSortedReturns = useMemo(() => {
    const filtered = returns.filter((returnItem) => {
      const matchesSearch =
        !searchTerm ||
        returnItem.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.item.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || returnItem.companyName === filters.company;
      const matchesVendor = !filters.vendor || returnItem.vendorName === filters.vendor;
      const matchesStatus = !filters.status || returnItem.status === filters.status;

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
  }, [returns, searchTerm, filters, orderBy, order]);

  const handleAddReturn = useCallback(() => {
    navigate('/purchase/return/add');
  }, [navigate]);

  const handleEditReturn = useCallback((id: string) => {
    navigate(`/purchase/return/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      setDeleting(true);
      try {
        const purchaseReturnsApi = getPurchaseReturnsApi();
        await purchaseReturnsApi.delete(Number(deleteDialog.id));

        // Update local state
        const updatedReturns = returns.filter((r) => r.id !== deleteDialog.id);
        setReturns(updatedReturns);
        setSuccessMessage('Purchase return deleted successfully!');
      } catch (err) {
        console.error('Error deleting purchase return:', err);
        setError('Failed to delete purchase return. Please try again.');
      } finally {
        setDeleting(false);
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [returns, deleteDialog.id]);

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
    const names = new Set(returns.map((r) => r.companyName).filter(Boolean));
    return Array.from(names);
  }, [returns]);

  const vendorNames = useMemo(() => {
    const names = new Set(returns.map((r) => r.vendorName).filter(Boolean));
    return Array.from(names);
  }, [returns]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Purchase Return</Typography>
        <Table>
          <TableBody>
            <TableSkeleton rows={5} columns={9} />
          </TableBody>
        </Table>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Purchase Return
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
          onClick={handleAddReturn}
          sx={{
            bgcolor: COLORS.primary,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.primaryHover },
          }}
        >
          Return Purchase Invoice
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
              <MenuItem value="Completed">Completed</MenuItem>
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
          <Table aria-label="Purchase returns list">
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
              {filteredAndSortedReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No purchase returns found. Click "Return Purchase Invoice" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedReturns.map((returnItem) => (
                  <TableRow key={returnItem.id} hover>
                    <TableCell>{returnItem.billNumber}</TableCell>
                    <TableCell>{returnItem.companyName}</TableCell>
                    <TableCell>{returnItem.vendorName}</TableCell>
                    <TableCell>{returnItem.item}</TableCell>
                    <TableCell>{returnItem.quantity}</TableCell>
                    <TableCell>{returnItem.netAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={returnItem.status}
                        size="small"
                        sx={{
                          bgcolor: returnItem.status === 'Active' || returnItem.status === 'Completed'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: returnItem.status === 'Active' || returnItem.status === 'Completed'
                            ? '#10B981'
                            : '#F59E0B',
                          fontWeight: 500,
                          border: `1px solid ${
                            returnItem.status === 'Active' || returnItem.status === 'Completed'
                              ? '#10B981'
                              : '#F59E0B'
                          }`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{returnItem.date}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditReturn(returnItem.id)}
                        sx={{ color: '#10B981' }}
                        aria-label={`Edit return ${returnItem.billNumber}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(returnItem.id)}
                        sx={{ color: COLORS.error }}
                        disabled={deleting}
                        aria-label={`Delete return ${returnItem.billNumber}`}
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
        title="Delete Return"
        message="Are you sure you want to delete this return? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default PurchaseReturnListPage;
