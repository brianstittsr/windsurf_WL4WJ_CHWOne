'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import * as d3 from 'd3';
import Plot from 'react-plotly.js';
import { ProcessedDataset } from '@/services/DataProcessingService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

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
      id={`data-viz-tabpanel-${index}`}
      aria-labelledby={`data-viz-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DataVisualizationDashboardProps {
  datasets: ProcessedDataset[];
  onDatasetSelect?: (dataset: ProcessedDataset) => void;
}

export default function DataVisualizationDashboard({
  datasets,
  onDatasetSelect
}: DataVisualizationDashboardProps) {
  const [selectedDataset, setSelectedDataset] = useState<ProcessedDataset | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'd3' | 'plotly'>('bar');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasets[0]);
    }
  }, [datasets, selectedDataset]);

  const handleDatasetChange = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setSelectedDataset(dataset);
      onDatasetSelect?.(dataset);
    }
  };

  const prepareChartData = (dataset: ProcessedDataset) => {
    if (!dataset || dataset.data.length === 0) return [];

    // For simplicity, use the first two columns as x and y
    const columns = dataset.columns;
    if (columns.length < 2) return [];

    const xColumn = columns[0];
    const yColumn = columns[1];

    return dataset.data.map((row, index) => ({
      name: row[xColumn] || `Row ${index + 1}`,
      value: typeof row[yColumn] === 'number' ? row[yColumn] : parseFloat(row[yColumn]) || 0
    }));
  };

  const renderRechartsChart = () => {
    if (!selectedDataset) return null;

    const data = prepareChartData(selectedDataset);

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const { name, value } = props;
                  const percent = props.percent as number;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderChartJSChart = () => {
    if (!selectedDataset) return null;

    const data = prepareChartData(selectedDataset);

    const chartData = {
      labels: data.map(d => d.name),
      datasets: [{
        label: selectedDataset.columns[1] || 'Value',
        data: data.map(d => d.value),
        backgroundColor: COLORS,
        borderColor: COLORS.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      }],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: `${selectedDataset.name} - Chart.js Visualization`,
        },
      },
    };

    return <Chart type="bar" data={chartData} options={options} />;
  };

  const renderD3Chart = () => {
    if (!selectedDataset) return null;

    // D3 visualization would be implemented here
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6">D3.js Visualization</Typography>
        <Typography variant="body2" color="text.secondary">
          D3.js chart would be rendered here with custom interactive features
        </Typography>
        <div id="d3-chart-container" style={{ width: '100%', height: '400px', backgroundColor: '#f5f5f5' }}>
          {/* D3 chart would be appended here */}
        </div>
      </Box>
    );
  };

  const renderPlotlyChart = () => {
    if (!selectedDataset) return null;

    const data = prepareChartData(selectedDataset);

    const plotlyData = [{
      x: data.map(d => d.name),
      y: data.map(d => d.value),
      type: 'bar',
      marker: { color: COLORS[0] },
    }];

    const layout = {
      title: `${selectedDataset.name} - Plotly.js Visualization`,
      xaxis: { title: selectedDataset.columns[0] || 'Category' },
      yaxis: { title: selectedDataset.columns[1] || 'Value' },
    };

    return (
      <Plot
        data={plotlyData}
        layout={layout}
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  if (datasets.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          No datasets available. Please process some files first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Visualization Dashboard
      </Typography>

      {/* Dataset Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Dataset</InputLabel>
                <Select
                  value={selectedDataset?.id || ''}
                  label="Select Dataset"
                  onChange={(e) => handleDatasetChange(e.target.value)}
                >
                  {datasets.map((dataset) => (
                    <MenuItem key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.rowCount} rows)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={(e) => setChartType(e.target.value as any)}
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                  <MenuItem value="d3">D3.js</MenuItem>
                  <MenuItem value="plotly">Plotly.js</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dataset Info */}
      {selectedDataset && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dataset Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{selectedDataset.name}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Chip label={selectedDataset.type.toUpperCase()} color="primary" size="small" />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Rows</Typography>
                <Typography variant="body1">{selectedDataset.rowCount}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Columns</Typography>
                <Typography variant="body1">{selectedDataset.columns.length}</Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Columns:</Typography>
              <Box sx={{ mt: 1 }}>
                {selectedDataset.columns.map((col) => (
                  <Chip key={col} label={col} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Visualization Tabs */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Recharts" />
              <Tab label="Chart.js" />
              <Tab label="D3.js" />
              <Tab label="Plotly.js" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {renderRechartsChart()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderChartJSChart()}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderD3Chart()}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderPlotlyChart()}
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}
