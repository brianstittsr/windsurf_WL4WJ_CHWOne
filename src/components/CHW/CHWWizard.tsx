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
  Avatar,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Fade,
  Slide
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Email, Login } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { CHWProfile } from '@/types/chw-profile.types';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema/unified-schema';

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

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function CHWWizard({ onComplete }: CHWWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
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
      additionalExpertise: '', // New field for other experiences
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
      
      // Create Firebase Authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      console.log('Firebase user created:', user.uid);
      
      // Create user profile in Firestore users collection
      const userProfileData = {
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: 'CHW', // Community Health Worker role
        organizationType: 'CHW',
        phone: formData.phone || '',
        address: formData.address,
        profilePicture: profilePhoto || '',
        status: 'pending', // Pending admin approval
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        permissions: {
          canAccessDashboard: true,
          canManageClients: true,
          canCreateReferrals: true,
          canAccessResources: true,
          canUseForms: true,
          canViewReports: true
        }
      };
      
      // Save to users collection
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfileData);
      console.log('User profile saved to Firestore users collection');
      
      // Create CHW profile data
      const chwProfileData = {
        id: user.uid,
        userId: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address,
        profilePicture: profilePhoto || '',
        displayName: `${formData.firstName} ${formData.lastName}`,
        professional: {
          headline: formData.professional.headline || '',
          bio: formData.professional.bio || '',
          expertise: formData.professional.expertise || [],
          additionalExpertise: formData.professional.additionalExpertise || '',
          languages: formData.professional.languages || ['English'],
          availableForOpportunities: formData.professional.availableForOpportunities,
          yearsOfExperience: formData.professional.yearsOfExperience || 0,
          specializations: formData.professional.expertise || [],
          currentOrganization: formData.professional.currentOrganization || '',
          currentPosition: formData.professional.currentPosition || ''
        },
        serviceArea: {
          region: formData.serviceArea.region || '',
          countiesWorkedIn: formData.serviceArea.countiesWorkedIn || [],
          countyResideIn: formData.serviceArea.primaryCounty || '',
          primaryCounty: formData.serviceArea.primaryCounty || '',
          currentOrganization: formData.professional.currentOrganization,
          role: formData.professional.currentPosition
        },
        certification: {
          certificationNumber: formData.certification.certificationNumber || '',
          certificationStatus: formData.certification.certificationStatus || 'not_certified',
          certificationExpiration: formData.certification.expirationDate,
          expirationDate: formData.certification.expirationDate
        },
        contactPreferences: {
          allowDirectMessages: formData.contactPreferences.allowDirectMessages,
          showEmail: formData.contactPreferences.showEmail,
          showPhone: formData.contactPreferences.showPhone,
          showAddress: formData.contactPreferences.showAddress || false
        },
        membership: {
          dateRegistered: serverTimestamp(),
          includeInDirectory: true
        },
        status: 'pending', // Pending admin approval
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Save CHW profile to chwProfiles collection
      await setDoc(doc(db, COLLECTIONS.CHW_PROFILES, user.uid), chwProfileData);
      console.log('CHW profile saved to Firestore chwProfiles collection');
      
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
      
      // Store email and show success modal
      setRegisteredEmail(formData.email);
      setShowSuccessModal(true);
      
      // Call onComplete callback after a delay
      setTimeout(() => {
        onComplete(user.uid);
      }, 3000);
    } catch (error: any) {
      console.error('Error creating CHW profile:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email address. Please check and try again.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password is too weak. Please use a stronger password.');
      } else {
        alert('Error creating profile. Please try again.');
      }
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
                name="email"
                autoComplete="email"
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
                type={showPassword ? 'text' : 'password'}
                label="Password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : "Re-enter your password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Expertise"
                value={formData.professional?.additionalExpertise || ''}
                onChange={(e) => updateNestedField('professional', 'additionalExpertise', e.target.value)}
                placeholder="Describe any other skills, experiences, or areas of expertise not listed above..."
                helperText="Share additional qualifications, certifications, or unique experiences that make you stand out"
              />
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

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'visible',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'visible' }}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: 4,
            position: 'relative'
          }}>
            {/* Success Icon with Animation */}
            <Fade in={showSuccessModal} timeout={800}>
              <Box sx={{ 
                position: 'relative',
                display: 'inline-block',
                mb: 3
              }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'translate(-50%, -50%) scale(1)',
                        opacity: 1,
                      },
                      '100%': {
                        transform: 'translate(-50%, -50%) scale(1.5)',
                        opacity: 0,
                      },
                    },
                  }}
                />
                <CheckCircle 
                  sx={{ 
                    fontSize: 100, 
                    color: 'white',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                  }} 
                />
              </Box>
            </Fade>

            {/* Success Message */}
            <Fade in={showSuccessModal} timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Registration Successful! 🎉
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)', 
                    mb: 4,
                    fontWeight: 400
                  }}
                >
                  Thank you for joining our community!
                </Typography>
              </Box>
            </Fade>

            {/* Information Cards */}
            <Fade in={showSuccessModal} timeout={1000} style={{ transitionDelay: '400ms' }}>
              <Box sx={{ mb: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ color: '#667eea', mr: 1.5, fontSize: 28 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                      Welcome Email Sent
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', ml: 5 }}>
                    A confirmation email has been sent to:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#667eea', 
                      fontWeight: 600,
                      ml: 5,
                      mt: 0.5
                    }}
                  >
                    {registeredEmail}
                  </Typography>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Login sx={{ color: '#764ba2', mr: 1.5, fontSize: 28 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                      Ready to Get Started
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', ml: 5 }}>
                    You can now log in with your credentials and access your CHW dashboard.
                  </Typography>
                </Paper>
              </Box>
            </Fade>

            {/* Auto-close message */}
            <Fade in={showSuccessModal} timeout={1000} style={{ transitionDelay: '600ms' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'block',
                  mt: 2
                }}
              >
                This window will close automatically in a few seconds...
              </Typography>
            </Fade>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
