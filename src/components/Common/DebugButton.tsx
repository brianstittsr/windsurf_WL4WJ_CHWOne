'use client';

import React from 'react';
import { Button, Box, Typography } from '@mui/material';

/**
 * DebugButton Component
 * 
 * A special button component that helps diagnose click issues by
 * showing click events and propagation information.
 */
export default function DebugButton({ href, label, ...props }) {
  const [clickCount, setClickCount] = React.useState(0);
  const [lastClick, setLastClick] = React.useState(null);
  const [isHovering, setIsHovering] = React.useState(false);
  
  const handleClick = (e) => {
    // Prevent default navigation
    e.preventDefault();
    
    // Log click details
    console.log(`[DEBUG_BUTTON] Clicked: ${label} -> ${href}`, {
      target: e.target,
      currentTarget: e.currentTarget,
      eventPhase: e.eventPhase,
      timestamp: new Date().toISOString()
    });
    
    // Update state
    setClickCount(prev => prev + 1);
    setLastClick(new Date().toISOString());
    
    // Navigate after a short delay
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  };
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        sx={{
          position: 'relative',
          zIndex: 100000,
          pointerEvents: 'auto',
          cursor: 'pointer',
          padding: '10px 20px',
          backgroundColor: '#1a365d',
          '&:hover': {
            backgroundColor: '#0f2942'
          }
        }}
        {...props}
      >
        {label}
      </Button>
      
      {isHovering && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            mt: 1,
            zIndex: 100001,
            fontSize: '12px'
          }}
        >
          <Typography variant="caption" display="block">
            Target: {href}
          </Typography>
          <Typography variant="caption" display="block">
            Clicks: {clickCount}
          </Typography>
          {lastClick && (
            <Typography variant="caption" display="block">
              Last: {lastClick.split('T')[1].split('.')[0]}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
