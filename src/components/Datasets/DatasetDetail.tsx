'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  Merge as MergeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Dataset, DatasetColumn } from '@/types/bmad.types';

interface DatasetDetailProps {
  dataset: Dataset;
  onClose: () => void;
  onExport: (dataset: Dataset) => void;
  onAnalyze: (dataset: Dataset) => void;
  onSelectForMerge: (dataset: Dataset) => void;
}

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DatasetDetail({
  dataset,
  onClose,
  onExport,
  onAnalyze,
  onSelectForMerge
}: DatasetDetailProps) {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getColumnTypeColor = (type: DatasetColumn['type']) => {
    switch (type) {
      case 'string':
        return 'primary';
      case 'number':
        return 'success';
      case 'boolean':
        return 'warning';
      case 'date':
        return 'info';
      case 'object':
        return 'secondary';
      case 'array':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {dataset.name}
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AnalyticsIcon />}
              onClick={() => onAnalyze(dataset)}
            >
              Analyze
            </Button>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<MergeIcon />}
              onClick={() => onSelectForMerge(dataset)}
            >
              Merge
            </Button>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<DownloadIcon />}
              onClick={() => onExport(dataset)}
            >
              Export
            </Button>
          </Stack>
        </Box>
        
        {dataset.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {dataset.description}
          </Typography>
        )}
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Format
                </Typography>
                <Typography variant="h6">
                  {dataset.format.toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Rows
                </Typography>
                <Typography variant="h6">
                  {dataset.rowCount.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Columns
                </Typography>
                <Typography variant="h6">
                  {dataset.columns.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="h6">
                  {formatDate(dataset.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dataset tabs">
          <Tab label="Preview" id="dataset-tab-0" aria-controls="dataset-tabpanel-0" />
          <Tab label="Schema" id="dataset-tab-1" aria-controls="dataset-tabpanel-1" />
          <Tab label="Statistics" id="dataset-tab-2" aria-controls="dataset-tabpanel-2" />
        </Tabs>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          {dataset.previewData && dataset.previewData.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {dataset.columns.map((column) => (
                      <TableCell key={column.name}>
                        <Typography variant="subtitle2">{column.name}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataset.previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {dataset.columns.map((column) => (
                        <TableCell key={`${rowIndex}-${column.name}`}>
                          {typeof row[column.name] === 'object' 
                            ? JSON.stringify(row[column.name]) 
                            : String(row[column.name] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No preview data available
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Nullable</TableCell>
                  <TableCell>Unique Values</TableCell>
                  <TableCell>Missing Values</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataset.columns.map((column) => (
                  <TableRow key={column.name}>
                    <TableCell>
                      <Typography variant="subtitle2">{column.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={column.type} 
                        size="small" 
                        color={getColumnTypeColor(column.type)} 
                      />
                    </TableCell>
                    <TableCell>{column.nullable ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{column.uniqueValues || 'N/A'}</TableCell>
                    <TableCell>{column.missingCount || 0}</TableCell>
                    <TableCell>{column.description || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Min</TableCell>
                  <TableCell>Max</TableCell>
                  <TableCell>Mean</TableCell>
                  <TableCell>Median</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataset.columns
                  .filter(column => column.type === 'number')
                  .map((column) => (
                    <TableRow key={column.name}>
                      <TableCell>
                        <Typography variant="subtitle2">{column.name}</Typography>
                      </TableCell>
                      <TableCell>{column.min !== undefined ? column.min : 'N/A'}</TableCell>
                      <TableCell>{column.max !== undefined ? column.max : 'N/A'}</TableCell>
                      <TableCell>{column.mean !== undefined ? column.mean.toFixed(2) : 'N/A'}</TableCell>
                      <TableCell>{column.median !== undefined ? column.median.toFixed(2) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                
                {dataset.columns.filter(column => column.type === 'number').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No numerical columns available for statistics
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Paper>
  );
}
