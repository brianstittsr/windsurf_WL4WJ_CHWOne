'use client';

import React from 'react';
import { Container } from '@mui/material';
import { useParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourceDetail } from '@/components/SandhillsResources';

function ResourceDetailPageContent() {
  const params = useParams();
  const resourceId = params?.id as string;

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <SandhillsResourceDetail resourceId={resourceId} />
      </Container>
    </AdminLayout>
  );
}

export default function ResourceDetailPage() {
  return (
    <AuthProvider>
      <ResourceDetailPageContent />
    </AuthProvider>
  );
}
