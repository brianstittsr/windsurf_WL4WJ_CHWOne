'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QRWizardProvider } from '@/contexts/QRWizardContext';
import QRTrackingWizard from '@/components/QRTracking/QRTrackingWizard';
import { Box } from '@mui/material';

export default function QRTrackingWizardPage() {
  return (
    <AuthProvider>
      <QRWizardProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <QRTrackingWizard />
        </Box>
      </QRWizardProvider>
    </AuthProvider>
  );
}
