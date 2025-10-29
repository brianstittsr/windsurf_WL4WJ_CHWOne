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
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import ClickableLink from './ClickableLink';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/Layout/LanguageSwitcher';
// ThemeToggle removed - using light mode only

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();

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
      label: t('navigation.dashboard'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/dashboard/region-5', 
      icon: 'location', 
      label: t('navigation.region5'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR] 
    },
    { 
      href: '/dashboard/wl4wj', 
      icon: 'favorite', 
      label: t('navigation.wl4wj'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/admin', 
      icon: 'settings', 
      label: t('navigation.admin'), 
      roles: [UserRole.ADMIN] 
    },
    { 
      href: '/projects', 
      icon: 'sparkle', 
      label: t('navigation.projects'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/grants', 
      icon: 'security', 
      label: t('navigation.grants'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/referrals', 
      icon: 'openLink', 
      label: t('navigation.referrals'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/resources', 
      icon: 'search', 
      label: t('navigation.resources'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/forms', 
      icon: 'clipboard', 
      label: t('navigation.forms'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/datasets', 
      icon: 'database', 
      label: t('navigation.datasets'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/reports', 
      icon: 'analytics', 
      label: t('navigation.reports'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/civicrm', 
      icon: 'people', 
      label: t('navigation.civicrm'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/ai-assistant', 
      icon: 'chat', 
      label: t('navigation.aiAssistant'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    { 
      href: '/training', 
      icon: 'school', 
      label: t('navigation.training'), 
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF] 
    },
    {
      href: '/chw-tools',
      icon: 'build',
      label: 'CHW Tools',
      roles: [UserRole.ADMIN, UserRole.CHW_COORDINATOR, UserRole.CHW, UserRole.NONPROFIT_STAFF]
    },
  ];

  // Mock user role for testing - replace with actual auth context
  const userRole = currentUser?.email?.includes('chw') ? UserRole.CHW : 
                 (currentUser?.email === 'admin@example.com' ? UserRole.ADMIN : UserRole.CHW_COORDINATOR);
  // RBAC DISABLED: Show all menu items regardless of role
      const filteredMenuItems = menuItems; // No filtering

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 24s ease infinite',
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure AppBar is above other content
        }}
      >
        <Toolbar>
          <ClickableLink href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Image 
              src="/images/CHWOneLogoDesign.png" 
              width={40}
              height={40}
              alt="CHWOne Logo"
              style={{ borderRadius: '50%', marginRight: 8 }}
            />
            <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'rgba(0, 0, 0, 0.87)' }}>
              {t('common.appName')}
            </Box>
          </ClickableLink>

          {/* Desktop Menu - Only show when logged in */}
          {!isMobile && currentUser && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 2, position: 'relative', zIndex: 1200 }}>
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.href}
                  component={ClickableLink}
                  href={item.href}
                  sx={{ color: 'rgba(0, 0, 0, 0.87)', zIndex: 1200, position: 'relative' }}
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

          {/* Language Switcher */}
          <LanguageSwitcher />

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
                  <MenuItem component={ClickableLink} href="/profile" onClick={handleUserMenuClose}>
                    <SettingsIcon sx={{ mr: 1 }} /> {t('navigation.myProfile')}
                  </MenuItem>
                  <MenuItem component={ClickableLink} href="/settings" onClick={handleUserMenuClose}>
                    <SettingsIcon sx={{ mr: 1 }} /> {t('common.settings')}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} /> {t('common.logout')}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // Login/Register buttons when not logged in
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  component={ClickableLink}
                  href="/register"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500
                  }}
                >
                  {t('common.register')}
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={ClickableLink}
                  href="/login"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500
                  }}
                >
                  {t('common.login')}
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
                  component={ClickableLink} 
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
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible'
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            height: 'auto'
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
