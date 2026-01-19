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
import LazyImage from '../../../components/common/LazyImage';
import FilterManager, { type FilterField } from '../../../components/common/FilterManager';
import { getCompaniesApi } from '../../../generated/api/client';
import type { Company as ApiCompany } from '../../../generated/api/api';

interface Company {
  id: number;
  companyName: string;
  industry: string;
  user: string;
  status: 'Active' | 'Inactive';
  subscriptionEnd: string;
  logo?: string;
  ntnNumber?: string;
  salesTaxNumber?: string;
  city?: string;
  phone?: string;
}

const INDUSTRIES = [
  'Gas & Fuel',
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
];

const STATUSES = ['Active', 'Inactive'];

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for filter popup
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const filterOpen = Boolean(filterAnchorEl);

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

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
      setSelectedIndustry(values.industry || '');
      setSelectedStatus(values.status || '');
      setPage(0);
    };

    window.addEventListener('applySavedFilter', handleApplySavedFilter);
    return () => {
      window.removeEventListener('applySavedFilter', handleApplySavedFilter);
    };
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedStatus('');
    setPage(0);
  }, []);

  // Apply filters and close popup
  const handleApplyFilters = useCallback(() => {
    setPage(0);
  }, []);

  // Load companies from API
  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const companiesApi = getCompaniesApi();
      const response = await companiesApi.v1ApiCompaniesGet();

      // Transform API response to match our local interface
      const transformedCompanies: Company[] = (response as any).data.map((company: ApiCompany) => ({
        id: company.id!,
        companyName: company.name || '',
        industry: 'Gas & Fuel', // Default since API doesn't have industry field
        user: company.ntnNumber || '',
        status: company.isActive ? 'Active' : 'Inactive',
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logo: company.logoUrl || '',
        ntnNumber: company.ntnNumber || '',
        salesTaxNumber: company.salesTaxRegistrationNo || '',
        city: company.city || '',
        phone: company.phone || '',
      }));

      setCompanies(transformedCompanies);

      // Also save to localStorage as backup
      localStorage.setItem('companies', JSON.stringify(transformedCompanies));
    } catch (err: any) {
      console.error('Error loading companies:', err);
      setError('Failed to load companies. Loading from local storage...');

      // Fallback to localStorage
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        setCompanies(JSON.parse(savedCompanies));
      } else {
        // Initialize with sample data as last resort
        const sampleData: Company[] = [
          {
            id: 1,
            companyName: 'Petrozen Gases and Fuels PTV',
            industry: 'Gas & Fuel',
            user: '124',
            status: 'Active',
            subscriptionEnd: '2025-12-31',
          },
          {
            id: 2,
            companyName: 'EST Gas Distribution Ltd',
            industry: 'Gas & Fuel',
            user: '89',
            status: 'Active',
            subscriptionEnd: '2025-09-30',
          },
          {
            id: 3,
            companyName: 'Rana Gas Corporation',
            industry: 'Gas & Fuel',
            user: '56',
            status: 'Inactive',
            subscriptionEnd: '2024-12-31',
          },
        ];
        setCompanies(sampleData);
        localStorage.setItem('companies', JSON.stringify(sampleData));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Memoized filtering for better performance
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    if (debouncedSearch) {
      filtered = filtered.filter(
        (company) =>
          company.companyName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          company.industry.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          company.user.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter((company) => company.industry === selectedIndustry);
    }

    if (selectedStatus) {
      filtered = filtered.filter((company) => company.status === selectedStatus);
    }

    return filtered;
  }, [debouncedSearch, selectedIndustry, selectedStatus, companies]);

  // Paginated companies
  const paginatedCompanies = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCompanies, page, rowsPerPage]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Memoized edit handler with route preloading
  const handleEdit = useCallback((companyId: number) => {
    navigate(`/companies/update/${companyId}`);
  }, [navigate]);

  // Memoized delete handler with API
  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const companiesApi = getCompaniesApi();
        await companiesApi.v1ApiCompaniesIdDelete(id);

        // Update local state
        const updatedCompanies = companies.filter((company) => company.id !== id);
        setCompanies(updatedCompanies);
        localStorage.setItem('companies', JSON.stringify(updatedCompanies));

        setSuccessMessage('Company deleted successfully');
      } catch (err: any) {
        console.error('Error deleting company:', err);
        setError('Failed to delete company. Please try again.');
      }
    }
  }, [companies]);

  // Preload Add Company page on button hover
  const handleAddButtonHover = useCallback(() => {
    preloadRoute('/companies/add');
  }, []);

  // Preload Update Company page on row hover
  const handleRowHover = useCallback(() => {
    preloadRoute('/companies/update');
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Define filter fields for FilterManager
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        name: 'industry',
        label: 'Industry',
        value: selectedIndustry,
        component: (
          <FormControl fullWidth size="small">
            <Select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Industry</MenuItem>
              {INDUSTRIES.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
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
    [selectedIndustry, selectedStatus]
  );

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
          Companies
        </Typography>

        {/* Right side controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          {/* Filter Button */}
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

          {/* Search */}
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

          {/* Add Company Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/companies/add')}
            onMouseEnter={handleAddButtonHover}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              bgcolor: '#FF6B35',
              '&:hover': {
                bgcolor: '#FF8E53',
              },
            }}
          >
            Add Company
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
        pageKey="companies"
        userId={getCurrentUserId()}
      />

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscription End</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No companies found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    hover
                    onMouseEnter={() => handleRowHover()}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {company.logo ? (
                        <LazyImage
                          src={company.logo}
                          alt={company.companyName}
                          width={40}
                          height={40}
                          borderRadius="50%"
                        />
                      ) : (
                        <Avatar
                          sx={{
                            bgcolor: 'grey.400',
                            width: 40,
                            height: 40,
                          }}
                        >
                          🍎
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {company.industry}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {company.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.status}
                        size="small"
                        sx={{
                          bgcolor:
                            company.status === 'Active'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : 'rgba(158, 158, 158, 0.1)',
                          color:
                            company.status === 'Active'
                              ? 'success.main'
                              : 'text.secondary',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(company.subscriptionEnd)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(company.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(company.id);
                        }}
                        sx={{ color: 'error.main' }}
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
        {!isLoading && filteredCompanies.length > 0 && (
          <TablePagination
            component="div"
            count={filteredCompanies.length}
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
    </Box>
  );
};

export default CompaniesPage;
