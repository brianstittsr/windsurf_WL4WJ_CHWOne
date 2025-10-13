'use client';

import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

// Stub SchemaManager component for build compatibility
export default function SchemaManager() {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Schema Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and validate the unified schema across the platform
        </Typography>
      </Box>
      
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography>
          Loading Schema Manager...
        </Typography>
      </Paper>
    </Box>
  );
}
