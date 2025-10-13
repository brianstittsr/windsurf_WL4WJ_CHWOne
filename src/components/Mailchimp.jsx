'use client';

import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

// Stub Mailchimp component for build compatibility
export const Mailchimp = () => {
  return (
    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
      <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
        Subscribe to our newsletter
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Get the latest updates and news delivered to your inbox.
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField 
          label="Email address" 
          variant="outlined" 
          fullWidth
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" color="primary" sx={{ px: 3 }}>
          Subscribe
        </Button>
      </Box>
    </Paper>
  );
};

export default Mailchimp;
