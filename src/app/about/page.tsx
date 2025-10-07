import React from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';

export default function AboutPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>About CHWOne</Typography>
        <Alert severity="info">
          About page is being migrated to Material UI. Full functionality will be restored soon.
        </Alert>
      </Box>
    </Container>
  );
}
