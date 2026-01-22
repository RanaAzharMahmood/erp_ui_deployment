import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { useDebounce } from '../../../hooks/useDebounce';
import { vendorService, type Vendor } from '../../../services';

const STATUSES = ['All', 'Active', 'Inactive'];

const VendorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load vendors from API
  const loadVendors = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const filters: {
        isActive?: boolean;
        search?: string;
        limit: number;
        offset: number;
      } = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };

      if (selectedStatus !== 'All') {
        filters.isActive = selectedStatus === 'Active';
      }

      if (debouncedSearch) {
        filters.search = debouncedSearch;
      }

      const response = await vendorService.getAll(filters);

      setVendors(response.data);
      setTotalCount(response.pagination.total);

      // Save to localStorage as backup
      localStorage.setItem('vendors', JSON.stringify(response.data));
    } catch (err: unknown) {
      console.error('Error loading vendors:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vendors';
      setError(`${errorMessage}. Loading from local storage...`);

      // Fallback to localStorage
      const savedVendors = localStorage.getItem('vendors');
      if (savedVendors) {
        const parsedVendors = JSON.parse(savedVendors);
        setVendors(parsedVendors);
        setTotalCount(parsedVendors.length);
      } else {
        // Initialize with empty array
        setVendors([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedStatus, page, rowsPerPage]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  // Sort handler
  const handleSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Memoized filtered and sorted vendors for client-side filtering when using localStorage fallback
  const filteredVendors = useMemo(() => {
    // Sort the vendors
    const sorted = [...vendors].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        case 'city':
          aValue = (a.city || '').toLowerCase();
          bValue = (b.city || '').toLowerCase();
          break;
        case 'status':
          aValue = a.isActive ? 'Active' : 'Inactive';
          bValue = b.isActive ? 'Active' : 'Inactive';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [vendors, orderBy, order]);

  // Paginated vendors - for client-side pagination when using localStorage fallback
  const paginatedVendors = useMemo(() => {
    // When using API, pagination is handled server-side
    return filteredVendors;
  }, [filteredVendors]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      try {
        await vendorService.delete(deleteDialog.id);

        // Update local state
        const updatedVendors = vendors.filter((vendor) => vendor.id !== deleteDialog.id);
        setVendors(updatedVendors);
        setTotalCount((prev) => prev - 1);
        localStorage.setItem('vendors', JSON.stringify(updatedVendors));

        setSuccessMessage('Vendor deleted successfully');
      } catch (err: unknown) {
        console.error('Error deleting vendor:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendor';
        setError(errorMessage);
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [vendors, deleteDialog.id]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusFromIsActive = (isActive: boolean): string => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Vendors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vendor/add')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            bgcolor: COLORS.primary,
            '&:hover': {
              bgcolor: COLORS.primaryHover,
            },
          }}
        >
          Add Vendor
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e: SelectChangeEvent) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
          >
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 300, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table aria-label="Vendors list">
            <TableHead>
              <TableRow>
                <TableCell
                  scope="col"
                  aria-sort={orderBy === 'name' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Vendor Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  aria-sort={orderBy === 'email' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  aria-sort={orderBy === 'phone' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'phone'}
                    direction={orderBy === 'phone' ? order : 'asc'}
                    onClick={() => handleSort('phone')}
                  >
                    Phone
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  aria-sort={orderBy === 'city' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'city'}
                    direction={orderBy === 'city' ? order : 'asc'}
                    onClick={() => handleSort('city')}
                  >
                    City
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
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
                  aria-sort={orderBy === 'createdAt' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created at
                  </TableSortLabel>
                </TableCell>
                <TableCell scope="col" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No vendors found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVendors.map((vendor) => (
                  <TableRow key={vendor.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {vendor.name}
                        </Typography>
                        {vendor.companyName && (
                          <Typography variant="caption" color="text.secondary">
                            {vendor.companyName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vendor.email || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vendor.phone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vendor.city || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusFromIsActive(vendor.isActive)}
                        size="small"
                        sx={{
                          bgcolor: vendor.isActive
                            ? 'rgba(76, 175, 80, 0.1)'
                            : 'rgba(255, 152, 0, 0.1)',
                          color: vendor.isActive ? 'success.main' : COLORS.warning,
                          fontWeight: 500,
                          borderRadius: '16px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(vendor.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/vendor/update/${vendor.id}`)}
                        sx={{ mr: 1 }}
                        aria-label={`Edit ${vendor.name}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(vendor.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete ${vendor.name}`}
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
            aria-label="Vendors table pagination"
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

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default VendorsPage;
