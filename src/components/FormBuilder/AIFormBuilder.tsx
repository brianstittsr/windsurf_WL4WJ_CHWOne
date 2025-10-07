'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  AutoFixHigh as AutoFixHighIcon,
  ContentPaste as ContentPasteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { FormField, FormFieldType } from '@/types/firebase/schema';

interface ParsedQuestion {
  text: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  confidence: number; // 0-1, how confident we are in the parsing
}

interface AIFormBuilderProps {
  onFormGenerated?: (fields: FormField[]) => void;
  existingFields?: FormField[];
}

export default function AIFormBuilder({ onFormGenerated, existingFields = [] }: AIFormBuilderProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [generatedFields, setGeneratedFields] = useState<FormField[]>(existingFields);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  // Parse common form question patterns
  const parseQuestionPatterns = useCallback((text: string): ParsedQuestion[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const questions: ParsedQuestion[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const question: ParsedQuestion = {
        text: trimmedLine,
        type: FormFieldType.TEXT,
        required: false,
        confidence: 0.5
      };

      // Check for required indicators
      if (trimmedLine.includes('*') || trimmedLine.toLowerCase().includes('required')) {
        question.required = true;
        question.confidence += 0.1;
      }

      // Check for multiple choice patterns
      if (trimmedLine.includes('choose') || trimmedLine.includes('select') || trimmedLine.includes('pick')) {
        if (trimmedLine.includes('one') || trimmedLine.includes('single')) {
          question.type = FormFieldType.RADIO;
          question.confidence = 0.8;
        } else if (trimmedLine.includes('multiple') || trimmedLine.includes('many')) {
          question.type = FormFieldType.CHECKBOX;
          question.confidence = 0.8;
        } else {
          question.type = FormFieldType.SELECT;
          question.confidence = 0.7;
        }
      }

      // Check for yes/no patterns
      if (trimmedLine.toLowerCase().includes('yes') && trimmedLine.toLowerCase().includes('no')) {
        question.type = FormFieldType.YESNO;
        question.confidence = 0.9;
      }

      // Check for email patterns
      if (trimmedLine.toLowerCase().includes('email') || trimmedLine.toLowerCase().includes('e-mail')) {
        question.type = FormFieldType.EMAIL;
        question.confidence = 0.9;
      }

      // Check for phone patterns
      if (trimmedLine.toLowerCase().includes('phone') || trimmedLine.toLowerCase().includes('mobile') || trimmedLine.toLowerCase().includes('cell')) {
        question.type = FormFieldType.PHONE;
        question.confidence = 0.8;
      }

      // Check for date patterns
      if (trimmedLine.toLowerCase().includes('date') || trimmedLine.toLowerCase().includes('when')) {
        question.type = FormFieldType.DATE;
        question.confidence = 0.8;
      }

      // Check for number patterns
      if (trimmedLine.toLowerCase().includes('how many') || trimmedLine.toLowerCase().includes('number') || trimmedLine.toLowerCase().includes('age')) {
        question.type = FormFieldType.NUMBER;
        question.confidence = 0.7;
      }

      // Check for textarea patterns
      if (trimmedLine.toLowerCase().includes('describe') || trimmedLine.toLowerCase().includes('explain') || trimmedLine.toLowerCase().includes('comment')) {
        question.type = FormFieldType.TEXTAREA;
        question.confidence = 0.7;
      }

      // Extract options for multiple choice questions
      if (question.type === FormFieldType.RADIO || question.type === FormFieldType.CHECKBOX || question.type === FormFieldType.SELECT) {
        const optionMatches = trimmedLine.match(/\([^)]+\)/g) || trimmedLine.match(/:\s*([^:]+)$/);
        if (optionMatches) {
          const optionsText = optionMatches[0].replace(/[()]/g, '').replace(/^:\s*/, '');
          question.options = optionsText.split(/[,&]/).map(opt => opt.trim()).filter(opt => opt.length > 0);
          question.confidence += 0.2;
        }
      }

      // Clean up the question text
      question.text = question.text
        .replace(/\([^)]*\)/g, '') // Remove parentheses content
        .replace(/\*$/, '') // Remove trailing asterisk
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      questions.push(question);
    }

    return questions;
  }, []);

  const handleParseText = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const parsed = parseQuestionPatterns(inputText);
      setParsedQuestions(parsed);
    } catch (error) {
      console.error('Error parsing text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFieldFromQuestion = (question: ParsedQuestion): FormField => {
    const fieldName = question.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const field: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: fieldName,
      label: question.text,
      type: question.type,
      required: question.required,
      order: generatedFields.length
    };

    if (question.options && (question.type === FormFieldType.SELECT || question.type === FormFieldType.RADIO || question.type === FormFieldType.CHECKBOX)) {
      field.options = question.options.map(option => ({
        value: option.toLowerCase().replace(/\s+/g, '_'),
        label: option
      }));
    }

    return field;
  };

  const handleGenerateForm = () => {
    const newFields = parsedQuestions.map(generateFieldFromQuestion);
    setGeneratedFields(prev => [...prev, ...newFields]);
    setParsedQuestions([]);
    setInputText('');
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      label: '',
      type: FormFieldType.TEXT,
      required: false,
      order: generatedFields.length
    };
    setGeneratedFields(prev => [...prev, newField]);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
  };

  const handleSaveField = (updatedField: FormField) => {
    setGeneratedFields(prev =>
      prev.map(field => field.id === updatedField.id ? updatedField : field)
    );
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setGeneratedFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const handleFinalizeForm = () => {
    onFormGenerated?.(generatedFields);
  };

  const getFieldTypeIcon = (type: FormFieldType) => {
    switch (type) {
      case FormFieldType.TEXT: return '📝';
      case FormFieldType.TEXTAREA: return '📄';
      case FormFieldType.NUMBER: return '🔢';
      case FormFieldType.EMAIL: return '📧';
      case FormFieldType.PHONE: return '📱';
      case FormFieldType.DATE: return '📅';
      case FormFieldType.SELECT: return '📋';
      case FormFieldType.RADIO: return '🔘';
      case FormFieldType.CHECKBOX: return '☑️';
      case FormFieldType.YESNO: return '👍👎';
      default: return '❓';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        AI Form Builder
      </Typography>

      {/* Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Paste Your Form Questions
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Paste your form questions here. One question per line.

Examples:
What is your full name? *
What is your email address? (required)
What is your age?
Which services do you need? (Medical, Dental, Vision)
Are you currently employed? (Yes/No)
Please describe your current health concerns:"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={isProcessing ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
              onClick={handleParseText}
              disabled={!inputText.trim() || isProcessing}
            >
              {isProcessing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setInputText('');
                setParsedQuestions([]);
              }}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Parsed Questions Preview */}
      {parsedQuestions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              AI Analysis Results
            </Typography>
            <List>
              {parsedQuestions.map((question, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getFieldTypeIcon(question.type)}</span>
                        <Typography variant="body1">{question.text}</Typography>
                        {question.required && <Chip label="Required" size="small" color="error" />}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Type: {question.type} • Confidence: {Math.round(question.confidence * 100)}%
                        </Typography>
                        {question.options && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Options: {question.options.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleGenerateForm}
                size="large"
              >
                Generate Form Fields
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Generated Fields Editor */}
      {generatedFields.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Form Fields ({generatedFields.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddField}
                  size="small"
                >
                  Add Field
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewOpen(true)}
                  size="small"
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleFinalizeForm}
                  size="small"
                >
                  Save Form
                </Button>
              </Box>
            </Box>

            <List>
              {generatedFields.map((field, index) => (
                <ListItem key={field.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getFieldTypeIcon(field.type)}</span>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {field.label || `Untitled Field ${index + 1}`}
                        </Typography>
                        {field.required && <Chip label="Required" size="small" color="error" />}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Name: {field.name} • Type: {field.type}
                        </Typography>
                        {field.options && field.options.length > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Options: {field.options.map(opt => opt.label).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditField(field)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteField(field.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Field Editor Dialog */}
      <Dialog open={!!editingField} onClose={() => setEditingField(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          {editingField && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field Label"
                  value={editingField.label}
                  onChange={(e) => setEditingField({...editingField, label: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field Name"
                  value={editingField.name}
                  onChange={(e) => setEditingField({...editingField, name: e.target.value})}
                  helperText="Used for data storage and form submission"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={editingField.type}
                    label="Field Type"
                    onChange={(e) => setEditingField({...editingField, type: e.target.value as FormFieldType})}
                  >
                    <MenuItem value={FormFieldType.TEXT}>Text</MenuItem>
                    <MenuItem value={FormFieldType.TEXTAREA}>Textarea</MenuItem>
                    <MenuItem value={FormFieldType.NUMBER}>Number</MenuItem>
                    <MenuItem value={FormFieldType.EMAIL}>Email</MenuItem>
                    <MenuItem value={FormFieldType.PHONE}>Phone</MenuItem>
                    <MenuItem value={FormFieldType.DATE}>Date</MenuItem>
                    <MenuItem value={FormFieldType.SELECT}>Select</MenuItem>
                    <MenuItem value={FormFieldType.RADIO}>Radio</MenuItem>
                    <MenuItem value={FormFieldType.CHECKBOX}>Checkbox</MenuItem>
                    <MenuItem value={FormFieldType.YESNO}>Yes/No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Required</InputLabel>
                  <Select
                    value={editingField.required ? 'yes' : 'no'}
                    label="Required"
                    onChange={(e) => setEditingField({...editingField, required: e.target.value === 'yes'})}
                  >
                    <MenuItem value="no">Optional</MenuItem>
                    <MenuItem value="yes">Required</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(editingField.type === FormFieldType.SELECT || editingField.type === FormFieldType.RADIO || editingField.type === FormFieldType.CHECKBOX) && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Options (one per line)"
                    value={editingField.options?.map(opt => opt.label).join('\n') || ''}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(opt => opt.trim()).map(opt => ({
                        value: opt.toLowerCase().replace(/\s+/g, '_'),
                        label: opt.trim()
                      }));
                      setEditingField({...editingField, options});
                    }}
                    helperText="Enter each option on a new line"
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingField(null)}>Cancel</Button>
          <Button
            onClick={() => editingField && handleSaveField(editingField)}
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This is how your form will appear to users. You can still edit fields after closing this preview.
          </Typography>

          <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
            {generatedFields.map((field) => (
              <Box key={field.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {field.label}
                  {field.required && <span style={{ color: 'red' }}> *</span>}
                </Typography>

                {field.type === FormFieldType.TEXT && (
                  <TextField fullWidth placeholder={field.placeholder} required={field.required} />
                )}

                {field.type === FormFieldType.TEXTAREA && (
                  <TextField fullWidth multiline rows={3} placeholder={field.placeholder} required={field.required} />
                )}

                {field.type === FormFieldType.NUMBER && (
                  <TextField fullWidth type="number" placeholder={field.placeholder} required={field.required} />
                )}

                {field.type === FormFieldType.EMAIL && (
                  <TextField fullWidth type="email" placeholder={field.placeholder} required={field.required} />
                )}

                {field.type === FormFieldType.PHONE && (
                  <TextField fullWidth placeholder="(555) 123-4567" required={field.required} />
                )}

                {field.type === FormFieldType.DATE && (
                  <TextField fullWidth type="date" required={field.required} />
                )}

                {field.type === FormFieldType.SELECT && (
                  <FormControl fullWidth>
                    <Select required={field.required}>
                      <MenuItem value="">Select an option</MenuItem>
                      {field.options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {field.type === FormFieldType.YESNO && (
                  <FormControl fullWidth>
                    <Select required={field.required}>
                      <MenuItem value="">Select an option</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
