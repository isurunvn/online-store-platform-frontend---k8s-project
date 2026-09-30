import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Chip, Box } from '@mui/material';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="div"
        sx={{
          pt: '100%',
          backgroundColor: '#e0e0e0',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography color="text.secondary">Image Placeholder</Typography>
        </Box>
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {product.description}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Chip 
            label={product.stockQuantity > 0 ? `In Stock: ${product.stockQuantity}` : 'Out of Stock'} 
            color={product.stockQuantity > 0 ? "success" : "error"} 
            size="small"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Category: {product.categoryName || product.categoryId}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/products/${product.id}`}>
          View Details
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          disabled={product.stockQuantity === 0}
          onClick={() => addToCart(product, 1)}
          sx={{ ml: 'auto' }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
