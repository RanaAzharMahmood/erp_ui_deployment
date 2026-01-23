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
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { bankAccountService, BankAccount as ApiBankAccount } from '../../../services';

interface BankAccount {
  id: string;
  companyId?: number;
  companyName: string;
  bankName: string;
  branchName: string;
  accountTitle: string;
  accountNumber: string;
  date: string;
  details: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

type Order = 'asc' | 'desc';
type BankAccountOrderBy = 'companyName' | 'bankName' | 'branchName' | 'accountTitle' | 'accountNumber' | 'status';

// Map API response to internal format
const mapApiToInternal = (account: ApiBankAccount): BankAccount => ({
  id: String(account.id),
  companyId: account.companyId,
  companyName: account.companyName || '',
  bankName: account.bankName,
  branchName: account.branchName || '',
  accountTitle: account.accountName,
  accountNumber: account.accountNumber,
  date: account.createdAt,
  details: '',
  status: account.isActive ? 'Active' : 'Inactive',
  createdAt: account.createdAt,
});

const BankAccountListPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    bankName: '',
    branchName: '',
    accountTitle: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting state
  const [orderBy, setOrderBy] = useState<BankAccountOrderBy>('companyName');
  const [order, setOrder] = useState<Order>('asc');

  // Load accounts from API
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bankAccountService.getAll();
      if (response.success && response.data?.data) {
        const mappedAccounts = response.data.data.map(mapApiToInternal);
        setAccounts(mappedAccounts);
      }
    } catch (error) {
      console.error('Error loading bank accounts from API:', error);
      setAccounts([]);
      setSnackbar({
        open: true,
        message: 'Failed to load bank accounts',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Handle sort
  const handleSort = useCallback((property: BankAccountOrderBy) => {
    setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(property);
  }, [orderBy]);

  // Filter and sort accounts
  const filteredAccounts = useMemo(() => {
    const filtered = accounts.filter((account) => {
      const matchesSearch =
        !searchTerm ||
        account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || account.companyName === filters.company;
      const matchesBankName = !filters.bankName || account.bankName === filters.bankName;
      const matchesBranchName = !filters.branchName || account.branchName === filters.branchName;
      const matchesAccountTitle = !filters.accountTitle || account.accountTitle === filters.accountTitle;
      const matchesStatus = !filters.status || account.status === filters.status;

      return matchesSearch && matchesCompany && matchesBankName && matchesBranchName && matchesAccountTitle && matchesStatus;
    });

    // Sort the filtered accounts
    const sortedAccounts = [...filtered].sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (orderBy) {
        case 'companyName':
          aValue = a.companyName || '';
          bValue = b.companyName || '';
          break;
        case 'bankName':
          aValue = a.bankName || '';
          bValue = b.bankName || '';
          break;
        case 'branchName':
          aValue = a.branchName || '';
          bValue = b.branchName || '';
          break;
        case 'accountTitle':
          aValue = a.accountTitle || '';
          bValue = b.accountTitle || '';
          break;
        case 'accountNumber':
          aValue = a.accountNumber || '';
          bValue = b.accountNumber || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return sortedAccounts;
  }, [accounts, searchTerm, filters, orderBy, order]);

  const handleAddAccount = useCallback(() => {
    navigate('/account/bank-account/add');
  }, [navigate]);

  const handleEditAccount = useCallback((id: string) => {
    navigate(`/account/bank-account/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.id) return;

    setIsDeleting(true);
    try {
      await bankAccountService.delete(Number(deleteDialog.id));

      // Update local state
      const updatedAccounts = accounts.filter((a) => a.id !== deleteDialog.id);
      setAccounts(updatedAccounts);

      setSnackbar({
        open: true,
        message: 'Bank account deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting bank account:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete bank account',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, id: null });
    }
  }, [accounts, deleteDialog.id]);

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
      bankName: '',
      branchName: '',
      accountTitle: '',
      status: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(accounts.map((a) => a.companyName).filter(Boolean));
    return Array.from(names);
  }, [accounts]);

  const bankNames = useMemo(() => {
    const names = new Set(accounts.map((a) => a.bankName).filter(Boolean));
    return Array.from(names);
  }, [accounts]);

  const branchNames = useMemo(() => {
    const names = new Set(accounts.map((a) => a.branchName).filter(Boolean));
    return Array.from(names);
  }, [accounts]);

  const accountTitles = useMemo(() => {
    const titles = new Set(accounts.map((a) => a.accountTitle).filter(Boolean));
    return Array.from(titles);
  }, [accounts]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Bank Accounts</Typography>
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
          Bank Accounts
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
          onClick={handleAddAccount}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Bank Account
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

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Bank Name</InputLabel>
            <Select
              value={filters.bankName}
              onChange={(e) => setFilters({ ...filters, bankName: e.target.value })}
              label="Bank Name"
            >
              <MenuItem value="">All</MenuItem>
              {bankNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Branch name</InputLabel>
            <Select
              value={filters.branchName}
              onChange={(e) => setFilters({ ...filters, branchName: e.target.value })}
              label="Branch name"
            >
              <MenuItem value="">All</MenuItem>
              {branchNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Account Title</InputLabel>
            <Select
              value={filters.accountTitle}
              onChange={(e) => setFilters({ ...filters, accountTitle: e.target.value })}
              label="Account Title"
            >
              <MenuItem value="">All</MenuItem>
              {accountTitles.map((title) => (
                <MenuItem key={title} value={title}>{title}</MenuItem>
              ))}
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
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
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
          <Table aria-label="Bank accounts list">
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
                  aria-sort={orderBy === 'bankName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'bankName'}
                    direction={orderBy === 'bankName' ? order : 'asc'}
                    onClick={() => handleSort('bankName')}
                  >
                    Bank Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'branchName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'branchName'}
                    direction={orderBy === 'branchName' ? order : 'asc'}
                    onClick={() => handleSort('branchName')}
                  >
                    Branch Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'accountTitle' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'accountTitle'}
                    direction={orderBy === 'accountTitle' ? order : 'asc'}
                    onClick={() => handleSort('accountTitle')}
                  >
                    Account Title
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'accountNumber' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'accountNumber'}
                    direction={orderBy === 'accountNumber' ? order : 'asc'}
                    onClick={() => handleSort('accountNumber')}
                  >
                    Account Number
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
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No bank accounts found. Click "Add Bank Account" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.companyName}</TableCell>
                    <TableCell>{account.bankName}</TableCell>
                    <TableCell>{account.branchName}</TableCell>
                    <TableCell>{account.accountTitle}</TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={account.status}
                        size="small"
                        sx={{
                          bgcolor: account.status === 'Active'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          color: account.status === 'Active' ? '#10B981' : '#EF4444',
                          fontWeight: 500,
                          border: `1px solid ${account.status === 'Active' ? '#10B981' : '#EF4444'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAccount(account.id)}
                        sx={{ color: '#10B981' }}
                        aria-label={`Edit ${account.accountTitle}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(account.id)}
                        sx={{ color: COLORS.error }}
                        disabled={isDeleting}
                        aria-label={`Delete ${account.accountTitle}`}
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
        title="Delete Bank Account"
        message="Are you sure you want to delete this bank account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BankAccountListPage;
