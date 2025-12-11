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
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { Sparkles, Plus, Trash2, Search, Lightbulb } from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';

export function GeneratorStep2NeedStatement() {
  const { proposalData, updateProposalData, generateSection } = useGrantGenerator();
  const [generating, setGenerating] = useState(false);
  const [generatingCommunityNeed, setGeneratingCommunityNeed] = useState(false);
  const [generatingTargetPop, setGeneratingTargetPop] = useState(false);
  const [generatingGeoArea, setGeneratingGeoArea] = useState(false);
  const [researchingData, setResearchingData] = useState(false);

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

  const handleEnhanceCommunityNeed = async () => {
    try {
      setGeneratingCommunityNeed(true);
      const response = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'community_need',
          proposalData: {
            ...proposalData,
            existingContent: proposalData.communityNeed
          }
        })
      });
      const result = await response.json();
      if (result.success && result.content) {
        updateProposalData({ communityNeed: result.content });
      }
    } catch (error) {
      console.error('Error enhancing community need:', error);
    } finally {
      setGeneratingCommunityNeed(false);
    }
  };

  const handleEnhanceTargetPopulation = async () => {
    try {
      setGeneratingTargetPop(true);
      const response = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'target_population',
          proposalData: {
            ...proposalData,
            existingContent: proposalData.targetPopulation
          }
        })
      });
      const result = await response.json();
      if (result.success && result.content) {
        updateProposalData({ targetPopulation: result.content });
      }
    } catch (error) {
      console.error('Error enhancing target population:', error);
    } finally {
      setGeneratingTargetPop(false);
    }
  };

  const handleEnhanceGeographicArea = async () => {
    try {
      setGeneratingGeoArea(true);
      const response = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'geographic_area',
          proposalData: {
            ...proposalData,
            existingContent: proposalData.geographicArea
          }
        })
      });
      const result = await response.json();
      if (result.success && result.content) {
        updateProposalData({ geographicArea: result.content });
      }
    } catch (error) {
      console.error('Error enhancing geographic area:', error);
    } finally {
      setGeneratingGeoArea(false);
    }
  };

  const handleResearchSupportingData = async () => {
    try {
      setResearchingData(true);
      const response = await fetch('/api/ai/research-supporting-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemStatement: proposalData.problemStatement,
          communityNeed: proposalData.communityNeed,
          targetPopulation: proposalData.targetPopulation,
          geographicArea: proposalData.geographicArea,
          projectTitle: proposalData.projectTitle
        })
      });
      const result = await response.json();
      if (result.success && result.dataPoints) {
        // Add the researched data points to existing ones
        const currentData = proposalData.dataSupporting || [];
        updateProposalData({ dataSupporting: [...currentData, ...result.dataPoints] });
      }
    } catch (error) {
      console.error('Error researching supporting data:', error);
    } finally {
      setResearchingData(false);
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Community Need</Typography>
            <Tooltip title="AI will enhance your community need description based on your project context">
              <Button
                size="small"
                startIcon={generatingCommunityNeed ? <CircularProgress size={16} /> : <Sparkles size={16} />}
                onClick={handleEnhanceCommunityNeed}
                disabled={generatingCommunityNeed}
              >
                {generatingCommunityNeed ? 'Enhancing...' : 'AI Enhance'}
              </Button>
            </Tooltip>
          </Box>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>Target Population *</Typography>
            <Tooltip title="AI will suggest detailed target population demographics">
              <Button
                size="small"
                startIcon={generatingTargetPop ? <CircularProgress size={14} /> : <Sparkles size={14} />}
                onClick={handleEnhanceTargetPopulation}
                disabled={generatingTargetPop}
                sx={{ fontSize: '0.75rem', py: 0 }}
              >
                {generatingTargetPop ? 'Enhancing...' : 'AI Enhance'}
              </Button>
            </Tooltip>
          </Box>
          <TextField
            fullWidth
            value={proposalData.targetPopulation || ''}
            onChange={(e) => updateProposalData({ targetPopulation: e.target.value })}
            placeholder="e.g., Low-income women ages 18-45"
            required
            helperText="Who will benefit from this project?"
          />
        </Grid>

        {/* Geographic Area */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>Geographic Area *</Typography>
            <Tooltip title="AI will provide demographic details about your target area">
              <Button
                size="small"
                startIcon={generatingGeoArea ? <CircularProgress size={14} /> : <Sparkles size={14} />}
                onClick={handleEnhanceGeographicArea}
                disabled={generatingGeoArea}
                sx={{ fontSize: '0.75rem', py: 0 }}
              >
                {generatingGeoArea ? 'Enhancing...' : 'AI Enhance'}
              </Button>
            </Tooltip>
          </Box>
          <TextField
            fullWidth
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="AI will research and suggest relevant statistics, data points, and research findings for your target area and population">
                <Button 
                  size="small" 
                  variant="contained"
                  color="secondary"
                  startIcon={researchingData ? <CircularProgress size={16} color="inherit" /> : <Search size={16} />}
                  onClick={handleResearchSupportingData}
                  disabled={researchingData || (!proposalData.targetPopulation && !proposalData.geographicArea)}
                >
                  {researchingData ? 'Researching...' : 'AI Research'}
                </Button>
              </Tooltip>
              <Button size="small" startIcon={<Plus size={16} />} onClick={addSupportingData}>
                Add Data Point
              </Button>
            </Box>
          </Box>

          {researchingData && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">
                  AI is researching statistics and data for {proposalData.geographicArea || 'your target area'}...
                </Typography>
              </Box>
            </Alert>
          )}

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

          {(proposalData.dataSupporting || []).length === 0 && !researchingData && (
            <Alert severity="warning" icon={<Lightbulb size={20} />}>
              Click "AI Research" to automatically gather statistics and data points for your target area, 
              or manually add data that supports the need for your project.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
