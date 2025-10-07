'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  Folder as FolderIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Shield as ShieldIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2a 0%, #16213e 50%, #0f0f1a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: 'primary.main', mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading CHWOne Platform...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Temporary bypass for development - remove in production
  // if (!currentUser) {
  //   redirect('/login');
  // }

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Community Health Workers',
      description: 'Manage and track CHW activities, training, and performance across communities.'
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 32, color: 'secondary.main' }} />,
      title: 'Project Management',
      description: 'Oversee community health initiatives, track budgets, and monitor outcomes.'
    },
    {
      icon: <DescriptionIcon sx={{ fontSize: 32, color: 'success.main' }} />,
      title: 'Grant Management',
      description: 'Track funding opportunities, manage applications, and monitor grant utilization.'
    },
    {
      icon: <SendIcon sx={{ fontSize: 32, color: 'info.main' }} />,
      title: 'Referral System',
      description: 'Streamline client referrals between healthcare providers and community services.'
    },
    {
      icon: <FolderIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
      title: 'Resource Library',
      description: 'Access training materials, best practices, and community health resources.'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 32, color: 'error.main' }} />,
      title: 'Reports & Analytics',
      description: 'Generate insights on program effectiveness and community health outcomes.'
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <Box sx={{
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2a 0%, #16213e 50%, #0f0f1a 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Building bridges between
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 700,
                    mb: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  wellness and justice
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: 500
                  }}
                >
                  Empowering Community Health Workers to build stronger, healthier communities through innovative technology and data-driven insights.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/dashboard"
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8]
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Go to Dashboard
                    <ChevronRightIcon sx={{ ml: 1 }} />
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    href="/chws"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Manage CHWs
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: 300, md: 400 },
                position: 'relative'
              }}>
                {/* Placeholder for hero image/illustration */}
                <Box sx={{
                  width: { xs: 250, md: 350 },
                  height: { xs: 250, md: 350 },
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 6s ease-in-out infinite'
                }}>
                  <Avatar
                    sx={{
                      width: { xs: 100, md: 150 },
                      height: { xs: 100, md: 150 },
                      bgcolor: 'primary.main'
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: { xs: 50, md: 75 } }} />
                  </Avatar>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
              Powerful Tools for Community Health
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Comprehensive platform designed to streamline CHW operations, enhance community outreach, and improve health outcomes.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                500+
              </Typography>
              <Typography variant="h6">
                Active CHWs
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                50+
              </Typography>
              <Typography variant="h6">
                Communities Served
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                25+
              </Typography>
              <Typography variant="h6">
                Active Projects
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                $2M+
              </Typography>
              <Typography variant="h6">
                Grant Funding
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Card sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <ShieldIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              HIPAA Compliant Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your data is secured with enterprise-grade encryption and strict privacy regulations.
              All client information is protected and access is logged for audit purposes.
            </Typography>
            <Chip
              icon={<ShieldIcon />}
              label="Enterprise Security"
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={<SchoolIcon />}
              label="HIPAA Compliant"
              color="secondary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={<PeopleIcon />}
              label="Community Focused"
              color="success"
              variant="outlined"
            />
          </Card>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </MainLayout>
  );
}
