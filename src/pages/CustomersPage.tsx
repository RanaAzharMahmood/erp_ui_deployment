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

interface Customer {
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

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Load customers from localStorage
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      const parsedCustomers = JSON.parse(savedCustomers);
      setCustomers(parsedCustomers);
      setFilteredCustomers(parsedCustomers);
    } else {
      // Initialize with sample data
      const sampleData: Customer[] = [
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
          status: 'Active',
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
      setCustomers(sampleData);
      setFilteredCustomers(sampleData);
      localStorage.setItem('customers', JSON.stringify(sampleData));
    }
  }, []);

  // Filter customers
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCompany) {
      filtered = filtered.filter(
        (customer) => customer.companyName === selectedCompany
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((customer) => customer.status === selectedStatus);
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, selectedCompany, selectedStatus, customers]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updatedCustomers = customers.filter((customer) => customer.id !== id);
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
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
          Customer
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customer/add')}
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
                <TableCell>Customer Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.companyName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status}
                        size="small"
                        sx={{
                          bgcolor:
                            customer.status === 'Active'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : customer.status === 'Prospect'
                              ? 'rgba(33, 150, 243, 0.1)'
                              : 'rgba(158, 158, 158, 0.1)',
                          color:
                            customer.status === 'Active'
                              ? 'success.main'
                              : customer.status === 'Prospect'
                              ? 'primary.main'
                              : 'text.secondary',
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
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(customer.id)}
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

export default CustomersPage;
