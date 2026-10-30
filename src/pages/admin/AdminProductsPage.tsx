import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { productService } from '../../api/services/productService';
import { Product, Category } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', description: '', price: 0, stockQuantity: 0, categoryId: undefined
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [data, categoryData] = await Promise.all([productService.getProducts(0, 100), productService.getCategories()]);
      setCategories(categoryData); // Fetch a bunch for admin view
      setProducts(data.content);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', price: 0, stockQuantity: 0, categoryId: categories[0]?.id });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    if (!formData.categoryId || !formData.name?.trim() || !Number.isFinite(formData.price) || Number(formData.price) <= 0 || !Number.isInteger(formData.stockQuantity) || Number(formData.stockQuantity) < 0) {
      setError('Enter a name, positive price, whole nonnegative stock, and select a category.');
      return;
    }
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData);
      } else {
        await productService.createProduct(formData);
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Manage Products
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      {error && <ErrorAlert message={error} />}

      <Box display="flex" gap={2} mb={3}>
        <TextField label="New category" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
        <Button disabled={!categoryName.trim()} onClick={async () => {
          try {
            await productService.createCategory(categoryName.trim());
            setCategoryName('');
            await fetchProducts();
          } catch { setError('Failed to create category'); }
        }}>Create Category</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>{product.categoryName || product.categoryId}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(product)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name || ''}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <TextField
              label="Description"
              fullWidth
              multiline rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={formData.price || 0}
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
            />
            <TextField
              label="Stock Quantity"
              type="number"
              fullWidth
              value={formData.stockQuantity || 0}
              onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
            />
            <TextField
              select
              label="Category"
              fullWidth
              value={formData.categoryId || ''}
              onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
            >
              {categories.map(category => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductsPage;
