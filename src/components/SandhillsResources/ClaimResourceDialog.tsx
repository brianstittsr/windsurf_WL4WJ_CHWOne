'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Typography, TextField, Stack, Alert, CircularProgress, Stepper,
  Step, StepLabel, Paper, Chip, Divider, IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { NonprofitClaimService } from '@/services/NonprofitClaimService';
import { SandhillsResource } from '@/types/sandhills-resource.types';
import { EINLookupData } from '@/types/resource-verification.types';

interface ClaimResourceDialogProps {
  open: boolean;
  onClose: () => void;
  resource: SandhillsResource | null;
  onClaimSubmitted?: () => void;
}

const steps = ['Enter EIN', 'Verify Organization', 'Submit Claim'];

export default function ClaimResourceDialog({
  open,
  onClose,
  resource,
  onClaimSubmitted
}: ClaimResourceDialogProps) {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [ein, setEin] = useState('');
  const [einData, setEinData] = useState<EINLookupData | null>(null);
  const [einVerified, setEinVerified] = useState(false);
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantTitle, setClaimantTitle] = useState('');

  const formatEIN = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return digits;
  };

  const handleEINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEin(formatEIN(e.target.value));
    setEinData(null);
    setEinVerified(false);
    setError(null);
  };

  const handleLookupEIN = async () => {
    const cleanEIN = ein.replace(/\D/g, '');
    if (cleanEIN.length !== 9) {
      setError('Please enter a valid 9-digit EIN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nonprofit/ein-lookup?ein=${cleanEIN}`);
      const data = await response.json();

      if (!response.ok || !data.found) {
        setError('No nonprofit found with this EIN. You can still submit a claim for manual review.');
        setEinVerified(false);
        setEinData(null);
        return;
      }

      setEinData(data.organization);
      setEinVerified(true);
      setActiveStep(1);
    } catch (err) {
      setError('Failed to lookup EIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!resource || !currentUser) return;

    if (!claimantName || !claimantEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await NonprofitClaimService.createClaim(
        {
          resourceId: resource.id,
          organizationName: resource.organization,
          ein: ein.replace(/\D/g, ''),
          claimantEmail,
          claimantName,
          claimantTitle
        },
        currentUser.uid
      );

      setSuccess(true);
      onClaimSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setEin('');
    setEinData(null);
    setEinVerified(false);
    setClaimantName('');
    setClaimantEmail('');
    setClaimantTitle('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">Claim This Resource</Typography>
          <Typography variant="body2" color="text.secondary">
            {resource.organization}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Claim Submitted Successfully!
            </Typography>
            <Typography color="text.secondary">
              Your claim is being reviewed. You&apos;ll receive an email once it&apos;s approved.
            </Typography>
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Stack spacing={3}>
                <Alert severity="info" icon={<InfoIcon />}>
                  To claim this resource as your organization, please enter your nonprofit&apos;s EIN (Employer Identification Number).
                </Alert>

                <TextField
                  fullWidth
                  label="EIN (Employer Identification Number)"
                  placeholder="XX-XXXXXXX"
                  value={ein}
                  onChange={handleEINChange}
                  helperText="Enter your 9-digit EIN to verify your nonprofit status"
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={handleLookupEIN}
                        disabled={loading || ein.replace(/\D/g, '').length !== 9}
                        startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                      >
                        Lookup
                      </Button>
                    )
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  Don&apos;t know your EIN? You can find it on your IRS determination letter, 
                  Form 990, or by searching the{' '}
                  <a href="https://apps.irs.gov/app/eos/" target="_blank" rel="noopener noreferrer">
                    IRS Tax Exempt Organization Search
                  </a>.
                </Typography>
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={3}>
                {einVerified && einData ? (
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        EIN Verified
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Organization:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{einData.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">EIN:</Typography>
                        <Typography variant="body2">{ein}</Typography>
                      </Box>
                      {einData.city && einData.state && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Location:</Typography>
                          <Typography variant="body2">{einData.city}, {einData.state}</Typography>
                        </Box>
                      )}
                      {einData.nteeCode && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">NTEE Code:</Typography>
                          <Typography variant="body2">{einData.nteeCode}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                ) : (
                  <Alert severity="warning" icon={<ErrorIcon />}>
                    EIN could not be verified automatically. Your claim will require manual review.
                  </Alert>
                )}

                <Button
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                  fullWidth
                >
                  Continue to Submit Claim
                </Button>
                <Button
                  variant="text"
                  onClick={() => setActiveStep(0)}
                >
                  Back
                </Button>
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  Please provide your contact information to complete the claim:
                </Typography>

                <TextField
                  fullWidth
                  required
                  label="Your Full Name"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                />

                <TextField
                  fullWidth
                  required
                  label="Your Email Address"
                  type="email"
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  helperText="We'll send claim updates to this email"
                />

                <TextField
                  fullWidth
                  label="Your Title/Position"
                  value={claimantTitle}
                  onChange={(e) => setClaimantTitle(e.target.value)}
                  placeholder="e.g., Executive Director, Program Manager"
                />

                <Alert severity="info">
                  By submitting this claim, you confirm that you are authorized to represent this organization.
                </Alert>

                <Button
                  variant="text"
                  onClick={() => setActiveStep(1)}
                >
                  Back
                </Button>
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        {!success && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            {activeStep === 2 && (
              <Button
                variant="contained"
                onClick={handleSubmitClaim}
                disabled={loading || !claimantName || !claimantEmail}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Claim'}
              </Button>
            )}
          </>
        )}
        {success && (
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
