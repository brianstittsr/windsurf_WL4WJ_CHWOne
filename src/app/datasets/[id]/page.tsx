'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Code as JsonIcon,
  TableChart as TableIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface DatasetRecord {
  submission_id: string;
  submitted_at: string;
  submitted_by: string;
  form_id: string;
  [key: string]: any;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  formId?: string;
  fields: any[];
  records: DatasetRecord[];
  metadata?: any;
  status: string;
  createdAt: any;
  updatedAt: any;
}

function DatasetViewContent() {
  const params = useParams();
  const datasetId = params.id as string;
  const router = useRouter();
  const { currentUser } = useAuth();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DatasetRecord | null>(null);

  useEffect(() => {
    loadDataset();
  }, [datasetId]);

  const loadDataset = async () => {
    try {
      setLoading(true);
      console.log('Loading dataset with ID:', datasetId);
      const datasetDocRef = doc(db, 'datasets', datasetId);
      const datasetDoc = await getDoc(datasetDocRef);

      if (datasetDoc.exists()) {
        const data = datasetDoc.data();
        console.log('Dataset found:', data);
        setDataset({
          id: datasetDoc.id,
          ...data
        } as Dataset);
      } else {
        console.error('Dataset not found with ID:', datasetId);
        console.log('This usually means:');
        console.log('1. No form submissions have been made yet');
        console.log('2. The dataset was deleted');
        console.log('3. The datasetId on the form is incorrect');
      }
    } catch (error) {
      console.error('Error loading dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!dataset) return;

    const dataStr = JSON.stringify(dataset.records, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!dataset || !dataset.records.length) return;

    // Get all unique keys from all records
    const allKeys = new Set<string>();
    dataset.records.forEach(record => {
      Object.keys(record).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const csvRows = [
      headers.join(','), // Header row
      ...dataset.records.map(record =>
        headers.map(header => {
          const value = record[header];
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewJSON = (record: DatasetRecord) => {
    setSelectedRecord(record);
    setJsonDialogOpen(true);
  };

  const handleCopyJSON = () => {
    if (selectedRecord) {
      navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
    }
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || '');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dataset) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Dataset Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          This dataset doesn't exist yet. It will be created automatically when someone submits the form for the first time.
        </Typography>
        <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            <strong>Possible reasons:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            • No form submissions have been received yet<br />
            • The dataset was deleted<br />
            • The form's dataset link is incorrect
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => router.push('/datasets')}
          >
            Back to Datasets
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/forms')}
          >
            View Forms
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/datasets')}
          sx={{ mb: 2 }}
        >
          Back to Datasets
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {dataset.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {dataset.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${dataset.records?.length || 0} Records`}
                color="primary"
                size="small"
              />
              <Chip
                label={dataset.status}
                color={dataset.status === 'active' ? 'success' : 'default'}
                size="small"
              />
              {dataset.formId && (
                <Chip
                  label="Form Responses"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={loadDataset} title="Refresh">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCSV}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadJSON}
            >
              JSON
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<TableIcon />} label="Table View" />
          <Tab icon={<JsonIcon />} label="JSON View" />
        </Tabs>
      </Box>

      {/* Content */}
      {dataset.records?.length === 0 ? (
        <Alert severity="info">
          No responses yet. Share your form to start collecting data!
        </Alert>
      ) : (
        <>
          {/* Table View */}
          {tabValue === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Submission ID</strong></TableCell>
                    <TableCell><strong>Submitted At</strong></TableCell>
                    <TableCell><strong>Submitted By</strong></TableCell>
                    {dataset.fields?.map(field => (
                      <TableCell key={field.id}>
                        <strong>{field.label}</strong>
                      </TableCell>
                    ))}
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataset.records?.map((record, index) => (
                    <TableRow key={record.submission_id || index}>
                      <TableCell>{record.submission_id}</TableCell>
                      <TableCell>
                        {new Date(record.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{record.submitted_by}</TableCell>
                      {dataset.fields?.map(field => (
                        <TableCell key={field.id}>
                          {formatValue(record[field.name])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewJSON(record)}
                          title="View JSON"
                        >
                          <JsonIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* JSON View */}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">All Records (JSON)</Typography>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(dataset.records, null, 2))}
                  >
                    Copy All
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={JSON.stringify(dataset.records, null, 2)}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                  }}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* JSON Dialog */}
      <Dialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Record Details (JSON)
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={selectedRecord ? JSON.stringify(selectedRecord, null, 2) : ''}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyJSON} startIcon={<CopyIcon />}>
            Copy
          </Button>
          <Button onClick={() => setJsonDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function DatasetViewPage() {
  return (
    <AuthProvider>
      <AdminLayout>
        <DatasetViewContent />
      </AdminLayout>
    </AuthProvider>
  );
}
