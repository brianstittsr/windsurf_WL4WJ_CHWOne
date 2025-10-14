'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

// Loading component
const LoadingComponent = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  }}>
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 2 }}>Loading CHWOne Platform...</Typography>
  </Box>
);

// Dynamically import the home page content with no SSR
const HomeContent = dynamic(() => import('@/components/Home/HomeContent'), { 
  ssr: false,
  loading: () => <LoadingComponent />
});

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingComponent />;
  }

  return <HomeContent />;
}
