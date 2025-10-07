'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Container, Box, Button, CircularProgress, AppBar, Toolbar, Typography, Stack, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { Lock as LockIcon } from '@mui/icons-material';


export default function MagicHome() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
            CHWOne Platform
          </Typography>
        </Box>
      </Box>
    );
  }

  // Allow access to magic-home page without authentication

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation */}
      <AppBar position="sticky" color="default" elevation={1} sx={{ backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Typography variant="h6" component={Link} href="/" sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit', flexGrow: 0 }}>
            CHWOne
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 4, alignItems: 'center' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
            <Link href="/chws" style={{ textDecoration: 'none', color: 'inherit' }}>CHWs</Link>
            <Link href="/projects" style={{ textDecoration: 'none', color: 'inherit' }}>Projects</Link>
            
            {currentUser ? (
              <Image 
                src={currentUser.photoURL || '/images/CHWOneLogoDesign.png'} 
                width={32}
                height={32}
                alt="User avatar"
                style={{ borderRadius: '50%' }}
              />
            ) : (
              <Button component={Link} href="/login" variant="outlined" size="small">
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: 5, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Building bridges between</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>wellness and justice</Typography>
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3 }}>Welcome to CHWOne</Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: '600px' }}>
          Empowering Community Health Workers with comprehensive tools for client management, resource coordination, and impact tracking.
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 5 }}>
          <Button component={Link} href="/dashboard" variant="contained" size="large">
            Access Dashboard
          </Button>
          <Button component={Link} href="/resources" variant="outlined" size="large">
            Browse Resources
          </Button>
        </Stack>

        <Card sx={{ maxWidth: '600px', boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <LockIcon /> HIPAA Compliant Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All client data is encrypted, access is logged for audit purposes, and privacy regulations are strictly enforced.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
