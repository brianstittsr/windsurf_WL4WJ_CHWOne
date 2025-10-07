'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  SmartToy as AIIcon,
  Description as DocsIcon,
  Sms as SmsIcon,
  Facebook as FacebookIcon,
  VideoCall as ZoomIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface IntegrationStatus {
  connected: boolean;
  lastTested?: Date;
  error?: string;
}

interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  baseUrl?: string;
  username?: string;
  password?: string;
  settings: Record<string, any>;
}

export default function AdminIntegrations() {
  const [integrations, setIntegrations] = useState({
    '3cx': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        baseUrl: '',
        settings: {}
      } as IntegrationConfig
    },
    'empowerus': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        baseUrl: '',
        settings: {}
      } as IntegrationConfig
    },
    'openai': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        settings: { model: 'gpt-4', temperature: 0.7 }
      } as IntegrationConfig
    },
    'googledocs': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        settings: {}
      } as IntegrationConfig
    },
    'sms': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        apiSecret: '',
        settings: { provider: 'twilio' }
      } as IntegrationConfig
    },
    'facebook': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        apiSecret: '',
        settings: {}
      } as IntegrationConfig
    },
    'zoom': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        apiKey: '',
        apiSecret: '',
        webhookUrl: '',
        settings: {}
      } as IntegrationConfig
    },
    'imap': {
      status: { connected: false } as IntegrationStatus,
      config: {
        enabled: false,
        username: '',
        password: '',
        baseUrl: '',
        settings: { port: 993, ssl: true }
      } as IntegrationConfig
    }
  });

  const [testing, setTesting] = useState<string | null>(null);
  const [configDialog, setConfigDialog] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<IntegrationConfig | null>(null);

  const integrationInfo = {
    '3cx': {
      name: '3CX Phone System',
      description: 'Integrate with 3CX for call management and telephony features',
      icon: <PhoneIcon />,
      color: '#4CAF50'
    },
    'empowerus': {
      name: 'EmpowerUS',
      description: 'Connect with EmpowerUS for workforce development and training',
      icon: <BusinessIcon />,
      color: '#2196F3'
    },
    'openai': {
      name: 'OpenAI',
      description: 'AI-powered form generation and text analysis',
      icon: <AIIcon />,
      color: '#10A37F'
    },
    'googledocs': {
      name: 'Google Docs',
      description: 'Document creation and management integration',
      icon: <DocsIcon />,
      color: '#4285F4'
    },
    'sms': {
      name: 'SMS Text Messaging',
      description: 'Send and receive SMS notifications and alerts',
      icon: <SmsIcon />,
      color: '#FF9800'
    },
    'facebook': {
      name: 'Facebook',
      description: 'Social media integration for community outreach',
      icon: <FacebookIcon />,
      color: '#1877F2'
    },
    'zoom': {
      name: 'Zoom',
      description: 'Video conferencing and meeting integration',
      icon: <ZoomIcon />,
      color: '#2D8CFF'
    },
    'imap': {
      name: 'IMAP Email',
      description: 'Email integration for notifications and communication',
      icon: <EmailIcon />,
      color: '#E91E63'
    }
  };

  const handleToggleIntegration = (key: string) => {
    setIntegrations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        config: {
          ...prev[key].config,
          enabled: !prev[key].config.enabled
        }
      }
    }));
  };

  const handleTestConnection = async (key: string) => {
    setTesting(key);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIntegrations(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: {
            connected: true,
            lastTested: new Date()
          }
        }
      }));
    } catch (error) {
      setIntegrations(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: {
            connected: false,
            lastTested: new Date(),
            error: 'Connection failed'
          }
        }
      }));
    } finally {
      setTesting(null);
    }
  };

  const handleConfigure = (key: string) => {
    setConfigDialog(key);
    setTempConfig(integrations[key].config);
  };

  const handleSaveConfig = () => {
    if (configDialog && tempConfig) {
      setIntegrations(prev => ({
        ...prev,
        [configDialog]: {
          ...prev[configDialog],
          config: tempConfig
        }
      }));
      setConfigDialog(null);
      setTempConfig(null);
    }
  };

  const renderIntegrationCard = (key: string) => {
    const integration = integrations[key];
    const info = integrationInfo[key];

    return (
      <Grid item xs={12} md={6} key={key}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: info.color }}>
                {info.icon}
              </Avatar>
            }
            title={info.name}
            subheader={info.description}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {integration.status.connected ? (
                  <ConnectedIcon color="success" />
                ) : integration.status.error ? (
                  <ErrorIcon color="error" />
                ) : null}
                <FormControlLabel
                  control={
                    <Switch
                      checked={integration.config.enabled}
                      onChange={() => handleToggleIntegration(key)}
                    />
                  }
                  label=""
                />
              </Box>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={integration.config.enabled ? 'Enabled' : 'Disabled'}
                color={integration.config.enabled ? 'success' : 'default'}
                size="small"
              />
              {integration.status.lastTested && (
                <Chip
                  label={`Tested ${integration.status.lastTested.toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            {integration.status.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {integration.status.error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => handleConfigure(key)}
                size="small"
              >
                Configure
              </Button>
              <Button
                variant="outlined"
                startIcon={testing === key ? <RefreshIcon /> : <TestIcon />}
                onClick={() => handleTestConnection(key)}
                disabled={testing === key || !integration.config.enabled}
                size="small"
              >
                {testing === key ? 'Testing...' : 'Test'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderConfigDialog = () => {
    if (!configDialog || !tempConfig) return null;

    const info = integrationInfo[configDialog];

    return (
      <Dialog open={!!configDialog} onClose={() => setConfigDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: info.color }}>
              {info.icon}
            </Avatar>
            Configure {info.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Common fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={tempConfig.apiKey || ''}
                onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
              />
            </Grid>

            {/* Specific fields based on integration */}
            {configDialog === '3cx' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="3CX Server URL"
                  value={tempConfig.baseUrl || ''}
                  onChange={(e) => setTempConfig({ ...tempConfig, baseUrl: e.target.value })}
                  placeholder="https://your-3cx-server.com"
                />
              </Grid>
            )}

            {configDialog === 'empowerus' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="EmpowerUS API URL"
                  value={tempConfig.baseUrl || ''}
                  onChange={(e) => setTempConfig({ ...tempConfig, baseUrl: e.target.value })}
                />
              </Grid>
            )}

            {configDialog === 'openai' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={tempConfig.settings?.model || 'gpt-4'}
                    onChange={(e) => setTempConfig({
                      ...tempConfig,
                      settings: { ...tempConfig.settings, model: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    type="number"
                    inputProps={{ min: 0, max: 2, step: 0.1 }}
                    value={tempConfig.settings?.temperature || 0.7}
                    onChange={(e) => setTempConfig({
                      ...tempConfig,
                      settings: { ...tempConfig.settings, temperature: parseFloat(e.target.value) }
                    })}
                  />
                </Grid>
              </>
            )}

            {(configDialog === 'sms' || configDialog === 'facebook' || configDialog === 'zoom') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Secret"
                  type="password"
                  value={tempConfig.apiSecret || ''}
                  onChange={(e) => setTempConfig({ ...tempConfig, apiSecret: e.target.value })}
                />
              </Grid>
            )}

            {configDialog === 'imap' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IMAP Server"
                    value={tempConfig.baseUrl || ''}
                    onChange={(e) => setTempConfig({ ...tempConfig, baseUrl: e.target.value })}
                    placeholder="imap.gmail.com"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={tempConfig.username || ''}
                    onChange={(e) => setTempConfig({ ...tempConfig, username: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={tempConfig.password || ''}
                    onChange={(e) => setTempConfig({ ...tempConfig, password: e.target.value })}
                  />
                </Grid>
              </>
            )}

            {(configDialog === 'zoom' || configDialog === 'googledocs') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value={tempConfig.webhookUrl || ''}
                  onChange={(e) => setTempConfig({ ...tempConfig, webhookUrl: e.target.value })}
                  placeholder="https://your-app.com/webhooks/integration"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(null)}>Cancel</Button>
          <Button onClick={handleSaveConfig} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Integrations
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        Configure external service integrations to extend platform functionality.
        Enable integrations you need and configure their settings.
      </Alert>

      <Grid container spacing={3}>
        {Object.keys(integrations).map(key => renderIntegrationCard(key))}
      </Grid>

      {renderConfigDialog()}

      {/* Integration Status Summary */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Integration Status Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {Object.values(integrations).filter(i => i.status.connected).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {Object.values(integrations).filter(i => i.config.enabled).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enabled
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {Object.values(integrations).filter(i => i.status.error).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Errors
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">
                  {Object.keys(integrations).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Available
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
