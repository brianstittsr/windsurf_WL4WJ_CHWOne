'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

/**
 * Stub MagicPageTemplate that doesn't use react-bootstrap
 * This is a simplified version for build compatibility
 */

interface MagicPageTemplateProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  showHeader?: boolean;
  actions?: React.ReactNode;
}

export default function MagicPageTemplate({
  title,
  subtitle,
  children,
  showHeader = true,
  actions
}: MagicPageTemplateProps) {
  
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      padding: 4
    }}>
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
        {title && (
          <Typography variant="h1" sx={{
            fontSize: '4rem',
            mb: 2,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {title}
          </Typography>
        )}
        
        {subtitle && (
          <Typography variant="h5" sx={{
            fontSize: '1.25rem',
            mb: 4,
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.6,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            {subtitle}
          </Typography>
        )}
        
        {actions && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 4 }}>
            {actions}
          </Box>
        )}

        {children && (
          <Box sx={{
            p: 3,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'left',
            mt: 4
          }}>
            {children}
          </Box>
        )}
      </Container>
    </Box>
  );
}

// Magic-style button component using MUI instead of react-bootstrap
export const MagicButton = ({ 
  children, 
  variant = 'primary',
  onClick,
  href,
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
  [key: string]: any;
}) => {
  const muiVariant = variant === 'primary' ? 'contained' : 'outlined';
  const buttonSx = {
    py: 2,
    px: 4,
    borderRadius: 3,
    fontSize: '1.1rem',
    fontWeight: 600,
    backdropFilter: variant === 'secondary' ? 'blur(10px)' : 'none',
    ...props.sx
  };
  
  if (href) {
    return (
      <Button 
        variant={muiVariant}
        onClick={onClick}
        href={href}
        LinkComponent={Link}
        sx={buttonSx}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button 
      variant={muiVariant}
      onClick={onClick}
      sx={buttonSx}
    >
      {children}
    </Button>
  );
};
