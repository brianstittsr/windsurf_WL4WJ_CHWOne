'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Storage as StorageIcon,
  Description as RecordIcon,
  TrendingUp as TrendingIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { datasetService } from '@/services/DatasetService';
import { Dataset, DatasetStatistics } from '@/types/dataset.types';
import DatasetList from './DatasetList';
import CreateDatasetDialog from './CreateDatasetDialog';

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

export default function DatasetsDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<DatasetStatistics | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Filter datasets based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDatasets(datasets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = datasets.filter(ds =>
        ds.name.toLowerCase().includes(query) ||
        ds.description.toLowerCase().includes(query) ||
        ds.sourceApplication.toLowerCase().includes(query) ||
        ds.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
      setFilteredDatasets(filtered);
    }
  }, [searchQuery, datasets]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Load statistics
      const stats = await datasetService.getStatistics(currentUser.organizationId);
      setStatistics(stats);

      // Load datasets
      const allDatasets = await datasetService.listDatasets({
        organizationId: currentUser.organizationId,
        status: 'active'
      });
      setDatasets(allDatasets);
      setFilteredDatasets(allDatasets);
    } catch (err) {
      console.error('Error loading datasets:', err);
      setError('Failed to load datasets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateDataset = () => {
    setCreateDialogOpen(true);
  };

  const handleDatasetCreated = () => {
    setCreateDialogOpen(false);
    loadData(); // Reload data
  };

  const handleRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Loading datasets...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Datasets Admin
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your data collections and records
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDataset}
          >
            New Dataset
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{statistics.totalDatasets}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Datasets
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${statistics.activeDatasets} active`}
                  size="small"
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RecordIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {statistics.totalRecords.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Records
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Across all datasets
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{statistics.recentActivity.last24h}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 24 Hours
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  New submissions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UploadIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {(statistics.totalSize / 1024 / 1024).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      MB Storage
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Total data size
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Top Datasets */}
      {statistics && statistics.topDatasets.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 Top Datasets by Record Count
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {statistics.topDatasets.map((ds, index) => (
                <Grid item xs={12} sm={6} md={4} key={ds.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" noWrap>
                        #{index + 1} {ds.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ds.recordCount.toLocaleString()} records
                      </Typography>
                    </Box>
                    <Chip
                      label={`${((ds.recordCount / statistics.totalRecords) * 100).toFixed(1)}%`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Search and Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 400 }}
              size="small"
            />
            <Box>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>

          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label={`All Datasets (${filteredDatasets.length})`} />
            <Tab label="Recent" />
            <Tab label="Favorites" />
            <Tab label="Archived" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Dataset List */}
      <TabPanel value={currentTab} index={0}>
        <DatasetList
          datasets={filteredDatasets}
          onRefresh={loadData}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <DatasetList
          datasets={filteredDatasets.slice(0, 10)}
          onRefresh={loadData}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Alert severity="info">
          Favorites feature coming soon!
        </Alert>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Alert severity="info">
          No archived datasets
        </Alert>
      </TabPanel>

      {/* Create Dataset Dialog */}
      <CreateDatasetDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleDatasetCreated}
      />
    </Container>
  );
}
