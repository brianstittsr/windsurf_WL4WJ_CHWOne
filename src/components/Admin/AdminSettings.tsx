'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Save as SaveIcon, Restore as RestoreIcon } from '@mui/icons-material';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'CHWOne',
    platformDescription: 'Community Health Worker Management Platform',
    maxFileSize: 25,
    allowPublicRegistration: false,
    requireEmailVerification: true,
    enableAnalytics: true,
    maintenanceMode: false,
    backupFrequency: 'daily',
    logRetention: 90,
    sessionTimeout: 480, // minutes
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would save to Firebase/database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setSettings({
      platformName: 'CHWOne',
      platformDescription: 'Community Health Worker Management Platform',
      maxFileSize: 25,
      allowPublicRegistration: false,
      requireEmailVerification: true,
      enableAnalytics: true,
      maintenanceMode: false,
      backupFrequency: 'daily',
      logRetention: 90,
      sessionTimeout: 480,
    });
    setMessage('Settings restored to defaults');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Platform Settings
      </Typography>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                General Configuration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Platform Name"
                    value={settings.platformName}
                    onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max File Size (MB)"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Platform Description"
                    value={settings.platformDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, platformDescription: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                User Management
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowPublicRegistration}
                        onChange={(e) => setSettings(prev => ({ ...prev, allowPublicRegistration: e.target.checked }))}
                      />
                    }
                    label="Allow Public Registration"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireEmailVerification}
                        onChange={(e) => setSettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
                      />
                    }
                    label="Require Email Verification"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAnalytics}
                        onChange={(e) => setSettings(prev => ({ ...prev, enableAnalytics: e.target.checked }))}
                      />
                    }
                    label="Enable Analytics Tracking"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        color="warning"
                      />
                    }
                    label="Maintenance Mode"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                System Configuration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      value={settings.backupFrequency}
                      label="Backup Frequency"
                      onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    >
                      <MenuItem value="hourly">Hourly</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Log Retention (days)"
                    type="number"
                    value={settings.logRetention}
                    onChange={(e) => setSettings(prev => ({ ...prev, logRetention: Number(e.target.value) }))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  fullWidth
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={handleRestoreDefaults}
                  fullWidth
                >
                  Restore Defaults
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                System Status
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Database</Typography>
                  <Typography variant="body2" color="success.main">Healthy</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">File Storage</Typography>
                  <Typography variant="body2" color="success.main">Healthy</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Email Service</Typography>
                  <Typography variant="body2" color="warning.main">Degraded</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">API Services</Typography>
                  <Typography variant="body2" color="success.main">Healthy</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
