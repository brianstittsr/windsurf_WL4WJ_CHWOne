'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Button, 
  TextField, 
  Paper, 
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Stub APIAccess component for build compatibility
export const APIAccess = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [apiKey, setApiKey] = useState('sk_test_example_key_12345');
  const [showKey, setShowKey] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const generateNewKey = () => {
    // In a real app, this would call an API to generate a new key
    setApiKey(`sk_test_${Math.random().toString(36).substring(2, 15)}`);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        API Access
      </Typography>
      <Typography variant="body1" paragraph>
        Access the CHWOne platform programmatically using our REST API.
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="API Keys" />
        <Tab label="Documentation" />
        <Tab label="Usage" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Your API Keys</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={generateNewKey}
                >
                  Generate New Key
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Keep your API keys secure. Do not share them in publicly accessible areas.
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Live API Key
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                      {showKey ? apiKey : '•'.repeat(20)}
                    </Typography>
                  </Box>
                  <Box>
                    <Button 
                      size="small" 
                      onClick={() => setShowKey(!showKey)}
                      sx={{ mr: 1 }}
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </Button>
                    <IconButton onClick={handleCopyKey} size="small">
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            API Key Security
          </Typography>
          <Typography variant="body2" paragraph>
            Your API key is a secret. Keep it secure and never share it in client-side code.
            If you believe your API key has been compromised, generate a new one immediately.
          </Typography>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            API Documentation
          </Typography>
          <Typography variant="body2" paragraph>
            Our REST API allows you to access and manage CHW data programmatically.
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CodeIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Base URL</Typography>
            </Box>
            <Box 
              sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                position: 'relative'
              }}
            >
              <Typography variant="body2" component="code">
                https://api.chwone.org/v1
              </Typography>
              <IconButton 
                size="small" 
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => {
                  navigator.clipboard.writeText('https://api.chwone.org/v1');
                  setSnackbarOpen(true);
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
          
          <Typography variant="h6" gutterBottom>
            Authentication
          </Typography>
          <Typography variant="body2" paragraph>
            All API requests require authentication using your API key in the Authorization header:
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'monospace',
              mb: 3
            }}
          >
            <Typography variant="body2" component="code">
              Authorization: Bearer YOUR_API_KEY
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Available Endpoints
          </Typography>
          
          <Paper variant="outlined" sx={{ mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                GET /chws
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Retrieve a list of all community health workers.
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameters
              </Typography>
              <Typography variant="body2">
                <code>limit</code> - Number of records to return (default: 20, max: 100)
              </Typography>
              <Typography variant="body2">
                <code>offset</code> - Number of records to skip (default: 0)
              </Typography>
            </Box>
          </Paper>
          
          <Paper variant="outlined" sx={{ mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                GET /chws/{'{id}'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Retrieve a specific community health worker by ID.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            API Usage Examples
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Example: Fetch all CHWs
            </Typography>
            
            <Box 
              sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                mb: 2,
                position: 'relative',
                overflowX: 'auto'
              }}
            >
              <pre style={{ margin: 0 }}>
{`fetch('https://api.chwone.org/v1/chws', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
              </pre>
              <IconButton 
                size="small" 
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => {
                  navigator.clipboard.writeText(`fetch('https://api.chwone.org/v1/chws', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`);
                  setSnackbarOpen(true);
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Response
            </Typography>
            
            <Box 
              sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                overflowX: 'auto'
              }}
            >
              <pre style={{ margin: 0 }}>
{`{
  "data": [
    {
      "id": "chw_123",
      "name": "Jane Smith",
      "region": "Region 5",
      "certifications": ["Basic CHW", "Maternal Health"],
      "active": true
    },
    {
      "id": "chw_124",
      "name": "John Doe",
      "region": "Region 5",
      "certifications": ["Basic CHW"],
      "active": true
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}`}
              </pre>
            </Box>
          </Paper>
          
          <Typography variant="h6" gutterBottom>
            Rate Limits
          </Typography>
          <Typography variant="body2" paragraph>
            The API is rate-limited to 100 requests per minute. If you exceed this limit, you&apos;ll receive a 429 Too Many Requests response.
          </Typography>
        </Box>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default APIAccess;
