'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import {
  Box,
  Button,
  Typography,
  Grid,
  useTheme,
  Container
} from '@mui/material';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import {
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import HeroCarousel from '@/components/Home/HeroCarousel';

// Create a wrapper component that includes AuthProvider
function HomePage() {
  const { currentUser, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return <AnimatedLoading />;
  }

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#1a365d' }} />,
      title: 'Community Health Workers',
      description: 'Manage and track CHW activities, training, and performance across communities.'
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: '#1a365d' }} />,
      title: 'Project Management',
      description: 'Oversee community health initiatives, track budgets, and monitor outcomes.'
    },
    {
      icon: <DescriptionIcon sx={{ fontSize: 40, color: '#1a365d' }} />,
      title: 'Grant Management',
      description: 'Track funding opportunities, manage applications, and monitor grant utilization.'
    }
  ];

  return (
    <UnifiedLayout fullWidth={true}>
      {/* Hero Carousel */}
      <HeroCarousel isLoggedIn={!!currentUser} />

      {/* Features Section */}
      <Box sx={{ py: 10, background: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#1a365d' }}>
              Powerful Tools for Community Health
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Our platform streamlines CHW operations, enhances community outreach, and improves health outcomes.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ 
                  p: 4, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, background: '#ffffff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#1a365d' }}>
                Ready to transform community health?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                Join our platform today and be part of the movement to build healthier, more equitable communities.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href={currentUser ? '/dashboard' : '/register'}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1.1rem'
                }}
              >
                {currentUser ? 'Go to Dashboard' : 'Join Now'}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                height: 300,
                width: '100%',
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 50%, #2c5282 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  p: 4,
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Building Healthier Communities Together
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function Home() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}
