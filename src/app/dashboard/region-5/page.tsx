'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import RegionDashboard from '@/components/Dashboard/RegionDashboard';

function Region5PageContent() {
  return (
    <UnifiedLayout>
      <RegionDashboard regionId="region-5" />
    </UnifiedLayout>
  );
}

export default function Region5Page() {
  return (
    <AuthProvider>
      <Region5PageContent />
    </AuthProvider>
  );
}
