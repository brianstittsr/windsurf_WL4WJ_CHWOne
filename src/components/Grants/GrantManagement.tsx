'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  LinearProgress,
  Fab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grant, GrantStatus, ReportingSchedule } from '@/types/platform.types';

export default function GrantManagement() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingSource: '',
    amount: 0,
    startDate: '',
    endDate: '',
    status: GrantStatus.ACTIVE,
    contactPerson: '',
    requirements: '',
    reportingSchedule: ''
  });

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      // Mock data for demonstration
      setGrants([
        {
          id: '1',
          title: 'Rural Health Access Grant',
          description: 'Funding for expanding healthcare access in rural communities through mobile clinics and CHW outreach programs.',
          fundingSource: 'State Health Department',
          amount: 250000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: GrantStatus.ACTIVE,
          projectIds: ['project-1'],
          requirements: ['HIPAA compliance', 'Monthly reporting', 'Final outcome report'],
          reportingSchedule: [
            {
              type: 'monthly',
              dueDate: new Date('2024-02-15'),
              completed: false
            },
            {
              type: 'quarterly',
              dueDate: new Date('2024-04-15'),
              completed: false
            },
            {
              type: 'final',
              dueDate: new Date('2025-01-15'),
              completed: false
            }
          ],
          contactPerson: 'Dr. Sarah Johnson',
          createdAt: new Date('2023-12-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Diabetes Prevention Initiative Grant',
          description: 'Support for community-based diabetes prevention programs and health education initiatives.',
          fundingSource: 'CDC',
          amount: 180000,
          startDate: new Date('2024-04-01'),
          endDate: new Date('2025-03-31'),
          status: GrantStatus.PENDING,
          projectIds: [],
          requirements: ['CDC-approved curriculum', 'Quarterly progress reports', 'Participant tracking'],
          reportingSchedule: [
            {
              type: 'quarterly',
              dueDate: new Date('2024-07-15'),
              completed: false
            },
            {
              type: 'annual',
              dueDate: new Date('2025-04-15'),
              completed: false
            }
          ],
          contactPerson: 'Michael Chen',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-15')
        }
      ]);
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const grantData = {
        title: formData.title,
        description: formData.description,
        fundingSource: formData.fundingSource,
        amount: formData.amount,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status,
        projectIds: [],
        requirements: formData.requirements.split(',').map(r => r.trim()),
        reportingSchedule: [] as ReportingSchedule[],
        contactPerson: formData.contactPerson,
        updatedAt: new Date()
      };

      if (selectedGrant) {
        // Update existing grant
        console.log('Updating grant:', selectedGrant.id, grantData);
      } else {
        // Create new grant
        console.log('Creating new grant:', grantData);
      }

      setShowModal(false);
      setSelectedGrant(null);
      resetForm();
    } catch (error) {
      console.error('Error saving grant:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fundingSource: '',
      amount: 0,
      startDate: '',
      endDate: '',
      status: GrantStatus.ACTIVE,
      contactPerson: '',
      requirements: '',
      reportingSchedule: ''
    });
  };

  const editGrant = (grant: Grant) => {
    setSelectedGrant(grant);
    setFormData({
      title: grant.title,
      description: grant.description,
      fundingSource: grant.fundingSource,
      amount: grant.amount,
      startDate: grant.startDate.toISOString().split('T')[0],
      endDate: grant.endDate.toISOString().split('T')[0],
      status: grant.status,
      contactPerson: grant.contactPerson,
      requirements: grant.requirements.join(', '),
      reportingSchedule: ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status: GrantStatus) => {
    switch (status) {
      case GrantStatus.ACTIVE: return 'success';
      case GrantStatus.PENDING: return 'warning';
      case GrantStatus.COMPLETED: return 'primary';
      case GrantStatus.CANCELLED: return 'error';
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          New Grant
        </Button>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.filter(g => g.status === GrantStatus.ACTIVE).length}
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
                      color={getStatusColor(grant.status)}
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
                            {grant.endDate.toLocaleDateString()}
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
                    startIcon={<EditIcon />}
                    onClick={() => editGrant(grant)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                  >
                    View
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
                            Next report due: {upcomingReport.dueDate.toLocaleDateString()} ({upcomingReport.type})
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

      {/* Add/Edit Grant Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGrant ? 'Edit Grant' : 'New Grant'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Grant Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Funding Source"
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({...formData, fundingSource: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  value={formData.amount.toString()}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as GrantStatus})}
                >
                  {Object.values(GrantStatus).map(status => (
                    <MenuItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Requirements (comma-separated)"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="e.g., HIPAA compliance, Monthly reporting, Final outcome report"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedGrant ? 'Update Grant' : 'Create Grant'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowModal(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
