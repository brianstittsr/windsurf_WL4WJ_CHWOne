'use client';

import React from 'react';
import { Container, Box } from '@mui/material';
import MockCHWProfiles from '@/components/CHW/MockCHWProfiles';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function MockCHWProfilesPage() {
  return (
    <AuthProvider>
      <UnifiedLayout>
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <MockCHWProfiles />
          </Box>
        </Container>
      </UnifiedLayout>
    </AuthProvider>
  );
}
