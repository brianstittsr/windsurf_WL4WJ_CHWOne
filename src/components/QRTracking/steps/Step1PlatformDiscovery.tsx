'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Paper,
  Divider,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { AutoAwesome as AIIcon } from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { PlatformCapabilities } from '@/types/qr-tracking-wizard.types';

const PLATFORM_TYPES = [
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'airtable', label: 'Airtable' },
  { value: 'microsoft365', label: 'Microsoft 365' },
  { value: 'google_workspace', label: 'Google Workspace' },
  { value: 'custom', label: 'Custom Platform' },
  { value: 'other', label: 'Other' }
];

export default function Step1PlatformDiscovery() {
  const { wizardState, updateStep1 } = useQRWizard();
  
  const [platformData, setPlatformData] = useState<PlatformCapabilities>(
    wizardState.step1_platform || {
      platformName: '',
      platformType: 'other',
      formBuilder: {
        toolName: '',
        features: {
          multipleChoice: false,
          textFields: false,
          dropdowns: false,
          fileUploads: false,
          conditionalLogic: false
        },
        preFillCapability: false,
        multiLanguageSupport: false,
        supportedLanguages: [],
        mobileResponsive: false,
        otherFeatures: ''
      },
      qrCodeGeneration: {
        hasBuiltInGenerator: false,
        canGenerateIndividual: false,
        canGenerateSingle: false,
        capabilities: {
          linkToForms: false,
          passParameters: false,
          preFillFields: false
        },
        formatOptions: {
          downloadImages: false,
          printSheets: false,
          displayOnScreen: false
        }
      },
      datasetFeatures: {
        storageType: 'other',
        capabilities: {
          autoUpdateFromForms: false,
          linkMultipleForms: false,
          generateReports: false,
          exportData: false,
          relationalData: false,
          calculatedFields: false,
          historicalTracking: false,
          dashboards: false
        },
        realTimeUpdates: false
      },
      integrationAutomation: {
        formsAutoWriteToDatasets: false,
        canTriggerWorkflows: false,
        canSendNotifications: false,
        hasAPI: false
      },
      limitations: '',
      concerns: ''
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep1(platformData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [platformData, updateStep1]);

  const handleTextChange = (field: string, value: string) => {
    setPlatformData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormBuilderFeature = (feature: string, checked: boolean) => {
    setPlatformData(prev => ({
      ...prev,
      formBuilder: {
        ...prev.formBuilder,
        features: {
          ...prev.formBuilder.features,
          [feature]: checked
        }
      }
    }));
  };

  const handleQRCapability = (capability: string, checked: boolean) => {
    setPlatformData(prev => ({
      ...prev,
      qrCodeGeneration: {
        ...prev.qrCodeGeneration,
        capabilities: {
          ...prev.qrCodeGeneration.capabilities,
          [capability]: checked
        }
      }
    }));
  };

  const handleDatasetCapability = (capability: string, checked: boolean) => {
    setPlatformData(prev => ({
      ...prev,
      datasetFeatures: {
        ...prev.datasetFeatures,
        capabilities: {
          ...prev.datasetFeatures.capabilities,
          [capability]: checked
        }
      }
    }));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-qr-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          data: platformData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiAnalysis(result.analysis);
      } else {
        setAiAnalysis(
          `Unable to get AI analysis. Here's a basic assessment:\n\n` +
          `✅ Platform: ${platformData.platformName}\n` +
          `✅ Form builder capabilities detected\n` +
          `💡 Consider enabling QR code generation for optimal tracking`
        );
      }
    } catch (error) {
      console.error('Error analyzing platform:', error);
      setAiAnalysis(
        `Analysis unavailable. Basic assessment:\n\n` +
        `✅ Your ${platformData.platformName || 'platform'} configuration has been saved\n` +
        `💡 Proceed to next step to continue setup`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Let's start by understanding your existing platform capabilities. This will help us design the optimal QR tracking system for your needs.
      </Alert>

      <Grid container spacing={3}>
        {/* Platform Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platform Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Platform Name"
                  value={platformData.platformName}
                  onChange={(e) => handleTextChange('platformName', e.target.value)}
                  placeholder="e.g., CHWOne, Salesforce, Custom System"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Platform Type</InputLabel>
                  <Select
                    value={platformData.platformType}
                    label="Platform Type"
                    onChange={(e) => setPlatformData(prev => ({
                      ...prev,
                      platformType: e.target.value as any
                    }))}
                  >
                    {PLATFORM_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Form Builder Features */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Form Builder Features
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Form Builder Tool Name"
              value={platformData.formBuilder.toolName}
              onChange={(e) => setPlatformData(prev => ({
                ...prev,
                formBuilder: { ...prev.formBuilder, toolName: e.target.value }
              }))}
              placeholder="e.g., Google Forms, Formstack, Built-in"
              sx={{ mb: 2 }}
            />

            <FormControl component="fieldset">
              <FormLabel component="legend">Can create:</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.formBuilder.features.multipleChoice}
                      onChange={(e) => handleFormBuilderFeature('multipleChoice', e.target.checked)}
                    />
                  }
                  label="Multiple choice"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.formBuilder.features.textFields}
                      onChange={(e) => handleFormBuilderFeature('textFields', e.target.checked)}
                    />
                  }
                  label="Text fields"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.formBuilder.features.dropdowns}
                      onChange={(e) => handleFormBuilderFeature('dropdowns', e.target.checked)}
                    />
                  }
                  label="Dropdowns"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.formBuilder.features.fileUploads}
                      onChange={(e) => handleFormBuilderFeature('fileUploads', e.target.checked)}
                    />
                  }
                  label="File uploads"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.formBuilder.features.conditionalLogic}
                      onChange={(e) => handleFormBuilderFeature('conditionalLogic', e.target.checked)}
                    />
                  }
                  label="Conditional logic"
                />
              </FormGroup>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={platformData.formBuilder.preFillCapability}
                    onChange={(e) => setPlatformData(prev => ({
                      ...prev,
                      formBuilder: { ...prev.formBuilder, preFillCapability: e.target.checked }
                    }))}
                  />
                }
                label="Pre-fill capability"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={platformData.formBuilder.multiLanguageSupport}
                    onChange={(e) => setPlatformData(prev => ({
                      ...prev,
                      formBuilder: { ...prev.formBuilder, multiLanguageSupport: e.target.checked }
                    }))}
                  />
                }
                label="Multi-language support"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={platformData.formBuilder.mobileResponsive}
                    onChange={(e) => setPlatformData(prev => ({
                      ...prev,
                      formBuilder: { ...prev.formBuilder, mobileResponsive: e.target.checked }
                    }))}
                  />
                }
                label="Mobile-responsive"
              />
            </Box>
          </Paper>
        </Grid>

        {/* QR Code Generation */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              QR Code Generation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={platformData.qrCodeGeneration.hasBuiltInGenerator}
                  onChange={(e) => setPlatformData(prev => ({
                    ...prev,
                    qrCodeGeneration: { ...prev.qrCodeGeneration, hasBuiltInGenerator: e.target.checked }
                  }))}
                />
              }
              label="Built-in QR generator"
              sx={{ mb: 1 }}
            />

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Can generate:</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.qrCodeGeneration.canGenerateIndividual}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        qrCodeGeneration: { ...prev.qrCodeGeneration, canGenerateIndividual: e.target.checked }
                      }))}
                    />
                  }
                  label="Individual QR codes per record"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.qrCodeGeneration.canGenerateSingle}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        qrCodeGeneration: { ...prev.qrCodeGeneration, canGenerateSingle: e.target.checked }
                      }))}
                    />
                  }
                  label="Single QR codes for events"
                />
              </FormGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">QR codes can:</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.qrCodeGeneration.capabilities.linkToForms}
                      onChange={(e) => handleQRCapability('linkToForms', e.target.checked)}
                    />
                  }
                  label="Link to forms"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.qrCodeGeneration.capabilities.passParameters}
                      onChange={(e) => handleQRCapability('passParameters', e.target.checked)}
                    />
                  }
                  label="Pass parameters/IDs"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.qrCodeGeneration.capabilities.preFillFields}
                      onChange={(e) => handleQRCapability('preFillFields', e.target.checked)}
                    />
                  }
                  label="Pre-fill form fields"
                />
              </FormGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Dataset/Database Features */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dataset/Database Features
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Storage Type</InputLabel>
                  <Select
                    value={platformData.datasetFeatures.storageType}
                    label="Storage Type"
                    onChange={(e) => setPlatformData(prev => ({
                      ...prev,
                      datasetFeatures: { ...prev.datasetFeatures, storageType: e.target.value as any }
                    }))}
                  >
                    <MenuItem value="spreadsheets">Spreadsheets</MenuItem>
                    <MenuItem value="database">Database tables</MenuItem>
                    <MenuItem value="crm">CRM objects</MenuItem>
                    <MenuItem value="lists">Lists</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.datasetFeatures.realTimeUpdates}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        datasetFeatures: { ...prev.datasetFeatures, realTimeUpdates: e.target.checked }
                      }))}
                    />
                  }
                  label="Real-time updates"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Datasets can:</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platformData.datasetFeatures.capabilities.autoUpdateFromForms}
                          onChange={(e) => handleDatasetCapability('autoUpdateFromForms', e.target.checked)}
                        />
                      }
                      label="Auto-update from forms"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platformData.datasetFeatures.capabilities.linkMultipleForms}
                          onChange={(e) => handleDatasetCapability('linkMultipleForms', e.target.checked)}
                        />
                      }
                      label="Link to multiple forms"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platformData.datasetFeatures.capabilities.generateReports}
                          onChange={(e) => handleDatasetCapability('generateReports', e.target.checked)}
                        />
                      }
                      label="Generate reports"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platformData.datasetFeatures.capabilities.exportData}
                          onChange={(e) => handleDatasetCapability('exportData', e.target.checked)}
                        />
                      }
                      label="Export data"
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Integration & Automation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integration & Automation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.integrationAutomation.formsAutoWriteToDatasets}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        integrationAutomation: { ...prev.integrationAutomation, formsAutoWriteToDatasets: e.target.checked }
                      }))}
                    />
                  }
                  label="Forms auto-write to datasets"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.integrationAutomation.canTriggerWorkflows}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        integrationAutomation: { ...prev.integrationAutomation, canTriggerWorkflows: e.target.checked }
                      }))}
                    />
                  }
                  label="Can trigger automated workflows"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.integrationAutomation.canSendNotifications}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        integrationAutomation: { ...prev.integrationAutomation, canSendNotifications: e.target.checked }
                      }))}
                    />
                  }
                  label="Can send automated notifications"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platformData.integrationAutomation.hasAPI}
                      onChange={(e) => setPlatformData(prev => ({
                        ...prev,
                        integrationAutomation: { ...prev.integrationAutomation, hasAPI: e.target.checked }
                      }))}
                    />
                  }
                  label="API available for custom integrations"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Limitations & Concerns */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Limitations & Concerns
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Current Limitations"
                  value={platformData.limitations}
                  onChange={(e) => handleTextChange('limitations', e.target.value)}
                  placeholder="Describe any known limitations, budget constraints, technical skill level of staff, etc."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Concerns"
                  value={platformData.concerns}
                  onChange={(e) => handleTextChange('concerns', e.target.value)}
                  placeholder="Any concerns about implementing a QR tracking system?"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* AI Analysis Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={handleAnalyze}
              disabled={analyzing || !platformData.platformName}
            >
              {analyzing ? 'Analyzing Platform...' : 'Analyze Platform with AI'}
            </Button>
          </Box>

          {aiAnalysis && (
            <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
              <Typography variant="subtitle2" gutterBottom>
                AI Analysis Results:
              </Typography>
              {aiAnalysis}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
