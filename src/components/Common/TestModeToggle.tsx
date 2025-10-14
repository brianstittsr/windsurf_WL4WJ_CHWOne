'use client';

import React, { useEffect, useState } from 'react';
import { Box, Switch, FormControlLabel, Paper, Typography, Button } from '@mui/material';
import { BugReport as BugIcon } from '@mui/icons-material';

/**
 * TestModeToggle component that allows developers to easily toggle test mode on/off
 * Only appears in development environment
 */
export default function TestModeToggle() {
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Only run effects on the client side
  useEffect(() => {
    setIsClient(true);
    
    // Load initial state from localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('BYPASS_AUTH');
      setTestModeEnabled(storedValue === 'true');
    }
  }, []);

  // If not in development mode or not on client side, don't render anything
  if (!isDevelopment || !isClient) {
    return null;
  }

  // Update localStorage when toggle changes
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setTestModeEnabled(newValue);
    localStorage.setItem('BYPASS_AUTH', newValue.toString());
  };

  // Apply changes and reload the page
  const applyChanges = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: expanded ? 0 : -120,
        left: 0,
        right: 0,
        zIndex: 9999,
        transition: 'top 0.3s ease',
        opacity: expanded ? 1 : 0.7,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          m: 2,
          backgroundColor: '#1a365d',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BugIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Developer Test Mode</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={testModeEnabled}
                  onChange={handleToggleChange}
                  color="warning"
                />
              }
              label={testModeEnabled ? "Auto-Login Enabled" : "Auto-Login Disabled"}
            />
            <Button 
              variant="contained" 
              color="warning" 
              size="small"
              onClick={applyChanges}
            >
              Apply & Reload
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              {expanded ? "▲" : "▼"}
            </Button>
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{
          position: 'fixed',
          top: expanded ? -40 : 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          transition: 'top 0.3s ease',
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => setExpanded(!expanded)}
          startIcon={<BugIcon />}
          sx={{
            borderRadius: '0 0 8px 8px',
            backgroundColor: '#1a365d',
            '&:hover': {
              backgroundColor: '#0f2942',
            },
          }}
        >
          {expanded ? "Hide Test Controls" : "Test Controls"}
        </Button>
      </Box>
    </Box>
  );
}
