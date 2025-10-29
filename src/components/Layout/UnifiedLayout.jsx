'use client';

import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Container, Avatar, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function UnifiedLayout({ children, fullWidth = false }) {
  console.log('%c[LAYOUT] UnifiedLayout rendering', 'background: #4a5568; color: white; padding: 2px 4px; border-radius: 2px;', {
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    timestamp: new Date().toISOString()
  });
  
  const { currentUser, signOut } = useAuth();
  console.log('%c[LAYOUT] Auth state in layout:', 'color: #4a5568;', { 
    currentUser: currentUser ? { 
      uid: currentUser.uid, 
      email: currentUser.email,
      displayName: currentUser.displayName
    } : null,
    timestamp: new Date().toISOString()
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const pathname = usePathname();

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSignOut = () => {
    console.log('%c[LAYOUT] Sign out requested', 'background: #4a5568; color: white; padding: 2px 4px; border-radius: 2px;');
    handleUserMenuClose();
    signOut()
      .then(() => console.log('%c[LAYOUT] Sign out successful', 'color: green;'))
      .catch(err => console.error('%c[LAYOUT] Sign out error:', 'color: red;', err));
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(90deg, #1a237e 0%, #283593 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CHWOne Platform
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button 
              color="inherit" 
              href="/dashboard"
              sx={{ 
                fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                borderBottom: isActive('/dashboard') ? '2px solid white' : 'none'
              }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              href="/resources"
              sx={{ 
                fontWeight: isActive('/resources') ? 'bold' : 'normal',
                borderBottom: isActive('/resources') ? '2px solid white' : 'none'
              }}
            >
              Resources
            </Button>
            <Button 
              color="inherit" 
              href="/training"
              sx={{ 
                fontWeight: isActive('/training') ? 'bold' : 'normal',
                borderBottom: isActive('/training') ? '2px solid white' : 'none'
              }}
            >
              Training
            </Button>
            {currentUser && (
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls="user-menu"
                aria-haspopup="true"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                  {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                </Avatar>
              </IconButton>
            )}
          </Box>
          
          <IconButton 
            color="inherit" 
            sx={{ display: { xs: 'block', md: 'none' } }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span>☰</span>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem button onClick={() => setMobileMenuOpen(false)} component="a" href="/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => setMobileMenuOpen(false)} component="a" href="/resources">
              <ListItemText primary="Resources" />
            </ListItem>
            <ListItem button onClick={() => setMobileMenuOpen(false)} component="a" href="/training">
              <ListItemText primary="Training" />
            </ListItem>
            {currentUser && (
              <ListItem button onClick={signOut}>
                <ListItemText primary="Sign Out" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
      
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleUserMenuClose} component="a" href="/profile">Profile</MenuItem>
        <MenuItem onClick={handleUserMenuClose} component="a" href="/settings">Settings</MenuItem>
        <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
      </Menu>
      
      <Box component="main" sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
        <Container maxWidth={fullWidth ? false : 'lg'}>
          {children}
        </Container>
      </Box>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} CHWOne Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
