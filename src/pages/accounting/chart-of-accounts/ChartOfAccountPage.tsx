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
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Collapse,
  Snackbar,
  Alert,
  TableSortLabel,
  Drawer,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  GridOn as GridIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import PageError from '../../../components/common/PageError';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { exportToCsv } from '../../../utils/csvExport';
import { COLORS } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useCompany } from '../../../contexts/CompanyContext';
import {
  getChartOfAccountsApi,
  ChartOfAccount as ApiChartOfAccount,
  AccountType as ApiAccountType,
  getCompaniesApi,
  AccountLedger,
} from '../../../generated/api/client';

// Map API account type to display type
const ACCOUNT_TYPE_MAP: Record<ApiAccountType | 'cost_of_sales', 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Cost of Sales' | 'Expenses'> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  cost_of_sales: 'Cost of Sales',
  expense: 'Expenses',
};

// Reverse map for API calls
const DISPLAY_TYPE_TO_API: Record<string, ApiAccountType | 'cost_of_sales'> = {
  Assets: 'asset',
  Liabilities: 'liability',
  Equity: 'equity',
  Revenue: 'revenue',
  'Cost of Sales': 'cost_of_sales',
  Expenses: 'expense',
};

interface Account {
  id: number;
  code: string;
  name: string;
  systemName: string;
  parentId: number | null;
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Cost of Sales' | 'Expenses';
  balance: number;
  openingBalance: number;
  companyId: number;
  companyName: string;
  isSystemAccount: boolean;
  isActive: boolean;
  createdAt: string;
  children?: Account[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

type Order = 'asc' | 'desc';
type AccountOrderBy = 'code' | 'name' | 'systemName' | 'balance';

// Map API response to internal format
const mapApiToInternal = (account: ApiChartOfAccount, companyName: string = ''): Account => ({
  id: account.id,
  code: account.accountCode,
  name: account.accountName,
  systemName: account.accountName,
  parentId: account.parentId ?? null,
  accountType: ACCOUNT_TYPE_MAP[account.accountType],
  balance: account.currentBalance,
  openingBalance: account.openingBalance,
  companyId: account.companyId,
  companyName,
  isSystemAccount: account.isSystemAccount,
  isActive: account.isActive,
  createdAt: account.createdAt,
  children: account.children?.map((child) => mapApiToInternal(child, companyName)),
});

const ChartOfAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hierarchyAccounts, setHierarchyAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>(
    !isAdmin && selectedCompany ? selectedCompany.id : ''
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; isSystemAccount: boolean }>({
    open: false,
    id: null,
    isSystemAccount: false,
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Ledger drawer state
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<AccountLedger | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const handleViewLedger = useCallback(async (accountId: number) => {
    setLedgerOpen(true);
    setLedgerLoading(true);
    setLedgerError(null);
    setLedgerData(null);
    try {
      const api = getChartOfAccountsApi();
      const response = await api.getAccountLedger(accountId);
      if (response.success && response.data) {
        setLedgerData(response.data);
      } else {
        setLedgerError('Failed to load ledger');
      }
    } catch (err) {
      console.error('Error loading account ledger:', err);
      setLedgerError(err instanceof Error ? err.message : 'Failed to load ledger');
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  // Sorting state
  const [orderBy, setOrderBy] = useState<AccountOrderBy>('code');
  const [order, setOrder] = useState<Order>('asc');

  const tabs = ['All', 'Asset', 'Equity', 'Expenses', 'Liabilities', 'Revenue', 'Cost of Sales'];

  // Load companies (admin only — non-admins are scoped to their selected company)
  const loadCompanies = useCallback(async () => {
    if (!isAdmin) {
      // Non-admins: use the selected company from context
      if (selectedCompany) {
        setCompanies([{ id: selectedCompany.id, name: selectedCompany.name }]);
      }
      return;
    }

    try {
      const companiesApi = getCompaniesApi();
      const response = await companiesApi.v1ApiCompaniesGet();
      if (response.data) {
        // Handle both name and companyName from API response
        const mappedCompanies = response.data.map((c: any) => ({
          id: c.id,
          name: c.name || c.companyName || '',
        }));
        setCompanies(mappedCompanies);
        // Set first company as default if available
        if (mappedCompanies.length > 0 && selectedCompanyId === '') {
          setSelectedCompanyId(mappedCompanies[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load companies. Please try again.',
        severity: 'error',
      });
    }
  }, [selectedCompanyId, isAdmin, selectedCompany]);

  // Load accounts from API
  const loadAccounts = useCallback(async () => {
    if (!selectedCompanyId) return;

    setLoading(true);
    setLoadError(null);
    try {
      const chartOfAccountsApi = getChartOfAccountsApi();
      const companyName = companies.find((c) => c.id === selectedCompanyId)?.name || '';

      // Load flat list of accounts
      const response = await chartOfAccountsApi.getAllAccounts({
        companyId: selectedCompanyId,
      });

      if (response.data) {
        const mappedAccounts = response.data.map((account) => mapApiToInternal(account, companyName));
        setAccounts(mappedAccounts);
      }

      // Load hierarchy for tree view
      const hierarchyResponse = await chartOfAccountsApi.getAccountHierarchy(selectedCompanyId);
      if (hierarchyResponse.data) {
        const mappedHierarchy = hierarchyResponse.data.map((account) => mapApiToInternal(account, companyName));
        setHierarchyAccounts(mappedHierarchy);
        // Expand all root accounts by default
        const rootIds = new Set(mappedHierarchy.map((a) => a.id));
        setExpandedSections(rootIds);
      }
    } catch (error: any) {
      console.error('Error loading chart of accounts:', error);
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, companies]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadAccounts();
    }
  }, [selectedCompanyId, loadAccounts]);

  // Handle sort
  const handleSort = useCallback((property: AccountOrderBy) => {
    setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(property);
  }, [orderBy]);

  const handleAddAccount = useCallback(() => {
    navigate('/account/chart-of-account/add');
  }, [navigate]);

  const handleEditAccount = useCallback((id: number) => {
    navigate(`/account/chart-of-account/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: number, isSystemAccount: boolean) => {
    if (isSystemAccount) {
      setSnackbar({
        open: true,
        message: 'System accounts cannot be deleted.',
        severity: 'warning',
      });
      return;
    }
    setDeleteDialog({ open: true, id, isSystemAccount });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.id) return;

    setIsDeleting(true);
    try {
      const chartOfAccountsApi = getChartOfAccountsApi();
      await chartOfAccountsApi.deleteAccount(deleteDialog.id);

      // Reload accounts after deletion
      await loadAccounts();

      setSnackbar({
        open: true,
        message: 'Account deleted successfully.',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete account. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, id: null, isSystemAccount: false });
    }
  }, [deleteDialog.id, loadAccounts]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null, isSystemAccount: false });
  }, []);

  const toggleSection = useCallback((id: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Filter accounts by tab
  const getFilteredAccountType = useCallback((): 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Cost of Sales' | 'Expenses' | null => {
    switch (selectedTab) {
      case 1: return 'Assets';
      case 2: return 'Equity';
      case 3: return 'Expenses';
      case 4: return 'Liabilities';
      case 5: return 'Revenue';
      case 6: return 'Cost of Sales';
      default: return null;
    }
  }, [selectedTab]);

  const filteredAccounts = useMemo(() => {
    const accountType = getFilteredAccountType();
    return accounts.filter((account) => {
      const matchesSearch =
        !searchTerm ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !accountType || account.accountType === accountType;
      const matchesActive = account.isActive;

      return matchesSearch && matchesType && matchesActive;
    });
  }, [accounts, searchTerm, getFilteredAccountType]);

  // Filter hierarchy accounts
  const filteredHierarchy = useMemo(() => {
    const accountType = getFilteredAccountType();
    if (!accountType) return hierarchyAccounts;

    return hierarchyAccounts.filter((account) => account.accountType === accountType);
  }, [hierarchyAccounts, getFilteredAccountType]);

  // Sort accounts within each type
  const sortAccounts = useCallback((accountsToSort: Account[]): Account[] => {
    return [...accountsToSort].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'code':
          aValue = a.code || '';
          bValue = b.code || '';
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'systemName':
          aValue = a.systemName || '';
          bValue = b.systemName || '';
          break;
        case 'balance':
          aValue = a.balance;
          bValue = b.balance;
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
  }, [orderBy, order]);

  // Group accounts by type for display
  const accountsByType = useMemo(() => {
    const groups: Record<string, Account[]> = {
      Assets: [],
      Liabilities: [],
      Equity: [],
      Revenue: [],
      'Cost of Sales': [],
      Expenses: [],
    };

    filteredHierarchy.forEach((account) => {
      if (groups[account.accountType]) {
        groups[account.accountType].push(account);
      }
    });

    // Sort each group
    Object.keys(groups).forEach((type) => {
      groups[type] = sortAccounts(groups[type]);
    });

    return groups;
  }, [filteredHierarchy, sortAccounts]);

  // Calculate totals by account type
  const calculateTypeTotal = useCallback((type: string) => {
    return filteredAccounts
      .filter((a) => a.accountType === type)
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [filteredAccounts]);

  // Calculate account total including children
  const calculateAccountTotal = useCallback((account: Account): number => {
    let total = account.balance || 0;
    if (account.children) {
      account.children.forEach((child) => {
        total += calculateAccountTotal(child);
      });
    }
    return total;
  }, []);

  const renderAccountRow = (account: Account, depth: number = 0) => {
    const isExpanded = expandedSections.has(account.id);
    const hasChildren = account.children && account.children.length > 0;
    const total = calculateAccountTotal(account);

    return (
      <React.Fragment key={account.id}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: '1px solid #E5E7EB',
            bgcolor: depth === 0 ? '#FAFAFA' : 'white',
            cursor: hasChildren ? 'pointer' : 'default',
            '&:hover': { bgcolor: '#F5F5F5' },
          }}
          onClick={() => hasChildren && toggleSection(account.id)}
        >
          <Box sx={{ width: '15%', display: 'flex', alignItems: 'center', pl: depth * 3 }}>
            {hasChildren && (
              isExpanded ? <ExpandLessIcon fontSize="small" sx={{ mr: 1 }} /> : <ExpandMoreIcon fontSize="small" sx={{ mr: 1 }} />
            )}
            <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
              {account.code}
            </Typography>
          </Box>
          <Typography sx={{ width: '25%', fontWeight: depth === 0 ? 500 : 400, fontSize: '14px' }}>
            {account.name}
          </Typography>
          <Typography sx={{ width: '20%', color: COLORS.primary, fontSize: '14px' }}>
            {account.systemName}
          </Typography>
          <Typography sx={{ width: '20%', fontSize: '14px', textAlign: 'right' }}>
            {total.toLocaleString()} PKR
          </Typography>
          <Box sx={{ width: '20%', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {depth === 0 && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/account/chart-of-account/add?parent=${account.id}&type=${DISPLAY_TYPE_TO_API[account.accountType]}`);
                }}
                sx={{
                  color: COLORS.primary,
                  textTransform: 'none',
                  fontSize: '12px',
                }}
                aria-label={`Add sub-account under ${account.name}`}
              >
                Add Account
              </Button>
            )}
            <IconButton
              size="small"
              sx={{ color: '#6B7280' }}
              aria-label={`View ledger for ${account.name}`}
              title="View ledger"
              onClick={(e) => {
                e.stopPropagation();
                handleViewLedger(account.id);
              }}
            >
              <DescriptionIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditAccount(account.id);
              }}
              sx={{ color: '#6B7280' }}
              aria-label={`Edit ${account.name}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(account.id, account.isSystemAccount);
              }}
              sx={{ color: account.isSystemAccount ? '#D1D5DB' : COLORS.error }}
              disabled={account.isSystemAccount || isDeleting}
              aria-label={`Delete ${account.name}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Render children */}
        {hasChildren && (
          <Collapse in={isExpanded}>
            {account.children!.map((child) => renderAccountRow(child, depth + 1))}
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const renderAccountTypeSection = (type: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Cost of Sales' | 'Expenses') => {
    const typeAccounts = accountsByType[type] || [];
    const total = calculateTypeTotal(type);

    if (typeAccounts.length === 0 && selectedTab !== 0) {
      return null;
    }

    return (
      <Box key={type} sx={{ mb: 2 }}>
        {/* Type Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 2,
            px: 2,
            borderBottom: '2px solid #E5E7EB',
            bgcolor: '#F3F4F6',
          }}
        >
          <Typography sx={{ width: '60%', fontWeight: 600, fontSize: '16px' }}>
            {type === 'Expenses' ? 'Expense' : type}
          </Typography>
          <Typography sx={{ width: '20%', fontWeight: 600, fontSize: '16px', textAlign: 'right' }}>
            {total.toLocaleString()} PKR
          </Typography>
          <Box sx={{ width: '20%' }}></Box>
        </Box>

        {/* Accounts */}
        {typeAccounts.length > 0 ? (
          typeAccounts.map((account) => renderAccountRow(account))
        ) : (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontSize: '14px' }}>
              No accounts found in this category.
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/account/chart-of-account/add?type=${DISPLAY_TYPE_TO_API[type]}`)}
              sx={{ mt: 1, color: COLORS.primary, textTransform: 'none' }}
            >
              Add {type === 'Expenses' ? 'Expense' : type} Account
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Chart of Account</Typography>
        <Table>
          <TableBody>
            <TableSkeleton rows={10} columns={5} />
          </TableBody>
        </Table>
      </Box>
    );
  }

  if (loadError) {
    return <PageError error={loadError} onRetry={loadAccounts} />;
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chart of Account
        </Typography>
      </Box>

      {/* Toolbar */}
      <Card sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {isAdmin && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value as number)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="" disabled>Select Company</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

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
          onClick={() => exportToCsv('chart-of-accounts', filteredAccounts, [
            { header: 'Code', value: 'code' },
            { header: 'Name', value: 'name' },
            { header: 'Account Type', value: 'accountType' },
            { header: 'Balance', value: 'balance' },
            { header: 'Opening Balance', value: 'openingBalance' },
            { header: 'Company', value: 'companyName' },
            { header: 'Status', value: (a) => (a.isActive ? 'Active' : 'Inactive') },
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
            bgcolor: COLORS.primary,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.primaryHover },
          }}
        >
          Add Account
        </Button>
      </Card>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 100,
              fontWeight: 500,
            },
            '& .Mui-selected': {
              bgcolor: COLORS.primary,
              color: 'white !important',
              borderRadius: '4px 4px 0 0',
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Table Header */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: '2px solid #E5E7EB',
            bgcolor: '#F9FAFB',
          }}
        >
          <Box sx={{ width: '15%' }}>
            <TableSortLabel
              active={orderBy === 'code'}
              direction={orderBy === 'code' ? order : 'asc'}
              onClick={() => handleSort('code')}
              sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}
            >
              Code
            </TableSortLabel>
          </Box>
          <Box sx={{ width: '25%' }}>
            <TableSortLabel
              active={orderBy === 'name'}
              direction={orderBy === 'name' ? order : 'asc'}
              onClick={() => handleSort('name')}
              sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}
            >
              Name
            </TableSortLabel>
          </Box>
          <Box sx={{ width: '20%' }}>
            <TableSortLabel
              active={orderBy === 'systemName'}
              direction={orderBy === 'systemName' ? order : 'asc'}
              onClick={() => handleSort('systemName')}
              sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}
            >
              System Name
            </TableSortLabel>
          </Box>
          <Box sx={{ width: '20%', textAlign: 'right' }}>
            <TableSortLabel
              active={orderBy === 'balance'}
              direction={orderBy === 'balance' ? order : 'asc'}
              onClick={() => handleSort('balance')}
              sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}
            >
              Balance
            </TableSortLabel>
          </Box>
          <Typography sx={{ width: '20%', fontWeight: 600, fontSize: '14px', color: '#374151', textAlign: 'right' }}>
            Actions
          </Typography>
        </Box>

        {/* Account Sections */}
        {!selectedCompanyId ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Please select a company to view chart of accounts.
            </Typography>
          </Box>
        ) : selectedTab === 0 ? (
          <>
            {renderAccountTypeSection('Assets')}
            {renderAccountTypeSection('Liabilities')}
            {renderAccountTypeSection('Equity')}
            {renderAccountTypeSection('Revenue')}
            {renderAccountTypeSection('Cost of Sales')}
            {renderAccountTypeSection('Expenses')}
          </>
        ) : (
          renderAccountTypeSection(
            selectedTab === 1 ? 'Assets' :
            selectedTab === 2 ? 'Equity' :
            selectedTab === 3 ? 'Expenses' :
            selectedTab === 4 ? 'Liabilities' : 'Revenue'
          )
        )}
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action will mark the account as inactive."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Account ledger drawer — opened from the document icon on each row */}
      <Drawer
        anchor="right"
        open={ledgerOpen}
        onClose={() => setLedgerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 720 } } }}
      >
        <Box sx={{ p: 3 }}>
          {ledgerLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : ledgerError ? (
            <Alert severity="error" sx={{ mt: 2 }}>{ledgerError}</Alert>
          ) : ledgerData ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {ledgerData.account.accountCode} — {ledgerData.account.accountName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Opening balance: {Number(ledgerData.account.openingBalance).toFixed(2)} PKR
                &nbsp;·&nbsp; Current balance: {Number(ledgerData.account.currentBalance).toFixed(2)} PKR
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {ledgerData.lines.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No posted transactions for this account yet.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Entry #</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Debit</TableCell>
                        <TableCell align="right">Credit</TableCell>
                        <TableCell align="right">Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ledgerData.lines.map((line) => (
                        <TableRow key={line.id} hover>
                          <TableCell>{new Date(line.date).toLocaleDateString()}</TableCell>
                          <TableCell>{line.entryNumber}</TableCell>
                          <TableCell>{line.description || line.reference || '—'}</TableCell>
                          <TableCell align="right">
                            {line.debit > 0 ? line.debit.toFixed(2) : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {line.credit > 0 ? line.credit.toFixed(2) : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {Number(line.runningBalance).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          ) : null}
        </Box>
      </Drawer>
    </Box>
  );
};

export default ChartOfAccountPage;
