'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the navigation structure
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Platform Overview', href: '/platform' },
  { 
    name: 'For CHWs', 
    href: '/for-chws',
    children: [
      { name: 'Benefits for CHWs', href: '/for-chws' },
      { name: 'Features for CHWs', href: '/for-chws/features' },
      { name: 'CHW Success Stories', href: '/for-chws/success-stories' },
    ]
  },
  { 
    name: 'For Associations', 
    href: '/for-associations',
    children: [
      { name: 'Benefits for Associations', href: '/for-associations' },
      { name: 'Features for Associations', href: '/for-associations/features' },
      { name: 'Association Success Stories', href: '/for-associations/success-stories' },
    ]
  },
  { 
    name: 'For Nonprofits', 
    href: '/for-nonprofits',
    children: [
      { name: 'Benefits for Nonprofits', href: '/for-nonprofits' },
      { name: 'Features for Nonprofits', href: '/for-nonprofits/features' },
      { name: 'Nonprofit Success Stories', href: '/for-nonprofits/success-stories' },
    ]
  },
  { 
    name: 'For State Agencies', 
    href: '/for-agencies',
    children: [
      { name: 'Benefits for State Agencies', href: '/for-agencies' },
      { name: 'Features for State Agencies', href: '/for-agencies/features' },
      { name: 'State Agency Success Stories', href: '/for-agencies/success-stories' },
    ]
  },
  { 
    name: 'Features', 
    href: '/features',
    children: [
      { name: 'Grant Management', href: '/features/grant-management' },
      { name: 'Project Tracking', href: '/features/project-tracking' },
      { name: 'Referral System', href: '/features/referral-system' },
      { name: 'Data Collection & Analysis', href: '/features/data' },
      { name: 'Resource Library', href: '/features/resources' },
      { name: 'Platform Enhancement Ideas', href: '/features/ideas' },
    ]
  },
  { name: 'Resources', href: '/resources' },
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function MarketingHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{[key: string]: boolean}>({});
  const pathname = usePathname();

  // For desktop dropdown menus
  const [anchorEl, setAnchorEl] = useState<{[key: string]: HTMLElement | null}>({});

  const handleNavMenuOpen = (event: React.MouseEvent<HTMLElement>, name: string) => {
    setAnchorEl({
      ...anchorEl,
      [name]: event.currentTarget
    });
  };

  const handleNavMenuClose = (name: string) => {
    setAnchorEl({
      ...anchorEl,
      [name]: null
    });
  };

  // For mobile menu
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleMobileSubmenu = (name: string) => {
    setOpenMenus({
      ...openMenus,
      [name]: !openMenus[name]
    });
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 300, pt: 2 }}>
      <List>
        {navigation.map((item) => (
          <React.Fragment key={item.name}>
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => toggleMobileSubmenu(item.name)}>
                    <ListItemText primary={item.name} />
                    {openMenus[item.name] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openMenus[item.name]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.name} disablePadding>
                        <ListItemButton 
                          component={Link}
                          href={child.href}
                          sx={{ pl: 4 }}
                          onClick={() => setMobileOpen(false)}
                          selected={pathname === child.href}
                        >
                          <ListItemText primary={child.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  selected={pathname === item.href}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
        <Button variant="contained" color="primary" component={Link} href="/demo" sx={{ mr: 1 }}>
          Request Demo
        </Button>
        <Button variant="outlined" component={Link} href="/login">
          Sign In
        </Button>
      </Box>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            CHWOne
          </Typography>

          {/* Mobile menu button */}
          {isMobile && (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Desktop menu */}
          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                {navigation.map((item) => (
                  <React.Fragment key={item.name}>
                    {item.children ? (
                      <Box>
                        <Button
                          onClick={(e) => handleNavMenuOpen(e, item.name)}
                          endIcon={<ExpandMoreIcon />}
                          sx={{
                            my: 2,
                            color: 'text.primary',
                            display: 'flex',
                          }}
                        >
                          {item.name}
                        </Button>
                        <Menu
                          anchorEl={anchorEl[item.name]}
                          open={Boolean(anchorEl[item.name])}
                          onClose={() => handleNavMenuClose(item.name)}
                          MenuListProps={{
                            'aria-labelledby': `${item.name}-button`,
                          }}
                        >
                          {item.children.map((child) => (
                            <MenuItem
                              key={child.name}
                              component={Link}
                              href={child.href}
                              onClick={() => handleNavMenuClose(item.name)}
                              selected={pathname === child.href}
                            >
                              {child.name}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                    ) : (
                      <Button
                        component={Link}
                        href={item.href}
                        sx={{
                          my: 2,
                          color: pathname === item.href ? 'primary.main' : 'text.primary',
                          display: 'block',
                          fontWeight: pathname === item.href ? 'bold' : 'normal',
                        }}
                      >
                        {item.name}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </Box>

              {/* CTA Buttons */}
              <Box sx={{ flexGrow: 0 }}>
                <Button variant="contained" color="primary" component={Link} href="/demo" sx={{ mr: 1 }}>
                  Request Demo
                </Button>
                <Button variant="outlined" component={Link} href="/login">
                  Sign In
                </Button>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
