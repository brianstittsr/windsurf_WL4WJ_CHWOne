'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourceForm } from '@/components/SandhillsResources';

function EditResourcePageContent() {
  const params = useParams();
  const resourceId = params?.id as string;

  return (
    <AdminLayout>
      <SandhillsResourceForm resourceId={resourceId} />
    </AdminLayout>
  );
}

export default function EditResourcePage() {
  return (
    <AuthProvider>
      <EditResourcePageContent />
    </AuthProvider>
  );
}
