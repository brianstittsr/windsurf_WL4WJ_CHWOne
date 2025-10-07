'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CHWManagement from '@/components/CHW/CHWManagement';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

export default function CHWsPage() {
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
          <Typography sx={{ color: 'white' }}>Loading CHW Management...</Typography>
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
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Community Health Workers</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Manage and coordinate CHWs across your organization.</Typography>
      <CHWManagement />
    </Container>
  );
}
