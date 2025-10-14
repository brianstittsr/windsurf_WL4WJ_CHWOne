'use client';

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import Image from 'next/image';

interface AnimatedLoadingProps {
  message?: string;
}

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(26, 54, 93, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(26, 54, 93, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(26, 54, 93, 0);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

export default function AnimatedLoading({ message = 'Loading CHWOne Platform...' }: AnimatedLoadingProps) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#ffffff',
      animation: `${fadeIn} 0.5s ease-in-out`,
    }}>
      <Box sx={{ 
        position: 'relative',
        width: 150,
        height: 150,
        mb: 4,
        animation: `${pulse} 2s infinite`,
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid rgba(26, 54, 93, 0.2)',
          borderTopColor: '#1a365d',
          animation: `${rotate} 1.5s linear infinite`,
        }} />
        
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 100,
          height: 100,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}>
          <Box sx={{ 
            position: 'relative',
            width: 80,
            height: 80,
          }}>
            <Image
              src="/images/CHWOneLogoDesign.png"
              alt="CHWOne Logo"
              fill
              style={{
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
      </Box>
      
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#1a365d',
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: '80%',
          opacity: 0.9,
          animation: `${fadeIn} 1s ease-in-out 0.5s both`
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}
