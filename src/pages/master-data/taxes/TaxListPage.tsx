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
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { taxService, Tax } from '../../../services';

interface LocalTax {
  id: string;
  taxId: string;
  taxName: string;
  taxPercentage: number;
  taxDate?: string;
  note?: string;
  companyId?: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
}

// Transform API Tax to display format
const transformApiTax = (tax: Tax): LocalTax => ({
  id: String(tax.id),
  taxId: tax.code,
  taxName: tax.name,
  taxPercentage: tax.rate,
  note: tax.description,
  companyId: tax.companyId,
  companyName: tax.companyName,
  isActive: tax.isActive,
  createdAt: tax.createdAt,
});

const TaxListPage: React.FC = () => {
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<LocalTax[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    taxId: '',
    taxPercentage: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [orderBy, setOrderBy] = useState<string>('taxName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Load taxes from API with localStorage fallback
  const loadTaxes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taxService.getAll();
      if (response.success && response.data) {
        const transformedTaxes = response.data.map(transformApiTax);
        setTaxes(transformedTaxes);
        // Cache to localStorage for offline access
        localStorage.setItem('taxes', JSON.stringify(transformedTaxes));
      }
    } catch (error) {
      console.error('Error loading taxes from API:', error);
      // Fallback to localStorage
      try {
        const savedTaxes = localStorage.getItem('taxes');
        if (savedTaxes) {
          setTaxes(JSON.parse(savedTaxes));
        }
        setSnackbar({
          open: true,
          message: 'Failed to load from server. Showing cached data.',
          severity: 'error',
        });
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTaxes();
  }, [loadTaxes]);

  // Sort handler
  const handleSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Filter and sort taxes
  const filteredTaxes = useMemo(() => {
    const filtered = taxes.filter((tax) => {
      const matchesSearch =
        !searchTerm ||
        tax.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tax.taxId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || tax.companyName === filters.company;
      const matchesTaxId = !filters.taxId || tax.taxId === filters.taxId;
      const matchesStatus =
        !filters.status ||
        (filters.status === 'Active' && tax.isActive) ||
        (filters.status === 'Inactive' && !tax.isActive);

      return matchesSearch && matchesCompany && matchesTaxId && matchesStatus;
    });

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'taxId':
          aValue = a.taxId.toLowerCase();
          bValue = b.taxId.toLowerCase();
          break;
        case 'taxName':
          aValue = a.taxName.toLowerCase();
          bValue = b.taxName.toLowerCase();
          break;
        case 'taxPercentage':
          aValue = a.taxPercentage;
          bValue = b.taxPercentage;
          break;
        case 'status':
          aValue = a.isActive ? 'Active' : 'Inactive';
          bValue = b.isActive ? 'Active' : 'Inactive';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [taxes, searchTerm, filters, orderBy, order]);

  const handleAddTax = useCallback(() => {
    navigate('/tax/add');
  }, [navigate]);

  const handleEditTax = useCallback((id: string) => {
    navigate(`/tax/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      try {
        await taxService.delete(Number(deleteDialog.id));
        setSnackbar({
          open: true,
          message: 'Tax deleted successfully',
          severity: 'success',
        });
        // Reload taxes after successful delete
        loadTaxes();
      } catch (error) {
        console.error('Error deleting tax:', error);
        // Fallback to localStorage deletion
        const updatedTaxes = taxes.filter((t) => t.id !== deleteDialog.id);
        setTaxes(updatedTaxes);
        localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
        setSnackbar({
          open: true,
          message: 'Tax deleted from local storage (server unavailable)',
          severity: 'error',
        });
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [taxes, deleteDialog.id, loadTaxes]);

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
    setFilters({ company: '', taxId: '', taxPercentage: '', status: '' });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(taxes.map((t) => t.companyName).filter(Boolean));
    return Array.from(names) as string[];
  }, [taxes]);

  const taxIds = useMemo(() => {
    const ids = new Set(taxes.map((t) => t.taxId).filter(Boolean));
    return Array.from(ids) as string[];
  }, [taxes]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Tax</Typography>
        <TableSkeleton rows={5} columns={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tax
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
          onClick={handleAddTax}
          sx={{
            bgcolor: COLORS.primary,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.primaryHover },
          }}
        >
          Add Tax
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
        <Box sx={{ p: 2, width: 300, border: '2px solid #FF6B35', borderRadius: 1 }}>
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
            <InputLabel>Tax Code</InputLabel>
            <Select
              value={filters.taxId}
              onChange={(e) => setFilters({ ...filters, taxId: e.target.value })}
              label="Tax Code"
            >
              <MenuItem value="">All</MenuItem>
              {taxIds.map((id) => (
                <MenuItem key={id} value={id}>{id}</MenuItem>
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
          <Table aria-label="Taxes list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'taxId' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'taxId'}
                    direction={orderBy === 'taxId' ? order : 'asc'}
                    onClick={() => handleSort('taxId')}
                  >
                    Tax Code
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'taxName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'taxName'}
                    direction={orderBy === 'taxName' ? order : 'asc'}
                    onClick={() => handleSort('taxName')}
                  >
                    Tax Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'taxPercentage' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'taxPercentage'}
                    direction={orderBy === 'taxPercentage' ? order : 'asc'}
                    onClick={() => handleSort('taxPercentage')}
                  >
                    Rate %
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
              {filteredTaxes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No taxes found. Click "Add Tax" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTaxes.map((tax) => (
                  <TableRow key={tax.id} hover>
                    <TableCell>{tax.taxId}</TableCell>
                    <TableCell>{tax.taxName}</TableCell>
                    <TableCell>{tax.taxPercentage} %</TableCell>
                    <TableCell>
                      <Chip
                        label={tax.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: tax.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: tax.isActive ? '#10B981' : '#EF4444',
                          fontWeight: 500,
                          border: `1px solid ${tax.isActive ? '#10B981' : '#EF4444'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTax(tax.id)}
                        sx={{ color: '#10B981' }}
                        aria-label={`Edit ${tax.taxName}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(tax.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete ${tax.taxName}`}
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
        title="Delete Tax"
        message="Are you sure you want to delete this tax? This action cannot be undone."
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

export default TaxListPage;
