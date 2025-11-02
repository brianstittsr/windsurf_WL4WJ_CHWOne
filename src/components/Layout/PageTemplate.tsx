'use client';

import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';

/**
 * Example page template showing how to build modular pages with Bootstrap
 * 
 * Usage Examples:
 * 
 * 1. Standard page with header/footer:
 * <PageTemplate title="My Page" />
 * 
 * 2. Full-width page with gradient background:
 * <PageTemplate title="Dashboard" variant="full-width" background="gradient" />
 * 
 * 3. Minimal page without footer:
 * <PageTemplate title="Login" variant="minimal" showFooter={false} />
 */

interface PageTemplateProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'full-width';
  background?: 'default' | 'gradient' | 'neutral';
  showHeader?: boolean;
  showFooter?: boolean;
  actions?: React.ReactNode;
}

export default function PageTemplate({
  title = "Page Title",
  subtitle,
  children,
  variant = 'default',
  background = 'default',
  showHeader = true,
  showFooter = true,
  actions
}: PageTemplateProps) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box>
          {(title || subtitle || actions) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                {title && (
                  <Typography variant="h4" color="primary" gutterBottom>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body1" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {actions && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {actions}
                </Box>
              )}
            </Box>
          )}
          {children}
        </Box>
      </Paper>
    </Container>
  );
}
