'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Region5Directory from '@/components/Resources/Region5Directory';
import { Box, Typography } from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function ResourcesContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Resources..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Resource Directory</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Access healthcare resources, community services, and support networks.</Typography>
        <Region5Directory />
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ResourcesPage() {
  return (
    <AuthProvider>
      <ResourcesContent />
    </AuthProvider>
  );
}
