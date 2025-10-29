'use client';

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Dashboard Not Found Page
 * 
 * This component handles 404 errors for the dashboard route.
 * It provides a user-friendly message and options to navigate back.
 */
export default function DashboardNotFound() {
  const router = useRouter();
  
  return (
    <AuthProvider>
      <UnifiedLayout>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a365d' }}>
            Dashboard Not Found
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
            We couldn't find the dashboard you're looking for. This might be due to an authentication issue or a temporary problem.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => router.push('/dashboard')}
              sx={{ py: 1.5 }}
            >
              Try Again
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => router.push('/')}
              sx={{ py: 1.5 }}
            >
              Go to Home
            </Button>
            
            <Button 
              variant="text" 
              color="primary" 
              size="large"
              onClick={() => {
                // Clear any cached auth data
                localStorage.removeItem('authSession');
                sessionStorage.removeItem('loginSuccess');
                sessionStorage.removeItem('loginTime');
                
                // Redirect to login
                router.push('/login');
              }}
              sx={{ py: 1.5 }}
            >
              Sign In Again
            </Button>
          </Box>
        </Container>
      </UnifiedLayout>
    </AuthProvider>
  );
}
