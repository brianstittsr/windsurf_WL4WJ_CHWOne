'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h2" color="error" gutterBottom>
          Something went wrong
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          We apologize for the inconvenience. The application encountered an unexpected error.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => reset()}
          >
            Try again
          </Button>
          
          <Button 
            variant="outlined" 
            component={Link} 
            href="/"
          >
            Return to home
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" component="div">
          Error reference: {error.digest}
        </Typography>
      </Paper>
    </Container>
  );
}
