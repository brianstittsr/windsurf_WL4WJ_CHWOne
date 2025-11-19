'use client';

import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import EnhancedProfileComponent from '@/components/CHW/EnhancedProfileComponent';
import RoleSwitcher from '@/components/Layout/RoleSwitcher';

function ProfilePageContent() {
  return (
    <UnifiedLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              My Profile
            </Typography>
            <RoleSwitcher />
          </Box>
          <EnhancedProfileComponent editable={true} />
        </Box>
      </Container>
    </UnifiedLayout>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfilePageContent />
    </AuthProvider>
  );
}
