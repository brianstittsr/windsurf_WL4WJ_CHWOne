'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { SchemaManager, UnifiedLayout, AnimatedLoading } from '@/components';

// Inner component that uses the auth context
function SchemaManagerPage() {
  const { currentUser, loading, userProfile } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Schema Manager..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  // Only allow admins to access this page
  if (userProfile?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <SchemaManager />
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function SchemaManagerPageWrapper() {
  return (
    <AuthProvider>
      <SchemaManagerPage />
    </AuthProvider>
  );
}
