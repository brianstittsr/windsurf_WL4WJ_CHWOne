'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReferralManagement from '@/components/Referrals/ReferralManagement';
import { Box, Typography } from '@mui/material';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function ReferralsContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Referrals..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <AdminLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Referral Management</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Track client referrals, coordinate care transitions, and manage service connections.</Typography>
        <ReferralManagement />
      </Box>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ReferralsPage() {
  return (
    <AuthProvider>
      <ReferralsContent />
    </AuthProvider>
  );
}
