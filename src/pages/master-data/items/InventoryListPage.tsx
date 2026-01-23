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
  GridOn as GridIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import { COLORS } from '../../../constants/colors';
import { getItemsApi } from '../../../generated/api/client';

interface Item {
  id: number;
  itemCode: string;
  itemName: string;
  categoryId?: number;
  categoryName?: string;
  companyName?: string;
  unitPrice: number;
  purchasePrice: number;
  salePrice: number;
  unitOfMeasure: string;
  isActive: boolean;
  openingStock: number;
  currentStock: number;
  createdAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const InventoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    company: '',
    itemName: '',
    category: '',
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
  const [orderBy, setOrderBy] = useState<string>('itemName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Load items from API
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const itemsApi = getItemsApi();
      // Pass undefined to get all items regardless of status for the filter to work
      const response = await itemsApi.v1ApiItemsGet();
      if (response.data) {
        interface ApiItem {
          id: number;
          itemCode: string;
          itemName: string;
          categoryId?: number;
          categoryName?: string;
          companyName?: string;
          unitPrice?: number | string;
          purchasePrice?: number | string;
          salePrice?: number | string;
          unitOfMeasure: string;
          isActive: boolean;
          openingStock?: number | string;
          currentStock?: number | string;
          createdAt: string;
        }
        interface ApiResponseWithData {
          data?: ApiItem[];
        }
        const responseData = response.data as ApiItem[] | ApiResponseWithData;
        const itemsData = Array.isArray(responseData) ? responseData : (responseData as ApiResponseWithData).data || [];
        setItems(
          itemsData.map((i: ApiItem) => ({
            id: i.id,
            itemCode: i.itemCode,
            itemName: i.itemName,
            categoryId: i.categoryId,
            categoryName: i.categoryName,
            companyName: i.companyName,
            unitPrice: Number(i.unitPrice) || 0,
            purchasePrice: Number(i.purchasePrice) || 0,
            salePrice: Number(i.salePrice) || 0,
            unitOfMeasure: i.unitOfMeasure,
            isActive: i.isActive,
            openingStock: Number(i.openingStock) || 0,
            currentStock: Number(i.currentStock) || 0,
            createdAt: i.createdAt,
          }))
        );
      }
    } catch (error: unknown) {
      console.error('Error loading items:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load items. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Sort handler
  const handleSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.company || item.companyName === filters.company;
      const matchesCategory = !filters.category || item.categoryName === filters.category;
      const matchesStatus =
        !filters.status ||
        (filters.status === 'Active' && item.isActive) ||
        (filters.status === 'Inactive' && !item.isActive);

      return matchesSearch && matchesCompany && matchesCategory && matchesStatus;
    });

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (orderBy) {
        case 'itemCode':
          aValue = a.itemCode.toLowerCase();
          bValue = b.itemCode.toLowerCase();
          break;
        case 'companyName':
          aValue = (a.companyName || '').toLowerCase();
          bValue = (b.companyName || '').toLowerCase();
          break;
        case 'itemName':
          aValue = a.itemName.toLowerCase();
          bValue = b.itemName.toLowerCase();
          break;
        case 'categoryName':
          aValue = (a.categoryName || '').toLowerCase();
          bValue = (b.categoryName || '').toLowerCase();
          break;
        case 'unitPrice':
          aValue = a.unitPrice;
          bValue = b.unitPrice;
          break;
        case 'purchasePrice':
          aValue = a.purchasePrice;
          bValue = b.purchasePrice;
          break;
        case 'status':
          aValue = a.isActive ? 'Active' : 'Inactive';
          bValue = b.isActive ? 'Active' : 'Inactive';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, searchTerm, filters, orderBy, order]);

  const handleAddItem = useCallback(() => {
    navigate('/inventory/add');
  }, [navigate]);

  const handleAddCategory = useCallback(() => {
    navigate('/categories/add');
  }, [navigate]);

  const handleEditItem = useCallback((id: number) => {
    navigate(`/inventory/update/${id}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.id) {
      try {
        const itemsApi = getItemsApi();
        await itemsApi.v1ApiItemsIdDelete(deleteDialog.id);

        // Remove from local state
        setItems((prev) => prev.filter((i) => i.id !== deleteDialog.id));

        setSnackbar({
          open: true,
          message: 'Item deleted successfully!',
          severity: 'success',
        });
      } catch (error: unknown) {
        console.error('Error deleting item:', error);

        let errorMessage = 'Failed to delete item. Please try again.';
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
  }, [deleteDialog.id]);

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
    setFilters({ company: '', itemName: '', category: '', status: '' });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Get unique values for filters
  const companyNames = useMemo(() => {
    const names = new Set(items.map((i) => i.companyName).filter(Boolean));
    return Array.from(names);
  }, [items]);

  const categoryNames = useMemo(() => {
    const names = new Set(items.map((i) => i.categoryName).filter(Boolean));
    return Array.from(names);
  }, [items]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Inventory</Typography>
        <Table>
          <TableBody>
            <TableSkeleton rows={5} columns={8} />
          </TableBody>
        </Table>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Inventory
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
          onClick={handleAddCategory}
          sx={{
            bgcolor: '#10B981',
            textTransform: 'none',
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          Add Category
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            bgcolor: COLORS.primary,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.primaryHover },
          }}
        >
          Add Item
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
            <InputLabel>Item Name</InputLabel>
            <Select
              value={filters.itemName}
              onChange={(e) => setFilters({ ...filters, itemName: e.target.value })}
              label="Item Name"
            >
              <MenuItem value="">All Items</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoryNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
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
          <Table aria-label="Inventory items list">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'itemCode' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'itemCode'}
                    direction={orderBy === 'itemCode' ? order : 'asc'}
                    onClick={() => handleSort('itemCode')}
                  >
                    Item Id
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
                  aria-sort={orderBy === 'itemName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'itemName'}
                    direction={orderBy === 'itemName' ? order : 'asc'}
                    onClick={() => handleSort('itemName')}
                  >
                    Item Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'categoryName' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'categoryName'}
                    direction={orderBy === 'categoryName' ? order : 'asc'}
                    onClick={() => handleSort('categoryName')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'unitPrice' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'unitPrice'}
                    direction={orderBy === 'unitPrice' ? order : 'asc'}
                    onClick={() => handleSort('unitPrice')}
                  >
                    Unit Price(MT)
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  scope="col"
                  sx={{ fontWeight: 600, color: '#374151' }}
                  aria-sort={orderBy === 'purchasePrice' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <TableSortLabel
                    active={orderBy === 'purchasePrice'}
                    direction={orderBy === 'purchasePrice' ? order : 'asc'}
                    onClick={() => handleSort('purchasePrice')}
                  >
                    Purchase Price
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
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No items found. Click "Add Item" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.itemCode}</TableCell>
                    <TableCell>{item.companyName || '-'}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.categoryName || '-'}</TableCell>
                    <TableCell>{item.unitPrice.toFixed(1)} PKR</TableCell>
                    <TableCell>{item.purchasePrice.toFixed(1)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: item.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.isActive ? '#10B981' : '#EF4444',
                          fontWeight: 500,
                          border: `1px solid ${item.isActive ? '#10B981' : '#EF4444'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditItem(item.id)}
                        sx={{ color: '#4CAF50' }}
                        aria-label={`Edit ${item.itemName}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(item.id)}
                        sx={{ color: COLORS.error }}
                        aria-label={`Delete ${item.itemName}`}
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
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
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

export default InventoryListPage;
