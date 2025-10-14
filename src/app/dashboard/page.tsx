'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import DashboardContent from '@/components/Dashboard/DashboardContent';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Dashboard component that uses the auth context
function Dashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Dashboard..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <UnifiedLayout>
      <DashboardContent />
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function DashboardPage() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
