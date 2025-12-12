'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCode as QrCodeIcon,
  Sms as SmsIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Send as SendIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { SandhillsResource } from '@/types/sandhills-resource.types';

interface ShareResourceDialogProps {
  open: boolean;
  onClose: () => void;
  resource: SandhillsResource | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function ShareResourceDialog({
  open,
  onClose,
  resource
}: ShareResourceDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Generate resource text for sharing
  const getResourceText = () => {
    if (!resource) return '';
    
    let text = `${resource.organization}\n`;
    if (resource.resourceDescription) {
      text += `\n${resource.resourceDescription}\n`;
    }
    if (resource.address || resource.city) {
      text += `\n📍 ${[resource.address, resource.city, resource.state, resource.zip].filter(Boolean).join(', ')}\n`;
    }
    if (resource.contactPerson) {
      text += `\n👤 Contact: ${resource.contactPerson}`;
    }
    if (resource.contactPersonPhone) {
      text += `\n📞 ${resource.contactPersonPhone}`;
    }
    if (resource.contactPersonEmail) {
      text += `\n✉️ ${resource.contactPersonEmail}`;
    }
    if (resource.website) {
      text += `\n🌐 ${resource.website}`;
    }
    if (resource.eligibility) {
      text += `\n\nEligibility: ${resource.eligibility}`;
    }
    if (resource.howToApply) {
      text += `\n\nHow to Apply: ${resource.howToApply}`;
    }
    
    return text;
  };

  // Generate QR code when dialog opens
  useEffect(() => {
    if (open && resource) {
      generateQRCode();
    }
  }, [open, resource]);

  const generateQRCode = async () => {
    if (!resource) return;
    
    setLoading(true);
    try {
      // Create a vCard or simple text for QR code
      const qrData = getResourceText();
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !resource) return;
    
    const link = document.createElement('a');
    link.download = `${resource.organization.replace(/[^a-z0-9]/gi, '_')}_QR.png`;
    link.href = qrCodeUrl;
    link.click();
    
    showSnackbar('QR Code downloaded!');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getResourceText());
    showSnackbar('Resource info copied to clipboard!');
  };

  const handleSendSMS = () => {
    if (!phoneNumber) {
      showSnackbar('Please enter a phone number');
      return;
    }
    
    const text = encodeURIComponent(getResourceText());
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Open SMS app with pre-filled message
    window.open(`sms:${cleanPhone}?body=${text}`, '_blank');
    showSnackbar('Opening SMS app...');
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      showSnackbar('Please enter an email address');
      return;
    }
    
    const subject = encodeURIComponent(`Resource Information: ${resource?.organization}`);
    const body = encodeURIComponent(getResourceText());
    
    // Open email client with pre-filled message
    window.open(`mailto:${emailAddress}?subject=${subject}&body=${body}`, '_blank');
    showSnackbar('Opening email client...');
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  if (!resource) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Share Resource</Typography>
            <Typography variant="body2" color="text.secondary">
              {resource.organization}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab icon={<QrCodeIcon />} label="QR Code" />
            <Tab icon={<SmsIcon />} label="SMS" />
            <Tab icon={<EmailIcon />} label="Email" />
          </Tabs>

          {/* QR Code Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ textAlign: 'center' }}>
              {loading ? (
                <CircularProgress sx={{ my: 4 }} />
              ) : qrCodeUrl ? (
                <>
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="QR Code"
                    sx={{
                      width: 250,
                      height: 250,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 1
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Scan this QR code to view resource information
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadQR}
                    >
                      Download QR
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyText}
                    >
                      Copy Text
                    </Button>
                  </Stack>
                </>
              ) : (
                <Alert severity="error">Failed to generate QR code</Alert>
              )}
            </Box>
          </TabPanel>

          {/* SMS Tab */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Send resource information via SMS text message
              </Typography>
              
              <TextField
                label="Phone Number"
                placeholder="(910) 555-1234"
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                helperText="Enter the recipient's phone number"
              />
              
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Message Preview:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                  {getResourceText().substring(0, 300)}
                  {getResourceText().length > 300 && '...'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSendSMS}
                fullWidth
              >
                Send SMS
              </Button>
              
              <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                This will open your default SMS app with the message pre-filled
              </Alert>
            </Stack>
          </TabPanel>

          {/* Email Tab */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Send resource information via email
              </Typography>
              
              <TextField
                label="Email Address"
                placeholder="recipient@example.com"
                type="email"
                fullWidth
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                helperText="Enter the recipient's email address"
              />
              
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Email Preview:
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Subject: Resource Information: {resource.organization}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                  {getResourceText().substring(0, 400)}
                  {getResourceText().length > 400 && '...'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSendEmail}
                fullWidth
              >
                Send Email
              </Button>
              
              <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                This will open your default email client with the message pre-filled
              </Alert>
            </Stack>
          </TabPanel>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
}
