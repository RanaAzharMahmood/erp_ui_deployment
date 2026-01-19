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
  Upload as UploadIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';

interface Party {
  id: string;
  partyName: string;
  partyType: 'Customer' | 'Vendor';
  contactName: string;
  contactEmail?: string;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
}

const PartyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    companyName: '',
    partyType: '',
    status: '',
  });

  // Load parties from localStorage or API
  useEffect(() => {
    const loadParties = () => {
      try {
        const savedParties = localStorage.getItem('parties');
        if (savedParties) {
          setParties(JSON.parse(savedParties));
        }
      } catch (error) {
        console.error('Error loading parties:', error);
      } finally {
        setLoading(false);
      }
    };

    // Simulate loading delay
    setTimeout(loadParties, 500);
  }, []);

  // Filter parties based on search and filters
  const filteredParties = useMemo(() => {
    return parties.filter((party) => {
      const matchesSearch =
        !searchTerm ||
        party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany =
        !filters.companyName || party.companyName === filters.companyName;

      const matchesType =
        !filters.partyType || party.partyType === filters.partyType;

      const matchesStatus =
        !filters.status ||
        (filters.status === 'Active' && party.isActive) ||
        (filters.status === 'Inactive' && !party.isActive);

      return matchesSearch && matchesCompany && matchesType && matchesStatus;
    });
  }, [parties, searchTerm, filters]);

  const handleAddParty = useCallback(() => {
    navigate('/party/add');
  }, [navigate]);

  const handleEditParty = useCallback((id: string) => {
    navigate(`/party/update/${id}`);
  }, [navigate]);

  const handleDeleteParty = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      const updatedParties = parties.filter((p) => p.id !== id);
      setParties(updatedParties);
      localStorage.setItem('parties', JSON.stringify(updatedParties));
    }
  }, [parties]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({ companyName: '', partyType: '', status: '' });
  };

  const handleApplyFilters = () => {
    handleFilterClose();
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique company names for filter
  const companyNames = useMemo(() => {
    const names = new Set(parties.map((p) => p.companyName).filter(Boolean));
    return Array.from(names);
  }, [parties]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Party" />
        <TableSkeleton rows={5} columns={7} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Party
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
          startIcon={<UploadIcon />}
          sx={{
            borderColor: '#10B981',
            color: '#10B981',
            textTransform: 'none',
            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.04)' },
          }}
        >
          Upload CSV
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddParty}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Party
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
            <InputLabel>Company Name</InputLabel>
            <Select
              value={filters.companyName}
              onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
              label="Company Name"
            >
              <MenuItem value="">Select Company</MenuItem>
              {companyNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Party Type</InputLabel>
            <Select
              value={filters.partyType}
              onChange={(e) => setFilters({ ...filters, partyType: e.target.value })}
              label="Party Type"
            >
              <MenuItem value="">Select Party Type</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
              <MenuItem value="Vendor">Vendor</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
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
              onClick={handleApplyFilters}
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
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Party Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Party Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Created at</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No parties found. Click "Party" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredParties.map((party) => (
                  <TableRow key={party.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {party.contactName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#FF6B35' }}>
                          {party.contactEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{party.companyName || '-'}</TableCell>
                    <TableCell>{party.partyName}</TableCell>
                    <TableCell>{party.partyType}</TableCell>
                    <TableCell>
                      <Chip
                        label={party.isActive ? 'Paid' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: party.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: party.isActive ? '#10B981' : '#EF4444',
                          fontWeight: 500,
                          border: `1px solid ${party.isActive ? '#10B981' : '#EF4444'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(party.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditParty(party.id)}
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteParty(party.id)}
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

export default PartyListPage;
