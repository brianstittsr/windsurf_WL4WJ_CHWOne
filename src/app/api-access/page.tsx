'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Box, CircularProgress, Button, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import APIAccess from '@/components/API/APIAccess';

// Inner component that uses the auth context
function APIAccessContent() {
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
          <Typography sx={{ color: 'white' }}>Loading API Access...</Typography>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>API Access Management</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Configure API keys, manage integrations, and monitor external service connections for the CHWOne platform</Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button component={Link} href="/api-access/keys" variant="contained">Manage API Keys</Button>
          <Button component={Link} href="/api-access/docs" variant="outlined">View Documentation</Button>
        </Stack>
      </Box>
      
      <APIAccess />
    </Container>
  );
}

// Export the wrapped component with AuthProvider
export default function APIAccessPage() {
  return (
    <AuthProvider>
      <APIAccessContent />
    </AuthProvider>
  );
}
