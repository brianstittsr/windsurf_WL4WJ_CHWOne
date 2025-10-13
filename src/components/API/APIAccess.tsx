'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Key as KeyIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

interface APIEndpoint {
  method: string;
  endpoint: string;
  description: string;
  parameters?: string[];
  response?: string;
}

export default function APIAccess() {
  const { currentUser } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'chws:read',
    'chws:write',
    'projects:read',
    'projects:write',
    'grants:read',
    'grants:write',
    'referrals:read',
    'referrals:write',
    'resources:read',
    'resources:write',
    'surveys:read',
    'datasets:read',
    'datasets:export'
  ];

  const apiEndpoints: APIEndpoint[] = [
    {
      method: 'GET',
      endpoint: '/api/chws',
      description: 'Retrieve all Community Health Workers',
      parameters: ['limit', 'offset', 'search'],
      response: 'Array of CHW objects'
    },
    {
      method: 'POST',
      endpoint: '/api/chws',
      description: 'Create a new Community Health Worker',
      parameters: ['chw data object'],
      response: 'Created CHW object'
    },
    {
      method: 'GET',
      endpoint: '/api/projects',
      description: 'Retrieve all projects',
      parameters: ['limit', 'offset', 'status'],
      response: 'Array of project objects'
    },
    {
      method: 'GET',
      endpoint: '/api/grants',
      description: 'Retrieve all grants',
      parameters: ['limit', 'offset', 'status'],
      response: 'Array of grant objects'
    },
    {
      method: 'GET',
      endpoint: '/api/referrals',
      description: 'Retrieve all referrals',
      parameters: ['limit', 'offset', 'status'],
      response: 'Array of referral objects'
    }
  ];

  useEffect(() => {
    // Load API keys from localStorage or API
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'chw_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateKey = () => {
    const key = generateApiKey();
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: formData.name,
      key: key,
      permissions: formData.permissions,
      createdAt: new Date(),
      isActive: true
    };

    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));

    setNewApiKey(key);
    setShowCreateModal(false);
    setShowKeyModal(true);
    setFormData({ name: '', permissions: [] });
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission]
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission)
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateCurlExample = (endpoint?: APIEndpoint) => {
    if (!endpoint) return '';
    return `curl -X ${endpoint.method} \\
  "https://your-domain.com${endpoint.endpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
  };

  const generateJavaScriptExample = (endpoint?: APIEndpoint) => {
    if (!endpoint) return '';
    return `fetch('https://your-domain.com${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            API Access
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage API keys and explore available endpoints
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
          size="large"
        >
          New API Key
        </Button>
      </Box>

      {/* API Keys Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Your API Keys
          </Typography>

          {apiKeys.length === 0 ? (
            <Alert severity="info">
              No API keys created yet. Create your first key to get started.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Key (Partial)</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {apiKey.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {apiKey.key.substring(0, 12)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {apiKey.permissions.slice(0, 3).map((perm) => (
                            <Chip key={perm} label={perm} size="small" variant="outlined" />
                          ))}
                          {apiKey.permissions.length > 3 && (
                            <Chip label={`+${apiKey.permissions.length - 3}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={apiKey.isActive ? 'Active' : 'Inactive'}
                          color={apiKey.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {apiKey.createdAt.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            API Endpoints
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Method</TableCell>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiEndpoints.map((endpoint, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={endpoint.method}
                        color={endpoint.method === 'GET' ? 'success' : endpoint.method === 'POST' ? 'primary' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {endpoint.endpoint}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {endpoint.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CodeIcon />}
                        onClick={() => setSelectedEndpoint(endpoint.endpoint)}
                      >
                        Examples
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Key Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Permissions
          </Typography>

          <Grid container spacing={2}>
            {availablePermissions.map((permission) => (
              <Grid item xs={12} md={6} key={permission}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.permissions.includes(permission)}
                      onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                    />
                  }
                  label={permission}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateKey} variant="contained" disabled={!formData.name}>
            Create Key
          </Button>
        </DialogActions>
      </Dialog>

      {/* Show New Key Modal */}
      <Dialog open={showKeyModal} onClose={() => setShowKeyModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Your New API Key</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Important:</strong> This is the only time you&apos;ll see this API key.
            Copy it now and store it securely. If you lose it, you&apos;ll need to create a new one.
          </Alert>

          <TextField
            fullWidth
            label="API Key"
            value={newApiKey}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={() => copyToClipboard(newApiKey)}
            fullWidth
          >
            Copy to Clipboard
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowKeyModal(false)} variant="contained">
            I&apos;ve Saved My Key
          </Button>
        </DialogActions>
      </Dialog>

      {/* Code Examples Modal */}
      <Dialog
        open={!!selectedEndpoint}
        onClose={() => setSelectedEndpoint(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Code Examples - {selectedEndpoint}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            cURL Example:
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {selectedEndpoint && generateCurlExample(apiEndpoints.find(e => e.endpoint === selectedEndpoint))}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            JavaScript Example:
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {selectedEndpoint && generateJavaScriptExample(apiEndpoints.find(e => e.endpoint === selectedEndpoint))}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEndpoint(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowCreateModal(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
