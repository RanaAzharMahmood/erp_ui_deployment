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
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS } from '../../../constants/colors';

interface JournalEntry {
  id: string;
  date: string;
  accountName: string;
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
  companyId?: number;
  companyName: string;
  reference: string;
  debit: number;
  credit: number;
  status: 'Approved' | 'Draft' | 'Pending';
  createdAt: string;
}

const JournalEntryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    dateFrom: '',
    dateTo: '',
    accountName: '',
    accountType: '',
    reference: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  // Load entries from localStorage
  useEffect(() => {
    const loadEntries = () => {
      try {
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadEntries, 500);
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || entry.companyName === filters.company;
      const matchesStatus = !filters.status || entry.status === filters.status;
      const matchesAccountType = !filters.accountType || entry.accountType === filters.accountType;
      const matchesReference = !filters.reference || entry.reference === filters.reference;

      return matchesSearch && matchesCompany && matchesStatus && matchesAccountType && matchesReference;
    });
  }, [entries, searchTerm, filters]);

  const handleAddEntry = useCallback(() => {
    navigate('/account/journal-entry/add');
  }, [navigate]);

  const handleEditEntry = useCallback((id: string) => {
    navigate(`/account/journal-entry/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.id) {
      const updatedEntries = entries.filter((e) => e.id !== deleteDialog.id);
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }
    setDeleteDialog({ open: false, id: null });
  }, [entries, deleteDialog.id]);

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
    setFilters({
      company: '',
      dateFrom: '',
      dateTo: '',
      accountName: '',
      accountType: '',
      reference: '',
      status: '',
    });
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(entries.map((e) => e.companyName).filter(Boolean));
    return Array.from(names);
  }, [entries]);

  const accountNames = useMemo(() => {
    const names = new Set(entries.map((e) => e.accountName).filter(Boolean));
    return Array.from(names);
  }, [entries]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Journal Entry</Typography>
        <TableSkeleton rows={5} columns={9} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Journal Entry
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
          onClick={handleAddEntry}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Journal Entry
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
            <InputLabel>Company</InputLabel>
            <Select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              label="Company"
            >
              <MenuItem value="">ERP</MenuItem>
              {companyNames.map((name) => (
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
            <InputLabel>Account Name</InputLabel>
            <Select
              value={filters.accountName}
              onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
              label="Account Name"
            >
              <MenuItem value="">All</MenuItem>
              {accountNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={filters.accountType}
              onChange={(e) => setFilters({ ...filters, accountType: e.target.value })}
              label="Account Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Assets">Assets</MenuItem>
              <MenuItem value="Liabilities">Liabilities</MenuItem>
              <MenuItem value="Equity">Equity</MenuItem>
              <MenuItem value="Revenue">Revenue</MenuItem>
              <MenuItem value="Expenses">Expenses</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Reference</InputLabel>
            <Select
              value={filters.reference}
              onChange={(e) => setFilters({ ...filters, reference: e.target.value })}
              label="Reference"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Expenses">Expense</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Purchase">Purchase</MenuItem>
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
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
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
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Account Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Account Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Debit</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Credit</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No journal entries found. Click "Add Journal Entry" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.accountName}</TableCell>
                    <TableCell>{entry.accountType}</TableCell>
                    <TableCell>{entry.companyName}</TableCell>
                    <TableCell>{entry.reference}</TableCell>
                    <TableCell>{entry.debit.toFixed(1)} PKR</TableCell>
                    <TableCell>{entry.credit.toFixed(1)} PKR</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.status}
                        size="small"
                        sx={{
                          bgcolor: entry.status === 'Approved'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : entry.status === 'Draft'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: entry.status === 'Approved'
                            ? '#10B981'
                            : entry.status === 'Draft'
                            ? '#3B82F6'
                            : '#F59E0B',
                          fontWeight: 500,
                          border: `1px solid ${
                            entry.status === 'Approved'
                              ? '#10B981'
                              : entry.status === 'Draft'
                              ? '#3B82F6'
                              : '#F59E0B'
                          }`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditEntry(entry.id)}
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(entry.id)}
                        sx={{ color: COLORS.error }}
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
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default JournalEntryListPage;
