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
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  GridOn as GridIcon,
  CheckCircle as PostIcon,
  Block as VoidIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import {
  getJournalEntriesApi,
  JournalEntry,
  JournalEntryStatus,
  JournalEntryFilters as ApiFilters,
} from '../../../generated/api/client';

type Order = 'asc' | 'desc';
type JournalEntryOrderBy = 'entryNumber' | 'date' | 'reference' | 'description' | 'totalDebit' | 'totalCredit' | 'status';

const JournalEntryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    dateFrom: '',
    dateTo: '',
    status: '' as JournalEntryStatus | '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [postDialog, setPostDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [voidDialog, setVoidDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Sorting state
  const [orderBy, setOrderBy] = useState<JournalEntryOrderBy>('date');
  const [order, setOrder] = useState<Order>('desc');

  // Load entries from API
  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const api = getJournalEntriesApi();
      const apiFilters: ApiFilters = {
        isActive: true,
      };

      if (filters.status) {
        apiFilters.status = filters.status;
      }
      if (filters.dateFrom) {
        apiFilters.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        apiFilters.dateTo = filters.dateTo;
      }

      const response = await api.getAll(apiFilters);
      if (response.success && response.data) {
        setEntries(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading journal entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load journal entries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Handle sort
  const handleSort = useCallback((property: JournalEntryOrderBy) => {
    setOrder((prevOrder) => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(property);
  }, [orderBy]);

  // Filter and sort entries locally by search term
  const filteredEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.companyName && entry.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });

    // Sort the filtered entries
    const sortedEntries = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'entryNumber':
          aValue = a.entryNumber || '';
          bValue = b.entryNumber || '';
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'reference':
          aValue = a.reference || '';
          bValue = b.reference || '';
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'totalDebit':
          aValue = a.totalDebit;
          bValue = b.totalDebit;
          break;
        case 'totalCredit':
          aValue = a.totalCredit;
          bValue = b.totalCredit;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    return sortedEntries;
  }, [entries, searchTerm, orderBy, order]);

  const handleAddEntry = useCallback(() => {
    navigate('/account/journal-entry/add');
  }, [navigate]);

  const handleEditEntry = useCallback(
    (id: number) => {
      navigate(`/account/journal-entry/update/${id}`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      setActionLoading(true);
      try {
        const api = getJournalEntriesApi();
        await api.delete(deleteDialog.id);
        setSuccessMessage('Journal entry deleted successfully!');
        loadEntries();
      } catch (err) {
        console.error('Error deleting journal entry:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete journal entry. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
    setDeleteDialog({ open: false, id: null });
  }, [deleteDialog.id, loadEntries]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null });
  }, []);

  const handlePostClick = useCallback((id: number) => {
    setPostDialog({ open: true, id });
  }, []);

  const handlePostConfirm = useCallback(async () => {
    if (postDialog.id) {
      setActionLoading(true);
      try {
        const api = getJournalEntriesApi();
        await api.post(postDialog.id);
        setSuccessMessage('Journal entry posted successfully!');
        loadEntries();
      } catch (err) {
        console.error('Error posting journal entry:', err);
        setError(err instanceof Error ? err.message : 'Failed to post journal entry. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
    setPostDialog({ open: false, id: null });
  }, [postDialog.id, loadEntries]);

  const handlePostCancel = useCallback(() => {
    setPostDialog({ open: false, id: null });
  }, []);

  const handleVoidClick = useCallback((id: number) => {
    setVoidDialog({ open: true, id });
  }, []);

  const handleVoidConfirm = useCallback(async () => {
    if (voidDialog.id) {
      setActionLoading(true);
      try {
        const api = getJournalEntriesApi();
        await api.void(voidDialog.id);
        setSuccessMessage('Journal entry voided successfully!');
        loadEntries();
      } catch (err) {
        console.error('Error voiding journal entry:', err);
        setError(err instanceof Error ? err.message : 'Failed to void journal entry. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
    setVoidDialog({ open: false, id: null });
  }, [voidDialog.id, loadEntries]);

  const handleVoidCancel = useCallback(() => {
    setVoidDialog({ open: false, id: null });
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
      status: '',
    });
  };

  const handleApplyFilters = () => {
    handleFilterClose();
    loadEntries();
  };

  const filterOpen = Boolean(filterAnchorEl);

  const getStatusColor = (status: JournalEntryStatus) => {
    switch (status) {
      case 'posted':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '#10B981' };
      case 'draft':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '#3B82F6' };
      case 'void':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '#EF4444' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9CA3AF', border: '#9CA3AF' };
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Journal Entries
        </Typography>
        <TableSkeleton rows={5} columns={8} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Journal Entries
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
          placeholder="Search by entry number, reference, description..."
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
          sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
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
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Date From"
              type="date"
              size="small"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Date To"
              type="date"
              size="small"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as JournalEntryStatus | '' })}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="posted">Posted</MenuItem>
              <MenuItem value="void">Void</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              onClick={handleClearFilters}
              sx={{ color: '#6B7280', textTransform: 'none' }}
            >
              Clear Filter
            </Button>
            <Box sx={{ flexGrow: 1 }} />
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
          <Table aria-label="Journal entries list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'entryNumber' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'entryNumber'}
                    direction={orderBy === 'entryNumber' ? order : 'asc'}
                    onClick={() => handleSort('entryNumber')}
                  >
                    Entry Number
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'date' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'reference' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'reference'}
                    direction={orderBy === 'reference' ? order : 'asc'}
                    onClick={() => handleSort('reference')}
                  >
                    Reference
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'description' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'description'}
                    direction={orderBy === 'description' ? order : 'asc'}
                    onClick={() => handleSort('description')}
                  >
                    Description
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'totalDebit' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'totalDebit'}
                    direction={orderBy === 'totalDebit' ? order : 'asc'}
                    onClick={() => handleSort('totalDebit')}
                  >
                    Debit
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'totalCredit' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'totalCredit'}
                    direction={orderBy === 'totalCredit' ? order : 'asc'}
                    onClick={() => handleSort('totalCredit')}
                  >
                    Credit
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
                <TableCell scope="col" sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No journal entries found. Click "Add Journal Entry" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => {
                  const statusColors = getStatusColor(entry.status);
                  const isDraft = entry.status === 'draft';
                  const isPosted = entry.status === 'posted';
                  const isVoid = entry.status === 'void';

                  return (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{entry.entryNumber}</TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.reference || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.description || '-'}
                      </TableCell>
                      <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
                      <TableCell>{formatCurrency(entry.totalCredit)}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: statusColors.bg,
                            color: statusColors.color,
                            fontWeight: 500,
                            border: `1px solid ${statusColors.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {isDraft && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditEntry(entry.id)}
                                  sx={{ color: '#4CAF50' }}
                                  aria-label={`Edit journal entry ${entry.entryNumber}`}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Post">
                                <IconButton
                                  size="small"
                                  onClick={() => handlePostClick(entry.id)}
                                  sx={{ color: '#2196F3' }}
                                  disabled={actionLoading}
                                  aria-label={`Post journal entry ${entry.entryNumber}`}
                                >
                                  <PostIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(entry.id)}
                                  sx={{ color: COLORS.error }}
                                  disabled={actionLoading}
                                  aria-label={`Delete journal entry ${entry.entryNumber}`}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {isPosted && (
                            <Tooltip title="Void">
                              <IconButton
                                size="small"
                                onClick={() => handleVoidClick(entry.id)}
                                sx={{ color: '#F59E0B' }}
                                disabled={actionLoading}
                                aria-label={`Void journal entry ${entry.entryNumber}`}
                              >
                                <VoidIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isVoid && (
                            <Typography variant="caption" color="text.secondary">
                              No actions
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
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

      {/* Post Confirmation Dialog */}
      <ConfirmDialog
        open={postDialog.open}
        title="Post Journal Entry"
        message="Are you sure you want to post this journal entry? Once posted, the entry cannot be edited."
        confirmText="Post"
        cancelText="Cancel"
        confirmColor="primary"
        onConfirm={handlePostConfirm}
        onCancel={handlePostCancel}
      />

      {/* Void Confirmation Dialog */}
      <ConfirmDialog
        open={voidDialog.open}
        title="Void Journal Entry"
        message="Are you sure you want to void this journal entry? This action will mark the entry as void."
        confirmText="Void"
        cancelText="Cancel"
        confirmColor="warning"
        onConfirm={handleVoidConfirm}
        onCancel={handleVoidCancel}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JournalEntryListPage;
