'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

interface OrganizationBasicInfoFormProps {
  data: any;
  onChange: (data: any) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

export default function OrganizationBasicInfoForm({ data, onChange }: OrganizationBasicInfoFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    onChange({ [name as string]: value });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Organization Information
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Please provide basic information about your nonprofit organization.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Organization Name"
            name="name"
            value={data.name}
            onChange={handleChange}
            helperText="Official name of your organization as registered"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Description"
            name="description"
            value={data.description}
            onChange={handleChange}
            multiline
            rows={3}
            helperText="Brief description of your organization (250 words max)"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Mission Statement"
            name="mission"
            value={data.mission}
            onChange={handleChange}
            multiline
            rows={2}
            helperText="Your organization's mission statement"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="legal-status-label">Legal Status</InputLabel>
            <Select
              labelId="legal-status-label"
              name="legalStatus"
              value={data.legalStatus}
              onChange={handleChange}
              label="Legal Status"
            >
              <MenuItem value="nonprofit">501(c)(3) Nonprofit</MenuItem>
              <MenuItem value="government">Government Agency</MenuItem>
              <MenuItem value="forProfit">For-Profit (Social Enterprise)</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            <FormHelperText>Legal classification of your organization</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="founding-year-label">Founding Year</InputLabel>
            <Select
              labelId="founding-year-label"
              name="foundingYear"
              value={data.foundingYear}
              onChange={handleChange}
              label="Founding Year"
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Year your organization was established</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="size-label">Organization Size</InputLabel>
            <Select
              labelId="size-label"
              name="size"
              value={data.size}
              onChange={handleChange}
              label="Organization Size"
            >
              <MenuItem value="small">Small (1-10 employees)</MenuItem>
              <MenuItem value="medium">Medium (11-50 employees)</MenuItem>
              <MenuItem value="large">Large (51+ employees)</MenuItem>
            </Select>
            <FormHelperText>Number of employees in your organization</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="budget-label">Annual Budget</InputLabel>
            <Select
              labelId="budget-label"
              name="budget"
              value={data.budget}
              onChange={handleChange}
              label="Annual Budget"
            >
              <MenuItem value="under100k">Under $100,000</MenuItem>
              <MenuItem value="100k-500k">$100,000 - $500,000</MenuItem>
              <MenuItem value="500k-1m">$500,000 - $1 million</MenuItem>
              <MenuItem value="1m-5m">$1 million - $5 million</MenuItem>
              <MenuItem value="over5m">Over $5 million</MenuItem>
            </Select>
            <FormHelperText>Approximate annual operating budget</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Tax ID (EIN)"
            name="taxId"
            value={data.taxId}
            onChange={handleChange}
            helperText="Federal Tax ID / Employer Identification Number (EIN)"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
