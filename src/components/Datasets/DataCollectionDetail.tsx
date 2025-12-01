'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { datasetService } from '@/services/DatasetService';
import { Dataset } from '@/types/dataset.types';
import DataTab from './tabs/DataTab';
import SchemaTab from './tabs/SchemaTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SettingsTab from './tabs/SettingsTab';
import ActivityTab from './tabs/ActivityTab';
import ApiTab from './tabs/ApiTab';

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
      id={`dataset-tabpanel-${index}`}
      aria-labelledby={`dataset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface DataCollectionDetailProps {
  datasetId: string;
}

export default function DataCollectionDetail({ datasetId }: DataCollectionDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset();
  }, [datasetId]);

  const loadDataset = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await datasetService.getDataset(datasetId);
      if (!data) {
        setError('Dataset not found');
      } else {
        setDataset(data);
      }
    } catch (err) {
      console.error('Error loading dataset:', err);
      setError('Failed to load dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBack = () => {
    router.push('/datasets');
  };

  const handleEdit = () => {
    router.push(`/datasets/${datasetId}/edit`);
  };

  const handleDelete = async () => {
    if (!dataset) return;
    
    if (confirm(`Are you sure you want to delete "${dataset.name}"? This action cannot be undone.`)) {
      try {
        await datasetService.deleteDataset(datasetId, 'current-user-id'); // TODO: Get from auth
        router.push('/datasets');
      } catch (err) {
        console.error('Error deleting dataset:', err);
        setError('Failed to delete dataset');
      }
    }
  };

  const handleExport = () => {
    // TODO: Implement export
    console.log('Export dataset:', datasetId);
  };

  const handleImport = () => {
    // TODO: Implement import
    console.log('Import data:', datasetId);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'archived':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Loading dataset...
        </Typography>
      </Container>
    );
  }

  if (error || !dataset) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Dataset not found'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Back to Datasets
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ cursor: 'pointer' }}
        >
          Datasets
        </Link>
        <Typography color="text.primary">{dataset.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">{dataset.name}</Typography>
              <Chip
                label={dataset.status}
                color={getStatusColor(dataset.status) as any}
                size="small"
              />
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {dataset.description || 'No description'}
            </Typography>
            <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2">{dataset.sourceApplication}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Records
                </Typography>
                <Typography variant="body2">
                  {dataset.metadata.recordCount.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fields
                </Typography>
                <Typography variant="body2">{dataset.schema.fields.length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">{formatDate(dataset.createdAt)}</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <IconButton onClick={loadDataset} title="Refresh">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={handleImport}
              size="small"
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              size="small"
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
            >
              Delete
            </Button>
          </Stack>
        </Box>

        {/* Tags */}
        {dataset.metadata.tags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {dataset.metadata.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
            ))}
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Data" />
          <Tab label="Schema" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
          <Tab label="Activity" />
          <Tab label="API" />
        </Tabs>

        <Divider />

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          <DataTab dataset={dataset} onRefresh={loadDataset} />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <SchemaTab dataset={dataset} onRefresh={loadDataset} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <AnalyticsTab dataset={dataset} />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <SettingsTab dataset={dataset} onRefresh={loadDataset} />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <ActivityTab dataset={dataset} />
        </TabPanel>

        <TabPanel value={currentTab} index={5}>
          <ApiTab dataset={dataset} />
        </TabPanel>
      </Paper>
    </Container>
  );
}
