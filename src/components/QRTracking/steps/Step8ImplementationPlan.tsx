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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  LinearProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  AutoAwesome as AIIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { ImplementationPlan } from '@/types/qr-tracking-wizard.types';

const MILESTONES = [
  { id: 'setup', label: 'Platform Setup', duration: '1-2 weeks', icon: '⚙️' },
  { id: 'data_import', label: 'Import Participant Data', duration: '3-5 days', icon: '📊' },
  { id: 'qr_generation', label: 'Generate QR Codes', duration: '1-2 days', icon: '📱' },
  { id: 'training', label: 'Staff Training', duration: '1-2 days', icon: '👨‍🏫' },
  { id: 'pilot', label: 'Pilot Testing', duration: '1 week', icon: '🧪' },
  { id: 'launch', label: 'Full Launch', duration: '1 day', icon: '🚀' }
];

const SUCCESS_METRICS = [
  { id: 'attendance_rate', label: 'Attendance Tracking Rate', target: '95%+' },
  { id: 'data_accuracy', label: 'Data Accuracy', target: '98%+' },
  { id: 'staff_adoption', label: 'Staff Adoption', target: '100%' },
  { id: 'participant_satisfaction', label: 'Participant Satisfaction', target: '4.5/5' }
];

export default function Step8ImplementationPlan() {
  const { wizardState, updateStep8, saveWizard } = useQRWizard();
  
  const [planData, setPlanData] = useState<ImplementationPlan>(
    wizardState.step8_implementation || {
      startDate: '',
      timeline: 'standard',
      milestones: MILESTONES.map(m => m.id),
      successMetrics: SUCCESS_METRICS.map(m => m.id),
      budget: '',
      resources: '',
      risks: '',
      notes: ''
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep8(planData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [planData, updateStep8]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-qr-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 8,
          data: {
            timeline: planData.timeline,
            milestones: planData.milestones,
            programInfo: wizardState.step2_program?.basicInfo,
            participantCount: wizardState.step4_participants?.participants?.length || 0,
            formCount: wizardState.step5_forms?.forms?.length || 0
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.analysis);
      } else {
        setAiSuggestions(
          `Implementation Plan Assessment:\n\n` +
          `✅ ${planData.milestones.length} milestones defined\n` +
          `✅ ${planData.successMetrics.length} success metrics tracked\n` +
          `💡 Ready for implementation!`
        );
      }
    } catch (error) {
      console.error('Error analyzing plan:', error);
      setAiSuggestions(
        `Analysis unavailable. Your implementation plan has been saved.\n\n` +
        `✅ Plan configured\n` +
        `🚀 Ready to launch!`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Generate comprehensive export
      const exportData = {
        wizardState,
        generatedAt: new Date().toISOString(),
        summary: {
          platform: wizardState.step1_platform?.platformName,
          program: wizardState.step2_program?.basicInfo?.programName,
          participants: wizardState.step4_participants?.participants?.length || 0,
          forms: wizardState.step5_forms?.forms?.length || 0
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-tracking-wizard-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      alert('Implementation plan exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error exporting plan. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleSaveAndFinish = async () => {
    setSaving(true);
    try {
      await saveWizard();
      alert('🎉 Congratulations! Your QR Tracking Wizard is complete and saved!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving wizard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const completionPercentage = Math.round(
    (wizardState.completedSteps.length / 8) * 100
  );

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          🎉 Almost Done! Review your implementation plan and launch your QR tracking system.
        </Typography>
      </Alert>

      {/* Completion Progress */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h6" gutterBottom>
          Wizard Completion
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
          />
          <Typography variant="h6" color="primary">
            {completionPercentage}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {wizardState.completedSteps.length} of 8 steps completed
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Implementation Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Implementation Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              type="date"
              label="Target Start Date"
              value={planData.startDate}
              onChange={(e) => setPlanData(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label="Timeline Pace"
              value={planData.timeline}
              onChange={(e) => setPlanData(prev => ({ ...prev, timeline: e.target.value as any }))}
              SelectProps={{ native: true }}
              sx={{ mb: 3 }}
            >
              <option value="aggressive">Aggressive (2-3 weeks)</option>
              <option value="standard">Standard (4-6 weeks)</option>
              <option value="relaxed">Relaxed (8-12 weeks)</option>
            </TextField>

            <Stepper orientation="vertical">
              {MILESTONES.map((milestone) => (
                <Step key={milestone.id} active completed={planData.milestones.includes(milestone.id)}>
                  <StepLabel>
                    <Box>
                      <Typography variant="subtitle2">
                        {milestone.icon} {milestone.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {milestone.duration}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Success Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Success Metrics
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track these metrics to measure success:
            </Typography>

            <List>
              {SUCCESS_METRICS.map(metric => (
                <ListItem key={metric.id}>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={metric.label}
                    secondary={`Target: ${metric.target}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Resources & Budget */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resources & Budget
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Estimated Budget"
              placeholder="$5,000"
              value={planData.budget}
              onChange={(e) => setPlanData(prev => ({ ...prev, budget: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Required Resources"
              placeholder="Staff time, printing costs, software licenses..."
              value={planData.resources}
              onChange={(e) => setPlanData(prev => ({ ...prev, resources: e.target.value }))}
            />
          </Paper>
        </Grid>

        {/* Risk Assessment */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Assessment & Mitigation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Potential Risks & Mitigation Strategies"
              placeholder="List potential challenges and how you'll address them..."
              value={planData.risks}
              onChange={(e) => setPlanData(prev => ({ ...prev, risks: e.target.value }))}
            />
          </Paper>
        </Grid>

        {/* Implementation Notes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Implementation Notes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Notes"
              placeholder="Any other important details for implementation..."
              value={planData.notes}
              onChange={(e) => setPlanData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Paper>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CelebrationIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Implementation Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your QR tracking system is ready to launch!
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Chip label={`Platform: ${wizardState.step1_platform?.platformName || 'N/A'}`} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip label={`Participants: ${wizardState.step4_participants?.participants?.length || 0}`} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip label={`Forms: ${wizardState.step5_forms?.forms?.length || 0}`} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip label={`QR: ${wizardState.step6_qr_strategy?.approach || 'N/A'}`} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
              {analyzing ? 'Analyzing Plan...' : 'Get AI Implementation Recommendations'}
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

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
            <Typography variant="h6" gutterBottom>
              Final Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={exporting}
                fullWidth
              >
                {exporting ? 'Exporting...' : 'Export Plan'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShareIcon />}
                fullWidth
              >
                Share with Team
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} /> : <CelebrationIcon />}
                onClick={handleSaveAndFinish}
                disabled={saving}
                fullWidth
                color="success"
              >
                {saving ? 'Saving...' : 'Save & Finish'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
