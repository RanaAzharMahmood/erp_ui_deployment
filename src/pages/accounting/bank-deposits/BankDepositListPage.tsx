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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  GridOn as GridIcon,
  CheckCircle as CompleteIcon,
  Cancel as VoidIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import {
  getBankDepositsApi,
  BankDeposit,
  BankDepositStatus,
  BankDepositFilters,
} from '../../../generated/api/client';

type Order = 'asc' | 'desc';
type BankDepositOrderBy = 'companyName' | 'date' | 'depositNumber' | 'reference' | 'amount' | 'status';

const BankDepositListPage: React.FC = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<BankDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    dateFrom: '',
    dateTo: '',
    number: '',
    bankAccount: '',
    depositNumber: '',
    status: '' as BankDepositStatus | '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Sorting state
  const [orderBy, setOrderBy] = useState<BankDepositOrderBy>('date');
  const [order, setOrder] = useState<Order>('desc');

  // Load deposits from API
  const loadDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const api = getBankDepositsApi();
      const apiFilters: BankDepositFilters = {
        isActive: true,
      };

      if (filters.status) {
        apiFilters.status = filters.status as BankDepositStatus;
      }
      if (filters.dateFrom) {
        apiFilters.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        apiFilters.dateTo = filters.dateTo;
      }

      const response = await api.getAll(apiFilters);
      if (response.success && response.data) {
        setDeposits(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading deposits:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load bank deposits',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  // Handle sort
  const handleSort = useCallback((property: BankDepositOrderBy) => {
    setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(property);
  }, [orderBy]);

  // Filter and sort deposits locally for search and other filters
  const filteredDeposits = useMemo(() => {
    const filtered = deposits.filter((deposit) => {
      const matchesSearch =
        !searchTerm ||
        (deposit.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.depositNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deposit.reference || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || deposit.companyName === filters.company;
      const matchesBankAccount = !filters.bankAccount || String(deposit.bankAccountId) === filters.bankAccount;

      return matchesSearch && matchesCompany && matchesBankAccount;
    });

    // Sort the filtered deposits
    const sortedDeposits = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'companyName':
          aValue = a.companyName || '';
          bValue = b.companyName || '';
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'depositNumber':
          aValue = a.depositNumber || '';
          bValue = b.depositNumber || '';
          break;
        case 'reference':
          aValue = a.reference || '';
          bValue = b.reference || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    return sortedDeposits;
  }, [deposits, searchTerm, filters.company, filters.bankAccount, orderBy, order]);

  const handleAddDeposit = useCallback(() => {
    navigate('/account/bank-deposit/add');
  }, [navigate]);

  const handleEditDeposit = useCallback((id: number) => {
    navigate(`/account/bank-deposit/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      try {
        const api = getBankDepositsApi();
        await api.delete(deleteDialog.id);
        setSnackbar({
          open: true,
          message: 'Bank deposit deleted successfully',
          severity: 'success',
        });
        loadDeposits();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to delete bank deposit',
          severity: 'error',
        });
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [deleteDialog.id, loadDeposits]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

  const handleCompleteDeposit = useCallback(async (id: number) => {
    try {
      const api = getBankDepositsApi();
      await api.complete(id);
      setSnackbar({
        open: true,
        message: 'Bank deposit completed successfully',
        severity: 'success',
      });
      loadDeposits();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to complete bank deposit',
        severity: 'error',
      });
    }
  }, [loadDeposits]);

  const handleVoidDeposit = useCallback(async (id: number) => {
    try {
      const api = getBankDepositsApi();
      await api.void(id);
      setSnackbar({
        open: true,
        message: 'Bank deposit voided successfully',
        severity: 'success',
      });
      loadDeposits();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to void bank deposit',
        severity: 'error',
      });
    }
  }, [loadDeposits]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilters = () => {
    loadDeposits();
    handleFilterClose();
  };

  const handleClearFilters = () => {
    setFilters({
      company: '',
      dateFrom: '',
      dateTo: '',
      number: '',
      bankAccount: '',
      depositNumber: '',
      status: '',
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(deposits.map((d) => d.companyName).filter(Boolean));
    return Array.from(names) as string[];
  }, [deposits]);

  const bankAccountIds = useMemo(() => {
    const accounts = new Set(deposits.map((d) => String(d.bankAccountId)).filter(Boolean));
    return Array.from(accounts);
  }, [deposits]);

  const getStatusColor = (status: BankDepositStatus) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '#10B981' };
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '#F59E0B' };
      case 'void':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '#EF4444' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280', border: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Bank Deposit</Typography>
        <Table>
          <TableBody>
            <TableSkeleton rows={5} columns={7} />
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
          Bank Deposit
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
          onClick={handleAddDeposit}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Bank Deposit
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
        <Box sx={{ p: 2, width: 350, border: '2px solid #FF6B35', borderRadius: 1 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Company</InputLabel>
            <Select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              label="Company"
            >
              <MenuItem value="">All</MenuItem>
              {companyNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="From"
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
            <InputLabel>Bank Account</InputLabel>
            <Select
              value={filters.bankAccount}
              onChange={(e) => setFilters({ ...filters, bankAccount: e.target.value })}
              label="Bank Account"
            >
              <MenuItem value="">All</MenuItem>
              {bankAccountIds.map((account) => (
                <MenuItem key={account} value={account}>Account #{account}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as BankDepositStatus | '' })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="void">Void</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              onClick={handleClearFilters}
              sx={{ color: '#6B7280', textTransform: 'none' }}
            >
              Clear Filter
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyFilters}
              sx={{
                bgcolor: '#FF6B35',
                textTransform: 'none',
                '&:hover': { bgcolor: '#E55A2B' },
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
          <Table aria-label="Bank deposits list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
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
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'depositNumber' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'depositNumber'}
                    direction={orderBy === 'depositNumber' ? order : 'asc'}
                    onClick={() => handleSort('depositNumber')}
                  >
                    Deposit Number
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'reference' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'reference'}
                    direction={orderBy === 'reference' ? order : 'asc'}
                    onClick={() => handleSort('reference')}
                  >
                    Reference
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'amount' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'asc'}
                    onClick={() => handleSort('amount')}
                  >
                    Amount
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
                <TableCell scope="col" sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No deposits found. Click "Add Bank Deposit" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeposits.map((deposit) => {
                  const statusColors = getStatusColor(deposit.status);
                  return (
                    <TableRow key={deposit.id} hover>
                      <TableCell>{deposit.companyName || 'N/A'}</TableCell>
                      <TableCell>{formatDate(deposit.date)}</TableCell>
                      <TableCell>{deposit.depositNumber}</TableCell>
                      <TableCell>{deposit.reference || '-'}</TableCell>
                      <TableCell>{formatAmount(deposit.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: statusColors.bg,
                            color: statusColors.color,
                            fontWeight: 500,
                            border: `1px solid ${statusColors.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {deposit.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleCompleteDeposit(deposit.id)}
                              sx={{ color: '#10B981' }}
                              aria-label={`Complete deposit ${deposit.depositNumber}`}
                            >
                              <CompleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditDeposit(deposit.id)}
                              sx={{ color: '#3B82F6' }}
                              aria-label={`Edit deposit ${deposit.depositNumber}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleVoidDeposit(deposit.id)}
                              sx={{ color: '#F59E0B' }}
                              aria-label={`Void deposit ${deposit.depositNumber}`}
                            >
                              <VoidIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(deposit.id)}
                              sx={{ color: COLORS.error }}
                              aria-label={`Delete deposit ${deposit.depositNumber}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {deposit.status === 'completed' && (
                          <IconButton
                            size="small"
                            onClick={() => handleVoidDeposit(deposit.id)}
                            sx={{ color: '#F59E0B' }}
                            aria-label={`Void deposit ${deposit.depositNumber}`}
                          >
                            <VoidIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Bank Deposit"
        message="Are you sure you want to delete this bank deposit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BankDepositListPage;
