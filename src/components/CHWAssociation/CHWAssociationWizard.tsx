'use client';

import React, { useState } from 'react';
import {
  Box, Stepper, Step, StepLabel, Button, Typography, Paper, TextField,
  Grid, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput,
  SelectChangeEvent, FormControlLabel, Checkbox, FormGroup
} from '@mui/material';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface CHWAssociationWizardProps {
  onComplete: (associationId: string) => void;
}

const steps = [
  'Association Information',
  'Leadership & Contact',
  'Service Area & Coverage',
  'Programs & Services',
  'Membership & Structure',
  'Review & Submit'
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const PROGRAM_TYPES = [
  'CHW Training & Certification',
  'Continuing Education',
  'Professional Development',
  'Networking Events',
  'Advocacy & Policy',
  'Research & Data Collection',
  'Resource Coordination',
  'Quality Assurance',
  'Mentorship Programs',
  'Community Outreach',
  'Grant Writing Support',
  'Technical Assistance'
];

const MEMBERSHIP_TIERS = [
  'Individual CHW Members',
  'Organizational Members',
  'Student Members',
  'Associate Members',
  'Honorary Members'
];

export function CHWAssociationWizard({ onComplete }: CHWAssociationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    associationName: '',
    acronym: '',
    state: 'North Carolina',
    yearFounded: '',
    ein: '',
    mission: '',
    vision: '',
    website: '',
    
    executiveDirectorName: '',
    executiveDirectorEmail: '',
    executiveDirectorPhone: '',
    boardChairName: '',
    boardChairEmail: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    mailingAddress: {
      street: '',
      city: '',
      state: 'North Carolina',
      zipCode: ''
    },
    
    statewideCoverage: true,
    regionsServed: [],
    countiesServed: [],
    
    programsOffered: [],
    certificationProgram: false,
    trainingProgram: false,
    advocacyActivities: '',
    partnerOrganizations: '',
    
    membershipTiers: [],
    currentMemberCount: 0,
    chwMemberCount: 0,
    organizationalMemberCount: 0,
    annualMembershipFee: '',
    governanceStructure: '',
    
    dataSharing: false,
    collaboration: false,
    termsAccepted: false
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
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
      console.log('CHW Association registration data:', formData);
      
      // Generate association ID based on state abbreviation
      const stateAbbr = US_STATES.find(s => s === formData.state)?.substring(0, 2).toUpperCase() || 'XX';
      const timestamp = Date.now();
      const associationId = `assoc-${stateAbbr.toLowerCase()}-${timestamp}`;
      
      // Create association data for Firestore
      const associationData = {
        id: associationId,
        name: formData.associationName,
        acronym: formData.acronym,
        state: formData.state,
        stateId: `state-${stateAbbr.toLowerCase()}`,
        yearFounded: parseInt(formData.yearFounded) || new Date().getFullYear(),
        ein: formData.ein,
        mission: formData.mission,
        vision: formData.vision,
        website: formData.website,
        
        leadership: {
          executiveDirector: {
            name: formData.executiveDirectorName,
            email: formData.executiveDirectorEmail,
            phone: formData.executiveDirectorPhone
          },
          boardChair: {
            name: formData.boardChairName,
            email: formData.boardChairEmail
          },
          primaryContact: {
            name: formData.primaryContactName,
            email: formData.primaryContactEmail,
            phone: formData.primaryContactPhone
          }
        },
        
        mailingAddress: formData.mailingAddress,
        
        serviceArea: {
          statewideCoverage: formData.statewideCoverage,
          regionsServed: formData.regionsServed,
          countiesServed: formData.countiesServed
        },
        
        programs: {
          programsOffered: formData.programsOffered,
          certificationProgram: formData.certificationProgram,
          trainingProgram: formData.trainingProgram,
          advocacyActivities: formData.advocacyActivities,
          partnerOrganizations: formData.partnerOrganizations
        },
        
        membership: {
          membershipTiers: formData.membershipTiers,
          currentMemberCount: formData.currentMemberCount,
          chwMemberCount: formData.chwMemberCount,
          organizationalMemberCount: formData.organizationalMemberCount,
          annualMembershipFee: formData.annualMembershipFee,
          governanceStructure: formData.governanceStructure
        },
        
        status: 'pending', // Pending admin approval
        approvalStatus: 'pending',
        isActive: false,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        metadata: {
          dataSharing: formData.dataSharing,
          collaboration: formData.collaboration,
          termsAccepted: formData.termsAccepted
        }
      };
      
      // Save association to Firestore
      const associationRef = doc(db, 'chw-associations', associationId);
      await setDoc(associationRef, associationData);
      console.log('CHW Association saved to Firestore:', associationId);
      
      // Update the state record to link to this association
      const stateRef = doc(db, 'states', `state-${stateAbbr.toLowerCase()}`);
      await updateDoc(stateRef, {
        hasAssociation: true,
        associationId: associationId,
        associationName: formData.associationName,
        updatedAt: serverTimestamp()
      });
      console.log('State record updated with association link');
      
      onComplete(associationId);
    } catch (error) {
      console.error('Error registering association:', error);
      alert('Failed to register association. Please try again.');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Association Information</Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Association Name" value={formData.associationName}
                onChange={(e) => handleChange('associationName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Acronym" value={formData.acronym}
                onChange={(e) => handleChange('acronym', e.target.value)} placeholder="e.g., NCCHWA" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select value={formData.state} label="State"
                  onChange={(e) => handleChange('state', e.target.value)}>
                  {US_STATES.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Year Founded" type="number" value={formData.yearFounded}
                onChange={(e) => handleChange('yearFounded', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="EIN (Tax ID)" value={formData.ein}
                onChange={(e) => handleChange('ein', e.target.value)} placeholder="XX-XXXXXXX" required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Website" value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)} placeholder="https://www.example.org" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Mission Statement" value={formData.mission}
                onChange={(e) => handleChange('mission', e.target.value)} multiline rows={3} required
                helperText="Describe your association's mission and purpose" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Vision Statement" value={formData.vision}
                onChange={(e) => handleChange('vision', e.target.value)} multiline rows={2}
                helperText="Your long-term vision for CHWs in your state" />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Leadership & Contact Information</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Executive Director</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Name" value={formData.executiveDirectorName}
                onChange={(e) => handleChange('executiveDirectorName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Email" type="email" value={formData.executiveDirectorEmail}
                onChange={(e) => handleChange('executiveDirectorEmail', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Phone" value={formData.executiveDirectorPhone}
                onChange={(e) => handleChange('executiveDirectorPhone', e.target.value)} required />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Board Chair</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Name" value={formData.boardChairName}
                onChange={(e) => handleChange('boardChairName', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={formData.boardChairEmail}
                onChange={(e) => handleChange('boardChairEmail', e.target.value)} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Primary Contact</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Name" value={formData.primaryContactName}
                onChange={(e) => handleChange('primaryContactName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Email" type="email" value={formData.primaryContactEmail}
                onChange={(e) => handleChange('primaryContactEmail', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Phone" value={formData.primaryContactPhone}
                onChange={(e) => handleChange('primaryContactPhone', e.target.value)} required />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Mailing Address</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Street Address" value={formData.mailingAddress.street}
                onChange={(e) => handleChange('mailingAddress.street', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="City" value={formData.mailingAddress.city}
                onChange={(e) => handleChange('mailingAddress.city', e.target.value)} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="State" value={formData.mailingAddress.state}
                onChange={(e) => handleChange('mailingAddress.state', e.target.value)} required disabled />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="ZIP Code" value={formData.mailingAddress.zipCode}
                onChange={(e) => handleChange('mailingAddress.zipCode', e.target.value)} required />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Service Area & Coverage</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={formData.statewideCoverage}
                  onChange={(e) => handleChange('statewideCoverage', e.target.checked)} />}
                label="We serve the entire state" />
            </Grid>
            {!formData.statewideCoverage && (
              <Grid item xs={12}>
                <TextField fullWidth label="Regions/Counties Served" value={formData.regionsServed.join(', ')}
                  onChange={(e) => handleChange('regionsServed', e.target.value.split(',').map((s: string) => s.trim()))}
                  multiline rows={2} helperText="List regions or counties separated by commas" />
              </Grid>
            )}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Programs & Services</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Programs Offered</InputLabel>
                <Select multiple name="programsOffered" value={formData.programsOffered}
                  onChange={handleMultiSelectChange} input={<OutlinedInput label="Programs Offered" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}>
                  {PROGRAM_TYPES.map((program) => (
                    <MenuItem key={program} value={program}>{program}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Checkbox checked={formData.certificationProgram}
                  onChange={(e) => handleChange('certificationProgram', e.target.checked)} />}
                label="We offer CHW Certification" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Checkbox checked={formData.trainingProgram}
                  onChange={(e) => handleChange('trainingProgram', e.target.checked)} />}
                label="We provide CHW Training" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Advocacy Activities" value={formData.advocacyActivities}
                onChange={(e) => handleChange('advocacyActivities', e.target.value)} multiline rows={3}
                helperText="Describe your advocacy and policy work" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Partner Organizations" value={formData.partnerOrganizations}
                onChange={(e) => handleChange('partnerOrganizations', e.target.value)} multiline rows={2}
                helperText="List key partner organizations" />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Membership & Structure</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Membership Tiers</InputLabel>
                <Select multiple name="membershipTiers" value={formData.membershipTiers}
                  onChange={handleMultiSelectChange} input={<OutlinedInput label="Membership Tiers" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <MenuItem key={tier} value={tier}>{tier}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Total Members" type="number" value={formData.currentMemberCount}
                onChange={(e) => handleChange('currentMemberCount', parseInt(e.target.value) || 0)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="CHW Members" type="number" value={formData.chwMemberCount}
                onChange={(e) => handleChange('chwMemberCount', parseInt(e.target.value) || 0)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Organizational Members" type="number" value={formData.organizationalMemberCount}
                onChange={(e) => handleChange('organizationalMemberCount', parseInt(e.target.value) || 0)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Annual Membership Fee Structure" value={formData.annualMembershipFee}
                onChange={(e) => handleChange('annualMembershipFee', e.target.value)}
                helperText="e.g., Individual: $50, Organization: $250" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Governance Structure" value={formData.governanceStructure}
                onChange={(e) => handleChange('governanceStructure', e.target.value)} multiline rows={3}
                helperText="Describe your board structure and decision-making process" />
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Review & Submit</Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Association Information</Typography>
                <Typography variant="body2"><strong>Name:</strong> {formData.associationName}</Typography>
                <Typography variant="body2"><strong>State:</strong> {formData.state}</Typography>
                <Typography variant="body2"><strong>Year Founded:</strong> {formData.yearFounded}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={formData.dataSharing}
                    onChange={(e) => handleChange('dataSharing', e.target.checked)} required />}
                  label="I agree to share association information in the CHWOne directory" />
                <FormControlLabel
                  control={<Checkbox checked={formData.collaboration}
                    onChange={(e) => handleChange('collaboration', e.target.checked)} required />}
                  label="I agree to collaborate with other state associations through CHWOne" />
                <FormControlLabel
                  control={<Checkbox checked={formData.termsAccepted}
                    onChange={(e) => handleChange('termsAccepted', e.target.checked)} required />}
                  label="I accept the CHWOne Terms of Service" />
              </FormGroup>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0: return formData.associationName && formData.state && formData.yearFounded && formData.ein && formData.mission;
      case 1: return formData.executiveDirectorName && formData.executiveDirectorEmail && formData.primaryContactName && formData.mailingAddress.street;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      case 5: return formData.dataSharing && formData.collaboration && formData.termsAccepted;
      default: return false;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      <Paper sx={{ p: 3, minHeight: 400 }}>{renderStepContent(activeStep)}</Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit} disabled={!isStepValid()}>Submit Registration</Button>
          ) : (
            <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>Next</Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
