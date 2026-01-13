'use client';

import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import ClickableLink from '@/components/Layout/ClickableLink';
import DebugButton from '@/components/Common/DebugButton';

/**
 * Button Test Page
 * 
 * This page tests different button implementations to diagnose and fix
 * clickability issues with navigation buttons.
 */
export default function ButtonTestPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Button Clickability Test
          </Typography>
          
          <Typography variant="body1" paragraph>
            This page tests different button implementations to diagnose and fix clickability issues.
            Try clicking each button type to see which ones work reliably.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Standard Buttons
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Standard MUI Button */}
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Dashboard (Standard Button)
                  </Button>
                  
                  {/* MUI Button with ClickableLink */}
                  <Button
                    variant="contained"
                    color="secondary"
                    component={ClickableLink}
                    href="/dashboard"
                  >
                    Dashboard (ClickableLink)
                  </Button>
                  
                  {/* Plain HTML anchor */}
                  <a 
                    href="/dashboard" 
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#1a365d', 
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    Dashboard (HTML Anchor)
                  </a>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Debug Buttons
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Debug Button */}
                  <DebugButton 
                    href="/dashboard"
                    label="Dashboard (Debug Button)"
                  />
                  
                  {/* Inline super aggressive button */}
                  <Button
                    variant="contained"
                    onClick={() => window.location.href = '/dashboard'}
                    sx={{
                      backgroundColor: '#1a365d',
                      position: 'relative',
                      zIndex: 100000,
                      pointerEvents: 'all !important',
                      cursor: 'pointer !important',
                      '&:hover': {
                        backgroundColor: '#0f2942'
                      }
                    }}
                  >
                    Dashboard (Super Aggressive)
                  </Button>
                  
                  {/* Raw HTML with inline event */}
                  <div
                    onClick={() => {
                      console.log('[RAW_DIV] Clicked, navigating to dashboard');
                      window.location.href = '/dashboard';
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#1a365d',
                      color: 'white',
                      borderRadius: '4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 100000
                    }}
                  >
                    Dashboard (Raw DIV)
                  </div>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Testing Instructions:
            </Typography>
            
            <ol>
              <li>
                <Typography variant="body1" paragraph>
                  Try clicking each button type to see which ones work reliably
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Check the browser console for click event logs
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  The Debug Button will show a tooltip on hover with click statistics
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Once you find a reliable button type, we can update the main navigation
                </Typography>
              </li>
            </ol>
          </Box>
        </Container>
      </AdminLayout>
    </AuthProvider>
  );
}
