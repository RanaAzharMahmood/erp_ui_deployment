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

interface Item {
  id: string;
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

  // Load items from localStorage
  useEffect(() => {
    const loadItems = () => {
      try {
        const savedItems = localStorage.getItem('items');
        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadItems, 500);
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, searchTerm, filters]);

  const handleAddItem = useCallback(() => {
    navigate('/inventory/add');
  }, [navigate]);

  const handleAddCategory = useCallback(() => {
    navigate('/categories/add');
  }, [navigate]);

  const handleEditItem = useCallback((id: string) => {
    navigate(`/inventory/update/${id}`);
  }, [navigate]);

  const handleDeleteItem = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter((i) => i.id !== id);
      setItems(updatedItems);
      localStorage.setItem('items', JSON.stringify(updatedItems));
    }
  }, [items]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({ company: '', itemName: '', category: '', status: '' });
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
        <TableSkeleton rows={5} columns={8} />
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
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Invoice
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
              <MenuItem value="">Number</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="">Name</MenuItem>
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
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Item Id</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Unit Price(MT)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Purchase Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No items found. Click "Add Invoice" to add one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.itemCode}</TableCell>
                    <TableCell>{item.companyName || 'EST Gass'}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.categoryName || 'Gas'}</TableCell>
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
                        sx={{ color: '#10B981' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(item.id)}
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

export default InventoryListPage;
