'use client';

import React, { useState } from 'react';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { CollaboratingEntity } from '@/types/grant.types';

export function Step2FundingDetails() {
  const { grantData, addCollaboratingEntity, updateCollaboratingEntity, removeCollaboratingEntity } = useGrantWizard();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CollaboratingEntity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CollaboratingEntity>>({
    name: '',
    role: 'partner',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    responsibilities: []
  });
  
  // New responsibility input
  const [responsibility, setResponsibility] = useState('');
  
  const openAddEntityDialog = () => {
    setFormData({
      name: '',
      role: 'partner',
      description: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      responsibilities: []
    });
    setIsEditing(false);
    setOpenDialog(true);
  };
  
  const openEditEntityDialog = (entity: CollaboratingEntity) => {
    setFormData({...entity});
    setEditingEntity(entity);
    setIsEditing(true);
    setOpenDialog(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRoleChange = (e: any) => {
    setFormData({
      ...formData,
      role: e.target.value
    });
  };
  
  const handleAddResponsibility = () => {
    if (responsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...(formData.responsibilities || []), responsibility.trim()]
      });
      setResponsibility('');
    }
  };
  
  const handleRemoveResponsibility = (index: number) => {
    const updatedResponsibilities = [...(formData.responsibilities || [])];
    updatedResponsibilities.splice(index, 1);
    setFormData({
      ...formData,
      responsibilities: updatedResponsibilities
    });
  };
  
  const handleSaveEntity = () => {
    if (isEditing && editingEntity?.id) {
      // Update existing entity
      updateCollaboratingEntity(editingEntity.id, formData);
    } else {
      // Add new entity
      addCollaboratingEntity(formData as Omit<CollaboratingEntity, 'id'>);
    }
    setOpenDialog(false);
    setEditingEntity(null);
  };
  
  const handleDeleteEntity = (id: string) => {
    if (window.confirm('Are you sure you want to remove this entity?')) {
      removeCollaboratingEntity(id);
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'lead': return 'Lead Organization';
      case 'partner': return 'Partner';
      case 'evaluator': return 'Evaluator';
      case 'stakeholder': return 'Stakeholder';
      default: return 'Other';
    }
  };
  
  const getRoleColor = (role: string) => {
    switch(role) {
      case 'lead': return 'primary';
      case 'partner': return 'secondary';
      case 'evaluator': return 'info';
      case 'stakeholder': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Entity Collaboration Details
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Identify all organizations collaborating on this grant and define their roles and responsibilities.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Multi-entity grants require clear definition of roles and responsibilities to ensure effective collaboration.
        </Alert>
      </Box>
      
      {/* Entity list */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={500}>
            Collaborating Entities
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={openAddEntityDialog}
          >
            Add Entity
          </Button>
        </Box>
        
        {/* Display all entities */}
        <Grid container spacing={3}>
          {grantData.collaboratingEntities && grantData.collaboratingEntities.length > 0 ? (
            grantData.collaboratingEntities.map((entity) => (
              <Grid item xs={12} md={6} key={entity.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {entity.name}
                        </Typography>
                        <Chip 
                          label={getRoleLabel(entity.role)} 
                          color={getRoleColor(entity.role) as any}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {entity.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Primary Contact:
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{entity.contactName}</Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{entity.contactEmail}</Typography>
                          </Box>
                        </Grid>
                        
                        {entity.contactPhone && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{entity.contactPhone}</Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Key Responsibilities:
                      </Typography>
                      
                      <List dense disablePadding>
                        {entity.responsibilities.map((resp, index) => (
                          <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={resp}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <IconButton size="small" onClick={() => openEditEntityDialog(entity)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteEntity(entity.id as string)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No Entities Added Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add organizations that will collaborate on this grant project.
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={openAddEntityDialog}
                >
                  Add First Entity
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* Entity Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Entity' : 'Add New Entity'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Entity Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleFormChange}
                placeholder="E.g., Regional Health Department"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  <MenuItem value="lead">Lead Organization</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                  <MenuItem value="evaluator">Evaluator</MenuItem>
                  <MenuItem value="stakeholder">Stakeholder</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Brief description of entity's role in the grant"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Primary Contact
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactName"
                label="Contact Name"
                fullWidth
                required
                value={formData.contactName}
                onChange={handleFormChange}
                placeholder="Full name of primary contact"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactEmail"
                label="Contact Email"
                type="email"
                fullWidth
                required
                value={formData.contactEmail}
                onChange={handleFormChange}
                placeholder="Email address"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactPhone"
                label="Contact Phone"
                fullWidth
                value={formData.contactPhone || ''}
                onChange={handleFormChange}
                placeholder="Phone number (optional)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Key Responsibilities
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Responsibility"
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  placeholder="E.g., Financial oversight"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddResponsibility();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddResponsibility}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                {formData.responsibilities && formData.responsibilities.length > 0 ? (
                  <List dense>
                    {formData.responsibilities.map((resp, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemText primary={resp} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small" onClick={() => handleRemoveResponsibility(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                    No responsibilities added yet
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEntity}
            disabled={!formData.name || !formData.contactName || !formData.contactEmail}
          >
            {isEditing ? 'Update' : 'Add'} Entity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
