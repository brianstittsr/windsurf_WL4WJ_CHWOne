'use client';

import React from 'react';
import { Container, Grid, Box, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

interface PageFooterProps {
  variant?: 'default' | 'minimal' | 'magic';
}

export default function PageFooter({ variant = 'default' }: PageFooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'magic') {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3, mt: 'auto' }}>
        <Container sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} CHWOne Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 4, mt: 'auto', bgcolor: 'grey.100' }}>
      <Container>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              CHWOne Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Community Health Worker Management Platform
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} href="/dashboard" color="text.secondary" underline="hover">
                  Dashboard
                </MuiLink>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Support
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ mb: 1, color: 'text.secondary' }}>
                HIPAA Compliant Platform
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Grid container sx={{ pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {currentYear} CHWOne Platform. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
