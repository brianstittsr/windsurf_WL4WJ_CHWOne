'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Folder as FolderIcon,
  Upload as UploadIcon,
  Favorite as FavoriteIcon,
  GroupWork as GroupWorkIcon
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { WL4WJLogo } from '@/components/Logos';

export default function WL4WJDashboard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const stats = [
    {
      title: 'Active CHWs',
      value: '47',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      trend: '+18%',
      color: 'primary.main'
    },
    {
      title: 'Community Programs',
      value: '15',
      icon: <GroupWorkIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      trend: '+5',
      color: 'secondary.main'
    },
    {
      title: 'Forms Processed',
      value: '289',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      trend: '+42',
      color: 'success.main'
    },
    {
      title: 'Training Completions',
      value: '23',
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      trend: '+7',
      color: 'warning.main'
    }
  ];

  const programGoals = [
    { name: 'CHW Recruitment', current: 47, target: 60, percentage: 78 },
    { name: 'Community Outreach', current: 23, target: 30, percentage: 77 },
    { name: 'Training Sessions', current: 89, target: 100, percentage: 89 },
    { name: 'Health Assessments', current: 156, target: 200, percentage: 78 }
  ];

  const upcomingEvents = [
    { title: 'Monthly CHW Meeting', date: 'Oct 15, 2025', type: 'meeting' },
    { title: 'Cultural Competency Training', date: 'Oct 18, 2025', type: 'training' },
    { title: 'Community Health Fair', date: 'Oct 25, 2025', type: 'event' },
    { title: 'Grant Reporting Deadline', date: 'Nov 1, 2025', type: 'deadline' }
  ];

  return (
    <MainLayout>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <WL4WJLogo size="large" />
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

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Program Goals */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Program Goals Progress
                </Typography>
                <Stack spacing={3}>
                  {programGoals.map((goal, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {goal.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {goal.current}/{goal.target}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={goal.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: goal.percentage > 80 ? 'success.main' : 'primary.main'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {goal.percentage}% Complete
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Upcoming Events
                </Typography>
                <Stack spacing={2}>
                  {upcomingEvents.map((event, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 1,
                        bgcolor: theme.palette.action.hover,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.date}
                        </Typography>
                      </Box>
                      <Chip
                        label={event.type}
                        size="small"
                        sx={{
                          bgcolor: event.type === 'deadline' ? 'error.light' :
                                   event.type === 'training' ? 'primary.light' :
                                   event.type === 'meeting' ? 'secondary.light' : 'success.light',
                          color: event.type === 'deadline' ? 'error.dark' :
                                 event.type === 'training' ? 'primary.dark' :
                                 event.type === 'meeting' ? 'secondary.dark' : 'success.dark'
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ height: 48 }}
                >
                  Upload Documents
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  fullWidth
                  sx={{ height: 48 }}
                >
                  Add New CHW
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  fullWidth
                  sx={{ height: 48 }}
                >
                  Create Form
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  fullWidth
                  sx={{ height: 48 }}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
