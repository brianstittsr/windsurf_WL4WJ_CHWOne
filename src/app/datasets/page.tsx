'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Button, 
  Dialog, 
  DialogContent,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Add as AddIcon, Merge as MergeIcon } from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import DatasetUpload from '@/components/Datasets/DatasetUpload';
import DatasetList from '@/components/Datasets/DatasetList';
import DatasetDetail from '@/components/Datasets/DatasetDetail';
import { Dataset, TransformedDataset } from '@/types/bmad.types';
import { dataProcessingService } from '@/services/bmad/DataProcessingService';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

// Mock datasets for development (kept for reference)
const mockDatasets_UNUSED: Dataset[] = [
  {
    id: 'dataset-1',
    name: 'CHW Performance Metrics',
    description: 'Monthly performance data for community health workers',
    format: 'csv',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 86400000 * 7),
    columns: [
      { name: 'chw_id', type: 'string', nullable: false },
      { name: 'month', type: 'date', nullable: false },
      { name: 'clients_served', type: 'number', nullable: false, min: 0, max: 120, mean: 45.2, median: 42 },
      { name: 'hours_worked', type: 'number', nullable: false, min: 20, max: 200, mean: 160.5, median: 165 },
      { name: 'satisfaction_score', type: 'number', nullable: true, min: 1, max: 5, mean: 4.2, median: 4.5, missingCount: 12 }
    ],
    rowCount: 250,
    userId: 'user-1',
    previewData: [
      { chw_id: 'CHW001', month: '2025-01-01', clients_served: 45, hours_worked: 160, satisfaction_score: 4.5 },
      { chw_id: 'CHW002', month: '2025-01-01', clients_served: 38, hours_worked: 152, satisfaction_score: 4.2 },
      { chw_id: 'CHW003', month: '2025-01-01', clients_served: 52, hours_worked: 168, satisfaction_score: 4.8 }
    ]
  },
  {
    id: 'dataset-2',
    name: 'Client Health Outcomes',
    description: 'Health outcome metrics for clients served by CHWs',
    format: 'excel',
    size: 1024 * 1024 * 4.2, // 4.2 MB
    createdAt: new Date(Date.now() - 86400000 * 14), // 14 days ago
    updatedAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    columns: [
      { name: 'client_id', type: 'string', nullable: false },
      { name: 'chw_id', type: 'string', nullable: false },
      { name: 'assessment_date', type: 'date', nullable: false },
      { name: 'blood_pressure_systolic', type: 'number', nullable: true, min: 90, max: 180, mean: 125.7, median: 122, missingCount: 25 },
      { name: 'blood_pressure_diastolic', type: 'number', nullable: true, min: 60, max: 110, mean: 82.3, median: 80, missingCount: 25 },
      { name: 'weight_kg', type: 'number', nullable: true, min: 45, max: 120, mean: 72.5, median: 70.2, missingCount: 18 },
      { name: 'medication_adherence', type: 'number', nullable: true, min: 0, max: 100, mean: 78.5, median: 85, missingCount: 30 }
    ],
    rowCount: 1250,
    userId: 'user-1',
    previewData: [
      { client_id: 'CL001', chw_id: 'CHW001', assessment_date: '2025-01-15', blood_pressure_systolic: 120, blood_pressure_diastolic: 80, weight_kg: 68.5, medication_adherence: 90 },
      { client_id: 'CL002', chw_id: 'CHW001', assessment_date: '2025-01-15', blood_pressure_systolic: 135, blood_pressure_diastolic: 85, weight_kg: 72.0, medication_adherence: 75 },
      { client_id: 'CL003', chw_id: 'CHW002', assessment_date: '2025-01-16', blood_pressure_systolic: 118, blood_pressure_diastolic: 78, weight_kg: 65.5, medication_adherence: 95 }
    ]
  },
  {
    id: 'dataset-3',
    name: 'Community Survey Results',
    description: 'Results from community health needs assessment survey',
    format: 'json',
    size: 1024 * 1024 * 1.8, // 1.8 MB
    createdAt: new Date(Date.now() - 86400000 * 21), // 21 days ago
    updatedAt: new Date(Date.now() - 86400000 * 21),
    columns: [
      { name: 'response_id', type: 'string', nullable: false },
      { name: 'zip_code', type: 'string', nullable: false },
      { name: 'age_group', type: 'string', nullable: false },
      { name: 'gender', type: 'string', nullable: true, missingCount: 45 },
      { name: 'healthcare_access_score', type: 'number', nullable: false, min: 1, max: 10, mean: 6.2, median: 6 },
      { name: 'mental_health_resources_score', type: 'number', nullable: false, min: 1, max: 10, mean: 5.1, median: 5 },
      { name: 'community_safety_score', type: 'number', nullable: false, min: 1, max: 10, mean: 7.3, median: 8 },
      { name: 'food_security_score', type: 'number', nullable: false, min: 1, max: 10, mean: 6.8, median: 7 }
    ],
    rowCount: 850,
    userId: 'user-1',
    previewData: [
      { response_id: 'R001', zip_code: '28202', age_group: '35-44', gender: 'Female', healthcare_access_score: 7, mental_health_resources_score: 5, community_safety_score: 8, food_security_score: 6 },
      { response_id: 'R002', zip_code: '28205', age_group: '25-34', gender: 'Male', healthcare_access_score: 5, mental_health_resources_score: 4, community_safety_score: 6, food_security_score: 7 },
      { response_id: 'R003', zip_code: '28208', age_group: '45-54', gender: 'Female', healthcare_access_score: 4, mental_health_resources_score: 3, community_safety_score: 5, food_security_score: 4 }
    ]
  }
];

// Inner component that uses the auth context
function DatasetsContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
  // Load datasets
  useEffect(() => {
    const loadDatasets = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const datasetsRef = collection(db, 'datasets');
        const q = query(datasetsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedDatasets: Dataset[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedDatasets.push({
            id: docSnap.id,
            name: data.name || 'Untitled Dataset',
            description: data.description || '',
            format: data.format || 'json',
            size: data.size || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            columns: data.fields || data.columns || [],
            rowCount: data.recordCount || data.rowCount || 0,
            userId: data.userId || currentUser.uid,
            previewData: data.previewData || [],
            metadata: data.metadata || {},
            formId: data.formId // Link to the form that created this dataset
          } as Dataset);
        });
        
        setDatasets(fetchedDatasets);
        console.log('Fetched datasets:', fetchedDatasets.length);
      } catch (err) {
        console.error('Error loading datasets:', err);
        setError(`Failed to load datasets: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadDatasets();
  }, [currentUser]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleUploadComplete = (dataset: Dataset) => {
    setDatasets(prev => [dataset, ...prev]);
    setShowUploadDialog(false);
    setNotification({
      message: `Dataset "${dataset.name}" uploaded successfully`,
      severity: 'success'
    });
  };
  
  const handleViewDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
  };
  
  const handleDeleteDataset = async (dataset: Dataset) => {
    if (!confirm(`Are you sure you want to delete dataset "${dataset.name}"?`)) {
      return;
    }

    try {
      const datasetRef = doc(db, 'datasets', dataset.id);
      await deleteDoc(datasetRef);
      
      setDatasets(prev => prev.filter(d => d.id !== dataset.id));
      setNotification({
        message: `Dataset "${dataset.name}" deleted successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting dataset:', err);
      setNotification({
        message: `Failed to delete dataset: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  const handleExportDataset = (dataset: Dataset) => {
    // In a real implementation, we would generate a download link
    setNotification({
      message: `Dataset "${dataset.name}" export started`,
      severity: 'info'
    });
  };
  
  const handleEditDataset = (dataset: Dataset) => {
    // In a real implementation, we would show an edit dialog
    setNotification({
      message: `Dataset editing not implemented yet`,
      severity: 'info'
    });
  };
  
  const handleAnalyzeDataset = (dataset: Dataset) => {
    // In a real implementation, we would navigate to analysis page
    setNotification({
      message: `Dataset analysis not implemented yet`,
      severity: 'info'
    });
  };
  
  const handleSelectForMerge = (dataset: Dataset) => {
    if (selectedDatasets.some(d => d.id === dataset.id)) {
      setSelectedDatasets(prev => prev.filter(d => d.id !== dataset.id));
    } else {
      setSelectedDatasets(prev => [...prev, dataset]);
    }
  };
  
  const handleMergeDatasets = async () => {
    if (selectedDatasets.length < 2) {
      setNotification({
        message: 'Please select at least two datasets to merge',
        severity: 'error'
      });
      return;
    }
    
    try {
      // In a real implementation, we would show a merge configuration dialog
      // For now, we'll create a mock merged dataset
      const mergedDataset: TransformedDataset = {
        id: uuidv4(),
        name: `Merged Dataset (${selectedDatasets.map(d => d.name).join(', ')})`,
        description: `Merged from ${selectedDatasets.length} datasets`,
        format: 'json',
        size: selectedDatasets.reduce((sum, d) => sum + d.size, 0),
        createdAt: new Date(),
        updatedAt: new Date(),
        columns: selectedDatasets.flatMap(d => 
          d.columns.map(c => ({
            ...c,
            name: `${d.name}.${c.name}` // Prefix with dataset name to avoid conflicts
          }))
        ),
        rowCount: Math.max(...selectedDatasets.map(d => d.rowCount)), // Estimate
        userId: currentUser?.uid || 'unknown',
        transformations: [{
          id: uuidv4(),
          type: 'join',
          params: {
            datasets: selectedDatasets.map(d => d.id)
          },
          description: `Merged ${selectedDatasets.length} datasets`,
          createdAt: new Date()
        }],
        sourceDatasetIds: selectedDatasets.map(d => d.id)
      };
      
      setDatasets(prev => [mergedDataset, ...prev]);
      setSelectedDatasets([]);
      setNotification({
        message: `Datasets merged successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error merging datasets:', err);
      setNotification({
        message: `Failed to merge datasets: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  if (authLoading) {
    return <AnimatedLoading message="Loading Datasets..." />;
  }
  
  if (!currentUser) {
    return (
      <UnifiedLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="warning">
            Please log in to access datasets
          </Alert>
        </Box>
      </UnifiedLayout>
    );
  }
  
  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Datasets
        </Typography>
        
        <Box>
          {selectedDatasets.length > 0 ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<MergeIcon />}
              onClick={handleMergeDatasets}
              sx={{ mr: 1 }}
            >
              Merge Selected ({selectedDatasets.length})
            </Button>
          ) : null}
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowUploadDialog(true)}
          >
            Upload Dataset
          </Button>
        </Box>
      </Box>
      
      {selectedDatasets.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle1">
            {selectedDatasets.length} dataset(s) selected for merging
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {selectedDatasets.map((dataset, index) => (
              <Chip 
                key={dataset.id} 
                label={dataset.name} 
                onDelete={() => handleSelectForMerge(dataset)} 
                color="primary"
                variant="outlined"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              />
            ))}
          </Box>
        </Paper>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dataset tabs">
          <Tab label="All Datasets" id="datasets-tab-0" aria-controls="datasets-tabpanel-0" />
          <Tab label="My Uploads" id="datasets-tab-1" aria-controls="datasets-tabpanel-1" />
          <Tab label="Transformed" id="datasets-tab-2" aria-controls="datasets-tabpanel-2" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box role="tabpanel" hidden={tabValue !== 0} id="datasets-tabpanel-0" aria-labelledby="datasets-tab-0">
          <DatasetList
            datasets={datasets}
            onViewDataset={handleViewDataset}
            onDeleteDataset={handleDeleteDataset}
            onExportDataset={handleExportDataset}
            onEditDataset={handleEditDataset}
            onAnalyzeDataset={handleAnalyzeDataset}
            onSelectForMerge={handleSelectForMerge}
          />
        </Box>
      )}
      
      {/* Upload Dialog */}
      <Dialog 
        open={showUploadDialog} 
        onClose={() => setShowUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <DatasetUpload onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>
      
      {/* Dataset Detail Dialog */}
      <Dialog 
        open={!!selectedDataset} 
        onClose={() => setSelectedDataset(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedDataset ? (
            <DatasetDetail
              dataset={selectedDataset}
              onClose={() => setSelectedDataset(null)}
              onExport={handleExportDataset}
              onAnalyze={handleAnalyzeDataset}
              onSelectForMerge={handleSelectForMerge}
            />
          ) : <></>}
        </DialogContent>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification ? (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : <></>}
      </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function DatasetsPage() {
  return (
    <AuthProvider>
      <DatasetsContent />
    </AuthProvider>
  );
}
