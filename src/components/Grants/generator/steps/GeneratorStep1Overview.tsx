'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  Alert
} from '@mui/material';
import { Upload, Building2 } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep1Overview() {
  const { proposalData, updateProposalData, uploadLogo } = useGrantGenerator();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      await uploadLogo(file);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Project Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Organization Logo */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Logo
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload your organization's logo to be included in the proposal
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={proposalData.organizationLogo}
                  sx={{ width: 100, height: 100, bgcolor: 'primary.light' }}
                >
                  {!proposalData.organizationLogo && <Building2 size={40} />}
                </Avatar>

                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    PNG, JPG up to 2MB
                  </Typography>
                </Box>
              </Box>

              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Organization Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Organization Name"
            value={proposalData.organizationName || ''}
            onChange={(e) => updateProposalData({ organizationName: e.target.value })}
            required
            helperText="Your organization's legal name"
          />
        </Grid>

        {/* Project Title */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Project Title"
            value={proposalData.projectTitle || ''}
            onChange={(e) => updateProposalData({ projectTitle: e.target.value })}
            required
            helperText="A clear, concise title for your project"
          />
        </Grid>

        {/* Target Funder */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Target Funder"
            value={proposalData.targetFunder || ''}
            onChange={(e) => updateProposalData({ targetFunder: e.target.value })}
            required
            helperText="The organization you're applying to"
          />
        </Grid>

        {/* Funding Amount */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Requested Funding Amount"
            value={proposalData.fundingAmount || ''}
            onChange={(e) => updateProposalData({ fundingAmount: parseFloat(e.target.value) || 0 })}
            required
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
            helperText="Total amount requested"
          />
        </Grid>

        {/* Project Duration */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Project Duration"
            value={proposalData.projectDuration || ''}
            onChange={(e) => updateProposalData({ projectDuration: e.target.value })}
            required
            placeholder="e.g., 12 months, January 2025 - December 2025"
            helperText="How long will the project run?"
          />
        </Grid>

        {/* AI Tip */}
        <Grid item xs={12}>
          <Alert severity="info">
            <strong>AI Tip:</strong> Provide clear, specific information. Our AI will use these details 
            to craft a compelling executive summary and project overview.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}
