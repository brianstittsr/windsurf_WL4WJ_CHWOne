'use client';

import React from 'react';
import { Container } from '@mui/material';
import { useParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { SandhillsResourceForm } from '@/components/SandhillsResources';

function EditResourcePageContent() {
  const params = useParams();
  const resourceId = params?.id as string;

  return (
    <UnifiedLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <SandhillsResourceForm resourceId={resourceId} />
      </Container>
    </UnifiedLayout>
  );
}

export default function EditResourcePage() {
  return (
    <AuthProvider>
      <EditResourcePageContent />
    </AuthProvider>
  );
}
