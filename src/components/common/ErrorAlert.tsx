import React from 'react';
import { Alert, Box } from '@mui/material';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <Box my={2}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
};

export default ErrorAlert;
