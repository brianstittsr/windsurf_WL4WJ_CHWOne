'use client';

import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Email as EmailIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
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
  type: 'payment' | 'invoice' | 'vendor' | 'chw_payment';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'sent';
  date: Date;
  description: string;
  environment: 'test' | 'production';
  paymentLink?: string;
  recipientEmail?: string;
  collaborationId?: string;
  chwId?: string;
}

interface APICredentials {
  apiKey: string;
  orgId: string;
  environment: 'test' | 'production';
}

interface Invoice {
  id: string;
  payorName: string;
  payorEmail: string;
  amount: number;
  description: string;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  paymentLink: string;
  createdAt: Date;
}

interface CHW {
  id: string;
  name: string;
  email: string;
  bankAccountLast4?: string;
}

interface Collaboration {
  id: string;
  name: string;
  budget: number;
  spent: number;
  remaining: number;
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
  
  // Invoice State
  const [invoiceForm, setInvoiceForm] = useState({
    payorName: '',
    payorEmail: '',
    amount: '',
    description: '',
    dueDate: '',
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [generatedPaymentLink, setGeneratedPaymentLink] = useState<string | null>(null);
  
  // CHW Payment State
  const [chwPaymentForm, setChwPaymentForm] = useState({
    chwId: '',
    collaborationId: '',
    amount: '',
    description: '',
    paymentMethod: 'ach',
  });
  const [selectedChw, setSelectedChw] = useState<CHW | null>(null);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  
  // Mock data for CHWs and Collaborations
  const [chws] = useState<CHW[]>([
    { id: 'chw-001', name: 'Maria Garcia', email: 'maria.garcia@example.com', bankAccountLast4: '4521' },
    { id: 'chw-002', name: 'James Wilson', email: 'james.wilson@example.com', bankAccountLast4: '7832' },
    { id: 'chw-003', name: 'Ana Blackburn', email: 'anab@wl4wj.org', bankAccountLast4: '9156' },
    { id: 'chw-004', name: 'Robert Johnson', email: 'robert.j@example.com', bankAccountLast4: '3478' },
  ]);
  
  const [collaborations] = useState<Collaboration[]>([
    { id: 'collab-001', name: 'Region 5 Health Outreach', budget: 50000, spent: 32000, remaining: 18000 },
    { id: 'collab-002', name: 'Community Wellness Initiative', budget: 75000, spent: 45000, remaining: 30000 },
    { id: 'collab-003', name: 'Rural Health Access Program', budget: 100000, spent: 67500, remaining: 32500 },
    { id: 'collab-004', name: 'Maternal Health Support', budget: 25000, spent: 12000, remaining: 13000 },
  ]);
  
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
  
  // Generate and send invoice with payment link
  const handleSendInvoice = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedPaymentLink(null);
    
    try {
      if (!invoiceForm.payorEmail || !invoiceForm.amount || !invoiceForm.payorName) {
        throw new Error('Payor name, email, and amount are required');
      }
      
      if (parseFloat(invoiceForm.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Simulate Bill.com API call to create invoice and generate payment link
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would make actual Bill.com API calls:
      // 1. Create customer/payor if not exists
      // 2. Create invoice
      // 3. Generate payment link
      // const response = await fetch('https://api.bill.com/v3/invoices', {
      //   method: 'POST',
      //   headers: { 'x-api-key': credentials.apiKey, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ... })
      // });
      
      const invoiceId = `INV-${Date.now()}`;
      const paymentLink = `https://app.bill.com/pay/${isTestMode ? 'test-' : ''}${invoiceId}`;
      
      const newInvoice: Invoice = {
        id: invoiceId,
        payorName: invoiceForm.payorName,
        payorEmail: invoiceForm.payorEmail,
        amount: parseFloat(invoiceForm.amount),
        description: invoiceForm.description || 'Invoice',
        dueDate: invoiceForm.dueDate ? new Date(invoiceForm.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'sent',
        paymentLink: paymentLink,
        createdAt: new Date(),
      };
      
      setInvoices([newInvoice, ...invoices]);
      setGeneratedPaymentLink(paymentLink);
      
      // Add to transaction history
      const newTransaction: Transaction = {
        id: invoiceId,
        type: 'invoice',
        amount: parseFloat(invoiceForm.amount),
        status: 'sent',
        date: new Date(),
        description: `Invoice to ${invoiceForm.payorName}: ${invoiceForm.description || 'Invoice'}`,
        environment: isTestMode ? 'test' : 'production',
        paymentLink: paymentLink,
        recipientEmail: invoiceForm.payorEmail,
      };
      setTransactions([newTransaction, ...transactions]);
      
      setSuccess(`Invoice sent to ${invoiceForm.payorEmail} with payment link`);
      
      // Reset form
      setInvoiceForm({
        payorName: '',
        payorEmail: '',
        amount: '',
        description: '',
        dueDate: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };
  
  // Pay CHW for collaboration work
  const handlePayCHW = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!selectedChw || !selectedCollaboration || !chwPaymentForm.amount) {
        throw new Error('Please select a CHW, collaboration project, and enter an amount');
      }
      
      const amount = parseFloat(chwPaymentForm.amount);
      if (amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (amount > selectedCollaboration.remaining) {
        throw new Error(`Amount exceeds remaining budget ($${selectedCollaboration.remaining.toLocaleString()})`);
      }
      
      // Simulate Bill.com API call to process vendor payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would make actual Bill.com API calls:
      // 1. Create vendor (CHW) if not exists
      // 2. Create bill/payment
      // 3. Process ACH or check payment
      // const response = await fetch('https://api.bill.com/v3/vendorPayments', {
      //   method: 'POST',
      //   headers: { 'x-api-key': credentials.apiKey, 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ... })
      // });
      
      const paymentId = `PAY-${Date.now()}`;
      
      // Add to transaction history
      const newTransaction: Transaction = {
        id: paymentId,
        type: 'chw_payment',
        amount: amount,
        status: 'completed',
        date: new Date(),
        description: `Payment to ${selectedChw.name} for ${selectedCollaboration.name}`,
        environment: isTestMode ? 'test' : 'production',
        collaborationId: selectedCollaboration.id,
        chwId: selectedChw.id,
      };
      setTransactions([newTransaction, ...transactions]);
      
      setSuccess(`Payment of $${amount.toFixed(2)} sent to ${selectedChw.name} (Account ending in ${selectedChw.bankAccountLast4})`);
      
      // Reset form
      setChwPaymentForm({
        chwId: '',
        collaborationId: '',
        amount: '',
        description: '',
        paymentMethod: 'ach',
      });
      setSelectedChw(null);
      setSelectedCollaboration(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process CHW payment');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setSuccess('Payment link copied to clipboard');
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
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<SettingsIcon />} label="API Configuration" iconPosition="start" />
            <Tab icon={<EmailIcon />} label="Send Invoice" iconPosition="start" />
            <Tab icon={<AttachMoneyIcon />} label="Pay CHW" iconPosition="start" />
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
        
        {/* Send Invoice Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Send Invoice with Payment Link
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create and send an invoice to a payor with a Bill.com payment link
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payor Name"
                  value={invoiceForm.payorName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, payorName: e.target.value })}
                  placeholder="Enter payor/customer name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payor Email"
                  type="email"
                  value={invoiceForm.payorEmail}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, payorEmail: e.target.value })}
                  placeholder="payor@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Invoice Amount"
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Invoice Description"
                  multiline
                  rows={3}
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  placeholder="Describe the services or products being invoiced"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={handleSendInvoice}
                  disabled={loading || connectionStatus !== 'connected'}
                >
                  {loading ? 'Sending Invoice...' : 'Send Invoice & Generate Payment Link'}
                </Button>
                {connectionStatus !== 'connected' && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    Please configure and test API connection first
                  </Typography>
                )}
              </Grid>
              
              {generatedPaymentLink && (
                <Grid item xs={12}>
                  <Alert 
                    severity="success" 
                    icon={<LinkIcon />}
                    action={
                      <Button 
                        color="inherit" 
                        size="small" 
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopyPaymentLink(generatedPaymentLink)}
                      >
                        Copy Link
                      </Button>
                    }
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Payment Link Generated:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {generatedPaymentLink}
                    </Typography>
                  </Alert>
                </Grid>
              )}
              
              {invoices.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Recent Invoices
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice ID</TableCell>
                          <TableCell>Payor</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Payment Link</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.slice(0, 5).map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{invoice.id}</TableCell>
                            <TableCell>
                              <Typography variant="body2">{invoice.payorName}</Typography>
                              <Typography variant="caption" color="text.secondary">{invoice.payorEmail}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>${invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Chip label={invoice.status} size="small" color={invoice.status === 'paid' ? 'success' : 'warning'} />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Copy Payment Link">
                                <IconButton size="small" onClick={() => handleCopyPaymentLink(invoice.paymentLink)}>
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </TabPanel>
        
        {/* Pay CHW Tab */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Pay Community Health Worker
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Process payment to a CHW for services rendered on a collaboration project
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={chws}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={selectedChw}
                  onChange={(_, newValue) => setSelectedChw(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select CHW"
                      placeholder="Search for a CHW..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email} • Account ****{option.bankAccountLast4}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={collaborations}
                  getOptionLabel={(option) => option.name}
                  value={selectedCollaboration}
                  onChange={(_, newValue) => setSelectedCollaboration(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Collaboration Project"
                      placeholder="Search for a project..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <WorkIcon color="action" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body1">{option.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Budget: ${option.budget.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            Remaining: ${option.remaining.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                />
              </Grid>
              
              {selectedCollaboration && (
                <Grid item xs={12}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="body2">
                      <strong>{selectedCollaboration.name}</strong><br />
                      Total Budget: ${selectedCollaboration.budget.toLocaleString()} | 
                      Spent: ${selectedCollaboration.spent.toLocaleString()} | 
                      <strong style={{ color: '#2e7d32' }}> Remaining: ${selectedCollaboration.remaining.toLocaleString()}</strong>
                    </Typography>
                  </Alert>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Amount"
                  type="number"
                  value={chwPaymentForm.amount}
                  onChange={(e) => setChwPaymentForm({ ...chwPaymentForm, amount: e.target.value })}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={selectedCollaboration ? `Max: $${selectedCollaboration.remaining.toLocaleString()}` : ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={chwPaymentForm.paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setChwPaymentForm({ ...chwPaymentForm, paymentMethod: e.target.value })}
                  >
                    <MenuItem value="ach">ACH Bank Transfer</MenuItem>
                    <MenuItem value="check">Physical Check</MenuItem>
                    <MenuItem value="virtual_card">Virtual Card</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Description / Memo"
                  multiline
                  rows={2}
                  value={chwPaymentForm.description}
                  onChange={(e) => setChwPaymentForm({ ...chwPaymentForm, description: e.target.value })}
                  placeholder="e.g., Payment for home visits - November 2025"
                />
              </Grid>
              
              {selectedChw && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Payment Recipient Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body2">{selectedChw.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2">{selectedChw.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Bank Account</Typography>
                        <Typography variant="body2">****{selectedChw.bankAccountLast4}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                  onClick={handlePayCHW}
                  disabled={loading || connectionStatus !== 'connected' || !selectedChw || !selectedCollaboration}
                >
                  {loading ? 'Processing Payment...' : 'Process CHW Payment'}
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
        
        {/* Test Transactions Tab */}
        <TabPanel value={activeTab} index={3}>
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
        <TabPanel value={activeTab} index={4}>
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
