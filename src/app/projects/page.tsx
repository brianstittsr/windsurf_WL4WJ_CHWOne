'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProjectManagement from '@/components/Projects/ProjectManagement';
import { Box, Typography } from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function ProjectsContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Projects..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Project Management</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Coordinate and track health initiatives, community programs, and CHW assignments across your organization</Typography>
        <ProjectManagement />
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ProjectsPage() {
  return (
    <AuthProvider>
      <ProjectsContent />
    </AuthProvider>
  );
}
