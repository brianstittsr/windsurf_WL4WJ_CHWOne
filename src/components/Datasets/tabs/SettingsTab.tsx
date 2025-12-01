'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Divider,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { Dataset } from '@/types/dataset.types';
import { datasetService } from '@/services/DatasetService';

interface SettingsTabProps {
  dataset: Dataset;
  onRefresh: () => void;
}

export default function SettingsTab({ dataset, onRefresh }: SettingsTabProps) {
  const [settings, setSettings] = useState(dataset.config);
  const [permissions, setPermissions] = useState(dataset.permissions);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await datasetService.updateDataset(
        dataset.id,
        {
          config: settings,
          permissions
        },
        'current-user-id'
      );
      setSuccess(true);
      onRefresh();
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Validation Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Validation Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.validation.strictMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    validation: { ...settings.validation, strictMode: e.target.checked }
                  })
                }
              />
            }
            label="Strict Mode (reject records with extra fields)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.validation.allowExtraFields}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    validation: { ...settings.validation, allowExtraFields: e.target.checked }
                  })
                }
              />
            }
            label="Allow Extra Fields"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.validation.validateOnSubmit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    validation: { ...settings.validation, validateOnSubmit: e.target.checked }
                  })
                }
              />
            }
            label="Validate on Submit"
          />
        </Stack>
      </Paper>

      {/* Access Control */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Access Control
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Public Access
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label="None"
                onClick={() => setPermissions({ ...permissions, publicAccess: 'none' })}
                color={permissions.publicAccess === 'none' ? 'primary' : 'default'}
              />
              <Chip
                label="Read"
                onClick={() => setPermissions({ ...permissions, publicAccess: 'read' })}
                color={permissions.publicAccess === 'read' ? 'primary' : 'default'}
              />
              <Chip
                label="Write"
                onClick={() => setPermissions({ ...permissions, publicAccess: 'write' })}
                color={permissions.publicAccess === 'write' ? 'primary' : 'default'}
              />
            </Stack>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={permissions.apiAccess}
                onChange={(e) => setPermissions({ ...permissions, apiAccess: e.target.checked })}
              />
            }
            label="Enable API Access"
          />
        </Stack>
      </Paper>

      {/* Notifications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.emailOnSubmit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnSubmit: e.target.checked }
                  })
                }
              />
            }
            label="Email on New Submission"
          />
          <TextField
            label="Email Recipients"
            placeholder="email1@example.com, email2@example.com"
            value={settings.notifications.emailRecipients.join(', ')}
            onChange={(e) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  emailRecipients: e.target.value.split(',').map(s => s.trim())
                }
              })
            }
            fullWidth
            disabled={!settings.notifications.emailOnSubmit}
          />
        </Stack>
      </Paper>

      {/* Data Retention */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Retention
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.retention.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    retention: { ...settings.retention, enabled: e.target.checked }
                  })
                }
              />
            }
            label="Enable Data Retention Policy"
          />
          <TextField
            label="Retention Period (days)"
            type="number"
            value={settings.retention.days || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                retention: { ...settings.retention, days: parseInt(e.target.value) || undefined }
              })
            }
            disabled={!settings.retention.enabled}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.retention.archiveOldRecords}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    retention: { ...settings.retention, archiveOldRecords: e.target.checked }
                  })
                }
              />
            }
            label="Archive Old Records (instead of delete)"
            disabled={!settings.retention.enabled}
          />
        </Stack>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
}
