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

interface PurchaseReturn {
  id: string;
  billNumber: string;
  companyName: string;
  vendorName: string;
  item: string;
  quantity: number;
  netAmount: number;
  status: 'Active' | 'Completed' | 'Pending';
  date: string;
  createdAt: string;
}

const PurchaseReturnListPage: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    vendor: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });

  // Load returns from localStorage
  useEffect(() => {
    const loadReturns = () => {
      try {
        const savedReturns = localStorage.getItem('purchaseReturns');
        if (savedReturns) {
          setReturns(JSON.parse(savedReturns));
        }
      } catch (error) {
        console.error('Error loading purchase returns:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadReturns, 500);
  }, []);

  // Filter returns
  const filteredReturns = useMemo(() => {
    return returns.filter((returnItem) => {
      const matchesSearch =
        !searchTerm ||
        returnItem.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.item.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || returnItem.companyName === filters.company;
      const matchesVendor = !filters.vendor || returnItem.vendorName === filters.vendor;
      const matchesStatus = !filters.status || returnItem.status === filters.status;

      return matchesSearch && matchesCompany && matchesVendor && matchesStatus;
    });
  }, [returns, searchTerm, filters]);

  const handleAddReturn = useCallback(() => {
    navigate('/purchase/return/add');
  }, [navigate]);

  const handleEditReturn = useCallback((id: string) => {
    navigate(`/purchase/return/update/${id}`);
  }, [navigate]);

  const handleDeleteReturn = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this return?')) {
      const updatedReturns = returns.filter((r) => r.id !== id);
      setReturns(updatedReturns);
      localStorage.setItem('purchaseReturns', JSON.stringify(updatedReturns));
    }
  }, [returns]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      company: '',
      vendor: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(returns.map((r) => r.companyName).filter(Boolean));
    return Array.from(names);
  }, [returns]);

  const vendorNames = useMemo(() => {
    const names = new Set(returns.map((r) => r.vendorName).filter(Boolean));
    return Array.from(names);
  }, [returns]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Purchase Return</Typography>
        <TableSkeleton rows={5} columns={9} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Purchase Return
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
          onClick={handleAddReturn}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Return Purchase Invoice
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
            <InputLabel>Select Vendor</InputLabel>
            <Select
              value={filters.vendor}
              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
              label="Select Vendor"
            >
              <MenuItem value="">All</MenuItem>
              {vendorNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Date Range To"
              type="date"
              size="small"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="From"
              type="date"
              size="small"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
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
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Bill Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Net Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No purchase returns found. Click "Return Purchase Invoice" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((returnItem) => (
                  <TableRow key={returnItem.id} hover>
                    <TableCell>{returnItem.billNumber}</TableCell>
                    <TableCell>{returnItem.companyName}</TableCell>
                    <TableCell>{returnItem.vendorName}</TableCell>
                    <TableCell>{returnItem.item}</TableCell>
                    <TableCell>{returnItem.quantity}</TableCell>
                    <TableCell>{returnItem.netAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={returnItem.status}
                        size="small"
                        sx={{
                          bgcolor: returnItem.status === 'Active' || returnItem.status === 'Completed'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: returnItem.status === 'Active' || returnItem.status === 'Completed'
                            ? '#10B981'
                            : '#F59E0B',
                          fontWeight: 500,
                          border: `1px solid ${
                            returnItem.status === 'Active' || returnItem.status === 'Completed'
                              ? '#10B981'
                              : '#F59E0B'
                          }`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{returnItem.date}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditReturn(returnItem.id)}
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteReturn(returnItem.id)}
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

export default PurchaseReturnListPage;
