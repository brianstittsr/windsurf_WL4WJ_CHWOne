'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  Box, 
  Divider, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Person as PersonIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase/schema';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// User profile interface
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  organization: string;
  title: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notifications: {
    email: boolean;
    sms: boolean;
    app: boolean;
  };
}

// Inner component that uses the auth context
function ProfileContent() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.CHW,
    organization: '',
    title: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notifications: {
      email: true,
      sms: false,
      app: true
    }
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // In a real implementation, we would fetch the user profile from Firestore
    // For now, we'll just set some mock data based on the current user
    setProfile({
      firstName: currentUser.displayName?.split(' ')[0] || '',
      lastName: currentUser.displayName?.split(' ')[1] || '',
      email: currentUser.email || '',
      role: userProfile?.role === 'admin' ? UserRole.ADMIN : UserRole.CHW,
      organization: 'CHWOne Organization',
      title: 'Community Health Worker',
      phone: '555-123-4567',
      bio: 'Dedicated community health worker with a passion for improving health outcomes in underserved communities.',
      address: '123 Main Street',
      city: 'Charlotte',
      state: 'NC',
      zip: '28202',
      notifications: {
        email: true,
        sms: false,
        app: true
      }
    });
  }, [currentUser, userProfile]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (type: 'email' | 'sms' | 'app') => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSaveProfile = () => {
    setSaving(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setEditMode(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: '#1a365d',
              fontSize: '2.5rem'
            }}
          >
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4" gutterBottom>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile.title} • {profile.organization}
            </Typography>
            <Chip 
              label={profile.role === UserRole.ADMIN ? 'Administrator' : 'Community Health Worker'} 
              color={profile.role === UserRole.ADMIN ? 'primary' : 'secondary'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Button 
              variant={editMode ? "outlined" : "contained"}
              startIcon={editMode ? <SaveIcon /> : <EditIcon />}
              onClick={() => {
                if (editMode) {
                  handleSaveProfile();
                } else {
                  setEditMode(true);
                }
              }}
              sx={{ 
                bgcolor: editMode ? 'transparent' : '#1a365d',
                '&:hover': {
                  bgcolor: editMode ? 'rgba(26, 54, 93, 0.08)' : '#0f2942'
                }
              }}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<PersonIcon />} label="Personal Info" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profile.firstName}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={profile.role}
                  label="Role"
                  name="role"
                  disabled={true} // Always disabled as role changes require admin approval
                >
                  <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                  <MenuItem value={UserRole.CHW}>Community Health Worker</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={profile.bio}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={profile.city}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={profile.state}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip"
                value={profile.zip}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Button 
            variant="outlined" 
            color="primary"
            sx={{ mb: 2 }}
          >
            Change Password
          </Button>
          <Typography variant="body2" color="text.secondary" paragraph>
            Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant={profile.notifications.email ? "contained" : "outlined"}
                      onClick={() => handleNotificationChange('email')}
                      disabled={!editMode}
                      sx={{ 
                        mr: 1,
                        bgcolor: profile.notifications.email ? '#1a365d' : 'transparent',
                        '&:hover': {
                          bgcolor: profile.notifications.email ? '#0f2942' : 'rgba(26, 54, 93, 0.08)'
                        }
                      }}
                    >
                      Email Notifications
                    </Button>
                    <Button
                      variant={profile.notifications.sms ? "contained" : "outlined"}
                      onClick={() => handleNotificationChange('sms')}
                      disabled={!editMode}
                      sx={{ 
                        mr: 1,
                        bgcolor: profile.notifications.sms ? '#1a365d' : 'transparent',
                        '&:hover': {
                          bgcolor: profile.notifications.sms ? '#0f2942' : 'rgba(26, 54, 93, 0.08)'
                        }
                      }}
                    >
                      SMS Notifications
                    </Button>
                    <Button
                      variant={profile.notifications.app ? "contained" : "outlined"}
                      onClick={() => handleNotificationChange('app')}
                      disabled={!editMode}
                      sx={{ 
                        bgcolor: profile.notifications.app ? '#1a365d' : 'transparent',
                        '&:hover': {
                          bgcolor: profile.notifications.app ? '#0f2942' : 'rgba(26, 54, 93, 0.08)'
                        }
                      }}
                    >
                      In-App Notifications
                    </Button>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

// Export the wrapped component with AuthProvider
export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}
