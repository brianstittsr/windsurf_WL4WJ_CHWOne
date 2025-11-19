'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as CHWIcon,
  Business as NonprofitIcon,
  Groups as AssociationIcon,
  AdminPanelSettings as AdminIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/schema/unified-schema';

// Map roles to icons
const roleIcons: Record<string, React.ReactElement> = {
  [UserRole.CHW]: <CHWIcon />,
  [UserRole.NONPROFIT_STAFF]: <NonprofitIcon />,
  [UserRole.CHW_ASSOCIATION]: <AssociationIcon />,
  [UserRole.ADMIN]: <AdminIcon />,
  [UserRole.CHW_COORDINATOR]: <CHWIcon />,
  [UserRole.WL4WJ_CHW]: <CHWIcon />
};

// Map roles to display names
const roleDisplayNames: Record<string, string> = {
  [UserRole.CHW]: 'Community Health Worker',
  [UserRole.NONPROFIT_STAFF]: 'Nonprofit Staff',
  [UserRole.CHW_ASSOCIATION]: 'CHW Association',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.CHW_COORDINATOR]: 'CHW Coordinator',
  [UserRole.WL4WJ_CHW]: 'WL4WJ CHW',
  [UserRole.CLIENT]: 'Client',
  [UserRole.VIEWER]: 'Viewer',
  [UserRole.DEMO]: 'Demo Account'
};

// Map roles to descriptions
const roleDescriptions: Record<string, string> = {
  [UserRole.CHW]: 'Access your CHW profile, manage your certifications, and connect with the community',
  [UserRole.NONPROFIT_STAFF]: 'Manage your organization, create projects, and coordinate with CHWs',
  [UserRole.CHW_ASSOCIATION]: 'Oversee CHW programs, manage resources, and support professional development',
  [UserRole.ADMIN]: 'Full platform administration and system management',
  [UserRole.CHW_COORDINATOR]: 'Supervise CHW teams and coordinate community health initiatives',
  [UserRole.WL4WJ_CHW]: 'Special access for Women Leading 4 Wellness and Justice CHWs'
};

// Map roles to profile links
const roleProfileLinks: Record<string, string> = {
  [UserRole.CHW]: '/profile',
  [UserRole.NONPROFIT_STAFF]: '/nonprofit-profile',
  [UserRole.CHW_ASSOCIATION]: '/association-profile',
  [UserRole.ADMIN]: '/admin/dashboard'
};

function ProfileManagementContent() {
  const { userProfile, switchRole, currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>({});

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const profilesData: any = {};

      // Load CHW profile if exists
      if (userProfile?.chwProfileId) {
        const chwDoc = await getDoc(doc(db, COLLECTIONS.CHW_PROFILES, userProfile.chwProfileId));
        if (chwDoc.exists()) {
          profilesData.chw = chwDoc.data();
        }
      }

      // Load nonprofit profile if exists
      if (userProfile?.nonprofitProfileId) {
        const nonprofitDoc = await getDoc(doc(db, 'nonprofits', userProfile.nonprofitProfileId));
        if (nonprofitDoc.exists()) {
          profilesData.nonprofit = nonprofitDoc.data();
        }
      }

      setProfileData(profilesData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryRole = async (role: UserRole) => {
    try {
      await switchRole(role);
      window.location.reload();
    } catch (error) {
      console.error('Error setting primary role:', error);
    }
  };

  const handleViewProfile = (role: UserRole) => {
    const link = roleProfileLinks[role];
    if (link) {
      router.push(link);
    }
  };

  if (!userProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const userRoles = userProfile.roles || [userProfile.role];
  const primaryRole = userProfile.primaryRole || userProfile.role;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your roles and profiles across the platform
        </Typography>

        {/* User Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={userProfile.photoURL}
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
              >
                {userProfile.displayName?.charAt(0) || userProfile.email?.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5">
                  {userProfile.displayName || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userProfile.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${userRoles.length} ${userRoles.length === 1 ? 'Role' : 'Roles'}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Roles List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Roles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You have access to {userRoles.length} {userRoles.length === 1 ? 'role' : 'roles'} on the platform
            </Typography>

            {userRoles.length === 0 ? (
              <Alert severity="info">
                No roles assigned. Please contact an administrator.
              </Alert>
            ) : (
              <List>
                {userRoles.map((role, index) => (
                  <React.Fragment key={role}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        bgcolor: role === primaryRole ? 'action.hover' : 'transparent'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: role === primaryRole ? 'primary.main' : 'grey.400' }}>
                          {roleIcons[role] || <CHWIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {roleDisplayNames[role] || role}
                            </Typography>
                            {role === primaryRole && (
                              <Chip
                                label="Primary"
                                size="small"
                                color="primary"
                                icon={<StarIcon />}
                              />
                            )}
                          </Box>
                        }
                        secondary={roleDescriptions[role] || 'Access platform features'}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {roleProfileLinks[role] && (
                            <IconButton
                              edge="end"
                              onClick={() => handleViewProfile(role)}
                              title="View Profile"
                            >
                              <ViewIcon />
                            </IconButton>
                          )}
                          {role !== primaryRole && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<StarBorderIcon />}
                              onClick={() => handleSetPrimaryRole(role)}
                            >
                              Set as Primary
                            </Button>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Profile Summaries */}
        {Object.keys(profileData).length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Profile Summaries
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {profileData.chw && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CHWIcon color="primary" />
                        <Typography variant="h6">CHW Profile</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {profileData.chw.firstName} {profileData.chw.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profileData.chw.serviceArea?.region || 'No region set'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => router.push('/profile')}
                      >
                        View Full Profile
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {profileData.nonprofit && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <NonprofitIcon color="primary" />
                        <Typography variant="h6">Nonprofit Profile</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {profileData.nonprofit.name || 'Organization'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => router.push('/nonprofit-profile')}
                      >
                        View Full Profile
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default function ProfileManagementPage() {
  return (
    <AuthProvider>
      <UnifiedLayout>
        <ProfileManagementContent />
      </UnifiedLayout>
    </AuthProvider>
  );
}
