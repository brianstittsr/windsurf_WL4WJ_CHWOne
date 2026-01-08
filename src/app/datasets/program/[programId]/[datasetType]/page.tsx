'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import {
  createInstructorRecord,
  getInstructorRecords,
  updateInstructorRecord,
  deleteInstructorRecord,
  createStudentRecord,
  getStudentRecords,
  updateStudentRecord,
  deleteStudentRecord,
  createNonprofitRecord,
  getNonprofitRecords,
  updateNonprofitRecord,
  deleteNonprofitRecord,
  getProgramMetrics,
  type InstructorRecord,
  type StudentRecord,
  type NonprofitRecord,
  type ProgramMetrics,
} from '@/services/programDatasetService';
import {
  DEFAULT_INSTRUCTOR_FIELDS,
  DEFAULT_STUDENT_FIELDS,
  DEFAULT_NONPROFIT_FIELDS,
  type DatasetField,
} from '@/types/program-form.types';

function ProgramDatasetContent() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  
  const programId = params.programId as string;
  const datasetType = params.datasetType as 'instructor' | 'student' | 'nonprofit';
  
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ProgramMetrics | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the appropriate fields based on dataset type
  const getFields = (): DatasetField[] => {
    switch (datasetType) {
      case 'instructor': return DEFAULT_INSTRUCTOR_FIELDS;
      case 'student': return DEFAULT_STUDENT_FIELDS;
      case 'nonprofit': return DEFAULT_NONPROFIT_FIELDS;
      default: return [];
    }
  };
  
  const fields = getFields();
  
  // Get dataset info
  const getDatasetInfo = () => {
    switch (datasetType) {
      case 'instructor':
        return { title: 'Instructor Dataset', icon: <PersonIcon />, color: 'primary' };
      case 'student':
        return { title: 'Student/Participant Dataset', icon: <SchoolIcon />, color: 'success' };
      case 'nonprofit':
        return { title: 'Nonprofit Reporting Dataset', icon: <BusinessIcon />, color: 'warning' };
      default:
        return { title: 'Dataset', icon: <ChartIcon />, color: 'default' };
    }
  };
  
  const datasetInfo = getDatasetInfo();
  
  useEffect(() => {
    if (programId && datasetType) {
      fetchRecords();
      fetchMetrics();
    }
  }, [programId, datasetType]);
  
  const fetchRecords = async () => {
    setLoading(true);
    try {
      let result;
      switch (datasetType) {
        case 'instructor':
          result = await getInstructorRecords(programId);
          break;
        case 'student':
          result = await getStudentRecords(programId);
          break;
        case 'nonprofit':
          result = await getNonprofitRecords(programId);
          break;
      }
      
      if (result?.success && result.records) {
        setRecords(result.records);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMetrics = async () => {
    const result = await getProgramMetrics(programId);
    if (result.success && result.metrics) {
      setMetrics(result.metrics);
    }
  };
  
  const handleAddRecord = () => {
    setFormData({});
    setSelectedRecord(null);
    setShowAddDialog(true);
  };
  
  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    setFormData(record.data || {});
    setShowEditDialog(true);
  };
  
  const handleDeleteRecord = async (record: any) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      let result;
      switch (datasetType) {
        case 'instructor':
          result = await deleteInstructorRecord(record.id);
          break;
        case 'student':
          result = await deleteStudentRecord(record.id);
          break;
        case 'nonprofit':
          result = await deleteNonprofitRecord(record.id);
          break;
      }
      
      if (result?.success) {
        fetchRecords();
        fetchMetrics();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleSaveRecord = async () => {
    setSaving(true);
    try {
      let result;
      
      if (selectedRecord) {
        // Update existing record
        switch (datasetType) {
          case 'instructor':
            result = await updateInstructorRecord(selectedRecord.id, formData);
            break;
          case 'student':
            result = await updateStudentRecord(selectedRecord.id, formData);
            break;
          case 'nonprofit':
            result = await updateNonprofitRecord(selectedRecord.id, formData);
            break;
        }
      } else {
        // Create new record
        const grantId = ''; // TODO: Get from program context
        const createdBy = currentUser?.email || '';
        
        switch (datasetType) {
          case 'instructor':
            result = await createInstructorRecord(programId, grantId, formData, createdBy);
            break;
          case 'student':
            result = await createStudentRecord(programId, grantId, formData, createdBy);
            break;
          case 'nonprofit':
            result = await createNonprofitRecord(programId, grantId, formData, createdBy, formData.reporting_period || 'Q1');
            break;
        }
      }
      
      if (result?.success) {
        setShowAddDialog(false);
        setShowEditDialog(false);
        fetchRecords();
        fetchMetrics();
      } else {
        setError(result?.error || 'Failed to save record');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handleExportCSV = () => {
    if (records.length === 0) return;
    
    const headers = fields.map(f => f.label).join(',');
    const rows = records.map(record => 
      fields.map(f => {
        const value = record.data?.[f.name] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetType}-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const renderFieldInput = (field: DatasetField) => {
    const value = formData[field.name] || '';
    
    if (field.type === 'select' && field.options) {
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={value}
            label={field.label}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
          >
            {field.options.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    
    return (
      <TextField
        fullWidth
        size="small"
        label={field.label}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
        required={field.required}
        multiline={field.type === 'textarea'}
        rows={field.type === 'textarea' ? 3 : 1}
        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
      />
    );
  };
  
  if (authLoading || loading) {
    return <AnimatedLoading message="Loading Dataset..." />;
  }
  
  if (!currentUser) {
    router.push('/login');
    return null;
  }
  
  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: `${datasetInfo.color}.main` }}>
            {datasetInfo.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {datasetInfo.title}
            </Typography>
            <Typography color="text.secondary">
              Program ID: {programId}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { fetchRecords(); fetchMetrics(); }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={records.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRecord}
          >
            Add Record
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Metrics Cards */}
        {metrics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{metrics.totalInstructors}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Instructors</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{metrics.totalStudents}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">{metrics.completionRate.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">{metrics.avgSatisfactionScore.toFixed(1)}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Satisfaction</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Data Table */}
        <Card>
          <CardHeader 
            title={`${records.length} Records`}
            subheader={`Last updated: ${new Date().toLocaleString()}`}
          />
          <CardContent>
            {records.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {fields.slice(0, 6).map(field => (
                        <TableCell key={field.id} sx={{ fontWeight: 600 }}>
                          {field.label}
                        </TableCell>
                      ))}
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id} hover>
                        {fields.slice(0, 6).map(field => (
                          <TableCell key={field.id}>
                            {record.data?.[field.name] || '-'}
                          </TableCell>
                        ))}
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditRecord(record)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteRecord(record)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No records yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first {datasetType} record to start tracking data.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRecord}>
                  Add First Record
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Add/Edit Dialog */}
        <Dialog 
          open={showAddDialog || showEditDialog} 
          onClose={() => { setShowAddDialog(false); setShowEditDialog(false); }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedRecord ? 'Edit Record' : 'Add New Record'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {fields.map(field => (
                <Grid item xs={12} md={6} key={field.id}>
                  {renderFieldInput(field)}
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowAddDialog(false); setShowEditDialog(false); }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveRecord}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </UnifiedLayout>
  );
}

export default function ProgramDatasetPage() {
  return (
    <AuthProvider>
      <ProgramDatasetContent />
    </AuthProvider>
  );
}
