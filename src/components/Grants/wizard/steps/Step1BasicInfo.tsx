'use client';

import { useState } from 'react';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { 
  TextField, 
  Box, 
  Typography, 
  Grid, 
  Button, 
  IconButton,
  LinearProgress, 
  Paper,
  InputLabel,
  FormControl,
  Chip,
  FormHelperText,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { 
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Description as FileTextIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

export function Step1BasicInfo() {
  const { grantData, updateGrantData, analyzeDocument, isAnalyzingDocument } = useGrantWizard();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAnalysisSuccess, setShowAnalysisSuccess] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      
      // Simulate upload process
      setUploadStatus('uploading');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          
          // Store document reference in grant data
          updateGrantData({
            documents: [...(grantData.documents || []), 
              ...newFiles.map(file => ({ name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() }))
            ]
          });
          
          // Start AI analysis of the document
          analyzeDocument(newFiles[0]);
          
          // Show success message after analysis completes
          setTimeout(() => {
            setShowAnalysisSuccess(true);
            setTimeout(() => setShowAnalysisSuccess(false), 5000); // Hide after 5 seconds
          }, 2500);
        }
      }, 300);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    // Update grant data
    const documents = [...(grantData.documents || [])];
    documents.splice(index, 1);
    updateGrantData({ documents });
  };

  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MM/dd/yyyy');
    } catch (e) {
      return '';
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Document Upload Section */}
      <Paper variant="outlined" sx={{ 
        p: 3, 
        mb: 4, 
        border: '1px dashed rgba(0, 0, 0, 0.2)', 
        borderRadius: 2,
        bgcolor: '#f8f9fa'
      }}>
        {isAnalyzingDocument ? (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CircularProgress size={40} sx={{ mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Analyzing Document with OpenAI...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Extracting grant data, collaboration requirements, and project structure using OpenAI API
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, mb: 2 }}>
              <img src="/openai-logo.svg" alt="OpenAI Logo" width={20} height={20} style={{ marginRight: 8 }} />
              <Typography variant="caption" fontWeight="medium" color="primary">
                Powered by OpenAI GPT-4
              </Typography>
            </Box>
            <LinearProgress sx={{ mt: 1, mb: 1, mx: 'auto', width: '80%', height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary">
              This may take a few moments as the document is being processed
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Upload Grant Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload RFP documents, guidelines, and requirements. We'll use OpenAI to analyze and extract key information.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <img src="/openai-logo.svg" alt="OpenAI Logo" width={16} height={16} style={{ marginRight: 6 }} />
              <Typography variant="caption" color="primary.main">
                Powered by OpenAI GPT-4
              </Typography>
            </Box>
            {showAnalysisSuccess && (
              <Alert severity="success" sx={{ mt: 2, mx: 'auto', maxWidth: 500 }}>
                <AlertTitle>Document Analyzed Successfully</AlertTitle>
                Form fields have been pre-populated based on document analysis. Review and adjust as needed.
              </Alert>
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <label>
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileTextIcon />}
              sx={{ 
                px: 3,
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.15)'
                }
              }}
              disabled={isAnalyzingDocument}
            >
              Browse Files
            </Button>
            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={handleFileChange}
              disabled={isAnalyzingDocument}
            />
          </label>
        </Box>
        
        {uploadStatus === 'uploading' && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 6, borderRadius: 3 }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
        
        {uploadedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Uploaded Files:</Typography>
            <Stack spacing={1}>
              {uploadedFiles.map((file, index) => (
                <Paper key={index} variant="outlined" sx={{ 
                  p: 1, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FileIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({Math.round(file.size / 1024)} KB)
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => removeFile(index)}
                    aria-label="Remove file"
                    disabled={isAnalyzingDocument}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
      
      {/* Grant Information Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FileTextIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Grant Information
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the basic details about the grant
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="grantName"
            label="Grant Name"
            required
            placeholder="Enter grant name"
            value={grantData.name || ''}
            onChange={(e) => updateGrantData({ name: e.target.value })}
            InputProps={{
              endAdornment: grantData.name ? (
                <CheckIcon color="success" sx={{ ml: 1 }} />
              ) : null
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="fundingSource"
            label="Funding Source"
            required
            placeholder="E.g., Federal, State, Private Foundation"
            value={grantData.fundingSource || ''}
            onChange={(e) => updateGrantData({ fundingSource: e.target.value })}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            label="Description"
            placeholder="Provide a brief description of the grant"
            value={grantData.description || ''}
            onChange={(e) => updateGrantData({ description: e.target.value })}
            multiline
            rows={4}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="startDate"
            label="Start Date"
            type="date"
            required
            value={grantData.startDate || ''}
            onChange={(e) => updateGrantData({ startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="endDate"
            label="End Date"
            type="date"
            required
            value={grantData.endDate || ''}
            onChange={(e) => updateGrantData({ endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
