'use client';

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';

interface HeroCarouselProps {
  isLoggedIn: boolean;
}

// This is a simplified version of the HeroCarousel component with the carousel disabled
export default function HeroCarousel({ isLoggedIn }: HeroCarouselProps) {
  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 50%, #2c5282 100%)',
    }}>
      {/* Static Content */}
      <Container maxWidth="xl" sx={{ 
        position: 'relative', 
        zIndex: 2, 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Box sx={{ 
          maxWidth: 800, 
          color: 'white',
          p: { xs: 3, md: 0 }
        }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Streamline CHW Management
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              maxWidth: '600px'
            }}
          >
            The only platform you need to manage Community Health Workers, track activities, and measure impact in real-time.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href={isLoggedIn ? "/dashboard" : "/login"}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: '1.1rem',
                backgroundColor: 'white',
                color: '#1a365d',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                }
              }}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/about"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: '1.1rem',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: '#e2e8f0',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
