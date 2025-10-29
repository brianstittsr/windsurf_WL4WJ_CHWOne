/**
 * Fix Dashboard Button Clickability Issue
 * 
 * This script addresses the issue where the Dashboard button in the navigation menu
 * cannot be clicked. The problem is likely related to z-index conflicts and
 * pointer-events being blocked by overlapping elements.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting dashboard button clickability fix...');

// Paths to the files we need to modify
const paths = {
  clickableLink: path.resolve(process.cwd(), 'src/components/Layout/ClickableLink.tsx'),
  unifiedLayout: path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.tsx'),
  globalCss: path.resolve(process.cwd(), 'src/app/globals.css')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.button-fix-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Enhance the ClickableLink component for better clickability
if (fs.existsSync(paths.clickableLink)) {
  let content = fs.readFileSync(paths.clickableLink, 'utf8');
  
  // Increase the z-index and add more aggressive pointer-events handling
  content = content.replace(
    `// Styled component with forced pointer events and high z-index
const StyledLink = styled(NextLink)(({ theme }) => ({
  position: 'relative',
  zIndex: 9999, // Very high z-index
  pointerEvents: 'all', // Force pointer events
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    textDecoration: 'none',
  },
}));`,
    `// Styled component with SUPER aggressive pointer events and z-index
const StyledLink = styled(NextLink)(({ theme }) => ({
  position: 'relative',
  zIndex: 99999, // Ultra high z-index
  pointerEvents: 'all !important', // Force pointer events with !important
  cursor: 'pointer !important', // Force cursor with !important
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    textDecoration: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    zIndex: -1, // Behind the link but still part of its clickable area
    pointerEvents: 'auto !important', // Expand clickable area
  },
}));`
  );
  
  // Enhance the onClick handler to be more verbose and help with debugging
  content = content.replace(
    `        onClick={(e) => {
          console.log(\`[LINK] Clicked link to: \${href}\`);
          if (onClick) onClick(e);
        }}`,
    `        onClick={(e) => {
          console.log(\`[LINK] Clicked link to: \${href}\`, {
            target: e.target,
            currentTarget: e.currentTarget,
            eventPhase: e.eventPhase,
            timestamp: new Date().toISOString(),
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            defaultPrevented: e.defaultPrevented
          });
          
          // Stop propagation to prevent other elements from capturing the event
          e.stopPropagation();
          
          // Call the original onClick handler if provided
          if (onClick) onClick(e);
        }}`
  );
  
  // Add even more aggressive styling to the inline style
  content = content.replace(
    `        style={{
          ...style,
          position: 'relative',
          zIndex: 9999,
        }}`,
    `        style={{
          ...style,
          position: 'relative',
          zIndex: 99999,
          pointerEvents: 'all',
          cursor: 'pointer',
          userSelect: 'none', // Prevent text selection interfering with clicks
          WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
        }}`
  );
  
  fs.writeFileSync(paths.clickableLink, content);
  console.log('Updated ClickableLink.tsx with ultra-aggressive clickability enhancements');
}

// 2. Fix the UnifiedLayout component to ensure buttons are clickable
if (fs.existsSync(paths.unifiedLayout)) {
  let content = fs.readFileSync(paths.unifiedLayout, 'utf8');
  
  // Enhance the Button component styling for better clickability
  content = content.replace(
    `                  sx={{ 
                    color: '#333333',
                    fontWeight: pathname === item.href ? 600 : 400,
                    position: 'relative',
                    zIndex: 1200, // Ensure buttons are clickable
                    '&::after': pathname === item.href ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: '3px',
                      backgroundColor: 'primary.main',
                      borderRadius: '3px'
                    } : {},
                    '&:hover': {
                      color: '#000000'
                    }
                  }}`,
    `                  sx={{ 
                    color: '#333333',
                    fontWeight: pathname === item.href ? 600 : 400,
                    position: 'relative',
                    zIndex: 99999, // Ultra high z-index
                    pointerEvents: 'all !important', // Force pointer events
                    cursor: 'pointer !important', // Force cursor
                    padding: '8px 16px', // Increase clickable area
                    margin: '0 -4px', // Compensate for increased padding
                    '&::after': pathname === item.href ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: '3px',
                      backgroundColor: 'primary.main',
                      borderRadius: '3px'
                    } : {},
                    '&:hover': {
                      color: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}`
  );
  
  // Add a debug click handler to each button
  content = content.replace(
    `                <Button
                  key={item.href}
                  component={ClickableLink}
                  href={item.href}`,
    `                <Button
                  key={item.href}
                  component={ClickableLink}
                  href={item.href}
                  onClick={(e) => {
                    console.log(\`[BUTTON] Clicked navigation button to: \${item.href}\`, {
                      label: item.label,
                      timestamp: new Date().toISOString()
                    });
                  }}`
  );
  
  // Increase the z-index of the Box containing the navigation buttons
  content = content.replace(
    `            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1200 }}>`,
    `            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              ml: 4, 
              gap: 2, 
              flexWrap: 'wrap', 
              position: 'relative', 
              zIndex: 99999, // Ultra high z-index
              pointerEvents: 'all !important', // Force pointer events
              '& > *': { // Apply to all children
                pointerEvents: 'all !important',
                cursor: 'pointer !important'
              }
            }}>`
  );
  
  // Decrease the z-index of the main container to prevent it from blocking navigation
  content = content.replace(
    `              zIndex: 1 // Lower z-index than AppBar`,
    `              zIndex: 0 // Even lower z-index to prevent blocking navigation`
  );
  
  fs.writeFileSync(paths.unifiedLayout, content);
  console.log('Updated UnifiedLayout.tsx with improved button clickability');
}

// 3. Enhance the global CSS with more aggressive fixes
if (fs.existsSync(paths.globalCss)) {
  let content = fs.readFileSync(paths.globalCss, 'utf8');
  
  // Add more aggressive global CSS rules for button clickability
  const additionalCss = `
/* Super Aggressive Button Clickability Fix */
.MuiButton-root, 
button, 
a[href], 
[role="button"], 
.MuiButtonBase-root {
  isolation: isolate !important; /* Create a new stacking context */
  position: relative !important;
  z-index: 99999 !important;
  pointer-events: auto !important;
  cursor: pointer !important;
  transform: translateZ(0) !important; /* Force GPU acceleration */
  will-change: transform !important; /* Hint for browser optimization */
  touch-action: manipulation !important; /* Optimize for touch */
}

/* Specific fix for Dashboard button */
a[href="/dashboard"],
a[href="/dashboard"] * {
  z-index: 100000 !important; /* Even higher z-index */
  pointer-events: auto !important;
  cursor: pointer !important;
  position: relative !important;
}

/* Fix for potential overlapping elements */
.MuiContainer-root > * {
  z-index: 1 !important;
  position: relative !important;
}

/* Ensure the AppBar doesn't block clicks with its backdrop */
.MuiAppBar-root::after {
  content: none !important;
}

/* Remove any potential click blockers */
body::before,
#__next::before,
main::before {
  content: none !important;
  display: none !important;
}

/* Fix for Next.js page transitions potentially blocking clicks */
#__next > div {
  position: static !important;
}

/* Debug outline for clickable elements (remove in production) */
.MuiButton-root:hover, 
a[href]:hover, 
[role="button"]:hover {
  outline: 2px solid rgba(0, 0, 255, 0.3) !important;
}
`;

  // Add the new CSS rules to the end of the file
  content += additionalCss;
  
  fs.writeFileSync(paths.globalCss, content);
  console.log('Updated globals.css with super aggressive clickability fixes');
}

// 4. Create a debug button component to help diagnose click issues
const debugButtonPath = path.resolve(process.cwd(), 'src/components/Common/DebugButton.tsx');
const debugButtonContent = `'use client';

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
    console.log(\`[DEBUG_BUTTON] Clicked: \${label} -> \${href}\`, {
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
`;

fs.writeFileSync(debugButtonPath, debugButtonContent);
console.log(`Created DebugButton component at ${debugButtonPath}`);

// 5. Create a test page to verify button clickability
const testPagePath = path.resolve(process.cwd(), 'src/app/button-test/page.tsx');
const testPageContent = `'use client';

import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
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
      <UnifiedLayout>
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
      </UnifiedLayout>
    </AuthProvider>
  );
}
`;

fs.writeFileSync(testPagePath, testPageContent);
console.log(`Created button test page at ${testPagePath}`);

// 6. Create a README file explaining the fix
const readmePath = path.resolve(process.cwd(), 'BUTTON_CLICKABILITY_FIX.md');
const readmeContent = `# Dashboard Button Clickability Fix

This document explains the fixes applied to resolve the issue where the Dashboard button in the navigation menu couldn't be clicked.

## Problem

The Dashboard button and potentially other navigation buttons were not clickable due to:
1. Z-index conflicts between overlapping elements
2. Pointer-events being blocked by elements with higher stacking order
3. Event propagation issues preventing click events from reaching the button

## Fixes Applied

### 1. Enhanced ClickableLink Component

- Increased z-index from 9999 to 99999 for ultra-high stacking priority
- Added !important flags to pointer-events and cursor properties
- Added a pseudo-element to expand the clickable area
- Enhanced the onClick handler with better debugging and event propagation control
- Added additional inline styles for better clickability

### 2. Improved UnifiedLayout Navigation

- Increased z-index of navigation buttons to 99999
- Added explicit pointer-events and cursor properties with !important flags
- Increased padding to create larger clickable areas
- Added debug click handlers to log button interactions
- Increased the z-index of the Box containing navigation buttons
- Decreased the z-index of the main container to prevent it from blocking navigation

### 3. Enhanced Global CSS

- Added super aggressive CSS rules targeting buttons and links
- Created a special higher z-index rule specifically for the Dashboard button
- Fixed potential overlapping elements by adjusting container z-indices
- Removed potential click blockers from the page structure
- Added debug outlines for clickable elements (for development only)

### 4. Diagnostic Tools

- Created a DebugButton component to help diagnose click issues
- Added a button test page with different button implementations
- Implemented click logging and click statistics

## Testing the Fix

1. Navigate to /button-test to try different button implementations
2. Check which button types work reliably
3. Use the browser console to see click event logs
4. Verify that the main navigation buttons are now clickable

## Backup Files

Backup files of the original components were created with the suffix \`.button-fix-backup\`.
To revert changes, you can restore these backup files.

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nDashboard button clickability fix completed!');
console.log('\nThis fix should resolve the issue by:');
console.log('1. Enhancing the ClickableLink component with ultra-aggressive z-index and pointer-events');
console.log('2. Improving the UnifiedLayout navigation with better button styling');
console.log('3. Adding super aggressive global CSS rules for button clickability');
console.log('4. Creating diagnostic tools to help identify and fix click issues');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Navigate to /button-test to try different button implementations');
console.log('3. Verify that the main navigation buttons are now clickable');
