import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Vendor {
  id: string;
  name: string;
  email: string;
  cnic: string;
  contactNumber: string;
  principalActivity: string;
  companyName: string;
  ntnNumber: string;
  salesTaxNumber: string;
  taxOffice: string;
  address: string;
  status: 'Active' | 'Prospect' | 'Inactive';
  createdAt: string;
}

const COMPANIES = ['Est Gas', 'Petrozen', 'Rana Gas', 'Qubyte Gas'];
const STATUSES = ['All', 'Active', 'Prospect', 'Inactive'];

const VendorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Load vendors from localStorage
  useEffect(() => {
    const savedVendors = localStorage.getItem('vendors');
    if (savedVendors) {
      const parsedVendors = JSON.parse(savedVendors);
      setVendors(parsedVendors);
      setFilteredVendors(parsedVendors);
    } else {
      // Initialize with sample data
      const sampleData: Vendor[] = [
        {
          id: '1',
          name: 'John Harry',
          email: 'Example@example.com',
          cnic: '00000-0000000-0',
          contactNumber: '+92 000 0000000',
          principalActivity: 'Sales Agent',
          companyName: 'Est Gas',
          ntnNumber: '1234567',
          salesTaxNumber: 'STR-9087',
          taxOffice: 'Lahore',
          address: '',
          status: 'Active',
          createdAt: '2025-12-31',
        },
        {
          id: '2',
          name: 'John Harry',
          email: 'Example@example.com',
          cnic: '00000-0000000-0',
          contactNumber: '+92 000 0000000',
          principalActivity: 'Sales Agent',
          companyName: 'Petrozen',
          ntnNumber: '1234567',
          salesTaxNumber: 'STR-9087',
          taxOffice: 'Lahore',
          address: '',
          status: 'Active',
          createdAt: '2025-12-31',
        },
        {
          id: '3',
          name: 'John Harry',
          email: 'Example@example.com',
          cnic: '00000-0000000-0',
          contactNumber: '+92 000 0000000',
          principalActivity: 'Sales Agent',
          companyName: 'Est Gas',
          ntnNumber: '1234567',
          salesTaxNumber: 'STR-9087',
          taxOffice: 'Lahore',
          address: '',
          status: 'Inactive',
          createdAt: '2025-12-31',
        },
        {
          id: '4',
          name: 'John Harry',
          email: 'Example@example.com',
          cnic: '00000-0000000-0',
          contactNumber: '+92 000 0000000',
          principalActivity: 'Sales Agent',
          companyName: 'Rana Gas',
          ntnNumber: '1234567',
          salesTaxNumber: 'STR-9087',
          taxOffice: 'Lahore',
          address: '',
          status: 'Active',
          createdAt: '2025-12-31',
        },
        {
          id: '5',
          name: 'John Harry',
          email: 'Example@example.com',
          cnic: '00000-0000000-0',
          contactNumber: '+92 000 0000000',
          principalActivity: 'Sales Agent',
          companyName: 'Qubyte Gas',
          ntnNumber: '1234567',
          salesTaxNumber: 'STR-9087',
          taxOffice: 'Lahore',
          address: '',
          status: 'Active',
          createdAt: '2025-12-31',
        },
        {
          id: '6',
          name: 'John Harry',
          email: 'Example@example.com',
          cnic: '00000-0000000-0',
          contactNumber: '+92 000 0000000',
          principalActivity: 'Sales Agent',
          companyName: 'Est Gas',
          ntnNumber: '1234567',
          salesTaxNumber: 'STR-9087',
          taxOffice: 'Lahore',
          address: '',
          status: 'Active',
          createdAt: '2025-12-31',
        },
      ];
      setVendors(sampleData);
      setFilteredVendors(sampleData);
      localStorage.setItem('vendors', JSON.stringify(sampleData));
    }
  }, []);

  // Filter vendors
  useEffect(() => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCompany) {
      filtered = filtered.filter(
        (vendor) => vendor.companyName === selectedCompany
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((vendor) => vendor.status === selectedStatus);
    }

    setFilteredVendors(filtered);
  }, [searchTerm, selectedCompany, selectedStatus, vendors]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      const updatedVendors = vendors.filter((vendor) => vendor.id !== id);
      setVendors(updatedVendors);
      localStorage.setItem('vendors', JSON.stringify(updatedVendors));
    }
  };

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
          Vendor
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vendor/add')}
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Companies</InputLabel>
          <Select
            value={selectedCompany}
            label="Select Companies"
            onChange={(e: SelectChangeEvent) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value="">All Companies</MenuItem>
            {COMPANIES.map((company) => (
              <MenuItem key={company} value={company}>
                {company}
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
          placeholder="Search"
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendor Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No vendors found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {vendor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vendor.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vendor.companyName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vendor.status}
                        size="small"
                        sx={{
                          bgcolor:
                            vendor.status === 'Active'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : vendor.status === 'Prospect'
                              ? 'rgba(33, 150, 243, 0.1)'
                              : 'rgba(255, 152, 0, 0.1)',
                          color:
                            vendor.status === 'Active'
                              ? 'success.main'
                              : vendor.status === 'Prospect'
                              ? 'primary.main'
                              : '#FF9800',
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
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(vendor.id)}
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

export default VendorsPage;
