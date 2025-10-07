'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import QRCode from 'react-qr-code';

interface QRCodeGeneratorProps {
  formId: string;
  formTitle: string;
  isEnabled: boolean;
  publicUrl?: string;
  onToggle?: (enabled: boolean) => void;
}

export default function QRCodeGenerator({
  formId,
  formTitle,
  isEnabled,
  publicUrl,
  onToggle
}: QRCodeGeneratorProps) {
  const [showQR, setShowQR] = useState(false);
  const [generatingUrl, setGeneratingUrl] = useState(false);
  const [currentPublicUrl, setCurrentPublicUrl] = useState<string>(publicUrl || '');
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate public URL for the form
  const generatePublicUrl = async () => {
    setGeneratingUrl(true);
    try {
      // In a real implementation, this would call an API to generate/enable the public URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chwone.yourdomain.com';
      const url = `${baseUrl}/forms/public/${formId}`;
      setCurrentPublicUrl(url);
      onToggle?.(true);
    } catch (error) {
      console.error('Error generating public URL:', error);
    } finally {
      setGeneratingUrl(false);
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentPublicUrl);
      // You could show a toast notification here
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  // Share URL (if Web Share API is available)
  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formTitle} - Survey`,
          text: `Please complete this survey: ${formTitle}`,
          url: currentPublicUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyUrlToClipboard();
    }
  };

  const handleToggle = async () => {
    if (!isEnabled && !currentPublicUrl) {
      await generatePublicUrl();
    } else {
      onToggle?.(!isEnabled);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={isEnabled ? "Disable QR Code" : "Enable QR Code"}>
          <IconButton
            onClick={handleToggle}
            color={isEnabled ? "primary" : "default"}
            disabled={generatingUrl}
          >
            {generatingUrl ? <CircularProgress size={20} /> : <QrCodeIcon />}
          </IconButton>
        </Tooltip>

        {isEnabled && (
          <Tooltip title="View QR Code">
            <IconButton onClick={() => setShowQR(true)}>
              <QrCodeIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* QR Code Dialog */}
      <Dialog
        open={showQR}
        onClose={() => setShowQR(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          QR Code for {formTitle}
          <IconButton onClick={() => setShowQR(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {currentPublicUrl ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Scan this QR code to access the form
                </Typography>

                <Box
                  ref={qrRef}
                  sx={{
                    display: 'inline-block',
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <QRCode
                    value={currentPublicUrl}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </Box>

                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {currentPublicUrl}
                </Typography>

                <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={downloadQRCode}
                    size="small"
                  >
                    Download QR
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={shareUrl}
                    size="small"
                  >
                    Share URL
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    This QR code generates a public link that anyone can access without logging in.
                    Make sure your form is ready for public access before sharing.
                  </Typography>
                </Alert>
              </>
            ) : (
              <Box sx={{ py: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Generating public URL...</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowQR(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Additional component for displaying QR codes in form lists
export function FormQRCode({ formId, formTitle, isEnabled }: {
  formId: string;
  formTitle: string;
  isEnabled: boolean;
}) {
  const [showQR, setShowQR] = useState(false);
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://chwone.yourdomain.com'}/forms/public/${formId}`;

  if (!isEnabled) {
    return (
      <Typography variant="caption" color="text.secondary">
        QR Code disabled
      </Typography>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<QrCodeIcon />}
        onClick={() => setShowQR(true)}
      >
        QR Code
      </Button>

      <Dialog open={showQR} onClose={() => setShowQR(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formTitle} - QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <QRCode
              value={publicUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              {publicUrl}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQR(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
