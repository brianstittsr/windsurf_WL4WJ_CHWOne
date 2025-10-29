'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import WorkforceDevelopment from '@/components/Workforce/WorkforceDevelopment';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

export default function WorkforcePage() {
  const { currentUser, loading } = useAuth();

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
          <Typography sx={{ color: 'white' }}>Loading Workforce Development...</Typography>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <Container component="main" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Workforce Development</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Manage training programs, job opportunities, and career development for Community Health Workers</Typography>
      <WorkforceDevelopment />
    </Container>
  );
}
