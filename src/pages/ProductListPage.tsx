import React, { useEffect, useState } from 'react';
import { Typography, Box, Pagination, TextField } from '@mui/material';
import ProductGrid from '../components/product/ProductGrid';
import { productService } from '../api/services/productService';
import { Product, PagedResponse } from '../types';
import ErrorAlert from '../components/common/ErrorAlert';

const ProductListPage: React.FC = () => {
  const [productsPage, setProductsPage] = useState<PagedResponse<Product> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');

  const fetchProducts = async (pageNumber: number) => {
    try {
      setLoading(true);
      const data = await productService.getProducts(pageNumber, 12);
      setProductsPage(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const filteredProducts = productsPage?.content.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {error && <ErrorAlert message={error} />}

      <ProductGrid products={filteredProducts} loading={loading} />

      {productsPage && productsPage.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination 
            count={productsPage.totalPages} 
            page={page + 1} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductListPage;
