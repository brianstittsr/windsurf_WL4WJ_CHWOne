'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import { Group, ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Folder as FolderIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { Region5Logo } from '@/components/Logos';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function Region5DashboardContent() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { metrics, loading: metricsLoading, error } = useDashboardMetrics('region5');

  if (loading) {
    return <AnimatedLoading message="Loading Region 5 Dashboard..." />;
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const stats = [
    {
      title: 'Active CHWs',
      value: metricsLoading ? '...' : metrics?.activeUsers.toString() || '0',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      trend: '+12%',
      color: 'primary.main'
    },
    {
      title: 'Active Projects',
      value: metricsLoading ? '...' : metrics?.totalForms.toString() || '0',
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      trend: '+3',
      color: 'secondary.main'
    },
    {
      title: 'Forms Submitted',
      value: metricsLoading ? '...' : metrics?.totalSubmissions.toString() || '0',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      trend: '+24',
      color: 'success.main'
    },
    {
      title: 'Training Sessions',
      value: metricsLoading ? '...' : '12', // Mock for now
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      trend: '+2',
      color: 'warning.main'
    }
  ];

  const recentActivities = [
    { type: 'form', title: 'Community Health Assessment completed by Maria G.', time: '2 hours ago' },
    { type: 'training', title: 'Diabetes Prevention Workshop scheduled', time: '4 hours ago' },
    { type: 'project', title: 'New CHW onboarding program launched', time: '1 day ago' },
    { type: 'report', title: 'Monthly progress report generated', time: '2 days ago' }
  ];

  return (
    <UnifiedLayout>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Region5Logo size="large" />
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {stat.icon}
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={stat.trend}
                        size="small"
                        sx={{
                          bgcolor: 'success.light',
                          color: 'success.dark',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Region 5 Directory */}
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Group sx={{ fontSize: 48, color: 'white' }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Region 5 CHW Directory
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Connect with fellow Community Health Workers in Region 5. View profiles, share resources, and collaborate on community health initiatives.
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  component={Link}
                  href="/dashboard/region-5/directory"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
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

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Recent Activities
                </Typography>
                <Stack spacing={2}>
                  {recentActivities.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 1,
                        bgcolor: theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Box sx={{ mr: 2 }}>
                        {activity.type === 'form' && <DescriptionIcon color="primary" />}
                        {activity.type === 'training' && <SchoolIcon color="secondary" />}
                        {activity.type === 'project' && <BusinessIcon color="success" />}
                        {activity.type === 'report' && <AssessmentIcon color="warning" />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Upload Documents
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Add New CHW
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Create Form
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    View Resources
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function Region5Dashboard() {
  return (
    <AuthProvider>
      <Region5DashboardContent />
    </AuthProvider>
  );
}
