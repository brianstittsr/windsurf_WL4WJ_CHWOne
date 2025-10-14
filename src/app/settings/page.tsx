'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import SettingsManagement from '@/components/Settings/SettingsManagement';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

// Inner component that uses the auth context
function SettingsContent() {
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
          <Typography sx={{ color: 'white' }}>Loading Settings...</Typography>
        </Box>
      </Box>
    );
  }

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <Container component="main" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Platform Settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Configure user accounts, permissions, notifications, and system preferences</Typography>
      <SettingsManagement />
    </Container>
  );
}

// Export the wrapped component with AuthProvider
export default function SettingsPage() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
}
