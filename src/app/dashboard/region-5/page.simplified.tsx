'use client';

import React from 'react';
import { Box, Typography, Container, Card, CardContent, Grid, Paper, Button } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

function Region5DashboardContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AnimatedLoading message="Loading Region 5 Dashboard..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  // Simple stats for the dashboard
  const stats = [
    { title: 'Active CHWs', value: '12', color: '#1976d2' },
    { title: 'Active Projects', value: '8', color: '#9c27b0' },
    { title: 'Forms Submitted', value: '45', color: '#2e7d32' },
    { title: 'Training Sessions', value: '12', color: '#ed6c02' }
  ];

  return (
    <UnifiedLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Region 5 Dashboard
          </Typography>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    borderTop: `4px solid ${stat.color}`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Directory Card */}
          <Card sx={{ mb: 4, bgcolor: '#1a365d', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Region 5 CHW Directory
                  </Typography>
                  <Typography variant="body1">
                    Connect with fellow Community Health Workers in Region 5.
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    component={Link}
                    href="/dashboard/region-5/directory"
                    variant="contained"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    Browse Directory
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Networking Card */}
          <Card sx={{ mb: 4, bgcolor: '#9c27b0', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                    CHW Networking Hub
                  </Typography>
                  <Typography variant="body1">
                    Connect with other CHWs and build your professional network.
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    component={Link}
                    href="/dashboard/region-5/networking"
                    variant="contained"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    Join Discussions
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </UnifiedLayout>
  );
}

export default function Region5Dashboard() {
  return (
    <AuthProvider>
      <Region5DashboardContent />
    </AuthProvider>
  );
}
