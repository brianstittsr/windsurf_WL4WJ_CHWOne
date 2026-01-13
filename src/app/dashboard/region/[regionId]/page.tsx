'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import RegionDashboard from '@/components/Dashboard/RegionDashboard';

function RegionPageContent() {
  const params = useParams();
  const regionId = params.regionId as string;

  return (
    <AdminLayout>
      <RegionDashboard regionId={regionId} />
    </AdminLayout>
  );
}

export default function RegionPage() {
  return (
    <AuthProvider>
      <RegionPageContent />
    </AuthProvider>
  );
}
