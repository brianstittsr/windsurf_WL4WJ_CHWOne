'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Stack, Alert, CircularProgress, Divider, FormControlLabel, Checkbox,
  Grid, Chip, Paper
} from '@mui/material';
import {
  CheckCircle as VerifyIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Business as OrgIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebIcon
} from '@mui/icons-material';

interface ResourceData {
  id: string;
  organization: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  counties?: string[];
  resourceType: string;
  contactPerson?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  generalContactName?: string;
  generalContactPhone?: string;
  website?: string;
  currentStatus: string;
  resourceDescription?: string;
  eligibility?: string;
  howToApply?: string;
  notes?: string;
}

interface VerificationData {
  id: string;
  organizationName: string;
  contactEmail: string;
  contactName?: string;
  status: string;
  tokenExpiry: string;
}

export default function VerifyResourcePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [resource, setResource] = useState<ResourceData | null>(null);

  // Form state
  const [isStillAvailable, setIsStillAvailable] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ResourceData>>({});
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (token) {
      fetchVerificationData();
    }
  }, [token]);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sandhills-resources/verify/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load verification');
        return;
      }

      setVerification(data.verification);
      setResource(data.resource);
      setFormData(data.resource);
    } catch (err) {
      setError('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const updatedFields: Record<string, unknown> = {};
      
      if (editMode && resource) {
        // Compare and collect changed fields
        Object.keys(formData).forEach(key => {
          const k = key as keyof ResourceData;
          if (formData[k] !== resource[k]) {
            updatedFields[key] = formData[k];
          }
        });
      }

      const response = await fetch(`/api/sandhills-resources/verify/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isStillAvailable,
          updatedFields: Object.keys(updatedFields).length > 0 ? updatedFields : undefined,
          newContactEmail: newContactEmail || undefined,
          newContactName: newContactName || undefined,
          newContactPhone: newContactPhone || undefined,
          additionalNotes: additionalNotes || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit verification');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !resource) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CancelIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Verification Error
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => router.push('/')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <VerifyIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thank You!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your resource information has been verified successfully.
              {!isStillAvailable && ' We will review and update the listing accordingly.'}
            </Typography>
            <Button variant="contained" onClick={() => router.push('/')}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Resource Verification
            </Typography>
            <Typography color="text.secondary">
              Please verify that the information below is still accurate
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Organization Info */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <OrgIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{resource?.organization}</Typography>
            </Box>
            <Chip label={resource?.resourceType} size="small" sx={{ mb: 2 }} />
            
            {resource?.resourceDescription && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {resource.resourceDescription}
              </Typography>
            )}

            <Grid container spacing={2}>
              {resource?.address && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">
                      {resource.address}<br />
                      {resource.city}, {resource.state} {resource.zip}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {(resource?.contactPersonPhone || resource?.generalContactPhone) && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">
                      {resource.contactPersonPhone || resource.generalContactPhone}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {(resource?.contactPersonEmail) && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">{resource.contactPersonEmail}</Typography>
                  </Box>
                </Grid>
              )}
              {resource?.website && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WebIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">{resource.website}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Verification Questions */}
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Is this resource still available?
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={isStillAvailable ? 'contained' : 'outlined'}
                  color="success"
                  startIcon={<VerifyIcon />}
                  onClick={() => setIsStillAvailable(true)}
                >
                  Yes, Still Available
                </Button>
                <Button
                  variant={!isStillAvailable ? 'contained' : 'outlined'}
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setIsStillAvailable(false)}
                >
                  No Longer Available
                </Button>
              </Stack>
            </Box>

            {isStillAvailable && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editMode}
                      onChange={(e) => setEditMode(e.target.checked)}
                    />
                  }
                  label="I need to update some information"
                />

                {editMode && (
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                      <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Update Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Organization Name"
                          value={formData.organization || ''}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="ZIP Code"
                          value={formData.zip || ''}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Person"
                          value={formData.contactPerson || ''}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Phone"
                          value={formData.contactPersonPhone || ''}
                          onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Email"
                          value={formData.contactPersonEmail || ''}
                          onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Website"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Resource Description"
                          value={formData.resourceDescription || ''}
                          onChange={(e) => setFormData({ ...formData, resourceDescription: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Eligibility Requirements"
                          value={formData.eligibility || ''}
                          onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </>
            )}

            {/* Change Contact */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Update Verification Contact (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                If you&apos;d like someone else to receive future verification emails:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="New Contact Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="New Contact Email"
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="New Contact Phone"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Additional Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes or Comments"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information you'd like to share..."
            />

            {/* Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{ minWidth: 200 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit Verification'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
