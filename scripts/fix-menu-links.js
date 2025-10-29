/**
 * Fix Menu Links Not Clickable
 * 
 * This script fixes the issue where menu links in the navigation bar are not clickable
 * after the dashboard is loaded. The issue is likely caused by z-index problems or
 * event propagation issues in the layout components.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting menu links fix...');

// Paths to the files we need to modify
const paths = {
  unifiedLayout: path.resolve(process.cwd(), 'src/components/Layout/UnifiedLayout.tsx'),
  mainLayout: path.resolve(process.cwd(), 'src/components/Layout/MainLayout.tsx')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.menu-fix-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Fix the UnifiedLayout component
if (fs.existsSync(paths.unifiedLayout)) {
  let content = fs.readFileSync(paths.unifiedLayout, 'utf8');
  
  // Fix 1: Update the AppBar z-index to ensure it's above other content
  content = content.replace(
    `<AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
        }}`,
    `<AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure AppBar is above other content
        }}`
  );
  
  // Fix 2: Update the Button component to ensure it's clickable
  content = content.replace(
    `<Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{ 
                    color: '#333333',
                    fontWeight: pathname === item.href ? 600 : 400,
                    position: 'relative',
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
    `<Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{ 
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
                  }}`
  );
  
  // Fix 3: Ensure the Box containing buttons has proper z-index
  content = content.replace(
    `<Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2, flexWrap: 'wrap' }}>`,
    `<Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1200 }}>`
  );
  
  // Fix 4: Update the Container to ensure it doesn't block clicks
  content = content.replace(
    `<Container 
            maxWidth="lg"
            sx={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: 2,
              p: { xs: 3, sm: 4 },
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible',
              height: 'auto',
              color: '#333333' // Ensuring dark text for contrast
            }}`,
    `<Container 
            maxWidth="lg"
            sx={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: 2,
              p: { xs: 3, sm: 4 },
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible',
              height: 'auto',
              color: '#333333', // Ensuring dark text for contrast
              position: 'relative',
              zIndex: 1 // Lower z-index than AppBar
            }}`
  );
  
  fs.writeFileSync(paths.unifiedLayout, content);
  console.log('Updated UnifiedLayout.tsx with z-index fixes');
}

// 2. Fix the MainLayout component if it exists
if (fs.existsSync(paths.mainLayout)) {
  let content = fs.readFileSync(paths.mainLayout, 'utf8');
  
  // Fix 1: Update the AppBar z-index
  content = content.replace(
    `<AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
        }}`,
    `<AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure AppBar is above other content
        }}`
  );
  
  // Fix 2: Update the Box containing buttons
  content = content.replace(
    `<Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2 }}>`,
    `<Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2, position: 'relative', zIndex: 1200 }}>`
  );
  
  // Fix 3: Update the Button component
  content = content.replace(
    `<Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{ color: 'rgba(0, 0, 0, 0.87)' }}`,
    `<Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{ color: 'rgba(0, 0, 0, 0.87)', zIndex: 1200, position: 'relative' }}`
  );
  
  fs.writeFileSync(paths.mainLayout, content);
  console.log('Updated MainLayout.tsx with z-index fixes');
}

// 3. Create a README file explaining the fix
const readmePath = path.resolve(process.cwd(), 'MENU_LINKS_FIX.md');
const readmeContent = `# Menu Links Fix

This document explains the fix for the issue where menu links in the navigation bar were not clickable after the dashboard was loaded.

## Problem

After loading the dashboard, users were unable to click on the navigation menu links in the top bar. This was likely caused by:

1. **Z-Index Issues**: Elements with higher z-index values were overlapping the navigation links
2. **Event Propagation**: Click events were being captured by elements positioned above the links
3. **CSS Positioning**: Relative and absolute positioning conflicts

## Solution

The fix involved several changes to the layout components:

### 1. AppBar Z-Index

Increased the z-index of the AppBar component to ensure it stays above other content:

    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        // other styles...
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >

### 2. Button Z-Index

Added explicit z-index to the navigation buttons to ensure they receive click events:

    <Button
      component={Link}
      href={item.href}
      sx={{ 
        // other styles...
        zIndex: 1200,
        position: 'relative',
      }}
    >

### 3. Container Z-Index

Adjusted the z-index of the main content container to be lower than the navigation:

    <Container 
      sx={{
        // other styles...
        position: 'relative',
        zIndex: 1,
      }}
    >

## Testing

To verify the fix:
1. Navigate to the dashboard
2. Try clicking on different menu links in the navigation bar
3. Confirm that all links are clickable and navigate to the correct pages

## Backup Files

Backup files of the original components were created with the suffix \`.menu-fix-backup\`.
To revert changes, you can restore these backup files.

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nMenu links fix completed!');
console.log('\nThis fix should make all navigation menu links clickable after the dashboard loads.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Navigate to the dashboard');
console.log('3. Test clicking on the menu links to verify they work');
