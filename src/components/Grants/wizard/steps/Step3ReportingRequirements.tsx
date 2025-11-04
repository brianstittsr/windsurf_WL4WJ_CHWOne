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
  Alert,
  FormHelperText,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  DataObject as DataIcon,
  AddTask as AddTaskIcon
} from '@mui/icons-material';
import { DataCollectionMethod } from '@/types/grant.types';

export function Step3ReportingRequirements() {
  const { grantData, addDataCollectionMethod, updateDataCollectionMethod, removeDataCollectionMethod } = useGrantWizard();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DataCollectionMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<DataCollectionMethod>>({
    name: '',
    description: '',
    frequency: 'monthly',
    responsibleEntity: '',
    dataPoints: [],
    tools: []
  });
  
  // New dataPoint and tool inputs
  const [dataPoint, setDataPoint] = useState('');
  const [tool, setTool] = useState('');
  
  // If we have collaborating entities, populate the responsible entity dropdown
  const collaboratingEntities = grantData.collaboratingEntities || [];
  
  const openAddMethodDialog = () => {
    // Set default responsible entity if available
    const defaultEntity = collaboratingEntities.length > 0 ? 
      collaboratingEntities[0].name : '';
    
    setFormData({
      name: '',
      description: '',
      frequency: 'monthly',
      responsibleEntity: defaultEntity,
      dataPoints: [],
      tools: []
    });
    setIsEditing(false);
    setOpenDialog(true);
  };
  
  const openEditMethodDialog = (method: DataCollectionMethod) => {
    setFormData({...method});
    setEditingMethod(method);
    setIsEditing(true);
    setOpenDialog(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFrequencyChange = (e: any) => {
    setFormData({
      ...formData,
      frequency: e.target.value
    });
  };
  
  const handleEntityChange = (e: any) => {
    setFormData({
      ...formData,
      responsibleEntity: e.target.value
    });
  };
  
  const handleAddDataPoint = () => {
    if (dataPoint.trim()) {
      setFormData({
        ...formData,
        dataPoints: [...(formData.dataPoints || []), dataPoint.trim()]
      });
      setDataPoint('');
    }
  };
  
  const handleAddTool = () => {
    if (tool.trim()) {
      setFormData({
        ...formData,
        tools: [...(formData.tools || []), tool.trim()]
      });
      setTool('');
    }
  };
  
  const handleRemoveDataPoint = (index: number) => {
    const updatedDataPoints = [...(formData.dataPoints || [])];
    updatedDataPoints.splice(index, 1);
    setFormData({
      ...formData,
      dataPoints: updatedDataPoints
    });
  };
  
  const handleRemoveTool = (index: number) => {
    const updatedTools = [...(formData.tools || [])];
    updatedTools.splice(index, 1);
    setFormData({
      ...formData,
      tools: updatedTools
    });
  };
  
  const handleSaveMethod = () => {
    if (isEditing && editingMethod?.id) {
      // Update existing method
      updateDataCollectionMethod(editingMethod.id, formData);
    } else {
      // Add new method
      addDataCollectionMethod(formData as Omit<DataCollectionMethod, 'id'>);
    }
    setOpenDialog(false);
    setEditingMethod(null);
  };
  
  const handleDeleteMethod = (id: string) => {
    if (window.confirm('Are you sure you want to remove this data collection method?')) {
      removeDataCollectionMethod(id);
    }
  };
  
  const getFrequencyLabel = (frequency: string) => {
    switch(frequency) {
      case 'once': return 'One-time';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annually': return 'Annually';
      default: return frequency;
    }
  };
  
  const getFrequencyColor = (frequency: string) => {
    switch(frequency) {
      case 'daily': return 'error';
      case 'weekly': return 'warning';
      case 'monthly': return 'info';
      case 'quarterly': return 'success';
      case 'annually': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Data Collection Methods
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Define how data will be collected, measured, and tracked throughout the grant period.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Effective data collection is critical for grant reporting, program evaluation, and continuous improvement.
        </Alert>
      </Box>
      
      {/* Methods list */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={500}>
            Data Collection Methods
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={openAddMethodDialog}
          >
            Add Method
          </Button>
        </Box>
        
        {/* Display all methods */}
        <Grid container spacing={3}>
          {grantData.dataCollectionMethods && grantData.dataCollectionMethods.length > 0 ? (
            grantData.dataCollectionMethods.map((method) => (
              <Grid item xs={12} md={6} key={method.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {method.name}
                        </Typography>
                        <Chip 
                          label={getFrequencyLabel(method.frequency)} 
                          color={getFrequencyColor(method.frequency) as any}
                          size="small"
                          sx={{ mb: 2 }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {method.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Responsible Entity:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {method.responsibleEntity || 'Not specified'}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Data Points:
                          </Typography>
                          <List dense disablePadding>
                            {method.dataPoints.map((point, index) => (
                              <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                                <ListItemText 
                                  primary={point}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Collection Tools:
                          </Typography>
                          <List dense disablePadding>
                            {method.tools.map((tool, index) => (
                              <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                                <ListItemText 
                                  primary={tool}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <IconButton size="small" onClick={() => openEditMethodDialog(method)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteMethod(method.id as string)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No Data Collection Methods Added Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Define how you will collect and track data throughout the grant project.
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={openAddMethodDialog}
                >
                  Add First Method
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* Method Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Data Collection Method' : 'Add New Data Collection Method'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Method Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleFormChange}
                placeholder="E.g., Participant Surveys"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFrequencyChange}
                  label="Frequency"
                >
                  <MenuItem value="once">One-time</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
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
                placeholder="Describe this data collection method"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Responsible Entity</InputLabel>
                {collaboratingEntities.length > 0 ? (
                  <Select
                    name="responsibleEntity"
                    value={formData.responsibleEntity}
                    onChange={handleEntityChange}
                    label="Responsible Entity"
                  >
                    {collaboratingEntities.map((entity) => (
                      <MenuItem key={entity.id} value={entity.name}>{entity.name}</MenuItem>
                    ))}
                  </Select>
                ) : (
                  <>
                    <TextField
                      name="responsibleEntity"
                      label="Responsible Entity"
                      fullWidth
                      required
                      value={formData.responsibleEntity}
                      onChange={handleFormChange}
                      placeholder="Entity responsible for data collection"
                    />
                    <FormHelperText>Add collaborating entities in Step 2 to select from a list</FormHelperText>
                  </>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Data Points
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Data Point"
                  value={dataPoint}
                  onChange={(e) => setDataPoint(e.target.value)}
                  placeholder="E.g., Participant satisfaction rating"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDataPoint();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddDataPoint}
                  sx={{ ml: 1 }}
                >
                  <AddTaskIcon />
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                {formData.dataPoints && formData.dataPoints.length > 0 ? (
                  <List dense>
                    {formData.dataPoints.map((point, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemText primary={point} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small" onClick={() => handleRemoveDataPoint(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                    No data points added yet
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Collection Tools
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Collection Tool"
                  value={tool}
                  onChange={(e) => setTool(e.target.value)}
                  placeholder="E.g., Online survey platform"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTool();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddTool}
                  sx={{ ml: 1 }}
                >
                  <AddTaskIcon />
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                {formData.tools && formData.tools.length > 0 ? (
                  <List dense>
                    {formData.tools.map((tool, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemText primary={tool} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small" onClick={() => handleRemoveTool(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                    No collection tools added yet
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
            onClick={handleSaveMethod}
            disabled={!formData.name || !formData.responsibleEntity || !(formData.dataPoints && formData.dataPoints.length > 0)}
          >
            {isEditing ? 'Update' : 'Add'} Method
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
