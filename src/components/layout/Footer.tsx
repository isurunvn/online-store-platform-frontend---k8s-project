import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {'© '}
        {new Date().getFullYear()}
        {' Online Store Platform. All rights reserved.'}
      </Typography>
    </Box>
  );
};

export default Footer;
