'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';

interface OrganizationContactFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function OrganizationContactForm({ data, onChange }: OrganizationContactFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      onChange({
        [parent]: {
          ...data[parent],
          [child]: value
        }
      });
    } else {
      onChange({ [name]: value });
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      address: {
        ...data.address,
        [name]: value
      }
    });
  };
  
  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      socialMedia: {
        ...data.socialMedia,
        [name]: value
      }
    });
  };
  
  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    onChange({
      operatingHours: {
        ...data.operatingHours,
        [day]: {
          ...data.operatingHours[day],
          [field]: value
        }
      }
    });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Contact Information
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Please provide contact information for your organization.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
            helperText="Primary contact email for your organization"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            helperText="Primary contact phone number"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Website"
            name="website"
            value={data.website}
            onChange={handleChange}
            helperText="Your organization's website URL"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Physical Address
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Street Address"
                name="street"
                value={data.address.street}
                onChange={handleAddressChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={data.address.city}
                onChange={handleAddressChange}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                required
                fullWidth
                label="State"
                name="state"
                value={data.address.state}
                onChange={handleAddressChange}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                required
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={data.address.zipCode}
                onChange={handleAddressChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="County"
                name="county"
                value={data.address.county}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Social Media (Optional)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    name="facebook"
                    value={data.socialMedia.facebook}
                    onChange={handleSocialMediaChange}
                    InputProps={{
                      startAdornment: <FacebookIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    name="twitter"
                    value={data.socialMedia.twitter}
                    onChange={handleSocialMediaChange}
                    InputProps={{
                      startAdornment: <TwitterIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    name="instagram"
                    value={data.socialMedia.instagram}
                    onChange={handleSocialMediaChange}
                    InputProps={{
                      startAdornment: <InstagramIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    name="linkedin"
                    value={data.socialMedia.linkedin}
                    onChange={handleSocialMediaChange}
                    InputProps={{
                      startAdornment: <LinkedInIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="YouTube"
                    name="youtube"
                    value={data.socialMedia.youtube}
                    onChange={handleSocialMediaChange}
                    InputProps={{
                      startAdornment: <YouTubeIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Operating Hours</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <Grid item xs={12} key={day}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ width: '100px', textTransform: 'capitalize' }}>
                        {day}:
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={data.operatingHours[day].closed}
                            onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                          />
                        }
                        label="Closed"
                        sx={{ mr: 2 }}
                      />
                      
                      {!data.operatingHours[day].closed && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            label="Open"
                            type="time"
                            value={data.operatingHours[day].open}
                            onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            sx={{ width: 150 }}
                          />
                          <Typography>to</Typography>
                          <TextField
                            label="Close"
                            type="time"
                            value={data.operatingHours[day].close}
                            onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            sx={{ width: 150 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}
