import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { Typography, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, initialized, keycloak } = useAuth();

  if (!initialized) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !keycloak.hasRealmRole(requiredRole)) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography>You do not have the required role ({requiredRole}) to view this page.</Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
