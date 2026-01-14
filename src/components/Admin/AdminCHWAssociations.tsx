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

// Program types matching public wizard
const PROGRAM_TYPES = [
  'CHW Training & Certification',
  'Continuing Education',
  'Professional Development',
  'Networking Events',
  'Advocacy & Policy',
  'Research & Data Collection',
  'Resource Coordination',
  'Quality Assurance',
  'Mentorship Programs',
  'Community Outreach',
  'Grant Writing Support',
  'Technical Assistance'
];

// Membership tiers matching public wizard
const MEMBERSHIP_TIERS = [
  'Individual CHW Members',
  'Organizational Members',
  'Student Members',
  'Associate Members',
  'Honorary Members'
];

// Form address structure (simpler than hierarchy Address type)
interface FormAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// Form contact info structure (simpler than hierarchy ContactInfo type)
interface FormContactInfo {
  email: string;
  phone: string;
  website: string;
  address: FormAddress;
}

// Association form data interface - expanded to match public wizard
interface AssociationFormData {
  // Basic Info
  name: string;
  acronym: string;
  stateId: string;
  yearFounded: string;
  ein: string;
  mission: string;
  vision: string;
  description: string;
  
  // Leadership & Contact
  executiveDirectorName: string;
  executiveDirectorEmail: string;
  executiveDirectorPhone: string;
  boardChairName: string;
  boardChairEmail: string;
  contactInfo: FormContactInfo;
  
  // Programs & Services
  programsOffered: string[];
  certificationProgram: boolean;
  trainingProgram: boolean;
  advocacyActivities: string;
  partnerOrganizations: string;
  
  // Membership & Structure
  membershipTiers: string[];
  currentMemberCount: number;
  chwMemberCount: number;
  organizationalMemberCount: number;
  annualMembershipFee: string;
  governanceStructure: string;
  
  // Branding
  logo: string;
  primaryColor: string;
  
  // Status
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
  
  // Default form data matching all fields from public wizard
  const getDefaultFormData = (): AssociationFormData => ({
    // Basic Info
    name: '',
    acronym: '',
    stateId: '',
    yearFounded: '',
    ein: '',
    mission: '',
    vision: '',
    description: '',
    
    // Leadership & Contact
    executiveDirectorName: '',
    executiveDirectorEmail: '',
    executiveDirectorPhone: '',
    boardChairName: '',
    boardChairEmail: '',
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    
    // Programs & Services
    programsOffered: [],
    certificationProgram: false,
    trainingProgram: false,
    advocacyActivities: '',
    partnerOrganizations: '',
    
    // Membership & Structure
    membershipTiers: [],
    currentMemberCount: 0,
    chwMemberCount: 0,
    organizationalMemberCount: 0,
    annualMembershipFee: '',
    governanceStructure: '',
    
    // Branding
    logo: '',
    primaryColor: '',
    
    // Status
    isActive: true,
    approvalStatus: 'pending',
  });

  // State for association creation/editing
  const [openAssociationDialog, setOpenAssociationDialog] = useState(false);
  const [associationFormData, setAssociationFormData] = useState<AssociationFormData>(getDefaultFormData());
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
    setAssociationFormData(getDefaultFormData());
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
    // Get any extended data that might be stored
    const extData = association as any;
    
    setAssociationFormData({
      // Basic Info
      name: association.name,
      acronym: extData.acronym || association.abbreviation || '',
      stateId: association.stateId,
      yearFounded: extData.yearFounded?.toString() || '',
      ein: extData.ein || '',
      mission: extData.mission || '',
      vision: extData.vision || '',
      description: association.description || '',
      
      // Leadership & Contact
      executiveDirectorName: extData.executiveDirectorName || '',
      executiveDirectorEmail: extData.executiveDirectorEmail || '',
      executiveDirectorPhone: extData.executiveDirectorPhone || '',
      boardChairName: extData.boardChairName || '',
      boardChairEmail: extData.boardChairEmail || '',
      contactInfo: {
        email: association.contactInfo?.email || '',
        phone: association.contactInfo?.phone || '',
        website: association.contactInfo?.website || '',
        address: {
          street: association.contactInfo?.address?.street1 || extData.mailingAddress?.street || '',
          city: association.contactInfo?.address?.city || extData.mailingAddress?.city || '',
          state: association.contactInfo?.address?.state || extData.mailingAddress?.state || '',
          zipCode: association.contactInfo?.address?.zipCode || extData.mailingAddress?.zipCode || ''
        }
      },
      
      // Programs & Services
      programsOffered: extData.programsOffered || [],
      certificationProgram: extData.certificationProgram || false,
      trainingProgram: extData.trainingProgram || false,
      advocacyActivities: extData.advocacyActivities || '',
      partnerOrganizations: extData.partnerOrganizations || '',
      
      // Membership & Structure
      membershipTiers: extData.membershipTiers || [],
      currentMemberCount: extData.currentMemberCount || 0,
      chwMemberCount: extData.chwMemberCount || 0,
      organizationalMemberCount: extData.organizationalMemberCount || 0,
      annualMembershipFee: extData.annualMembershipFee || '',
      governanceStructure: extData.governanceStructure || '',
      
      // Branding
      logo: association.logo || '',
      primaryColor: association.primaryColor || '',
      
      // Status
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
      // Handle nested contactInfo.address fields
      if (field.startsWith('contactInfo.address.')) {
        const addressField = field.split('.')[2];
        return {
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            address: {
              ...prev.contactInfo.address,
              [addressField]: value
            }
          }
        };
      }
      
      // Handle nested contactInfo fields
      if (field.startsWith('contactInfo.')) {
        const contactField = field.split('.')[1];
        return {
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [contactField]: value
          }
        };
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
      
      // Convert form contact info to service ContactInfo format
      const serviceContactInfo = {
        email: associationFormData.contactInfo.email,
        phone: associationFormData.contactInfo.phone || undefined,
        website: associationFormData.contactInfo.website || undefined,
        address: associationFormData.contactInfo.address.street ? {
          street1: associationFormData.contactInfo.address.street,
          city: associationFormData.contactInfo.address.city,
          state: associationFormData.contactInfo.address.state,
          zipCode: associationFormData.contactInfo.address.zipCode,
          country: 'USA'
        } : undefined
      };
      
      // Create association via service
      const newAssociation = await CHWAssociationService.createAssociation({
        name: associationFormData.name,
        // Use acronym if provided, otherwise generate from name
        abbreviation: associationFormData.acronym || associationFormData.name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase(),
        description: associationFormData.description,
        stateId: associationFormData.stateId,
        contactInfo: serviceContactInfo,
        logo: associationFormData.logo || undefined,
        primaryColor: associationFormData.primaryColor || undefined,
        // isActive will be set to true by default in the service
        approvalStatus: associationFormData.approvalStatus,
        administrators: [], // No admins initially
        // Required claim fields
        claimStatus: 'unclaimed',
        // Extended fields from public wizard
        ...(associationFormData.ein && { ein: associationFormData.ein }),
        ...(associationFormData.yearFounded && { yearFounded: parseInt(associationFormData.yearFounded) }),
        ...(associationFormData.mission && { mission: associationFormData.mission }),
        ...(associationFormData.vision && { vision: associationFormData.vision }),
        ...(associationFormData.executiveDirectorName && { executiveDirectorName: associationFormData.executiveDirectorName }),
        ...(associationFormData.executiveDirectorEmail && { executiveDirectorEmail: associationFormData.executiveDirectorEmail }),
        ...(associationFormData.executiveDirectorPhone && { executiveDirectorPhone: associationFormData.executiveDirectorPhone }),
        ...(associationFormData.boardChairName && { boardChairName: associationFormData.boardChairName }),
        ...(associationFormData.boardChairEmail && { boardChairEmail: associationFormData.boardChairEmail }),
        ...(associationFormData.programsOffered.length > 0 && { programsOffered: associationFormData.programsOffered }),
        ...(associationFormData.certificationProgram && { certificationProgram: associationFormData.certificationProgram }),
        ...(associationFormData.trainingProgram && { trainingProgram: associationFormData.trainingProgram }),
        ...(associationFormData.advocacyActivities && { advocacyActivities: associationFormData.advocacyActivities }),
        ...(associationFormData.partnerOrganizations && { partnerOrganizations: associationFormData.partnerOrganizations }),
        ...(associationFormData.membershipTiers.length > 0 && { membershipTiers: associationFormData.membershipTiers }),
        ...(associationFormData.currentMemberCount > 0 && { currentMemberCount: associationFormData.currentMemberCount }),
        ...(associationFormData.chwMemberCount > 0 && { chwMemberCount: associationFormData.chwMemberCount }),
        ...(associationFormData.organizationalMemberCount > 0 && { organizationalMemberCount: associationFormData.organizationalMemberCount }),
        ...(associationFormData.annualMembershipFee && { annualMembershipFee: associationFormData.annualMembershipFee }),
        ...(associationFormData.governanceStructure && { governanceStructure: associationFormData.governanceStructure }),
      } as any);
      
      // Update active status if needed (the default is already true, so we only need to change if false)
      if (!associationFormData.isActive) {
        await CHWAssociationService.setUserActiveStatus(newAssociation.id, false);
      }
      
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
      
      // Convert form contact info to service ContactInfo format
      const serviceContactInfo = {
        email: associationFormData.contactInfo.email,
        phone: associationFormData.contactInfo.phone || undefined,
        website: associationFormData.contactInfo.website || undefined,
        address: associationFormData.contactInfo.address.street ? {
          street1: associationFormData.contactInfo.address.street,
          city: associationFormData.contactInfo.address.city,
          state: associationFormData.contactInfo.address.state,
          zipCode: associationFormData.contactInfo.address.zipCode,
          country: 'USA'
        } : undefined
      };
      
      // Update association via service
      await CHWAssociationService.updateAssociation(editingAssociationId, {
        name: associationFormData.name,
        abbreviation: associationFormData.acronym || undefined,
        description: associationFormData.description,
        contactInfo: serviceContactInfo,
        logo: associationFormData.logo || undefined,
        primaryColor: associationFormData.primaryColor || undefined,
        approvalStatus: associationFormData.approvalStatus,
        // Extended fields from public wizard
        ...(associationFormData.ein && { ein: associationFormData.ein }),
        ...(associationFormData.yearFounded && { yearFounded: parseInt(associationFormData.yearFounded) }),
        ...(associationFormData.mission && { mission: associationFormData.mission }),
        ...(associationFormData.vision && { vision: associationFormData.vision }),
        ...(associationFormData.executiveDirectorName && { executiveDirectorName: associationFormData.executiveDirectorName }),
        ...(associationFormData.executiveDirectorEmail && { executiveDirectorEmail: associationFormData.executiveDirectorEmail }),
        ...(associationFormData.executiveDirectorPhone && { executiveDirectorPhone: associationFormData.executiveDirectorPhone }),
        ...(associationFormData.boardChairName && { boardChairName: associationFormData.boardChairName }),
        ...(associationFormData.boardChairEmail && { boardChairEmail: associationFormData.boardChairEmail }),
        programsOffered: associationFormData.programsOffered,
        certificationProgram: associationFormData.certificationProgram,
        trainingProgram: associationFormData.trainingProgram,
        ...(associationFormData.advocacyActivities && { advocacyActivities: associationFormData.advocacyActivities }),
        ...(associationFormData.partnerOrganizations && { partnerOrganizations: associationFormData.partnerOrganizations }),
        membershipTiers: associationFormData.membershipTiers,
        currentMemberCount: associationFormData.currentMemberCount,
        chwMemberCount: associationFormData.chwMemberCount,
        organizationalMemberCount: associationFormData.organizationalMemberCount,
        ...(associationFormData.annualMembershipFee && { annualMembershipFee: associationFormData.annualMembershipFee }),
        ...(associationFormData.governanceStructure && { governanceStructure: associationFormData.governanceStructure }),
      } as any);
      
      // Update the isActive status separately
      if (associationFormData.isActive !== undefined) {
        await CHWAssociationService.setUserActiveStatus(editingAssociationId, associationFormData.isActive);
      }
      
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
      // Use the dedicated method for toggling active status
      await CHWAssociationService.setUserActiveStatus(association.id, !association.isActive);
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
      
      {/* Association Creation/Editing Dialog - Expanded to match public wizard */}
      <Dialog open={openAssociationDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit CHW Association' : 'Create New CHW Association'}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Section: Association Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#0071E3', mb: 1 }}>
                Association Information
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Association Name"
                required
                value={associationFormData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Acronym"
                value={associationFormData.acronym}
                onChange={(e) => handleFormChange('acronym', e.target.value)}
                placeholder="e.g., NCCHWA"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel id="state-select-label">State</InputLabel>
                <Select
                  labelId="state-select-label"
                  value={associationFormData.stateId}
                  label="State"
                  onChange={(e) => handleFormChange('stateId', e.target.value)}
                  disabled={isEditMode}
                >
                  {states.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Year Founded"
                type="number"
                value={associationFormData.yearFounded}
                onChange={(e) => handleFormChange('yearFounded', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="EIN (Tax ID)"
                value={associationFormData.ein}
                onChange={(e) => handleFormChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Website"
                value={associationFormData.contactInfo.website}
                onChange={(e) => handleFormChange('contactInfo.website', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mission Statement"
                multiline
                rows={2}
                value={associationFormData.mission}
                onChange={(e) => handleFormChange('mission', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vision Statement"
                multiline
                rows={2}
                value={associationFormData.vision}
                onChange={(e) => handleFormChange('vision', e.target.value)}
              />
            </Grid>
            
            {/* Section: Leadership & Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                Leadership & Contact
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Executive Director Name"
                value={associationFormData.executiveDirectorName}
                onChange={(e) => handleFormChange('executiveDirectorName', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Executive Director Email"
                type="email"
                value={associationFormData.executiveDirectorEmail}
                onChange={(e) => handleFormChange('executiveDirectorEmail', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Executive Director Phone"
                value={associationFormData.executiveDirectorPhone}
                onChange={(e) => handleFormChange('executiveDirectorPhone', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Board Chair Name"
                value={associationFormData.boardChairName}
                onChange={(e) => handleFormChange('boardChairName', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Board Chair Email"
                type="email"
                value={associationFormData.boardChairEmail}
                onChange={(e) => handleFormChange('boardChairEmail', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Contact Email"
                required
                type="email"
                value={associationFormData.contactInfo.email}
                onChange={(e) => handleFormChange('contactInfo.email', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Contact Phone"
                value={associationFormData.contactInfo.phone}
                onChange={(e) => handleFormChange('contactInfo.phone', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mailing Address - Street"
                value={associationFormData.contactInfo.address.street}
                onChange={(e) => handleFormChange('contactInfo.address.street', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="City"
                value={associationFormData.contactInfo.address.city}
                onChange={(e) => handleFormChange('contactInfo.address.city', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="State"
                value={associationFormData.contactInfo.address.state}
                onChange={(e) => handleFormChange('contactInfo.address.state', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Zip Code"
                value={associationFormData.contactInfo.address.zipCode}
                onChange={(e) => handleFormChange('contactInfo.address.zipCode', e.target.value)}
              />
            </Grid>
            
            {/* Section: Programs & Services */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                Programs & Services
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="programs-label">Programs Offered</InputLabel>
                <Select
                  labelId="programs-label"
                  multiple
                  value={associationFormData.programsOffered}
                  label="Programs Offered"
                  onChange={(e) => handleFormChange('programsOffered', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {PROGRAM_TYPES.map((program) => (
                    <MenuItem key={program} value={program}>
                      {program}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={associationFormData.certificationProgram}
                    onChange={(e) => handleFormChange('certificationProgram', e.target.checked)}
                  />
                }
                label="Offers CHW Certification Program"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={associationFormData.trainingProgram}
                    onChange={(e) => handleFormChange('trainingProgram', e.target.checked)}
                  />
                }
                label="Offers CHW Training Program"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Advocacy Activities"
                multiline
                rows={2}
                value={associationFormData.advocacyActivities}
                onChange={(e) => handleFormChange('advocacyActivities', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Partner Organizations"
                multiline
                rows={2}
                value={associationFormData.partnerOrganizations}
                onChange={(e) => handleFormChange('partnerOrganizations', e.target.value)}
              />
            </Grid>
            
            {/* Section: Membership & Structure */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                Membership & Structure
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="membership-tiers-label">Membership Tiers</InputLabel>
                <Select
                  labelId="membership-tiers-label"
                  multiple
                  value={associationFormData.membershipTiers}
                  label="Membership Tiers"
                  onChange={(e) => handleFormChange('membershipTiers', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {tier}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Member Count"
                type="number"
                value={associationFormData.currentMemberCount}
                onChange={(e) => handleFormChange('currentMemberCount', parseInt(e.target.value) || 0)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CHW Member Count"
                type="number"
                value={associationFormData.chwMemberCount}
                onChange={(e) => handleFormChange('chwMemberCount', parseInt(e.target.value) || 0)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Organizational Member Count"
                type="number"
                value={associationFormData.organizationalMemberCount}
                onChange={(e) => handleFormChange('organizationalMemberCount', parseInt(e.target.value) || 0)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Membership Fee"
                value={associationFormData.annualMembershipFee}
                onChange={(e) => handleFormChange('annualMembershipFee', e.target.value)}
                placeholder="e.g., $50 Individual, $500 Organization"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Governance Structure"
                value={associationFormData.governanceStructure}
                onChange={(e) => handleFormChange('governanceStructure', e.target.value)}
                placeholder="e.g., Board of Directors"
              />
            </Grid>
            
            {/* Section: Branding */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                Branding
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Logo URL"
                value={associationFormData.logo}
                onChange={(e) => handleFormChange('logo', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Color (hex)"
                value={associationFormData.primaryColor}
                onChange={(e) => handleFormChange('primaryColor', e.target.value)}
                placeholder="#0066CC"
              />
            </Grid>
            
            {/* Section: Status (Edit Mode Only) */}
            {isEditMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#0071E3', mb: 1, mt: 2 }}>
                    Status
                  </Typography>
                  <Divider />
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
