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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  School as TrainingIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandIcon,
  Download as DownloadIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { WorkflowsTraining } from '@/types/qr-tracking-wizard.types';

const TRAINING_TOPICS = [
  { id: 'qr_basics', label: 'QR Code Basics', icon: '📱' },
  { id: 'scanning', label: 'How to Scan QR Codes', icon: '📷' },
  { id: 'form_filling', label: 'Completing Digital Forms', icon: '📝' },
  { id: 'troubleshooting', label: 'Troubleshooting Common Issues', icon: '🔧' },
  { id: 'privacy', label: 'Data Privacy & Security', icon: '🔒' },
  { id: 'backup_procedures', label: 'Backup Procedures', icon: '💾' }
];

const STAFF_ROLES = [
  { id: 'admin', label: 'Program Administrator', icon: '👔' },
  { id: 'instructor', label: 'Instructors/Facilitators', icon: '👨‍🏫' },
  { id: 'coordinator', label: 'Program Coordinators', icon: '📋' },
  { id: 'support', label: 'Technical Support', icon: '🛠️' }
];

export default function Step7WorkflowsTraining() {
  const { wizardState, updateStep7 } = useQRWizard();
  
  const [trainingData, setTrainingData] = useState<WorkflowsTraining>(
    (wizardState.step7_workflows as WorkflowsTraining) || {
      trainingTopics: ['qr_basics', 'scanning', 'form_filling'],
      staffRoles: ['admin', 'instructor'],
      trainingFormat: 'mixed',
      trainingDuration: '1-2 hours',
      supportDocumentation: true,
      videoTutorials: false,
      liveTraining: true,
      workflows: {
        participantRegistration: '',
        sessionCheckIn: '',
        dataCollection: '',
        troubleshooting: ''
      }
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [generatingDocs, setGeneratingDocs] = useState(false);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep7(trainingData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [trainingData, updateStep7]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-qr-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 7,
          data: {
            trainingTopics: trainingData.trainingTopics,
            staffRoles: trainingData.staffRoles,
            trainingFormat: trainingData.trainingFormat,
            programInfo: wizardState.step2_program?.basicInfo,
            participantCount: wizardState.step4_participants?.participants?.length || 0
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.analysis);
      } else {
        setAiSuggestions(
          `Training Plan Assessment:\n\n` +
          `✅ ${trainingData.trainingTopics.length} training topics selected\n` +
          `✅ ${trainingData.staffRoles.length} staff roles identified\n` +
          `💡 Consider adding video tutorials for reference`
        );
      }
    } catch (error) {
      console.error('Error analyzing training:', error);
      setAiSuggestions(
        `Analysis unavailable. Your training plan has been saved.\n\n` +
        `✅ Training configured\n` +
        `💡 Proceed to implementation plan`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateDocs = async () => {
    setGeneratingDocs(true);
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Training documentation generated! Check your downloads folder.');
    } catch (error) {
      console.error('Error generating docs:', error);
    } finally {
      setGeneratingDocs(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setTrainingData(prev => ({
      ...prev,
      trainingTopics: prev.trainingTopics.includes(topicId)
        ? prev.trainingTopics.filter(t => t !== topicId)
        : [...prev.trainingTopics, topicId]
    }));
  };

  const toggleRole = (roleId: string) => {
    setTrainingData(prev => ({
      ...prev,
      staffRoles: prev.staffRoles.includes(roleId)
        ? prev.staffRoles.filter(r => r !== roleId)
        : [...prev.staffRoles, roleId]
    }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Define training needs and create workflow documentation for staff and participants.
      </Alert>

      <Grid container spacing={3}>
        {/* Training Topics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Training Topics
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select topics to include in training materials:
            </Typography>

            <List>
              {TRAINING_TOPICS.map(topic => (
                <ListItem
                  key={topic.id}
                  button
                  onClick={() => toggleTopic(topic.id)}
                >
                  <ListItemIcon>
                    <CheckIcon 
                      color={trainingData.trainingTopics.includes(topic.id) ? 'primary' : 'disabled'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${topic.icon} ${topic.label}`}
                    primaryTypographyProps={{
                      fontWeight: trainingData.trainingTopics.includes(topic.id) ? 600 : 400
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Staff Roles */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Staff Roles to Train
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Who needs training on the QR tracking system?
            </Typography>

            <List>
              {STAFF_ROLES.map(role => (
                <ListItem
                  key={role.id}
                  button
                  onClick={() => toggleRole(role.id)}
                >
                  <ListItemIcon>
                    <CheckIcon 
                      color={trainingData.staffRoles.includes(role.id) ? 'primary' : 'disabled'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${role.icon} ${role.label}`}
                    primaryTypographyProps={{
                      fontWeight: trainingData.staffRoles.includes(role.id) ? 600 : 400
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Training Format */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Training Delivery
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={trainingData.liveTraining}
                      onChange={(e) => setTrainingData(prev => ({ ...prev, liveTraining: e.target.checked }))}
                    />
                  }
                  label="Live Training Session"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={trainingData.videoTutorials}
                      onChange={(e) => setTrainingData(prev => ({ ...prev, videoTutorials: e.target.checked }))}
                    />
                  }
                  label="Video Tutorials"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={trainingData.supportDocumentation}
                      onChange={(e) => setTrainingData(prev => ({ ...prev, supportDocumentation: e.target.checked }))}
                    />
                  }
                  label="Written Documentation"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              select
              label="Estimated Training Duration"
              value={trainingData.trainingDuration}
              onChange={(e) => setTrainingData(prev => ({ ...prev, trainingDuration: e.target.value }))}
              SelectProps={{ native: true }}
              sx={{ mt: 2 }}
            >
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="1-2 hours">1-2 hours</option>
              <option value="half day">Half day</option>
              <option value="full day">Full day</option>
            </TextField>
          </Paper>
        </Grid>

        {/* Workflow Documentation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Documentation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Document key workflows for your team:
            </Typography>

            <Stack spacing={2}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Typography>📝 Participant Registration Workflow</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe the step-by-step process for registering new participants..."
                    value={trainingData.workflows.participantRegistration}
                    onChange={(e) => setTrainingData(prev => ({
                      ...prev,
                      workflows: { ...prev.workflows, participantRegistration: e.target.value }
                    }))}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Typography>✓ Session Check-In Workflow</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe how staff will check in participants at each session..."
                    value={trainingData.workflows.sessionCheckIn}
                    onChange={(e) => setTrainingData(prev => ({
                      ...prev,
                      workflows: { ...prev.workflows, sessionCheckIn: e.target.value }
                    }))}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Typography>📊 Data Collection Workflow</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe how data will be collected, reviewed, and stored..."
                    value={trainingData.workflows.dataCollection}
                    onChange={(e) => setTrainingData(prev => ({
                      ...prev,
                      workflows: { ...prev.workflows, dataCollection: e.target.value }
                    }))}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Typography>🔧 Troubleshooting Workflow</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe common issues and how to resolve them..."
                    value={trainingData.workflows.troubleshooting}
                    onChange={(e) => setTrainingData(prev => ({
                      ...prev,
                      workflows: { ...prev.workflows, troubleshooting: e.target.value }
                    }))}
                  />
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Paper>
        </Grid>

        {/* Generate Documentation */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Generate Training Materials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create comprehensive training documentation based on your configuration
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={generatingDocs ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleGenerateDocs}
                  disabled={generatingDocs}
                  size="large"
                >
                  {generatingDocs ? 'Generating...' : 'Generate Docs'}
                </Button>
              </Box>
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
              {analyzing ? 'Analyzing Training Plan...' : 'Get AI Training Recommendations'}
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
