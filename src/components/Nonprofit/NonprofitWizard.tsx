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
  Checkbox,
  FormGroup
} from '@mui/material';

interface NonprofitWizardProps {
  onComplete: (nonprofitId: string) => void;
}

const steps = [
  'Organization Information',
  'Contact Details',
  'Services & Resources',
  'Service Area',
  'Verification',
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

const SERVICE_CATEGORIES = [
  'Healthcare Services',
  'Mental Health Services',
  'Substance Abuse Treatment',
  'Housing Assistance',
  'Food Security',
  'Transportation',
  'Employment Services',
  'Education & Training',
  'Legal Services',
  'Financial Assistance',
  'Childcare Services',
  'Senior Services',
  'Disability Services',
  'Crisis Intervention',
  'Community Health Programs'
];

const ORGANIZATION_TYPES = [
  '501(c)(3) Nonprofit',
  'Faith-Based Organization',
  'Community Health Center',
  'Hospital/Health System',
  'Government Agency',
  'Community-Based Organization',
  'Foundation',
  'Other'
];

export function NonprofitWizard({ onComplete }: NonprofitWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    // Organization Information
    organizationName: '',
    organizationType: '',
    ein: '',
    yearEstablished: '',
    mission: '',
    website: '',
    
    // Contact Details
    primaryContactName: '',
    primaryContactTitle: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    organizationPhone: '',
    organizationEmail: '',
    address: {
      street: '',
      city: '',
      state: 'NC',
      zipCode: ''
    },
    
    // Services & Resources
    serviceCategories: [],
    servicesDescription: '',
    eligibilityCriteria: '',
    operatingHours: '',
    acceptsReferrals: true,
    referralProcess: '',
    
    // Service Area
    serviceCounties: [],
    statewideCoverage: false,
    
    // Verification
    nonprofitStatus: false,
    dataSharing: false,
    termsAccepted: false
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
    const { name, value } = event.target;
    setFormData((prev: any) => ({
      ...prev,
      [name as string]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async () => {
    try {
      // In a real implementation, this would save to Firestore
      console.log('Nonprofit registration data:', formData);
      
      // Simulate API call
      const nonprofitId = `nonprofit-${Date.now()}`;
      
      // Call completion handler
      onComplete(nonprofitId);
    } catch (error) {
      console.error('Error registering nonprofit:', error);
      alert('Failed to register nonprofit. Please try again.');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Organization Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tell us about your organization
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.organizationName}
                onChange={(e) => handleChange('organizationName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Organization Type</InputLabel>
                <Select
                  value={formData.organizationType}
                  label="Organization Type"
                  onChange={(e) => handleChange('organizationType', e.target.value)}
                >
                  {ORGANIZATION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="EIN (Tax ID)"
                value={formData.ein}
                onChange={(e) => handleChange('ein', e.target.value)}
                placeholder="XX-XXXXXXX"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year Established"
                type="number"
                value={formData.yearEstablished}
                onChange={(e) => handleChange('yearEstablished', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.example.org"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mission Statement"
                value={formData.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                multiline
                rows={4}
                required
                helperText="Describe your organization's mission and purpose"
              />
            </Grid>
          </Grid>
        );

      case 1: // Contact Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Primary Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person Name"
                value={formData.primaryContactName}
                onChange={(e) => handleChange('primaryContactName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person Title"
                value={formData.primaryContactTitle}
                onChange={(e) => handleChange('primaryContactTitle', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) => handleChange('primaryContactEmail', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.primaryContactPhone}
                onChange={(e) => handleChange('primaryContactPhone', e.target.value)}
                placeholder="(XXX) XXX-XXXX"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Organization Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization Phone"
                value={formData.organizationPhone}
                onChange={(e) => handleChange('organizationPhone', e.target.value)}
                placeholder="(XXX) XXX-XXXX"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization Email"
                type="email"
                value={formData.organizationEmail}
                onChange={(e) => handleChange('organizationEmail', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address.zipCode', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 2: // Services & Resources
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Services and Resources Offered
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Service Categories</InputLabel>
                <Select
                  multiple
                  name="serviceCategories"
                  value={formData.serviceCategories}
                  onChange={handleMultiSelectChange}
                  input={<OutlinedInput label="Service Categories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {SERVICE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Services Description"
                value={formData.servicesDescription}
                onChange={(e) => handleChange('servicesDescription', e.target.value)}
                multiline
                rows={4}
                required
                helperText="Describe the services and resources your organization provides"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Eligibility Criteria"
                value={formData.eligibilityCriteria}
                onChange={(e) => handleChange('eligibilityCriteria', e.target.value)}
                multiline
                rows={3}
                helperText="Who is eligible for your services? (e.g., income requirements, geographic restrictions)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Operating Hours"
                value={formData.operatingHours}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                placeholder="e.g., Monday-Friday 9AM-5PM"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptsReferrals}
                    onChange={(e) => handleChange('acceptsReferrals', e.target.checked)}
                  />
                }
                label="We accept referrals from CHWs and other organizations"
              />
            </Grid>
            {formData.acceptsReferrals && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Referral Process"
                  value={formData.referralProcess}
                  onChange={(e) => handleChange('referralProcess', e.target.value)}
                  multiline
                  rows={3}
                  helperText="How should CHWs and organizations refer clients to your services?"
                />
              </Grid>
            )}
          </Grid>
        );

      case 3: // Service Area
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Service Area
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.statewideCoverage}
                    onChange={(e) => handleChange('statewideCoverage', e.target.checked)}
                  />
                }
                label="We provide services statewide across North Carolina"
              />
            </Grid>
            {!formData.statewideCoverage && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Counties Served</InputLabel>
                  <Select
                    multiple
                    name="serviceCounties"
                    value={formData.serviceCounties}
                    onChange={handleMultiSelectChange}
                    input={<OutlinedInput label="Counties Served" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
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
            )}
          </Grid>
        );

      case 4: // Verification
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Verification & Agreements
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.nonprofitStatus}
                      onChange={(e) => handleChange('nonprofitStatus', e.target.checked)}
                      required
                    />
                  }
                  label="I certify that this organization is a registered nonprofit or eligible organization"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.dataSharing}
                      onChange={(e) => handleChange('dataSharing', e.target.checked)}
                      required
                    />
                  }
                  label="I agree to share our organization's information in the CHWOne resource directory"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.termsAccepted}
                      onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                      required
                    />
                  }
                  label="I accept the CHWOne Terms of Service and Privacy Policy"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> Your organization's registration will be reviewed by our team. 
                  You will receive an email notification once your organization has been approved. 
                  This typically takes 1-2 business days.
                </Typography>
              </Paper>
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
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Organization Information
                </Typography>
                <Typography variant="body2"><strong>Name:</strong> {formData.organizationName}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {formData.organizationType}</Typography>
                <Typography variant="body2"><strong>EIN:</strong> {formData.ein}</Typography>
                <Typography variant="body2"><strong>Year Established:</strong> {formData.yearEstablished}</Typography>
                <Typography variant="body2"><strong>Website:</strong> {formData.website}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body2"><strong>Primary Contact:</strong> {formData.primaryContactName} ({formData.primaryContactTitle})</Typography>
                <Typography variant="body2"><strong>Email:</strong> {formData.primaryContactEmail}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {formData.primaryContactPhone}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {formData.address.street}, {formData.address.city}, {formData.address.state} {formData.address.zipCode}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Services & Resources
                </Typography>
                <Typography variant="body2"><strong>Categories:</strong></Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, mb: 1 }}>
                  {formData.serviceCategories.map((cat: string) => (
                    <Chip key={cat} label={cat} size="small" />
                  ))}
                </Box>
                <Typography variant="body2"><strong>Accepts Referrals:</strong> {formData.acceptsReferrals ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2"><strong>Operating Hours:</strong> {formData.operatingHours}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Service Area
                </Typography>
                {formData.statewideCoverage ? (
                  <Typography variant="body2">Statewide Coverage (All NC Counties)</Typography>
                ) : (
                  <>
                    <Typography variant="body2"><strong>Counties Served:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {formData.serviceCounties.map((county: string) => (
                        <Chip key={county} label={county} size="small" />
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.organizationName && formData.organizationType && formData.ein && 
               formData.yearEstablished && formData.mission;
      case 1:
        return formData.primaryContactName && formData.primaryContactEmail && 
               formData.primaryContactPhone && formData.organizationPhone && 
               formData.address.street && formData.address.city && formData.address.zipCode;
      case 2:
        return formData.serviceCategories.length > 0 && formData.servicesDescription && 
               formData.operatingHours;
      case 3:
        return formData.statewideCoverage || formData.serviceCounties.length > 0;
      case 4:
        return formData.nonprofitStatus && formData.dataSharing && formData.termsAccepted;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, minHeight: 400 }}>
        {renderStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isStepValid()}
            >
              Submit Registration
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
