import React, { useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="60vh"
    >
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please log in to your account to access all features.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => login()}
          fullWidth
          sx={{ mt: 2 }}
        >
          Login with Keycloak
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
