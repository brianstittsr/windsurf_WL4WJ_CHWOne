'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';

interface CHWProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  county: string;
  dateRegistered: string;
  chwRenewalDate: string;
  profilePicture?: string;
  bio?: string;
}

const REGION5_COUNTIES = [
  'Bladen', 'Brunswick', 'Columbus', 'Cumberland', 'Harnett',
  'Hoke', 'Lee', 'Montgomery', 'Moore', 'New Hanover',
  'Pender', 'Richmond', 'Robeson', 'Sampson', 'Scotland'
];

interface ProfileComponentProps {
  editable?: boolean;
  onSave?: (profile: CHWProfile) => void;
}

export default function ProfileComponent({
  editable = true,
  onSave
}: ProfileComponentProps) {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<CHWProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    county: '',
    dateRegistered: '',
    chwRenewalDate: '',
    bio: ''
  });

  useEffect(() => {
    if (currentUser) {
      // Load profile data - in real implementation, this would come from API
      setProfile({
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        email: currentUser.email || '',
        phone: '', // Would come from user profile
        county: '', // Would come from user profile
        dateRegistered: new Date().toISOString().split('T')[0], // Mock date
        chwRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mock renewal date
        bio: 'Community Health Worker serving Region 5 counties.'
      });
    }
  }, [currentUser]);

  const handleInputChange = (field: keyof CHWProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!profile.firstName || !profile.lastName || !profile.email || !profile.county) {
        throw new Error('Please fill in all required fields');
      }

      // In real implementation, save to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      setSuccess(true);
      setIsEditing(false);
      onSave?.(profile);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset to original values if needed
  };

  const getRenewalStatus = () => {
    const renewalDate = new Date(profile.chwRenewalDate);
    const now = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilRenewal < 0) {
      return { status: 'expired', color: 'error', text: 'Expired' };
    } else if (daysUntilRenewal <= 30) {
      return { status: 'urgent', color: 'warning', text: `${daysUntilRenewal} days` };
    } else if (daysUntilRenewal <= 90) {
      return { status: 'soon', color: 'info', text: `${daysUntilRenewal} days` };
    } else {
      return { status: 'active', color: 'success', text: 'Active' };
    }
  };

  const renewalStatus = getRenewalStatus();

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            CHW Profile
          </Typography>
          {editable && !isEditing && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Profile Picture and Basic Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </Avatar>
              <Typography variant="h6">
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Region 5 CHW
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* Date Registered */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date Registered"
                  type="date"
                  value={profile.dateRegistered}
                  onChange={(e) => handleInputChange('dateRegistered', e.target.value)}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* CHW Renewal Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CHW Renewal Date"
                  type="date"
                  value={profile.chwRenewalDate}
                  onChange={(e) => handleInputChange('chwRenewalDate', e.target.value)}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={`Renewal: ${renewalStatus.text}`}
                    color={renewalStatus.color as any}
                  />
                </Box>
              </Grid>

              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              {/* County Live/Work */}
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>County Live/Work *</InputLabel>
                  <Select
                    value={profile.county}
                    label="County Live/Work *"
                    onChange={(e) => handleInputChange('county', e.target.value)}
                    startAdornment={<LocationOn sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {REGION5_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>
                        {county} County
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Bio */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about your experience and interests..."
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {isEditing && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
