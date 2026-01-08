'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Avatar,
  IconButton,
  LinearProgress,
  Alert
} from '@mui/material';
import { Close, PhotoCamera, CheckCircle } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationType, UserRole } from '@/types/firebase/schema';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/schema/unified-schema';

interface ProfileCompletionWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// NC Counties for service area selection
const NC_COUNTIES = [
  'Alamance', 'Alexander', 'Alleghany', 'Anson', 'Ashe', 'Avery', 'Beaufort', 'Bertie',
  'Bladen', 'Brunswick', 'Buncombe', 'Burke', 'Cabarrus', 'Caldwell', 'Camden', 'Carteret',
  'Caswell', 'Catawba', 'Chatham', 'Cherokee', 'Chowan', 'Clay', 'Cleveland', 'Columbus',
  'Craven', 'Cumberland', 'Currituck', 'Dare', 'Davidson', 'Davie', 'Duplin', 'Durham',
  'Edgecombe', 'Forsyth', 'Franklin', 'Gaston', 'Gates', 'Graham', 'Granville', 'Greene',
  'Guilford', 'Halifax', 'Harnett', 'Haywood', 'Henderson', 'Hertford', 'Hoke', 'Hyde',
  'Iredell', 'Jackson', 'Johnston', 'Jones', 'Lee', 'Lenoir', 'Lincoln', 'Macon', 'Madison',
  'Martin', 'McDowell', 'Mecklenburg', 'Mitchell', 'Montgomery', 'Moore', 'Nash', 'New Hanover',
  'Northampton', 'Onslow', 'Orange', 'Pamlico', 'Pasquotank', 'Pender', 'Perquimans', 'Person',
  'Pitt', 'Polk', 'Randolph', 'Richmond', 'Robeson', 'Rockingham', 'Rowan', 'Rutherford',
  'Sampson', 'Scotland', 'Stanly', 'Stokes', 'Surry', 'Swain', 'Transylvania', 'Tyrrell',
  'Union', 'Vance', 'Wake', 'Warren', 'Washington', 'Watauga', 'Wayne', 'Wilkes', 'Wilson',
  'Yadkin', 'Yancey'
];

const REGIONS = ['Region 1', 'Region 2', 'Region 3', 'Region 4', 'Region 5', 'Region 6'];

const EXPERTISE_OPTIONS = [
  'Chronic Disease Management', 'Diabetes Care', 'Maternal & Child Health',
  'Mental Health Support', 'Substance Abuse Prevention', 'Health Education',
  'Nutrition Counseling', 'Care Coordination', 'Community Outreach',
  'Cultural Competency', 'Home Visits', 'Case Management'
];

const LANGUAGES = [
  'English', 'Spanish', 'Chinese', 'Vietnamese', 'Arabic', 'French',
  'German', 'Hindi', 'Korean', 'Portuguese', 'Russian', 'Tagalog', 'Other'
];

const SERVICE_CATEGORIES = [
  'Healthcare Services', 'Mental Health Services', 'Substance Abuse Treatment',
  'Housing Assistance', 'Food Security', 'Transportation', 'Employment Services',
  'Education & Training', 'Legal Services', 'Financial Assistance',
  'Childcare Services', 'Senior Services', 'Disability Services',
  'Crisis Intervention', 'Community Health Programs'
];

export default function ProfileCompletionWizard({ open, onClose, onComplete }: ProfileCompletionWizardProps) {
  const { currentUser, userProfile } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  
  // Determine user type
  const userOrgType = userProfile?.organizationType;
  const userRole = userProfile?.role || userProfile?.primaryRole;
  
  // Form data state
  const [formData, setFormData] = useState({
    // Common fields
    displayName: '',
    phone: '',
    bio: '',
    
    // Address
    street: '',
    city: '',
    state: 'NC',
    zipCode: '',
    
    // CHW specific
    expertise: [] as string[],
    languages: ['English'] as string[],
    yearsOfExperience: 0,
    certificationNumber: '',
    certificationStatus: 'not_certified',
    region: '',
    primaryCounty: '',
    countiesServed: [] as string[],
    currentOrganization: '',
    currentPosition: '',
    
    // Nonprofit specific
    organizationName: '',
    organizationType: '',
    ein: '',
    mission: '',
    website: '',
    serviceCategories: [] as string[],
    
    // Association specific
    associationName: '',
    acronym: '',
    yearFounded: '',
    executiveDirectorName: '',
    executiveDirectorEmail: '',
    memberCount: 0,
    
    // State specific
    stateName: '',
    department: '',
    title: '',
    jurisdictionLevel: '',
  });

  // Load existing profile data
  useEffect(() => {
    if (userProfile) {
      const profile = userProfile as any; // Cast to any for optional fields
      setFormData(prev => ({
        ...prev,
        displayName: userProfile.displayName || '',
        phone: profile.phone || '',
      }));
      
      if (profile.profilePicture) {
        setProfilePhoto(profile.profilePicture);
      }
    }
  }, [userProfile]);

  // Get steps based on user type
  const getSteps = () => {
    switch (userOrgType) {
      case OrganizationType.CHW:
        return ['Basic Info', 'Professional Details', 'Service Area', 'Certification'];
      case OrganizationType.NONPROFIT:
        return ['Organization Info', 'Contact Details', 'Services', 'Service Area'];
      case OrganizationType.CHW_ASSOCIATION:
        return ['Association Info', 'Leadership', 'Programs', 'Membership'];
      case OrganizationType.STATE:
        return ['Agency Info', 'Contact Details', 'Jurisdiction', 'Programs'];
      default:
        return ['Basic Info', 'Contact Details', 'Preferences'];
    }
  };

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string) => (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Compress and convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          
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
          setProfilePhoto(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
      
      // Build update data based on user type
      const updateData: any = {
        displayName: formData.displayName,
        phone: formData.phone,
        profilePicture: profilePhoto,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        profileCompleted: true,
        profileCompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add type-specific data
      if (userOrgType === OrganizationType.CHW) {
        updateData.professional = {
          bio: formData.bio,
          expertise: formData.expertise,
          languages: formData.languages,
          yearsOfExperience: formData.yearsOfExperience,
          currentOrganization: formData.currentOrganization,
          currentPosition: formData.currentPosition
        };
        updateData.serviceArea = {
          region: formData.region,
          primaryCounty: formData.primaryCounty,
          countiesServed: formData.countiesServed
        };
        updateData.certification = {
          certificationNumber: formData.certificationNumber,
          certificationStatus: formData.certificationStatus
        };
        
        // Also update CHW profile if it exists
        const chwProfileRef = doc(db, COLLECTIONS.CHW_PROFILES, currentUser.uid);
        const chwDoc = await getDoc(chwProfileRef);
        if (chwDoc.exists()) {
          await updateDoc(chwProfileRef, {
            ...updateData,
            updatedAt: serverTimestamp()
          });
        }
      } else if (userOrgType === OrganizationType.NONPROFIT) {
        updateData.organization = {
          name: formData.organizationName,
          type: formData.organizationType,
          ein: formData.ein,
          mission: formData.mission,
          website: formData.website,
          serviceCategories: formData.serviceCategories
        };
        updateData.serviceArea = {
          region: formData.region,
          countiesServed: formData.countiesServed
        };
      } else if (userOrgType === OrganizationType.CHW_ASSOCIATION) {
        updateData.association = {
          name: formData.associationName,
          acronym: formData.acronym,
          yearFounded: formData.yearFounded,
          executiveDirector: {
            name: formData.executiveDirectorName,
            email: formData.executiveDirectorEmail
          },
          memberCount: formData.memberCount
        };
      } else if (userOrgType === OrganizationType.STATE) {
        updateData.agency = {
          stateName: formData.stateName,
          department: formData.department,
          title: formData.title,
          jurisdictionLevel: formData.jurisdictionLevel
        };
      }

      await updateDoc(userRef, updateData);
      
      onComplete();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Render step content based on user type and step
  const renderStepContent = () => {
    // CHW Steps
    if (userOrgType === OrganizationType.CHW) {
      switch (activeStep) {
        case 0: // Basic Info
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profilePhoto}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: -8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <PhotoCamera />
                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Professional Bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about your experience and passion for community health work..."
                />
              </Grid>
            </Grid>
          );
        case 1: // Professional Details
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Organization"
                  value={formData.currentOrganization}
                  onChange={(e) => handleChange('currentOrganization', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Position"
                  value={formData.currentPosition}
                  onChange={(e) => handleChange('currentPosition', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Years of Experience"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Areas of Expertise</InputLabel>
                  <Select
                    multiple
                    value={formData.expertise}
                    onChange={handleMultiSelectChange('expertise')}
                    input={<OutlinedInput label="Areas of Expertise" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {EXPERTISE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Languages Spoken</InputLabel>
                  <Select
                    multiple
                    value={formData.languages}
                    onChange={handleMultiSelectChange('languages')}
                    input={<OutlinedInput label="Languages Spoken" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {LANGUAGES.map((lang) => (
                      <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          );
        case 2: // Service Area
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    label="Region"
                  >
                    {REGIONS.map((region) => (
                      <MenuItem key={region} value={region}>{region}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Primary County</InputLabel>
                  <Select
                    value={formData.primaryCounty}
                    onChange={(e) => handleChange('primaryCounty', e.target.value)}
                    label="Primary County"
                  >
                    {NC_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>{county}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Counties Served</InputLabel>
                  <Select
                    multiple
                    value={formData.countiesServed}
                    onChange={handleMultiSelectChange('countiesServed')}
                    input={<OutlinedInput label="Counties Served" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {NC_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>{county}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 3: // Certification
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Certification Status</InputLabel>
                  <Select
                    value={formData.certificationStatus}
                    onChange={(e) => handleChange('certificationStatus', e.target.value)}
                    label="Certification Status"
                  >
                    <MenuItem value="not_certified">Not Certified</MenuItem>
                    <MenuItem value="in_progress">Certification In Progress</MenuItem>
                    <MenuItem value="certified">Certified</MenuItem>
                    <MenuItem value="expired">Certification Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.certificationStatus === 'certified' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Certification Number"
                    value={formData.certificationNumber}
                    onChange={(e) => handleChange('certificationNumber', e.target.value)}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Alert severity="info">
                  Your profile will be reviewed by an administrator before being published to the CHW Directory.
                </Alert>
              </Grid>
            </Grid>
          );
      }
    }
    
    // Nonprofit Steps
    if (userOrgType === OrganizationType.NONPROFIT) {
      switch (activeStep) {
        case 0: // Organization Info
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={formData.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Organization Type</InputLabel>
                  <Select
                    value={formData.organizationType}
                    onChange={(e) => handleChange('organizationType', e.target.value)}
                    label="Organization Type"
                  >
                    <MenuItem value="501c3">501(c)(3) Nonprofit</MenuItem>
                    <MenuItem value="faith_based">Faith-Based Organization</MenuItem>
                    <MenuItem value="health_center">Community Health Center</MenuItem>
                    <MenuItem value="hospital">Hospital/Health System</MenuItem>
                    <MenuItem value="government">Government Agency</MenuItem>
                    <MenuItem value="cbo">Community-Based Organization</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="EIN (Tax ID)"
                  value={formData.ein}
                  onChange={(e) => handleChange('ein', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Mission Statement"
                  value={formData.mission}
                  onChange={(e) => handleChange('mission', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 1: // Contact Details
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="State" value={formData.state} disabled />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 2: // Services
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Service Categories</InputLabel>
                  <Select
                    multiple
                    value={formData.serviceCategories}
                    onChange={handleMultiSelectChange('serviceCategories')}
                    input={<OutlinedInput label="Service Categories" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description of Services"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Describe the services your organization provides..."
                />
              </Grid>
            </Grid>
          );
        case 3: // Service Area
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    label="Region"
                  >
                    {REGIONS.map((region) => (
                      <MenuItem key={region} value={region}>{region}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Counties Served</InputLabel>
                  <Select
                    multiple
                    value={formData.countiesServed}
                    onChange={handleMultiSelectChange('countiesServed')}
                    input={<OutlinedInput label="Counties Served" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {NC_COUNTIES.map((county) => (
                      <MenuItem key={county} value={county}>{county}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          );
      }
    }

    // Association Steps
    if (userOrgType === OrganizationType.CHW_ASSOCIATION) {
      switch (activeStep) {
        case 0: // Association Info
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Association Name"
                  value={formData.associationName}
                  onChange={(e) => handleChange('associationName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Acronym"
                  value={formData.acronym}
                  onChange={(e) => handleChange('acronym', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year Founded"
                  value={formData.yearFounded}
                  onChange={(e) => handleChange('yearFounded', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Mission Statement"
                  value={formData.mission}
                  onChange={(e) => handleChange('mission', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 1: // Leadership
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Executive Director Name"
                  value={formData.executiveDirectorName}
                  onChange={(e) => handleChange('executiveDirectorName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Executive Director Email"
                  value={formData.executiveDirectorEmail}
                  onChange={(e) => handleChange('executiveDirectorEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 2: // Programs
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Programs & Services"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Describe the programs and services your association offers..."
                />
              </Grid>
            </Grid>
          );
        case 3: // Membership
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Current Member Count"
                  value={formData.memberCount}
                  onChange={(e) => handleChange('memberCount', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Your association profile will be reviewed by an administrator before being activated.
                </Alert>
              </Grid>
            </Grid>
          );
      }
    }

    // State Agency Steps
    if (userOrgType === OrganizationType.STATE) {
      switch (activeStep) {
        case 0: // Agency Info
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.stateName}
                  onChange={(e) => handleChange('stateName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department/Agency Name"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Agency Mission"
                  value={formData.mission}
                  onChange={(e) => handleChange('mission', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 1: // Contact Details
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title/Position"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </Grid>
            </Grid>
          );
        case 2: // Jurisdiction
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Jurisdiction Level</InputLabel>
                  <Select
                    value={formData.jurisdictionLevel}
                    onChange={(e) => handleChange('jurisdictionLevel', e.target.value)}
                    label="Jurisdiction Level"
                  >
                    <MenuItem value="state">Statewide</MenuItem>
                    <MenuItem value="regional">Regional</MenuItem>
                    <MenuItem value="county">County</MenuItem>
                    <MenuItem value="local">Local</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Regions Covered</InputLabel>
                  <Select
                    multiple
                    value={formData.countiesServed}
                    onChange={handleMultiSelectChange('countiesServed')}
                    input={<OutlinedInput label="Regions Covered" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {REGIONS.map((region) => (
                      <MenuItem key={region} value={region}>{region}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          );
        case 3: // Programs
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="CHW Programs & Initiatives"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Describe your agency's CHW-related programs and initiatives..."
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Your state agency profile will be reviewed by an administrator before being activated.
                </Alert>
              </Grid>
            </Grid>
          );
      }
    }

    // Default steps for other user types
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="About You"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </Grid>
      </Grid>
    );
  };

  const getWizardTitle = () => {
    switch (userOrgType) {
      case OrganizationType.CHW:
        return 'Complete Your CHW Profile';
      case OrganizationType.NONPROFIT:
        return 'Complete Your Nonprofit Profile';
      case OrganizationType.CHW_ASSOCIATION:
        return 'Complete Your Association Profile';
      case OrganizationType.STATE:
        return 'Complete Your State Agency Profile';
      default:
        return 'Complete Your Profile';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="span">{getWizardTitle()}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Help us personalize your experience by completing your profile
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Box sx={{ minHeight: 300, py: 2 }}>
          {renderStepContent()}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {saving && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Skip for Now
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={<CheckCircle />}
          >
            {saving ? 'Saving...' : 'Complete Profile'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
