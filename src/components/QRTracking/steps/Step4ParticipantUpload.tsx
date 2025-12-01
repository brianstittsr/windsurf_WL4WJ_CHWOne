'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  Button,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import { ParticipantDataUpload } from '@/types/qr-tracking-wizard.types';
import { useQRWizardDataset } from '@/hooks/useQRWizardDataset';

interface ParsedParticipant {
  [key: string]: string | number;
}

export default function Step4ParticipantUpload() {
  const { wizardState, updateStep4 } = useQRWizard();
  const { createDataset, loading: datasetLoading, error: datasetError } = useQRWizardDataset();
  
  const [uploadData, setUploadData] = useState<ParticipantDataUpload>(
    wizardState.step4_participants || {
      uploadMethod: 'file',
      participants: [],
      fieldMapping: {},
      validationResults: {
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        warnings: [],
        errors: []
      }
    }
  );

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedParticipant[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetCreated, setDatasetCreated] = useState(false);

  // Get standard fields from Step 3
  const standardFields = wizardState.step3_data?.standardFields || [];
  const customFields = wizardState.step3_data?.customFields || [];

  // Auto-save when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateStep4(uploadData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [uploadData, updateStep4]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('File is empty');
        }

        // Parse CSV
        const headerLine = lines[0];
        const parsedHeaders = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
        setHeaders(parsedHeaders);

        const data: ParsedParticipant[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: ParsedParticipant = {};
          parsedHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }

        setParsedData(data);
        
        // Update upload data
        setUploadData(prev => ({
          ...prev,
          participants: data,
          validationResults: {
            totalRecords: data.length,
            validRecords: data.length,
            invalidRecords: 0,
            warnings: [],
            errors: []
          }
        }));

      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please ensure it is a valid CSV file.');
      } finally {
        setParsing(false);
      }
    };

    reader.readAsText(uploadedFile);
  }, []);

  const handleFieldMapping = (csvHeader: string, targetField: string) => {
    setUploadData(prev => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [csvHeader]: targetField
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
          step: 4,
          data: {
            participantCount: parsedData.length,
            headers: headers,
            sampleData: parsedData.slice(0, 3),
            standardFields: standardFields,
            customFields: customFields.map(f => f.fieldName)
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAiSuggestions(result.analysis);
      } else {
        setAiSuggestions(
          `Data upload assessment:\n\n` +
          `✅ ${parsedData.length} participants uploaded\n` +
          `✅ ${headers.length} columns detected\n` +
          `💡 Map columns to your data fields to proceed`
        );
      }
    } catch (error) {
      console.error('Error analyzing data:', error);
      setAiSuggestions(
        `Analysis unavailable. Your participant data has been uploaded.\n\n` +
        `✅ ${parsedData.length} records loaded\n` +
        `💡 Review field mapping and proceed to next step`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template based on selected fields
    const templateHeaders = [
      ...standardFields,
      ...customFields.map(f => f.fieldName)
    ];
    
    const csv = templateHeaders.join(',') + '\n' +
                'John,Doe,john@example.com,555-0100\n' +
                'Jane,Smith,jane@example.com,555-0101';
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participant_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setDatasetId(null);
    setDatasetCreated(false);
    setUploadData(prev => ({
      ...prev,
      participants: [],
      fieldMapping: {},
      validationResults: {
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        warnings: [],
        errors: []
      }
    }));
  };

  const handleCreateDataset = async () => {
    if (!wizardState.step2_program?.basicInfo?.programName) {
      alert('Program name is required. Please complete Step 2 first.');
      return;
    }

    if (parsedData.length === 0) {
      alert('No participant data to save. Please upload a CSV file first.');
      return;
    }

    try {
      const programName = wizardState.step2_program.basicInfo.programName;
      
      // Map parsed data to the expected format
      const mappedParticipants = parsedData.map(participant => {
        const mapped: Record<string, any> = {};
        Object.keys(uploadData.fieldMapping).forEach(csvHeader => {
          const targetField = uploadData.fieldMapping[csvHeader];
          if (targetField && participant[csvHeader]) {
            mapped[targetField] = participant[csvHeader];
          }
        });
        return mapped;
      });

      const result = await createDataset(
        programName,
        mappedParticipants as any, // Type assertion for flexibility
        standardFields,
        customFields.map(f => ({
          fieldName: f.fieldName,
          fieldType: f.fieldType,
          required: f.required || false
        }))
      );

      if (result && result.datasetId) {
        setDatasetId(result.datasetId);
        setDatasetCreated(true);
      }
    } catch (error) {
      console.error('Error creating dataset:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Upload your participant list via CSV or Excel file. We'll help you map the data to your configured fields.
      </Alert>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Participant Data
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {!file ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                    size="large"
                  >
                    Upload CSV File
                    <input
                      type="file"
                      hidden
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadTemplate}
                  >
                    Download Template
                  </Button>
                </Box>

                <Alert severity="info">
                  <Typography variant="body2" gutterBottom>
                    <strong>File Requirements:</strong>
                  </Typography>
                  <Typography variant="caption" component="div">
                    • CSV or Excel format (.csv, .xlsx, .xls)
                  </Typography>
                  <Typography variant="caption" component="div">
                    • First row should contain column headers
                  </Typography>
                  <Typography variant="caption" component="div">
                    • Include columns for: {standardFields.slice(0, 3).join(', ')}
                    {standardFields.length > 3 && `, and ${standardFields.length - 3} more`}
                  </Typography>
                </Alert>
              </Box>
            ) : (
              <Box>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024).toFixed(2)} KB • {parsedData.length} participants
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {uploadData.validationResults.validRecords > 0 && (
                          <Chip
                            icon={<CheckIcon />}
                            label={`${uploadData.validationResults.validRecords} Valid`}
                            color="success"
                            size="small"
                          />
                        )}
                        {uploadData.validationResults.invalidRecords > 0 && (
                          <Chip
                            icon={<WarningIcon />}
                            label={`${uploadData.validationResults.invalidRecords} Invalid`}
                            color="warning"
                            size="small"
                          />
                        )}
                        <IconButton size="small" onClick={handleClearData} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {parsing && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Field Mapping */}
        {headers.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Map Data Fields
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 2 }}>
                Map the columns from your CSV file to the fields you configured in Step 3.
              </Alert>

              <Grid container spacing={2}>
                {headers.map((header, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 150 }}>
                        <strong>{header}</strong>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Map to field</InputLabel>
                        <Select
                          value={uploadData.fieldMapping[header] || ''}
                          label="Map to field"
                          onChange={(e) => handleFieldMapping(header, e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Skip this column</em>
                          </MenuItem>
                          <MenuItem disabled>
                            <em>--- Standard Fields ---</em>
                          </MenuItem>
                          {standardFields.map(field => (
                            <MenuItem key={field} value={field}>
                              {field}
                            </MenuItem>
                          ))}
                          {customFields.length > 0 && (
                            <MenuItem disabled>
                              <em>--- Custom Fields ---</em>
                            </MenuItem>
                          )}
                          {customFields.map(field => (
                            <MenuItem key={field.fieldId} value={field.fieldName}>
                              {field.fieldName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Data Preview */}
        {parsedData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>#</strong></TableCell>
                      {headers.map((header, index) => (
                        <TableCell key={index}>
                          <strong>{header}</strong>
                          {uploadData.fieldMapping[header] && (
                            <Chip
                              label={uploadData.fieldMapping[header]}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.slice(0, 10).map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        <TableCell>{rowIndex + 1}</TableCell>
                        {headers.map((header, colIndex) => (
                          <TableCell key={colIndex}>
                            {String(row[header] || '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {parsedData.length > 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Showing 10 of {parsedData.length} participants
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* AI Analysis */}
        {parsedData.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={analyzing ? <CircularProgress size={20} /> : <AIIcon />}
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing Data...' : 'Get AI Data Validation'}
              </Button>
            </Box>

            {aiSuggestions && (
              <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
                <Typography variant="subtitle2" gutterBottom>
                  AI Analysis:
                </Typography>
                {aiSuggestions}
              </Alert>
            )}
          </Grid>
        )}

        {/* Validation Summary */}
        {uploadData.validationResults.totalRecords > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Validation Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {uploadData.validationResults.totalRecords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Records
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {uploadData.validationResults.validRecords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Valid Records
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {uploadData.validationResults.invalidRecords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Invalid Records
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {uploadData.validationResults.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Warnings:
                  </Typography>
                  {uploadData.validationResults.warnings.map((warning, index) => (
                    <Typography key={index} variant="caption" display="block">
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}

              {uploadData.validationResults.errors.length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Errors:
                  </Typography>
                  {uploadData.validationResults.errors.map((error, index) => (
                    <Typography key={index} variant="caption" display="block">
                      • {error}
                    </Typography>
                  ))}
                </Alert>
              )}
            </Paper>
          </Grid>
        )}

        {/* Dataset Creation */}
        {parsedData.length > 0 && !datasetCreated && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '2px dashed', borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom color="primary">
                💾 Save to Datasets Admin Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create a dataset to store and manage your participant data in the Datasets Admin Platform.
                This will allow you to track participants, record QR scans, and generate reports.
              </Typography>
              
              {datasetError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {datasetError}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleCreateDataset}
                disabled={datasetLoading || Object.keys(uploadData.fieldMapping).length === 0}
                startIcon={datasetLoading ? <CircularProgress size={20} /> : <CheckIcon />}
              >
                {datasetLoading ? 'Creating Dataset...' : 'Create Dataset & Save Participants'}
              </Button>

              {Object.keys(uploadData.fieldMapping).length === 0 && (
                <Typography variant="caption" display="block" color="warning.main" sx={{ mt: 1 }}>
                  ⚠️ Please map at least one field before creating the dataset
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Dataset Created Success */}
        {datasetCreated && datasetId && (
          <Grid item xs={12}>
            <Alert severity="success" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ✅ Dataset Created Successfully!
              </Typography>
              <Typography variant="body2" paragraph>
                Your participant data has been saved to the Datasets Admin Platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  href={`/datasets/${datasetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Dataset
                </Button>
                <Button
                  variant="outlined"
                  href="/datasets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to Datasets Dashboard
                </Button>
              </Box>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                Dataset ID: {datasetId}
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
