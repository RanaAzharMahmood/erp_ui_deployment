import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TableSortLabel,
  Typography,
  Avatar,
  FormControl,
  Alert,
  Snackbar,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useDebounce } from '../../../hooks/useDebounce';
import { useCompanies } from '../../../hooks';
import { preloadRoute } from '../../../utils/routePreloader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import FilterManager, { type FilterField } from '../../../components/common/FilterManager';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { getUsersApi } from '../../../generated/api/client';
import type { User as ApiUser } from '../../../generated/api/api';
import type { User } from '../../../types/common.types';

// API response type for users list
interface UsersApiResponse {
  data: ApiUser[];
}

const USER_ROLES = ['Admin', 'Manager', 'Accountant', 'User'];
const STATUSES = ['Active', 'Inactive'];

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [orderBy, setOrderBy] = useState<string>('fullName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Get companies from hook with refetch capability
  const { companies: companiesData, refetch: refetchCompanies } = useCompanies();
  const companies = companiesData.map((c) => ({ id: c.id, name: c.name }));

  // Refetch companies when component mounts to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  const filterOpen = Boolean(filterAnchorEl);

  // Load users from API
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const usersApi = getUsersApi();
      const { data: response } = await usersApi.v1ApiUsersGet();

      // Transform API response to match our local interface
      const apiResponse = response as unknown as UsersApiResponse;
      const transformedUsers: User[] = apiResponse.data.map((user: ApiUser) => ({
        id: String(user.id!),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`,
        email: user.email || '',
        phone: user.phone || '',
        cnic: '',
        about: '',
        imageUrl: '',
        status: user.isActive ? 'Active' : 'Inactive',
        roleId: user.roleId || 0,
        roleName: user.roleName || 'User',
        companyAccess: (user.companies || []).map((company) => ({
          companyId: company.id || 0,
          companyName: company.name || '',
          roleId: user.roleId || 0,
          roleName: user.roleName || 'User',
          permissions: [],
        })),
        createdAt: new Date().toISOString(),
      }));

      setUsers(transformedUsers);
    } catch (err: unknown) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Get current user ID - returns default for filter manager
  // const getCurrentUserId = useCallback(() => {
  //   return 1; // Default user ID
  // }, []);

  // Handle applying saved filter
  useEffect(() => {
    const handleApplySavedFilter = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { values } = customEvent.detail;
      setSelectedCompany(values.company || '');
      setSelectedRole(values.role || '');
      setSelectedStatus(values.status || '');
      setPage(0);
    };

    window.addEventListener('applySavedFilter', handleApplySavedFilter);
    return () => {
      window.removeEventListener('applySavedFilter', handleApplySavedFilter);
    };
  }, []);

  // Sort handler
  const handleSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Memoized filtered and sorted users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCompany =
        !selectedCompany ||
        user.companyAccess.some((access) => access.companyName === selectedCompany);

      const matchesRole = !selectedRole || (user.roleName && user.roleName === selectedRole);

      const matchesStatus = !selectedStatus || user.status === selectedStatus;

      return matchesSearch && matchesCompany && matchesRole && matchesStatus;
    });

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'fullName':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'roleName':
          aValue = (a.roleName || '').toLowerCase();
          bValue = (b.roleName || '').toLowerCase();
          break;
        case 'companies':
          aValue = a.companyAccess.length;
          bValue = b.companyAccess.length;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, debouncedSearch, selectedCompany, selectedRole, selectedStatus, orderBy, order]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // Memoized handlers
  const handleAddUser = useCallback(() => {
    navigate('/users/add');
  }, [navigate]);

  const handleEditUser = useCallback(
    (id: string) => {
      navigate(`/users/edit/${id}`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.id) {
      setDeleteDialog({ open: false, id: null });
      return;
    }

    try {
      const usersApi = getUsersApi();
      await usersApi.v1ApiUsersIdDelete(Number(deleteDialog.id));

      // Remove from local state
      setUsers((prev) => prev.filter((user) => user.id !== deleteDialog.id));

      setSuccessMessage('User deleted successfully!');
    } catch (err: unknown) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
    setDeleteDialog({ open: false, id: null });
  }, [deleteDialog.id]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCompany('');
    setSelectedRole('');
    setSelectedStatus('');
    setPage(0);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setPage(0);
  }, []);

  // Define filter fields for FilterManager
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        name: 'company' as const,
        label: 'Company Name',
        value: selectedCompany,
        component: (
          <FormControl fullWidth size="small">
            <Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Company</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.name}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },
      {
        name: 'role' as const,
        label: 'User Role',
        value: selectedRole,
        component: (
          <FormControl fullWidth size="small">
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Role</MenuItem>
              {USER_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },
      {
        name: 'status' as const,
        label: 'Status',
        value: selectedStatus,
        component: (
          <FormControl fullWidth size="small">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Status</MenuItem>
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },
    ],
    [selectedCompany, selectedRole, selectedStatus, companies]
  );

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Preload add user page on hover
  useEffect(() => {
    preloadRoute('/users/add');
  }, []);

  // Get status chip color
  const getStatusColor = (
    status: string
  ): 'success' | 'default' | 'error' | 'warning' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Filter, Search, and Add Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            sx={{
              textTransform: 'none',
              borderColor: '#E0E0E0',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#BDBDBD',
                bgcolor: 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            Filter
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <TextField
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.primaryHover },
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Filter Manager */}
      <FilterManager
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        fields={filterFields}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <Card sx={{ boxShadow: 1 }}>
        <TableContainer>
          <Table aria-label="Users list">
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
              <TableRow>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'fullName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'fullName'}
                    direction={orderBy === 'fullName' ? order : 'asc'}
                    onClick={() => handleSort('fullName')}
                  >
                    User
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
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
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'roleName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'roleName'}
                    direction={orderBy === 'roleName' ? order : 'asc'}
                    onClick={() => handleSort('roleName')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  aria-sort={orderBy === 'companies' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'companies'}
                    direction={orderBy === 'companies' ? order : 'asc'}
                    onClick={() => handleSort('companies')}
                  >
                    Companies
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
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
                  align="right"
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No users found. Try adjusting your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={user.imageUrl}
                          alt={user.fullName}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {user.fullName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {user.phone || 'No phone'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {user.roleName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem' }}>
                        {user.companyAccess.length === 0
                          ? 'No companies'
                          : user.companyAccess.length === 1
                          ? user.companyAccess[0].companyName
                          : `${user.companyAccess.length} companies`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status)}
                        sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user.id)}
                        sx={{ color: '#4CAF50', mr: 1 }}
                        aria-label={`Edit ${user.fullName}`}
                      >
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(user.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete ${user.fullName}`}
                      >
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!isLoading && filteredUsers.length > 0 && (
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #E0E0E0' }}
            aria-label="Users table pagination"
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
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default UsersPage;
