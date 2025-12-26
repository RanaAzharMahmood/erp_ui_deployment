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

interface Tax {
  id: string;
  taxId: string;
  taxName: string;
  taxPercentage: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

const COMPANIES = ['All'];
const STATUSES = ['All', 'Active', 'Prospect', 'Inactive'];

const TaxPage: React.FC = () => {
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [filteredTaxes, setFilteredTaxes] = useState<Tax[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Load taxes from localStorage
  useEffect(() => {
    const savedTaxes = localStorage.getItem('taxes');
    if (savedTaxes) {
      const parsedTaxes = JSON.parse(savedTaxes);
      setTaxes(parsedTaxes);
      setFilteredTaxes(parsedTaxes);
    } else {
      // Initialize with sample data
      const sampleData: Tax[] = [
        {
          id: '1',
          taxId: '124',
          taxName: 'Sales Tax 1',
          taxPercentage: '16 %',
          status: 'Active',
        },
        {
          id: '2',
          taxId: '124',
          taxName: 'Purchase Tax 1',
          taxPercentage: '16 %',
          status: 'Active',
        },
        {
          id: '3',
          taxId: '124',
          taxName: 'Sales Tax 3',
          taxPercentage: '05 %',
          status: 'Active',
        },
        {
          id: '4',
          taxId: '124',
          taxName: 'Sales Tax 5',
          taxPercentage: '19 %',
          status: 'Active',
        },
        {
          id: '5',
          taxId: '124',
          taxName: 'Sales Tax 1',
          taxPercentage: '20 %',
          status: 'Active',
        },
      ];
      setTaxes(sampleData);
      setFilteredTaxes(sampleData);
      localStorage.setItem('taxes', JSON.stringify(sampleData));
    }
  }, []);

  // Filter taxes
  useEffect(() => {
    let filtered = taxes;

    if (searchTerm) {
      filtered = filtered.filter(
        (tax) =>
          tax.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tax.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tax.taxPercentage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((tax) => tax.status === selectedStatus);
    }

    setFilteredTaxes(filtered);
  }, [searchTerm, selectedStatus, taxes]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      const updatedTaxes = taxes.filter((tax) => tax.id !== id);
      setTaxes(updatedTaxes);
      localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
    }
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
          Tax
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tax/add')}
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
          Add Tax
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
                <TableCell>Tax id</TableCell>
                <TableCell>Tax Name</TableCell>
                <TableCell>Tax %</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTaxes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No taxes found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTaxes.map((tax) => (
                  <TableRow key={tax.id} hover>
                    <TableCell>
                      <Typography variant="body2">{tax.taxId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{tax.taxName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{tax.taxPercentage}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tax.status}
                        size="small"
                        sx={{
                          bgcolor:
                            tax.status === 'Active'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : tax.status === 'Prospect'
                              ? 'rgba(33, 150, 243, 0.1)'
                              : 'rgba(158, 158, 158, 0.1)',
                          color:
                            tax.status === 'Active'
                              ? 'success.main'
                              : tax.status === 'Prospect'
                              ? 'primary.main'
                              : 'text.secondary',
                          fontWeight: 500,
                          borderRadius: '16px',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tax/update/${tax.id}`)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tax.id)}
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

export default TaxPage;
