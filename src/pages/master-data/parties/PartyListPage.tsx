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
  TableSortLabel,
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
  Snackbar,
  Alert,
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
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { getPartiesApi } from '../../../generated/api/client';

interface Party {
  id: number;
  partyName: string;
  partyType: 'Customer' | 'Vendor';
  contactName: string;
  contactEmail?: string;
  companyId?: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [orderBy, setOrderBy] = useState<string>('partyName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Load parties from API
  const loadParties = useCallback(async () => {
    setLoading(true);
    try {
      const partiesApi = getPartiesApi();
      const response = await partiesApi.v1ApiPartiesGet();
      if (response.data?.data) {
        interface ApiParty {
          id: number;
          partyName: string;
          partyType: 'Customer' | 'Vendor';
          contactName: string;
          contactEmail?: string;
          companyId?: number;
          companyName?: string;
          isActive: boolean;
          createdAt: string;
        }
        const apiData = response.data.data as unknown as ApiParty[];
        const apiParties = apiData.map((p: ApiParty) => ({
          id: p.id,
          partyName: p.partyName,
          partyType: p.partyType,
          contactName: p.contactName,
          contactEmail: p.contactEmail,
          companyId: p.companyId,
          companyName: p.companyName,
          isActive: p.isActive,
          createdAt: p.createdAt,
        }));
        setParties(apiParties);
      }
    } catch (error: unknown) {
      console.error('Error loading parties from API:', error);
      setParties([]);
      setSnackbar({
        open: true,
        message: 'Failed to load parties from server.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  // Sort handler
  const handleSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Filter and sort parties based on search and filters
  const filteredParties = useMemo(() => {
    const filtered = parties.filter((party) => {
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

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'contactName':
          aValue = a.contactName.toLowerCase();
          bValue = b.contactName.toLowerCase();
          break;
        case 'companyName':
          aValue = (a.companyName || '').toLowerCase();
          bValue = (b.companyName || '').toLowerCase();
          break;
        case 'partyName':
          aValue = a.partyName.toLowerCase();
          bValue = b.partyName.toLowerCase();
          break;
        case 'partyType':
          aValue = a.partyType;
          bValue = b.partyType;
          break;
        case 'status':
          aValue = a.isActive ? 'Active' : 'Inactive';
          bValue = b.isActive ? 'Active' : 'Inactive';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [parties, searchTerm, filters, orderBy, order]);

  const handleAddParty = useCallback(() => {
    navigate('/party/add');
  }, [navigate]);

  const handleEditParty = useCallback((id: number) => {
    navigate(`/party/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      try {
        const partiesApi = getPartiesApi();
        await partiesApi.v1ApiPartiesIdDelete(deleteDialog.id);

        // Remove from local state
        setParties((prev) => prev.filter((p) => p.id !== deleteDialog.id));

        setSnackbar({
          open: true,
          message: 'Party deleted successfully!',
          severity: 'success',
        });
      } catch (error: unknown) {
        console.error('Error deleting party:', error);

        let errorMessage = 'Failed to delete party. Please try again.';
        if (error && typeof error === 'object' && 'json' in error && typeof (error as { json: unknown }).json === 'function') {
          try {
            const errorData = await (error as { json: () => Promise<{ message?: string }> }).json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Use default error message
          }
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [parties, deleteDialog.id]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

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

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
        <Table>
          <TableBody>
            <TableSkeleton rows={5} columns={7} />
          </TableBody>
        </Table>
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
            bgcolor: COLORS.primary,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.primaryHover },
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
                bgcolor: COLORS.primary,
                textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryHover },
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
          <Table aria-label="Parties list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'contactName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'contactName'}
                    direction={orderBy === 'contactName' ? order : 'asc'}
                    onClick={() => handleSort('contactName')}
                  >
                    Contact
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'companyName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'companyName'}
                    direction={orderBy === 'companyName' ? order : 'asc'}
                    onClick={() => handleSort('companyName')}
                  >
                    Company
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'partyName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'partyName'}
                    direction={orderBy === 'partyName' ? order : 'asc'}
                    onClick={() => handleSort('partyName')}
                  >
                    Party Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'partyType' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'partyType'}
                    direction={orderBy === 'partyType' ? order : 'asc'}
                    onClick={() => handleSort('partyType')}
                  >
                    Party Type
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'status' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'createdAt' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created at
                  </TableSortLabel>
                </TableCell>
                <TableCell scope="col" sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
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
                        label={party.isActive ? 'Active' : 'Inactive'}
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
                        aria-label={`Edit ${party.partyName}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(party.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete ${party.partyName}`}
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

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Party"
        message="Are you sure you want to delete this party? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PartyListPage;
