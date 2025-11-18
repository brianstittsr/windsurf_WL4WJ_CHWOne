'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  MenuItem,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Autocomplete,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Edit,
  Save,
  Cancel,
  Work,
  School,
  Language,
  Public,
  LinkedIn,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Security,
  CardMembership,
  Add,
  Delete,
  Build,
  ArrowForward,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import {
  CHWProfile,
  DEFAULT_CHW_PROFILE,
  EXPERTISE_OPTIONS,
  LANGUAGE_OPTIONS,
  REGION5_COUNTIES
} from '@/types/chw-profile.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface EnhancedProfileComponentProps {
  editable?: boolean;
  onSave?: (profile: CHWProfile) => void;
}

// Helper function to calculate days until certification expiration
const calculateDaysUntilExpiration = (expirationDate: string | undefined): number | null => {
  if (!expirationDate) return null;
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function EnhancedProfileComponent({
  editable = true,
  onSave
}: EnhancedProfileComponentProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<CHWProfile>({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    professional: {
      ...DEFAULT_CHW_PROFILE.professional!,
      headline: '',
      bio: ''
    },
    serviceArea: {
      ...DEFAULT_CHW_PROFILE.serviceArea!
    },
    membership: {
      ...DEFAULT_CHW_PROFILE.membership!
    },
    contactPreferences: {
      ...DEFAULT_CHW_PROFILE.contactPreferences!
    },
    toolAccess: {
      ...DEFAULT_CHW_PROFILE.toolAccess!
    },
    socialLinks: {}
  });

  useEffect(() => {
    if (currentUser) {
      // Load profile data - in real implementation, this would come from API
      setProfile(prev => ({
        ...prev,
        userId: currentUser.uid,
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        email: currentUser.email || '',
        profilePicture: currentUser.photoURL || undefined
      }));
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: any, section?: keyof CHWProfile) => {
    if (section) {
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!profile.firstName || !profile.lastName || !profile.email) {
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
  };

  const getRenewalStatus = () => {
    if (!profile.membership.renewalDate) return null;
    
    const renewalDate = new Date(profile.membership.renewalDate);
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
    <Card sx={{ maxWidth: 1200, mx: 'auto' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profile.profilePicture}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {profile.firstName[0]}{profile.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {profile.firstName} {profile.lastName}
              </Typography>
              {profile.professional.headline && (
                <Typography variant="body2" color="text.secondary">
                  {profile.professional.headline}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {profile.serviceArea.region} CHW
              </Typography>
            </Box>
          </Box>
          
          {/* Right side - Certification Countdown + Edit Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Certification Countdown Clock */}
            {(() => {
              const daysUntilExpiration = calculateDaysUntilExpiration(profile.certification?.certificationExpiration);
              const expirationDate = profile.certification?.certificationExpiration;
              
              if (!expirationDate) {
                return (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 2,
                      minWidth: 200,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                    component="a"
                    href="https://www.ncchwa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                      <CardMembership sx={{ fontSize: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Certification
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      Set Expiration Date
                    </Typography>
                  </Paper>
                );
              }

              let backgroundColor = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
              let icon = <CheckCircle sx={{ fontSize: 20 }} />;
              let statusLabel = 'ACTIVE';
              
              if (daysUntilExpiration === null) {
                return null;
              } else if (daysUntilExpiration < 0) {
                backgroundColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
                icon = <ErrorIcon sx={{ fontSize: 20 }} />;
                statusLabel = 'EXPIRED';
              } else if (daysUntilExpiration <= 30) {
                backgroundColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
                icon = <ErrorIcon sx={{ fontSize: 20 }} />;
                statusLabel = 'URGENT';
              } else if (daysUntilExpiration <= 90) {
                backgroundColor = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
                icon = <Warning sx={{ fontSize: 20 }} />;
                statusLabel = 'RENEW SOON';
              }

              return (
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    background: backgroundColor,
                    color: 'white',
                    borderRadius: 2,
                    minWidth: 200,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                  component="a"
                  href="https://www.ncchwa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                    {icon}
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {statusLabel}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {daysUntilExpiration < 0 
                      ? `Expired`
                      : `${daysUntilExpiration} Days`
                    }
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                    {daysUntilExpiration < 0 
                      ? `${Math.abs(daysUntilExpiration)} days ago`
                      : 'Until Recertification'
                    }
                  </Typography>
                </Paper>
              );
            })()}

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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
            <Tab label="Basic Info" icon={<Person />} iconPosition="start" />
            <Tab label="Professional" icon={<Work />} iconPosition="start" />
            <Tab label="Certification" icon={<CardMembership />} iconPosition="start" />
            <Tab label="Service Area" icon={<LocationOn />} iconPosition="start" />
            <Tab label="CHW Tools" icon={<Build />} iconPosition="start" />
            <Tab label="Privacy" icon={<Security />} iconPosition="start" />
            <Tab label="Social" icon={<Public />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 1: Basic Info */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date Registered"
                type="date"
                value={profile.membership.dateRegistered}
                onChange={(e) => handleInputChange('dateRegistered', e.target.value, 'membership')}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Renewal Date"
                type="date"
                value={profile.membership.renewalDate || ''}
                onChange={(e) => handleInputChange('renewalDate', e.target.value, 'membership')}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              {renewalStatus && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={`Renewal: ${renewalStatus.text}`}
                    color={renewalStatus.color as any}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Member Number"
                value={profile.membership.memberNumber || ''}
                onChange={(e) => handleInputChange('memberNumber', e.target.value, 'membership')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Member Type"
                value={profile.membership.memberType || ''}
                onChange={(e) => handleInputChange('memberType', e.target.value, 'membership')}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Professional */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Headline"
                value={profile.professional.headline || ''}
                onChange={(e) => handleInputChange('headline', e.target.value, 'professional')}
                disabled={!isEditing}
                placeholder="e.g., Certified CHW specializing in Maternal Health"
                helperText="A brief professional tagline (like LinkedIn)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={4}
                value={profile.professional.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value, 'professional')}
                disabled={!isEditing}
                placeholder="Tell us about your experience, interests, and what drives your work as a CHW..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Organization"
                value={profile.serviceArea.currentOrganization || ''}
                onChange={(e) => handleInputChange('currentOrganization', e.target.value, 'serviceArea')}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role/Position"
                value={profile.serviceArea.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value, 'serviceArea')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={profile.professional.yearsOfExperience || ''}
                onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0, 'professional')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sector"
                value={profile.serviceArea.sector || ''}
                onChange={(e) => handleInputChange('sector', e.target.value, 'serviceArea')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={EXPERTISE_OPTIONS}
                value={profile.professional.expertise}
                onChange={(_, newValue) => handleInputChange('expertise', newValue, 'professional')}
                disabled={!isEditing}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Areas of Expertise"
                    placeholder="Select your areas of expertise"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option}
                        {...tagProps}
                        size="small"
                      />
                    );
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={LANGUAGE_OPTIONS}
                value={profile.professional.languages}
                onChange={(_, newValue) => handleInputChange('languages', newValue, 'professional')}
                disabled={!isEditing}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Languages Spoken"
                    placeholder="Select languages"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option}
                        {...tagProps}
                        size="small"
                        icon={<Language />}
                      />
                    );
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.professional.availableForOpportunities}
                    onChange={(e) => handleInputChange('availableForOpportunities', e.target.checked, 'professional')}
                    disabled={!isEditing}
                  />
                }
                label="Available for new opportunities (jobs, collaborations, etc.)"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Certification */}
        <TabPanel value={activeTab} index={2}>
          {/* Certification Countdown Tracker */}
          {(() => {
            const daysUntilExpiration = calculateDaysUntilExpiration(profile.certification?.certificationExpiration);
            const expirationDate = profile.certification?.certificationExpiration;
            
            if (!expirationDate) {
              return (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    mb: 4, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CardMembership sx={{ fontSize: 48 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Set Your Certification Expiration Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Stay on top of your CHW certification renewal. Add your expiration date below to track your recertification timeline.
                      </Typography>
                      <Button
                        variant="contained"
                        component="a"
                        href="https://www.ncchwa.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          backgroundColor: 'white',
                          color: '#667eea',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#f8fafc'
                          }
                        }}
                        endIcon={<ArrowForward />}
                      >
                        Visit NCCHWA for Certification Info
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            }

            let alertColor: 'error' | 'warning' | 'success' = 'success';
            let alertIcon = <CheckCircle sx={{ fontSize: 48 }} />;
            let statusText = '';
            let backgroundColor = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';

            if (daysUntilExpiration === null) {
              return null;
            } else if (daysUntilExpiration < 0) {
              alertColor = 'error';
              alertIcon = <ErrorIcon sx={{ fontSize: 48 }} />;
              statusText = 'EXPIRED';
              backgroundColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
            } else if (daysUntilExpiration <= 30) {
              alertColor = 'error';
              alertIcon = <ErrorIcon sx={{ fontSize: 48 }} />;
              statusText = 'URGENT';
              backgroundColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
            } else if (daysUntilExpiration <= 90) {
              alertColor = 'warning';
              alertIcon = <Warning sx={{ fontSize: 48 }} />;
              statusText = 'ACTION NEEDED';
              backgroundColor = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
            } else {
              statusText = 'ACTIVE';
            }

            return (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  background: backgroundColor,
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {alertIcon}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
                      {statusText}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {daysUntilExpiration < 0 
                        ? `Expired ${Math.abs(daysUntilExpiration)} days ago`
                        : `${daysUntilExpiration} Days Until Recertification`
                      }
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
                      {daysUntilExpiration < 0
                        ? 'Your certification has expired. Please recertify immediately to maintain your CHW status.'
                        : daysUntilExpiration <= 30
                        ? 'Your certification expires soon! Take action now to avoid a lapse in your CHW certification.'
                        : daysUntilExpiration <= 90
                        ? 'Your certification is expiring soon. Start your recertification process to ensure continuity.'
                        : 'Your certification is active. Mark your calendar to begin recertification 90 days before expiration.'
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      Expiration Date: {new Date(expirationDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    <Button
                      variant="contained"
                      component="a"
                      href="https://www.ncchwa.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        backgroundColor: 'white',
                        color: alertColor === 'error' ? '#f44336' : alertColor === 'warning' ? '#ff9800' : '#4caf50',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Recertify at NCCHWA
                    </Button>
                  </Box>
                </Box>
              </Paper>
            );
          })()}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Certification Number"
                value={profile.certification?.certificationNumber || ''}
                onChange={(e) => handleInputChange('certificationNumber', e.target.value, 'certification')}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Certification Status</InputLabel>
                <Select
                  value={profile.certification?.certificationStatus || 'not_certified'}
                  label="Certification Status"
                  onChange={(e) => handleInputChange('certificationStatus', e.target.value, 'certification')}
                >
                  <MenuItem value="certified">Certified CHW</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="not_certified">Not Certified</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Certification Expiration"
                type="date"
                value={profile.certification?.certificationExpiration || ''}
                onChange={(e) => handleInputChange('certificationExpiration', e.target.value, 'certification')}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Training College/Institution"
                value={profile.training?.college || ''}
                onChange={(e) => handleInputChange('college', e.target.value, 'training')}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.certification?.scctCompletion || false}
                    onChange={(e) => handleInputChange('scctCompletion', e.target.checked, 'certification')}
                    disabled={!isEditing}
                  />
                }
                label="SCCT Completion"
              />
            </Grid>

            {profile.certification?.scctCompletion && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="SCCT Completion Date"
                    type="date"
                    value={profile.certification?.scctCompletionDate || ''}
                    onChange={(e) => handleInputChange('scctCompletionDate', e.target.value, 'certification')}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="SCCT Instructor"
                    value={profile.certification?.scctInstructor || ''}
                    onChange={(e) => handleInputChange('scctInstructor', e.target.value, 'certification')}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="SCCT Score"
                    type="number"
                    value={profile.certification?.scctScore || ''}
                    onChange={(e) => handleInputChange('scctScore', parseInt(e.target.value) || 0, 'certification')}
                    disabled={!isEditing}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 4: Service Area */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>County of Residence</InputLabel>
                <Select
                  value={profile.serviceArea.countyResideIn}
                  label="County of Residence"
                  onChange={(e) => handleInputChange('countyResideIn', e.target.value, 'serviceArea')}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                value={profile.serviceArea.region}
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={REGION5_COUNTIES}
                value={profile.serviceArea.countiesWorkedIn}
                onChange={(_, newValue) => handleInputChange('countiesWorkedIn', newValue, 'serviceArea')}
                disabled={!isEditing}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Counties Worked In"
                    placeholder="Select counties where you provide services"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={`${option} County`}
                        {...tagProps}
                        size="small"
                      />
                    );
                  })
                }
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: CHW Tools */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Platform Tool Access
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Control which CHWOne platform tools you have access to. These settings determine what features appear in your dashboard and navigation.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.forms ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, forms: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Forms</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Create and manage data collection forms
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/forms"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.datasets ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, datasets: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Datasets</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Access and manage community health datasets
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/datasets"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.reports ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, reports: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Reports</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Generate and view reports on community health
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/reports"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.aiAssistant ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, aiAssistant: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">AI Assistant</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Get AI-powered assistance for your work
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/ai-assistant"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.grants ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, grants: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Grants</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Access grant opportunities and applications
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/grants"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.referrals ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, referrals: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Referrals</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Manage client referrals to services and programs
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/referrals"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.toolAccess?.projects ?? true}
                          onChange={(e) => {
                            const newAccess = { ...profile.toolAccess, projects: e.target.checked };
                            handleInputChange('toolAccess', newAccess);
                          }}
                          disabled={!isEditing}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">Projects</Typography>
                          <Typography variant="caption" color="text.secondary">
                            View and manage community health projects
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      component={Link}
                      href="/projects"
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> Tool access can be managed by your organization administrator. 
                  Changes here reflect your personal preferences and may be subject to organizational policies.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 6: Privacy */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Directory Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.membership.includeInDirectory}
                      onChange={(e) => handleInputChange('includeInDirectory', e.target.checked, 'membership')}
                      disabled={!isEditing}
                    />
                  }
                  label="Include my profile in the CHW Directory"
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  When enabled, other CHWs can find and connect with you through the directory
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Preferences
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.contactPreferences.allowDirectMessages}
                      onChange={(e) => handleInputChange('allowDirectMessages', e.target.checked, 'contactPreferences')}
                      disabled={!isEditing}
                    />
                  }
                  label="Allow direct messages from other CHWs"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.contactPreferences.showEmail}
                      onChange={(e) => handleInputChange('showEmail', e.target.checked, 'contactPreferences')}
                      disabled={!isEditing}
                    />
                  }
                  label="Show my email address in directory"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.contactPreferences.showPhone}
                      onChange={(e) => handleInputChange('showPhone', e.target.checked, 'contactPreferences')}
                      disabled={!isEditing}
                    />
                  }
                  label="Show my phone number in directory"
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={profile.contactMethodPreference || 'email'}
                  label="Preferred Contact Method"
                  onChange={(e) => handleInputChange('contactMethodPreference', e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text Message</MenuItem>
                  <MenuItem value="any">Any Method</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 7: Social Links */}
        <TabPanel value={activeTab} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Connect your social media profiles to help other CHWs learn more about your work
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={profile.socialLinks?.linkedin || ''}
                onChange={(e) => {
                  const newLinks = { ...profile.socialLinks, linkedin: e.target.value };
                  handleInputChange('socialLinks', newLinks);
                }}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/yourprofile"
                InputProps={{
                  startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077B5' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Twitter/X Profile"
                value={profile.socialLinks?.twitter || ''}
                onChange={(e) => {
                  const newLinks = { ...profile.socialLinks, twitter: e.target.value };
                  handleInputChange('socialLinks', newLinks);
                }}
                disabled={!isEditing}
                placeholder="https://twitter.com/yourhandle"
                InputProps={{
                  startAdornment: <Twitter sx={{ mr: 1, color: '#1DA1F2' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Facebook Profile"
                value={profile.socialLinks?.facebook || ''}
                onChange={(e) => {
                  const newLinks = { ...profile.socialLinks, facebook: e.target.value };
                  handleInputChange('socialLinks', newLinks);
                }}
                disabled={!isEditing}
                placeholder="https://facebook.com/yourprofile"
                InputProps={{
                  startAdornment: <Facebook sx={{ mr: 1, color: '#1877F2' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personal Website"
                value={profile.socialLinks?.website || ''}
                onChange={(e) => {
                  const newLinks = { ...profile.socialLinks, website: e.target.value };
                  handleInputChange('socialLinks', newLinks);
                }}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

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
