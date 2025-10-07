'use client';

import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon, Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '@/lib/auth/CognitoAuthContext';
import { UserRole } from '@/types/firebase/schema';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '../ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
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
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 12s ease infinite',
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
    }}>
      {/* Top Navigation */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              width={40}
              height={40}
              alt="CHWOne Logo"
              style={{ borderRadius: '50%', marginRight: 8 }}
            />
            <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'rgba(0, 0, 0, 0.87)' }}>CHWOne</Box>
          </Link>

          {/* Desktop Menu */}
          {!isMobile && (
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

          {/* Mobile Menu Button */}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}
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

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <Box sx={{ ml: 2 }}>
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

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          pt: 10,
          px: { xs: 2, sm: 3 },
          pb: 5,
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: { xs: 2, sm: 4 },
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
