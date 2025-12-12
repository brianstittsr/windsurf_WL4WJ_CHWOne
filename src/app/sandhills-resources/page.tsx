'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { SandhillsResourcesList } from '@/components/SandhillsResources';

function SandhillsResourcesPageContent() {
  return (
    <UnifiedLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SandhillsResourcesList />
      </Container>
    </UnifiedLayout>
  );
}

export default function SandhillsResourcesPage() {
  return (
    <AuthProvider>
      <SandhillsResourcesPageContent />
    </AuthProvider>
  );
}
