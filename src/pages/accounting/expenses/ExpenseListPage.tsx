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
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS } from '../../../constants/colors';

interface Expense {
  id: string;
  date: string;
  companyId?: number;
  companyName: string;
  payFor: string;
  grossAmount: number;
  netAmount: number;
  status: 'Active' | 'Paid' | 'Overdue' | 'Pending';
  createdAt: string;
}

const ExpenseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    dateFrom: '',
    dateTo: '',
    grossAmountFrom: '',
    grossAmountTo: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Load expenses from localStorage
  useEffect(() => {
    const loadExpenses = () => {
      try {
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses));
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadExpenses, 500);
  }, []);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        !searchTerm ||
        expense.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.payFor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || expense.companyName === filters.company;
      const matchesStatus = !filters.status || expense.status === filters.status;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [expenses, searchTerm, filters]);

  const handleAddExpense = useCallback(() => {
    navigate('/account/expense/add');
  }, [navigate]);

  const handleEditExpense = useCallback((id: string) => {
    navigate(`/account/expense/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.id) {
      const updatedExpenses = expenses.filter((e) => e.id !== deleteDialog.id);
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    }
    setDeleteDialog({ open: false, id: null });
  }, [expenses, deleteDialog.id]);

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
      dateFrom: '',
      dateTo: '',
      grossAmountFrom: '',
      grossAmountTo: '',
      status: '',
    });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(expenses.map((e) => e.companyName).filter(Boolean));
    return Array.from(names);
  }, [expenses]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Expense</Typography>
        <TableSkeleton rows={5} columns={7} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Expense
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
            <InputLabel>Select Company</InputLabel>
            <Select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              label="Select Company"
            >
              <MenuItem value="">ERP</MenuItem>
              {companyNames.map((name) => (
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

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Gross Amount To</InputLabel>
              <Select
                value={filters.grossAmountTo}
                onChange={(e) => setFilters({ ...filters, grossAmountTo: e.target.value })}
                label="Gross Amount To"
              >
                <MenuItem value="">00</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>From</InputLabel>
              <Select
                value={filters.grossAmountFrom}
                onChange={(e) => setFilters({ ...filters, grossAmountFrom: e.target.value })}
                label="From"
              >
                <MenuItem value="">00</MenuItem>
              </Select>
            </FormControl>
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
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Pay For</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Gross Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Net Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No expenses found. Click "Add Expense" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.companyName}</TableCell>
                    <TableCell>{expense.payFor}</TableCell>
                    <TableCell>{expense.grossAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>{expense.netAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={expense.status}
                        size="small"
                        sx={{
                          bgcolor: expense.status === 'Active' || expense.status === 'Paid'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : expense.status === 'Overdue'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: expense.status === 'Active' || expense.status === 'Paid'
                            ? '#10B981'
                            : expense.status === 'Overdue'
                            ? '#EF4444'
                            : '#F59E0B',
                          fontWeight: 500,
                          border: `1px solid ${
                            expense.status === 'Active' || expense.status === 'Paid'
                              ? '#10B981'
                              : expense.status === 'Overdue'
                              ? '#EF4444'
                              : '#F59E0B'
                          }`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditExpense(expense.id)}
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(expense.id)}
                        sx={{ color: COLORS.error }}
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
    </Box>
  );
};

export default ExpenseListPage;
