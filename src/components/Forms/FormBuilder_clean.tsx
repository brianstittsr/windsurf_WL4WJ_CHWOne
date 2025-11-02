'use client';

import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';

interface FormBuilderProps {
  onSave?: (formData: any) => void;
  initialData?: any;
}

export default function FormBuilder({ onSave, initialData }: FormBuilderProps) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Form Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This component is currently under reconstruction to migrate to Material-UI.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
