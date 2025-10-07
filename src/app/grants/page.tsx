'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import GrantManagement from '@/components/Grants/GrantManagement';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

export default function GrantsPage() {
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
          <Typography sx={{ color: 'white' }}>Loading Grants...</Typography>
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
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Grant Management</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Track funding opportunities, manage grant applications, and monitor funding for CHW programs and initiatives</Typography>
      <GrantManagement />
    </Container>
  );
}
