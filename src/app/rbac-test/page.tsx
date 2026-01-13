'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import RbacTestComponent from '@/components/RbacTestComponent';

export default function RbacTestPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            RBAC Disabled Test Page
          </Typography>
          
          <Typography variant="body1" paragraph>
            This page tests whether RBAC (Role-Based Access Control) has been successfully disabled.
            If RBAC is disabled, all users should have admin privileges and full access to all features.
          </Typography>
          
          <RbacTestComponent />
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Testing Instructions:
            </Typography>
            
            <ol>
              <li>
                <Typography variant="body1" paragraph>
                  Log in with any user account (existing or newly created)
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Check that the user automatically has ADMIN role and full permissions
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Verify that all menu items and features are accessible
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Try creating a new user and confirm they also have full access
                </Typography>
              </li>
            </ol>
          </Box>
        </Container>
      </AdminLayout>
    </AuthProvider>
  );
}
