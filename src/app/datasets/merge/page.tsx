'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Breadcrumbs, 
  Link as MuiLink,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Dataset as DatasetIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DatasetMergeAssistant } from '@/components/AI';
import { dataProcessingService } from '@/services/bmad/DataProcessingService';
import { Dataset } from '@/types/bmad.types';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';

// Inner component that uses the auth context
function DatasetMergeContent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    fetchDatasets();
  }, [currentUser, router]);

  const fetchDatasets = async () => {
    try {
      const userDatasets = await dataProcessingService.getUserDatasets(currentUser?.uid || '');
      setDatasets(userDatasets);
    } catch (err) {
      setError(`Failed to load datasets: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMergeComplete = (newDataset: Dataset) => {
    setSuccess(`Successfully created merged dataset: ${newDataset.name}`);
    
    // Add the new dataset to the list
    setDatasets([newDataset, ...datasets]);
    
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href="/datasets" underline="hover" color="inherit">
            Datasets
          </MuiLink>
          <Typography color="text.primary">Merge</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DatasetIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Typography variant="h4">Merge Datasets</Typography>
        </Box>
        
        <Button 
          component={Link} 
          href="/datasets" 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Datasets
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      {datasets.length < 2 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          You need at least two datasets to use the merge assistant. Please upload more datasets.
        </Alert>
      ) : (
        <DatasetMergeAssistant 
          datasets={datasets} 
          onMergeComplete={handleMergeComplete} 
        />
      )}
    </Container>
  );
}

// Export the wrapped component with AuthProvider
export default function DatasetMergePage() {
  return (
    <AuthProvider>
      <DatasetMergeContent />
    </AuthProvider>
  );
}
