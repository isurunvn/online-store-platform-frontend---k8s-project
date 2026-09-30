import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import keycloak from './keycloak';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminProductsPage from './pages/admin/AdminProductsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    }
  },
});

const App = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={{ onLoad: 'check-sso' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/orders" 
                  element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} 
                />
                <Route 
                  path="/profile" 
                  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/products" 
                  element={<ProtectedRoute requiredRole="ADMIN"><AdminProductsPage /></ProtectedRoute>} 
                />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </ReactKeycloakProvider>
  );
};

export default App;
