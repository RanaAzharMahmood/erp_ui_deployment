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
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDebounce } from '../hooks/useDebounce';
import { preloadRoute } from '../utils/routePreloader';
import TableSkeleton from '../components/common/TableSkeleton';
import LazyImage from '../components/common/LazyImage';

interface Company {
  id: string;
  companyName: string;
  industry: string;
  user: string;
  status: 'Active' | 'Inactive';
  subscriptionEnd: string;
  logo?: string;
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

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load companies from localStorage
  useEffect(() => {
    setIsLoading(true);
    // Simulate async loading for better UX
    setTimeout(() => {
      const savedCompanies = localStorage.getItem('companies');
      if (savedCompanies) {
        const parsedCompanies = JSON.parse(savedCompanies);
        setCompanies(parsedCompanies);
      } else {
      // Initialize with sample data
      const sampleData: Company[] = [
        {
          id: '1',
          companyName: 'Petrozen Gases and Fuels PTV',
          industry: 'Gas & Fuel',
          user: '124',
          status: 'Active',
          subscriptionEnd: '2025-12-31',
        },
        {
          id: '2',
          companyName: 'Petrozen Gases and Fuels PTV',
          industry: 'Gas & Fuel',
          user: '124',
          status: 'Active',
          subscriptionEnd: '2025-12-31',
        },
        {
          id: '3',
          companyName: 'Petrozen Gases and Fuels PTV',
          industry: 'Gas & Fuel',
          user: '124',
          status: 'Active',
          subscriptionEnd: '2025-12-31',
        },
      ];
        setCompanies(sampleData);
        localStorage.setItem('companies', JSON.stringify(sampleData));
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  }, []);

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

  // Memoized edit handler with route preloading
  const handleEdit = useCallback((companyId: string) => {
    navigate(`/companies/update/${companyId}`);
  }, [navigate]);

  // Memoized delete handler
  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      const updatedCompanies = companies.filter((company) => company.id !== id);
      setCompanies(updatedCompanies);
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
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

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Companies</InputLabel>
              <Select
                value={selectedIndustry}
                label="Select Companies"
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                <MenuItem value="">All Industries</MenuItem>
                {INDUSTRIES.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Card>

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
                filteredCompanies.map((company) => (
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
      </Card>
    </Box>
  );
};

export default CompaniesPage;
