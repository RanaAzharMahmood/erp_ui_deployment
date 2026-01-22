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
import { customerApi, CustomerData } from '../../../services/customerApi';
import { useCompanies } from '../../../hooks';

// Interface for frontend customer display (maps API data to display format)
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  creditLimit: number;
  paymentTerms: string;
  notes: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const STATUSES = ['All', 'Active', 'Inactive'];

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const { companies, refetch: refetchCompanies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState('');

  // Transform API customer data to frontend format
  const transformCustomerData = (apiCustomer: CustomerData): Customer => ({
    id: String(apiCustomer.id),
    name: apiCustomer.name,
    email: apiCustomer.email,
    phone: apiCustomer.phone || '',
    companyName: apiCustomer.companyName || '',
    companyId: apiCustomer.companyId,
    address: apiCustomer.address || '',
    city: apiCustomer.city || '',
    state: apiCustomer.state || '',
    country: apiCustomer.country || '',
    postalCode: apiCustomer.postalCode || '',
    taxId: apiCustomer.taxId || '',
    creditLimit: apiCustomer.creditLimit || 0,
    paymentTerms: apiCustomer.paymentTerms || '',
    notes: apiCustomer.notes || '',
    status: apiCustomer.isActive ? 'Active' : 'Inactive',
    createdAt: apiCustomer.createdAt,
  });

  // Load customers from API
  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await customerApi.getCustomers();
      const transformedCustomers = response.data.data.map(transformCustomerData);
      setCustomers(transformedCustomers);

      // Also save to localStorage as backup
      localStorage.setItem('customers', JSON.stringify(transformedCustomers));
    } catch (err: unknown) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers. Loading from local storage...');

      // Fallback to localStorage
      const savedCustomers = localStorage.getItem('customers');
      if (savedCustomers) {
        try {
          setCustomers(JSON.parse(savedCustomers));
        } catch {
          setCustomers([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Sort handler
  const handleSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.companyName.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCompany) {
      filtered = filtered.filter(
        (customer) => String(customer.companyId) === selectedCompany
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((customer) => customer.status === selectedStatus);
    }

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'companyName':
          aValue = a.companyName.toLowerCase();
          bValue = b.companyName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
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
  }, [customers, searchTerm, selectedCompany, selectedStatus, orderBy, order]);

  // Paginated customers
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredCustomers, page, rowsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedCompany, selectedStatus]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.id) {
      setDeleteDialog({ open: false, id: null });
      return;
    }

    try {
      await customerApi.deleteCustomer(Number(deleteDialog.id));

      // Remove from local state
      setCustomers((prev) => prev.filter((customer) => customer.id !== deleteDialog.id));

      // Update localStorage
      const updatedCustomers = customers.filter((customer) => customer.id !== deleteDialog.id);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));

      setSuccessMessage('Customer deleted successfully!');
    } catch (err: unknown) {
      console.error('Error deleting customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer. Please try again.';
      setError(errorMessage);
    }
    setDeleteDialog({ open: false, id: null });
  }, [customers, deleteDialog.id]);

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

  // Refetch companies when component mounts to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

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
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customer/add')}
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
          Add Customer
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Company</InputLabel>
          <Select
            value={selectedCompany}
            label="Select Company"
            onChange={(e: SelectChangeEvent) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value="">All Companies</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={String(company.id)}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e: SelectChangeEvent) => setSelectedStatus(e.target.value)}
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
          placeholder="Search by name, email or company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          <Table aria-label="Customers list">
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
                    Customer Name
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
                <TableSkeleton rows={5} columns={6} />
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No customers found. Try adjusting your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.phone || 'No phone'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.companyName || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status}
                        size="small"
                        color={customer.status === 'Active' ? 'success' : 'default'}
                        sx={{
                          fontWeight: 500,
                          borderRadius: '16px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(customer.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/customer/update/${customer.id}`)}
                        sx={{ mr: 1, color: '#4CAF50' }}
                        aria-label={`Edit ${customer.name}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(customer.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete ${customer.name}`}
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
        {!isLoading && filteredCustomers.length > 0 && (
          <TablePagination
            component="div"
            count={filteredCustomers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #E0E0E0' }}
            aria-label="Customers table pagination"
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default CustomersPage;
