'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AnimatedLoading({ message = 'Loading CHWOne Platform...' }) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
