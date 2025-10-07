'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { Container, Box, CircularProgress, Button, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import FormsManagement from '@/components/Forms/FormsManagement';

export default function FormsPage() {
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
          <Typography sx={{ color: 'white' }}>Loading Forms...</Typography>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Forms Management</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Create, manage, and analyze health assessment forms and data collection tools for Community Health Workers</Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button component={Link} href="/forms/new" variant="contained">Create Form</Button>
          <Button component={Link} href="/forms/builder" variant="contained" color="secondary">AI Form Builder</Button>
          <Button component={Link} href="/forms/templates" variant="outlined">Form Templates</Button>
        </Stack>
      </Box>
      
      <FormsManagement />
    </Container>
  );
}
