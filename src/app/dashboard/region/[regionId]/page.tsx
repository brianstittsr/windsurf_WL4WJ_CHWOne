'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import RegionDashboard from '@/components/Dashboard/RegionDashboard';

function RegionPageContent() {
  const params = useParams();
  const regionId = params.regionId as string;

  return (
    <UnifiedLayout>
      <RegionDashboard regionId={regionId} />
    </UnifiedLayout>
  );
}

export default function RegionPage() {
  return (
    <AuthProvider>
      <RegionPageContent />
    </AuthProvider>
  );
}
