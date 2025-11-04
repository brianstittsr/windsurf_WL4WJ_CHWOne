'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  CheckCircle as CheckCircleIcon,
  RemoveRedEye as PreviewIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { FormField, FormSection, FormTemplate, DataCollectionMethod } from '@/types/grant.types';

export function Step6FormGenerator() {
  const { grantData, updateGrantData } = useGrantWizard();
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>(grantData.formTemplates || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Field editing state
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<{field: FormField | null; sectionId: string; isNew: boolean}>({ 
    field: null, 
    sectionId: '', 
    isNew: false 
  });
  
  // Section editing state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{section: FormSection | null; isNew: boolean}>({ 
    section: null, 
    isNew: false 
  });
  
  // Local state for field form
  const [fieldForm, setFieldForm] = useState<FormField>({
    id: '',
    name: '',
    label: '',
    type: 'text',
    required: true,
    placeholder: '',
    width: 'full',
    helpText: ''
  });
  
  // Local state for section form
  const [sectionForm, setSectionForm] = useState<Partial<FormSection>>({
    id: '',
    title: '',
    description: '',
    fields: []
  });
  
  // Generate form templates based on data collection methods
  useEffect(() => {
    // Only auto-generate if no templates exist yet and we have data collection methods
    if ((formTemplates.length === 0) && (grantData.dataCollectionMethods?.length || 0) > 0) {
      const generatedTemplates: FormTemplate[] = generateFormsFromDataCollection(grantData.dataCollectionMethods || []);
      setFormTemplates(generatedTemplates);
      updateGrantData({ formTemplates: generatedTemplates });
      
      if (generatedTemplates.length > 0) {
        setSelectedTemplateId(generatedTemplates[0].id);
      }
    }
  }, [grantData.dataCollectionMethods]);

  // Save form templates to grant data when they change
  useEffect(() => {
    if (formTemplates.length > 0) {
      updateGrantData({ formTemplates });
    }
  }, [formTemplates]);

  // Function to generate form templates from data collection methods
  const generateFormsFromDataCollection = (methods: DataCollectionMethod[]): FormTemplate[] => {
    return methods.map((method, index) => {
      // Generate a form template for each data collection method
      const formId = `form-${Date.now()}-${index}`;
      
      // Generate fields based on data points
      const fields: FormField[] = method.dataPoints.map((dataPoint, i) => ({
        id: `field-${i}`,
        name: dataPoint.toLowerCase().replace(/\s+/g, '_'),
        label: dataPoint,
        type: inferFieldType(dataPoint),
        required: true,
        placeholder: `Enter ${dataPoint}`,
        width: 'full'
      }));
      
      // Create a form section
      const section: FormSection = {
        id: `section-1`,
        title: method.name,
        description: method.description,
        fields
      };
      
      // Create the form template
      return {
        id: formId,
        name: `${method.name} Form`,
        description: `Form for collecting ${method.name.toLowerCase()} data`,
        purpose: inferFormPurpose(method.name),
        sections: [section],
        createdAt: new Date().toISOString(),
        status: 'draft',
        entityResponsible: method.responsibleEntity,
        frequency: method.frequency
      };
    });
  };

  // Helper function to infer field type based on data point name
  const inferFieldType = (dataPoint: string): FormField['type'] => {
    const point = dataPoint.toLowerCase();
    
    if (point.includes('date') || point.includes('time')) return 'date';
    if (point.includes('number') || point.includes('count') || point.includes('amount') || 
        point.includes('score') || point.includes('rate') || point.includes('percentage')) return 'number';
    if (point.includes('description') || point.includes('notes') || point.includes('comment')) return 'textarea';
    if (point.includes('select') || point.includes('category') || point.includes('type') || 
        point.includes('status')) return 'select';
    if (point.includes('agree') || point.includes('confirm') || point.includes('approve') || 
        point.includes('accept')) return 'checkbox';
    if (point.includes('upload') || point.includes('document') || point.includes('attachment') || 
        point.includes('file')) return 'file';
    
    return 'text'; // Default field type
  };
  
  // Helper function to infer form purpose
  const inferFormPurpose = (methodName: string): FormTemplate['purpose'] => {
    const name = methodName.toLowerCase();
    
    if (name.includes('intake') || name.includes('registration')) return 'intake';
    if (name.includes('progress') || name.includes('update')) return 'progress';
    if (name.includes('assessment') || name.includes('evaluation')) return 'assessment';
    if (name.includes('feedback') || name.includes('survey')) return 'feedback';
    if (name.includes('report') || name.includes('outcome')) return 'reporting';
    
    return 'data' as any; // Default purpose
  };
  
  // Function to add a new form template
  const addFormTemplate = () => {
    const newTemplate: FormTemplate = {
      id: `form-${Date.now()}`,
      name: "New Form Template",
      description: "Enter description here",
      purpose: 'intake',
      sections: [{
        id: `section-${Date.now()}`,
        title: "Form Section",
        description: "Enter section description",
        fields: []
      }],
      createdAt: new Date().toISOString(),
      status: 'draft',
      entityResponsible: grantData.collaboratingEntities?.[0]?.name || 'Lead Organization'
    };
    
    setFormTemplates([...formTemplates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
    setTabIndex(0);
  };
  
  // Function to delete a form template
  const deleteFormTemplate = (templateId: string) => {
    const updatedTemplates = formTemplates.filter(template => template.id !== templateId);
    setFormTemplates(updatedTemplates);
    
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(updatedTemplates.length > 0 ? updatedTemplates[0].id : null);
    }
  };
  
  // Function to update a form template
  const updateFormTemplate = (templateId: string, updates: Partial<FormTemplate>) => {
    const updatedTemplates = formTemplates.map(template => 
      template.id === templateId ? { ...template, ...updates } : template
    );
    setFormTemplates(updatedTemplates);
  };
  
  // Find the selected form template
  const selectedTemplate = formTemplates.find(template => template.id === selectedTemplateId);
  
  // Function to render form templates list
  const renderFormTemplatesList = () => {
    if (formTemplates.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No form templates have been generated yet. Click the button below to create your first form template.
        </Alert>
      );
    }
    
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Form Name</strong></TableCell>
              <TableCell><strong>Purpose</strong></TableCell>
              <TableCell><strong>Responsible Entity</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formTemplates.map((template) => (
              <TableRow 
                key={template.id} 
                selected={template.id === selectedTemplateId}
                onClick={() => setSelectedTemplateId(template.id)}
                hover
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FileCopyIcon sx={{ color: 'primary.main', mr: 1 }} />
                    {template.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={template.purpose.replace('_', ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{template.entityResponsible}</TableCell>
                <TableCell>
                  <Chip 
                    label={template.status}
                    size="small"
                    color={template.status === 'active' ? 'success' : 
                           template.status === 'draft' ? 'default' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFormTemplate(template.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Add a new section to the form
  const addFormSection = (templateId: string) => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      fields: []
    };
    
    const updatedTemplates = formTemplates.map(template => 
      template.id === templateId ? 
        { ...template, sections: [...template.sections, newSection] } : 
        template
    );
    
    setFormTemplates(updatedTemplates);
  };
  
  // Update a section in the form
  const updateFormSection = (templateId: string, sectionId: string, updates: Partial<FormSection>) => {
    const updatedTemplates = formTemplates.map(template => {
      if (template.id === templateId) {
        const updatedSections = template.sections.map(section => 
          section.id === sectionId ? { ...section, ...updates } : section
        );
        return { ...template, sections: updatedSections };
      }
      return template;
    });
    
    setFormTemplates(updatedTemplates);
  };
  
  // Delete a section from the form
  const deleteFormSection = (templateId: string, sectionId: string) => {
    const updatedTemplates = formTemplates.map(template => {
      if (template.id === templateId) {
        return { 
          ...template, 
          sections: template.sections.filter(section => section.id !== sectionId)
        };
      }
      return template;
    });
    
    setFormTemplates(updatedTemplates);
  };
  
  // Add a field to a section
  const addFieldToSection = (templateId: string, sectionId: string, field: FormField) => {
    const updatedTemplates = formTemplates.map(template => {
      if (template.id === templateId) {
        const updatedSections = template.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              fields: [...section.fields, field]
            };
          }
          return section;
        });
        return { ...template, sections: updatedSections };
      }
      return template;
    });
    
    setFormTemplates(updatedTemplates);
  };
  
  // Update a field in a section
  const updateFieldInSection = (templateId: string, sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    const updatedTemplates = formTemplates.map(template => {
      if (template.id === templateId) {
        const updatedSections = template.sections.map(section => {
          if (section.id === sectionId) {
            const updatedFields = section.fields.map(field => 
              field.id === fieldId ? { ...field, ...updates } : field
            );
            return { ...section, fields: updatedFields };
          }
          return section;
        });
        return { ...template, sections: updatedSections };
      }
      return template;
    });
    
    setFormTemplates(updatedTemplates);
  };
  
  // Delete a field from a section
  const deleteFieldFromSection = (templateId: string, sectionId: string, fieldId: string) => {
    const updatedTemplates = formTemplates.map(template => {
      if (template.id === templateId) {
        const updatedSections = template.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              fields: section.fields.filter(field => field.id !== fieldId)
            };
          }
          return section;
        });
        return { ...template, sections: updatedSections };
      }
      return template;
    });
    
    setFormTemplates(updatedTemplates);
  };
  
  // Open field editor dialog
  const openFieldEditor = (sectionId: string, field: FormField | null = null, isNew: boolean = false) => {
    setEditingField({ field, sectionId, isNew });
    setFieldDialogOpen(true);
  };
  
  // Handle field save
  const handleFieldSave = (field: FormField) => {
    if (selectedTemplate) {
      if (editingField.isNew) {
        addFieldToSection(selectedTemplate.id, editingField.sectionId, field);
      } else if (editingField.field) {
        updateFieldInSection(selectedTemplate.id, editingField.sectionId, editingField.field.id, field);
      }
    }
    setFieldDialogOpen(false);
  };
  
  // Open section editor dialog
  const openSectionEditor = (section: FormSection | null = null, isNew: boolean = false) => {
    setEditingSection({ section, isNew });
    setSectionDialogOpen(true);
  };
  
  // Handle section save
  const handleSectionSave = (section: FormSection) => {
    if (selectedTemplate) {
      if (editingSection.isNew) {
        const newSection = {
          ...section,
          id: `section-${Date.now()}`,
          fields: []
        };
        updateFormTemplate(selectedTemplate.id, {
          sections: [...selectedTemplate.sections, newSection]
        });
      } else if (editingSection.section) {
        updateFormSection(
          selectedTemplate.id, 
          editingSection.section.id, 
          section
        );
      }
    }
    setSectionDialogOpen(false);
  };

  // Function to render form builder
  const renderFormTemplateEditor = () => {
    if (!selectedTemplate) {
      return (
        <Alert severity="info">
          Select a form template from the list or create a new one to start editing.
        </Alert>
      );
    }
    
    return (
      <Box>
        <Tabs 
          value={tabIndex} 
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Form Details" />
          <Tab label="Form Builder" />
          <Tab label="Preview" />
        </Tabs>
        
        {tabIndex === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Form Name"
                value={selectedTemplate.name}
                onChange={(e) => updateFormTemplate(selectedTemplate.id, { name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Form Purpose</InputLabel>
                <Select
                  value={selectedTemplate.purpose}
                  label="Form Purpose"
                  onChange={(e) => updateFormTemplate(selectedTemplate.id, { 
                    purpose: e.target.value as FormTemplate['purpose'] 
                  })}
                >
                  <MenuItem value="intake">Client Intake</MenuItem>
                  <MenuItem value="progress">Progress Tracking</MenuItem>
                  <MenuItem value="assessment">Assessment</MenuItem>
                  <MenuItem value="feedback">Feedback</MenuItem>
                  <MenuItem value="reporting">Reporting</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Form Description"
                value={selectedTemplate.description}
                onChange={(e) => updateFormTemplate(selectedTemplate.id, { description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Responsible Entity</InputLabel>
                <Select
                  value={selectedTemplate.entityResponsible}
                  label="Responsible Entity"
                  onChange={(e) => updateFormTemplate(selectedTemplate.id, { 
                    entityResponsible: e.target.value as string
                  })}
                >
                  {grantData.collaboratingEntities?.map(entity => (
                    <MenuItem key={entity.id} value={entity.name}>{entity.name}</MenuItem>
                  )) || (
                    <MenuItem value="Lead Organization">Lead Organization</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={selectedTemplate.frequency || 'once'}
                  label="Frequency"
                  onChange={(e) => updateFormTemplate(selectedTemplate.id, { 
                    frequency: e.target.value as FormTemplate['frequency'] 
                  })}
                >
                  <MenuItem value="once">Once</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedTemplate.status}
                  label="Status"
                  onChange={(e) => updateFormTemplate(selectedTemplate.id, { 
                    status: e.target.value as FormTemplate['status'] 
                  })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={Boolean(selectedTemplate.contractDeliverable)}
                    onChange={(e) => updateFormTemplate(selectedTemplate.id, { 
                      contractDeliverable: e.target.checked 
                    })}
                  />
                }
                label="Contract Deliverable"
              />
              <Tooltip title="Mark this form as a required deliverable under the grant contract">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        )}
        
        {tabIndex === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Form builder will load all fields from your data collection methods. You can add, edit or remove fields as needed.
              <br />
              <Button 
                size="small" 
                onClick={() => openSectionEditor(null, true)} 
                sx={{ mt: 1 }}
              >
                <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
                Add Section
              </Button>
            </Alert>
            
            {selectedTemplate.sections.map((section, sectionIndex) => (
              <Paper key={section.id} variant="outlined" sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{section.title || `Section ${sectionIndex + 1}`}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => openSectionEditor(section, false)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        if (selectedTemplate && window.confirm('Are you sure you want to delete this section?')) {
                          deleteFormSection(selectedTemplate.id, section.id);
                        }
                      }}
                      disabled={selectedTemplate?.sections.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {section.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {section.description}
                  </Typography>
                )}
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ pl: 1 }}>
                  {section.fields.map((field, fieldIndex) => (
                    <Paper 
                      key={field.id} 
                      variant="outlined"
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        display: 'flex',
                        alignItems: 'center',
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main'
                      }}
                    >
                      <DragIcon sx={{ color: 'action.disabled', mr: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{field.label}</Typography>
                          {field.required && <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>*</Typography>}
                          <Chip 
                            label={field.type} 
                            size="small" 
                            sx={{ ml: 1, height: 20, fontSize: '0.6rem' }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Field name: {field.name}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => openFieldEditor(section.id, field, false)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          if (selectedTemplate && window.confirm('Are you sure you want to delete this field?')) {
                            deleteFieldFromSection(selectedTemplate.id, section.id, field.id);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                  
                  {section.fields.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No fields in this section. Click "Add Field" to create your first field.
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => openFieldEditor(section.id, null, true)}
                  >
                    Add Field
                  </Button>
                </Box>
              </Paper>
            ))}
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openSectionEditor(null, true)}
              >
                Add Section
              </Button>
            </Box>
          </Box>
        )}
        
        {tabIndex === 2 && (
          <Box>
            <Alert severity="success" icon={<PreviewIcon />} sx={{ mb: 3 }}>
              This is a preview of how your form will appear to users.
            </Alert>
            
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>{selectedTemplate.name}</Typography>
              {selectedTemplate.description && (
                <Typography variant="body2" paragraph>{selectedTemplate.description}</Typography>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              {selectedTemplate.sections.map((section, sIndex) => (
                <Box key={section.id} sx={{ mb: 4 }}>
                  {section.title && <Typography variant="h6" gutterBottom>{section.title}</Typography>}
                  {section.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {section.description}
                    </Typography>
                  )}
                  
                  <Grid container spacing={2}>
                    {section.fields.map((field) => (
                      <Grid 
                        item 
                        xs={12} 
                        md={field.width === 'half' ? 6 : field.width === 'third' ? 4 : 12}
                        key={field.id}
                      >
                        {field.type === 'textarea' ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label={field.label}
                            placeholder={field.placeholder}
                            helperText={field.helpText}
                            required={field.required}
                            disabled
                          />
                        ) : field.type === 'select' ? (
                          <FormControl fullWidth>
                            <InputLabel>{field.label}{field.required && ' *'}</InputLabel>
                            <Select
                              label={field.label + (field.required ? ' *' : '')}
                              disabled
                              value=""
                            >
                              {field.options?.map((option, i) => (
                                <MenuItem key={i} value={option}>{option}</MenuItem>
                              )) || (
                                <MenuItem value="option">Sample Option</MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        ) : field.type === 'checkbox' ? (
                          <FormControlLabel
                            control={<Switch disabled />}
                            label={field.label}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            label={field.label}
                            placeholder={field.placeholder}
                            helperText={field.helpText}
                            required={field.required}
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            disabled
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  disabled
                >
                  Submit Form
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  // Update field form
  const updateFieldForm = (updates: Partial<FormField>) => {
    setFieldForm(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Generate field name from label
  const generateFieldName = (label: string) => {
    return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };
  
  // Reset field form when dialog opens
  useEffect(() => {
    if (fieldDialogOpen) {
      const initialField = editingField.field || {
        id: `field-${Date.now()}`,
        name: '',
        label: '',
        type: 'text',
        required: true,
        placeholder: '',
        width: 'full',
        helpText: ''
      };
      setFieldForm(initialField);
    }
  }, [fieldDialogOpen, editingField]);
  
  // Reset section form when dialog opens
  useEffect(() => {
    if (sectionDialogOpen) {
      const initialSection = editingSection.section || {
        id: '',
        title: '',
        description: '',
        fields: []
      };
      setSectionForm({...initialSection});
    }
  }, [sectionDialogOpen, editingSection]);
  
  // Field editing dialog
  const renderFieldEditDialog = () => {
    const isNewField = editingField.isNew;
    
    return (
      <Dialog 
        open={fieldDialogOpen} 
        onClose={() => setFieldDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isNewField ? 'Add New Field' : 'Edit Field'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Label"
                required
                value={fieldForm.label}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  updateFieldForm({
                    label: newLabel,
                    // Auto-generate name when label changes, but only if name is empty or matches old pattern
                    name: !fieldForm.name || fieldForm.name === generateFieldName(fieldForm.label || '') ?
                      generateFieldName(newLabel) : fieldForm.name
                  });
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Name (Technical ID)"
                required
                value={fieldForm.name}
                onChange={(e) => updateFieldForm({ name: e.target.value })}
                helperText="Used for data collection. Should be lowercase with underscores."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={fieldForm.type}
                  label="Field Type"
                  onChange={(e) => updateFieldForm({ type: e.target.value as FormField['type'] })}
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="textarea">Text Area</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="select">Dropdown</MenuItem>
                  <MenuItem value="checkbox">Checkbox</MenuItem>
                  <MenuItem value="file">File Upload</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Field Width</InputLabel>
                <Select
                  value={fieldForm.width}
                  label="Field Width"
                  onChange={(e) => updateFieldForm({ width: e.target.value as FormField['width'] })}
                >
                  <MenuItem value="full">Full Width</MenuItem>
                  <MenuItem value="half">Half Width</MenuItem>
                  <MenuItem value="third">One Third</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Placeholder"
                value={fieldForm.placeholder || ''}
                onChange={(e) => updateFieldForm({ placeholder: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Help Text"
                value={fieldForm.helpText || ''}
                onChange={(e) => updateFieldForm({ helpText: e.target.value })}
                helperText="Additional instructions shown below the field"
              />
            </Grid>
            
            {fieldForm.type === 'select' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Options"
                  multiline
                  rows={3}
                  value={(fieldForm.options || []).join('\n')}
                  onChange={(e) => {
                    const options = e.target.value.split('\n')
                      .map(option => option.trim())
                      .filter(option => option.length > 0);
                    updateFieldForm({ options });
                  }}
                  helperText="Enter each option on a new line"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(fieldForm.required)}
                    onChange={(e) => updateFieldForm({ required: e.target.checked })}
                  />
                }
                label="Required field"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleFieldSave(fieldForm)}
            disabled={!fieldForm.label || !fieldForm.name}
          >
            {isNewField ? 'Add' : 'Update'} Field
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Update section form
  const updateSectionForm = (updates: Partial<FormSection>) => {
    setSectionForm(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Section editing dialog
  const renderSectionEditDialog = () => {
    const isNewSection = editingSection.isNew;
    
    return (
      <Dialog 
        open={sectionDialogOpen} 
        onClose={() => setSectionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isNewSection ? 'Add New Section' : 'Edit Section'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Title"
                required
                value={sectionForm.title || ''}
                onChange={(e) => updateSectionForm({ title: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Description"
                multiline
                rows={2}
                value={sectionForm.description || ''}
                onChange={(e) => updateSectionForm({ description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSectionSave(sectionForm as FormSection)}
            disabled={!sectionForm.title}
          >
            {isNewSection ? 'Add' : 'Update'} Section
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Render dialogs */}
      {renderFieldEditDialog()}
      {renderSectionEditDialog()}
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          The Form Generator automatically creates data collection forms based on your grant requirements. 
          These forms will be deployed to collect data from relevant entities and stakeholders.
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography variant="h6">Form Templates</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={addFormTemplate}
          >
            Create New Form
          </Button>
        </Box>
        
        {renderFormTemplatesList()}
      </Box>
      
      <Box sx={{ mt: 4 }}>
        {renderFormTemplateEditor()}
      </Box>
    </Box>
  );
}
