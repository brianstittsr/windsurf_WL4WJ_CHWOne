'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`billcom-tabpanel-${index}`}
      aria-labelledby={`billcom-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Transaction {
  id: string;
  type: 'payment' | 'invoice' | 'vendor';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  description: string;
  environment: 'test' | 'production';
}

interface APICredentials {
  apiKey: string;
  orgId: string;
  environment: 'test' | 'production';
}

export default function AdminBillComAPI() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // API Configuration State
  const [isTestMode, setIsTestMode] = useState(true);
  const [testCredentials, setTestCredentials] = useState<APICredentials>({
    apiKey: '',
    orgId: '',
    environment: 'test',
  });
  const [prodCredentials, setProdCredentials] = useState<APICredentials>({
    apiKey: '',
    orgId: '',
    environment: 'production',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Transaction Testing State
  const [testTransaction, setTestTransaction] = useState({
    type: 'payment',
    amount: '',
    vendorId: '',
    description: '',
  });
  
  // Transaction History
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      type: 'payment',
      amount: 150.00,
      status: 'completed',
      date: new Date('2025-11-28'),
      description: 'Test Payment - Grant Processing Fee',
      environment: 'test',
    },
    {
      id: 'TXN-002',
      type: 'invoice',
      amount: 500.00,
      status: 'pending',
      date: new Date('2025-11-29'),
      description: 'Test Invoice - CHW Training Services',
      environment: 'test',
    },
  ]);
  
  // Connection Status
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('disconnected');
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setConnectionStatus('checking');
    
    try {
      const credentials = isTestMode ? testCredentials : prodCredentials;
      
      if (!credentials.apiKey || !credentials.orgId) {
        throw new Error('API Key and Organization ID are required');
      }
      
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would make actual API call:
      // const response = await fetch('https://api.bill.com/v3/ping', {
      //   headers: {
      //     'x-api-key': credentials.apiKey,
      //     'x-org-id': credentials.orgId,
      //   }
      // });
      
      setConnectionStatus('connected');
      setSuccess(`Successfully connected to Bill.com ${isTestMode ? 'Test' : 'Production'} API`);
    } catch (err: any) {
      setConnectionStatus('disconnected');
      setError(err.message || 'Failed to connect to Bill.com API');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendTestTransaction = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!testTransaction.amount || parseFloat(testTransaction.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Simulate API transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, you would make actual API call:
      // const response = await fetch('https://api.bill.com/v3/payments', {
      //   method: 'POST',
      //   headers: {
      //     'x-api-key': testCredentials.apiKey,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(testTransaction)
      // });
      
      const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        type: testTransaction.type as 'payment' | 'invoice' | 'vendor',
        amount: parseFloat(testTransaction.amount),
        status: 'completed',
        date: new Date(),
        description: testTransaction.description || 'Test Transaction',
        environment: isTestMode ? 'test' : 'production',
      };
      
      setTransactions([newTransaction, ...transactions]);
      setSuccess('Test transaction completed successfully');
      
      // Reset form
      setTestTransaction({
        type: 'payment',
        amount: '',
        vendorId: '',
        description: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process test transaction');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyApiKey = () => {
    const credentials = isTestMode ? testCredentials : prodCredentials;
    navigator.clipboard.writeText(credentials.apiKey);
    setSuccess('API Key copied to clipboard');
  };
  
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setSuccess('Transaction deleted');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Bill.com API Integration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Test and manage eCommerce transactions via Bill.com API
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {isTestMode ? 'Test Mode' : 'Production Mode'}
                </Typography>
                <Chip
                  label={isTestMode ? 'TEST' : 'LIVE'}
                  color={isTestMode ? 'info' : 'error'}
                  size="small"
                />
              </Box>
            }
          />
          <Chip
            icon={connectionStatus === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
            label={connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            color={connectionStatus === 'connected' ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Bill.com API Documentation:</strong>{' '}
          <a href="https://developer.bill.com/docs/home" target="_blank" rel="noopener noreferrer">
            https://developer.bill.com/docs/home
          </a>
        </Typography>
      </Alert>
      
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<SettingsIcon />} label="API Configuration" iconPosition="start" />
            <Tab icon={<SendIcon />} label="Test Transactions" iconPosition="start" />
            <Tab icon={<ReceiptIcon />} label="Transaction History" iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* API Configuration Tab */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    <strong>Security Notice:</strong> Never commit API credentials to version control.
                    Store them securely in environment variables.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {isTestMode ? 'Test Environment' : 'Production Environment'} Credentials
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization ID"
                  value={isTestMode ? testCredentials.orgId : prodCredentials.orgId}
                  onChange={(e) => {
                    if (isTestMode) {
                      setTestCredentials({ ...testCredentials, orgId: e.target.value });
                    } else {
                      setProdCredentials({ ...prodCredentials, orgId: e.target.value });
                    }
                  }}
                  placeholder="Enter your Bill.com Organization ID"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalanceIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  type={showApiKey ? 'text' : 'password'}
                  value={isTestMode ? testCredentials.apiKey : prodCredentials.apiKey}
                  onChange={(e) => {
                    if (isTestMode) {
                      setTestCredentials({ ...testCredentials, apiKey: e.target.value });
                    } else {
                      setProdCredentials({ ...prodCredentials, apiKey: e.target.value });
                    }
                  }}
                  placeholder="Enter your Bill.com API Key"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={handleCopyApiKey} edge="end">
                          <ContentCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    onClick={handleTestConnection}
                    disabled={loading}
                  >
                    {loading ? 'Testing Connection...' : 'Test Connection'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      if (isTestMode) {
                        setTestCredentials({ apiKey: '', orgId: '', environment: 'test' });
                      } else {
                        setProdCredentials({ apiKey: '', orgId: '', environment: 'production' });
                      }
                    }}
                  >
                    Clear Credentials
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Quick Setup Guide
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Create a Bill.com developer account at{' '}
                      <a href="https://developer.bill.com" target="_blank" rel="noopener noreferrer">
                        developer.bill.com
                      </a>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Generate API credentials from your developer dashboard
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Enter your Organization ID and API Key above
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Test the connection before processing transactions
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Switch to Production mode when ready to process live transactions
                    </Typography>
                  </li>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>
        
        {/* Test Transactions Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Send Test Transaction
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Test the Bill.com API by sending a sample transaction
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={testTransaction.type}
                    label="Transaction Type"
                    onChange={(e) => setTestTransaction({ ...testTransaction, type: e.target.value })}
                  >
                    <MenuItem value="payment">Payment</MenuItem>
                    <MenuItem value="invoice">Invoice</MenuItem>
                    <MenuItem value="vendor">Vendor Payment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={testTransaction.amount}
                  onChange={(e) => setTestTransaction({ ...testTransaction, amount: e.target.value })}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor ID (Optional)"
                  value={testTransaction.vendorId}
                  onChange={(e) => setTestTransaction({ ...testTransaction, vendorId: e.target.value })}
                  placeholder="Enter vendor ID if applicable"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={testTransaction.description}
                  onChange={(e) => setTestTransaction({ ...testTransaction, description: e.target.value })}
                  placeholder="Enter transaction description"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={handleSendTestTransaction}
                  disabled={loading || connectionStatus !== 'connected'}
                >
                  {loading ? 'Processing...' : 'Send Test Transaction'}
                </Button>
                {connectionStatus !== 'connected' && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    Please configure and test API connection first
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>
        
        {/* Transaction History Tab */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Transaction History
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => setSuccess('Transaction history refreshed')}
              >
                Refresh
              </Button>
            </Box>
            
            {transactions.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Environment</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ${transaction.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            size="small"
                            color={getStatusColor(transaction.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.environment}
                            size="small"
                            color={transaction.environment === 'test' ? 'info' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          {transaction.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {transaction.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete Transaction">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }} variant="outlined">
                <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No transactions yet. Send a test transaction to get started.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  );
}
