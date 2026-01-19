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
import { preloadRoute } from '../../../utils/routePreloader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import FilterManager, { type FilterField } from '../../../components/common/FilterManager';
import { getUsersApi } from '../../../generated/api/client';
import type { User as ApiUser } from '../../../generated/api/api';
import type { User } from '../../../types/common.types';

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
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filterOpen = Boolean(filterAnchorEl);

  // Load users from API
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const usersApi = getUsersApi();
      const response = await usersApi.v1ApiUsersGet();

      // Transform API response to match our local interface
      const transformedUsers: User[] = (response as any).data.map((user: ApiUser) => ({
        id: String(user.id!),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '',
        cnic: '',
        about: '',
        imageUrl: '',
        status: user.isActive ? 'Active' : 'Inactive',
        roleId: user.roleId,
        roleName: user.roleName || 'User',
        companyAccess: (user.companies || []).map((company) => ({
          companyId: company.id!,
          companyName: company.name!,
          roleId: user.roleId || 0,
          roleName: user.roleName || 'User',
          permissions: [],
        })),
        createdAt: new Date().toISOString(),
      }));

      setUsers(transformedUsers);

      // Also save to localStorage as backup
      localStorage.setItem('users', JSON.stringify(transformedUsers));
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Loading from local storage...');

      // Fallback to localStorage
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load companies for filter
  const loadCompanies = useCallback(async () => {
    try {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsed = JSON.parse(savedCompanies);
        setCompanies(parsed.map((c: any) => ({ id: c.id, name: c.companyName })));
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadCompanies();
  }, [loadUsers, loadCompanies]);

  // Get current user ID
  const getCurrentUserId = useCallback(() => {
    try {
      const userStr = localStorage.getItem('erp_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (err) {
      console.error('Error getting user ID:', err);
    }
    return 1; // Default fallback
  }, []);

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

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCompany =
        !selectedCompany ||
        user.companyAccess.some((access) => access.companyName === selectedCompany);

      const matchesRole = !selectedRole || user.roleName === selectedRole;

      const matchesStatus = !selectedStatus || user.status === selectedStatus;

      return matchesSearch && matchesCompany && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearch, selectedCompany, selectedRole, selectedStatus]);

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

  const handleDeleteUser = useCallback(
    async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

      try {
        const usersApi = getUsersApi();
        await usersApi.v1ApiUsersIdDelete(Number(id));

        // Remove from local state
        setUsers((prev) => prev.filter((user) => user.id !== id));

        // Update localStorage
        const updatedUsers = users.filter((user) => user.id !== id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        setSuccessMessage('User deleted successfully!');
      } catch (err: any) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    },
    [users]
  );

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
        name: 'company',
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
        name: 'role',
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
        name: 'status',
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
              bgcolor: '#FF6B35',
              '&:hover': { bgcolor: '#E55A2B' },
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
        pageKey="users"
        userId={getCurrentUserId()}
      />

      {/* Table */}
      <Card sx={{ boxShadow: 1 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  User
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Companies
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Status
                </TableCell>
                <TableCell
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
                      >
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        sx={{ color: '#EF5350' }}
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
    </Box>
  );
};

export default UsersPage;
