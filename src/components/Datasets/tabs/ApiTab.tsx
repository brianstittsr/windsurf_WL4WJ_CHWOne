'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Divider,
  Alert,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  VisibilityOff,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Dataset } from '@/types/dataset.types';

interface ApiTabProps {
  dataset: Dataset;
}

export default function ApiTab({ dataset }: ApiTabProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Mock API keys - in production, fetch from service
  const apiKeys = [
    {
      id: '1',
      name: 'Production Key',
      key: 'sk_live_1234567890abcdef',
      created: new Date(),
      lastUsed: new Date(),
      requestCount: 1250
    }
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const apiEndpoint = `${baseUrl}/api/datasets/${dataset.id}`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Access
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Integrate this dataset with external applications using our REST API
      </Typography>

      {!dataset.permissions.apiAccess && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          API access is currently disabled for this dataset. Enable it in Settings to use the API.
        </Alert>
      )}

      {/* API Endpoint */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Base Endpoint
        </Typography>
        <TextField
          fullWidth
          value={apiEndpoint}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleCopy(apiEndpoint, 'endpoint')}>
                  <CopyIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          size="small"
        />
        {copiedText === 'endpoint' && (
          <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
            ✓ Copied to clipboard
          </Typography>
        )}
      </Paper>

      {/* API Keys */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            API Keys
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="small"
            disabled={!dataset.permissions.apiAccess}
          >
            Generate Key
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {apiKeys.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Key</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Last Used</strong></TableCell>
                  <TableCell><strong>Requests</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontFamily="monospace">
                          {showApiKey ? key.key : '••••••••••••••••'}
                        </Typography>
                        <IconButton size="small" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <VisibilityOff fontSize="small" /> : <ViewIcon fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleCopy(key.key, key.id)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {copiedText === key.id && (
                        <Typography variant="caption" color="success.main">
                          ✓ Copied
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{key.created.toLocaleDateString()}</TableCell>
                    <TableCell>{key.lastUsed.toLocaleDateString()}</TableCell>
                    <TableCell>{key.requestCount.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No API keys generated yet. Create one to start using the API.
          </Alert>
        )}
      </Paper>

      {/* API Documentation */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          API Documentation
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={3}>
          {/* Get Records */}
          <Box>
            <Chip label="GET" color="success" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span" fontFamily="monospace">
              /records
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Retrieve all records from this dataset
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontFamily="monospace" component="pre">
{`curl -X GET "${apiEndpoint}/records" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </Typography>
            </Paper>
          </Box>

          {/* Create Record */}
          <Box>
            <Chip label="POST" color="primary" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span" fontFamily="monospace">
              /records
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create a new record
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontFamily="monospace" component="pre">
{`curl -X POST "${apiEndpoint}/records" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ data: { field1: 'value1', field2: 'value2' } }, null, 2)}'`}
              </Typography>
            </Paper>
          </Box>

          {/* Update Record */}
          <Box>
            <Chip label="PUT" color="warning" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span" fontFamily="monospace">
              /records/:id
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Update an existing record
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontFamily="monospace" component="pre">
{`curl -X PUT "${apiEndpoint}/records/RECORD_ID" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ data: { field1: 'new_value' } }, null, 2)}'`}
              </Typography>
            </Paper>
          </Box>

          {/* Delete Record */}
          <Box>
            <Chip label="DELETE" color="error" size="small" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span" fontFamily="monospace">
              /records/:id
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Delete a record
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontFamily="monospace" component="pre">
{`curl -X DELETE "${apiEndpoint}/records/RECORD_ID" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </Paper>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g., Production Key"
            helperText="Give this key a descriptive name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setCreateDialogOpen(false)} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
