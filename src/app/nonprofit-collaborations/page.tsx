'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import CollaborationService from '@/services/CollaborationService';
import { CollaborationSummary } from '@/types/collaboration.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collab-tabpanel-${index}`}
      aria-labelledby={`collab-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function NonprofitCollaborationsContent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState<CollaborationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userNonprofitId, setUserNonprofitId] = useState<string | null>(null);

  useEffect(() => {
    loadCollaborations();
  }, [currentUser]);

  const loadCollaborations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's nonprofit memberships
      const memberships = await CollaborationService.getUserNonprofitMemberships(
        currentUser.uid
      );

      if (memberships.length === 0) {
        setError('You are not a member of any nonprofit organization. Please join a nonprofit to view collaborations.');
        setLoading(false);
        return;
      }

      // Use first nonprofit for now (TODO: Add nonprofit selector)
      const primaryNonprofit = memberships[0];
      setUserNonprofitId(primaryNonprofit.nonprofitId);

      // Load collaboration summaries
      const summaries = await CollaborationService.getCollaborationSummaries(
        primaryNonprofit.nonprofitId
      );

      setCollaborations(summaries);
    } catch (err) {
      console.error('Error loading collaborations:', err);
      setError('Failed to load collaborations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'on-hold':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const filterCollaborations = (status?: string) => {
    if (!status) return collaborations;
    return collaborations.filter((c) => c.status === status);
  };

  const activeCollaborations = filterCollaborations('active');
  const completedCollaborations = filterCollaborations('completed');
  const onHoldCollaborations = filterCollaborations('on-hold');

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  Nonprofit Collaborations
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Manage grant partnerships and collaborative projects
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => router.push('/grants/new')}
            >
              Create New Collaboration
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
              <Tab
                label={`Active (${activeCollaborations.length})`}
                icon={<TrendingUpIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Completed (${completedCollaborations.length})`}
                icon={<EventIcon />}
                iconPosition="start"
              />
              <Tab
                label={`On Hold (${onHoldCollaborations.length})`}
                icon={<PeopleIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </Card>

        {/* Active Collaborations Tab */}
        <TabPanel value={activeTab} index={0}>
          {activeCollaborations.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Active Collaborations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create a new grant collaboration to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/grants/new')}
                >
                  Create Collaboration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {activeCollaborations.map((collab) => (
                <Grid item xs={12} md={6} lg={4} key={collab.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {collab.grantName}
                        </Typography>
                        <Chip
                          label={collab.status}
                          color={getStatusColor(collab.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Lead:</strong> {collab.leadOrganizationName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Partners:</strong> {collab.partnerCount} organization
                          {collab.partnerCount !== 1 ? 's' : ''}
                        </Typography>
                      </Box>

                      {collab.nextMilestone && (
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                            Next Milestone
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.dark' }}>
                            {collab.nextMilestone.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'primary.dark' }}>
                            Due:{' '}
                            {collab.nextMilestone.dueDate instanceof Date
                              ? collab.nextMilestone.dueDate.toLocaleDateString()
                              : new Date(collab.nextMilestone.dueDate.toString()).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}

                      {collab.recentActivity && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Recent Activity
                          </Typography>
                          <Typography variant="body2">{collab.recentActivity.title}</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Health Score:
                        </Typography>
                        <Chip
                          label={`${collab.healthScore}%`}
                          size="small"
                          color={collab.healthScore >= 80 ? 'success' : collab.healthScore >= 60 ? 'warning' : 'error'}
                        />
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => router.push(`/nonprofit-collaborations/${collab.id}`)}
                      >
                        View Details
                      </Button>
                      <Tooltip title="Edit Collaboration">
                        <IconButton
                          color="primary"
                          onClick={() => router.push(`/nonprofit-collaborations/${collab.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Completed Collaborations Tab */}
        <TabPanel value={activeTab} index={1}>
          {completedCollaborations.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Completed Collaborations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed collaborations will appear here
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {completedCollaborations.map((collab) => (
                <Grid item xs={12} md={6} lg={4} key={collab.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {collab.grantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Lead: {collab.leadOrganizationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partners: {collab.partnerCount}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => router.push(`/nonprofit-collaborations/${collab.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* On Hold Collaborations Tab */}
        <TabPanel value={activeTab} index={2}>
          {onHoldCollaborations.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <PeopleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Collaborations On Hold
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paused collaborations will appear here
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {onHoldCollaborations.map((collab) => (
                <Grid item xs={12} md={6} lg={4} key={collab.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {collab.grantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Lead: {collab.leadOrganizationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partners: {collab.partnerCount}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => router.push(`/nonprofit-collaborations/${collab.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Container>
    </MainLayout>
  );
}

export default function NonprofitCollaborationsPage() {
  return (
    <AuthProvider>
      <NonprofitCollaborationsContent />
    </AuthProvider>
  );
}
