'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  CircularProgress,
  LinearProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Grant } from '@/lib/schema/unified-schema';

interface CollaborationCardData {
  id: string;
  grantTitle: string;
  grantDescription: string;
  startDate: Date;
  endDate: Date;
  status: string;
  organizations: {
    name: string;
    role: string;
    logoUrl?: string;
  }[];
  progress: number;
  fundingAmount: number;
}

function CollaborationsContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collaborations, setCollaborations] = useState<CollaborationCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser) {
      fetchCollaborations();
    }
  }, [currentUser, authLoading, router]);

  const fetchCollaborations = async () => {
    try {
      // Fetch grants from Firebase
      const { getGrants } = await import('@/lib/schema/data-access');
      const result = await getGrants();

      if (result.success && result.grants) {
        // Transform grants into collaboration cards
        const collabData: CollaborationCardData[] = result.grants.map((grant: Grant) => {
          // Extract collaborating entities from the grant
          const entities = (grant as any).collaboratingEntities || [];
          const organizations = entities.length > 0 
            ? entities.map((entity: any) => ({
                name: entity.name || 'Unknown Organization',
                role: entity.role || 'partner',
                logoUrl: entity.logoUrl
              }))
            : [
                { name: grant.fundingSource || 'Lead Organization', role: 'lead' },
                { name: 'Partner Organization', role: 'partner' }
              ];

          // Calculate progress based on milestones or dates
          const milestones = (grant as any).projectMilestones || [];
          const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
          const progress = milestones.length > 0 
            ? Math.round((completedMilestones / milestones.length) * 100)
            : calculateDateProgress(grant.startDate?.toDate(), grant.endDate?.toDate());

          return {
            id: grant.id,
            grantTitle: grant.title || 'Untitled Grant',
            grantDescription: grant.description || '',
            startDate: grant.startDate?.toDate() || new Date(),
            endDate: grant.endDate?.toDate() || new Date(),
            status: grant.status || 'active',
            organizations,
            progress,
            fundingAmount: grant.amount || 0
          };
        });

        setCollaborations(collabData);
      }
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDateProgress = (startDate?: Date, endDate?: Date): number => {
    if (!startDate || !endDate) return 0;
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return '#1976d2';
      case 'partner': return '#2e7d32';
      case 'evaluator': return '#ed6c02';
      case 'stakeholder': return '#9c27b0';
      default: return '#757575';
    }
  };

  if (authLoading || loading) {
    return <AnimatedLoading message="Loading Collaborations..." />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Collaborations
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            View and manage grant collaborations between organizations
          </Typography>
        </Box>

        {/* Collaborations Grid */}
        {collaborations.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            No collaborations found. Create a grant using the Grant Analyzer to start a new collaboration.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {collaborations.map((collab) => (
              <Grid item xs={12} md={6} key={collab.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Status and Title */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 2 }}>
                        {collab.grantTitle}
                      </Typography>
                      <Chip 
                        label={collab.status} 
                        color={getStatusColor(collab.status) as any}
                        size="small"
                      />
                    </Box>

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {collab.grantDescription}
                    </Typography>

                    {/* Collaborating Organizations */}
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupsIcon fontSize="small" color="action" />
                      Collaborating Organizations
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                      {collab.organizations.slice(0, 3).map((org, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}
                        >
                          <Avatar 
                            src={org.logoUrl}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: getRoleColor(org.role),
                              fontSize: '0.9rem'
                            }}
                          >
                            {org.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {org.name}
                            </Typography>
                            <Chip 
                              label={org.role} 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: getRoleColor(org.role),
                                color: 'white'
                              }} 
                            />
                          </Box>
                        </Box>
                      ))}
                      {collab.organizations.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{collab.organizations.length - 3} more organizations
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Dates and Progress */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Start Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {collab.startDate.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              End Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {collab.endDate.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {collab.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={collab.progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: collab.progress >= 75 ? 'success.main' : 
                                     collab.progress >= 50 ? 'primary.main' : 
                                     collab.progress >= 25 ? 'warning.main' : 'error.main'
                          }
                        }}
                      />
                    </Box>

                    {/* Funding Amount */}
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Funding:</strong> ${collab.fundingAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<VisibilityIcon />}
                      onClick={() => router.push(`/collaborations/${collab.id}`)}
                    >
                      View Collaboration
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </UnifiedLayout>
  );
}

export default function CollaborationsPage() {
  return (
    <AuthProvider>
      <CollaborationsContent />
    </AuthProvider>
  );
}
