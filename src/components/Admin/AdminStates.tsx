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
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import StateService from '@/services/StateService';
import { State, WithDate, ContactInfo } from '@/types/hierarchy';

// US Regions
const US_REGIONS = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West',
  'Pacific',
];

// US State list with names and abbreviations
const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' },
  { name: 'District of Columbia', abbreviation: 'DC' },
  { name: 'American Samoa', abbreviation: 'AS' },
  { name: 'Guam', abbreviation: 'GU' },
  { name: 'Northern Mariana Islands', abbreviation: 'MP' },
  { name: 'Puerto Rico', abbreviation: 'PR' },
  { name: 'U.S. Virgin Islands', abbreviation: 'VI' },
];

// State form data interface
interface StateFormData {
  name: string;
  abbreviation: string;
  region?: string;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
    address?: {
      street1: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
  };
  isActive: boolean;
}

export default function AdminStates() {
  // State for states list
  const [states, setStates] = useState<WithDate<State>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for state creation/editing
  const [openStateDialog, setOpenStateDialog] = useState(false);
  const [stateFormData, setStateFormData] = useState<StateFormData>({
    name: '',
    abbreviation: '',
    region: undefined,
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      // Address is optional in our interface
    },
    isActive: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStateId, setEditingStateId] = useState<string | null>(null);
  
  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, []);
  
  // Fetch states from Firestore using our service
  const fetchStates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all states from the service
      const fetchedStates = await StateService.getAllStates();
      setStates(fetchedStates);
    } catch (err) {
      console.error('Error fetching states:', err);
      setError('Failed to load states. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form data for creating a new state
  const resetStateForm = () => {
    setStateFormData({
      name: '',
      abbreviation: '',
      region: undefined,
      contactInfo: {
        email: '',
        phone: '',
        website: '',
        // Address is optional
      },
      isActive: true,
    });
    setIsEditMode(false);
    setEditingStateId(null);
  };

  // Open dialog to create a new state
  const handleOpenCreateDialog = () => {
    resetStateForm();
    setOpenStateDialog(true);
  };

  // Open dialog to edit an existing state
  const handleOpenEditDialog = (state: WithDate<State>) => {
    // Deep clone the state object to avoid direct mutation
    const editState = JSON.parse(JSON.stringify(state));
    
    setStateFormData({
      name: editState.name,
      abbreviation: editState.abbreviation,
      region: editState.region,
      contactInfo: editState.contactInfo || {
        email: '',
        phone: '',
        website: '',
        address: {
          street1: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      },
      isActive: editState.isActive,
    });
    
    setIsEditMode(true);
    setEditingStateId(state.id);
    setOpenStateDialog(true);
  };

  // Close the state dialog
  const handleCloseDialog = () => {
    setOpenStateDialog(false);
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setStateFormData(prev => {
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
      
      // Handle address fields
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1];
        // Create address object if it doesn't exist
        if (!newState.contactInfo.address) {
          newState.contactInfo.address = {
            street1: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
          };
        }
        
        // Update the address field
        newState.contactInfo.address = {
          ...newState.contactInfo.address,
          [addressField]: value
        };
        return newState;
      }
      
      // Handle top-level fields
      return { ...prev, [field]: value };
    });
  };

  // Set state abbreviation when selecting from dropdown
  const handleStateSelect = (selectedState: { name: string, abbreviation: string }) => {
    setStateFormData(prev => ({
      ...prev,
      name: selectedState.name,
      abbreviation: selectedState.abbreviation,
    }));
  };

  // Function to create a new state
  const handleCreateState = async () => {
    try {
      setError(null);
      
      // Validate form data
      if (!stateFormData.name || !stateFormData.abbreviation) {
        setError('Name and abbreviation are required.');
        return;
      }
      
      if (!stateFormData.contactInfo.email) {
        setError('Contact email is required.');
        return;
      }
      
      // Create the state via service
      await StateService.createState({
        name: stateFormData.name,
        abbreviation: stateFormData.abbreviation,
        region: stateFormData.region,
        contactInfo: stateFormData.contactInfo,
        isActive: stateFormData.isActive,
      });
      
      // Close dialog and refresh list
      handleCloseDialog();
      fetchStates();
      
      // Show success message
      alert('State created successfully!');
    } catch (err: any) {
      console.error('Error creating state:', err);
      setError(err.message || 'Failed to create state. Please try again.');
    }
  };

  // Function to update an existing state
  const handleUpdateState = async () => {
    if (!editingStateId) return;
    
    try {
      setError(null);
      
      // Validate form data
      if (!stateFormData.name || !stateFormData.abbreviation) {
        setError('Name and abbreviation are required.');
        return;
      }
      
      // Update the state via service
      await StateService.updateState(editingStateId, {
        name: stateFormData.name,
        abbreviation: stateFormData.abbreviation,
        region: stateFormData.region,
        contactInfo: stateFormData.contactInfo,
        isActive: stateFormData.isActive,
      });
      
      // Close dialog and refresh list
      handleCloseDialog();
      fetchStates();
      
      // Show success message
      alert('State updated successfully!');
    } catch (err: any) {
      console.error('Error updating state:', err);
      setError(err.message || 'Failed to update state. Please try again.');
    }
  };

  // Function to delete a state
  const handleDeleteState = async (stateId: string) => {
    // First check if there are any associated entities
    try {
      const hasAssociations = await StateService.hasAssociations(stateId);
      
      if (hasAssociations) {
        alert('Cannot delete this state because it has associations. Please remove all associated entities first.');
        return;
      }
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this state?')) return;
      
      // Delete the state
      await StateService.deleteState(stateId);
      fetchStates();
      alert('State deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting state:', err);
      alert(err.message || 'Failed to delete state. Please try again.');
    }
  };

  // Function to toggle state active status
  const handleToggleStateActive = async (state: WithDate<State>) => {
    try {
      await StateService.updateState(state.id, {
        isActive: !state.isActive,
      });
      fetchStates();
    } catch (err: any) {
      console.error('Error toggling state status:', err);
      alert(err.message || 'Failed to update state status. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          State Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add New State
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchStates}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : states.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="states table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Abbreviation</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {states.map((state) => (
                <TableRow key={state.id}>
                  <TableCell>{state.name}</TableCell>
                  <TableCell>{state.abbreviation}</TableCell>
                  <TableCell>{state.region || 'Not Specified'}</TableCell>
                  <TableCell>{state.contactInfo?.email || 'Not Specified'}</TableCell>
                  <TableCell>
                    {state.isActive ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip label="Inactive" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit State">
                        <IconButton onClick={() => handleOpenEditDialog(state)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={state.isActive ? 'Deactivate State' : 'Activate State'}>
                        <IconButton onClick={() => handleToggleStateActive(state)} size="small">
                          <Switch
                            checked={state.isActive}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete State">
                        <IconButton onClick={() => handleDeleteState(state.id)} size="small" color="error">
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
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No states found. Add a new state to get started.
          </Typography>
        </Paper>
      )}
      
      {/* State Creation/Editing Dialog */}
      <Dialog open={openStateDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit State' : 'Add New State'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="state-select-label">Select State</InputLabel>
                <Select
                  labelId="state-select-label"
                  id="state-select"
                  value=""
                  label="Select State"
                  onChange={(e, child: any) => {
                    if (child && child.props.value) {
                      const selectedState = US_STATES.find(
                        s => s.abbreviation === child.props.value
                      );
                      if (selectedState) {
                        handleStateSelect(selectedState);
                      }
                    }
                  }}
                  disabled={isEditMode} // Disable in edit mode
                >
                  {US_STATES.map(state => (
                    <MenuItem key={state.abbreviation} value={state.abbreviation}>
                      {state.name} ({state.abbreviation})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Quick select from list</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="region-select-label">Region</InputLabel>
                <Select
                  labelId="region-select-label"
                  id="region-select"
                  value={stateFormData.region || ''}
                  label="Region"
                  onChange={(e) => handleFormChange('region', e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {US_REGIONS.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="State Name"
                required
                value={stateFormData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={isEditMode} // Disable in edit mode
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Abbreviation"
                required
                value={stateFormData.abbreviation}
                onChange={(e) => handleFormChange('abbreviation', e.target.value.toUpperCase())}
                inputProps={{ maxLength: 2 }}
                disabled={isEditMode} // Disable in edit mode
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
                value={stateFormData.contactInfo.email}
                onChange={(e) => handleFormChange('contactInfo.email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={stateFormData.contactInfo.phone || ''}
                onChange={(e) => handleFormChange('contactInfo.phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={stateFormData.contactInfo.website || ''}
                onChange={(e) => handleFormChange('contactInfo.website', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={stateFormData.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={isEditMode ? handleUpdateState : handleCreateState}
          >
            {isEditMode ? 'Update State' : 'Create State'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
