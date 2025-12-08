'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Typography
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Person as CHWIcon,
  Business as NonprofitIcon,
  Groups as AssociationIcon,
  AdminPanelSettings as AdminIcon,
  Check as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';

// Map roles to icons
const roleIcons: Record<string, React.ReactElement> = {
  [UserRole.CHW]: <CHWIcon fontSize="small" />,
  [UserRole.NONPROFIT_STAFF]: <NonprofitIcon fontSize="small" />,
  [UserRole.CHW_ASSOCIATION]: <AssociationIcon fontSize="small" />,
  [UserRole.ADMIN]: <AdminIcon fontSize="small" />,
  [UserRole.WL4WJ_CHW]: <CHWIcon fontSize="small" />,
  [UserRole.DEMO]: <AdminIcon fontSize="small" />
};

// Map roles to display names
const roleDisplayNames: Record<string, string> = {
  [UserRole.CHW]: 'Community Health Worker',
  [UserRole.NONPROFIT_STAFF]: 'Nonprofit Organization',
  [UserRole.CHW_ASSOCIATION]: 'CHW Association',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.WL4WJ_CHW]: 'WL4WJ CHW',
  [UserRole.DEMO]: 'Demo Account'
};

interface RoleSwitcherProps {
  compact?: boolean; // For mobile/sidebar
}

export default function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { userProfile, switchRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleSwitch = async (role: UserRole) => {
    try {
      await switchRole(role);
      handleClose();
      // Reload the page to update navigation and dashboard
      window.location.reload();
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  // Check if user is admin
  const isAdmin = userProfile?.roles?.includes(UserRole.ADMIN) || 
                  userProfile?.primaryRole === UserRole.ADMIN;

  // All available roles for admin users
  const allAvailableRoles = [
    UserRole.ADMIN,
    UserRole.CHW,
    UserRole.NONPROFIT_STAFF,
    UserRole.CHW_ASSOCIATION,
    UserRole.WL4WJ_CHW,
    UserRole.DEMO
  ];

  // Determine which roles to show
  const rolesToShow = isAdmin ? allAvailableRoles : (userProfile?.roles || []);

  // Don't show switcher if user has only one role (unless they're admin)
  if (!userProfile || (!isAdmin && rolesToShow.length <= 1)) {
    return null;
  }

  const currentRole = userProfile.primaryRole || userProfile.roles?.[0] || UserRole.CHW;
  const currentRoleDisplay = roleDisplayNames[currentRole] || currentRole;
  const currentRoleIcon = roleIcons[currentRole] || <CHWIcon fontSize="small" />;

  if (compact) {
    return (
      <>
        <Button
          onClick={handleClick}
          startIcon={currentRoleIcon}
          endIcon={<ArrowDownIcon />}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            borderColor: 'divider'
          }}
        >
          {currentRoleDisplay}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { minWidth: 250 }
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {isAdmin ? 'Switch Role (Admin Mode)' : 'Switch Role'}
            </Typography>
          </Box>
          <Divider />
          {rolesToShow.map((role) => (
            <MenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              selected={role === currentRole}
            >
              <ListItemIcon>
                {roleIcons[role] || <CHWIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {roleDisplayNames[role] || role}
              </ListItemText>
              {role === currentRole && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<SwapIcon />}
        endIcon={<ArrowDownIcon />}
        variant="outlined"
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentRoleIcon}
          <Box>
            <Typography variant="caption" display="block" sx={{ lineHeight: 1, textAlign: 'left' }}>
              Active Role
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentRoleDisplay}
            </Typography>
          </Box>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 300 }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {isAdmin ? 'Switch Active Role (Admin Mode)' : 'Switch Active Role'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isAdmin ? `All ${rolesToShow.length} roles available` : `You have ${userProfile.roles?.length || 0} roles`}
          </Typography>
        </Box>
        <Divider />
        {rolesToShow.map((role) => (
          <MenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            selected={role === currentRole}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              {roleIcons[role] || <CHWIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={roleDisplayNames[role] || role}
              secondary={role === currentRole ? 'Currently active' : 'Click to switch'}
            />
            {role === currentRole && (
              <Chip
                label="Active"
                size="small"
                color="primary"
                sx={{ height: 24 }}
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
