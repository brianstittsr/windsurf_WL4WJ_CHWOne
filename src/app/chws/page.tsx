'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CHWManagement from '@/components/CHW/CHWManagement';
import { Box, Typography } from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function CHWsContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading CHW Management..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Community Health Workers</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Manage and coordinate CHWs across your organization.</Typography>
        <CHWManagement />
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function CHWsPage() {
  return (
    <AuthProvider>
      <CHWsContent />
    </AuthProvider>
  );
}
