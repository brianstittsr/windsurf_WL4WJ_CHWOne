'use client';

import React, { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  settings: {
    confirmationMessage?: string;
    allowAnonymous: boolean;
  };
}

export default function PublicFormPage() {
  // Get params using useParams hook - this is already a regular object in client components
  const params = useParams();
  // In client components, useParams() already returns a regular object, not a promise
  // so we don't need to use React.use()
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      
      // Fetch the actual form from Firestore
      const formDocRef = doc(db, 'forms', formId);
      const formDoc = await getDoc(formDocRef);
      
      if (!formDoc.exists()) {
        console.error('Form not found');
        setLoading(false);
        return;
      }
      
      const formData = formDoc.data();
      
      // Convert Firestore data to Form interface
      const fetchedForm: Form = {
        id: formDoc.id,
        title: formData.title || formData.name || 'Untitled Form',
        description: formData.description || '',
        settings: {
          confirmationMessage: formData.settings?.confirmationMessage || 'Thank you for your submission!',
          allowAnonymous: formData.settings?.allowAnonymous !== false // Default to true
        },
        fields: formData.fields || []
      };

      console.log('Fetched form data:', formData);
      console.log('Form fields:', fetchedForm.fields);
      console.log('Number of fields:', fetchedForm.fields.length);

      setForm(fetchedForm);

      // Initialize form data
      const initialData: Record<string, any> = {};
      fetchedForm.fields.forEach(field => {
        if (field.type === 'checkbox') {
          initialData[field.name] = [];
        } else {
          initialData[field.name] = '';
        }
      });
      setFormData(initialData);

    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'number' && value) {
      const num = Number(value);
      if (isNaN(num)) {
        return 'Please enter a valid number';
      }
    }

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    form?.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Get the form document to find the associated dataset
      const formDocRef = doc(db, 'forms', formId);
      const formDoc = await getDoc(formDocRef);
      
      if (!formDoc.exists()) {
        throw new Error('Form not found');
      }

      const formDocData = formDoc.data();
      const datasetId = formDocData.datasetId;

      // Create submission record with metadata
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const submissionData = {
        submission_id: submissionId,
        submitted_at: new Date().toISOString(),
        submitted_by: 'anonymous',
        form_id: formId,
        ...formData
      };

      console.log('Submitting form response:', submissionData);

      // If dataset exists, add record to it
      if (datasetId) {
        const datasetDocRef = doc(db, 'datasets', datasetId);
        const datasetDoc = await getDoc(datasetDocRef);
        
        if (datasetDoc.exists()) {
          // Add record to dataset's records array
          const currentData = datasetDoc.data();
          const currentRecordCount = currentData.recordCount || currentData.rowCount || 0;
          
          await updateDoc(datasetDocRef, {
            records: arrayUnion(submissionData),
            updatedAt: serverTimestamp(),
            recordCount: currentRecordCount + 1,
            rowCount: currentRecordCount + 1,
            size: (currentData.size || 0) + JSON.stringify(submissionData).length
          });
          console.log('Response added to dataset:', datasetId);
        } else {
          console.warn('Dataset not found:', datasetId);
        }
      } else {
        // If no dataset exists, create one for this form
        const newDataset = {
          name: `${form?.title || 'Form'} - Responses`,
          description: `Dataset for storing responses from form: ${form?.title}`,
          formId: formId,
          userId: formDocData.userId || 'system', // Use form creator's userId
          format: 'json',
          size: JSON.stringify(submissionData).length,
          recordCount: 1,
          rowCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          fields: form?.fields.map(field => ({
            id: field.id,
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required
          })) || [],
          records: [submissionData],
          metadata: {
            sourceForm: form?.title,
            sourceFormId: formId,
            autoGenerated: true
          },
          status: 'active'
        };

        const datasetsRef = collection(db, 'datasets');
        const newDatasetDoc = await addDoc(datasetsRef, newDataset);
        
        // Update form with dataset reference
        await updateDoc(formDocRef, {
          datasetId: newDatasetDoc.id
        });
        
        console.log('Created new dataset:', newDatasetDoc.id);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = errors[field.name];

    // Common props for most field types (not checkbox/radio which need custom handling)
    const commonProps = {
      fullWidth: true,
      value,
      onChange: (e: any) => handleFieldChange(field.name, e.target.value),
      error: !!error,
      helperText: error,
      required: field.required,
      sx: { mb: 2 }
    };

    // For checkbox and radio, we need different props
    const fieldsetProps = {
      fullWidth: true,
      error: !!error,
      required: field.required,
      sx: { mb: 2 }
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            multiline
            rows={4}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="number"
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'select':
        return (
          <FormControl {...commonProps} error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              <MenuItem value="">
                <em>Select an option</em>
              </MenuItem>
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl component="fieldset" {...fieldsetProps}>
            <Typography component="legend" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            {field.options?.map(option => (
              <label key={option.value} style={{ display: 'block', marginBottom: 8 }}>
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  style={{ marginRight: 8 }}
                />
                {option.label}
              </label>
            ))}
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl component="fieldset" {...fieldsetProps}>
            <Typography component="legend" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            {field.options?.map(option => (
              <label key={option.value} style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFieldChange(field.name, newValues);
                  }}
                  style={{ marginRight: 8, cursor: 'pointer' }}
                />
                {option.label}
              </label>
            ))}
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      default:
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Form Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The form you&apos;re looking for doesn&apos;t exist or is no longer available.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              width={80}
              height={80}
              alt="CHWOne Logo"
              style={{ borderRadius: '50%' }}
            />
          </Box>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Thank You!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {form.settings.confirmationMessage || 'Your response has been submitted successfully.'}
          </Typography>
          <Chip
            icon={<QrCodeIcon />}
            label="Accessed via QR Code"
            sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            icon={<QrCodeIcon />}
            label="Public Survey"
            sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.dark' }}
          />
          <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            {form.title}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {form.description}
          </Typography>
        </Box>

        {/* Form */}
        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {form.fields && form.fields.length > 0 ? (
              <>
                {form.fields.map(field => (
                  <Box key={field.id}>
                    {renderField(field)}
                  </Box>
                ))}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                    disabled={submitting}
                    sx={{ minWidth: 200 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Survey'}
                  </Button>
                </Box>
              </>
            ) : (
              <Alert severity="warning">
                <Typography variant="h6" gutterBottom>No Form Fields Found</Typography>
                <Typography variant="body2">
                  This form doesn't have any fields configured yet. Please contact the form administrator.
                </Typography>
                <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
                  Debug Info: Form ID: {formId}
                </Typography>
              </Alert>
            )}
          </form>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="caption" color="text.secondary">
            This survey is powered by CHWOne • Responses are anonymous and secure
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
