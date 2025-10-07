'use client';

import React from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';

export default function Region5Directory() {
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Region 5 Directory</Typography>
        <Alert severity="info">
          This component is being migrated to Material UI. Full functionality will be restored soon.
        </Alert>
      </Box>
    </Container>
  );
}
