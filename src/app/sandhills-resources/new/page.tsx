'use client';

import React from 'react';
import { Container } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { SandhillsResourceForm } from '@/components/SandhillsResources';

function NewResourcePageContent() {
  return (
    <UnifiedLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <SandhillsResourceForm />
      </Container>
    </UnifiedLayout>
  );
}

export default function NewResourcePage() {
  return (
    <AuthProvider>
      <NewResourcePageContent />
    </AuthProvider>
  );
}
