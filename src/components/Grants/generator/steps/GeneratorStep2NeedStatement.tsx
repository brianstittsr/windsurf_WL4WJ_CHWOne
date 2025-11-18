'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep2NeedStatement() {
  const { proposalData, updateProposalData, generateSection } = useGrantGenerator();
  const [generating, setGenerating] = useState(false);

  const handleGenerateNeed = async () => {
    try {
      setGenerating(true);
      const problemStatement = await generateSection('need_statement');
      updateProposalData({ problemStatement });
    } catch (error) {
      console.error('Error generating need statement:', error);
    } finally {
      setGenerating(false);
    }
  };

  const addSupportingData = () => {
    const currentData = proposalData.dataSupporting || [];
    updateProposalData({ dataSupporting: [...currentData, ''] });
  };

  const updateSupportingData = (index: number, value: string) => {
    const currentData = [...(proposalData.dataSupporting || [])];
    currentData[index] = value;
    updateProposalData({ dataSupporting: currentData });
  };

  const removeSupportingData = (index: number) => {
    const currentData = (proposalData.dataSupporting || []).filter((_, i) => i !== index);
    updateProposalData({ dataSupporting: currentData });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Statement of Need
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Describe the problem your project will address and why it's important
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Tip:</strong> A strong need statement includes the problem, affected population, 
        geographic area, and data supporting the need.
      </Alert>

      <Grid container spacing={3}>
        {/* Problem Statement */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Problem Statement</Typography>
            <Button
              size="small"
              startIcon={<Sparkles />}
              onClick={handleGenerateNeed}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'AI Enhance'}
            </Button>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={proposalData.problemStatement || ''}
            onChange={(e) => updateProposalData({ problemStatement: e.target.value })}
            placeholder="Describe the problem or need that your project will address..."
            required
          />
        </Grid>

        {/* Community Need */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Community Need</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={proposalData.communityNeed || ''}
            onChange={(e) => updateProposalData({ communityNeed: e.target.value })}
            placeholder="Explain why this is important to your community..."
            required
          />
        </Grid>

        {/* Target Population */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Target Population"
            value={proposalData.targetPopulation || ''}
            onChange={(e) => updateProposalData({ targetPopulation: e.target.value })}
            placeholder="e.g., Low-income women ages 18-45"
            required
            helperText="Who will benefit from this project?"
          />
        </Grid>

        {/* Geographic Area */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Geographic Area"
            value={proposalData.geographicArea || ''}
            onChange={(e) => updateProposalData({ geographicArea: e.target.value })}
            placeholder="e.g., Durham County, NC"
            required
            helperText="Where will the project take place?"
          />
        </Grid>

        {/* Supporting Data */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Supporting Data & Statistics</Typography>
            <Button size="small" startIcon={<Plus />} onClick={addSupportingData}>
              Add Data Point
            </Button>
          </Box>

          {(proposalData.dataSupporting || []).map((data, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                value={data}
                onChange={(e) => updateSupportingData(index, e.target.value)}
                placeholder="e.g., 35% of residents lack access to healthcare (Source: County Health Dept, 2024)"
              />
              <IconButton onClick={() => removeSupportingData(index)} color="error">
                <Trash2 size={20} />
              </IconButton>
            </Box>
          ))}

          {(proposalData.dataSupporting || []).length === 0 && (
            <Alert severity="warning">
              Add statistics, research findings, or data that support the need for your project
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
