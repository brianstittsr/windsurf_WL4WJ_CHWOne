'use client';

import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Avatar
} from '@mui/material';
import { CHWProfile } from '@/types/chw-profile.types';

interface CHWWizardProps {
  onComplete: (chwId: string) => void;
}

const steps = [
  'Basic Information',
  'Professional Details',
  'Certification & Training',
  'Service Area',
  'Contact Preferences',
  'Review & Submit'
];

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

const EXPERTISE_OPTIONS = [
  'Chronic Disease Management',
  'Diabetes Care',
  'Maternal & Child Health',
  'Mental Health Support',
  'Substance Abuse Prevention',
  'Health Education',
  'Nutrition Counseling',
  'Care Coordination',
  'Community Outreach',
  'Cultural Competency',
  'Home Visits',
  'Case Management'
];

const LANGUAGES = [
  'English', 'Spanish', 'Chinese', 'Vietnamese', 'Arabic', 'French', 'German',
  'Hindi', 'Korean', 'Portuguese', 'Russian', 'Tagalog', 'Other'
];

export function CHWWizard({ onComplete }: CHWWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: 'NC',
      zipCode: ''
    },
    professional: {
      bio: '',
      headline: '',
      expertise: [],
      languages: ['English'],
      yearsOfExperience: 0,
      currentOrganization: '',
      currentPosition: '',
      availableForOpportunities: true,
      specializations: []
    },
    serviceArea: {
      region: '',
      primaryCounty: '',
      countiesWorkedIn: [],
      countyResideIn: '',
      willingToTravel: false,
      maxTravelDistance: 0
    },
    certification: {
      certificationStatus: 'not_certified',
      certificationNumber: '',
      certificationDate: '',
      expirationDate: '',
      certifyingOrganization: ''
    },
    contactPreferences: {
      allowPublicProfile: true,
      allowDirectMessages: true,
      showEmail: false,
      showPhone: false,
      showAddress: false,
      preferredContactMethod: 'email'
    },
    membership: {
      dateRegistered: new Date().toISOString(),
      includeInDirectory: true
    },
    userId: '' // Will be set when creating the profile
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      console.log('Submitting CHW Profile:', formData);
      
      // Generate a unique ID
      const newId = `chw-${Date.now()}`;
      
      // Create the profile data matching the schema
      const profileData = {
        id: newId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password, // Store hashed in production
        phone: formData.phone || '',
        address: formData.address,
        profilePicture: profilePhoto || '',
        displayName: `${formData.firstName} ${formData.lastName}`,
        userId: newId, // Temporary - should be actual user ID
        professional: {
          headline: formData.professional.headline || '',
          bio: formData.professional.bio || '',
          expertise: formData.professional.expertise || [],
          languages: formData.professional.languages || ['English'],
          availableForOpportunities: formData.professional.availableForOpportunities,
          yearsOfExperience: formData.professional.yearsOfExperience || 0,
          specializations: formData.professional.expertise || []
        },
        serviceArea: {
          region: formData.serviceArea.region || '',
          countiesWorkedIn: formData.serviceArea.countiesWorkedIn || [],
          countyResideIn: formData.serviceArea.primaryCounty || '',
          currentOrganization: formData.professional.currentOrganization,
          role: formData.professional.currentPosition
        },
        certification: {
          certificationNumber: formData.certification.certificationNumber || '',
          certificationStatus: formData.certification.certificationStatus || 'not_certified',
          certificationExpiration: formData.certification.expirationDate
        },
        contactPreferences: {
          allowDirectMessages: formData.contactPreferences.allowDirectMessages,
          showEmail: formData.contactPreferences.showEmail,
          showPhone: formData.contactPreferences.showPhone,
          showAddress: formData.contactPreferences.showAddress || false
        },
        membership: {
          dateRegistered: new Date().toISOString(),
          includeInDirectory: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage for now (since we're using mock data)
      const existingProfiles = JSON.parse(localStorage.getItem('chwProfiles') || '[]');
      existingProfiles.push(profileData);
      localStorage.setItem('chwProfiles', JSON.stringify(existingProfiles));
      
      console.log('Profile saved:', profileData);
      
      // Send thank you email
      try {
        await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName
          }),
        });
        console.log('Welcome email sent');
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't block registration if email fails
      }
      
      // Call onComplete callback
      onComplete(newId);
    } catch (error) {
      console.error('Error creating CHW profile:', error);
      alert('Error creating profile. Please try again.');
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleExpertiseChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateNestedField('professional', 'expertise', typeof value === 'string' ? value.split(',') : value);
  };

  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateNestedField('professional', 'languages', typeof value === 'string' ? value.split(',') : value);
  };

  const handleCountiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateNestedField('serviceArea', 'countiesWorkedIn', typeof value === 'string' ? value.split(',') : value);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Let's start with your basic information
              </Typography>
            </Grid>
            
            {/* Profile Photo Upload */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Profile Photo
                </Typography>
                {profilePhoto ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={profilePhoto}
                      sx={{ width: 150, height: 150, mb: 2 }}
                    />
                    <Button
                      size="small"
                      onClick={() => {
                        setProfilePhoto('');
                        setPhotoFile(null);
                      }}
                    >
                      Remove Photo
                    </Button>
                  </Box>
                ) : (
                  <Avatar sx={{ width: 150, height: 150, mb: 2, bgcolor: 'grey.300' }}>
                    <Typography variant="h3">📷</Typography>
                  </Avatar>
                )}
                <Button
                  variant="outlined"
                  component="label"
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Max size: 5MB. Formats: JPG, PNG, GIF
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="(555) 555-5555"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address?.street}
                onChange={(e) => updateNestedField('address', 'street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address?.city}
                onChange={(e) => updateNestedField('address', 'city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.address?.state}
                onChange={(e) => updateNestedField('address', 'state', e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.address?.zipCode}
                onChange={(e) => updateNestedField('address', 'zipCode', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 1: // Professional Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tell us about your professional background
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Headline"
                value={formData.professional?.headline}
                onChange={(e) => updateNestedField('professional', 'headline', e.target.value)}
                placeholder="e.g., Certified Community Health Worker specializing in Diabetes Care"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Professional Bio"
                value={formData.professional?.bio}
                onChange={(e) => updateNestedField('professional', 'bio', e.target.value)}
                placeholder="Tell us about your experience and passion for community health work..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Organization"
                value={formData.professional?.currentOrganization}
                onChange={(e) => updateNestedField('professional', 'currentOrganization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Position"
                value={formData.professional?.currentPosition}
                onChange={(e) => updateNestedField('professional', 'currentPosition', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Years of Experience"
                value={formData.professional?.yearsOfExperience}
                onChange={(e) => updateNestedField('professional', 'yearsOfExperience', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.professional?.availableForOpportunities}
                    onChange={(e) => updateNestedField('professional', 'availableForOpportunities', e.target.checked)}
                  />
                }
                label="Available for New Opportunities"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Areas of Expertise</InputLabel>
                <Select
                  multiple
                  value={formData.professional?.expertise || []}
                  onChange={handleExpertiseChange}
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
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Languages Spoken</InputLabel>
                <Select
                  multiple
                  value={formData.professional?.languages || ['English']}
                  onChange={handleLanguagesChange}
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
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2: // Certification & Training
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Certification and Training Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Certification Status</InputLabel>
                <Select
                  value={formData.certification?.certificationStatus || 'none'}
                  onChange={(e) => updateNestedField('certification', 'certificationStatus', e.target.value)}
                  label="Certification Status"
                >
                  <MenuItem value="none">Not Certified</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="certified">Certified</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.certification?.certificationStatus === 'certified' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Certification Number"
                    value={formData.certification?.certificationNumber}
                    onChange={(e) => updateNestedField('certification', 'certificationNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Certifying Organization"
                    value={formData.certification?.certifyingOrganization}
                    onChange={(e) => updateNestedField('certification', 'certifyingOrganization', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Certification Date"
                    value={formData.certification?.certificationDate}
                    onChange={(e) => updateNestedField('certification', 'certificationDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expiration Date"
                    value={formData.certification?.expirationDate}
                    onChange={(e) => updateNestedField('certification', 'expirationDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 3: // Service Area
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Where do you provide services?
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Primary County</InputLabel>
                <Select
                  value={formData.serviceArea?.primaryCounty || ''}
                  onChange={(e) => updateNestedField('serviceArea', 'primaryCounty', e.target.value)}
                  label="Primary County"
                >
                  {NC_COUNTIES.map((county) => (
                    <MenuItem key={county} value={county}>
                      {county}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                value={formData.serviceArea?.region}
                onChange={(e) => updateNestedField('serviceArea', 'region', e.target.value)}
                placeholder="e.g., Region 5"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Counties Worked In</InputLabel>
                <Select
                  multiple
                  value={formData.serviceArea?.countiesWorkedIn || []}
                  onChange={handleCountiesChange}
                  input={<OutlinedInput label="Counties Worked In" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {NC_COUNTIES.map((county) => (
                    <MenuItem key={county} value={county}>
                      {county}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.serviceArea?.willingToTravel}
                    onChange={(e) => updateNestedField('serviceArea', 'willingToTravel', e.target.checked)}
                  />
                }
                label="Willing to Travel"
              />
            </Grid>
            {formData.serviceArea?.willingToTravel && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Travel Distance (miles)"
                  value={formData.serviceArea?.maxTravelDistance}
                  onChange={(e) => updateNestedField('serviceArea', 'maxTravelDistance', parseInt(e.target.value) || 0)}
                />
              </Grid>
            )}
          </Grid>
        );

      case 4: // Contact Preferences
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                How would you like to be contacted?
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.contactPreferences?.allowPublicProfile}
                    onChange={(e) => updateNestedField('contactPreferences', 'allowPublicProfile', e.target.checked)}
                  />
                }
                label="Allow Public Profile (visible in directory)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.contactPreferences?.allowDirectMessages}
                    onChange={(e) => updateNestedField('contactPreferences', 'allowDirectMessages', e.target.checked)}
                  />
                }
                label="Allow Direct Messages"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.contactPreferences?.showEmail}
                    onChange={(e) => updateNestedField('contactPreferences', 'showEmail', e.target.checked)}
                  />
                }
                label="Show Email in Public Profile"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.contactPreferences?.showPhone}
                    onChange={(e) => updateNestedField('contactPreferences', 'showPhone', e.target.checked)}
                  />
                }
                label="Show Phone in Public Profile"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={formData.contactPreferences?.preferredContactMethod || 'email'}
                  onChange={(e) => updateNestedField('contactPreferences', 'preferredContactMethod', e.target.value)}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text Message</MenuItem>
                  <MenuItem value="any">Any Method</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 5: // Review & Submit
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Information
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Please review the information below before submitting.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {formData.phone || 'Not provided'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>Professional Details</Typography>
                <Typography variant="body2">
                  <strong>Organization:</strong> {formData.professional?.currentOrganization || 'Not provided'}
                </Typography>
                <Typography variant="body2">
                  <strong>Experience:</strong> {formData.professional?.yearsOfExperience} years
                </Typography>
                <Typography variant="body2">
                  <strong>Expertise:</strong> {formData.professional?.expertise?.join(', ') || 'None selected'}
                </Typography>
                <Typography variant="body2">
                  <strong>Languages:</strong> {formData.professional?.languages?.join(', ')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>Service Area</Typography>
                <Typography variant="body2">
                  <strong>Primary County:</strong> {formData.serviceArea?.primaryCounty || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Counties Served:</strong> {formData.serviceArea?.countiesWorkedIn?.join(', ') || 'None selected'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Register As A Community Health Worker
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, mb: 3 }}>
        {renderStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
