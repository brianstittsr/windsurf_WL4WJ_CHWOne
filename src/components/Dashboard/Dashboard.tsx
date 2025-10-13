'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  Assessment as AssessmentIcon,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardMetrics, Project, ProjectStatus } from '@/types/platform.types';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const StatusIndicator: React.FC<{ status: 'active' | 'pending' | 'inactive'; label: string }> = ({ status, label }) => {
  const getColor = () => {
    switch (status) {
      case 'active': return 'success.main';
      case 'pending': return 'warning.main';
      case 'inactive': return 'grey.500';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: getColor(),
          mr: 1
        }}
      />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCHWs: 0,
    activeCHWs: 0,
    totalClients: 0,
    activeProjects: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalGrants: 0,
    activeGrants: 0,
    totalGrantAmount: 0,
    region5Resources: 0,
    empowerSurveys: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        // Mock data for demonstration
        setMetrics({
          totalCHWs: 156,
          activeCHWs: 142,
          totalClients: 2847,
          activeProjects: 8,
          pendingReferrals: 23,
          completedReferrals: 145,
          totalGrants: 12,
          activeGrants: 9,
          totalGrantAmount: 2500000,
          region5Resources: 45,
          empowerSurveys: 89,
        });

        // Mock recent projects
        setProjects([
          {
            id: '1',
            name: 'Community Health Outreach Program',
            description: 'Expanding healthcare access to underserved rural communities',
            grantId: 'grant-1',
            status: ProjectStatus.ACTIVE,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-12-31'),
            targetPopulation: 'Rural communities',
            goals: ['Increase healthcare access', 'Reduce emergency visits'],
            budget: 250000,
            spentAmount: 87500,
            assignedCHWs: ['chw-1', 'chw-2'],
            outcomes: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-03-15')
          },
          {
            id: '2',
            name: 'Diabetes Prevention Initiative',
            description: 'Community-based diabetes prevention program',
            status: ProjectStatus.ACTIVE,
            startDate: new Date('2024-04-01'),
            endDate: new Date('2025-03-31'),
            targetPopulation: 'Adults at risk',
            goals: ['Prevent diabetes onset', 'Promote healthy lifestyle'],
            budget: 180000,
            spentAmount: 45000,
            assignedCHWs: ['chw-3', 'chw-4'],
            outcomes: [],
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-03-10')
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'success';
      case ProjectStatus.PLANNING: return 'info';
      case ProjectStatus.ON_HOLD: return 'warning';
      case ProjectStatus.COMPLETED: return 'primary';
      case ProjectStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const calculateProgress = (project: Project) => {
    if (!project.endDate) return 0;
    const total = project.endDate.getTime() - project.startDate.getTime();
    const elapsed = Date.now() - project.startDate.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Welcome back, {currentUser?.displayName || 'CHW Coordinator'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here&apos;s an overview of your community health initiatives and key performance metrics.
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.activeCHWs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active CHWs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <SendIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {metrics.pendingReferrals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <DescriptionIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${metrics.totalGrantAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Grants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Projects */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Recent Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              href="/projects"
            >
              View All Projects
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>CHWs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.targetPopulation}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status.replace(/_/g, ' ')}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(project)}
                          sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {Math.round(calculateProgress(project))}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${project.budget.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.assignedCHWs.length}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  component={Link}
                  href="/chws"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Manage Community Health Workers
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                  component={Link}
                  href="/projects"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Create New Project
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  component={Link}
                  href="/grants"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  View Grant Opportunities
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  component={Link}
                  href="/referrals"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Process Referrals
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <StatusIndicator status="active" label="Firebase Database: Connected" />
                <StatusIndicator status="active" label="Authentication: Active" />
                <StatusIndicator status="active" label="File Storage: Available" />
                <StatusIndicator status="pending" label="Reports: Processing (2 pending)" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
