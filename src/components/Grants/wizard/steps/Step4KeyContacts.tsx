'use client';

import React, { useState, useEffect } from 'react';
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
  Alert,
  FormHelperText,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  StepIconProps
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Adjust as InProgressIcon,
  ArrowForward as ArrowIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ProjectMilestone } from '@/types/grant.types';
import { format, parseISO, isValid, addDays } from 'date-fns';

// Custom styled StepConnector
const MilestoneConnector = styled(StepConnector)(({ theme }) => ({
  [`& .MuiStepConnector-line`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// Custom step icon
const MilestoneStepIcon = (props: StepIconProps) => {
  const { active, completed, className } = props;
  
  return (
    <Box
      className={className}
      sx={{
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {completed ? (
        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
      ) : active ? (
        <InProgressIcon sx={{ color: 'primary.main', fontSize: 24 }} />
      ) : (
        <UncheckedIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
      )}
    </Box>
  );
};

export function Step4KeyContacts() {
  const { grantData, addProjectMilestone, updateProjectMilestone, removeProjectMilestone } = useGrantWizard();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProjectMilestone>>({
    name: '',
    description: '',
    dueDate: '',
    status: 'not_started',
    responsibleParties: [],
    dependencies: []
  });
  
  // Entity and dependency selections
  const [entitySelection, setEntitySelection] = useState<string>('');
  const [dependencySelection, setDependencySelection] = useState<string>('');
  
  // Get available entities and milestones
  const collaboratingEntities = grantData.collaboratingEntities || [];
  const existingMilestones = grantData.projectMilestones || [];
  
  // Sort milestones by due date
  const sortedMilestones = [...existingMilestones].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  const openAddMilestoneDialog = () => {
    // Generate default due date (2 weeks from now)
    const defaultDueDate = addDays(new Date(), 14).toISOString().split('T')[0];
    
    setFormData({
      name: '',
      description: '',
      dueDate: defaultDueDate,
      status: 'not_started',
      responsibleParties: [],
      dependencies: []
    });
    setIsEditing(false);
    setOpenDialog(true);
  };
  
  const openEditMilestoneDialog = (milestone: ProjectMilestone) => {
    setFormData({...milestone});
    setEditingMilestone(milestone);
    setIsEditing(true);
    setOpenDialog(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleStatusChange = (e: any) => {
    setFormData({
      ...formData,
      status: e.target.value
    });
  };
  
  const handleDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setFormData({
        ...formData,
        dueDate: date.toISOString().split('T')[0]
      });
    }
  };
  
  const handleAddEntity = () => {
    if (entitySelection && !formData.responsibleParties?.includes(entitySelection)) {
      setFormData({
        ...formData,
        responsibleParties: [...(formData.responsibleParties || []), entitySelection]
      });
      setEntitySelection('');
    }
  };
  
  const handleAddDependency = () => {
    if (dependencySelection && !formData.dependencies?.includes(dependencySelection)) {
      setFormData({
        ...formData,
        dependencies: [...(formData.dependencies || []), dependencySelection]
      });
      setDependencySelection('');
    }
  };
  
  const handleRemoveEntity = (entity: string) => {
    setFormData({
      ...formData,
      responsibleParties: formData.responsibleParties?.filter(e => e !== entity) || []
    });
  };
  
  const handleRemoveDependency = (dependency: string) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies?.filter(d => d !== dependency) || []
    });
  };
  
  const handleSaveMilestone = () => {
    if (isEditing && editingMilestone?.id) {
      // Update existing milestone
      updateProjectMilestone(editingMilestone.id, formData);
    } else {
      // Add new milestone
      addProjectMilestone(formData as Omit<ProjectMilestone, 'id'>);
    }
    setOpenDialog(false);
    setEditingMilestone(null);
  };
  
  const handleDeleteMilestone = (id: string) => {
    if (window.confirm('Are you sure you want to remove this milestone?')) {
      removeProjectMilestone(id);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'delayed': return 'Delayed';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'not_started': return 'default';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'delayed': return 'error';
      default: return 'default';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'not_started': return <UncheckedIcon />;
      case 'in_progress': return <InProgressIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'delayed': return <AccessTimeIcon />;
      default: return <UncheckedIcon />;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'No date set';
    try {
      if (dateStr.includes('T')) {
        return format(parseISO(dateStr), 'MMM d, yyyy');
      }
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Check if milestone has dependencies on other milestones
  const hasDependencies = (milestone: ProjectMilestone) => {
    return milestone.dependencies && milestone.dependencies.length > 0;
  };
  
  // Find all milestones that depend on the given milestone
  const findDependentMilestones = (milestoneId: string) => {
    return existingMilestones.filter(m => 
      m.dependencies?.includes(milestoneId) || 
      m.dependencies?.includes(existingMilestones.find(em => em.id === milestoneId)?.name || '')
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Project Planning
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Define project milestones, timelines, and assign responsibilities to collaborating entities.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Effective project planning helps track progress, manage dependencies, and ensure timely grant implementation.
        </Alert>
      </Box>
      
      {/* Timeline visualization */}
      {sortedMilestones.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
            Project Timeline
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa' }}>
            <Stepper 
              orientation="vertical" 
              connector={<MilestoneConnector />}
              sx={{ '& .MuiStepLabel-iconContainer': { pr: 3 } }}
            >
              {sortedMilestones.map((milestone, index) => (
                <Step key={milestone.id} active={milestone.status === 'in_progress'} completed={milestone.status === 'completed'}>
                  <StepLabel StepIconComponent={MilestoneStepIcon}>
                    <Box sx={{ mb: 0.5 }}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {milestone.name}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Chip 
                            label={getStatusLabel(milestone.status)} 
                            color={getStatusColor(milestone.status) as any}
                            size="small"
                          />
                        </Grid>
                        <Grid item sx={{ flexGrow: 1 }} />
                        <Grid item>
                          <Typography variant="body2" color="text.secondary">
                            Due: {formatDate(milestone.dueDate)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {milestone.description}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {milestone.responsibleParties && milestone.responsibleParties.length > 0 && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Responsible: 
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                              {milestone.responsibleParties.map((entity) => (
                                <Chip 
                                  key={entity} 
                                  label={entity} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      
                      {hasDependencies(milestone) && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ArrowIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Dependencies: 
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                              {milestone.dependencies?.map((dep) => (
                                <Chip 
                                  key={dep} 
                                  label={dep} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => openEditMilestoneDialog(milestone)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteMilestone(milestone.id as string)}
                        disabled={findDependentMilestones(milestone.id as string).length > 0}
                        title={findDependentMilestones(milestone.id as string).length > 0 ? 
                          'Cannot delete: other milestones depend on this' : 'Delete milestone'}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>
      )}
      
      {/* Milestone management */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={500}>
            Project Milestones
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={openAddMilestoneDialog}
          >
            Add Milestone
          </Button>
        </Box>
        
        {/* Display existing milestones or empty state */}
        {sortedMilestones.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <FlagIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              No Project Milestones Defined Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define key project milestones with timelines and responsibilities.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={openAddMilestoneDialog}
            >
              Add First Milestone
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {sortedMilestones.map((milestone) => (
              <Grid item xs={12} md={6} key={milestone.id}>
                <Card variant="outlined" sx={{
                  borderColor: milestone.status === 'completed' ? 'success.main' : 
                              milestone.status === 'delayed' ? 'error.main' : 
                              milestone.status === 'in_progress' ? 'primary.main' : 'divider'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {milestone.name}
                        </Typography>
                        <Chip 
                          icon={getStatusIcon(milestone.status)}
                          label={getStatusLabel(milestone.status)} 
                          color={getStatusColor(milestone.status) as any}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      </Box>
                      <Box>
                        <Chip 
                          icon={<ScheduleIcon />}
                          label={formatDate(milestone.dueDate)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {milestone.description}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Responsible Parties:
                        </Typography>
                        {milestone.responsibleParties && milestone.responsibleParties.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {milestone.responsibleParties.map((entity) => (
                              <Chip 
                                key={entity} 
                                label={entity} 
                                size="small" 
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            None assigned
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Dependencies:
                        </Typography>
                        {milestone.dependencies && milestone.dependencies.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {milestone.dependencies.map((dep) => (
                              <Chip 
                                key={dep} 
                                label={dep} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No dependencies
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <IconButton size="small" onClick={() => openEditMilestoneDialog(milestone)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteMilestone(milestone.id as string)}
                      disabled={findDependentMilestones(milestone.id as string).length > 0}
                      title={findDependentMilestones(milestone.id as string).length > 0 ? 
                        'Cannot delete: other milestones depend on this' : 'Delete milestone'}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Milestone Form Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isEditing ? 'Edit Project Milestone' : 'Add New Project Milestone'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  name="name"
                  label="Milestone Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="E.g., Project Kickoff Meeting"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="not_started">Not Started</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="delayed">Delayed</MenuItem>
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
                  placeholder="Describe this milestone"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate ? parseISO(formData.dueDate) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'When should this milestone be completed?'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Responsible Parties" />
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Add Responsible Entity</InputLabel>
                    <Select
                      value={entitySelection}
                      onChange={(e) => setEntitySelection(e.target.value as string)}
                      label="Add Responsible Entity"
                    >
                      <MenuItem value=""><em>Select an entity</em></MenuItem>
                      {collaboratingEntities.map((entity) => (
                        <MenuItem 
                          key={entity.id} 
                          value={entity.name}
                          disabled={formData.responsibleParties?.includes(entity.name)}
                        >
                          {entity.name}
                        </MenuItem>
                      ))}
                      {collaboratingEntities.length === 0 && (
                        <MenuItem disabled>No entities available (add them in Step 2)</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <Button 
                    variant="contained" 
                    onClick={handleAddEntity}
                    disabled={!entitySelection}
                    sx={{ ml: 1 }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
                
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  {formData.responsibleParties && formData.responsibleParties.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.responsibleParties.map((entity) => (
                        <Chip 
                          key={entity} 
                          label={entity} 
                          onDelete={() => handleRemoveEntity(entity)}
                          sx={{ mb: 0.5, mr: 0.5 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                      No responsible parties assigned yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Dependencies" />
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Add Dependency</InputLabel>
                    <Select
                      value={dependencySelection}
                      onChange={(e) => setDependencySelection(e.target.value as string)}
                      label="Add Dependency"
                    >
                      <MenuItem value=""><em>Select a milestone</em></MenuItem>
                      {existingMilestones
                        .filter(m => m.id !== editingMilestone?.id) // Don't allow self-dependency
                        .map((milestone) => (
                          <MenuItem 
                            key={milestone.id} 
                            value={milestone.name}
                            disabled={formData.dependencies?.includes(milestone.name)}
                          >
                            {milestone.name}
                          </MenuItem>
                        ))}
                      {existingMilestones.length === (isEditing ? 1 : 0) && (
                        <MenuItem disabled>No other milestones available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <Button 
                    variant="contained" 
                    onClick={handleAddDependency}
                    disabled={!dependencySelection}
                    sx={{ ml: 1 }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
                
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  {formData.dependencies && formData.dependencies.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.dependencies.map((dependency) => (
                        <Chip 
                          key={dependency} 
                          label={dependency} 
                          onDelete={() => handleRemoveDependency(dependency)}
                          sx={{ mb: 0.5, mr: 0.5 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                      No dependencies added yet
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
              onClick={handleSaveMilestone}
              disabled={!formData.name || !formData.dueDate}
            >
              {isEditing ? 'Update' : 'Add'} Milestone
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
}
