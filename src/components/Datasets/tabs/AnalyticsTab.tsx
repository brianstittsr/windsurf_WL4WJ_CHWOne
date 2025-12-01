'use client';

import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Dataset } from '@/types/dataset.types';

interface AnalyticsTabProps {
  dataset: Dataset;
}

export default function AnalyticsTab({ dataset }: AnalyticsTabProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Calculate field statistics
  const fieldStats = dataset.schema.fields.map(field => ({
    name: field.label,
    type: field.type,
    required: field.required,
    searchable: field.isSearchable || false
  }));

  const requiredFieldsCount = dataset.schema.fields.filter(f => f.required).length;
  const searchableFieldsCount = dataset.schema.fields.filter(f => f.isSearchable).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {dataset.metadata.recordCount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{dataset.schema.fields.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Fields
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {dataset.metadata.size ? (dataset.metadata.size / 1024 / 1024).toFixed(2) : '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MB Storage
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {dataset.permissions.owners.length + dataset.permissions.editors.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contributors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dataset Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dataset Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1">{formatDate(dataset.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">{formatDate(dataset.updatedAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Record Added
                </Typography>
                <Typography variant="body1">
                  {formatDate(dataset.metadata.lastRecordAt) || 'No records yet'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Source Application
                </Typography>
                <Typography variant="body1">{dataset.sourceApplication}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {dataset.metadata.category.charAt(0).toUpperCase() + dataset.metadata.category.slice(1)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={dataset.status}
                  size="small"
                  color={dataset.status === 'active' ? 'success' : 'default'}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Schema Statistics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Schema Statistics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Required Fields
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(requiredFieldsCount / dataset.schema.fields.length) * 100}
                  sx={{ flex: 1, height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2">
                  {requiredFieldsCount} / {dataset.schema.fields.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Searchable Fields
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(searchableFieldsCount / dataset.schema.fields.length) * 100}
                  sx={{ flex: 1, height: 8, borderRadius: 1 }}
                  color="secondary"
                />
                <Typography variant="body2">
                  {searchableFieldsCount} / {dataset.schema.fields.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Schema Version
              </Typography>
              <Typography variant="h6">{dataset.schema.version}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Field Types Distribution */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Field Types Distribution
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Object.entries(
            dataset.schema.fields.reduce((acc, field) => {
              acc[field.type] = (acc[field.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <Grid item xs={6} sm={4} md={3} key={type}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" color="primary">
                  {count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {type}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Placeholder for future charts */}
      <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          📊 Advanced analytics charts coming soon!
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Record trends, activity timeline, and field statistics
        </Typography>
      </Paper>
    </Box>
  );
}
