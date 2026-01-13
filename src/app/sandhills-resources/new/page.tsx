'use client';

import React from 'react';
import { Container } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourceForm } from '@/components/SandhillsResources';

function NewResourcePageContent() {
  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <SandhillsResourceForm />
      </Container>
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
