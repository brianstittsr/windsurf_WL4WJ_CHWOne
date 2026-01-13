'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import RegionDashboard from '@/components/Dashboard/RegionDashboard';

function Region5PageContent() {
  return (
    <AdminLayout>
      <RegionDashboard regionId="region-5" />
    </AdminLayout>
  );
}

export default function Region5Page() {
  return (
    <AuthProvider>
      <Region5PageContent />
    </AuthProvider>
  );
}
