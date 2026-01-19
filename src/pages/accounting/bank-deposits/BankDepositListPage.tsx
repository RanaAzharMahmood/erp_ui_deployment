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

interface BankDeposit {
  id: string;
  companyId?: number;
  companyName: string;
  date: string;
  bankAccount: string;
  depositNumber: string;
  totalAmount: number;
  status: 'Submit' | 'Reject';
  createdAt: string;
}

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
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Load deposits from localStorage
  useEffect(() => {
    const loadDeposits = () => {
      try {
        const savedDeposits = localStorage.getItem('bankDeposits');
        if (savedDeposits) {
          setDeposits(JSON.parse(savedDeposits));
        }
      } catch (error) {
        console.error('Error loading deposits:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadDeposits, 500);
  }, []);

  // Filter deposits
  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const matchesSearch =
        !searchTerm ||
        deposit.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.depositNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.bankAccount.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || deposit.companyName === filters.company;
      const matchesStatus = !filters.status || deposit.status === filters.status;
      const matchesBankAccount = !filters.bankAccount || deposit.bankAccount === filters.bankAccount;

      return matchesSearch && matchesCompany && matchesStatus && matchesBankAccount;
    });
  }, [deposits, searchTerm, filters]);

  const handleAddDeposit = useCallback(() => {
    navigate('/account/bank-deposit/add');
  }, [navigate]);

  const handleEditDeposit = useCallback((id: string) => {
    navigate(`/account/bank-deposit/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.id) {
      const updatedDeposits = deposits.filter((d) => d.id !== deleteDialog.id);
      setDeposits(updatedDeposits);
      localStorage.setItem('bankDeposits', JSON.stringify(updatedDeposits));
    }
    setDeleteDialog({ open: false, id: null });
  }, [deposits, deleteDialog.id]);

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
      number: '',
      bankAccount: '',
      depositNumber: '',
      status: '',
    });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(deposits.map((d) => d.companyName).filter(Boolean));
    return Array.from(names);
  }, [deposits]);

  const bankAccounts = useMemo(() => {
    const accounts = new Set(deposits.map((d) => d.bankAccount).filter(Boolean));
    return Array.from(accounts);
  }, [deposits]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Bank Deposit</Typography>
        <TableSkeleton rows={5} columns={7} />
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

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Number</InputLabel>
            <Select
              value={filters.number}
              onChange={(e) => setFilters({ ...filters, number: e.target.value })}
              label="Number"
            >
              <MenuItem value="">All</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Bank Account</InputLabel>
            <Select
              value={filters.bankAccount}
              onChange={(e) => setFilters({ ...filters, bankAccount: e.target.value })}
              label="Bank Account"
            >
              <MenuItem value="">All</MenuItem>
              {bankAccounts.map((account) => (
                <MenuItem key={account} value={account}>{account}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Deposit Number</InputLabel>
            <Select
              value={filters.depositNumber}
              onChange={(e) => setFilters({ ...filters, depositNumber: e.target.value })}
              label="Deposit Number"
            >
              <MenuItem value="">All</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Submit">Submit</MenuItem>
              <MenuItem value="Reject">Reject</MenuItem>
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
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Bank Account</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Deposit Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
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
                filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id} hover>
                    <TableCell>{deposit.companyName}</TableCell>
                    <TableCell>{deposit.date}</TableCell>
                    <TableCell>{deposit.bankAccount}</TableCell>
                    <TableCell>{deposit.depositNumber}</TableCell>
                    <TableCell>{deposit.totalAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={deposit.status}
                        size="small"
                        sx={{
                          bgcolor: deposit.status === 'Submit'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          color: deposit.status === 'Submit' ? '#10B981' : '#EF4444',
                          fontWeight: 500,
                          border: `1px solid ${deposit.status === 'Submit' ? '#10B981' : '#EF4444'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditDeposit(deposit.id)}
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(deposit.id)}
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
        title="Delete Bank Deposit"
        message="Are you sure you want to delete this bank deposit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default BankDepositListPage;
