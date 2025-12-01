'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  Avatar,
  Stack
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  Analytics as AnalyticsIcon,
  Storage as StorageIcon,
  Description as RecordIcon,
  CalendarToday as DateIcon
} from '@mui/icons-material';
import { Dataset } from '@/types/dataset.types';
import { useRouter } from 'next/navigation';

interface DataCollectionListProps {
  datasets: Dataset[];
  onRefresh?: () => void;
}

export default function DataCollectionList({ datasets, onRefresh }: DataCollectionListProps) {
  const router = useRouter();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, dataset: Dataset) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedDataset(dataset);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedDataset(null);
  };

  const handleView = () => {
    if (selectedDataset) {
      router.push(`/datasets/${selectedDataset.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedDataset) {
      router.push(`/datasets/${selectedDataset.id}/edit`);
    }
    handleMenuClose();
  };

  const handleExport = () => {
    if (selectedDataset) {
      // TODO: Implement export
      console.log('Export dataset:', selectedDataset.id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDataset) {
      if (confirm(`Are you sure you want to delete "${selectedDataset.name}"?`)) {
        // TODO: Implement delete
        console.log('Delete dataset:', selectedDataset.id);
        onRefresh?.();
      }
    }
    handleMenuClose();
  };

  const handleCardClick = (dataset: Dataset) => {
    router.push(`/datasets/${dataset.id}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
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

  if (datasets.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
          border: 2,
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <StorageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No datasets found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first dataset to get started
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {datasets.map((dataset) => (
          <Grid item xs={12} sm={6} md={4} key={dataset.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => handleCardClick(dataset)}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <StorageIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" noWrap>
                        {dataset.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {dataset.sourceApplication}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, dataset)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    height: 40,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {dataset.description || 'No description'}
                </Typography>

                {/* Statistics */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Tooltip title="Total Records">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RecordIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {dataset.metadata.recordCount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Fields">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AnalyticsIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {dataset.schema.fields.length}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Stack>

                {/* Tags */}
                <Box sx={{ mb: 2, minHeight: 32 }}>
                  {dataset.metadata.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                  {dataset.metadata.tags.length > 3 && (
                    <Chip
                      label={`+${dataset.metadata.tags.length - 3}`}
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                  )}
                </Box>

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DateIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(dataset.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={dataset.status}
                    size="small"
                    color={getStatusColor(dataset.status) as any}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Dataset</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
