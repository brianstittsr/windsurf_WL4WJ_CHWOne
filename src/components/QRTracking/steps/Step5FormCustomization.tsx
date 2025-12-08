'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AutoAwesome as AIIcon,
  Visibility as PreviewIcon,
  DragIndicator as DragIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { FormCustomization, CustomForm, FormField } from '@/types/qr-tracking-wizard.types';

const FORM_TYPES = [
  { value: 'check_in', label: 'Session Check-In', icon: '✓' },
  { value: 'registration', label: 'Initial Registration', icon: '📝' },
  { value: 'feedback', label: 'Feedback Survey', icon: '💬' },
  { value: 'assessment', label: 'Assessment', icon: '📊' },
  { value: 'attendance', label: 'Attendance Only', icon: '📅' },
  { value: 'custom', label: 'Custom Form', icon: '⚙️' }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: '📝' },
  { value: 'textarea', label: 'Long Text', icon: '📄' },
  { value: 'number', label: 'Number', icon: '#' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'time', label: 'Time', icon: '🕐' },
  { value: 'select', label: 'Dropdown', icon: '▼' },
  { value: 'radio', label: 'Radio Buttons', icon: '◉' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑' },
  { value: 'rating', label: 'Rating', icon: '⭐' },
  { value: 'yesno', label: 'Yes/No', icon: '✓/✗' }
];

export default function Step5FormCustomization() {
  const { wizardState, updateStep5 } = useQRWizard();
  
  const [formData, setFormData] = useState<FormCustomization>(
    wizardState.step5_forms || {
      forms: [],
      qrCodeBehavior: {
        preFillParticipantData: true,
        requireQRScan: true,
        allowManualEntry: false,
        sessionTracking: true
      },
      formSettings: {
        mobileOptimized: true,
        offlineCapable: false,
        multiLanguage: false,
        languages: ['en']
      }
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [previewForm, setPreviewForm] = useState<CustomForm | null>(null);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep5(formData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, updateStep5]);

  const handleAddForm = () => {
    const newForm: CustomForm = {
      formId: `form_${Date.now()}`,
      formName: 'New Form',
      formType: 'check_in',
      description: '',
      fields: [],
      submitButtonText: 'Submit',
      successMessage: 'Thank you! Your response has been recorded.'
    };
    setEditingForm(newForm);
    setShowFormDialog(true);
  };

  const handleSaveForm = () => {
    if (!editingForm) return;

    setFormData(prev => ({
      ...prev,
      forms: prev.forms.some(f => f.formId === editingForm.formId)
        ? prev.forms.map(f => f.formId === editingForm.formId ? editingForm : f)
        : [...prev.forms, editingForm]
    }));

    setEditingForm(null);
    setShowFormDialog(false);
  };

  const handleEditForm = (form: CustomForm) => {
    setEditingForm(form);
    setShowFormDialog(true);
  };

  const handleDeleteForm = (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      setFormData(prev => ({
        ...prev,
        forms: prev.forms.filter(f => f.formId !== formId)
      }));
    }
  };

  const handleAddField = () => {
    if (!editingForm) return;

    const newField: FormField = {
      fieldId: `field_${Date.now()}`,
      fieldName: 'New Field',
      fieldType: 'text',
      required: false,
      placeholder: '',
      helpText: ''
    };

    setEditingField(newField);
    setShowFieldDialog(true);
  };

  const handleSaveField = () => {
    if (!editingField || !editingForm) return;

    const updatedFields = editingForm.fields.some(f => f.fieldId === editingField.fieldId)
      ? editingForm.fields.map(f => f.fieldId === editingField.fieldId ? editingField : f)
      : [...editingForm.fields, editingField];

    setEditingForm({
      ...editingForm,
      fields: updatedFields
    });

    setEditingField(null);
    setShowFieldDialog(false);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!editingForm) return;

    setEditingForm({
      ...editingForm,
      fields: editingForm.fields.filter(f => f.fieldId !== fieldId)
    });
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-qr-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 5,
          data: {
            formCount: formData.forms.length,
            forms: formData.forms.map(f => ({
              name: f.formName,
              type: f.formType,
              fieldCount: f.fields.length
            })),
            programInfo: wizardState.step2_program?.basicInfo,
            dataRequirements: wizardState.step3_data
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.analysis);
      } else {
        setAiSuggestions(
          `Form assessment:\n\n` +
          `✅ ${formData.forms.length} form(s) created\n` +
          `💡 Consider adding feedback forms for participant insights`
        );
      }
    } catch (error) {
      console.error('Error analyzing forms:', error);
      setAiSuggestions(
        `Analysis unavailable. Your forms have been saved.\n\n` +
        `✅ ${formData.forms.length} form(s) configured\n` +
        `💡 Proceed to QR code strategy`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Create custom forms for data collection. These forms will be accessed via QR codes by participants.
      </Alert>

      <Grid container spacing={3}>
        {/* Forms List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Data Collection Forms
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddForm}
              >
                Create Form
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {formData.forms.length === 0 ? (
              <Alert severity="info">
                No forms created yet. Click "Create Form" to design your first data collection form.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {formData.forms.map(form => (
                  <Grid item xs={12} md={6} lg={4} key={form.formId}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {FORM_TYPES.find(t => t.value === form.formType)?.icon} {form.formName}
                          </Typography>
                          <Chip
                            label={FORM_TYPES.find(t => t.value === form.formType)?.label}
                            size="small"
                            color="primary"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {form.description || 'No description'}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={<CheckIcon />}
                            label={`${form.fields.length} fields`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={form.fields.filter(f => f.required).length + ' required'}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </CardContent>
                      <CardActions>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditForm(form)}>
                          Edit
                        </Button>
                        <Button size="small" startIcon={<PreviewIcon />} onClick={() => setPreviewForm(form)}>
                          Preview
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteForm(form.formId)}>
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* QR Code Behavior */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              QR Code Behavior
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.qrCodeBehavior.preFillParticipantData}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      qrCodeBehavior: { ...prev.qrCodeBehavior, preFillParticipantData: e.target.checked }
                    }))}
                  />
                }
                label="Pre-fill participant data from QR code"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.qrCodeBehavior.requireQRScan}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      qrCodeBehavior: { ...prev.qrCodeBehavior, requireQRScan: e.target.checked }
                    }))}
                  />
                }
                label="Require QR code scan (no manual entry)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.qrCodeBehavior.allowManualEntry}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      qrCodeBehavior: { ...prev.qrCodeBehavior, allowManualEntry: e.target.checked }
                    }))}
                  />
                }
                label="Allow manual participant lookup"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.qrCodeBehavior.sessionTracking}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      qrCodeBehavior: { ...prev.qrCodeBehavior, sessionTracking: e.target.checked }
                    }))}
                  />
                }
                label="Track session attendance automatically"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Form Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Form Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.formSettings.mobileOptimized}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      formSettings: { ...prev.formSettings, mobileOptimized: e.target.checked }
                    }))}
                  />
                }
                label="Mobile-optimized design"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.formSettings.offlineCapable}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      formSettings: { ...prev.formSettings, offlineCapable: e.target.checked }
                    }))}
                  />
                }
                label="Offline capability (save and sync later)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.formSettings.multiLanguage}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      formSettings: { ...prev.formSettings, multiLanguage: e.target.checked }
                    }))}
                  />
                }
                label="Multi-language support"
              />
            </Stack>
          </Paper>
        </Grid>

        {/* AI Analysis */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={handleAnalyze}
              disabled={analyzing || formData.forms.length === 0}
            >
              {analyzing ? 'Analyzing Forms...' : 'Get AI Form Optimization'}
            </Button>
          </Box>

          {aiSuggestions && (
            <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
              <Typography variant="subtitle2" gutterBottom>
                AI Recommendations:
              </Typography>
              {aiSuggestions}
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Form Editor Dialog */}
      <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingForm?.formId.startsWith('form_') ? 'Edit' : 'Create'} Form
        </DialogTitle>
        <DialogContent>
          {editingForm && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Form Name"
                    value={editingForm.formName}
                    onChange={(e) => setEditingForm({ ...editingForm, formName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Form Type</InputLabel>
                    <Select
                      value={editingForm.formType}
                      label="Form Type"
                      onChange={(e) => setEditingForm({ ...editingForm, formType: e.target.value as any })}
                    >
                      {FORM_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={editingForm.description}
                    onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Form Fields</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddField}>
                      Add Field
                    </Button>
                  </Box>

                  {editingForm.fields.length === 0 ? (
                    <Alert severity="info">No fields added yet. Click "Add Field" to start building your form.</Alert>
                  ) : (
                    <List>
                      {editingForm.fields.map((field, index) => (
                        <ListItem
                          key={field.fieldId}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleDeleteField(field.fieldId)}>
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <DragIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={field.fieldName}
                            secondary={`${FIELD_TYPES.find(t => t.value === field.fieldType)?.label}${field.required ? ' • Required' : ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFormDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveForm}>
            Save Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Field Editor Dialog */}
      <Dialog open={showFieldDialog} onClose={() => setShowFieldDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Form Field</DialogTitle>
        <DialogContent>
          {editingField && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Field Label"
                    value={editingField.fieldName}
                    onChange={(e) => setEditingField({ ...editingField, fieldName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={editingField.fieldType}
                      label="Field Type"
                      onChange={(e) => setEditingField({ ...editingField, fieldType: e.target.value as any })}
                    >
                      {FIELD_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingField.required}
                        onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                      />
                    }
                    label="Required field"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFieldDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveField}>
            Add Field
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Preview Dialog */}
      <Dialog open={!!previewForm} onClose={() => setPreviewForm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{previewForm?.formName} - Preview</DialogTitle>
        <DialogContent>
          {previewForm && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {previewForm.description}
              </Typography>
              <Stack spacing={2}>
                {previewForm.fields.map(field => (
                  <TextField
                    key={field.fieldId}
                    fullWidth
                    label={field.fieldName}
                    required={field.required}
                    placeholder={field.placeholder}
                    helperText={field.helpText}
                    type={field.fieldType === 'number' ? 'number' : field.fieldType === 'email' ? 'email' : 'text'}
                    multiline={field.fieldType === 'textarea'}
                    rows={field.fieldType === 'textarea' ? 3 : 1}
                  />
                ))}
                <Button variant="contained" fullWidth disabled>
                  {previewForm.submitButtonText}
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewForm(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
