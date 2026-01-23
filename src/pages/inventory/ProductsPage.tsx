import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useCategories } from '../../hooks/useCategories';
import ConfirmDialog from '../../components/feedback/ConfirmDialog';
import TableSkeleton from '../../components/common/TableSkeleton';
import { COLORS } from '../../constants/colors';
import {
  getProductsApi,
  ProductData,
  CreateProductRequest,
  UpdateProductRequest,
  AdjustStockRequest,
} from '../../generated/api/client';

interface ProductFormData {
  name: string;
  code: string;
  sku: string;
  description: string;
  categoryId: number;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  minPrice: number;
  trackInventory: boolean;
  reorderLevel: number;
  currentStock: number;
  lowStockAlert: boolean;
  barcode: string;
}

const INITIAL_PRODUCT: ProductFormData = {
  name: '',
  code: '',
  sku: '',
  description: '',
  categoryId: 0,
  unitOfMeasure: 'unit',
  costPrice: 0,
  sellingPrice: 0,
  minPrice: 0,
  trackInventory: true,
  reorderLevel: 10,
  currentStock: 0,
  lowStockAlert: true,
  barcode: '',
};

type Order = 'asc' | 'desc';
type OrderBy = 'name' | 'code' | 'categoryId' | 'costPrice' | 'sellingPrice' | 'currentStock';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_PRODUCT);
  const [stockAdjustment, setStockAdjustment] = useState<AdjustStockRequest>({ quantity: 0, type: 'add' });
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { categories } = useCategories();

  // Sorting state
  const [orderBy, setOrderBy] = useState<OrderBy>('name');
  const [order, setOrder] = useState<Order>('asc');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const api = getProductsApi();
      const response = await api.getAll({ isActive: true });
      if (response.success && response.data) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load products',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle sort
  const handleSort = useCallback((property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      // Handle numeric sorting
      if (orderBy === 'costPrice' || orderBy === 'sellingPrice' || orderBy === 'currentStock' || orderBy === 'categoryId') {
        aValue = Number(a[orderBy]) || 0;
        bValue = Number(b[orderBy]) || 0;
      } else {
        // Handle string sorting
        aValue = String(a[orderBy] || '').toLowerCase();
        bValue = String(b[orderBy] || '').toLowerCase();
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [products, orderBy, order]);

  const handleOpen = (product?: ProductData) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        code: product.code,
        sku: product.sku || '',
        description: product.description || '',
        categoryId: product.categoryId,
        unitOfMeasure: product.unitOfMeasure,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        minPrice: product.minPrice || 0,
        trackInventory: product.trackInventory,
        reorderLevel: product.reorderLevel,
        currentStock: product.currentStock,
        lowStockAlert: product.lowStockAlert,
        barcode: product.barcode || '',
      });
    } else {
      setEditingProduct(null);
      setFormData(INITIAL_PRODUCT);
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormData(INITIAL_PRODUCT);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.categoryId || formData.sellingPrice < 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    try {
      const api = getProductsApi();

      if (editingProduct) {
        const updateData: UpdateProductRequest = {
          name: formData.name,
          code: formData.code,
          sku: formData.sku || undefined,
          description: formData.description || undefined,
          categoryId: formData.categoryId,
          unitOfMeasure: formData.unitOfMeasure,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          minPrice: formData.minPrice || undefined,
          trackInventory: formData.trackInventory,
          reorderLevel: formData.reorderLevel,
          lowStockAlert: formData.lowStockAlert,
          barcode: formData.barcode || undefined,
        };

        await api.update(editingProduct.id, updateData);
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success',
        });
      } else {
        const createData: CreateProductRequest = {
          name: formData.name,
          code: formData.code,
          sku: formData.sku || undefined,
          description: formData.description || undefined,
          categoryId: formData.categoryId,
          unitOfMeasure: formData.unitOfMeasure,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          minPrice: formData.minPrice || undefined,
          trackInventory: formData.trackInventory,
          reorderLevel: formData.reorderLevel,
          currentStock: formData.currentStock,
          lowStockAlert: formData.lowStockAlert,
          barcode: formData.barcode || undefined,
          companyId: 1, // Default company ID - should be from context
        };

        await api.create(createData);
        setSnackbar({
          open: true,
          message: 'Product created successfully',
          severity: 'success',
        });
      }

      handleClose();
      loadProducts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      try {
        const api = getProductsApi();
        await api.delete(deleteDialog.id);
        setSnackbar({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success',
        });
        loadProducts();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to delete product',
          severity: 'error',
        });
      }
    }
    setDeleteDialog({ open: false, id: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null });
  };

  const handleStockDialogOpen = (product: ProductData) => {
    setSelectedProduct(product);
    setStockAdjustment({ quantity: 0, type: 'add' });
    setStockDialogOpen(true);
  };

  const handleStockDialogClose = () => {
    setStockDialogOpen(false);
    setSelectedProduct(null);
    setStockAdjustment({ quantity: 0, type: 'add' });
  };

  const handleStockAdjust = async () => {
    if (!selectedProduct || stockAdjustment.quantity <= 0) {
      return;
    }

    try {
      const api = getProductsApi();
      await api.adjustStock(selectedProduct.id, stockAdjustment);
      setSnackbar({
        open: true,
        message: 'Stock adjusted successfully',
        severity: 'success',
      });
      handleStockDialogClose();
      loadProducts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to adjust stock',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === String(categoryId))?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Products
        </Typography>
        <Table>
          <TableBody>
            <TableSkeleton rows={5} columns={6} />
          </TableBody>
        </Table>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
      </Box>

      <Card>
        <CardContent>
          {sortedProducts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No products found. Click "Add Product" to create one.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table aria-label="Products list">
                <TableHead>
                  <TableRow>
                    <TableCell
                      scope="col"
                      aria-sort={orderBy === 'name' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <TableSortLabel
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        <strong>Name</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      scope="col"
                      aria-sort={orderBy === 'code' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <TableSortLabel
                        active={orderBy === 'code'}
                        direction={orderBy === 'code' ? order : 'asc'}
                        onClick={() => handleSort('code')}
                      >
                        <strong>Code</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      scope="col"
                      aria-sort={orderBy === 'categoryId' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <TableSortLabel
                        active={orderBy === 'categoryId'}
                        direction={orderBy === 'categoryId' ? order : 'asc'}
                        onClick={() => handleSort('categoryId')}
                      >
                        <strong>Category</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      scope="col"
                      align="right"
                      aria-sort={orderBy === 'costPrice' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <TableSortLabel
                        active={orderBy === 'costPrice'}
                        direction={orderBy === 'costPrice' ? order : 'asc'}
                        onClick={() => handleSort('costPrice')}
                      >
                        <strong>Cost Price</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      scope="col"
                      align="right"
                      aria-sort={orderBy === 'sellingPrice' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <TableSortLabel
                        active={orderBy === 'sellingPrice'}
                        direction={orderBy === 'sellingPrice' ? order : 'asc'}
                        onClick={() => handleSort('sellingPrice')}
                      >
                        <strong>Selling Price</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      scope="col"
                      align="right"
                      aria-sort={orderBy === 'currentStock' ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <TableSortLabel
                        active={orderBy === 'currentStock'}
                        direction={orderBy === 'currentStock' ? order : 'asc'}
                        onClick={() => handleSort('currentStock')}
                      >
                        <strong>Stock</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell scope="col" align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {product.name}
                          </Typography>
                          {product.sku && (
                            <Typography variant="caption" color="text.secondary">
                              SKU: {product.sku}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.categoryName || getCategoryName(product.categoryId)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.costPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.currentStock}
                          size="small"
                          color={
                            product.currentStock > product.reorderLevel
                              ? 'success'
                              : product.currentStock > 0
                              ? 'warning'
                              : 'error'
                          }
                        />
                        {product.lowStockAlert && product.currentStock <= product.reorderLevel && (
                          <Typography variant="caption" color="error" display="block">
                            Low stock!
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleStockDialogOpen(product)}
                          aria-label={`Adjust stock for ${product.name}`}
                        >
                          <InventoryIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpen(product)}
                          aria-label={`Edit ${product.name}`}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: COLORS.error }}
                          onClick={() => handleDeleteClick(product.id)}
                          aria-label={`Delete ${product.name}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Product Name"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Product Code"
                required
                fullWidth
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="SKU"
                fullWidth
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
              <TextField
                label="Barcode"
                fullWidth
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </Box>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Category"
                required
                select
                fullWidth
                SelectProps={{ native: true }}
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) || 0 })}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Unit of Measure"
                fullWidth
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Cost Price"
                type="number"
                required
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
              />
              <TextField
                label="Selling Price"
                type="number"
                required
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
              />
              <TextField
                label="Min Price"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: parseFloat(e.target.value) || 0 })}
              />
            </Box>
            {!editingProduct && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Initial Stock"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                />
                <TextField
                  label="Reorder Level"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onClose={handleStockDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Adjust Stock - {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Stock: {selectedProduct?.currentStock || 0}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Adjustment Type</InputLabel>
              <Select
                value={stockAdjustment.type}
                label="Adjustment Type"
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, type: e.target.value as 'add' | 'subtract' | 'set' })}
              >
                <MenuItem value="add">Add Stock</MenuItem>
                <MenuItem value="subtract">Remove Stock</MenuItem>
                <MenuItem value="set">Set Stock Level</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              value={stockAdjustment.quantity}
              onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value) || 0 })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStockDialogClose}>Cancel</Button>
          <Button
            onClick={handleStockAdjust}
            variant="contained"
            disabled={stockAdjustment.quantity <= 0}
          >
            Adjust Stock
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;
