'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Region5Directory from '@/components/Resources/Region5Directory';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

export default function ResourcesPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: 'white', mb: 3 }} />
          <Typography sx={{ color: 'white' }}>Loading Resources...</Typography>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <Container component="main" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Resource Directory</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Access healthcare resources, community services, and support networks.</Typography>
      <Region5Directory />
    </Container>
  );
}
