'use client';

import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardContent from '@/components/Dashboard/DashboardContent';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// ULTRA-SIMPLIFIED Dashboard - NO blocking operations
function Dashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }
  
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
