import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = ({ text = 'Loading...', size = 'medium' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }}
  >
    <CircularProgress 
      size={size === 'small' ? 24 : size === 'large' ? 48 : 36}
      color="primary"
    />
    {text && (
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    )}
  </Box>
);

export default LoadingSpinner;
