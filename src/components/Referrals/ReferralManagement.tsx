'use client';

import React, { useState, useEffect } from 'react';
import {
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
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { Referral, ReferralResource, Client, ReferralStatus, ReferralUrgency, ResourceCategory } from '@/types/platform.types';

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [resources, setResources] = useState<ReferralResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    resourceId: '',
    urgency: ReferralUrgency.MEDIUM,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      setReferrals([
        {
          id: '1',
          clientId: 'client-1',
          resourceId: 'resource-1',
          chwId: 'chw-1',
          status: ReferralStatus.PENDING,
          urgency: ReferralUrgency.HIGH,
          reason: 'Medical consultation needed',
          notes: 'Client requires urgent cardiology consultation',
          followUpDate: new Date('2024-02-15'),
          outcomeNotes: '',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          completedAt: undefined
        },
        {
          id: '2',
          clientId: 'client-2',
          resourceId: 'resource-2',
          chwId: 'chw-2',
          status: ReferralStatus.COMPLETED,
          urgency: ReferralUrgency.MEDIUM,
          reason: 'Food assistance',
          notes: 'Family of 4 needs emergency food support',
          followUpDate: new Date('2024-02-10'),
          outcomeNotes: 'Successfully connected with local food bank',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-05'),
          completedAt: new Date('2024-02-05')
        }
      ]);

      setClients([
        {
          id: 'client-1',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: new Date('1980-01-01'),
          assignedCHW: 'chw-1',
          consentGiven: true,
          consentDate: new Date('2024-01-01'),
          isActive: true,
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'NC',
            zipCode: '12345',
            county: 'AnyCounty'
          },
          demographics: {
            gender: 'Male',
            preferredLanguage: 'English',
            householdSize: 2,
            insuranceStatus: 'Insured'
          },
          healthConditions: ['Hypertension'],
          socialDeterminants: {
            housingStatus: 'Stable',
            employmentStatus: 'Unemployed',
            transportationAccess: true,
            foodSecurity: 'Insecure',
            socialSupport: 'Limited',
            educationLevel: 'High School'
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        }
      ]);

      setResources([
        {
          id: 'resource-1',
          name: 'Cardiology Clinic',
          organization: 'Regional Medical Center',
          category: ResourceCategory.HEALTHCARE,
          description: 'Specialized cardiac care services',
          contactInfo: {
            phone: '(555) 123-4567',
            email: 'cardiology@regionalmed.com'
          },
          address: {
            street: '456 Health Ave',
            city: 'Anytown',
            state: 'NC',
            zipCode: '12345',
            county: 'AnyCounty'
          },
          serviceHours: {
            monday: '8:00 AM - 5:00 PM',
            tuesday: '8:00 AM - 5:00 PM',
            wednesday: '8:00 AM - 5:00 PM',
            thursday: '8:00 AM - 5:00 PM',
            friday: '8:00 AM - 5:00 PM'
          },
          eligibilityCriteria: ['Medical referral required'],
          servicesOffered: ['Consultations', 'Diagnostic tests', 'Treatment'],
          isActive: true,
          region5Certified: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const referralData = {
        clientId: formData.clientId,
        resourceId: formData.resourceId,
        chwId: 'current-user', // Would get from auth context
        status: ReferralStatus.PENDING,
        urgency: formData.urgency,
        reason: formData.reason,
        notes: formData.notes,
        followUpDate: undefined,
        outcomeNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined
      };

      if (selectedReferral) {
        // Update existing referral
        console.log('Updating referral:', selectedReferral.id, referralData);
      } else {
        // Create new referral
        console.log('Creating new referral:', referralData);
      }

      setShowModal(false);
      setSelectedReferral(null);
      resetForm();
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      resourceId: '',
      urgency: ReferralUrgency.MEDIUM,
      reason: '',
      notes: ''
    });
  };

  const editReferral = (referral: Referral) => {
    setSelectedReferral(referral);
    setFormData({
      clientId: referral.clientId,
      resourceId: referral.resourceId,
      urgency: referral.urgency,
      reason: referral.reason,
      notes: referral.notes || ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status: ReferralStatus) => {
    switch (status) {
      case ReferralStatus.PENDING: return 'warning';
      case ReferralStatus.CONTACTED: return 'info';
      case ReferralStatus.SCHEDULED: return 'primary';
      case ReferralStatus.COMPLETED: return 'success';
      case ReferralStatus.CANCELLED: return 'error';
      case ReferralStatus.NO_SHOW: return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: ReferralStatus) => {
    switch (status) {
      case ReferralStatus.PENDING: return <PendingIcon />;
      case ReferralStatus.CONTACTED: return <PhoneIcon />;
      case ReferralStatus.SCHEDULED: return <CheckCircleIcon />;
      case ReferralStatus.COMPLETED: return <CheckCircleIcon />;
      case ReferralStatus.CANCELLED: return <CancelIcon />;
      case ReferralStatus.NO_SHOW: return <WarningIcon />;
      default: return <PendingIcon />;
    }
  };

  const getUrgencyColor = (urgency: ReferralUrgency) => {
    switch (urgency) {
      case ReferralUrgency.LOW: return 'success';
      case ReferralUrgency.MEDIUM: return 'warning';
      case ReferralUrgency.HIGH: return 'error';
      case ReferralUrgency.URGENT: return 'error';
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
    <Box sx={{ width: '100%', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Referral Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage client referrals to community resources
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          New Referral
        </Button>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {referrals.filter(r => r.status === ReferralStatus.PENDING).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {referrals.filter(r => r.status === ReferralStatus.COMPLETED).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {referrals.filter(r => r.urgency === ReferralUrgency.HIGH || r.urgency === ReferralUrgency.URGENT).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {resources.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Resources
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Referrals Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Active Referrals
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map((referral) => {
                  const client = clients.find(c => c.id === referral.clientId);
                  const resource = resources.find(r => r.id === referral.resourceId);

                  return (
                    <TableRow key={referral.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {referral.clientId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {resource?.name || 'Unknown Resource'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resource?.organization}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(referral.status)}
                          <Chip
                            label={referral.status.replace(/_/g, ' ')}
                            color={getStatusColor(referral.status)}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={referral.urgency}
                          color={getUrgencyColor(referral.urgency)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {referral.reason}
                        </Typography>
                        {referral.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            {referral.notes.substring(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {referral.createdAt.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => editReferral(referral)}
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Referral Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReferral ? 'Edit Referral' : 'New Referral'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Client"
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  required
                >
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Resource"
                  value={formData.resourceId}
                  onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                  required
                >
                  {resources.map(resource => (
                    <MenuItem key={resource.id} value={resource.id}>
                      {resource.name} - {resource.organization}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Urgency"
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value as ReferralUrgency})}
                >
                  {Object.values(ReferralUrgency).map(urgency => (
                    <MenuItem key={urgency} value={urgency}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reason for Referral"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional information about this referral..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedReferral ? 'Update Referral' : 'Create Referral'}
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
    </Box>
  );
}
