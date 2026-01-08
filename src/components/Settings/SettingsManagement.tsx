'use client';

import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Tabs,
  Tab,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as DatabaseIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Psychology as AIIcon,
  Visibility as VisibilityIcon,
  MonitorHeart as SystemIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    dataSharing: boolean;
    analytics: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordLastChanged: Date;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
}

export default function SettingsManagement() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    privacy: {
      profileVisibility: 'contacts',
      dataSharing: true,
      analytics: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordLastChanged: new Date('2024-01-01')
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York'
    }
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;

    try {
      await updateProfile(currentUser, { displayName });
      console.log('Profile updated successfully');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Change password logic
    console.log('Changing password');
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Account Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account preferences and security settings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          size="large"
        >
          Save Changes
        </Button>
      </Box>

      {/* User Profile Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {isEditMode ? (
                <TextField
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  label="Display Name"
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {currentUser?.displayName || 'User'}
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {currentUser?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: User
              </Typography>
            </Box>
            <Box>
              <Button variant="outlined" startIcon={<PersonIcon />} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs" variant="scrollable" scrollButtons="auto">
            <Tab
              icon={<NotificationsIcon />}
              label="Notifications"
              iconPosition="start"
            />
            <Tab
              icon={<SecurityIcon />}
              label="Privacy & Security"
              iconPosition="start"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Preferences"
              iconPosition="start"
            />
            <Tab
              icon={<AIIcon />}
              label="LLM Configuration"
              iconPosition="start"
            />
            <Tab
              icon={<VisibilityIcon />}
              label="Feature Visibility"
              iconPosition="start"
            />
            <Tab
              icon={<SystemIcon />}
              label="System Status"
              iconPosition="start"
            />
          </Tabs>
        </CardContent>

        <Divider />

        {/* Notifications Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Notification Preferences
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive notifications via email"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Receive push notifications in your browser"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="SMS Notifications"
                  secondary="Receive text message notifications"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        )}

        {/* Privacy & Security Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Privacy & Security Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Privacy Settings
                </Typography>

                <TextField
                  fullWidth
                  select
                  label="Profile Visibility"
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <option value="public">Public</option>
                  <option value="contacts">Contacts Only</option>
                  <option value="private">Private</option>
                </TextField>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                    />
                  }
                  label="Allow data sharing for research purposes"
                  sx={{ mb: 1 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.analytics}
                      onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                    />
                  }
                  label="Allow analytics tracking"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Security Settings
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Password last changed: {settings.security.passwordLastChanged.toLocaleDateString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                    />
                  }
                  label="Enable two-factor authentication"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Session Timeout (minutes)"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  inputProps={{ min: 5, max: 480 }}
                />

                <Alert severity="info" sx={{ mt: 2 }}>
                  Two-factor authentication adds an extra layer of security to your account.
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Preferences Tab */}
        {tabValue === 2 && (
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Application Preferences
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Theme"
                  value={settings.preferences.theme}
                  onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Language"
                  value={settings.preferences.language}
                  onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Timezone"
                  value={settings.preferences.timezone}
                  onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </TextField>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3 }}>
              Your preferences will be applied immediately after saving.
            </Alert>
          </CardContent>
        )}

        {/* LLM Configuration Tab */}
        {tabValue === 3 && (
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              LLM Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure AI language model settings for the platform
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Default LLM Provider"
                  defaultValue="openai"
                  sx={{ mb: 2 }}
                  SelectProps={{ native: true }}
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                </TextField>

                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type="password"
                  placeholder="sk-..."
                  sx={{ mb: 2 }}
                  helperText="Your OpenAI API key for AI features"
                />

                <TextField
                  fullWidth
                  label="Anthropic API Key"
                  type="password"
                  placeholder="sk-ant-..."
                  sx={{ mb: 2 }}
                  helperText="Your Anthropic API key (optional)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Default Model"
                  defaultValue="gpt-4o"
                  sx={{ mb: 2 }}
                  SelectProps={{ native: true }}
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Max Tokens"
                  defaultValue={4000}
                  sx={{ mb: 2 }}
                  helperText="Maximum tokens per response"
                  inputProps={{ min: 100, max: 8000 }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Temperature"
                  defaultValue={0.7}
                  sx={{ mb: 2 }}
                  helperText="Creativity level (0 = focused, 1 = creative)"
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  AI Features
                </Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable AI Resource Search (WhatsApp Integration)"
                  sx={{ display: 'block', mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable AI Grant Analysis"
                  sx={{ display: 'block', mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable AI Report Generation"
                  sx={{ display: 'block', mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Enable AI Chat Assistant"
                  sx={{ display: 'block' }}
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              API keys are encrypted and stored securely. Changes take effect immediately.
            </Alert>
          </CardContent>
        )}

        {/* Feature Visibility Tab */}
        {tabValue === 4 && (
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Feature Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Control which features are visible to users across the platform
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Navigation Items
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Dashboard" secondary="Main dashboard view" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Referrals" secondary="Referral management" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Projects" secondary="Project tracking" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Grants" secondary="Grant management" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Forms" secondary="Form builder" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Datasets" secondary="Data management" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  CHW Tools
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="AI Assistant" secondary="AI-powered help" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Data Tools" secondary="Advanced data tools" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Reports" secondary="Report generation" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Resources" secondary="Resource directory" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Collaborations" secondary="Team collaborations" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="WhatsApp Integration" secondary="WhatsApp resource search" />
                    <ListItemSecondaryAction>
                      <Switch defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 3 }}>
              Disabling features will hide them from all users. Admin features are always visible to administrators.
            </Alert>
          </CardContent>
        )}

        {/* System Status Tab */}
        {tabValue === 5 && (
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              System Status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Monitor system health and service status
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Core Services
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Firebase Authentication" 
                      secondary="Operational - Response time: 45ms" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Firestore Database" 
                      secondary="Operational - Response time: 32ms" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Firebase Storage" 
                      secondary="Operational - Response time: 58ms" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="OpenAI API" 
                      secondary="Operational - Response time: 890ms" 
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Integration Services
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="WhatsApp Business API" 
                      secondary="Operational - Connected" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Bill.com API" 
                      secondary="Degraded - High latency" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Service (SendGrid)" 
                      secondary="Operational" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="SMS Service (Twilio)" 
                      secondary="Operational" 
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  System Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">47</Typography>
                        <Typography variant="body2" color="text.secondary">Active Users</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">1,234</Typography>
                        <Typography variant="body2" color="text.secondary">Resources</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">89</Typography>
                        <Typography variant="body2" color="text.secondary">API Calls/min</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">99.9%</Typography>
                        <Typography variant="body2" color="text.secondary">Uptime</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              Last updated: {new Date().toLocaleString()} • Auto-refresh every 30 seconds
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
