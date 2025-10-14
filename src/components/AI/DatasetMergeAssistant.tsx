'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { 
  SmartToy as BotIcon,
  Merge as MergeIcon,
  Send as SendIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Dataset } from '@/types/bmad.types';
import { aiAgentService } from '@/services/ai/AiAgentService';
import { dataProcessingService } from '@/services/bmad/DataProcessingService';
import { useAuth } from '@/contexts/AuthContext';

interface DatasetMergeAssistantProps {
  datasets: Dataset[];
  onMergeComplete: (newDataset: Dataset) => void;
}

interface MergeStrategy {
  name: string;
  description: string;
  keyColumns: string[];
  mergeType: 'inner' | 'left' | 'right' | 'outer';
  conflictResolution: 'first' | 'last' | 'custom';
  customResolutions?: Record<string, string>;
}

export default function DatasetMergeAssistant({ datasets, onMergeComplete }: DatasetMergeAssistantProps) {
  const { currentUser } = useAuth();
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>({
    name: '',
    description: '',
    keyColumns: [],
    mergeType: 'inner',
    conflictResolution: 'last'
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [userQuestion, setUserQuestion] = useState('');

  // Steps in the merge process
  const steps = ['Select Datasets', 'Configure Merge Strategy', 'Preview & Confirm'];

  useEffect(() => {
    if (selectedDatasets.length > 0) {
      // Extract all unique column names from selected datasets
      const allColumns = new Set<string>();
      selectedDatasets.forEach(dataset => {
        dataset.columns.forEach(column => {
          allColumns.add(column.name);
        });
      });
      setAvailableColumns(Array.from(allColumns));
    }
  }, [selectedDatasets]);

  const handleDatasetSelect = (dataset: Dataset) => {
    if (selectedDatasets.find(d => d.id === dataset.id)) {
      setSelectedDatasets(selectedDatasets.filter(d => d.id !== dataset.id));
    } else {
      if (selectedDatasets.length < 2) {
        setSelectedDatasets([...selectedDatasets, dataset]);
      }
    }
  };

  const handleKeyColumnChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setMergeStrategy({
      ...mergeStrategy,
      keyColumns: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleMergeTypeChange = (event: SelectChangeEvent) => {
    setMergeStrategy({
      ...mergeStrategy,
      mergeType: event.target.value as 'inner' | 'left' | 'right' | 'outer'
    });
  };

  const handleConflictResolutionChange = (event: SelectChangeEvent) => {
    setMergeStrategy({
      ...mergeStrategy,
      conflictResolution: event.target.value as 'first' | 'last' | 'custom'
    });
  };

  const handleNext = async () => {
    if (activeStep === 0 && selectedDatasets.length !== 2) {
      setError('Please select exactly 2 datasets to merge');
      return;
    }

    if (activeStep === 1) {
      if (!mergeStrategy.name) {
        setError('Please provide a name for the merged dataset');
        return;
      }
      if (mergeStrategy.keyColumns.length === 0) {
        setError('Please select at least one key column for merging');
        return;
      }

      // Generate preview
      setLoading(true);
      try {
        const preview = await dataProcessingService.previewMerge(
          selectedDatasets[0].id,
          selectedDatasets[1].id,
          mergeStrategy
        );
        setPreviewData(preview);
        setLoading(false);
      } catch (err) {
        setError(`Failed to generate preview: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleMerge = async () => {
    if (!currentUser) {
      setError('You must be logged in to merge datasets');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mergedDataset = await dataProcessingService.mergeDatasets(
        selectedDatasets[0].id,
        selectedDatasets[1].id,
        mergeStrategy,
        currentUser.uid
      );
      
      onMergeComplete(mergedDataset);
      // Reset the form
      setSelectedDatasets([]);
      setActiveStep(0);
      setMergeStrategy({
        name: '',
        description: '',
        keyColumns: [],
        mergeType: 'inner',
        conflictResolution: 'last'
      });
    } catch (err) {
      setError(`Failed to merge datasets: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!userQuestion.trim()) return;
    
    setAiThinking(true);
    setError(null);
    
    try {
      // Prepare context about the datasets
      const datasetsInfo = selectedDatasets.map(ds => ({
        id: ds.id,
        name: ds.name,
        columns: ds.columns.map(c => c.name),
        rowCount: ds.rowCount,
        format: ds.format
      }));
      
      // Send the question to the AI
      const response = await aiAgentService.sendMessage(
        JSON.stringify({
          question: userQuestion,
          datasets: datasetsInfo,
          currentStep: steps[activeStep]
        })
      );
      
      setAiSuggestion(response.message.content);
      
      // If AI suggests merge strategy and we're on the right step, try to parse it
      if (activeStep === 1 && response.message.content.includes('MERGE_STRATEGY:')) {
        try {
          const strategyJson = response.message.content.split('MERGE_STRATEGY:')[1].split('```')[1];
          const suggestedStrategy = JSON.parse(strategyJson);
          
          if (suggestedStrategy.keyColumns && suggestedStrategy.mergeType) {
            setMergeStrategy({
              ...mergeStrategy,
              ...suggestedStrategy
            });
          }
        } catch (err) {
          console.error('Failed to parse AI suggested strategy:', err);
        }
      }
    } catch (err) {
      setError(`AI assistant error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiThinking(false);
      setUserQuestion('');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select two datasets to merge
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {datasets.map((dataset) => (
                <Grid item xs={12} sm={6} md={4} key={dataset.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedDatasets.find(d => d.id === dataset.id) 
                        ? '2px solid' 
                        : '1px solid',
                      borderColor: selectedDatasets.find(d => d.id === dataset.id) 
                        ? 'primary.main' 
                        : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => handleDatasetSelect(dataset)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" noWrap sx={{ maxWidth: '80%' }}>
                          {dataset.name}
                        </Typography>
                        {selectedDatasets.find(d => d.id === dataset.id) && (
                          <CheckIcon color="primary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {dataset.rowCount} rows • {dataset.columns.length} columns
                      </Typography>
                      <Chip 
                        label={dataset.format.toUpperCase()} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure merge strategy
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Merged Dataset Name"
                  value={mergeStrategy.name}
                  onChange={(e) => setMergeStrategy({ ...mergeStrategy, name: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                />
                
                <TextField
                  label="Description (optional)"
                  value={mergeStrategy.description}
                  onChange={(e) => setMergeStrategy({ ...mergeStrategy, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  margin="normal"
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="key-columns-label">Key Columns for Joining</InputLabel>
                  <Select
                    labelId="key-columns-label"
                    multiple
                    value={mergeStrategy.keyColumns}
                    onChange={handleKeyColumnChange}
                    input={<OutlinedInput label="Key Columns for Joining" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {availableColumns.map((column) => (
                      <MenuItem key={column} value={column}>
                        <Checkbox checked={mergeStrategy.keyColumns.indexOf(column) > -1} />
                        <ListItemText primary={column} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="merge-type-label">Merge Type</InputLabel>
                  <Select
                    labelId="merge-type-label"
                    value={mergeStrategy.mergeType}
                    onChange={handleMergeTypeChange}
                    label="Merge Type"
                  >
                    <MenuItem value="inner">Inner Join (matching rows only)</MenuItem>
                    <MenuItem value="left">Left Join (keep all rows from first dataset)</MenuItem>
                    <MenuItem value="right">Right Join (keep all rows from second dataset)</MenuItem>
                    <MenuItem value="outer">Outer Join (keep all rows from both datasets)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="conflict-resolution-label">Conflict Resolution</InputLabel>
                  <Select
                    labelId="conflict-resolution-label"
                    value={mergeStrategy.conflictResolution}
                    onChange={handleConflictResolutionChange}
                    label="Conflict Resolution"
                  >
                    <MenuItem value="first">Use values from first dataset</MenuItem>
                    <MenuItem value="last">Use values from second dataset</MenuItem>
                    <MenuItem value="custom">Custom resolution by column</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BotIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">AI Merge Assistant</Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 2, minHeight: 150, maxHeight: 300, overflow: 'auto' }}>
                      {aiSuggestion ? (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {aiSuggestion}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Ask me for help with merging your datasets. I can suggest key columns, 
                          merge types, and strategies based on your data.
                        </Typography>
                      )}
                      
                      {aiThinking && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Thinking...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex' }}>
                      <TextField
                        fullWidth
                        placeholder="Ask for merge recommendations..."
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        disabled={aiThinking}
                        size="small"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAskAI();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAskAI}
                        disabled={!userQuestion.trim() || aiThinking}
                        sx={{ ml: 1 }}
                      >
                        <SendIcon />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview and confirm merge
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Merge Configuration
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Dataset 1:</strong> {selectedDatasets[0]?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Dataset 2:</strong> {selectedDatasets[1]?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Merge Type:</strong> {mergeStrategy.mergeType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Key Columns:</strong> {mergeStrategy.keyColumns.join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Conflict Resolution:</strong> {mergeStrategy.conflictResolution}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : previewData ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Preview (first 5 rows)
                </Typography>
                
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {previewData.columns.map((column: string) => (
                          <th key={column} style={{ 
                            padding: '8px', 
                            borderBottom: '1px solid rgba(0,0,0,0.12)',
                            textAlign: 'left',
                            backgroundColor: 'rgba(0,0,0,0.04)'
                          }}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row: any, index: number) => (
                        <tr key={index}>
                          {previewData.columns.map((column: string) => (
                            <td key={`${index}-${column}`} style={{ 
                              padding: '8px', 
                              borderBottom: '1px solid rgba(0,0,0,0.12)'
                            }}>
                              {row[column] !== undefined ? String(row[column]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing 5 of {previewData.totalRows} rows
                  </Typography>
                  
                  <Chip 
                    label={`${previewData.totalRows} rows × ${previewData.columns.length} columns`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            ) : (
              <Alert severity="info">
                Preview data is being generated...
              </Alert>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MergeIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Dataset Merge Assistant</Typography>
      </Box>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {renderStepContent()}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleMerge}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MergeIcon />}
            >
              {loading ? 'Merging...' : 'Merge Datasets'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
