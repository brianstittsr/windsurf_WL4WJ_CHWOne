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
  Badge
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Merge as MergeIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Dataset } from '@/types/bmad.types';

interface DatasetListProps {
  datasets: Dataset[];
  onViewDataset: (dataset: Dataset) => void;
  onDeleteDataset: (dataset: Dataset) => void;
  onExportDataset: (dataset: Dataset) => void;
  onEditDataset: (dataset: Dataset) => void;
  onAnalyzeDataset: (dataset: Dataset) => void;
  onSelectForMerge: (dataset: Dataset) => void;
}

export default function DatasetList({
  datasets,
  onViewDataset,
  onDeleteDataset,
  onExportDataset,
  onEditDataset,
  onAnalyzeDataset,
  onSelectForMerge
}: DatasetListProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, dataset: Dataset) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveDataset(dataset);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleAction = (action: 'view' | 'delete' | 'export' | 'edit' | 'analyze' | 'merge') => {
    if (!activeDataset) return;
    
    switch (action) {
      case 'view':
        onViewDataset(activeDataset);
        break;
      case 'delete':
        onDeleteDataset(activeDataset);
        break;
      case 'export':
        onExportDataset(activeDataset);
        break;
      case 'edit':
        onEditDataset(activeDataset);
        break;
      case 'analyze':
        onAnalyzeDataset(activeDataset);
        break;
      case 'merge':
        onSelectForMerge(activeDataset);
        break;
    }
    
    handleMenuClose();
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  if (datasets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No datasets available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Upload a dataset to get started
        </Typography>
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {datasets.map((dataset) => (
        <Grid item xs={12} sm={6} md={4} key={dataset.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3" noWrap sx={{ maxWidth: '80%' }}>
                  {dataset.name}
                </Typography>
                
                <IconButton 
                  size="small" 
                  onClick={(e) => handleMenuOpen(e, dataset)}
                  aria-label="dataset options"
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              {dataset.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {dataset.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={dataset.format.toUpperCase()} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${dataset.rowCount} rows`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${dataset.columns.length} columns`} 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(dataset.createdAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(dataset.size)}
                </Typography>
              </Box>
            </CardContent>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                p: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Tooltip title="View Dataset">
                <IconButton size="small" onClick={() => handleAction('view')}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Analyze Dataset">
                <IconButton size="small" onClick={() => handleAction('analyze')}>
                  <AnalyticsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Select for Merge">
                <IconButton size="small" onClick={() => handleAction('merge')}>
                  <MergeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Export Dataset">
                <IconButton size="small" onClick={() => handleAction('export')}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Dataset</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleAction('analyze')}>
          <ListItemIcon>
            <AnalyticsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Analyze</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleAction('merge')}>
          <ListItemIcon>
            <MergeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Select for Merge</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleAction('export')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Grid>
  );
}
