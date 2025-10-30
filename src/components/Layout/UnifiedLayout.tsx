'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Button, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import AnimatedLoading from '../Common/AnimatedLoading';
import { Menu as MenuIcon, Close as CloseIcon, Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import ClickableLink from './ClickableLink';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

// Inner component that uses the auth context
function UnifiedLayoutContent({ children, fullWidth = false }: UnifiedLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  
  const isHomePage = pathname === '/';

  const handleLogout = async () => {
    try {
      await signOut();
      setAnchorEl(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { 
      href: '/rbac-test', 
      icon: 'security', 
      label: 'RBAC Test', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/dashboard', 
      icon: 'computer', 
      label: 'Main Dashboard', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/dashboard/regions', 
      icon: 'location', 
      label: 'Regions', 
      roles: [UserRole.ADMIN, UserRole.CHW] 
    },
    { 
      href: '/dashboard/wl4wj', 
      icon: 'favorite', 
      label: 'WL4WJ', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/admin', 
      icon: 'settings', 
      label: 'Admin Panel', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/chws', 
      icon: 'person', 
      label: 'CHWs', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/chws/mock-profiles', 
      icon: 'person', 
      label: 'CHW Profiles', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/projects', 
      icon: 'sparkle', 
      label: 'Projects', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/grants', 
      icon: 'security', 
      label: 'Grants', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/referrals', 
      icon: 'openLink', 
      label: 'Referrals', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/resources', 
      icon: 'search', 
      label: 'Resources', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/forms', 
      icon: 'clipboard', 
      label: 'Forms', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/datasets', 
      icon: 'database', 
      label: 'Datasets', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/reports', 
      icon: 'analytics', 
      label: 'Reports', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/ai-assistant', 
      icon: 'psychology', 
      label: 'AI Assistant', 
      roles: [UserRole.ADMIN],
      highlight: true // Add highlight to show it's new
    },
    { 
      href: '/civicrm', 
      icon: 'people', 
      label: 'CiviCRM', 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/profile', 
      icon: 'person', 
      label: 'My Profile', 
      roles: [UserRole.ADMIN] 
    },
  ];

  // RBAC DISABLED: All users have admin role
  const userRole = UserRole.ADMIN;
  // RBAC DISABLED: Show all menu items regardless of role
      const filteredMenuItems = menuItems; // No filtering

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isHomePage ? '#ffffff' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      backgroundSize: '400% 400%',
      animation: !isHomePage ? 'gradientShift 24s ease infinite' : 'none',
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      color: '#333333', // Ensuring dark text for contrast with light background
    }}>
      {/* Top Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure AppBar is above other content
        }}
      >
        <Toolbar>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              width={40}
              height={40}
              alt="CHWOne Logo"
              style={{ borderRadius: '50%', marginRight: 8 }}
            />
            <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#1a365d' }}>CHWOne</Box>
          </Link>

          {/* AUTHENTICATION DISABLED: Always show desktop menu */}
          {!isMobile && (
            <Box sx={{ 
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
            }}>
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.href}
                  component="a"
                  href={item.href}
                  onClick={(e) => {
                    console.log(`[BUTTON] Clicked navigation button to: ${item.href}`, {
                      label: item.label,
                      timestamp: new Date().toISOString()
                    });
                  }}
                  sx={{ 
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
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Always use spacer when not logged in to push content to right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* AUTHENTICATION DISABLED: Always show mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ ml: 2 }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

          {/* AUTHENTICATION DISABLED: Always show user menu */}
          <Box sx={{ ml: 2 }}>
            {true ? ( // Always true to show user menu
              // User Menu when logged in
              <>
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem component="a" href="/settings" onClick={handleUserMenuClose}>
                    <SettingsIcon sx={{ mr: 1 }} /> Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // Login/Register buttons when not logged in
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  component="a"
                  href="/register"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    borderColor: '#1a365d',
                    color: '#1a365d',
                    '&:hover': {
                      borderColor: '#0f2942',
                      backgroundColor: 'rgba(26, 54, 93, 0.04)'
                    }
                  }}
                >
                  Register
                </Button>
                <Button 
                  variant="contained" 
                  component="a"
                  href="/login"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    backgroundColor: '#1a365d',
                    '&:hover': {
                      backgroundColor: '#0f2942'
                    }
                  }}
                >
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            color: '#333333'
          }
        }}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton 
                  component="a" 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  selected={pathname === item.href}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: '#1976d2',
                      fontWeight: 600
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      {fullWidth || isHomePage ? (
        // Full width content for homepage or when specified
        <Box 
          component="main" 
          sx={{ 
            pt: 8, // Reduced padding to account for AppBar
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}
        >
          {children}
        </Box>
      ) : (
        // Container content for other pages
        <Box 
          component="main" 
          sx={{ 
            pt: 10,
            px: { xs: 2, sm: 3 },
            pb: 5,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible'
          }}
        >
          <Container 
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
              zIndex: 0 // Even lower z-index to prevent blocking navigation
            }}
          >
            {children}
          </Container>
        </Box>
      )}
    </Box>
  );
}

export default function UnifiedLayout(props: UnifiedLayoutProps) {
  return (
    <AuthProvider>
      <UnifiedLayoutContent {...props} />
    </AuthProvider>
  );
}
