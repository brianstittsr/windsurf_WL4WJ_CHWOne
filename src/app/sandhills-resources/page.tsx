'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { SandhillsResourcesList } from '@/components/SandhillsResources';

function SandhillsResourcesPageContent() {
  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SandhillsResourcesList />
      </Container>
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
