'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { 
  OrganizationBasicInfoForm,
  OrganizationContactForm,
  OrganizationServicesForm
} from '@/components/Organization/Registration';

// Temporary placeholder components until the real ones are implemented
const OrganizationVerificationForm = ({ data, onChange }: any) => (
  <Box>
    <Typography variant="h6" gutterBottom>Verification Information</Typography>
    <Typography>This component is under development. Please click Next to continue.</Typography>
    <Box sx={{ mt: 2 }}>
      <Button 
        variant="contained" 
        onClick={() => onChange({ termsAccepted: true, privacyAccepted: true })}
      >
        Accept Terms & Privacy Policy
      </Button>
    </Box>
  </Box>
);

const OrganizationReviewForm = ({ data }: any) => (
  <Box>
    <Typography variant="h6" gutterBottom>Review Your Information</Typography>
    <Typography paragraph>Please review your organization information before submitting.</Typography>
    <Typography variant="subtitle1">Organization Name:</Typography>
    <Typography paragraph>{data.name || 'Not provided'}</Typography>
    <Typography variant="subtitle1">Email:</Typography>
    <Typography paragraph>{data.email || 'Not provided'}</Typography>
  </Box>
);

// Step components will be imported from separate files

const steps = [
  'Basic Information',
  'Contact Details',
  'Services & Areas',
  'Verification',
  'Review & Submit'
];

function NonprofitRegistrationContent() {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    mission: '',
    legalStatus: 'nonprofit',
    foundingYear: new Date().getFullYear(),
    size: 'small',
    budget: 'under100k',
    taxId: '',
    
    // Contact Details
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      county: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: true },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    
    // Services & Areas
    serviceCategories: [],
    serviceAreas: [],
    eligibilityCriteria: '',
    applicationProcess: '',
    primaryLanguages: ['English'],
    accessibilityOptions: [],
    insuranceAccepted: [],
    paymentOptions: [],
    capacity: {
      currentCapacity: 0,
      maxCapacity: 0,
      acceptingReferrals: true
    },
    
    // Verification
    logo: '',
    coverImage: '',
    verificationDocuments: [],
    termsAccepted: false,
    privacyAccepted: false,
    
    // Admin User
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const validateCurrentStep = () => {
    setError(null);
    
    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.name || !formData.description || !formData.mission) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
        
      case 1: // Contact Details
        if (!formData.email || !formData.phone || !formData.address.street || 
            !formData.address.city || !formData.address.state || !formData.address.zipCode) {
          setError('Please fill in all required contact information');
          return false;
        }
        break;
        
      case 2: // Services & Areas
        if (formData.serviceCategories.length === 0 || formData.serviceAreas.length === 0) {
          setError('Please select at least one service category and service area');
          return false;
        }
        break;
        
      case 3: // Verification
        if (!formData.termsAccepted || !formData.privacyAccepted) {
          setError('You must accept the terms and privacy policy to continue');
          return false;
        }
        break;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This would be replaced with actual API calls to:
      // 1. Create the organization in Firestore
      // 2. Upload any images/documents to storage
      // 3. Create admin user account if needed
      // 4. Send verification email
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <OrganizationBasicInfoForm 
            data={formData} 
            onChange={(data) => handleChange('basicInfo', data)} 
          />
        );
      case 1:
        return (
          <OrganizationContactForm 
            data={formData} 
            onChange={(data) => handleChange('contactDetails', data)} 
          />
        );
      case 2:
        return (
          <OrganizationServicesForm 
            data={formData} 
            onChange={(data) => handleChange('services', data)} 
          />
        );
      case 3:
        return (
          <OrganizationVerificationForm 
            data={formData} 
            onChange={(data) => handleChange('verification', data)} 
          />
        );
      case 4:
        return (
          <OrganizationReviewForm 
            data={formData} 
          />
        );
      default:
        return 'Unknown step';
    }
  };
  
  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>Registration Successful!</Typography>
          <Typography variant="body1" paragraph>
            Thank you for registering your organization with CHWOne. Your registration has been submitted and is pending approval.
          </Typography>
          <Typography variant="body1" paragraph>
            You will receive an email confirmation with further instructions. Our team will review your information and may contact you if additional details are needed.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="/"
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Nonprofit Organization Registration
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Register your nonprofit organization to access CHWOne's referral network, post job opportunities, and share events.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default function NonprofitRegistrationPage() {
  return (
    <AuthProvider>
      <NonprofitRegistrationContent />
    </AuthProvider>
  );
}
