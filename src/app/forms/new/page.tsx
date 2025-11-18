'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import FormsManagement from '@/components/Forms/FormsManagement';

// Inner component that uses auth context
function CreateFormContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  // Redirect to forms management page which will handle the create modal
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=/forms/new');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </MainLayout>
    );
  }

  if (!currentUser) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h5" color="error">
            Please sign in to create forms
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <MuiLink component={Link} href="/" color="inherit">
            Home
          </MuiLink>
          <MuiLink component={Link} href="/forms" color="inherit">
            Forms
          </MuiLink>
          <Typography color="text.primary">Create New Form</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Form Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage custom forms for data collection. Click "New Form" to get started.
          </Typography>
        </Box>

        {/* Forms Management Component with Builder */}
        <FormsManagement />
      </Container>
    </MainLayout>
  );
}

// Main component with AuthProvider
export default function CreateFormPage() {
  return (
    <AuthProvider>
      <CreateFormContent />
    </AuthProvider>
  );
}
