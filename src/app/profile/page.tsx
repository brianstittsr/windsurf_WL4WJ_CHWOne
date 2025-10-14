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
  const { currentUser, loading } = useAuth();
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
      role: currentUser.role === 'admin' ? UserRole.ADMIN : UserRole.CHW,
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
  }, [currentUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [loading, currentUser, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    if (name) {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNotificationChange = (type: 'email' | 'sms' | 'app') => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      // In a real implementation, we would save the profile to Firestore
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setEditMode(false);
    } catch (err) {
      setError('Failed to save profile changes');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Profile Header */}
        <Box sx={{ 
          p: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'white', 
              color: 'primary.main',
              fontSize: '3rem',
              mr: 3
            }}
          >
            {profile.firstName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="h6">
              {profile.title} at {profile.organization}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={editMode ? <SaveIcon /> : <EditIcon />}
            onClick={editMode ? handleSave : () => setEditMode(true)}
            disabled={saving}
            sx={{ 
              position: 'absolute', 
              right: 24, 
              top: 24,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            {saving ? 'Saving...' : editMode ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </Box>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess(false)}>
            Profile updated successfully
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Profile Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab 
              icon={<PersonIcon />} 
              iconPosition="start" 
              label="Personal Information" 
              id="profile-tab-0" 
              aria-controls="profile-tabpanel-0" 
            />
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label="Security" 
              id="profile-tab-1" 
              aria-controls="profile-tabpanel-1" 
            />
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label="Notifications" 
              id="profile-tab-2" 
              aria-controls="profile-tabpanel-2" 
            />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ px: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={true} // Email should not be editable
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>Professional Information</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value={UserRole.CHW}>Community Health Worker</MenuItem>
                  <MenuItem value={UserRole.CHW_COORDINATOR}>CHW Coordinator</MenuItem>
                  <MenuItem value={UserRole.NONPROFIT_STAFF}>Nonprofit Staff</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization"
                name="organization"
                value={profile.organization}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={profile.title}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>Address</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={profile.city}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={profile.state}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip"
                value={profile.zip}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              For security reasons, you will be asked to confirm your current password before setting a new one.
            </Typography>
            
            <Grid container spacing={3} maxWidth="md">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!editMode}
                >
                  Update Password
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>Two-Factor Authentication</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add an extra layer of security to your account by enabling two-factor authentication.
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              disabled={!editMode}
              sx={{ mt: 2 }}
            >
              Set Up Two-Factor Authentication
            </Button>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control how you receive notifications from CHWOne.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={profile.notifications.email ? "Enabled" : "Disabled"} 
                    color={profile.notifications.email ? "success" : "default"} 
                    size="small" 
                    sx={{ mr: 2 }} 
                  />
                  <Typography variant="subtitle1">Email Notifications</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleNotificationChange('email')}
                    disabled={!editMode}
                  >
                    {profile.notifications.email ? "Disable" : "Enable"}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Receive notifications about new assignments, updates, and important announcements via email.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={profile.notifications.sms ? "Enabled" : "Disabled"} 
                    color={profile.notifications.sms ? "success" : "default"} 
                    size="small" 
                    sx={{ mr: 2 }} 
                  />
                  <Typography variant="subtitle1">SMS Notifications</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleNotificationChange('sms')}
                    disabled={!editMode}
                  >
                    {profile.notifications.sms ? "Disable" : "Enable"}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Receive urgent notifications and reminders via text message.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={profile.notifications.app ? "Enabled" : "Disabled"} 
                    color={profile.notifications.app ? "success" : "default"} 
                    size="small" 
                    sx={{ mr: 2 }} 
                  />
                  <Typography variant="subtitle1">In-App Notifications</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleNotificationChange('app')}
                    disabled={!editMode}
                  >
                    {profile.notifications.app ? "Disable" : "Enable"}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Receive notifications within the CHWOne platform when you&apos;re logged in.
                </Typography>
              </Grid>
            </Grid>
          </Box>
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
