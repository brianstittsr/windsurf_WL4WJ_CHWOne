'use client';

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
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
  useTheme
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon, Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import Link from 'next/link';
import Image from 'next/image';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      roles: [UserRole.ADMIN, UserRole.CHW_ASSOCIATION, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/dashboard/region-5', 
      icon: 'location', 
      label: 'Region 5', 
      roles: [UserRole.ADMIN, UserRole.CHW_ASSOCIATION] 
    },
    { 
      href: '/dashboard/wl4wj', 
      icon: 'favorite', 
      label: 'WL4WJ', 
      roles: [UserRole.ADMIN, UserRole.CHW_ASSOCIATION, UserRole.NONPROFIT_STAFF] 
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
      roles: [UserRole.ADMIN, UserRole.CHW_ASSOCIATION] 
    },
  ];

  // Mock user role for testing - replace with actual auth context
  const userRole = currentUser?.email?.includes('chw') ? UserRole.CHW : 
                 (currentUser?.email === 'admin@example.com' ? UserRole.ADMIN : UserRole.CHW_ASSOCIATION);
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
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
            <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'rgba(0, 0, 0, 0.87)' }}>CHWOne</Box>
          </Link>

          {/* Desktop Menu - Only show when logged in */}
          {!isMobile && currentUser && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2 }}>
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{ color: 'rgba(0, 0, 0, 0.87)' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Spacer when not showing menu */}
          {(!currentUser || isMobile) && <Box sx={{ flexGrow: 1 }} />}

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
                    fontWeight: 500
                  }}
                >
                  Register
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  href="/login"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500
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
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton 
                  component={Link} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content - No Container */}
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
    </Box>
  );
}
