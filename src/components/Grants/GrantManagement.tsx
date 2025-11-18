'use client';

import React, { useState, useEffect } from 'react';
import { GrantWizard } from '@/components/Grants/wizard/GrantWizard';
import { GrantWizardProvider } from '@/contexts/GrantWizardContext';
import { GrantGeneratorWizard } from '@/components/Grants/generator/GrantGeneratorWizard';
import { GrantGeneratorProvider } from '@/contexts/GrantGeneratorContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Sparkles } from 'lucide-react';
import { createGrant, getActiveGrantsCount } from '@/lib/schema/data-access';
import { Grant } from '@/lib/schema/unified-schema';
import { Timestamp } from 'firebase/firestore';

export default function GrantManagement() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizardDialog, setShowWizardDialog] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      // Import getGrants from data-access
      const { getGrants } = await import('@/lib/schema/data-access');
      
      // Fetch grants from Firebase
      const result = await getGrants();
      
      if (result.success && result.grants) {
        console.log('Fetched grants from Firebase:', result.grants.length);
        setGrants(result.grants);
      } else {
        console.error('Error fetching grants:', result.error);
        setGrants([]);
      }
    } catch (error) {
      console.error('Error fetching grants:', error);
      setGrants([]);
    } finally {
      setLoading(false);
    }
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

  const calculateUtilization = (grant: Grant) => {
    const totalProjects = grant.projectIds.length;
    const activeProjects = totalProjects; // For now, assume all are active
    return totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0;
  };

  const getUpcomingReporting = (grant: Grant) => {
    const upcoming = grant.reportingSchedule.filter(r => !r.completed);
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Grant Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage funding sources and track grant utilization
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AssessmentIcon />}
            onClick={() => setShowWizardDialog(true)}
            size="large"
          >
            Launch Grant Analyzer
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Sparkles size={20} />}
            onClick={() => setShowGeneratorDialog(true)}
            size="large"
          >
            Launch Grant Creator
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.filter(g => g.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Grants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${grants.reduce((sum, g) => sum + g.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Funding
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.reduce((sum, g) => sum + g.projectIds.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects Funded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.filter(g => getUpcomingReporting(g)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grants List */}
      {grants.map((grant) => {
        const utilization = calculateUtilization(grant);
        const upcomingReport = getUpcomingReporting(grant);

        return (
          <Card key={grant.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {grant.title}
                    </Typography>
                    <Chip
                      label={grant.status.replace(/_/g, ' ')}
                      color={getStatusColor(grant.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {grant.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${grant.amount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Funding Amount
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {grant.fundingSource}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Funding Source
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {grant.endDate.toDate().toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            End Date
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {grant.projectIds.length} Projects
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(utilization, 100)}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>

              {/* Requirements and Reporting */}
              <Box sx={{ mt: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Requirements & Reporting Schedule
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Requirements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {grant.requirements.map((req, index) => (
                            <Chip key={index} label={req} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Contact Person: {grant.contactPerson}
                        </Typography>
                        {upcomingReport && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Next report due: {upcomingReport.dueDate.toDate().toLocaleDateString()} ({upcomingReport.type})
                          </Alert>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </CardContent>
          </Card>
        );
      })}


      {/* Grant Analyzer Wizard Dialog */}
      <Dialog 
        open={showWizardDialog} 
        onClose={() => setShowWizardDialog(false)} 
        maxWidth="xl" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': { 
            borderRadius: '12px',
            maxHeight: '90vh', 
            overflow: 'auto',
            backgroundColor: '#f8fafc' // Light background for better contrast with wizard content
          }
        }}
      >
        {/* No DialogTitle for cleaner look - title is inside the wizard */}
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{ 
            position: 'relative',
            pt: 2, 
            px: 2, 
            pb: 2,
          }}>
            {/* Close button in top-right corner */}
            <IconButton 
              onClick={() => setShowWizardDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                bgcolor: 'white',
                boxShadow: 1,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <GrantWizardProvider>
              <GrantWizard 
                organizationId="general"
                onComplete={(grantId) => {
                  console.log('Grant created:', grantId);
                  setShowWizardDialog(false);
                  fetchGrants();
                }}
              />
            </GrantWizardProvider>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Grant Generator Wizard Dialog */}
      <Dialog 
        open={showGeneratorDialog} 
        onClose={() => setShowGeneratorDialog(false)} 
        maxWidth="xl" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': { 
            borderRadius: '12px',
            maxHeight: '90vh', 
            overflow: 'auto',
            backgroundColor: '#f8fafc'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{ 
            position: 'relative',
            pt: 2, 
            px: 2, 
            pb: 2,
          }}>
            {/* Close button in top-right corner */}
            <IconButton 
              onClick={() => setShowGeneratorDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                bgcolor: 'white',
                boxShadow: 1,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <GrantGeneratorProvider organizationId="general">
              <GrantGeneratorWizard 
                organizationId="general"
                onComplete={(proposalId) => {
                  console.log('Proposal created:', proposalId);
                  setShowGeneratorDialog(false);
                  // Optionally navigate to proposal view or refresh grants
                }}
              />
            </GrantGeneratorProvider>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
