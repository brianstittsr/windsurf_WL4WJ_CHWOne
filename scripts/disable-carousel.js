/**
 * Disable Carousel
 * 
 * This script disables the carousel on the home page by:
 * 1. Removing the preload link for carousel images in layout.tsx
 * 2. Creating a disabled version of the HeroCarousel component
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need modification
const filePaths = {
  layout: path.resolve(process.cwd(), 'src/app/layout.tsx'),
  heroCarousel: path.resolve(process.cwd(), 'src/components/Home/HeroCarousel.tsx')
};

// Check if files exist
Object.entries(filePaths).forEach(([name, filePath]) => {
  if (!fs.existsSync(filePath)) {
    console.error(`${name} not found at path: ${filePath}`);
    process.exit(1);
  }
});

// Create backups
Object.entries(filePaths).forEach(([name, filePath]) => {
  const backupPath = `${filePath}.carousel-backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// 1. Remove preload link from layout.tsx
let layoutContent = fs.readFileSync(filePaths.layout, 'utf8');

// Remove the preload link for carousel images
layoutContent = layoutContent.replace(
  /\s*{\/\* Preload the first carousel image for faster initial load \*\/}[\s\S]*?fetchPriority="high"\s*\/>\s*/,
  '\n'
);

// Write the modified content back to the file
fs.writeFileSync(filePaths.layout, layoutContent);
console.log('Removed carousel preload link from layout.tsx');

// 2. Create a disabled version of HeroCarousel.tsx
let heroCarouselContent = fs.readFileSync(filePaths.heroCarousel, 'utf8');

// Create a simplified version that doesn't render the carousel
const disabledHeroCarousel = `'use client';

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
`;

// Write the disabled version to the file
fs.writeFileSync(filePaths.heroCarousel, disabledHeroCarousel);
console.log('Created disabled version of HeroCarousel.tsx');

console.log('\nSuccessfully disabled carousel on the home page');
console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Check the home page to ensure the carousel is disabled');
