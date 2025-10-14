'use client';

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

function HomeContentInner() {
  const { currentUser, loading } = useAuth();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      color: '#333333',
    }}>
      <Box component="header" sx={{ 
        p: 2, 
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              CHWOne Platform
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentUser ? (
                <Button 
                  variant="contained" 
                  component={Link}
                  href="/dashboard"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={Link}
                    href="/register"
                  >
                    Register
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link}
                    href="/login"
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 8, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#1a365d' }}>
            Welcome to CHWOne Platform
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: '#64748b', maxWidth: 800, mx: 'auto' }}>
            Empowering Community Health Workers with comprehensive tools for client management, resource coordination, and impact tracking.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              href={currentUser ? "/dashboard" : "/login"}
              sx={{ py: 1.5, px: 4 }}
            >
              {currentUser ? "Go to Dashboard" : "Get Started"}
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              component={Link}
              href="/about"
              sx={{ py: 1.5, px: 4 }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>

      <Box component="footer" sx={{ p: 4, bgcolor: '#1a365d', color: 'white', textAlign: 'center' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} CHWOne Platform. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default function HomeContent() {
  return (
    <AuthProvider>
      <HomeContentInner />
    </AuthProvider>
  );
}
