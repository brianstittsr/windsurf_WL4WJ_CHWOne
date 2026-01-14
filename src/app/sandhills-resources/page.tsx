'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourcesList } from '@/components/SandhillsResources';

function SandhillsResourcesPageContent() {
  return (
    <AdminLayout>
      <SandhillsResourcesList />
    </AdminLayout>
  );
}

export default function SandhillsResourcesPage() {
  return (
    <AuthProvider>
      <SandhillsResourcesPageContent />
    </AuthProvider>
  );
}
