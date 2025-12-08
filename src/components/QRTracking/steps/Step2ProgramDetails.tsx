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
  IconButton,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { ProgramDetails, Cohort, SessionSchedule } from '@/types/qr-tracking-wizard.types';

const PROGRAM_TYPES = [
  { value: 'ongoing', label: 'Ongoing Program' },
  { value: 'fixed_duration', label: 'Fixed Duration Program' },
  { value: 'seasonal', label: 'Seasonal Program' },
  { value: 'event_based', label: 'Event-Based Program' }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'adhoc', label: 'Ad-hoc' }
];

export default function Step2ProgramDetails() {
  const { wizardState, updateStep2 } = useQRWizard();
  
  const [programData, setProgramData] = useState<ProgramDetails>(
    wizardState.step2_program || {
      basicInfo: {
        programName: '',
        programType: 'ongoing',
        description: '',
        startDate: '',
        endDate: '',
        fundingSource: '',
        programGoals: []
      },
      cohortStructure: {
        hasCohorts: false,
        cohorts: [],
        allowMultipleCohorts: false
      },
      sessionSchedule: {
        hasRegularSessions: false,
        frequency: 'weekly',
        sessions: [],
        requiresPreRegistration: false
      },
      participantGroups: {
        hasGroups: false,
        groups: [],
        groupAssignmentMethod: 'manual'
      },
      trackingRequirements: {
        trackAttendance: true,
        trackProgress: false,
        trackOutcomes: false,
        trackReferrals: false,
        customMetrics: []
      }
    }
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep2(programData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [programData, updateStep2]);

  const handleBasicInfoChange = (field: string, value: any) => {
    setProgramData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };

  const handleAddGoal = () => {
    const goal = prompt('Enter program goal:');
    if (goal) {
      setProgramData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          programGoals: [...prev.basicInfo.programGoals, goal]
        }
      }));
    }
  };

  const handleRemoveGoal = (index: number) => {
    setProgramData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        programGoals: prev.basicInfo.programGoals.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddCohort = () => {
    const newCohort: Cohort = {
      cohortId: `cohort_${Date.now()}`,
      cohortName: `Cohort ${programData.cohortStructure.cohorts.length + 1}`,
      startDate: '',
      endDate: '',
      maxParticipants: 0,
      currentParticipants: 0
    };
    
    setProgramData(prev => ({
      ...prev,
      cohortStructure: {
        ...prev.cohortStructure,
        cohorts: [...prev.cohortStructure.cohorts, newCohort]
      }
    }));
  };

  const handleUpdateCohort = (index: number, field: string, value: any) => {
    setProgramData(prev => ({
      ...prev,
      cohortStructure: {
        ...prev.cohortStructure,
        cohorts: prev.cohortStructure.cohorts.map((cohort, i) =>
          i === index ? { ...cohort, [field]: value } : cohort
        )
      }
    }));
  };

  const handleRemoveCohort = (index: number) => {
    setProgramData(prev => ({
      ...prev,
      cohortStructure: {
        ...prev.cohortStructure,
        cohorts: prev.cohortStructure.cohorts.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddSession = () => {
    const newSession: SessionSchedule = {
      sessionId: `session_${Date.now()}`,
      sessionName: `Session ${programData.sessionSchedule.sessions.length + 1}`,
      dayOfWeek: '',
      time: '',
      duration: 60,
      location: '',
      maxCapacity: 0
    };
    
    setProgramData(prev => ({
      ...prev,
      sessionSchedule: {
        ...prev.sessionSchedule,
        sessions: [...prev.sessionSchedule.sessions, newSession]
      }
    }));
  };

  const handleUpdateSession = (index: number, field: string, value: any) => {
    setProgramData(prev => ({
      ...prev,
      sessionSchedule: {
        ...prev.sessionSchedule,
        sessions: prev.sessionSchedule.sessions.map((session, i) =>
          i === index ? { ...session, [field]: value } : session
        )
      }
    }));
  };

  const handleRemoveSession = (index: number) => {
    setProgramData(prev => ({
      ...prev,
      sessionSchedule: {
        ...prev.sessionSchedule,
        sessions: prev.sessionSchedule.sessions.filter((_, i) => i !== index)
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
          step: 2,
          data: programData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiRecommendations(result.analysis);
      } else {
        setAiRecommendations(
          `Basic program assessment:\n\n` +
          `✅ Program: ${programData.basicInfo.programName}\n` +
          `✅ Structure: ${programData.basicInfo.programType}\n` +
          `💡 Continue to next step to set up data collection`
        );
      }
    } catch (error) {
      console.error('Error analyzing program:', error);
      setAiRecommendations(
        `Analysis unavailable. Your program details have been saved.\n\n` +
        `✅ ${programData.cohortStructure.cohorts.length} cohort(s) configured\n` +
        `✅ ${programData.sessionSchedule.sessions.length} session(s) scheduled\n` +
        `💡 Proceed to configure data requirements`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Define your program structure, cohorts, and session schedules. This helps us design the optimal tracking system.
      </Alert>

      <Grid container spacing={3}>
        {/* Basic Program Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Program Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Program Name"
                  value={programData.basicInfo.programName}
                  onChange={(e) => handleBasicInfoChange('programName', e.target.value)}
                  placeholder="e.g., Community Health Education Program"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Program Type</InputLabel>
                  <Select
                    value={programData.basicInfo.programType}
                    label="Program Type"
                    onChange={(e) => handleBasicInfoChange('programType', e.target.value)}
                  >
                    {PROGRAM_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Program Description"
                  value={programData.basicInfo.description}
                  onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                  placeholder="Describe the program's purpose and activities"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={programData.basicInfo.startDate}
                  onChange={(e) => handleBasicInfoChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date (if applicable)"
                  value={programData.basicInfo.endDate}
                  onChange={(e) => handleBasicInfoChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Funding Source"
                  value={programData.basicInfo.fundingSource}
                  onChange={(e) => handleBasicInfoChange('fundingSource', e.target.value)}
                  placeholder="e.g., State Grant, Foundation"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2">Program Goals</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddGoal}
                  >
                    Add Goal
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {programData.basicInfo.programGoals.map((goal, index) => (
                    <Chip
                      key={index}
                      label={goal}
                      onDelete={() => handleRemoveGoal(index)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Cohort Structure */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cohort Structure
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={programData.cohortStructure.hasCohorts}
                  onChange={(e) => setProgramData(prev => ({
                    ...prev,
                    cohortStructure: { ...prev.cohortStructure, hasCohorts: e.target.checked }
                  }))}
                />
              }
              label="Program uses cohorts (groups of participants starting together)"
              sx={{ mb: 2 }}
            />

            {programData.cohortStructure.hasCohorts && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={programData.cohortStructure.allowMultipleCohorts}
                      onChange={(e) => setProgramData(prev => ({
                        ...prev,
                        cohortStructure: { ...prev.cohortStructure, allowMultipleCohorts: e.target.checked }
                      }))}
                    />
                  }
                  label="Participants can join multiple cohorts"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">Cohorts</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddCohort}
                  >
                    Add Cohort
                  </Button>
                </Box>

                {programData.cohortStructure.cohorts.map((cohort, index) => (
                  <Paper key={cohort.cohortId} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2">Cohort {index + 1}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveCohort(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Cohort Name"
                          value={cohort.cohortName}
                          onChange={(e) => handleUpdateCohort(index, 'cohortName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="Start Date"
                          value={cohort.startDate}
                          onChange={(e) => handleUpdateCohort(index, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="End Date"
                          value={cohort.endDate}
                          onChange={(e) => handleUpdateCohort(index, 'endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Max Participants"
                          value={cohort.maxParticipants}
                          onChange={(e) => handleUpdateCohort(index, 'maxParticipants', parseInt(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </>
            )}
          </Paper>
        </Grid>

        {/* Session Schedule */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Schedule
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={programData.sessionSchedule.hasRegularSessions}
                  onChange={(e) => setProgramData(prev => ({
                    ...prev,
                    sessionSchedule: { ...prev.sessionSchedule, hasRegularSessions: e.target.checked }
                  }))}
                />
              }
              label="Program has regular scheduled sessions"
              sx={{ mb: 2 }}
            />

            {programData.sessionSchedule.hasRegularSessions && (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Session Frequency</InputLabel>
                      <Select
                        value={programData.sessionSchedule.frequency}
                        label="Session Frequency"
                        onChange={(e) => setProgramData(prev => ({
                          ...prev,
                          sessionSchedule: { ...prev.sessionSchedule, frequency: e.target.value as any }
                        }))}
                      >
                        {FREQUENCY_OPTIONS.map(freq => (
                          <MenuItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={programData.sessionSchedule.requiresPreRegistration}
                          onChange={(e) => setProgramData(prev => ({
                            ...prev,
                            sessionSchedule: { ...prev.sessionSchedule, requiresPreRegistration: e.target.checked }
                          }))}
                        />
                      }
                      label="Requires pre-registration"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">Sessions</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddSession}
                  >
                    Add Session
                  </Button>
                </Box>

                {programData.sessionSchedule.sessions.map((session, index) => (
                  <Paper key={session.sessionId} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2">Session {index + 1}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveSession(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Session Name"
                          value={session.sessionName}
                          onChange={(e) => handleUpdateSession(index, 'sessionName', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Day of Week"
                          value={session.dayOfWeek}
                          onChange={(e) => handleUpdateSession(index, 'dayOfWeek', e.target.value)}
                          placeholder="e.g., Monday"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          label="Time"
                          value={session.time}
                          onChange={(e) => handleUpdateSession(index, 'time', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Duration (minutes)"
                          value={session.duration}
                          onChange={(e) => handleUpdateSession(index, 'duration', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Location"
                          value={session.location}
                          onChange={(e) => handleUpdateSession(index, 'location', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Max Capacity"
                          value={session.maxCapacity}
                          onChange={(e) => handleUpdateSession(index, 'maxCapacity', parseInt(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </>
            )}
          </Paper>
        </Grid>

        {/* Tracking Requirements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tracking Requirements
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={programData.trackingRequirements.trackAttendance}
                    onChange={(e) => setProgramData(prev => ({
                      ...prev,
                      trackingRequirements: { ...prev.trackingRequirements, trackAttendance: e.target.checked }
                    }))}
                  />
                }
                label="Track attendance"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={programData.trackingRequirements.trackProgress}
                    onChange={(e) => setProgramData(prev => ({
                      ...prev,
                      trackingRequirements: { ...prev.trackingRequirements, trackProgress: e.target.checked }
                    }))}
                  />
                }
                label="Track participant progress/milestones"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={programData.trackingRequirements.trackOutcomes}
                    onChange={(e) => setProgramData(prev => ({
                      ...prev,
                      trackingRequirements: { ...prev.trackingRequirements, trackOutcomes: e.target.checked }
                    }))}
                  />
                }
                label="Track outcomes/results"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={programData.trackingRequirements.trackReferrals}
                    onChange={(e) => setProgramData(prev => ({
                      ...prev,
                      trackingRequirements: { ...prev.trackingRequirements, trackReferrals: e.target.checked }
                    }))}
                  />
                }
                label="Track referrals"
              />
            </FormGroup>
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
              disabled={analyzing || !programData.basicInfo.programName}
            >
              {analyzing ? 'Analyzing Program...' : 'Get AI Recommendations'}
            </Button>
          </Box>

          {aiRecommendations && (
            <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
              <Typography variant="subtitle2" gutterBottom>
                AI Recommendations:
              </Typography>
              {aiRecommendations}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
