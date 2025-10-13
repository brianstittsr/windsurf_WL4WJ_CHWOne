'use client';

import React from 'react';
import { Box, Container, Paper } from '@mui/material';

/**
 * Stub PageContainer that doesn't use react-bootstrap
 * This is a simplified version for build compatibility
 */

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'full-width' | 'magic' | 'magic-centered';
  headerVariant?: 'default' | 'minimal' | 'magic';
  footerVariant?: 'default' | 'minimal' | 'magic';
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: string;
  padding?: string;
  background?: 'default' | 'gradient' | 'neutral' | 'magic';
}

export default function PageContainer({
  children,
  variant = 'default',
  headerVariant = 'default',
  footerVariant = 'default',
  showHeader = true,
  showFooter = true,
  maxWidth = '1200px',
  padding = '32px',
  background = 'default'
}: PageContainerProps) {
  
  // Simplified stub implementation that just renders the children
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: background === 'magic' || background === 'gradient' ? 
        'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' : 
        background === 'neutral' ? '#f5f5f5' : '#ffffff',
      color: background === 'magic' || background === 'gradient' ? 'white' : 'inherit'
    }}>
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {variant === 'default' ? (
          <Paper sx={{
            flex: 1,
            maxWidth: maxWidth,
            mx: 'auto',
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: background === 'gradient' ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
            backdropFilter: background === 'gradient' ? 'blur(20px)' : 'none',
          }}>
            {children}
          </Paper>
        ) : (
          <Container 
            maxWidth={variant === 'full-width' ? false : 'lg'} 
            sx={{
              p: variant === 'minimal' ? 2 : 4,
              ...(variant === 'magic-centered' && {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: 'calc(100vh - 200px)'
              })
            }}
          >
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
}
