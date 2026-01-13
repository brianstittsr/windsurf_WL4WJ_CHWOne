'use client';

import React from 'react';
import { Container, Box } from '@mui/material';
import MockCHWProfiles from '@/components/CHW/MockCHWProfiles';
import AdminLayout from '@/components/Layout/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function MockCHWProfilesPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <MockCHWProfiles />
          </Box>
        </Container>
      </AdminLayout>
    </AuthProvider>
  );
}
