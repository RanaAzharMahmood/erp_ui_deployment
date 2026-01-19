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

interface PurchaseInvoice {
  id: string;
  billNumber: string;
  companyName: string;
  vendorName: string;
  item: string;
  quantity: number;
  netAmount: number;
  status: 'Active' | 'Paid' | 'Overdue' | 'Pending';
  date: string;
  createdAt: string;
}

const PurchaseInvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
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

  // Load invoices from localStorage
  useEffect(() => {
    const loadInvoices = () => {
      try {
        const savedInvoices = localStorage.getItem('purchaseInvoices');
        if (savedInvoices) {
          setInvoices(JSON.parse(savedInvoices));
        }
      } catch (error) {
        console.error('Error loading purchase invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadInvoices, 500);
  }, []);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        !searchTerm ||
        invoice.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.item.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || invoice.companyName === filters.company;
      const matchesVendor = !filters.vendor || invoice.vendorName === filters.vendor;
      const matchesStatus = !filters.status || invoice.status === filters.status;

      return matchesSearch && matchesCompany && matchesVendor && matchesStatus;
    });
  }, [invoices, searchTerm, filters]);

  const handleAddInvoice = useCallback(() => {
    navigate('/purchase/invoice/add');
  }, [navigate]);

  const handleEditInvoice = useCallback((id: string) => {
    navigate(`/purchase/invoice/update/${id}`);
  }, [navigate]);

  const handleDeleteInvoice = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const updatedInvoices = invoices.filter((i) => i.id !== id);
      setInvoices(updatedInvoices);
      localStorage.setItem('purchaseInvoices', JSON.stringify(updatedInvoices));
    }
  }, [invoices]);

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
    const names = new Set(invoices.map((i) => i.companyName).filter(Boolean));
    return Array.from(names);
  }, [invoices]);

  const vendorNames = useMemo(() => {
    const names = new Set(invoices.map((i) => i.vendorName).filter(Boolean));
    return Array.from(names);
  }, [invoices]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Purchase Invoice</Typography>
        <TableSkeleton rows={5} columns={9} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Purchase Invoice
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
          onClick={handleAddInvoice}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Purchase Invoice
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
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
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
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No purchase invoices found. Click "Add Purchase Invoice" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>{invoice.billNumber}</TableCell>
                    <TableCell>{invoice.companyName}</TableCell>
                    <TableCell>{invoice.vendorName}</TableCell>
                    <TableCell>{invoice.item}</TableCell>
                    <TableCell>{invoice.quantity}</TableCell>
                    <TableCell>{invoice.netAmount.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        size="small"
                        sx={{
                          bgcolor: invoice.status === 'Active' || invoice.status === 'Paid'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : invoice.status === 'Overdue'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: invoice.status === 'Active' || invoice.status === 'Paid'
                            ? '#10B981'
                            : invoice.status === 'Overdue'
                            ? '#EF4444'
                            : '#F59E0B',
                          fontWeight: 500,
                          border: `1px solid ${
                            invoice.status === 'Active' || invoice.status === 'Paid'
                              ? '#10B981'
                              : invoice.status === 'Overdue'
                              ? '#EF4444'
                              : '#F59E0B'
                          }`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditInvoice(invoice.id)}
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteInvoice(invoice.id)}
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

export default PurchaseInvoiceListPage;
