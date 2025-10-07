'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface HeaderProps {
  variant?: 'default' | 'minimal' | 'magic';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Header Component</Typography>
        <Alert severity="info" sx={{ mt: 1 }}>
          Navigation handled by MainLayout. Header component being migrated to Material UI.
        </Alert>
      </Box>
    </Box>
  );
}
