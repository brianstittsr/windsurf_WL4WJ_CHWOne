'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  Button,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch
} from '@mui/material';
import {
  QrCode2 as QRIcon,
  Print as PrintIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  CreditCard as CardIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { QRCodeStrategy } from '@/types/qr-tracking-wizard.types';

const QR_APPROACHES = [
  {
    value: 'individual',
    label: 'Individual QR Codes',
    icon: <PersonIcon />,
    description: 'Each participant gets their own unique QR code',
    pros: ['Automatic identification', 'Faster check-in', 'Better tracking'],
    cons: ['More printing', 'Distribution logistics']
  },
  {
    value: 'single',
    label: 'Single Shared QR Code',
    icon: <GroupIcon />,
    description: 'One QR code for all participants to scan',
    pros: ['Easy to display', 'No distribution needed', 'Simple setup'],
    cons: ['Manual name entry', 'Slower check-in', 'Less automated']
  },
  {
    value: 'hybrid',
    label: 'Hybrid Approach',
    icon: <QRIcon />,
    description: 'Individual codes + shared backup option',
    pros: ['Best of both worlds', 'Flexible', 'Backup option'],
    cons: ['More complex', 'Requires training']
  }
];

const PRINT_FORMATS = [
  { value: 'badge', label: 'Name Badge', icon: <BadgeIcon />, size: '3" x 4"' },
  { value: 'card', label: 'Wallet Card', icon: <CardIcon />, size: '2" x 3.5"' },
  { value: 'sticker', label: 'Sticker Label', icon: <QRIcon />, size: '2" x 2"' },
  { value: 'sheet', label: 'Full Sheet', icon: <PrintIcon />, size: '8.5" x 11"' }
];

const DISTRIBUTION_METHODS = [
  { value: 'mail', label: 'Mail to Participants', icon: '📬' },
  { value: 'email', label: 'Email Digital Copy', icon: '📧' },
  { value: 'pickup', label: 'In-Person Pickup', icon: '🤝' },
  { value: 'first_session', label: 'Distribute at First Session', icon: '📅' },
  { value: 'partner', label: 'Through Partner Organizations', icon: '🏢' }
];

export default function Step6QRCodeStrategy() {
  const { wizardState, updateStep6 } = useQRWizard();
  
  const [qrStrategy, setQrStrategy] = useState<QRCodeStrategy>(
    wizardState.step6_qr_strategy || {
      approach: 'individual',
      printFormat: 'badge',
      includePhoto: false,
      includeName: true,
      includeId: true,
      includeInstructions: true,
      distributionMethod: ['first_session'],
      backupPlan: '',
      qrCodeSettings: {
        size: 'medium',
        errorCorrection: 'medium',
        includeUrl: true,
        customDomain: ''
      }
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep6(qrStrategy);
    }, 1000);
    return () => clearTimeout(timer);
  }, [qrStrategy, updateStep6]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-qr-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 6,
          data: {
            approach: qrStrategy.approach,
            printFormat: qrStrategy.printFormat,
            distributionMethod: qrStrategy.distributionMethod,
            participantCount: wizardState.step4_participants?.participants?.length || 0,
            programInfo: wizardState.step2_program?.basicInfo
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.analysis);
      } else {
        setAiSuggestions(
          `QR Code Strategy Assessment:\n\n` +
          `✅ ${qrStrategy.approach === 'individual' ? 'Individual codes' : 'Shared code'} approach selected\n` +
          `✅ ${qrStrategy.printFormat} format chosen\n` +
          `💡 Consider backup distribution methods`
        );
      }
    } catch (error) {
      console.error('Error analyzing QR strategy:', error);
      setAiSuggestions(
        `Analysis unavailable. Your QR strategy has been saved.\n\n` +
        `✅ Strategy configured\n` +
        `💡 Proceed to workflows and training`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedApproach = QR_APPROACHES.find(a => a.value === qrStrategy.approach);

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Define how QR codes will be generated, printed, and distributed to participants.
      </Alert>

      <Grid container spacing={3}>
        {/* QR Code Approach */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              QR Code Approach
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <RadioGroup
              value={qrStrategy.approach}
              onChange={(e) => setQrStrategy(prev => ({ ...prev, approach: e.target.value as any }))}
            >
              <Grid container spacing={2}>
                {QR_APPROACHES.map(approach => (
                  <Grid item xs={12} md={4} key={approach.value}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        border: qrStrategy.approach === approach.value ? 2 : 1,
                        borderColor: qrStrategy.approach === approach.value ? 'primary.main' : 'divider'
                      }}
                      onClick={() => setQrStrategy(prev => ({ ...prev, approach: approach.value as any }))}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <FormControlLabel
                            value={approach.value}
                            control={<Radio />}
                            label=""
                            sx={{ mr: 1 }}
                          />
                          {approach.icon}
                          <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            {approach.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {approach.description}
                        </Typography>
                        <Typography variant="caption" color="success.main" display="block" sx={{ mb: 0.5 }}>
                          ✓ {approach.pros.join(' • ')}
                        </Typography>
                        <Typography variant="caption" color="warning.main" display="block">
                          ⚠ {approach.cons.join(' • ')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Print Format */}
        {qrStrategy.approach !== 'single' && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Print Format
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Format</InputLabel>
                <Select
                  value={qrStrategy.printFormat}
                  label="Format"
                  onChange={(e) => setQrStrategy(prev => ({ ...prev, printFormat: e.target.value as any }))}
                >
                  {PRINT_FORMATS.map(format => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.icon} {format.label} ({format.size})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Include on Print:
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={qrStrategy.includeName}
                      onChange={(e) => setQrStrategy(prev => ({ ...prev, includeName: e.target.checked }))}
                    />
                  }
                  label="Participant Name"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={qrStrategy.includeId}
                      onChange={(e) => setQrStrategy(prev => ({ ...prev, includeId: e.target.checked }))}
                    />
                  }
                  label="Participant ID"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={qrStrategy.includePhoto}
                      onChange={(e) => setQrStrategy(prev => ({ ...prev, includePhoto: e.target.checked }))}
                    />
                  }
                  label="Photo (if available)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={qrStrategy.includeInstructions}
                      onChange={(e) => setQrStrategy(prev => ({ ...prev, includeInstructions: e.target.checked }))}
                    />
                  }
                  label="Usage Instructions"
                />
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* QR Code Settings */}
        <Grid item xs={12} md={qrStrategy.approach !== 'single' ? 6 : 12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              QR Code Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>QR Code Size</InputLabel>
                  <Select
                    value={qrStrategy.qrCodeSettings.size}
                    label="QR Code Size"
                    onChange={(e) => setQrStrategy(prev => ({
                      ...prev,
                      qrCodeSettings: { ...prev.qrCodeSettings, size: e.target.value as any }
                    }))}
                  >
                    <MenuItem value="small">Small (1" x 1")</MenuItem>
                    <MenuItem value="medium">Medium (1.5" x 1.5")</MenuItem>
                    <MenuItem value="large">Large (2" x 2")</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Error Correction</InputLabel>
                  <Select
                    value={qrStrategy.qrCodeSettings.errorCorrection}
                    label="Error Correction"
                    onChange={(e) => setQrStrategy(prev => ({
                      ...prev,
                      qrCodeSettings: { ...prev.qrCodeSettings, errorCorrection: e.target.value as any }
                    }))}
                  >
                    <MenuItem value="low">Low (7% recovery)</MenuItem>
                    <MenuItem value="medium">Medium (15% recovery)</MenuItem>
                    <MenuItem value="high">High (30% recovery)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={qrStrategy.qrCodeSettings.includeUrl}
                      onChange={(e) => setQrStrategy(prev => ({
                        ...prev,
                        qrCodeSettings: { ...prev.qrCodeSettings, includeUrl: e.target.checked }
                      }))}
                    />
                  }
                  label="Include URL below QR code"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Domain (optional)"
                  placeholder="track.yourorg.com"
                  value={qrStrategy.qrCodeSettings.customDomain}
                  onChange={(e) => setQrStrategy(prev => ({
                    ...prev,
                    qrCodeSettings: { ...prev.qrCodeSettings, customDomain: e.target.value }
                  }))}
                  helperText="Use a custom domain for branded QR code URLs"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Distribution Method */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribution Method
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              How will participants receive their QR codes? (Select all that apply)
            </Typography>

            <List>
              {DISTRIBUTION_METHODS.map(method => (
                <ListItem
                  key={method.value}
                  button
                  onClick={() => {
                    const current = qrStrategy.distributionMethod || [];
                    const updated = current.includes(method.value)
                      ? current.filter(m => m !== method.value)
                      : [...current, method.value];
                    setQrStrategy(prev => ({ ...prev, distributionMethod: updated }));
                  }}
                >
                  <ListItemIcon>
                    <CheckIcon 
                      color={qrStrategy.distributionMethod?.includes(method.value) ? 'primary' : 'disabled'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${method.icon} ${method.label}`}
                    primaryTypographyProps={{
                      fontWeight: qrStrategy.distributionMethod?.includes(method.value) ? 600 : 400
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Backup Plan"
              placeholder="What if a participant loses their QR code?"
              value={qrStrategy.backupPlan}
              onChange={(e) => setQrStrategy(prev => ({ ...prev, backupPlan: e.target.value }))}
              sx={{ mt: 2 }}
              helperText="Describe your backup plan for lost or forgotten QR codes"
            />
          </Paper>
        </Grid>

        {/* Strategy Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
            <Typography variant="h6" gutterBottom>
              Strategy Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Approach:
                </Typography>
                <Chip 
                  icon={selectedApproach?.icon} 
                  label={selectedApproach?.label}
                  color="primary"
                />
              </Grid>
              {qrStrategy.approach !== 'single' && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Print Format:
                  </Typography>
                  <Chip 
                    label={PRINT_FORMATS.find(f => f.value === qrStrategy.printFormat)?.label}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Distribution Methods:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {qrStrategy.distributionMethod?.map(method => (
                    <Chip
                      key={method}
                      label={DISTRIBUTION_METHODS.find(m => m.value === method)?.label}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* AI Analysis */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing Strategy...' : 'Get AI QR Strategy Recommendations'}
            </Button>
          </Box>

          {aiSuggestions && (
            <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
              <Typography variant="subtitle2" gutterBottom>
                AI Recommendations:
              </Typography>
              {aiSuggestions}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
