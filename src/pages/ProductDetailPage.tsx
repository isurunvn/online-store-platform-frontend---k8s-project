import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Paper, IconButton, Chip } from '@mui/material';
import { Add, Remove, ArrowBack } from '@mui/icons-material';
import { productService } from '../api/services/productService';
import { Product } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { useCart } from '../hooks/useCart';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !product) return <ErrorAlert message={error || 'Product not found'} />;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <Box>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                width: '100%', 
                paddingTop: '100%', 
                backgroundColor: '#f5f5f5', 
                position: 'relative',
                borderRadius: 2
              }}
            >
              <Typography 
                color="text.secondary" 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                Image Placeholder
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Chip 
              label={product.categoryName || `Category ${product.categoryId}`} 
              size="small" 
              sx={{ mb: 2 }} 
            />
            
            <Typography variant="h4" color="primary" gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>
            
            <Typography variant="body1" paragraph color="text.secondary" sx={{ mt: 2, mb: 4 }}>
              {product.description}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Typography variant="subtitle1">Quantity:</Typography>
              <Box display="flex" alignItems="center" border="1px solid #e0e0e0" borderRadius={1}>
                <IconButton 
                  size="small" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {product.stockQuantity} available
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              color="primary"
              fullWidth
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
            >
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductDetailPage;
