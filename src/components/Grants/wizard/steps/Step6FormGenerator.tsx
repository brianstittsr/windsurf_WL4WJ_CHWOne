'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  Menu,
  MenuItem as MuiMenuItem,
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
  FormHelperText,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemText,
  CircularProgress,
  List,
  ListItem
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
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { FormField, FormSection, FormTemplate, DataCollectionMethod, FieldValidation, Dataset, DatasetField } from '@/types/grant.types';

export function Step6FormGenerator() {
  const { grantData, updateGrantData } = useGrantWizard();
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>(grantData.formTemplates || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [fieldTabIndex, setFieldTabIndex] = useState(0);
  
  // Export menu state
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  
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
  
  // AI Enhancement state
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  
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
  
  // Function to create a dataset from a form template
  const createDatasetFromForm = (formTemplate: FormTemplate): Dataset => {
    // Extract all fields from all sections
    const allFields: DatasetField[] = formTemplate.sections.flatMap(section => 
      section.fields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type === 'checkbox' ? 'boolean' as const : 
              field.type === 'file' ? 'text' as const : 
              field.type as 'text' | 'number' | 'date' | 'select' | 'textarea',
        required: field.required,
        description: field.helpText
      }))
    );
    
    return {
      id: `dataset-${formTemplate.id}`,
      name: `${formTemplate.name} Dataset`,
      description: `Auto-generated dataset for collecting ${formTemplate.name.toLowerCase()} data. This dataset is ready for data analysis and reporting.`,
      formTemplateId: formTemplate.id,
      fields: allFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      recordCount: 0,
      entityResponsible: formTemplate.entityResponsible,
      purpose: formTemplate.description,
      tags: [
        formTemplate.purpose,
        formTemplate.entityResponsible,
        ...(formTemplate.frequency ? [formTemplate.frequency] : [])
      ],
      analysisReady: true
    };
  };
  
  // Function to generate datasets for all form templates
  const generateDatasetsFromForms = (forms: FormTemplate[]): Dataset[] => {
    return forms.map(form => createDatasetFromForm(form));
  };
  
  // Generate form templates and datasets based on data collection methods
  useEffect(() => {
    // Only auto-generate if no templates exist yet and we have data collection methods
    if ((formTemplates.length === 0) && (grantData.dataCollectionMethods?.length || 0) > 0) {
      const generatedTemplates: FormTemplate[] = generateFormsFromDataCollection(grantData.dataCollectionMethods || []);
      const generatedDatasets: Dataset[] = generateDatasetsFromForms(generatedTemplates);
      
      setFormTemplates(generatedTemplates);
      updateGrantData({ 
        formTemplates: generatedTemplates,
        datasets: generatedDatasets
      });
      
      if (generatedTemplates.length > 0) {
        setSelectedTemplateId(generatedTemplates[0].id);
      }
    }
  }, [grantData.dataCollectionMethods, formTemplates.length, updateGrantData]);

  // Save form templates to grant data when they change
  useEffect(() => {
    updateGrantData({ formTemplates });
  }, [formTemplates, updateGrantData]);

  
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
          <Tab label="View & Share" />
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
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">AI Form Enhancement</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={getAIRecommendations}
                  disabled={loadingAI}
                  startIcon={loadingAI ? <CircularProgress size={20} /> : <SettingsIcon />}
                >
                  {loadingAI ? 'Analyzing...' : 'Get AI Recommendations'}
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Use AI to analyze your form and get recommendations for improvements, additional fields, and better data collection practices.
              </Typography>
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
                  <DragDropContext onDragEnd={handleFieldDragEnd}>
                    <Droppable droppableId={`droppable-fields-${section.id}`}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {section.fields.map((field, fieldIndex) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={fieldIndex}
                            >
                              {(provided, snapshot) => (
                                <Paper 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  variant="outlined"
                                  sx={{ 
                                    p: 1, 
                                    mb: 1, 
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderLeft: '4px solid',
                                    borderLeftColor: 'primary.main',
                                    backgroundColor: snapshot.isDragging ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                                    boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0, 0, 0, 0.2)' : 'inherit'
                                  }}
                                >
                                  <div {...provided.dragHandleProps}>
                                    <DragIcon sx={{ color: 'action.disabled', mr: 1 }} />
                                  </div>
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
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
              This is a real-time preview of how your form will appear to users.
            </Alert>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Live Preview
              </Typography>
              <Chip
                label="Real-time updates"
                color="success"
                size="small"
                icon={<CheckCircleIcon />}
              />
            </Box>
            
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
                    {section.fields.map((field) => {
                      // Determine field validation properties
                      const hasValidation = field.validation && Object.keys(field.validation).length > 0;
                      let helperTextFromValidation = '';
                      
                      if (hasValidation) {
                        if (field.validation?.minLength && field.validation?.maxLength) {
                          helperTextFromValidation = `${field.helpText || ''} (${field.validation.minLength}-${field.validation.maxLength} characters)`;
                        } else if (field.validation?.minLength) {
                          helperTextFromValidation = `${field.helpText || ''} (Min: ${field.validation.minLength} characters)`;
                        } else if (field.validation?.maxLength) {
                          helperTextFromValidation = `${field.helpText || ''} (Max: ${field.validation.maxLength} characters)`;
                        }
                        
                        if (field.validation?.phoneFormat) {
                          helperTextFromValidation = `${field.helpText || ''} (${field.validation.phoneFormat === 'us' ? 'US format' : 
                            field.validation.phoneFormat === 'international' ? 'International format' : 'Custom format'})`;
                        }
                        
                        if (field.validation?.emailFormat) {
                          helperTextFromValidation = `${field.helpText || ''} (Valid email required)`;
                        }
                      }
                      
                      return (
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
                              helperText={helperTextFromValidation || field.helpText}
                              required={field.required}
                            />
                          ) : field.type === 'select' ? (
                            <FormControl fullWidth>
                              <InputLabel>{field.label}{field.required && ' *'}</InputLabel>
                              <Select
                                label={field.label + (field.required ? ' *' : '')}
                                value=""
                              >
                                {field.options?.map((option, i) => (
                                  <MenuItem key={i} value={option}>{option}</MenuItem>
                                )) || (
                                  <MenuItem value="option">Sample Option</MenuItem>
                                )}
                              </Select>
                              {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
                            </FormControl>
                          ) : field.type === 'checkbox' ? (
                            <FormControlLabel
                              control={<Switch />}
                              label={field.label}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              label={field.label}
                              placeholder={field.placeholder}
                              helperText={helperTextFromValidation || field.helpText}
                              required={field.required}
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            />
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ))}
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                >
                  Submit Form
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
        
        {tabIndex === 3 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                View & Share Your Form
              </Typography>
              <Typography variant="body2">
                Use the options below to view your form, share it with others, or export it for use in other systems.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              {/* View Form Section */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="View Form" 
                    subheader="Open your form in a new window to see how it will appear to users"
                  />
                  <CardContent>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<PreviewIcon />}
                      onClick={() => {
                        // Switch to preview tab
                        setTabIndex(2);
                      }}
                      fullWidth
                    >
                      View Form Preview
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Share Form Section */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Share Form Link" 
                    subheader="Copy a shareable link to this form"
                  />
                  <CardContent>
                    <TextField
                      fullWidth
                      value={`${window.location.origin}/forms/${selectedTemplate.id}`}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FileCopyIcon />}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/forms/${selectedTemplate.id}`);
                        alert('Form link copied to clipboard!');
                      }}
                    >
                      Copy Link
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Export Options Section */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Export Form" 
                    subheader="Download your form in different formats"
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<FileCopyIcon />}
                        onClick={exportAsJson}
                        fullWidth
                      >
                        Export as JSON
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<FileCopyIcon />}
                        onClick={exportAsPdf}
                        fullWidth
                      >
                        Export as PDF
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Embed Code Section */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Embed Form" 
                    subheader="Copy this code to embed the form on your website"
                  />
                  <CardContent>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={`<iframe 
  src="${window.location.origin}/forms/${selectedTemplate.id}/embed" 
  width="100%" 
  height="600" 
  frameborder="0"
  title="${selectedTemplate.name}"
></iframe>`}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<FileCopyIcon />}
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="${window.location.origin}/forms/${selectedTemplate.id}/embed" width="100%" height="600" frameborder="0" title="${selectedTemplate.name}"></iframe>`);
                        alert('Embed code copied to clipboard!');
                      }}
                    >
                      Copy Embed Code
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Form Status & Distribution */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Form Distribution" 
                    subheader="Manage how this form is distributed and accessed"
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Access Level</InputLabel>
                          <Select
                            value={selectedTemplate.status === 'active' ? 'public' : 'private'}
                            label="Access Level"
                            onChange={(e) => {
                              updateFormTemplate(selectedTemplate.id, { 
                                status: e.target.value === 'public' ? 'active' : 'draft'
                              });
                            }}
                          >
                            <MenuItem value="public">Public - Anyone with link can access</MenuItem>
                            <MenuItem value="private">Private - Only authorized users</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={selectedTemplate.status === 'active'}
                              onChange={(e) => updateFormTemplate(selectedTemplate.id, { 
                                status: e.target.checked ? 'active' : 'draft' 
                              })}
                            />
                          }
                          label="Form is Active and Accepting Responses"
                        />
                      </Grid>
                    </Grid>
                    
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Form Status:</strong> {selectedTemplate.status === 'active' ? 'Active - Accepting Responses' : 'Draft - Not Accepting Responses'}
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              {/* QR Code Section */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="QR Code" 
                    subheader="Generate a QR code for easy mobile access"
                  />
                  <CardContent>
                    <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        QR Code for: {selectedTemplate.name}
                      </Typography>
                      <Box 
                        sx={{ 
                          width: 200, 
                          height: 200, 
                          mx: 'auto', 
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          QR Code will be generated here
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => alert('QR Code download feature coming soon!')}
                      >
                        Download QR Code
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Email Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Email Distribution" 
                    subheader="Send this form via email"
                  />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Email Addresses"
                      placeholder="Enter email addresses separated by commas"
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email Subject"
                      defaultValue={`Form: ${selectedTemplate.name}`}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => alert('Email distribution feature coming soon!')}
                    >
                      Send Form via Email
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    );
  };

  // Handle drag end event for field reordering
  const handleFieldDragEnd = (result: DropResult) => {
    // If dropped outside the droppable area
    if (!result.destination) return;
    
    // Parse the droppable ID to get the section ID
    const sectionId = result.destination.droppableId.replace('droppable-fields-', '');
    
    // Find the template and section
    if (selectedTemplate) {
      const updatedSections = [...selectedTemplate.sections];
      const sectionIndex = updatedSections.findIndex(section => section.id === sectionId);
      
      if (sectionIndex !== -1) {
        const section = {...updatedSections[sectionIndex]};
        const fields = [...section.fields];
        
        // Reorder the fields array
        const [removed] = fields.splice(result.source.index, 1);
        fields.splice(result.destination.index, 0, removed);
        
        // Update the section with the new fields order
        section.fields = fields;
        updatedSections[sectionIndex] = section;
        
        // Update the template
        updateFormTemplate(selectedTemplate.id, { sections: updatedSections });
      }
    }
  };
  
  // Update field form
  const updateFieldForm = (updates: Partial<FormField>) => {
    setFieldForm(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Export form template as JSON
  const exportAsJson = () => {
    if (!selectedTemplate) return;
    
    const dataStr = JSON.stringify(selectedTemplate, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    saveAs(dataBlob, `${selectedTemplate.name.replace(/\s+/g, '_')}_template.json`);
  };
  
  // Export form template as PDF
  const exportAsPdf = () => {
    if (!selectedTemplate) return;
    
    const doc = new jsPDF();
    let y = 20;
    
    // Add title
    doc.setFontSize(18);
    doc.text(selectedTemplate.name, 20, y);
    y += 10;
    
    // Add description
    if (selectedTemplate.description) {
      doc.setFontSize(12);
      doc.text(`Description: ${selectedTemplate.description}`, 20, y);
      y += 10;
    }
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Purpose: ${selectedTemplate.purpose}`, 20, y);
    y += 5;
    doc.text(`Status: ${selectedTemplate.status}`, 20, y);
    y += 5;
    doc.text(`Responsible Entity: ${selectedTemplate.entityResponsible}`, 20, y);
    y += 10;
    
    // Add sections and fields
    selectedTemplate.sections.forEach((section, index) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Section ${index + 1}: ${section.title}`, 20, y);
      y += 7;
      
      if (section.description) {
        doc.setFontSize(10);
        doc.text(`${section.description}`, 20, y);
        y += 7;
      }
      
      // Add fields
      doc.setFontSize(11);
      section.fields.forEach((field, fieldIndex) => {
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const required = field.required ? ' (Required)' : '';
        doc.text(`Field ${fieldIndex + 1}: ${field.label}${required} - Type: ${field.type}`, 25, y);
        y += 5;
        
        if (field.helpText) {
          doc.setFontSize(9);
          doc.text(`Help text: ${field.helpText}`, 30, y);
          y += 5;
          doc.setFontSize(11);
        }
      });
      
      y += 10;
    });
    
    doc.save(`${selectedTemplate.name.replace(/\s+/g, '_')}_template.pdf`);
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
      setFieldTabIndex(0); // Reset to basic settings tab
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
          
          {/* Validation tab */}
          {fieldTabIndex === 1 && (
            <Grid container spacing={2}>
              {/* Phone number validation */}
              {fieldForm.name?.includes('phone') && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Phone Number Validation
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Format Type</InputLabel>
                      <Select
                        value={fieldForm.validation?.phoneFormat || 'us'}
                        label="Format Type"
                        onChange={(e) => {
                          updateFieldForm({
                            validation: {
                              ...fieldForm.validation || {},
                              phoneFormat: e.target.value as 'us' | 'international' | 'custom',
                              // Set default pattern based on format
                              phonePattern: e.target.value === 'us' 
                                ? '^\\(\\d{3}\\)\\s?\\d{3}-\\d{4}$' 
                                : e.target.value === 'international'
                                ? '^\\+[1-9]\\d{1,14}$'
                                : fieldForm.validation?.phonePattern
                            }
                          });
                        }}
                      >
                        <MenuItem value="us">US Format (XXX) XXX-XXXX</MenuItem>
                        <MenuItem value="international">International</MenuItem>
                        <MenuItem value="custom">Custom Format</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {fieldForm.validation?.phoneFormat === 'custom' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Custom Pattern"
                        value={fieldForm.validation?.phonePattern || ''}
                        onChange={(e) => {
                          updateFieldForm({
                            validation: {
                              ...fieldForm.validation || {},
                              phonePattern: e.target.value
                            }
                          });
                        }}
                        helperText="Regular expression for phone validation"
                      />
                    </Grid>
                  )}
                </>
              )}
              
              {/* Email validation */}
              {fieldForm.name?.includes('email') && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Email Validation
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Email Validation</InputLabel>
                      <Select
                        value={fieldForm.validation?.emailFormat || 'standard'}
                        label="Email Validation"
                        onChange={(e) => {
                          updateFieldForm({
                            validation: {
                              ...fieldForm.validation || {},
                              emailFormat: e.target.value as 'standard' | 'strict' | 'loose'
                            }
                          });
                        }}
                      >
                        <MenuItem value="standard">Standard (name@domain.com)</MenuItem>
                        <MenuItem value="strict">Strict Validation</MenuItem>
                        <MenuItem value="loose">Basic Format Check</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(fieldForm.validation?.emailDomainCheck)}
                          onChange={(e) => updateFieldForm({
                            validation: {
                              ...fieldForm.validation || {},
                              emailDomainCheck: e.target.checked
                            }
                          })}
                        />
                      }
                      label="Verify domain exists"
                    />
                  </Grid>
                </>
              )}
              
              {/* Address lookup */}
              {(fieldForm.name?.includes('address') || fieldForm.name?.includes('zip') || fieldForm.name?.includes('postal')) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Address Lookup
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(fieldForm.validation?.enableAddressLookup)}
                          onChange={(e) => updateFieldForm({
                            validation: {
                              ...fieldForm.validation || {},
                              enableAddressLookup: e.target.checked
                            }
                          })}
                        />
                      }
                      label="Enable address lookup"
                    />
                  </Grid>
                  
                  {fieldForm.validation?.enableAddressLookup && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Lookup Method</InputLabel>
                          <Select
                            value={fieldForm.validation?.addressLookupType || 'zipcode'}
                            label="Lookup Method"
                            onChange={(e) => {
                              updateFieldForm({
                                validation: {
                                  ...fieldForm.validation || {},
                                  addressLookupType: e.target.value as 'postal' | 'zipcode'
                                }
                              });
                            }}
                          >
                            <MenuItem value="zipcode">ZIP Code Lookup (US)</MenuItem>
                            <MenuItem value="postal">Postal Code (International)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                          Fields to populate from lookup:
                        </Typography>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={Boolean(fieldForm.validation?.populateFields?.city)}
                                  onChange={(e) => updateFieldForm({
                                    validation: {
                                      ...fieldForm.validation || {},
                                      populateFields: {
                                        ...fieldForm.validation?.populateFields || {},
                                        city: e.target.checked ? 'city' : undefined
                                      }
                                    }
                                  })}
                                  size="small"
                                />
                              }
                              label="City"
                            />
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={Boolean(fieldForm.validation?.populateFields?.state)}
                                  onChange={(e) => updateFieldForm({
                                    validation: {
                                      ...fieldForm.validation || {},
                                      populateFields: {
                                        ...fieldForm.validation?.populateFields || {},
                                        state: e.target.checked ? 'state' : undefined
                                      }
                                    }
                                  })}
                                  size="small"
                                />
                              }
                              label="State"
                            />
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={Boolean(fieldForm.validation?.populateFields?.county)}
                                  onChange={(e) => updateFieldForm({
                                    validation: {
                                      ...fieldForm.validation || {},
                                      populateFields: {
                                        ...fieldForm.validation?.populateFields || {},
                                        county: e.target.checked ? 'county' : undefined
                                      }
                                    }
                                  })}
                                  size="small"
                                />
                              }
                              label="County"
                            />
                          </Grid>
                          
                          <Grid item xs={6} sm={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={Boolean(fieldForm.validation?.populateFields?.zipCode)}
                                  onChange={(e) => updateFieldForm({
                                    validation: {
                                      ...fieldForm.validation || {},
                                      populateFields: {
                                        ...fieldForm.validation?.populateFields || {},
                                        zipCode: e.target.checked ? 'zipCode' : undefined
                                      }
                                    }
                                  })}
                                  size="small"
                                />
                              }
                              label="ZIP"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </>
              )}
              
              {/* Text and Textarea validation */}
              {(fieldForm.type === 'text' || fieldForm.type === 'textarea') && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Length"
                      value={fieldForm.validation?.minLength || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            minLength: value
                          }
                        });
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Length"
                      value={fieldForm.validation?.maxLength || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            maxLength: value
                          }
                        });
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Regular Expression Pattern"
                      value={fieldForm.validation?.pattern || ''}
                      onChange={(e) => {
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            pattern: e.target.value || undefined
                          }
                        });
                      }}
                      helperText="For example: ^[A-Za-z0-9]+$ for alphanumeric only"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pattern Error Message"
                      value={fieldForm.validation?.patternMessage || ''}
                      onChange={(e) => {
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            patternMessage: e.target.value || undefined
                          }
                        });
                      }}
                      helperText="Message to display when pattern validation fails"
                    />
                  </Grid>
                </>
              )}

              {/* Number field validation */}
              {fieldForm.type === 'number' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum Value"
                      value={fieldForm.validation?.minValue ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            minValue: value
                          }
                        });
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum Value"
                      value={fieldForm.validation?.maxValue ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            maxValue: value
                          }
                        });
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* Date field validation */}
              {fieldForm.type === 'date' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Minimum Date"
                      InputLabelProps={{ shrink: true }}
                      value={fieldForm.validation?.dateRange?.min || ''}
                      onChange={(e) => {
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            dateRange: {
                              ...fieldForm.validation?.dateRange || {},
                              min: e.target.value || undefined
                            }
                          }
                        });
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Maximum Date"
                      InputLabelProps={{ shrink: true }}
                      value={fieldForm.validation?.dateRange?.max || ''}
                      onChange={(e) => {
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            dateRange: {
                              ...fieldForm.validation?.dateRange || {},
                              max: e.target.value || undefined
                            }
                          }
                        });
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* File upload validation */}
              {fieldForm.type === 'file' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Allowed File Types"
                      value={(fieldForm.validation?.fileTypes || []).join(', ')}
                      onChange={(e) => {
                        const fileTypes = e.target.value.split(',')
                          .map(type => type.trim())
                          .filter(type => type.length > 0);
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            fileTypes: fileTypes.length > 0 ? fileTypes : undefined
                          }
                        });
                      }}
                      helperText="Comma-separated list of file extensions (e.g., .pdf, .doc, .jpg)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum File Size (KB)"
                      value={fieldForm.validation?.maxFileSize ? Math.round(fieldForm.validation.maxFileSize / 1024) : ''}
                      onChange={(e) => {
                        const sizeInKB = e.target.value ? parseInt(e.target.value) : undefined;
                        const sizeInBytes = sizeInKB ? sizeInKB * 1024 : undefined;
                        updateFieldForm({
                          validation: {
                            ...fieldForm.validation || {},
                            maxFileSize: sizeInBytes
                          }
                        });
                      }}
                      helperText="Maximum file size in kilobytes"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
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

  // Manual regeneration function
  const regenerateFormsFromDataCollection = () => {
    if (!grantData.dataCollectionMethods || grantData.dataCollectionMethods.length === 0) {
      alert('No data collection methods found. Please define data collection methods in Step 3 first.');
      return;
    }
    
    const generatedTemplates: FormTemplate[] = generateFormsFromDataCollection(grantData.dataCollectionMethods);
    const generatedDatasets: Dataset[] = generateDatasetsFromForms(generatedTemplates);
    
    setFormTemplates(generatedTemplates);
    updateGrantData({ 
      formTemplates: generatedTemplates,
      datasets: generatedDatasets
    });
    
    if (generatedTemplates.length > 0) {
      setSelectedTemplateId(generatedTemplates[0].id);
    }
  };

  // Get AI recommendations for form enhancement
  const getAIRecommendations = async () => {
    if (!selectedTemplate) {
      alert('Please select a form template first.');
      return;
    }

    setLoadingAI(true);
    try {
      const response = await fetch('/api/ai/enhance-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formTemplate: selectedTemplate,
          grantContext: {
            name: grantData.name,
            description: grantData.description
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAiRecommendations(result.recommendations);
        setShowAIDialog(true);
      } else {
        alert(`Error getting AI recommendations: ${result.error}`);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      alert('Failed to get AI recommendations. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Apply AI recommendations to the form
  const applyAIRecommendations = () => {
    if (!selectedTemplate || !aiRecommendations) return;

    const updatedTemplate = { ...selectedTemplate };

    // Apply suggested fields if any
    if (aiRecommendations.suggestedFields && aiRecommendations.suggestedFields.length > 0) {
      // Add suggested fields to the first section or create a new section
      if (updatedTemplate.sections.length === 0) {
        updatedTemplate.sections.push({
          id: `section-${Date.now()}`,
          title: 'Form Fields',
          description: 'Auto-generated fields from AI recommendations',
          fields: []
        });
      }

      const firstSection = updatedTemplate.sections[0];
      aiRecommendations.suggestedFields.forEach((suggestedField: any, index: number) => {
        const newField: FormField = {
          id: `field-ai-${Date.now()}-${index}`,
          name: suggestedField.label.toLowerCase().replace(/\s+/g, '_'),
          label: suggestedField.label,
          type: suggestedField.type || 'text',
          required: suggestedField.required || false,
          placeholder: suggestedField.placeholder || '',
          helpText: suggestedField.helpText || '',
          width: 'full',
          options: suggestedField.options || undefined,
          validation: suggestedField.validation || undefined
        };
        firstSection.fields.push(newField);
      });
    }

    // Update the template
    updateFormTemplate(selectedTemplate.id, updatedTemplate);
    setShowAIDialog(false);
    alert('AI recommendations applied successfully!');
  };

  // Render AI recommendations dialog
  const renderAIRecommendationsDialog = () => {
    return (
      <Dialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          AI Form Enhancement Recommendations
        </DialogTitle>
        <DialogContent dividers>
          {aiRecommendations && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Overall Form Score: {aiRecommendations.overallScore}/100
                </Typography>
                <Typography variant="body2">
                  Review the recommendations below and click "Apply Recommendations" to automatically add suggested fields to your form.
                </Typography>
              </Alert>

              {aiRecommendations.recommendations && aiRecommendations.recommendations.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <List>
                    {aiRecommendations.recommendations.map((rec: any, index: number) => (
                      <ListItem key={index} sx={{ display: 'block', mb: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={rec.priority} 
                            size="small" 
                            color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {rec.category}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Issue:</strong> {rec.issue}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          <strong>Suggestion:</strong> {rec.suggestion}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {aiRecommendations.suggestedFields && aiRecommendations.suggestedFields.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Suggested Fields ({aiRecommendations.suggestedFields.length})
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    These fields will be added to your form when you click "Apply Recommendations"
                  </Alert>
                  <List>
                    {aiRecommendations.suggestedFields.map((field: any, index: number) => (
                      <ListItem key={index} sx={{ display: 'block', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {field.label}
                          </Typography>
                          <Chip label={field.type} size="small" variant="outlined" />
                        </Box>
                        {field.helpText && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {field.helpText}
                          </Typography>
                        )}
                        {field.required && (
                          <Chip label="Required" size="small" color="primary" sx={{ mt: 1 }} />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={applyAIRecommendations}
            disabled={!aiRecommendations?.suggestedFields || aiRecommendations.suggestedFields.length === 0}
          >
            Apply Recommendations
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
      {renderAIRecommendationsDialog()}
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          <strong>Auto-Generate Data Collection Forms & Datasets</strong>
          <br />
          The Form Generator automatically creates data collection forms AND corresponding datasets based on your grant's data collection methods defined in Step 3.
          Each data collection method becomes a form with fields for all specified data points, and a dataset is created for data analysis.
          {formTemplates.length > 0 && (
            <>
              <br />
              <Typography variant="body2" sx={{ mt: 1 }}>
                ✓ {formTemplates.length} form{formTemplates.length !== 1 ? 's' : ''} generated from your data collection methods
                <br />
                ✓ {grantData.datasets?.length || 0} dataset{(grantData.datasets?.length || 0) !== 1 ? 's' : ''} created and ready for data analysis
              </Typography>
            </>
          )}
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Form Templates</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(grantData.dataCollectionMethods?.length || 0) > 0 && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={regenerateFormsFromDataCollection}
              >
                Regenerate from Data Collection
              </Button>
            )}
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={addFormTemplate}
            >
              Create New Form
            </Button>
          </Box>
        </Box>
        
        {renderFormTemplatesList()}
      </Box>
      
      <Box sx={{ mt: 4 }}>
        {renderFormTemplateEditor()}
      </Box>
    </Box>
  );
}
