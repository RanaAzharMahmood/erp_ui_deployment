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
  TablePagination,
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
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  GridOn as GridIcon,
  CheckCircle as ApproveIcon,
  Payment as PayIcon,
  Block as VoidIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { useDebounce } from '../../../hooks/useDebounce';
import { expenseService, type Expense, type ExpenseStatus } from '../../../services';

const STATUSES = ['All', 'draft', 'approved', 'paid', 'void'];

type Order = 'asc' | 'desc';
type ExpenseOrderBy = 'expenseNumber' | 'date' | 'vendorName' | 'description' | 'amount' | 'totalAmount' | 'status';

const getStatusColor = (status: ExpenseStatus) => {
  switch (status) {
    case 'draft':
      return { bgcolor: 'rgba(158, 158, 158, 0.1)', color: '#9E9E9E', border: '#9E9E9E' };
    case 'approved':
      return { bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196F3', border: '#2196F3' };
    case 'paid':
      return { bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', border: '#4CAF50' };
    case 'void':
      return { bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#F44336', border: '#F44336' };
    default:
      return { bgcolor: 'rgba(158, 158, 158, 0.1)', color: '#9E9E9E', border: '#9E9E9E' };
  }
};

const formatStatusLabel = (status: ExpenseStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const ExpenseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    id: number | null;
    action: 'approve' | 'pay' | 'void' | null;
  }>({
    open: false,
    id: null,
    action: null,
  });

  // Sorting state
  const [orderBy, setOrderBy] = useState<ExpenseOrderBy>('date');
  const [order, setOrder] = useState<Order>('desc');

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load expenses from API
  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const apiFilters: {
        status?: ExpenseStatus;
        dateFrom?: string;
        dateTo?: string;
        isActive?: boolean;
        limit: number;
        offset: number;
      } = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        isActive: true,
      };

      if (filters.status && filters.status !== 'All') {
        apiFilters.status = filters.status as ExpenseStatus;
      }

      if (filters.dateFrom) {
        apiFilters.dateFrom = filters.dateFrom;
      }

      if (filters.dateTo) {
        apiFilters.dateTo = filters.dateTo;
      }

      const response = await expenseService.getAll(apiFilters);

      // Filter by search term client-side (for description/reference search)
      let expenseData = response.data.data;
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        expenseData = expenseData.filter(
          (expense) =>
            expense.expenseNumber?.toLowerCase().includes(searchLower) ||
            expense.description?.toLowerCase().includes(searchLower) ||
            expense.reference?.toLowerCase().includes(searchLower) ||
            expense.vendorName?.toLowerCase().includes(searchLower)
        );
      }

      setExpenses(expenseData);
      setTotalCount(response.data.total);

      // Save to localStorage as backup
      localStorage.setItem('expenses', JSON.stringify(expenseData));
    } catch (err: unknown) {
      console.error('Error loading expenses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load expenses';
      setError(`${errorMessage}. Loading from local storage...`);

      // Fallback to localStorage
      const savedExpenses = localStorage.getItem('expenses');
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses);
        setTotalCount(parsedExpenses.length);
      } else {
        setExpenses([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.dateFrom, filters.dateTo, page, rowsPerPage]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Handle sort
  const handleSort = useCallback((property: ExpenseOrderBy) => {
    setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(property);
  }, [orderBy]);

  // Memoized filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    const sortedExpenses = [...expenses].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'expenseNumber':
          aValue = a.expenseNumber || '';
          bValue = b.expenseNumber || '';
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'vendorName':
          aValue = a.vendorName || '';
          bValue = b.vendorName || '';
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
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

    return sortedExpenses;
  }, [expenses, orderBy, order]);

  const handleAddExpense = useCallback(() => {
    navigate('/account/expense/add');
  }, [navigate]);

  const handleEditExpense = useCallback(
    (id: number) => {
      navigate(`/account/expense/update/${id}`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      try {
        await expenseService.delete(deleteDialog.id);

        // Update local state
        const updatedExpenses = expenses.filter((e) => e.id !== deleteDialog.id);
        setExpenses(updatedExpenses);
        setTotalCount((prev) => prev - 1);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));

        setSuccessMessage('Expense deleted successfully');
      } catch (err: unknown) {
        console.error('Error deleting expense:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
        setError(errorMessage);
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [expenses, deleteDialog.id]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

  const handleActionClick = useCallback(
    (id: number, action: 'approve' | 'pay' | 'void') => {
      setActionDialog({ open: true, id, action });
    },
    []
  );

  const handleActionConfirm = useCallback(async () => {
    if (actionDialog.id && actionDialog.action) {
      try {
        let response;
        let message = '';

        switch (actionDialog.action) {
          case 'approve':
            response = await expenseService.approve(actionDialog.id);
            message = 'Expense approved successfully';
            break;
          case 'pay':
            response = await expenseService.markPaid(actionDialog.id);
            message = 'Expense marked as paid successfully';
            break;
          case 'void':
            response = await expenseService.void(actionDialog.id);
            message = 'Expense voided successfully';
            break;
        }

        if (response) {
          // Update the expense in local state
          const updatedExpenses = expenses.map((e) =>
            e.id === actionDialog.id ? response.data : e
          );
          setExpenses(updatedExpenses);
          localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
          setSuccessMessage(message);
        }
      } catch (err: unknown) {
        console.error(`Error performing ${actionDialog.action}:`, err);
        const errorMessage = err instanceof Error ? err.message : `Failed to ${actionDialog.action} expense`;
        setError(errorMessage);
      }
    }
    setActionDialog({ open: false, id: null, action: null });
  }, [expenses, actionDialog.id, actionDialog.action]);

  const handleActionCancel = useCallback(() => {
    setActionDialog({ open: false, id: null, action: null });
  }, []);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      dateFrom: '',
      dateTo: '',
      status: '',
    });
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    handleFilterClose();
  };

  const filterOpen = Boolean(filterAnchorEl);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getActionTitle = () => {
    switch (actionDialog.action) {
      case 'approve':
        return 'Approve Expense';
      case 'pay':
        return 'Mark as Paid';
      case 'void':
        return 'Void Expense';
      default:
        return '';
    }
  };

  const getActionMessage = () => {
    switch (actionDialog.action) {
      case 'approve':
        return 'Are you sure you want to approve this expense? This action will change the status to approved.';
      case 'pay':
        return 'Are you sure you want to mark this expense as paid? This action will change the status to paid.';
      case 'void':
        return 'Are you sure you want to void this expense? This action cannot be undone.';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Expenses
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
          placeholder="Search by number, description, vendor..."
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
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
          onClick={handleAddExpense}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Expense
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
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e: SelectChangeEvent) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              {STATUSES.filter((s) => s !== 'All').map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatusLabel(status as ExpenseStatus)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Date From"
              type="date"
              size="small"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Date To"
              type="date"
              size="small"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

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
          <Table aria-label="Expenses list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'expenseNumber' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'expenseNumber'}
                    direction={orderBy === 'expenseNumber' ? order : 'asc'}
                    onClick={() => handleSort('expenseNumber')}
                  >
                    Expense #
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
                  aria-sort={orderBy === 'description' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'description'}
                    direction={orderBy === 'description' ? order : 'asc'}
                    onClick={() => handleSort('description')}
                  >
                    Description
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
                  aria-sort={orderBy === 'totalAmount' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'totalAmount'}
                    direction={orderBy === 'totalAmount' ? order : 'asc'}
                    onClick={() => handleSort('totalAmount')}
                  >
                    Total
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
              {isLoading ? (
                <TableSkeleton rows={5} columns={8} />
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No expenses found. Click "Add Expense" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => {
                  const statusColors = getStatusColor(expense.status);
                  return (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {expense.expenseNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.vendorName || '-'}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {expense.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatCurrency(expense.amount)} PKR</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {formatCurrency(expense.totalAmount)} PKR
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatStatusLabel(expense.status)}
                          size="small"
                          sx={{
                            bgcolor: statusColors.bgcolor,
                            color: statusColors.color,
                            fontWeight: 500,
                            border: `1px solid ${statusColors.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {expense.status === 'draft' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleActionClick(expense.id, 'approve')}
                                sx={{ color: '#2196F3' }}
                                aria-label={`Approve expense ${expense.expenseNumber}`}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEditExpense(expense.id)}
                                sx={{ color: '#10B981' }}
                                aria-label={`Edit expense ${expense.expenseNumber}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(expense.id)}
                                sx={{ color: COLORS.error }}
                                aria-label={`Delete expense ${expense.expenseNumber}`}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {expense.status === 'approved' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleActionClick(expense.id, 'pay')}
                                sx={{ color: '#4CAF50' }}
                                aria-label={`Mark expense ${expense.expenseNumber} as paid`}
                              >
                                <PayIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleActionClick(expense.id, 'void')}
                                sx={{ color: '#F44336' }}
                                aria-label={`Void expense ${expense.expenseNumber}`}
                              >
                                <VoidIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {expense.status === 'paid' && (
                            <IconButton
                              size="small"
                              onClick={() => handleActionClick(expense.id, 'void')}
                              sx={{ color: '#F44336' }}
                              aria-label={`Void expense ${expense.expenseNumber}`}
                            >
                              <VoidIcon fontSize="small" />
                            </IconButton>
                          )}
                          {expense.status === 'void' && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(expense.id)}
                              sx={{ color: COLORS.error }}
                              aria-label={`Delete expense ${expense.expenseNumber}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!isLoading && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #E0E0E0' }}
            aria-label="Expenses table pagination"
          />
        )}
      </Card>

      {/* Success Snackbar */}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Action Confirmation Dialog */}
      <ConfirmDialog
        open={actionDialog.open}
        title={getActionTitle()}
        message={getActionMessage()}
        confirmText={actionDialog.action === 'void' ? 'Void' : 'Confirm'}
        cancelText="Cancel"
        confirmColor={actionDialog.action === 'void' ? 'error' : 'primary'}
        onConfirm={handleActionConfirm}
        onCancel={handleActionCancel}
      />
    </Box>
  );
};

export default ExpenseListPage;
