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
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data
      const mockForm: Form = {
        id: formId,
        title: 'Community Health Assessment',
        description: 'Please help us understand your health needs by completing this survey.',
        settings: {
          confirmationMessage: 'Thank you for completing this survey! Your responses help us provide better community health services.',
          allowAnonymous: true
        },
        fields: [
          {
            id: 'name',
            name: 'fullName',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter your full name'
          },
          {
            id: 'email',
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'your.email@example.com'
          },
          {
            id: 'age',
            name: 'age',
            label: 'Age',
            type: 'number',
            required: false,
            placeholder: 'Your age in years'
          },
          {
            id: 'services',
            name: 'neededServices',
            label: 'Services Needed',
            type: 'checkbox',
            required: false,
            options: [
              { value: 'medical', label: 'Medical Care' },
              { value: 'dental', label: 'Dental Care' },
              { value: 'mental', label: 'Mental Health Services' },
              { value: 'nutrition', label: 'Nutrition Counseling' },
              { value: 'transportation', label: 'Transportation' }
            ]
          },
          {
            id: 'comments',
            name: 'additionalComments',
            label: 'Additional Comments',
            type: 'textarea',
            required: false,
            placeholder: 'Any additional information you\'d like to share...'
          }
        ]
      };

      setForm(mockForm);

      // Initialize form data
      const initialData: Record<string, any> = {};
      mockForm.fields.forEach(field => {
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
      // In a real implementation, this would submit to your API
      console.log('Submitting form:', {
        formId,
        responses: formData,
        submittedAt: new Date(),
        isAnonymous: true
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = errors[field.name];

    const commonProps = {
      fullWidth: true,
      value,
      onChange: (e: any) => handleFieldChange(field.name, e.target.value),
      error: !!error,
      helperText: error,
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
          <FormControl component="fieldset" {...commonProps}>
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
          <FormControl component="fieldset" {...commonProps}>
            <Typography component="legend" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            {field.options?.map(option => (
              <label key={option.value} style={{ display: 'block', marginBottom: 8 }}>
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
                  style={{ marginRight: 8 }}
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
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
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
