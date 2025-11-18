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
  MenuItem,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { Plus, Trash2, Sparkles, Target } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep5Outcomes() {
  const { proposalData, updateProposalData, generateSection } = useGrantGenerator();
  const [generatingEvaluation, setGeneratingEvaluation] = useState(false);

  const addOutcome = () => {
    const newOutcome = {
      id: `outcome-${Date.now()}`,
      outcome: '',
      indicator: '',
      measurementMethod: '',
      dataSource: '',
      frequency: 'monthly',
      target: ''
    };

    updateProposalData({
      outcomes: [...(proposalData.outcomes || []), newOutcome]
    });
  };

  const updateOutcome = (id: string, field: string, value: string) => {
    const updatedOutcomes = (proposalData.outcomes || []).map(outcome =>
      outcome.id === id ? { ...outcome, [field]: value } : outcome
    );
    updateProposalData({ outcomes: updatedOutcomes });
  };

  const removeOutcome = (id: string) => {
    const updatedOutcomes = (proposalData.outcomes || []).filter(outcome => outcome.id !== id);
    updateProposalData({ outcomes: updatedOutcomes });
  };

  const handleGenerateEvaluation = async () => {
    try {
      setGeneratingEvaluation(true);
      const evaluationPlan = await generateSection('evaluation');
      updateProposalData({ evaluationPlan });
    } catch (error) {
      console.error('Error generating evaluation plan:', error);
    } finally {
      setGeneratingEvaluation(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Outcomes & Evaluation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Define measurable outcomes and outcome-based evaluation methods
      </Typography>

      {/* Outcome-Based Evaluation Info */}
      <Alert severity="info" icon={<Target />} sx={{ mb: 3 }}>
        <strong>Outcome-Based Evaluation:</strong> Focus on the changes or benefits that result from your project.
        Use SMART indicators (Specific, Measurable, Achievable, Relevant, Time-bound) and define clear data collection methods.
      </Alert>

      {/* Outcomes List */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Expected Outcomes</Typography>
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={addOutcome}
            size="small"
          >
            Add Outcome
          </Button>
        </Box>

        {(proposalData.outcomes || []).length === 0 ? (
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No outcomes defined yet. Click "Add Outcome" to get started.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(proposalData.outcomes || []).map((outcome, index) => (
              <Card key={outcome.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip label={`Outcome ${index + 1}`} color="primary" size="small" />
                    <IconButton
                      size="small"
                      onClick={() => removeOutcome(outcome.id)}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Outcome Statement */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Outcome Statement"
                        value={outcome.outcome}
                        onChange={(e) => updateOutcome(outcome.id, 'outcome', e.target.value)}
                        required
                        multiline
                        rows={2}
                        placeholder="e.g., Participants will demonstrate improved health literacy"
                        helperText="What change or benefit will occur?"
                      />
                    </Grid>

                    {/* Indicator */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Indicator"
                        value={outcome.indicator}
                        onChange={(e) => updateOutcome(outcome.id, 'indicator', e.target.value)}
                        required
                        placeholder="e.g., % increase in health knowledge scores"
                        helperText="How will you measure this outcome?"
                      />
                    </Grid>

                    {/* Target */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Target"
                        value={outcome.target}
                        onChange={(e) => updateOutcome(outcome.id, 'target', e.target.value)}
                        required
                        placeholder="e.g., 80% of participants show 20% improvement"
                        helperText="What is your goal?"
                      />
                    </Grid>

                    {/* Measurement Method */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Measurement Method"
                        value={outcome.measurementMethod}
                        onChange={(e) => updateOutcome(outcome.id, 'measurementMethod', e.target.value)}
                        required
                        placeholder="e.g., Pre/post surveys, assessments"
                        helperText="How will you collect this data?"
                      />
                    </Grid>

                    {/* Data Source */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Data Source"
                        value={outcome.dataSource}
                        onChange={(e) => updateOutcome(outcome.id, 'dataSource', e.target.value)}
                        required
                        placeholder="e.g., Participant surveys, program records"
                        helperText="Where will the data come from?"
                      />
                    </Grid>

                    {/* Frequency */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Data Collection Frequency"
                        value={outcome.frequency}
                        onChange={(e) => updateOutcome(outcome.id, 'frequency', e.target.value)}
                        required
                        helperText="How often will you collect this data?"
                      >
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="quarterly">Quarterly</MenuItem>
                        <MenuItem value="semi-annually">Semi-Annually</MenuItem>
                        <MenuItem value="annually">Annually</MenuItem>
                        <MenuItem value="pre-post">Pre/Post Only</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Evaluation Plan */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Evaluation Plan</Typography>
          <Button
            variant="outlined"
            startIcon={<Sparkles />}
            onClick={handleGenerateEvaluation}
            disabled={generatingEvaluation || (proposalData.outcomes || []).length === 0}
            size="small"
          >
            {generatingEvaluation ? 'Generating...' : 'AI Generate Plan'}
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          label="Evaluation Plan Narrative"
          value={proposalData.evaluationPlan || ''}
          onChange={(e) => updateProposalData({ evaluationPlan: e.target.value })}
          placeholder="Describe your overall evaluation approach, including how you will use outcome data to improve the program..."
          helperText="AI can generate this based on your outcomes, or you can write it yourself"
        />
      </Box>

      {/* Best Practices */}
      <Alert severity="success" sx={{ mt: 3 }}>
        <strong>Best Practices:</strong>
        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
          <li>Use outcome-based indicators that measure change, not just activities</li>
          <li>Ensure indicators are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)</li>
          <li>Include both quantitative and qualitative data collection methods</li>
          <li>Plan for baseline data collection before the program starts</li>
          <li>Consider using validated assessment tools when available</li>
        </ul>
      </Alert>
    </Box>
  );
}
