'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Stack,
  Chip,
  MenuItem
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { dataProcessingService } from '@/services/bmad/DataProcessingService';
import { Dataset } from '@/types/bmad.types';
import { useAuth } from '@/contexts/AuthContext';

interface DatasetUploadProps {
  onUploadComplete: (dataset: Dataset) => void;
}

export default function DatasetUpload({ onUploadComplete }: DatasetUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setSheetNames([]);
    setSelectedSheet('');
    
    // Auto-populate name if empty
    if (!name) {
      setName(selectedFile.name.split('.')[0]);
    }
    
    // Clear any previous errors
    setError(null);

    // Detect spreadsheet tabs for multi-sheet Excel workbooks
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      try {
        const names = await dataProcessingService.getSheetNames(selectedFile);
        setSheetNames(names);
        if (names.length > 0) {
          setSelectedSheet(names[0]);
        }
      } catch (err) {
        console.error('Error reading spreadsheet tabs:', err);
      }
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!name) {
      setError('Please provide a name for the dataset');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to upload datasets');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataProcessingService.processFile(
        file,
        selectedSheet || undefined
      );

      if (result.success) {
        const newDataset: Dataset = {
          ...result.data,
          name: name,
          description: description,
          userId: currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        onUploadComplete(newDataset);
      } else {
        throw new Error('Processing failed');
      }
    } catch (err) {
      setError(`Failed to process file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload Dataset
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Box 
            sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'background.default',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Drag & drop a file here, or click to select
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Supported formats: CSV, Excel, JSON
            </Typography>
            
            {file && (
              <Chip 
                label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                color="primary"
                sx={{ mt: 2 }}
              />
            )}
          </Box>
          
          <TextField
            label="Dataset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          {sheetNames.length > 1 && (
            <TextField
              select
              label="Spreadsheet tab to upload"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              fullWidth
              required
              helperText={`This workbook has ${sheetNames.length} tabs`}
            >
              {sheetNames.map((sheet) => (
                <MenuItem key={sheet} value={sheet}>
                  {sheet}
                </MenuItem>
              ))}
            </TextField>
          )}
          
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !file}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {loading ? 'Processing...' : 'Upload Dataset'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
