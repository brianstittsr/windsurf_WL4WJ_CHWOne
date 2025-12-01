'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { datasetService } from '@/services/DatasetService';
import { DatasetField, DatasetFieldType } from '@/types/dataset.types';

interface CreateDataCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const FIELD_TYPES: DatasetFieldType[] = [
  'string',
  'number',
  'boolean',
  'date',
  'datetime',
  'email',
  'phone',
  'url',
  'text',
  'select',
  'multiselect',
  'file',
  'json',
  'array'
];

const CATEGORIES = [
  'general',
  'forms',
  'surveys',
  'participants',
  'events',
  'training',
  'other'
];

export default function CreateDataCollectionDialog({
  open,
  onClose,
  onCreated
}: CreateDataCollectionDialogProps) {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceApplication, setSourceApplication] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Schema
  const [fields, setFields] = useState<DatasetField[]>([]);
  const [newField, setNewField] = useState<Partial<DatasetField>>({
    name: '',
    label: '',
    type: 'string',
    required: false
  });

  // Settings
  const [isPublic, setIsPublic] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [apiAccess, setApiAccess] = useState(false);

  const steps = ['Basic Info', 'Schema', 'Settings'];

  const handleNext = () => {
    if (activeStep === 0 && !validateBasicInfo()) {
      return;
    }
    if (activeStep === 1 && fields.length === 0) {
      setError('Please add at least one field');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const validateBasicInfo = () => {
    if (!name.trim()) {
      setError('Dataset name is required');
      return false;
    }
    if (!sourceApplication.trim()) {
      setError('Source application is required');
      return false;
    }
    return true;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      setError('Field name and label are required');
      return;
    }

    const field: DatasetField = {
      id: `field_${Date.now()}`,
      name: newField.name!,
      label: newField.label!,
      type: newField.type as DatasetFieldType,
      required: newField.required || false,
      displayOrder: fields.length
    };

    setFields([...fields, field]);
    setNewField({
      name: '',
      label: '',
      type: 'string',
      required: false
    });
    setError(null);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleCreate = async () => {
    if (!currentUser) {
      setError('You must be logged in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await datasetService.createDataset(
        {
          name,
          description,
          sourceApplication,
          organizationId: currentUser.uid, // Using uid as organizationId for now
          createdBy: currentUser.uid,
          schema: {
            fields,
            version: '1.0'
          },
          metadata: {
            recordCount: 0,
            tags,
            category,
            isPublic
          },
          permissions: {
            owners: [currentUser.uid],
            editors: [],
            viewers: [],
            publicAccess: isPublic ? 'read' : 'none',
            apiAccess
          },
          config: {
            validation: {
              strictMode,
              allowExtraFields: !strictMode,
              validateOnSubmit: true
            },
            webhooks: {
              enabled: false
            },
            notifications: {
              emailOnSubmit: false,
              emailRecipients: []
            },
            retention: {
              enabled: false,
              archiveOldRecords: false
            }
          },
          status: 'active'
        },
        currentUser.uid
      );

      onCreated();
      handleClose();
    } catch (err) {
      console.error('Error creating dataset:', err);
      setError('Failed to create dataset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setName('');
    setDescription('');
    setSourceApplication('');
    setCategory('general');
    setTags([]);
    setFields([]);
    setIsPublic(false);
    setStrictMode(true);
    setApiAccess(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create New Dataset</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step 1: Basic Info */}
        {activeStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dataset Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Participant Survey Responses"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="Describe what this dataset contains..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source Application"
                value={sourceApplication}
                onChange={(e) => setSourceApplication(e.target.value)}
                required
                placeholder="e.g., QR Wizard, Form Builder"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Type and press Enter"
                InputProps={{
                  endAdornment: (
                    <Button onClick={handleAddTag} size="small">
                      Add
                    </Button>
                  )
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Step 2: Schema */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Define Fields
            </Typography>
            
            {/* Add Field Form */}
            <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Field Name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., email"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Field Label"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="e.g., Email Address"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value as DatasetFieldType })}
                      label="Type"
                    >
                      {FIELD_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        />
                      }
                      label="Required"
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddField}
                      size="small"
                    >
                      Add Field
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Fields List */}
            {fields.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Fields ({fields.length})
                </Typography>
                {fields.map((field) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {field.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.name} • {field.type} {field.required && '• Required'}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveField(field.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                No fields added yet. Add at least one field to continue.
              </Alert>
            )}
          </Box>
        )}

        {/* Step 3: Settings */}
        {activeStep === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                }
                label="Public Access (anyone can view)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={strictMode}
                    onChange={(e) => setStrictMode(e.target.checked)}
                  />
                }
                label="Strict Mode (reject records with extra fields)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={apiAccess}
                    onChange={(e) => setApiAccess(e.target.checked)}
                  />
                }
                label="Enable API Access"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                You can configure additional settings after creating the dataset.
              </Alert>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={loading}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Dataset'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
