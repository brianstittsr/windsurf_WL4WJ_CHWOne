'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

export default function RouteGuard() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Route Guard Active</Typography>
      <Alert severity="info" sx={{ mt: 1 }}>
        Route guard component is being migrated to Material UI.
      </Alert>
    </Box>
  );
}
