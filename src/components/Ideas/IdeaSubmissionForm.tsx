'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Typography,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { AuthUser } from '@/lib/auth';
import { IdeaCategory } from '@/types/idea.types';

interface IdeaSubmissionFormProps {
  currentUser: AuthUser | null;
  onSubmit: (idea: any) => Promise<void>;
  categories: IdeaCategory[];
}

interface FormState {
  title: string;
  description: string;
  category: string;
  submitterRole: string;
  organizationId: string;
  chwAssociationId: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  submitterRole?: string;
}

const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ 
  currentUser, 
  onSubmit,
  categories 
}) => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    submitterRole: currentUser?.role || 'CHW',
    organizationId: currentUser?.organizationId || '',
    chwAssociationId: currentUser?.chwAssociationId || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Update form if user changes
  useEffect(() => {
    if (currentUser) {
      setFormState(prev => ({
        ...prev,
        submitterRole: currentUser.role || 'CHW',
        organizationId: currentUser.organizationId || '',
        chwAssociationId: currentUser.chwAssociationId || '',
      }));
    }
  }, [currentUser]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle select input changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formState.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formState.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formState.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formState.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    if (!formState.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formState.submitterRole) {
      newErrors.submitterRole = 'Your role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to submit an idea');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        category: formState.category as IdeaCategory,
        submitterRole: formState.submitterRole,
        organizationId: formState.organizationId || undefined,
        chwAssociationId: formState.chwAssociationId || undefined,
      };
      
      await onSubmit(submissionData);
      
      // Reset form on successful submission
      setFormState({
        title: '',
        description: '',
        category: '',
        submitterRole: currentUser.role || 'CHW',
        organizationId: currentUser.organizationId || '',
        chwAssociationId: currentUser.chwAssociationId || '',
      });
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Role options
  const roleOptions = [
    'CHW',
    'CHW Coordinator',
    'Nonprofit Staff',
    'Association Administrator',
    'Platform User',
    'Other'
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {!currentUser ? (
        <Typography color="error" sx={{ mb: 2 }}>
          You must be logged in to submit an idea.
        </Typography>
      ) : (
        <>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formState.title}
            onChange={handleInputChange}
            margin="normal"
            error={!!errors.title}
            helperText={errors.title}
            disabled={submitting}
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description || 'Describe your idea in detail. What problem does it solve?'}
            disabled={submitting}
            required
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth margin="normal" error={!!errors.category}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formState.category}
                onChange={handleSelectChange}
                label="Category"
                disabled={submitting}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal" error={!!errors.submitterRole}>
              <InputLabel id="submitter-role-label">Your Role</InputLabel>
              <Select
                labelId="submitter-role-label"
                name="submitterRole"
                value={formState.submitterRole}
                onChange={handleSelectChange}
                label="Your Role"
                disabled={submitting}
                required
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
              {errors.submitterRole && <FormHelperText>{errors.submitterRole}</FormHelperText>}
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Submitting...' : 'Submit Idea'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default IdeaSubmissionForm;
