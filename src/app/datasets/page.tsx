'use client';

import React, { useState, useEffect } from 'react';
import { Database, Plus, GitMerge, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import AdminLayout from '@/components/Layout/AdminLayout';
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
        // Get datasets owned by user OR system-generated datasets
        const q = query(datasetsRef);
        const querySnapshot = await getDocs(q);
        
        // Filter to show user's datasets and system datasets
        const userDatasets = querySnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.userId === currentUser.uid || data.userId === 'system';
        });
        
        const fetchedDatasets: Dataset[] = [];
        userDatasets.forEach((docSnap) => {
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
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading Datasets...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!currentUser) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#FF9500]" />
            <p className="text-sm font-medium text-[#FF9500]">Please log in to access datasets</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const tabs = ['All Datasets', 'My Uploads', 'Transformed'];
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Apple-style Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#34C759] rounded-2xl flex items-center justify-center">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Datasets</h1>
              <p className="text-[#6E6E73]">Upload, manage, and analyze your data</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {selectedDatasets.length > 0 && (
              <button
                onClick={handleMergeDatasets}
                className="flex items-center gap-2 px-5 py-3 bg-[#AF52DE] text-white rounded-xl font-medium text-sm hover:bg-[#9B3DC9] transition-colors"
              >
                <GitMerge className="w-4 h-4" />
                Merge Selected ({selectedDatasets.length})
              </button>
            )}
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Dataset
            </button>
          </div>
        </div>

        {/* Selected Datasets for Merge */}
        {selectedDatasets.length > 0 && (
          <div className="p-4 bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-xl">
            <p className="text-sm font-medium text-[#0071E3] mb-2">
              {selectedDatasets.length} dataset(s) selected for merging
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDatasets.map((dataset) => (
                <span
                  key={dataset.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#0071E3]/30 rounded-full text-sm text-[#0071E3]"
                >
                  {dataset.name}
                  <button
                    onClick={() => handleSelectForMerge(dataset)}
                    className="ml-1 hover:text-[#FF3B30]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
              <p className="text-sm font-medium text-[#FF3B30]">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-[#FF3B30] hover:text-[#FF3B30]/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Apple-style Tabs */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-2">
          <div className="flex gap-1">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setTabValue(index)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tabValue === index
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
            <DatasetList
              datasets={datasets}
              onViewDataset={handleViewDataset}
              onDeleteDataset={handleDeleteDataset}
              onExportDataset={handleExportDataset}
              onEditDataset={handleEditDataset}
              onAnalyzeDataset={handleAnalyzeDataset}
              onSelectForMerge={handleSelectForMerge}
            />
          </div>
        )}

        {/* Upload Dialog - Apple Style */}
        {showUploadDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadDialog(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2D2D7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#34C759] rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D1D1F]">Upload Dataset</h2>
                    <p className="text-sm text-[#6E6E73]">Import your data files</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="p-2 rounded-xl hover:bg-[#F5F5F7] text-[#6E6E73] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <DatasetUpload onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          </div>
        )}

        {/* Dataset Detail Dialog - Apple Style */}
        {selectedDataset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDataset(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <DatasetDetail
                dataset={selectedDataset}
                onClose={() => setSelectedDataset(null)}
                onExport={handleExportDataset}
                onAnalyze={handleAnalyzeDataset}
                onSelectForMerge={handleSelectForMerge}
              />
            </div>
          </div>
        )}

        {/* Notification Toast - Apple Style */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              notification.severity === 'success' ? 'bg-[#34C759] text-white' :
              notification.severity === 'error' ? 'bg-[#FF3B30] text-white' :
              'bg-[#0071E3] text-white'
            }`}>
              {notification.severity === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.severity === 'error' && <AlertCircle className="w-5 h-5" />}
              {notification.severity === 'info' && <Info className="w-5 h-5" />}
              <p className="text-sm font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
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
