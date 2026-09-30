import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Button, Divider } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../api/services/orderService';
import ErrorAlert from '../components/common/ErrorAlert';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await orderService.createOrder({
        orderItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });

      clearCart();
      navigate('/orders');
    } catch (err) {
      setError('Checkout failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      {error && <ErrorAlert message={error} />}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Paper key={item.product.id} sx={{ p: 2, mb: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={2}>
                  <Box sx={{ pt: '100%', backgroundColor: '#eee', borderRadius: 1 }} />
                </Grid>
                <Grid item xs={9} sm={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    $\{(item.product.price).toFixed(2)} each
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <IconButton 
                      size="small"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                    <IconButton 
                      size="small"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stockQuantity}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2} display="flex" justifyContent="flex-end">
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2, display: { sm: 'none' } }}>
                    $\{(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                  <IconButton color="error" onClick={() => removeFromCart(item.product.id)}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Items ({totalItems}):</Typography>
              <Typography>${totalPrice.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Shipping:</Typography>
              <Typography>Free</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (isAuthenticated ? 'Checkout' : 'Login to Checkout')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;
