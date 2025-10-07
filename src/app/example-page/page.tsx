'use client';

import React from 'react';
import { Container, Button, Card, CardContent, Box, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

/**
 * Example page demonstrating the Magic template page system
 * This matches the beautiful homepage design with gradient background
 */
export default function ExamplePage() {
  return (
    <Container 
      maxWidth={false}
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 5,
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 5, maxWidth: '800px' }}>
        <Box sx={{ mb: 3, transform: 'translateY(0)', opacity: 1, transition: 'all 0.5s ease-out' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}>Building bridges between</Typography>
        </Box>
        
        <Box sx={{ mb: 5, transform: 'translateY(0)', opacity: 1, transition: 'all 0.5s ease-out 0.2s' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 4 }}>This example page demonstrates how to create new pages that match the beautiful Magic template homepage design with gradient backgrounds and centered layouts.</Typography>
        </Box>
        
        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 5 }}>
          <Button component={Link} href="/dashboard" variant="contained" size="large">Go to Dashboard</Button>
          <Button component={Link} href="/chws" variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>Manage CHWs</Button>
        </Stack>
      </Box>
      
      <Card sx={{ p: 4, maxWidth: '600px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: 3 }}>
        <CardContent>
          <Typography sx={{ fontSize: '1rem', color: '#60a5fa', mb: 1, fontWeight: 600 }}>
            🎨 Magic Template Design
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            This page template preserves the beautiful gradient background and centered layout from the homepage. 
            Perfect for landing pages, authentication forms, or any content that needs the Magic template aesthetic.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
