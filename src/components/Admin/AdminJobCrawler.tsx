'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  CloudDownload as CrawlIcon
} from '@mui/icons-material';
import { JobCrawlerConfig } from '@/types/chw-jobs.types';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NC_COUNTIES = [
  'Alamance', 'Alexander', 'Alleghany', 'Anson', 'Ashe', 'Avery', 'Beaufort', 'Bertie',
  'Bladen', 'Brunswick', 'Buncombe', 'Burke', 'Cabarrus', 'Caldwell', 'Camden', 'Carteret',
  // ... (add all NC counties)
];

export default function AdminJobCrawler() {
  const [configs, setConfigs] = useState<JobCrawlerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<JobCrawlerConfig | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    enabled: boolean;
    url: string;
    crawlFrequency: 'daily' | 'weekly' | 'monthly';
    selectors?: {
      jobTitle?: string;
      organization?: string;
      location?: string;
      description?: string;
      requirements?: string;
      salary?: string;
      applicationUrl?: string;
    };
    filters?: {
      keywords?: string[];
      excludeKeywords?: string[];
      states?: string[];
      counties?: string[];
    };
  }>({
    name: '',
    enabled: true,
    url: '',
    crawlFrequency: 'weekly',
    selectors: {
      jobTitle: '',
      organization: '',
      location: '',
      description: '',
      requirements: '',
      salary: '',
      applicationUrl: ''
    },
    filters: {
      keywords: [],
      excludeKeywords: [],
      states: ['NC'],
      counties: []
    }
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const configsRef = collection(db, 'jobCrawlerConfigs');
      const snapshot = await getDocs(configsRef);
      const configsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobCrawlerConfig[];
      setConfigs(configsData);
    } catch (error) {
      console.error('Error loading crawler configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const configData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingConfig) {
        const configRef = doc(db, 'jobCrawlerConfigs', editingConfig.id);
        await updateDoc(configRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'jobCrawlerConfigs'), configData);
      }

      setOpenDialog(false);
      resetForm();
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this crawler configuration?')) return;

    try {
      await deleteDoc(doc(db, 'jobCrawlerConfigs', configId));
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Failed to delete configuration');
    }
  };

  const handleRunCrawler = async (config: JobCrawlerConfig) => {
    setCrawling(true);
    try {
      const response = await fetch('/api/admin/crawl-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configId: config.id }),
      });

      if (!response.ok) {
        throw new Error('Crawler failed');
      }

      const result = await response.json();
      alert(`Crawler completed! Found ${result.jobsFound} jobs.`);
      loadConfigs();
    } catch (error) {
      console.error('Error running crawler:', error);
      alert('Failed to run crawler');
    } finally {
      setCrawling(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      enabled: true,
      url: '',
      crawlFrequency: 'weekly',
      selectors: {
        jobTitle: '',
        organization: '',
        location: '',
        description: '',
        requirements: '',
        salary: '',
        applicationUrl: ''
      },
      filters: {
        keywords: [],
        excludeKeywords: [],
        states: ['NC'],
        counties: []
      }
    });
    setEditingConfig(null);
  };

  const handleEditConfig = (config: JobCrawlerConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      enabled: config.enabled,
      url: config.url,
      crawlFrequency: config.crawlFrequency,
      selectors: config.selectors || {
        jobTitle: '',
        organization: '',
        location: '',
        description: '',
        requirements: '',
        salary: '',
        applicationUrl: ''
      },
      filters: config.filters || {
        keywords: [],
        excludeKeywords: [],
        states: ['NC'],
        counties: []
      }
    });
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            CHW Job Crawler Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure automated job crawlers to find CHW opportunities across North Carolina
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Add Crawler
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Crawl4AI Integration:</strong> This system uses Crawl4AI to automatically discover and extract CHW job postings from configured websites.
          Jobs are matched with CHW profiles and notifications are sent automatically.
        </Typography>
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Crawl</TableCell>
                <TableCell>Next Crawl</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">No crawler configurations yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {config.url}
                      </Typography>
                    </TableCell>
                    <TableCell>{config.crawlFrequency}</TableCell>
                    <TableCell>
                      <Chip
                        label={config.enabled ? 'Enabled' : 'Disabled'}
                        color={config.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {config.lastCrawlDate
                        ? new Date(config.lastCrawlDate.seconds * 1000).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {config.nextCrawlDate
                        ? new Date(config.nextCrawlDate.seconds * 1000).toLocaleDateString()
                        : 'Not scheduled'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleRunCrawler(config)}
                        disabled={crawling}
                        title="Run crawler now"
                      >
                        <PlayIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditConfig(config)}
                        title="Edit configuration"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteConfig(config.id)}
                        title="Delete configuration"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Configuration Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit Crawler Configuration' : 'Add New Crawler Configuration'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Configuration Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Indeed NC CHW Jobs"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/jobs"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crawl Frequency</InputLabel>
                <Select
                  value={formData.crawlFrequency}
                  onChange={(e) => setFormData({ ...formData, crawlFrequency: e.target.value as any })}
                  label="Crawl Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>CSS Selectors (Advanced)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Job Title Selector"
                        value={formData.selectors.jobTitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          selectors: { ...formData.selectors, jobTitle: e.target.value }
                        })}
                        placeholder=".job-title"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Organization Selector"
                        value={formData.selectors.organization}
                        onChange={(e) => setFormData({
                          ...formData,
                          selectors: { ...formData.selectors, organization: e.target.value }
                        })}
                        placeholder=".company-name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Location Selector"
                        value={formData.selectors.location}
                        onChange={(e) => setFormData({
                          ...formData,
                          selectors: { ...formData.selectors, location: e.target.value }
                        })}
                        placeholder=".job-location"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description Selector"
                        value={formData.selectors.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          selectors: { ...formData.selectors, description: e.target.value }
                        })}
                        placeholder=".job-description"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Filters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Keywords (comma-separated)"
                        placeholder="community health worker, CHW, health advocate"
                        helperText="Jobs must contain at least one of these keywords"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Exclude Keywords (comma-separated)"
                        placeholder="volunteer, unpaid, intern"
                        helperText="Jobs containing these keywords will be excluded"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveConfig}>
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
