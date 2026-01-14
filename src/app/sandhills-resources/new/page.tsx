'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourceForm } from '@/components/SandhillsResources';

function NewResourcePageContent() {
  return (
    <AdminLayout>
      <SandhillsResourceForm />
    </AdminLayout>
  );
}

export default function NewResourcePage() {
  return (
    <AuthProvider>
      <NewResourcePageContent />
    </AuthProvider>
  );
}
