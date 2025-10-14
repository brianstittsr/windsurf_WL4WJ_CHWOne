'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { civiCrmService, CiviContact } from '@/services/civicrm/CiviCrmService';

interface ContactFormProps {
  contact?: CiviContact;
  onSave: (contact: CiviContact) => void;
  onCancel: () => void;
}

export default function ContactForm({
  contact,
  onSave,
  onCancel
}: ContactFormProps) {
  const isNewContact = !contact?.id;
  
  const [formData, setFormData] = useState<CiviContact>(
    contact || {
      contact_type: 'Individual',
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear field error when user changes the value
      if (fieldErrors[name]) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };
  
  const handleContactTypeChange = (e: SelectChangeEvent<'Individual' | 'Organization' | 'Household'>) => {
    const contactType = e.target.value as 'Individual' | 'Organization' | 'Household';
    
    // Reset form fields based on contact type
    if (contactType === 'Individual') {
      setFormData(prev => ({
        ...prev,
        contact_type: contactType,
        first_name: prev.first_name || '',
        last_name: prev.last_name || '',
        organization_name: undefined,
        household_name: undefined
      }));
    } else if (contactType === 'Organization') {
      setFormData(prev => ({
        ...prev,
        contact_type: contactType,
        first_name: undefined,
        last_name: undefined,
        organization_name: prev.organization_name || '',
        household_name: undefined
      }));
    } else if (contactType === 'Household') {
      setFormData(prev => ({
        ...prev,
        contact_type: contactType,
        first_name: undefined,
        last_name: undefined,
        organization_name: undefined,
        household_name: prev.household_name || ''
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (formData.contact_type === 'Individual') {
      if (!formData.first_name) {
        errors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        errors.last_name = 'Last name is required';
      }
    } else if (formData.contact_type === 'Organization') {
      if (!formData.organization_name) {
        errors.organization_name = 'Organization name is required';
      }
    } else if (formData.contact_type === 'Household') {
      if (!formData.household_name) {
        errors.household_name = 'Household name is required';
      }
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (isNewContact) {
        response = await civiCrmService.createContact(formData);
      } else if (contact?.id) {
        response = await civiCrmService.updateContact(contact.id, formData);
      }
      
      if (response?.is_error) {
        setError(response.error_message || 'Failed to save contact');
      } else if (response?.values?.[0]) {
        onSave(response.values[0]);
      }
    } catch (err) {
      setError(`Error saving contact: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isNewContact ? 'Create New Contact' : 'Edit Contact'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="contact-type-label">Contact Type</InputLabel>
              <Select
                labelId="contact-type-label"
                id="contact-type"
                name="contact_type"
                value={formData.contact_type}
                onChange={handleContactTypeChange}
                label="Contact Type"
              >
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Organization">Organization</MenuItem>
                <MenuItem value="Household">Household</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {formData.contact_type === 'Individual' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.first_name}
                  helperText={fieldErrors.first_name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange}
                  error={!!fieldErrors.last_name}
                  helperText={fieldErrors.last_name}
                  required
                />
              </Grid>
            </>
          )}
          
          {formData.contact_type === 'Organization' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                name="organization_name"
                value={formData.organization_name || ''}
                onChange={handleChange}
                error={!!fieldErrors.organization_name}
                helperText={fieldErrors.organization_name}
                required
              />
            </Grid>
          )}
          
          {formData.contact_type === 'Household' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Household Name"
                name="household_name"
                value={formData.household_name || ''}
                onChange={handleChange}
                error={!!fieldErrors.household_name}
                helperText={fieldErrors.household_name}
                required
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              Contact Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              Address
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street_address"
              value={formData.street_address || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
              >
                {loading ? 'Saving...' : 'Save Contact'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
