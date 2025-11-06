'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

import CHWAssociationService from '@/services/ChwAssociationService';
import StateService from '@/services/StateService';
import { CHWAssociation, WithDate, State, ApprovalStatus } from '@/types/hierarchy';

// Association form data interface
interface AssociationFormData {
  name: string;
  description: string;
  stateId: string;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
  };
  logo?: string;
  primaryColor?: string;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
}

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
      id={`association-tabpanel-${index}`}
      aria-labelledby={`association-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminCHWAssociations() {
  // State for associations list
  const [associations, setAssociations] = useState<WithDate<CHWAssociation>[]>([]);
  const [states, setStates] = useState<WithDate<State>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for association creation/editing
  const [openAssociationDialog, setOpenAssociationDialog] = useState(false);
  const [associationFormData, setAssociationFormData] = useState<AssociationFormData>({
    name: '',
    description: '',
    stateId: '',
    contactInfo: {
      email: '',
      phone: '',
      website: '',
    },
    isActive: true,
    approvalStatus: 'pending',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAssociationId, setEditingAssociationId] = useState<string | null>(null);
  
  // State for filtering and tabs
  const [activeTab, setActiveTab] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Fetch associations and states on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch associations and states from Firestore
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch states first
      const fetchedStates = await StateService.getAllStates();
      setStates(fetchedStates);
      
      // Then fetch associations
      const fetchedAssociations = await CHWAssociationService.getAllAssociations();
      setAssociations(fetchedAssociations);
      
      // Count pending approvals
      const pendingAssociations = fetchedAssociations.filter(a => a.approvalStatus === 'pending');
      setPendingCount(pendingAssociations.length);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter associations based on active tab
  const filteredAssociations = associations.filter(association => {
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Active
        return association.isActive;
      case 2: // Pending Approval
        return association.approvalStatus === 'pending';
      default:
        return true;
    }
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Reset form data for creating a new association
  const resetAssociationForm = () => {
    setAssociationFormData({
      name: '',
      description: '',
      stateId: '',
      contactInfo: {
        email: '',
        phone: '',
        website: '',
      },
      isActive: true,
      approvalStatus: 'pending',
    });
    setIsEditMode(false);
    setEditingAssociationId(null);
  };
  
  // Open dialog to create a new association
  const handleOpenCreateDialog = () => {
    resetAssociationForm();
    setOpenAssociationDialog(true);
  };
  
  // Open dialog to edit an existing association
  const handleOpenEditDialog = (association: WithDate<CHWAssociation>) => {
    setAssociationFormData({
      name: association.name,
      description: association.description || '',
      stateId: association.stateId,
      contactInfo: {
        email: association.contactInfo.email,
        phone: association.contactInfo.phone,
        website: association.contactInfo.website,
      },
      logo: association.logo,
      primaryColor: association.primaryColor,
      isActive: association.isActive,
      approvalStatus: association.approvalStatus || 'pending',
    });
    setIsEditMode(true);
    setEditingAssociationId(association.id);
    setOpenAssociationDialog(true);
  };
  
  // Close the association dialog
  const handleCloseDialog = () => {
    setOpenAssociationDialog(false);
  };
  
  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setAssociationFormData(prev => {
      // Create a copy of the current state
      const newState = { ...prev };
      
      // Handle nested contactInfo fields
      if (field.startsWith('contactInfo.')) {
        const contactField = field.split('.')[1];
        newState.contactInfo = {
          ...prev.contactInfo,
          [contactField]: value
        };
        return newState;
      }
      
      // Handle top-level fields
      return { ...prev, [field]: value };
    });
  };
  
  // Function to create a new association
  const handleCreateAssociation = async () => {
    try {
      setError(null);
      
      // Validate form data
      if (!associationFormData.name || !associationFormData.stateId || !associationFormData.contactInfo.email) {
        setError('Name, state, and contact email are required.');
        return;
      }
      
      // Create association via service
      await CHWAssociationService.createAssociation({
        name: associationFormData.name,
        description: associationFormData.description,
        stateId: associationFormData.stateId,
        contactInfo: associationFormData.contactInfo,
        logo: associationFormData.logo,
        primaryColor: associationFormData.primaryColor,
        isActive: associationFormData.isActive,
        approvalStatus: associationFormData.approvalStatus,
        administrators: [], // No admins initially
      });
      
      // Close dialog and refresh list
      handleCloseDialog();
      fetchData();
      
      alert('Association created successfully!');
    } catch (err: any) {
      console.error('Error creating association:', err);
      setError(err.message || 'Failed to create association. Please try again.');
    }
  };
  
  // Function to update an existing association
  const handleUpdateAssociation = async () => {
    if (!editingAssociationId) return;
    
    try {
      setError(null);
      
      // Validate form data
      if (!associationFormData.name || !associationFormData.contactInfo.email) {
        setError('Name and contact email are required.');
        return;
      }
      
      // Update association via service
      await CHWAssociationService.updateAssociation(editingAssociationId, {
        name: associationFormData.name,
        description: associationFormData.description,
        contactInfo: associationFormData.contactInfo,
        logo: associationFormData.logo,
        primaryColor: associationFormData.primaryColor,
        isActive: associationFormData.isActive,
        approvalStatus: associationFormData.approvalStatus,
      });
      
      // Close dialog and refresh list
      handleCloseDialog();
      fetchData();
      
      alert('Association updated successfully!');
    } catch (err: any) {
      console.error('Error updating association:', err);
      setError(err.message || 'Failed to update association. Please try again.');
    }
  };
  
  // Function to delete an association
  const handleDeleteAssociation = async (associationId: string) => {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this association?')) return;
    
    try {
      await CHWAssociationService.deleteAssociation(associationId);
      fetchData();
      alert('Association deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting association:', err);
      alert(err.message || 'Failed to delete association. Please try again.');
    }
  };
  
  // Function to toggle association active status
  const handleToggleActive = async (association: WithDate<CHWAssociation>) => {
    try {
      await CHWAssociationService.updateAssociation(association.id, {
        isActive: !association.isActive,
      });
      fetchData();
    } catch (err: any) {
      console.error('Error toggling association status:', err);
      alert(err.message || 'Failed to update association status. Please try again.');
    }
  };
  
  // Function to approve or reject an association
  const handleApprovalAction = async (associationId: string, status: ApprovalStatus) => {
    try {
      await CHWAssociationService.updateApprovalStatus(associationId, status);
      fetchData();
      alert(`Association ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err: any) {
      console.error('Error updating approval status:', err);
      alert(err.message || 'Failed to update approval status. Please try again.');
    }
  };
  
  // Helper function to get state name by ID
  const getStateName = (stateId: string): string => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : 'Unknown';
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          CHW Association Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add New Association
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`All Associations (${associations.length})`} />
          <Tab label="Active Associations" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pending Approval
                {pendingCount > 0 && (
                  <Chip 
                    size="small" 
                    label={pendingCount} 
                    color="error" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        {renderAssociationsTable()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderAssociationsTable()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderAssociationsTable()}
      </TabPanel>
      
      {/* Association Creation/Editing Dialog */}
      <Dialog open={openAssociationDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit CHW Association' : 'Create New CHW Association'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Association Name"
                required
                value={associationFormData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="state-select-label">State</InputLabel>
                <Select
                  labelId="state-select-label"
                  value={associationFormData.stateId}
                  label="State"
                  onChange={(e) => handleFormChange('stateId', e.target.value)}
                  disabled={isEditMode} // Can't change state once created
                >
                  {states.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={associationFormData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                required
                type="email"
                value={associationFormData.contactInfo.email}
                onChange={(e) => handleFormChange('contactInfo.email', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={associationFormData.contactInfo.phone || ''}
                onChange={(e) => handleFormChange('contactInfo.phone', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={associationFormData.contactInfo.website || ''}
                onChange={(e) => handleFormChange('contactInfo.website', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Logo URL"
                value={associationFormData.logo || ''}
                onChange={(e) => handleFormChange('logo', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Color (hex)"
                value={associationFormData.primaryColor || ''}
                onChange={(e) => handleFormChange('primaryColor', e.target.value)}
                placeholder="#0066CC"
              />
            </Grid>
            
            {isEditMode && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Status
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="approval-status-label">Approval Status</InputLabel>
                    <Select
                      labelId="approval-status-label"
                      value={associationFormData.approvalStatus}
                      label="Approval Status"
                      onChange={(e) => handleFormChange('approvalStatus', e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={associationFormData.isActive}
                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={isEditMode ? handleUpdateAssociation : handleCreateAssociation}
          >
            {isEditMode ? 'Update Association' : 'Create Association'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  
  // Helper function to render the associations table
  function renderAssociationsTable() {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (filteredAssociations.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No associations found.
            {activeTab === 0 && ' Click "Add New Association" to create one.'}
            {activeTab === 1 && ' No active associations.'}
            {activeTab === 2 && ' No pending approval requests.'}
          </Typography>
        </Paper>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="associations table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssociations.map((association) => (
              <TableRow key={association.id}>
                <TableCell>{association.name}</TableCell>
                <TableCell>{getStateName(association.stateId)}</TableCell>
                <TableCell>{association.contactInfo?.email || 'N/A'}</TableCell>
                <TableCell>
                  {association.approvalStatus === 'pending' ? (
                    <Chip label="Pending Approval" color="warning" size="small" />
                  ) : association.approvalStatus === 'rejected' ? (
                    <Chip label="Rejected" color="error" size="small" />
                  ) : association.isActive ? (
                    <Chip label="Active" color="success" size="small" />
                  ) : (
                    <Chip label="Inactive" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    {association.approvalStatus === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton onClick={() => handleApprovalAction(association.id, 'approved')} size="small" color="success">
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton onClick={() => handleApprovalAction(association.id, 'rejected')} size="small" color="error">
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenEditDialog(association)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={association.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton onClick={() => handleToggleActive(association)} size="small">
                        {association.isActive ? <LockIcon /> : <LockOpenIcon color="success" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteAssociation(association.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}
