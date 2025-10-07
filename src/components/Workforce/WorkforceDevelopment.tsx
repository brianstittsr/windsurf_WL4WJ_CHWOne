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
  Fab,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface Employer {
  id: string;
  organizationName: string;
  industry: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  description: string;
  isActive: boolean;
}

interface Job {
  id: string;
  title: string;
  employerId: string;
  description: string;
  requirements: string[];
  salary: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'open' | 'filled' | 'closed';
  postedDate: Date;
  applicationDeadline?: Date;
}

interface Training {
  id: string;
  title: string;
  provider: string;
  description: string;
  duration: string;
  cost: number;
  certification: boolean;
  startDate: Date;
  endDate?: Date;
  location: string;
  maxParticipants: number;
  enrolledParticipants: number;
}

export default function WorkforceDevelopment() {
  const [tabValue, setTabValue] = useState(0);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'employer' | 'job' | 'training'>('employer');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setEmployers([
        {
          id: '1',
          organizationName: 'Regional Medical Center',
          industry: 'Healthcare',
          contactPerson: 'Dr. Sarah Johnson',
          phone: '(555) 123-4567',
          email: 'hr@regionalmed.com',
          address: '456 Health Ave, Anytown, NC 12345',
          website: 'https://regionalmed.com',
          description: 'Leading healthcare provider in the region offering comprehensive medical services.',
          isActive: true
        },
        {
          id: '2',
          organizationName: 'Community Health Solutions',
          industry: 'Non-profit',
          contactPerson: 'Michael Chen',
          phone: '(555) 987-6543',
          email: 'careers@chs.org',
          address: '789 Wellness Blvd, Anytown, NC 12345',
          description: 'Non-profit organization focused on community health and wellness programs.',
          isActive: true
        }
      ]);

      setJobs([
        {
          id: '1',
          title: 'Community Health Worker',
          employerId: '1',
          description: 'Provide community outreach and health education services to underserved populations.',
          requirements: ['High school diploma', 'Valid driver\'s license', 'Basic computer skills'],
          salary: '$35,000 - $42,000',
          location: 'Anytown, NC',
          type: 'full-time',
          status: 'open',
          postedDate: new Date('2024-01-15'),
          applicationDeadline: new Date('2024-02-15')
        },
        {
          id: '2',
          title: 'Health Education Coordinator',
          employerId: '2',
          description: 'Coordinate health education programs and community workshops.',
          requirements: ['Bachelor\'s degree in health education or related field', '2+ years experience'],
          salary: '$45,000 - $55,000',
          location: 'Anytown, NC (Remote options available)',
          type: 'full-time',
          status: 'open',
          postedDate: new Date('2024-01-20')
        }
      ]);

      setTrainings([
        {
          id: '1',
          title: 'Certified Community Health Worker Training',
          provider: 'State Health Department',
          description: 'Comprehensive training program for aspiring community health workers.',
          duration: '160 hours',
          cost: 500,
          certification: true,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-31'),
          location: 'Virtual',
          maxParticipants: 25,
          enrolledParticipants: 18
        },
        {
          id: '2',
          title: 'Health Literacy Workshop',
          provider: 'Local Community College',
          description: 'One-day workshop on health literacy and communication skills.',
          duration: '8 hours',
          cost: 75,
          certification: false,
          startDate: new Date('2024-02-20'),
          location: 'Community College Campus',
          maxParticipants: 50,
          enrolledParticipants: 32
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openModal = (type: 'employer' | 'job' | 'training', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    setFormData(item ? { ...item } : {});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Saving', modalType, formData);

      setShowModal(false);
      setSelectedItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'primary';
      case 'part-time': return 'secondary';
      case 'contract': return 'info';
      case 'internship': return 'warning';
      default: return 'default';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'filled': return 'primary';
      case 'closed': return 'error';
      default: return 'default';
    }
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
            Workforce Development
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect community members with employment and training opportunities
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openModal('employer')}
          size="large"
        >
          Add Resource
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="workforce tabs">
            <Tab
              icon={<BusinessIcon />}
              label="Employers"
              iconPosition="start"
            />
            <Tab
              icon={<WorkIcon />}
              label="Job Opportunities"
              iconPosition="start"
            />
            <Tab
              icon={<SchoolIcon />}
              label="Training Programs"
              iconPosition="start"
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Employer Partners
          </Typography>
          <Grid container spacing={3}>
            {employers.map((employer) => (
              <Grid item xs={12} md={6} key={employer.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {employer.organizationName}
                        </Typography>
                        <Chip label={employer.industry} size="small" variant="outlined" />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => openModal('employer', employer)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {employer.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Contact Information:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{employer.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{employer.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">{employer.address}</Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Contact Person: {employer.contactPerson}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Job Opportunities
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Employer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => {
                  const employer = employers.find(e => e.id === job.employerId);
                  return (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Posted: {job.postedDate.toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employer?.organizationName || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.type.replace('-', ' ')}
                          color={getJobTypeColor(job.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {job.salary}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          color={getJobStatusColor(job.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openModal('job', job)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => openModal('job', job)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Training Programs
          </Typography>
          <Grid container spacing={3}>
            {trainings.map((training) => (
              <Grid item xs={12} key={training.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {training.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <Chip
                            label={`By ${training.provider}`}
                            size="small"
                            variant="outlined"
                          />
                          {training.certification && (
                            <Chip
                              label="Certification"
                              color="primary"
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {training.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => openModal('training', training)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Duration: {training.duration}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Cost: ${training.cost}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Location: {training.location}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Enrollment: {training.enrolledParticipants}/{training.maxParticipants}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                      Start Date: {training.startDate.toLocaleDateString()}
                      {training.endDate && ` - End Date: ${training.endDate.toLocaleDateString()}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? `Edit ${modalType}` : `Add New ${modalType}`}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {modalType === 'employer' && 'Add employer partner information'}
              {modalType === 'job' && 'Create job posting details'}
              {modalType === 'training' && 'Add training program information'}
            </Typography>

            {/* Form fields would go here based on modalType */}
            <TextField
              fullWidth
              label="Name/Title"
              value={formData.title || formData.organizationName || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => openModal('employer')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
