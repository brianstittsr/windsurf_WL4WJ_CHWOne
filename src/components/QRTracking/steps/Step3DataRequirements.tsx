'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Paper,
  Divider,
  Alert,
  Button,
  IconButton,
  CircularProgress,
  Chip,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { DataRequirements, CustomField } from '@/types/qr-tracking-wizard.types';

const FIELD_TYPES = [
  { value: 'text', label: 'Text (Short Answer)' },
  { value: 'textarea', label: 'Text Area (Long Answer)' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'select', label: 'Dropdown (Single Choice)' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'rating', label: 'Rating Scale' },
  { value: 'yesno', label: 'Yes/No' },
  { value: 'file', label: 'File Upload' }
];

const STANDARD_FIELDS = [
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'email', label: 'Email Address', type: 'email', required: false },
  { id: 'phone', label: 'Phone Number', type: 'phone', required: false },
  { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false },
  { id: 'address', label: 'Address', type: 'textarea', required: false },
  { id: 'city', label: 'City', type: 'text', required: false },
  { id: 'state', label: 'State', type: 'text', required: false },
  { id: 'zipCode', label: 'Zip Code', type: 'text', required: false },
  { id: 'emergencyContact', label: 'Emergency Contact', type: 'text', required: false },
  { id: 'emergencyPhone', label: 'Emergency Phone', type: 'phone', required: false }
];

export default function Step3DataRequirements() {
  const { wizardState, updateStep3 } = useQRWizard();
  
  const [dataReqs, setDataReqs] = useState<DataRequirements>(
    wizardState.step3_data || {
      standardFields: ['firstName', 'lastName', 'email', 'phone'],
      customFields: [],
      demographicData: {
        collectAge: false,
        collectGender: false,
        collectRace: false,
        collectEthnicity: false,
        collectLanguage: false,
        collectIncome: false,
        collectEducation: false,
        collectEmployment: false
      },
      medicalData: {
        collectHealthConditions: false,
        collectMedications: false,
        collectAllergies: false,
        collectInsurance: false
      },
      consentTracking: {
        requireConsent: true,
        consentTypes: ['program_participation', 'data_collection'],
        trackConsentDate: true
      },
      privacySettings: {
        dataRetentionPeriod: 365,
        allowDataSharing: false,
        anonymizeReports: true
      }
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep3(dataReqs);
    }, 1000);
    return () => clearTimeout(timer);
  }, [dataReqs, updateStep3]);

  const handleStandardFieldToggle = (fieldId: string) => {
    setDataReqs(prev => ({
      ...prev,
      standardFields: prev.standardFields.includes(fieldId)
        ? prev.standardFields.filter(f => f !== fieldId)
        : [...prev.standardFields, fieldId]
    }));
  };

  const handleAddCustomField = () => {
    const newField: CustomField = {
      fieldId: `custom_${Date.now()}`,
      fieldName: 'New Field',
      fieldType: 'text',
      required: false,
      description: '',
      options: [],
      validation: {}
    };
    setEditingField(newField);
    setShowFieldDialog(true);
  };

  const handleSaveCustomField = () => {
    if (!editingField) return;

    setDataReqs(prev => ({
      ...prev,
      customFields: editingField.fieldId.startsWith('custom_')
        ? [...prev.customFields.filter(f => f.fieldId !== editingField.fieldId), editingField]
        : [...prev.customFields, editingField]
    }));

    setEditingField(null);
    setShowFieldDialog(false);
  };

  const handleEditCustomField = (field: CustomField) => {
    setEditingField(field);
    setShowFieldDialog(true);
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setDataReqs(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.fieldId !== fieldId)
    }));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-qr-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 3,
          data: {
            ...dataReqs,
            programInfo: wizardState.step2_program?.basicInfo
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.analysis);
      } else {
        setAiSuggestions(
          `Data collection assessment:\n\n` +
          `✅ ${dataReqs.standardFields.length} standard fields selected\n` +
          `✅ ${dataReqs.customFields.length} custom fields defined\n` +
          `💡 Consider adding demographic data for better insights`
        );
      }
    } catch (error) {
      console.error('Error analyzing data requirements:', error);
      setAiSuggestions(
        `Analysis unavailable. Your data requirements have been saved.\n\n` +
        `✅ Standard fields configured\n` +
        `💡 Proceed to participant upload`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Define what data you need to collect from participants. Start with standard fields and add custom fields as needed.
      </Alert>

      <Grid container spacing={3}>
        {/* Standard Fields */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Standard Participant Fields
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the standard fields you want to collect from participants:
            </Typography>

            <Grid container spacing={2}>
              {STANDARD_FIELDS.map(field => (
                <Grid item xs={12} sm={6} md={4} key={field.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={dataReqs.standardFields.includes(field.id)}
                        onChange={() => handleStandardFieldToggle(field.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          {field.label}
                          {field.required && <Chip label="Required" size="small" sx={{ ml: 1 }} />}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {field.type}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Custom Fields */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Custom Fields
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCustomField}
              >
                Add Custom Field
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {dataReqs.customFields.length === 0 ? (
              <Alert severity="info">
                No custom fields added yet. Click "Add Custom Field" to create fields specific to your program.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {dataReqs.customFields.map(field => (
                  <Grid item xs={12} sm={6} md={4} key={field.fieldId}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">
                            {field.fieldName}
                            {field.required && <Chip label="Required" size="small" sx={{ ml: 1 }} />}
                          </Typography>
                          <Box>
                            <IconButton size="small" onClick={() => handleEditCustomField(field)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteCustomField(field.fieldId)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Type: {FIELD_TYPES.find(t => t.value === field.fieldType)?.label}
                        </Typography>
                        {field.description && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            {field.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Demographic Data */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Demographic Data
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectAge}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectAge: e.target.checked }
                    }))}
                  />
                }
                label="Collect age/date of birth"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectGender}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectGender: e.target.checked }
                    }))}
                  />
                }
                label="Collect gender identity"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectRace}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectRace: e.target.checked }
                    }))}
                  />
                }
                label="Collect race"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectEthnicity}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectEthnicity: e.target.checked }
                    }))}
                  />
                }
                label="Collect ethnicity"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectLanguage}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectLanguage: e.target.checked }
                    }))}
                  />
                }
                label="Collect preferred language"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectIncome}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectIncome: e.target.checked }
                    }))}
                  />
                }
                label="Collect income level"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectEducation}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectEducation: e.target.checked }
                    }))}
                  />
                }
                label="Collect education level"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.demographicData.collectEmployment}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      demographicData: { ...prev.demographicData, collectEmployment: e.target.checked }
                    }))}
                  />
                }
                label="Collect employment status"
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Medical/Health Data */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical/Health Data
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="caption">
                Medical data requires HIPAA compliance and additional security measures.
              </Typography>
            </Alert>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.medicalData.collectHealthConditions}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      medicalData: { ...prev.medicalData, collectHealthConditions: e.target.checked }
                    }))}
                  />
                }
                label="Collect health conditions"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.medicalData.collectMedications}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      medicalData: { ...prev.medicalData, collectMedications: e.target.checked }
                    }))}
                  />
                }
                label="Collect current medications"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.medicalData.collectAllergies}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      medicalData: { ...prev.medicalData, collectAllergies: e.target.checked }
                    }))}
                  />
                }
                label="Collect allergies"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dataReqs.medicalData.collectInsurance}
                    onChange={(e) => setDataReqs(prev => ({
                      ...prev,
                      medicalData: { ...prev.medicalData, collectInsurance: e.target.checked }
                    }))}
                  />
                }
                label="Collect insurance information"
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Consent & Privacy */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Consent & Privacy Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataReqs.consentTracking.requireConsent}
                      onChange={(e) => setDataReqs(prev => ({
                        ...prev,
                        consentTracking: { ...prev.consentTracking, requireConsent: e.target.checked }
                      }))}
                    />
                  }
                  label="Require participant consent"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataReqs.consentTracking.trackConsentDate}
                      onChange={(e) => setDataReqs(prev => ({
                        ...prev,
                        consentTracking: { ...prev.consentTracking, trackConsentDate: e.target.checked }
                      }))}
                    />
                  }
                  label="Track consent date/time"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Data Retention Period (days)"
                  value={dataReqs.privacySettings.dataRetentionPeriod}
                  onChange={(e) => setDataReqs(prev => ({
                    ...prev,
                    privacySettings: { ...prev.privacySettings, dataRetentionPeriod: parseInt(e.target.value) }
                  }))}
                  helperText="How long to keep participant data"
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataReqs.privacySettings.anonymizeReports}
                      onChange={(e) => setDataReqs(prev => ({
                        ...prev,
                        privacySettings: { ...prev.privacySettings, anonymizeReports: e.target.checked }
                      }))}
                    />
                  }
                  label="Anonymize data in reports"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* AI Analysis Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={handleAnalyze}
              disabled={analyzing || dataReqs.standardFields.length === 0}
            >
              {analyzing ? 'Analyzing Data Requirements...' : 'Get AI Data Recommendations'}
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

      {/* Custom Field Dialog (Simple inline for now) */}
      {showFieldDialog && editingField && (
        <Paper sx={{ p: 3, mt: 3, border: 2, borderColor: 'primary.main' }}>
          <Typography variant="h6" gutterBottom>
            {editingField.fieldId.startsWith('custom_') ? 'Edit' : 'Add'} Custom Field
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Name"
                value={editingField.fieldName}
                onChange={(e) => setEditingField({ ...editingField, fieldName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={editingField.fieldType}
                  label="Field Type"
                  onChange={(e) => setEditingField({ ...editingField, fieldType: e.target.value as any })}
                >
                  {FIELD_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
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
                label="Description (optional)"
                value={editingField.description}
                onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
              />
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
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => { setShowFieldDialog(false); setEditingField(null); }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveCustomField}>
                  Save Field
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
