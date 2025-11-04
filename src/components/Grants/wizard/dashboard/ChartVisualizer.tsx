'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartVisualizerProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  allowTypeChange?: boolean;
  onChartTypeChange?: (type: 'line' | 'bar' | 'pie' | 'area') => void;
}

export function ChartVisualizer({ 
  title, 
  description, 
  data, 
  chartType = 'bar', 
  height = 300,
  allowTypeChange = false,
  onChartTypeChange
}: ChartVisualizerProps) {
  // Generate colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Get all data keys except 'name' for multi-series charts
  const getDataKeys = () => {
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]).filter(key => key !== 'name');
    return keys;
  };
  
  const dataKeys = getDataKeys();
  
  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    if (onChartTypeChange) {
      onChartTypeChange(event.target.value as 'line' | 'bar' | 'pie' | 'area');
    }
  };
  
  // Render the selected chart type
  const renderChart = () => {
    switch(chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {dataKeys.length > 0 ? (
                dataKeys.map((key, index) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={COLORS[index % COLORS.length]} 
                    activeDot={{ r: 8 }}
                    name={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize first letter
                  />
                ))
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Value"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {dataKeys.length > 0 ? (
                dataKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    fill={COLORS[index % COLORS.length]}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))
              ) : (
                <Bar dataKey="value" fill="#8884d8" name="Value" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }: any) => `${name}: ${((value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {dataKeys.length > 0 ? (
                dataKeys.map((key, index) => (
                  <Area 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stackId={index + 1}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))
              ) : (
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Value"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <Typography variant="body2" color="text.secondary">
              No data visualization available
            </Typography>
          </Box>
        );
    }
  };
  
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">{description}</Typography>
          )}
        </Box>
        
        {allowTypeChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={handleChartTypeChange}
              size="small"
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="area">Area Chart</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <Typography variant="body2" color="text.secondary">
            No data available for visualization
          </Typography>
        </Box>
      ) : (
        renderChart()
      )}
    </Paper>
  );
}
