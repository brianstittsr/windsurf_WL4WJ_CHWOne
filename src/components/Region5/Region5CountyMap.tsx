'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  LocationOn,
  Info,
  People,
  Business,
  TrendingUp
} from '@mui/icons-material';

interface ProcessedDataset {
  id: string;
  name: string;
  data: any[];
  columns: string[];
}

interface CountyData {
  name: string;
  population?: number;
  chwCount?: number;
  activePrograms?: number;
  growth?: number;
  description?: string;
  color?: string;
}

const REGION5_COUNTIES: CountyData[] = [
  { name: 'Bladen', population: 33778, chwCount: 12, activePrograms: 8, growth: 2.1, color: '#e3f2fd' },
  { name: 'Brunswick', population: 142820, chwCount: 45, activePrograms: 23, growth: 8.5, color: '#f3e5f5' },
  { name: 'Columbus', population: 55508, chwCount: 18, activePrograms: 12, growth: 1.8, color: '#e8f5e8' },
  { name: 'Cumberland', population: 319431, chwCount: 98, activePrograms: 45, growth: 3.2, color: '#fff3e0' },
  { name: 'Harnett', population: 133568, chwCount: 42, activePrograms: 28, growth: 5.1, color: '#fce4ec' },
  { name: 'Hoke', population: 55234, chwCount: 22, activePrograms: 15, growth: 4.2, color: '#f1f8e9' },
  { name: 'Lee', population: 61479, chwCount: 19, activePrograms: 11, growth: 2.8, color: '#e0f2f1' },
  { name: 'Montgomery', population: 27173, chwCount: 8, activePrograms: 6, growth: 1.5, color: '#f9fbe7' },
  { name: 'Moore', population: 100880, chwCount: 35, activePrograms: 22, growth: 3.9, color: '#efebe9' },
  { name: 'New Hanover', population: 234473, chwCount: 78, activePrograms: 38, growth: 6.2, color: '#e8eaf6' },
  { name: 'Pender', population: 67861, chwCount: 25, activePrograms: 16, growth: 4.8, color: '#fce4ec' },
  { name: 'Richmond', population: 44829, chwCount: 14, activePrograms: 9, growth: 1.9, color: '#f3e5f5' },
  { name: 'Robeson', population: 116530, chwCount: 38, activePrograms: 24, growth: 2.5, color: '#e8f5e8' },
  { name: 'Sampson', population: 63531, chwCount: 20, activePrograms: 13, growth: 2.2, color: '#fff3e0' },
  { name: 'Scotland', population: 34914, chwCount: 11, activePrograms: 7, growth: 1.7, color: '#e0f2f1' }
];

interface Region5CountyMapProps {
  datasets?: ProcessedDataset[];
  onCountySelect?: (county: CountyData) => void;
}

export default function Region5CountyMap({
  datasets = [],
  onCountySelect
}: Region5CountyMapProps) {
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enhancedData, setEnhancedData] = useState<CountyData[]>(REGION5_COUNTIES);

  useEffect(() => {
    // Enhance county data with processed datasets if available
    if (datasets.length > 0) {
      // Mock enhancement - in real implementation, this would merge actual data
      setEnhancedData(REGION5_COUNTIES.map(county => ({
        ...county,
        // Add mock enhanced data from datasets
        population: county.population,
        chwCount: county.chwCount,
        activePrograms: county.activePrograms,
        growth: county.growth
      })));
    }
  }, [datasets]);

  const handleCountyClick = (county: CountyData) => {
    setSelectedCounty(county);
    setDialogOpen(true);
    onCountySelect?.(county);
  };

  const getCountyColor = (county: CountyData) => {
    if (hoveredCounty?.name === county.name) {
      return '#1976d2'; // Blue for hover
    }
    if (selectedCounty?.name === county.name) {
      return '#0d47a1'; // Darker blue for selected
    }
    return county.color || '#e3f2fd';
  };

  const getCountySize = (county: CountyData) => {
    // Size based on population (normalized)
    const maxPop = Math.max(...enhancedData.map(c => c.population || 0));
    const minPop = Math.min(...enhancedData.map(c => c.population || 0));
    const normalizedSize = ((county.population || 0) - minPop) / (maxPop - minPop);
    const baseSize = 60;
    const sizeVariation = 40;
    return baseSize + (normalizedSize * sizeVariation);
  };

  const totalStats = {
    totalPopulation: enhancedData.reduce((sum, c) => sum + (c.population || 0), 0),
    totalCHWs: enhancedData.reduce((sum, c) => sum + (c.chwCount || 0), 0),
    totalPrograms: enhancedData.reduce((sum, c) => sum + (c.activePrograms || 0), 0),
    averageGrowth: enhancedData.reduce((sum, c) => sum + (c.growth || 0), 0) / enhancedData.length
  };

  return (
    <Box>
      {/* Header with Summary Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" />
            Region 5 County Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">{totalStats.totalPopulation.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">Total Population</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="secondary">{totalStats.totalCHWs}</Typography>
                <Typography variant="body2" color="text.secondary">Active CHWs</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">{totalStats.totalPrograms}</Typography>
                <Typography variant="body2" color="text.secondary">Active Programs</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main">{totalStats.averageGrowth.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">Avg Growth</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Interactive County Map
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click on any county to view detailed information and statistics.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 2,
              p: 2,
              minHeight: 400,
              backgroundColor: '#f8f9fa',
              borderRadius: 2
            }}
          >
            {enhancedData.map((county) => (
              <Tooltip
                key={county.name}
                title={
                  <Box>
                    <Typography variant="subtitle2">{county.name} County</Typography>
                    <Typography variant="body2">Population: {(county.population || 0).toLocaleString()}</Typography>
                    <Typography variant="body2">CHWs: {county.chwCount || 0}</Typography>
                    <Typography variant="body2">Programs: {county.activePrograms || 0}</Typography>
                    <Typography variant="body2">Growth: {county.growth || 0}%</Typography>
                  </Box>
                }
                arrow
              >
                <Card
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: getCountyColor(county),
                    border: selectedCounty?.name === county.name ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    },
                    minHeight: getCountySize(county),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 1
                  }}
                  onClick={() => handleCountyClick(county)}
                  onMouseEnter={() => setHoveredCounty(county)}
                  onMouseLeave={() => setHoveredCounty(null)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {county.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(county.population || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={`${county.chwCount || 0} CHW`}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                </Card>
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* County List View */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            County List View
          </Typography>
          <Grid container spacing={2}>
            {enhancedData.map((county) => (
              <Grid item xs={12} sm={6} md={4} key={county.name}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 },
                    height: '100%'
                  }}
                  onClick={() => handleCountyClick(county)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {county.name} County
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        <People sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Population: {(county.population || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        CHWs: {county.chwCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Growth: {county.growth || 0}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* County Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCounty?.name} County Details
        </DialogTitle>
        <DialogContent>
          {selectedCounty && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Demographics</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Population"
                        secondary={(selectedCounty.population || 0).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Growth Rate"
                        secondary={`${selectedCounty.growth || 0}%`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Community Health</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Active CHWs"
                        secondary={selectedCounty.chwCount || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Active Programs"
                        secondary={selectedCounty.activePrograms || 0}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              {selectedCounty.description && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body2">
                    {selectedCounty.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
