'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Plus, Trash2, Target } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep3Goals() {
  const { proposalData, updateProposalData } = useGrantGenerator();

  const addGoal = () => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      goal: '',
      objectives: []
    };
    updateProposalData({ goals: [...(proposalData.goals || []), newGoal] });
  };

  const updateGoal = (goalId: string, field: string, value: any) => {
    const updatedGoals = (proposalData.goals || []).map(g =>
      g.id === goalId ? { ...g, [field]: value } : g
    );
    updateProposalData({ goals: updatedGoals });
  };

  const removeGoal = (goalId: string) => {
    const updatedGoals = (proposalData.goals || []).filter(g => g.id !== goalId);
    updateProposalData({ goals: updatedGoals });
  };

  const addObjective = (goalId: string) => {
    const newObjective = {
      id: `obj-${Date.now()}`,
      objective: '',
      measurable: false,
      timebound: false
    };
    
    const updatedGoals = (proposalData.goals || []).map(g =>
      g.id === goalId ? { ...g, objectives: [...g.objectives, newObjective] } : g
    );
    updateProposalData({ goals: updatedGoals });
  };

  const updateObjective = (goalId: string, objId: string, field: string, value: any) => {
    const updatedGoals = (proposalData.goals || []).map(g => {
      if (g.id === goalId) {
        const updatedObjectives = g.objectives.map(o =>
          o.id === objId ? { ...o, [field]: value } : o
        );
        return { ...g, objectives: updatedObjectives };
      }
      return g;
    });
    updateProposalData({ goals: updatedGoals });
  };

  const removeObjective = (goalId: string, objId: string) => {
    const updatedGoals = (proposalData.goals || []).map(g => {
      if (g.id === goalId) {
        return { ...g, objectives: g.objectives.filter(o => o.id !== objId) };
      }
      return g;
    });
    updateProposalData({ goals: updatedGoals });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Goals & Objectives
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Define SMART goals and measurable objectives for your project
      </Typography>

      <Alert severity="info" icon={<Target />} sx={{ mb: 3 }}>
        <strong>SMART Objectives:</strong> Specific, Measurable, Achievable, Relevant, Time-bound
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<Plus />} onClick={addGoal} sx={{ mb: 2 }}>
          Add Goal
        </Button>

        {(proposalData.goals || []).length === 0 ? (
          <Alert severity="warning">
            No goals defined yet. Click "Add Goal" to get started.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(proposalData.goals || []).map((goal, goalIndex) => (
              <Card key={goal.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip label={`Goal ${goalIndex + 1}`} color="primary" />
                    <IconButton size="small" onClick={() => removeGoal(goal.id)} color="error">
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Goal Statement"
                    value={goal.goal}
                    onChange={(e) => updateGoal(goal.id, 'goal', e.target.value)}
                    placeholder="e.g., Improve health outcomes for underserved populations"
                    required
                    sx={{ mb: 3 }}
                  />

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Objectives</Typography>
                      <Button
                        size="small"
                        startIcon={<Plus />}
                        onClick={() => addObjective(goal.id)}
                      >
                        Add Objective
                      </Button>
                    </Box>

                    {goal.objectives.map((obj, objIndex) => (
                      <Card key={obj.id} variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Objective {objIndex + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeObjective(goal.id, obj.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>

                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={obj.objective}
                            onChange={(e) => updateObjective(goal.id, obj.id, 'objective', e.target.value)}
                            placeholder="e.g., Increase health screenings by 50% within 12 months"
                            required
                            sx={{ mb: 1 }}
                          />

                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={obj.measurable}
                                  onChange={(e) => updateObjective(goal.id, obj.id, 'measurable', e.target.checked)}
                                />
                              }
                              label="Measurable"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={obj.timebound}
                                  onChange={(e) => updateObjective(goal.id, obj.id, 'timebound', e.target.checked)}
                                />
                              }
                              label="Time-bound"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}

                    {goal.objectives.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No objectives yet. Add at least one measurable objective for this goal.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
