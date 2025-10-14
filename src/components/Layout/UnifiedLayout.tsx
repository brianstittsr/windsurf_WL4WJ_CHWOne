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
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function UnifiedLayout({ children, fullWidth = false }: UnifiedLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const [isTestModeActive, setIsTestModeActive] = useState(false);
  
  const isHomePage = pathname === '/';
  
  // Check if test mode is active
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const testModeActive = localStorage.getItem('BYPASS_AUTH') === 'true';
      setIsTestModeActive(testModeActive);
    }
  }, []);

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
      href: '/dashboard', 
      icon: 'computer', 
      label: 'Main Dashboard', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/dashboard/region-5', 
      icon: 'location', 
      label: 'Region 5', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR] 
    },
    { 
      href: '/dashboard/wl4wj', 
      icon: 'favorite', 
      label: 'WL4WJ', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
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
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR] 
    },
    { 
      href: '/projects', 
      icon: 'sparkle', 
      label: 'Projects', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/grants', 
      icon: 'security', 
      label: 'Grants', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/referrals', 
      icon: 'openLink', 
      label: 'Referrals', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/resources', 
      icon: 'search', 
      label: 'Resources', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/forms', 
      icon: 'clipboard', 
      label: 'Forms', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/datasets', 
      icon: 'database', 
      label: 'Datasets', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/reports', 
      icon: 'analytics', 
      label: 'Reports', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/civicrm', 
      icon: 'people', 
      label: 'CiviCRM', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/ai-assistant', 
      icon: 'chat', 
      label: 'AI Assistant', 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/profile', 
      icon: 'person', 
      label: 'My Profile', 
      roles: [UserRole.CHW] 
    },
  ];

  // Mock user role for testing - replace with actual auth context
  const userRole = currentUser?.role === 'chw' ? UserRole.CHW : (currentUser?.email === 'admin@example.com' ? UserRole.ADMIN : UserRole.CHW_COORDINATOR);
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

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
            
            {/* Test Mode Indicator */}
            {isTestModeActive && process.env.NODE_ENV === 'development' && (
              <Box 
                component="span" 
                sx={{ 
                  ml: 2, 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1, 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  backgroundColor: 'error.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                TEST MODE
              </Box>
            )}
          </Link>

          {/* Desktop Menu - Only show when logged in */}
          {!isMobile && currentUser && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2, flexWrap: 'wrap' }}>
              {filteredMenuItems.map((item) => (
                <Button
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
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Always use spacer when not logged in to push content to right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Mobile Menu Button - Only show when logged in */}
          {isMobile && currentUser && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ ml: 2 }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

          {/* Login Button or User Menu */}
          <Box sx={{ ml: 2 }}>
            {currentUser ? (
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
                  <MenuItem component={Link} href="/settings" onClick={handleUserMenuClose}>
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
                  component={Link}
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
                  component={Link}
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
                  component={Link} 
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
              color: '#333333' // Ensuring dark text for contrast
            }}
          >
            {children}
          </Container>
        </Box>
      )}
    </Box>
  );
}
