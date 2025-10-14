'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { Box, Button, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import FormsManagement from '@/components/Forms/FormsManagement';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function FormsContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <AnimatedLoading message="Loading Forms..." />;
  }

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
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
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function FormsPage() {
  return (
    <AuthProvider>
      <FormsContent />
    </AuthProvider>
  );
}
