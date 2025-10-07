'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import DashboardPlaceholder from '@/components/Dashboard/DashboardPlaceholder';

export default function DashboardPage() {
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
          <Typography sx={{ color: 'white' }}>Loading CHWOne Platform...</Typography>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <Box component="main" sx={{ p: 4 }}>
      <Container>
        <Typography variant="h3" component="h1" sx={{ mb: 3 }}>CHWOne Dashboard</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Overview of platform metrics, active projects, and key performance indicators</Typography>
        <DashboardPlaceholder />
      </Container>
    </Box>
  );
}
