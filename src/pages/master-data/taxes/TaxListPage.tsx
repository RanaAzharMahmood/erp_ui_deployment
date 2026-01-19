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

interface Tax {
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

const TaxListPage: React.FC = () => {
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    taxId: '',
    taxPercentage: '',
    status: '',
  });

  // Load taxes from localStorage
  useEffect(() => {
    const loadTaxes = () => {
      try {
        const savedTaxes = localStorage.getItem('taxes');
        if (savedTaxes) {
          setTaxes(JSON.parse(savedTaxes));
        }
      } catch (error) {
        console.error('Error loading taxes:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadTaxes, 500);
  }, []);

  // Filter taxes
  const filteredTaxes = useMemo(() => {
    return taxes.filter((tax) => {
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
  }, [taxes, searchTerm, filters]);

  const handleAddTax = useCallback(() => {
    navigate('/tax/add');
  }, [navigate]);

  const handleEditTax = useCallback((id: string) => {
    navigate(`/tax/update/${id}`);
  }, [navigate]);

  const handleDeleteTax = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      const updatedTaxes = taxes.filter((t) => t.id !== id);
      setTaxes(updatedTaxes);
      localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
    }
  }, [taxes]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({ company: '', taxId: '', taxPercentage: '', status: '' });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(taxes.map((t) => t.companyName).filter(Boolean));
    return Array.from(names);
  }, [taxes]);

  const taxIds = useMemo(() => {
    const ids = new Set(taxes.map((t) => t.taxId).filter(Boolean));
    return Array.from(ids);
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
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Invoice
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
              <MenuItem value="">ERP</MenuItem>
              {companyNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Tax Id</InputLabel>
            <Select
              value={filters.taxId}
              onChange={(e) => setFilters({ ...filters, taxId: e.target.value })}
              label="Tax Id"
            >
              <MenuItem value="">Number</MenuItem>
              {taxIds.map((id) => (
                <MenuItem key={id} value={id}>{id}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Tax %</InputLabel>
            <Select
              value={filters.taxPercentage}
              onChange={(e) => setFilters({ ...filters, taxPercentage: e.target.value })}
              label="Tax %"
            >
              <MenuItem value="">Name</MenuItem>
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
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tax id</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tax Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tax %</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTaxes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No taxes found. Click "Add Invoice" to add one.
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
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTax(tax.id)}
                        sx={{ color: '#EF4444' }}
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

export default TaxListPage;
