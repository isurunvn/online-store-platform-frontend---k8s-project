import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading = false }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" color="text.secondary">No products found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {products.map((product) => (
        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;
