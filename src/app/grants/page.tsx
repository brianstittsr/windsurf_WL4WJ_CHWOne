'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import GrantManagement from '@/components/Grants/GrantManagement';
import { Box, Typography } from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function GrantsContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Grants..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Grant Management</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Track funding opportunities, manage grant applications, and monitor funding for CHW programs and initiatives</Typography>
        <GrantManagement />
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function GrantsPage() {
  return (
    <AuthProvider>
      <GrantsContent />
    </AuthProvider>
  );
}
