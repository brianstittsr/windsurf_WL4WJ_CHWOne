'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { CheckCircle, AlertCircle, FileText, Target, Users, BarChart3, DollarSign } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep7Review() {
  const { proposalData } = useGrantGenerator();

  const getCompletionStatus = () => {
    const checks = {
      overview: !!(proposalData.organizationName && proposalData.projectTitle && proposalData.fundingAmount),
      need: !!(proposalData.problemStatement && proposalData.targetPopulation),
      goals: (proposalData.goals || []).length > 0,
      activities: (proposalData.activities || []).length > 0,
      outcomes: (proposalData.outcomes || []).length > 0,
      budget: (proposalData.budgetItems || []).length > 0
    };

    const completed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return { checks, completed, total, percentage: (completed / total) * 100 };
  };

  const status = getCompletionStatus();

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Review & Generate Proposal
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your proposal details before generating the final document
      </Typography>

      {/* Completion Status */}
      <Card sx={{ mb: 3, bgcolor: status.percentage === 100 ? 'success.light' : 'warning.light' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Proposal Completion</Typography>
              <Typography variant="body2">
                {status.completed} of {status.total} sections completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h3" fontWeight={700}>
                {Math.round(status.percentage)}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Section Status */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Section Checklist</Typography>
          <List>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.overview ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Project Overview"
                secondary={status.checks.overview ? 'Complete' : 'Incomplete - Add organization and project details'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.need ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Need Statement"
                secondary={status.checks.need ? 'Complete' : 'Incomplete - Add problem statement and target population'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.goals ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Goals & Objectives"
                secondary={status.checks.goals ? `${(proposalData.goals || []).length} goal(s) defined` : 'Incomplete - Add at least one goal'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.activities ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Activities & Methods"
                secondary={status.checks.activities ? `${(proposalData.activities || []).length} activit(ies) defined` : 'Incomplete - Add project activities'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.outcomes ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Outcomes & Evaluation"
                secondary={status.checks.outcomes ? `${(proposalData.outcomes || []).length} outcome(s) defined` : 'Incomplete - Add outcome indicators'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.budget ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Budget & Resources"
                secondary={status.checks.budget ? `$${(proposalData.totalBudget || 0).toLocaleString()} total budget` : 'Incomplete - Add budget items'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Proposal Summary */}
      <Typography variant="h6" gutterBottom>Proposal Summary</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FileText size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Project Information</Typography>
              </Box>
              <Typography variant="body2"><strong>Title:</strong> {proposalData.projectTitle || 'Not set'}</Typography>
              <Typography variant="body2"><strong>Organization:</strong> {proposalData.organizationName || 'Not set'}</Typography>
              <Typography variant="body2"><strong>Funder:</strong> {proposalData.targetFunder || 'Not set'}</Typography>
              <Typography variant="body2"><strong>Duration:</strong> {proposalData.projectDuration || 'Not set'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DollarSign size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Budget Summary</Typography>
              </Box>
              <Typography variant="h5" color="primary" fontWeight={700}>
                ${(proposalData.totalBudget || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(proposalData.budgetItems || []).length} line item(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Target size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Goals</Typography>
              </Box>
              <Typography variant="h4">{(proposalData.goals || []).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(proposalData.goals || []).reduce((sum, g) => sum + g.objectives.length, 0)} objectives
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Users size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Activities</Typography>
              </Box>
              <Typography variant="h4">{(proposalData.activities || []).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(proposalData.activities || []).reduce((sum, a) => sum + a.participants, 0)} total participants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BarChart3 size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Outcomes</Typography>
              </Box>
              <Typography variant="h4">{(proposalData.outcomes || []).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                outcome indicators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Generation Notice */}
      {status.percentage === 100 ? (
        <Alert severity="success">
          <strong>Ready to Generate!</strong> Your proposal is complete. Click "Generate Proposal" 
          to create a professional grant proposal document with AI assistance.
        </Alert>
      ) : (
        <Alert severity="warning">
          <strong>Incomplete Sections:</strong> Some sections are not complete. You can still generate 
          a proposal, but it's recommended to complete all sections for the best results.
        </Alert>
      )}
    </Box>
  );
}
