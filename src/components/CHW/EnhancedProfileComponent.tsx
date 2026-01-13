'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema/unified-schema';
import {
  Card,
  CardContent,
  CardActions,
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
  Stack,
  CircularProgress
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
  Error as ErrorIcon,
  Description,
  Storage as StorageIcon,
  Assessment,
  SmartToy,
  AttachMoney,
  Send,
  FolderSpecial,
  LibraryBooks,
  Groups
} from '@mui/icons-material';
import {
  CHWProfile,
  DEFAULT_CHW_PROFILE,
  EXPERTISE_OPTIONS,
  LANGUAGE_OPTIONS,
  NC_COUNTIES
} from '@/types/chw-profile.types';
import NonprofitLinker from './NonprofitLinker';
import { Business } from '@mui/icons-material';

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
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    const loadProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading CHW profile for user:', currentUser.uid);

        // Load from chwProfiles collection
        const profileRef = doc(db, COLLECTIONS.CHW_PROFILES, currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          console.log('CHW profile loaded:', data);
          
          // Map Firestore data to profile state
          setProfile({
            id: profileSnap.id,
            userId: data.userId || currentUser.uid,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || currentUser.email || '',
            phone: data.phone || '',
            address: data.address || {},
            profilePicture: data.profilePicture || currentUser.photoURL || undefined,
            displayName: data.displayName || `${data.firstName} ${data.lastName}`,
            professional: {
              headline: data.professional?.headline || '',
              bio: data.professional?.bio || '',
              expertise: data.professional?.expertise || [],
              additionalExpertise: data.professional?.additionalExpertise || '',
              languages: data.professional?.languages || ['English'],
              availableForOpportunities: data.professional?.availableForOpportunities ?? true,
              yearsOfExperience: data.professional?.yearsOfExperience || 0,
              specializations: data.professional?.specializations || data.professional?.expertise || [],
              currentOrganization: data.professional?.currentOrganization || '',
              currentPosition: data.professional?.currentPosition || ''
            },
            serviceArea: {
              region: data.serviceArea?.region || '',
              countiesWorkedIn: data.serviceArea?.countiesWorkedIn || [],
              countyResideIn: data.serviceArea?.countyResideIn || '',
              currentOrganization: data.serviceArea?.currentOrganization || data.professional?.currentOrganization,
              role: data.serviceArea?.role || data.professional?.currentPosition
            },
            certification: data.certification || {
              certificationNumber: '',
              certificationStatus: 'not_certified',
              certificationExpiration: undefined,
              expirationDate: undefined
            },
            contactPreferences: {
              allowDirectMessages: data.contactPreferences?.allowDirectMessages ?? true,
              showEmail: data.contactPreferences?.showEmail ?? false,
              showPhone: data.contactPreferences?.showPhone ?? false,
              showAddress: data.contactPreferences?.showAddress ?? false
            },
            membership: {
              dateRegistered: data.membership?.dateRegistered || data.createdAt,
              includeInDirectory: data.membership?.includeInDirectory ?? true,
              renewalDate: data.membership?.renewalDate
            },
            toolAccess: data.toolAccess || DEFAULT_CHW_PROFILE.toolAccess,
            socialLinks: data.socialLinks || {},
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        } else {
          console.log('No CHW profile found, using defaults with Auth data');
          // No profile exists yet, use defaults with Auth data
          setProfile(prev => ({
            ...prev,
            userId: currentUser.uid,
            firstName: currentUser.displayName?.split(' ')[0] || '',
            lastName: currentUser.displayName?.split(' ')[1] || '',
            email: currentUser.email || '',
            profilePicture: currentUser.photoURL || undefined
          }));
        }
      } catch (err) {
        console.error('Error loading CHW profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
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
    if (!currentUser) {
      setError('You must be logged in to save your profile');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!profile.firstName || !profile.lastName || !profile.email) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Saving CHW profile to Firestore...');

      // Helper function to remove undefined values recursively
      const removeUndefined = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return null;
        }
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined).filter(item => item !== null && item !== undefined);
        }
        if (typeof obj === 'object') {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            const value = removeUndefined(obj[key]);
            if (value !== undefined && value !== null) {
              cleaned[key] = value;
            }
          });
          return cleaned;
        }
        return obj;
      };

      // Prepare profile data for Firestore
      const profileData = removeUndefined({
        ...profile,
        userId: currentUser.uid,
        displayName: `${profile.firstName} ${profile.lastName}`,
        updatedAt: serverTimestamp()
      });

      // Save to chwProfiles collection
      const profileRef = doc(db, COLLECTIONS.CHW_PROFILES, currentUser.uid);
      await setDoc(profileRef, profileData, { merge: true });

      console.log('CHW profile saved successfully');

      setSuccess(true);
      setIsEditing(false);
      onSave?.(profile);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
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

  // Show loading state
  if (loading) {
    return (
      <Card sx={{ maxWidth: 1200, mx: 'auto' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle photo upload
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const compressedImage = await compressImage(file);
      setProfile(prev => ({ ...prev, profilePicture: compressedImage }));
      setPhotoFile(file);
    } catch (error) {
      console.error('Error compressing image:', error);
      setError('Failed to process image. Please try a different image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 1200, mx: 'auto' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Edit Button - Upper Left */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            {editable && !isEditing && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                size="large"
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile.profilePicture}
                sx={{
                  width: 240,
                  height: 240,
                  bgcolor: 'primary.main',
                  fontSize: '6rem',
                  cursor: isEditing ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isEditing) {
                    document.getElementById('profile-photo-upload')?.click();
                  }
                }}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </Avatar>
              {isEditing && (
                <>
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                    onClick={() => document.getElementById('profile-photo-upload')?.click()}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </>
              )}
              {uploadingPhoto && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px'
                  }}
                />
              )}
            </Box>
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
            <Tab label="Organization" icon={<Business />} iconPosition="start" />
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
                  {NC_COUNTIES.map((county) => (
                    <MenuItem key={county} value={county}>
                      {county} County
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={profile.serviceArea.region || ''}
                  onChange={(e) => handleInputChange('region', e.target.value, 'serviceArea')}
                  disabled={!isEditing}
                  label="Region"
                >
                  <MenuItem value="Region 1">Region 1</MenuItem>
                  <MenuItem value="Region 2">Region 2</MenuItem>
                  <MenuItem value="Region 3">Region 3</MenuItem>
                  <MenuItem value="Region 4">Region 4</MenuItem>
                  <MenuItem value="Region 5">Region 5</MenuItem>
                  <MenuItem value="Region 6">Region 6</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={NC_COUNTIES}
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

        {/* Tab 5: Organization */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Linked Organization
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Link your CHW profile to the nonprofit organization you work with. This enables collaboration, referral tracking, and access to organizational resources.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <NonprofitLinker
                currentNonprofitId={userProfile?.linkedNonprofitId}
                onNonprofitLinked={(id) => {
                  console.log('Linked to nonprofit:', id);
                }}
                onNonprofitUnlinked={() => {
                  console.log('Unlinked from nonprofit');
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 6: CHW Tools */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Platform Tools
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Access powerful tools designed to support your community health work. Click on any tool to get started.
              </Typography>
            </Grid>

            {/* Tool Cards Grid */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                {/* Forms Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Description sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Forms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create custom data collection forms and surveys. Collect community health data efficiently with mobile-friendly forms that work offline.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/forms" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Forms
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Datasets Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StorageIcon sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Datasets
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Access and analyze community health datasets. View collected data, export reports, and track trends over time with powerful data tools.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/datasets" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Datasets
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Reports Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Assessment sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Reports
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generate comprehensive reports on community health outcomes. Create visualizations, track KPIs, and share insights with stakeholders.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/reports" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Reports
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* AI Assistant Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SmartToy sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        AI Assistant
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get AI-powered assistance for your community health work. Ask questions, get recommendations, and automate routine tasks with intelligent support.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/ai-assistant" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open AI Assistant
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Grants Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AttachMoney sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Grants
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Discover and apply for grant opportunities. Track applications, manage deliverables, and report on funded projects all in one place.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/grants" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Grants
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Referrals Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Send sx={{ fontSize: 60, color: '#666', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Referrals
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage client referrals to services and programs. Connect community members with resources, track referral outcomes, and coordinate care.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/referrals" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Referrals
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Projects Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FolderSpecial sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Projects
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View and manage community health projects. Collaborate with team members, track milestones, and measure project impact.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/projects" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Projects
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Resources Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LibraryBooks sx={{ fontSize: 60, color: '#666', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Resources
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Access a library of community health resources. Find educational materials, best practices, and tools to support your work.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/resources" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Resources
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Collaborations Tool Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        background: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Groups sx={{ fontSize: 60, color: '#555', opacity: 0.9 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Collaborations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connect and collaborate with other CHWs and organizations. Share knowledge, coordinate efforts, and build community partnerships.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        href="/collaborations" 
                        size="small" 
                        endIcon={<ArrowForward />}
                        sx={{ ml: 1, mb: 1 }}
                      >
                        Open Collaborations
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 7: Privacy */}
        <TabPanel value={activeTab} index={6}>
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

        {/* Tab 8: Social Links */}
        <TabPanel value={activeTab} index={7}>
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
