'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';
import {
  SandhillsResource,
  CreateSandhillsResourceInput,
  UpdateSandhillsResourceInput,
  ResourceType,
  ResourceStatus,
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  SANDHILLS_COUNTIES
} from '@/types/sandhills-resource.types';
import { useAuth } from '@/contexts/AuthContext';

interface SandhillsResourceFormProps {
  resourceId?: string;
  onSave?: (resource: SandhillsResource) => void;
  onCancel?: () => void;
}

const emptyForm: CreateSandhillsResourceInput = {
  organization: '',
  address: '',
  city: '',
  state: 'North Carolina',
  zip: '',
  county: '',
  resourceType: "Children's Services",
  department: '',
  contactPerson: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  generalContactName: '',
  generalContactPhone: '',
  website: '',
  lastContactDate: '',
  currentStatus: 'Active',
  notes: '',
  resourceDescription: '',
  eligibility: '',
  howToApply: ''
};

export default function SandhillsResourceForm({
  resourceId,
  onSave,
  onCancel
}: SandhillsResourceFormProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSandhillsResourceInput>(emptyForm);
  const [existingResource, setExistingResource] = useState<SandhillsResource | null>(null);

  const isEditMode = !!resourceId;

  // Fetch existing resource if editing
  useEffect(() => {
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  const fetchResource = async () => {
    if (!resourceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const resource = await SandhillsResourceService.getById(resourceId);
      if (resource) {
        setExistingResource(resource);
        setFormData({
          organization: resource.organization,
          address: resource.address || '',
          city: resource.city || '',
          state: resource.state,
          zip: resource.zip || '',
          county: resource.county || '',
          resourceType: resource.resourceType,
          department: resource.department || '',
          contactPerson: resource.contactPerson || '',
          contactPersonPhone: resource.contactPersonPhone || '',
          contactPersonEmail: resource.contactPersonEmail || '',
          generalContactName: resource.generalContactName || '',
          generalContactPhone: resource.generalContactPhone || '',
          website: resource.website || '',
          lastContactDate: resource.lastContactDate || '',
          currentStatus: resource.currentStatus,
          notes: resource.notes || '',
          resourceDescription: resource.resourceDescription || '',
          eligibility: resource.eligibility || '',
          howToApply: resource.howToApply || ''
        });
      } else {
        setError('Resource not found');
      }
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateSandhillsResourceInput) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.organization.trim()) {
      setError('Organization name is required');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let savedResource: SandhillsResource;
      
      if (isEditMode && resourceId) {
        // Update existing
        savedResource = await SandhillsResourceService.update(
          resourceId,
          formData as UpdateSandhillsResourceInput,
          currentUser?.uid
        );
        setSuccess('Resource updated successfully');
      } else {
        // Create new
        savedResource = await SandhillsResourceService.create(
          formData,
          currentUser?.uid
        );
        setSuccess('Resource created successfully');
      }
      
      if (onSave) {
        onSave(savedResource);
      } else {
        // Navigate back after short delay
        setTimeout(() => {
          router.push('/sandhills-resources');
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving resource:', err);
      setError('Failed to save resource. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {isEditMode ? 'Edit Resource' : 'Add New Resource'}
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Organization Info Section */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1 }} /> Organization Information
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Organization Name"
                value={formData.organization}
                onChange={handleChange('organization')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  value={formData.resourceType}
                  label="Resource Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, resourceType: e.target.value as ResourceType }))}
                >
                  {RESOURCE_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={handleChange('department')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.currentStatus}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value as ResourceStatus }))}
                >
                  {RESOURCE_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={handleChange('website')}
                placeholder="https://..."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Location Section */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1 }} /> Location
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zip}
                onChange={handleChange('zip')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>County</InputLabel>
                <Select
                  value={formData.county}
                  label="County"
                  onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value as string }))}
                >
                  <MenuItem value="">Select County</MenuItem>
                  {SANDHILLS_COUNTIES.map(county => (
                    <MenuItem key={county} value={county}>{county}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Contact Section */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ mr: 1 }} /> Contact Information
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange('contactPerson')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPersonPhone}
                onChange={handleChange('contactPersonPhone')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contactPersonEmail}
                onChange={handleChange('contactPersonEmail')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Contact Date"
                value={formData.lastContactDate}
                onChange={handleChange('lastContactDate')}
                placeholder="MM-DD-YY"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="General Contact Name/Department"
                value={formData.generalContactName}
                onChange={handleChange('generalContactName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="General Contact Phone"
                value={formData.generalContactPhone}
                onChange={handleChange('generalContactPhone')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Description Section */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 1 }} /> Resource Details
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Resource Description"
                value={formData.resourceDescription}
                onChange={handleChange('resourceDescription')}
                placeholder="Describe the services and resources provided..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Eligibility Requirements"
                value={formData.eligibility}
                onChange={handleChange('eligibility')}
                placeholder="What do I need to have to qualify for this benefit?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="How to Apply"
                value={formData.howToApply}
                onChange={handleChange('howToApply')}
                placeholder="How do I apply to get this benefit?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                placeholder="Additional notes or comments..."
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Resource' : 'Create Resource'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
