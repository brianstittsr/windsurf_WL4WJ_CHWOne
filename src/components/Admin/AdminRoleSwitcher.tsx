'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Groups as GroupsIcon,
  AdminPanelSettings as AdminIcon,
  ExpandLess,
  ExpandMore,
  Visibility as VisibilityIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';

interface RoleOption {
  role: UserRole;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: UserRole.ADMIN,
    label: 'Admin',
    icon: <AdminIcon />,
    description: 'Full platform access',
  },
  {
    role: UserRole.CHW,
    label: 'Community Health Worker',
    icon: <PersonIcon />,
    description: 'CHW profile and tools',
  },
  {
    role: UserRole.NONPROFIT_STAFF,
    label: 'Nonprofit Staff',
    icon: <BusinessIcon />,
    description: 'Nonprofit organization view',
  },
  {
    role: UserRole.CHW_ASSOCIATION,
    label: 'CHW Association',
    icon: <GroupsIcon />,
    description: 'Association management',
  },
  {
    role: UserRole.WL4WJ_CHW,
    label: 'WL4WJ CHW',
    icon: <PersonIcon />,
    description: 'Women Leading 4 Wellness & Justice',
  },
  {
    role: UserRole.DEMO,
    label: 'Demo User',
    icon: <VisibilityIcon />,
    description: 'Demo account view',
  },
];

export default function AdminRoleSwitcher() {
  const { userProfile, switchRole } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('=== AdminRoleSwitcher Debug ===');
    console.log('userProfile:', userProfile);
    console.log('userProfile.role:', userProfile?.role);
    console.log('userProfile.roles:', userProfile?.roles);
    console.log('UserRole.ADMIN:', UserRole.ADMIN);
    console.log('Is ADMIN?:', userProfile?.role === UserRole.ADMIN);
    console.log('Has ADMIN in roles?:', userProfile?.roles?.includes(UserRole.ADMIN));
    console.log('===============================');
  }, [userProfile]);

  // Only show for admin users - check both role and roles array (case-insensitive)
  const roleUpperCase = userProfile?.role?.toUpperCase();
  const rolesUpperCase = userProfile?.roles?.map(r => r?.toUpperCase());
  const isAdmin = roleUpperCase === 'ADMIN' || 
                  rolesUpperCase?.includes('ADMIN') ||
                  userProfile?.role === UserRole.ADMIN || 
                  userProfile?.roles?.includes(UserRole.ADMIN);

  if (!userProfile || !isAdmin) {
    console.log('AdminRoleSwitcher - Not showing. Profile:', !!userProfile, 'isAdmin:', isAdmin);
    return null;
  }

  console.log('AdminRoleSwitcher - ✅ RENDERING COMPONENT');

  const currentRole = userProfile.primaryRole || userProfile.role;
  const actualRole = userProfile.role; // Always ADMIN

  const handleRoleSwitch = async (role: UserRole) => {
    if (role === currentRole) return;

    try {
      setSwitching(true);
      await switchRole(role);
      
      // Reload page to apply new role context
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error switching role:', error);
      setSwitching(false);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getCurrentRoleOption = () => {
    return ROLE_OPTIONS.find((opt) => opt.role === currentRole) || ROLE_OPTIONS[0];
  };

  const currentRoleOption = getCurrentRoleOption();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 320,
      }}
    >
      <Card
        elevation={8}
        sx={{
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Collapsed View */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={toggleExpanded}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminIcon sx={{ color: 'white' }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', lineHeight: 1 }}
                >
                  Testing as:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2 }}
                >
                  {currentRoleOption.label}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: 'white' }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* Actual Role Badge */}
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`Actual: ${actualRole}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
              }}
            />
          </Box>

          {/* Expanded View */}
          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', mb: 1, display: 'block' }}
              >
                Switch to Role:
              </Typography>

              <List dense sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 0 }}>
                {ROLE_OPTIONS.map((option) => (
                  <ListItem key={option.role} disablePadding>
                    <ListItemButton
                      onClick={() => handleRoleSwitch(option.role)}
                      disabled={switching || option.role === currentRole}
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        },
                        '&.Mui-disabled': {
                          opacity: 1,
                          bgcolor: 'rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: 'white' }}>
                        {option.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={option.label}
                        secondary={option.description}
                        primaryTypographyProps={{
                          sx: { color: 'white', fontSize: '0.875rem', fontWeight: 'medium' },
                        }}
                        secondaryTypographyProps={{
                          sx: { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' },
                        }}
                      />
                      {option.role === currentRole && (
                        <CheckIcon sx={{ color: 'white', fontSize: 20 }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Button
                fullWidth
                variant="contained"
                startIcon={<SwapIcon />}
                onClick={toggleExpanded}
                sx={{
                  mt: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                Close
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Info Tooltip */}
      {!expanded && (
        <Tooltip title="Click to switch viewing role" placement="left">
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                },
              },
            }}
            onClick={toggleExpanded}
          >
            <SwapIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
