'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Plus, Trash2, Sparkles, Users } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep4Activities() {
  const { proposalData, updateProposalData, generateSection } = useGrantGenerator();
  const [generating, setGenerating] = useState(false);

  const addActivity = () => {
    const newActivity = {
      id: `activity-${Date.now()}`,
      name: '',
      description: '',
      timeline: '',
      responsible: '',
      participants: 0
    };
    updateProposalData({ activities: [...(proposalData.activities || []), newActivity] });
  };

  const updateActivity = (id: string, field: string, value: any) => {
    const updatedActivities = (proposalData.activities || []).map(a =>
      a.id === id ? { ...a, [field]: value } : a
    );
    updateProposalData({ activities: updatedActivities });
  };

  const removeActivity = (id: string) => {
    const updatedActivities = (proposalData.activities || []).filter(a => a.id !== id);
    updateProposalData({ activities: updatedActivities });
  };

  const handleGenerateActivities = async () => {
    try {
      setGenerating(true);
      await generateSection('activities');
    } catch (error) {
      console.error('Error generating activities:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Activities & Implementation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Define the activities and methods you'll use to achieve your goals
      </Typography>

      <Alert severity="info" icon={<Users />} sx={{ mb: 3 }}>
        <strong>Implementation Plan:</strong> Describe what you'll do, when, who's responsible, 
        and how many people will participate.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="outlined" startIcon={<Plus />} onClick={addActivity}>
          Add Activity
        </Button>
        <Button
          variant="outlined"
          startIcon={<Sparkles />}
          onClick={handleGenerateActivities}
          disabled={generating || (proposalData.goals || []).length === 0}
        >
          {generating ? 'Generating...' : 'AI Suggest Activities'}
        </Button>
      </Box>

      {(proposalData.activities || []).length === 0 ? (
        <Alert severity="warning">
          No activities defined yet. Click "Add Activity" or use AI to suggest activities based on your goals.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(proposalData.activities || []).map((activity, index) => (
            <Card key={activity.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip label={`Activity ${index + 1}`} color="primary" size="small" />
                  <IconButton size="small" onClick={() => removeActivity(activity.id)} color="error">
                    <Trash2 size={18} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Activity Name"
                      value={activity.name}
                      onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
                      required
                      placeholder="e.g., Monthly Health Workshops"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={activity.description}
                      onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                      required
                      placeholder="Describe what this activity involves and how it supports your goals..."
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Timeline"
                      value={activity.timeline}
                      onChange={(e) => updateActivity(activity.id, 'timeline', e.target.value)}
                      required
                      placeholder="e.g., Months 1-12"
                      helperText="When will this occur?"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Responsible Party"
                      value={activity.responsible}
                      onChange={(e) => updateActivity(activity.id, 'responsible', e.target.value)}
                      required
                      placeholder="e.g., Program Director"
                      helperText="Who will lead this?"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Expected Participants"
                      value={activity.participants}
                      onChange={(e) => updateActivity(activity.id, 'participants', parseInt(e.target.value) || 0)}
                      required
                      helperText="How many people?"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
