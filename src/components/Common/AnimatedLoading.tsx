'use client';

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface AnimatedLoadingProps {
  message?: string;
}

// Simplified loading component that doesn't show a full-screen splash
export default function AnimatedLoading({ message = 'Loading...' }: AnimatedLoadingProps) {
  // Return a minimal loading indicator instead of a full splash screen
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 2
    }}>
      <CircularProgress size={24} />
    </Box>
  );
}
