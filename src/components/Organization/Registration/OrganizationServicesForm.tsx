'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

interface OrganizationServicesFormProps {
  data: any;
  onChange: (data: any) => void;
}

// Sample service categories - in a real implementation, these would come from an API or database
const serviceCategories = [
  'Housing & Shelter',
  'Food Assistance',
  'Healthcare',
  'Mental Health',
  'Substance Use',
  'Employment',
  'Education',
  'Financial Assistance',
  'Legal Services',
  'Transportation',
  'Childcare',
  'Senior Services',
  'Disability Services',
  'Domestic Violence',
  'Immigration Services',
  'LGBTQ+ Services',
  'Veteran Services',
  'Youth Services',
  'Disaster Relief',
  'Advocacy'
];

// Sample NC counties - in a real implementation, these would come from an API or database
const ncCounties = [
  'Alamance', 'Alexander', 'Alleghany', 'Anson', 'Ashe', 'Avery', 'Beaufort',
  'Bertie', 'Bladen', 'Brunswick', 'Buncombe', 'Burke', 'Cabarrus', 'Caldwell',
  'Camden', 'Carteret', 'Caswell', 'Catawba', 'Chatham', 'Cherokee', 'Chowan',
  'Clay', 'Cleveland', 'Columbus', 'Craven', 'Cumberland', 'Currituck', 'Dare',
  'Davidson', 'Davie', 'Duplin', 'Durham', 'Edgecombe', 'Forsyth', 'Franklin',
  'Gaston', 'Gates', 'Graham', 'Granville', 'Greene', 'Guilford', 'Halifax',
  'Harnett', 'Haywood', 'Henderson', 'Hertford', 'Hoke', 'Hyde', 'Iredell',
  'Jackson', 'Johnston', 'Jones', 'Lee', 'Lenoir', 'Lincoln', 'Macon', 'Madison',
  'Martin', 'McDowell', 'Mecklenburg', 'Mitchell', 'Montgomery', 'Moore', 'Nash',
  'New Hanover', 'Northampton', 'Onslow', 'Orange', 'Pamlico', 'Pasquotank',
  'Pender', 'Perquimans', 'Person', 'Pitt', 'Polk', 'Randolph', 'Richmond',
  'Robeson', 'Rockingham', 'Rowan', 'Rutherford', 'Sampson', 'Scotland', 'Stanly',
  'Stokes', 'Surry', 'Swain', 'Transylvania', 'Tyrrell', 'Union', 'Vance', 'Wake',
  'Warren', 'Washington', 'Watauga', 'Wayne', 'Wilkes', 'Wilson', 'Yadkin', 'Yancey'
];

// Sample languages - in a real implementation, these would come from an API or database
const languages = [
  'English', 'Spanish', 'French', 'Chinese', 'Vietnamese', 'Korean', 'Arabic',
  'Russian', 'Tagalog', 'Portuguese', 'Bengali', 'German', 'Haitian Creole',
  'Italian', 'Japanese', 'Swahili', 'Hindi', 'Urdu', 'Farsi', 'ASL'
];

// Sample accessibility options
const accessibilityOptions = [
  'Wheelchair Accessible',
  'ASL Interpretation',
  'Braille Materials',
  'Audio Description',
  'Screen Reader Compatible',
  'Large Print Materials',
  'Sensory Friendly Environment',
  'Quiet Spaces',
  'Service Animals Welcome',
  'Gender Neutral Bathrooms',
  'Elevator Access',
  'Accessible Parking'
];

// Sample insurance options
const insuranceOptions = [
  'Medicaid',
  'Medicare',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Aetna',
  'Cigna',
  'Humana',
  'Tricare',
  'VA Benefits',
  'Self-Pay',
  'Sliding Scale',
  'No Insurance Required'
];

// Sample payment options
const paymentOptions = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Check',
  'Money Order',
  'Online Payment',
  'PayPal',
  'Venmo',
  'Apple Pay',
  'Google Pay',
  'No Payment Required',
  'Sliding Scale'
];

export default function OrganizationServicesForm({ data, onChange }: OrganizationServicesFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };
  
  const handleMultiSelectChange = (name: string, value: string[]) => {
    onChange({ [name]: value });
  };
  
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target;
    onChange({
      capacity: {
        ...data.capacity,
        [name]: name === 'acceptingReferrals' ? value === 'true' : Number(value)
      }
    });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Services & Service Areas
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Please provide information about the services your organization offers and the areas you serve.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="service-categories"
            options={serviceCategories}
            value={data.serviceCategories}
            onChange={(_, newValue) => handleMultiSelectChange('serviceCategories', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={`service-area-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Service Categories"
                placeholder="Select categories"
                helperText="Select all categories that apply to your organization's services"
                required
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="service-areas"
            options={ncCounties}
            value={data.serviceAreas}
            onChange={(_, newValue) => handleMultiSelectChange('serviceAreas', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={`service-area-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Service Areas"
                placeholder="Select counties"
                helperText="Select all counties where your organization provides services"
                required
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Eligibility Criteria"
            name="eligibilityCriteria"
            value={data.eligibilityCriteria}
            onChange={handleChange}
            multiline
            rows={3}
            helperText="Describe who is eligible for your services (e.g., age, income, location, etc.)"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Application Process"
            name="applicationProcess"
            value={data.applicationProcess}
            onChange={handleChange}
            multiline
            rows={3}
            helperText="Describe how clients can apply for your services"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Service Capacity
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Current Capacity"
                name="currentCapacity"
                value={data.capacity.currentCapacity}
                onChange={handleCapacityChange}
                helperText="Number of clients you can currently serve"
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Capacity"
                name="maxCapacity"
                value={data.capacity.maxCapacity}
                onChange={handleCapacityChange}
                helperText="Maximum number of clients you can serve"
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="accepting-referrals-label">Accepting Referrals</InputLabel>
                <Select
                  labelId="accepting-referrals-label"
                  name="acceptingReferrals"
                  value={data.capacity.acceptingReferrals.toString()}
                  onChange={handleCapacityChange}
                  label="Accepting Referrals"
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
                <FormHelperText>Are you currently accepting new referrals?</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="primary-languages"
            options={languages}
            value={data.primaryLanguages}
            onChange={(_, newValue) => handleMultiSelectChange('primaryLanguages', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={`service-area-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Languages Supported"
                placeholder="Select languages"
                helperText="Select all languages supported by your organization"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="accessibility-options"
            options={accessibilityOptions}
            value={data.accessibilityOptions}
            onChange={(_, newValue) => handleMultiSelectChange('accessibilityOptions', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={`service-area-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Accessibility Options"
                placeholder="Select options"
                helperText="Select all accessibility features available at your organization"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="insurance-accepted"
            options={insuranceOptions}
            value={data.insuranceAccepted}
            onChange={(_, newValue) => handleMultiSelectChange('insuranceAccepted', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={`service-area-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Insurance Accepted"
                placeholder="Select insurance"
                helperText="Select all insurance plans accepted by your organization"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id="payment-options"
            options={paymentOptions}
            value={data.paymentOptions}
            onChange={(_, newValue) => handleMultiSelectChange('paymentOptions', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={`service-area-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Payment Options"
                placeholder="Select options"
                helperText="Select all payment methods accepted by your organization"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
