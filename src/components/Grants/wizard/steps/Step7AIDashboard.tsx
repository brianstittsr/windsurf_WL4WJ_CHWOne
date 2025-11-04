'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Tooltip,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as ChartIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Update as UpdateIcon,
  ArrowUpward as TrendUpIcon,
  ArrowDownward as TrendDownIcon,
  Remove as TrendFlatIcon,
  InsertDriveFile as FileTextIcon,
  TableChart as TableChartIcon,
  PieChart as PieChartIcon,
  RemoveRedEye as PreviewIcon
} from '@mui/icons-material';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { DashboardMetric, ReportTemplate } from '@/types/grant.types';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

export function Step7AIDashboard() {
  const { grantData, updateGrantData } = useGrantWizard();
  const [tabIndex, setTabIndex] = useState(0);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetric[]>(grantData.dashboardMetrics || []);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(grantData.reportTemplates || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);
  
  // Generate sample metrics and report templates if none exist
  useEffect(() => {
    if ((dashboardMetrics.length === 0) && ((grantData.projectMilestones?.length || 0) > 0)) {
      const generatedMetrics = generateSampleMetrics(grantData);
      setDashboardMetrics(generatedMetrics);
      updateGrantData({ dashboardMetrics: generatedMetrics });
    }
    
    if ((reportTemplates.length === 0) && ((grantData.dataCollectionMethods?.length || 0) > 0)) {
      const generatedReports = generateSampleReports(grantData);
      setReportTemplates(generatedReports);
      updateGrantData({ reportTemplates: generatedReports });
    }
  }, [grantData.projectMilestones, grantData.dataCollectionMethods]);

  // Save dashboard metrics and report templates when they change
  useEffect(() => {
    if (dashboardMetrics.length > 0) {
      updateGrantData({ dashboardMetrics });
    }
    
    if (reportTemplates.length > 0) {
      updateGrantData({ reportTemplates });
    }
  }, [dashboardMetrics, reportTemplates]);

  // Function to generate sample metrics from grant data
  const generateSampleMetrics = (grant: Partial<any>): DashboardMetric[] => {
    const metrics: DashboardMetric[] = [];
    
    // Add overall project progress
    metrics.push({
      id: `metric-overall-progress`,
      name: "Overall Project Progress",
      description: "Percentage of project milestones completed",
      value: calculateOverallProgress(grant),
      previousValue: calculateOverallProgress(grant) - 10,
      target: 100,
      unit: "%",
      status: "success",
      trend: "up",
      trendPercentage: 10,
      dataSource: "project_milestones",
      visualization: "percentage",
      aiInsight: "Project is progressing slightly ahead of schedule based on milestone completion."
    });
    
    // Add budget utilization
    metrics.push({
      id: `metric-budget`,
      name: "Budget Utilization",
      description: "Percentage of total budget utilized",
      value: 35,
      previousValue: 28,
      target: 100,
      unit: "%",
      status: "info",
      trend: "up",
      trendPercentage: 7,
      dataSource: "financial_records",
      visualization: "percentage",
      aiInsight: "Budget utilization is on track with project timeline."
    });
    
    // Add entity collaboration score
    metrics.push({
      id: `metric-collaboration`,
      name: "Entity Collaboration Score",
      description: "Measure of effective collaboration between entities",
      value: 82,
      previousValue: 75,
      target: 90,
      unit: "points",
      status: "success",
      trend: "up",
      trendPercentage: 7,
      dataSource: "collaboration_assessment",
      visualization: "number",
      aiInsight: "Collaboration between entities has improved since implementing weekly coordination meetings."
    });
    
    // Add data collection compliance
    metrics.push({
      id: `metric-compliance`,
      name: "Data Collection Compliance",
      description: "Percentage of required data collected on time",
      value: 95,
      previousValue: 92,
      target: 100,
      unit: "%",
      status: "success",
      trend: "up",
      trendPercentage: 3,
      dataSource: "form_submissions",
      visualization: "percentage",
      aiInsight: "High compliance rate indicates effective data collection process."
    });
    
    // Add upcoming milestone count
    const upcomingCount = (grant.projectMilestones || [])
      .filter((m: any) => m.status !== 'completed').length;
      
    metrics.push({
      id: `metric-upcoming`,
      name: "Upcoming Milestones",
      description: "Number of milestones pending completion",
      value: upcomingCount,
      target: 0,
      unit: "milestones",
      status: upcomingCount > 3 ? "warning" : "info",
      trend: "flat",
      dataSource: "project_milestones",
      visualization: "number",
      aiInsight: upcomingCount > 3 ? 
        "Consider reviewing project timeline as several milestones are pending completion." :
        "Project is on track with manageable number of upcoming milestones."
    });
    
    return metrics;
  };
  
  // Function to calculate overall project progress
  const calculateOverallProgress = (grant: Partial<any>): number => {
    const milestones = grant.projectMilestones || [];
    if (milestones.length === 0) return 0;
    
    const completedCount = milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completedCount / milestones.length) * 100);
  };
  
  // Function to generate sample reports from grant data
  const generateSampleReports = (grant: Partial<any>): ReportTemplate[] => {
    const reports: ReportTemplate[] = [];
    
    // Progress report
    reports.push({
      id: `report-progress`,
      name: "Quarterly Progress Report",
      description: "Comprehensive overview of project progress and milestone completion",
      format: "pdf",
      sections: [
        {
          id: "section-1",
          title: "Executive Summary",
          description: "Overview of key accomplishments and challenges",
          dataSource: "manual_entry",
          visualizationType: "text"
        },
        {
          id: "section-2",
          title: "Milestone Progress",
          description: "Detailed status of all project milestones",
          dataSource: "project_milestones",
          visualizationType: "table"
        },
        {
          id: "section-3",
          title: "Budget Utilization",
          description: "Financial summary and budget allocation",
          dataSource: "financial_records",
          visualizationType: "chart",
          chartType: "bar"
        },
        {
          id: "section-4",
          title: "Key Metrics",
          description: "Performance indicators and outcomes",
          dataSource: "dashboard_metrics",
          visualizationType: "chart",
          chartType: "line"
        }
      ],
      deliverySchedule: {
        frequency: "quarterly",
        dayOfMonth: 15,
        recipients: [
          "Grant Administrator",
          "Project Manager",
          "Funding Organization"
        ]
      },
      contractDeliverable: true,
      dueDate: "2025-03-15"
    });
    
    // Monthly data collection report
    reports.push({
      id: `report-data`,
      name: "Monthly Data Collection Summary",
      description: "Summary of all data collected during the reporting period",
      format: "dashboard",
      sections: [
        {
          id: "section-1",
          title: "Data Collection Overview",
          description: "Summary statistics of data collection activities",
          dataSource: "form_submissions",
          visualizationType: "metric"
        },
        {
          id: "section-2",
          title: "Collection by Entity",
          description: "Breakdown of data collection by responsible entity",
          dataSource: "form_submissions",
          visualizationType: "chart",
          chartType: "pie"
        },
        {
          id: "section-3",
          title: "Data Quality Analysis",
          description: "Assessment of data completeness and quality",
          dataSource: "data_quality",
          visualizationType: "table"
        }
      ],
      deliverySchedule: {
        frequency: "monthly",
        dayOfMonth: 5,
        recipients: [
          "Data Manager",
          "Project Manager"
        ]
      },
      contractDeliverable: false
    });
    
    // Annual performance report
    reports.push({
      id: `report-annual`,
      name: "Annual Performance Report",
      description: "Comprehensive annual report of project outcomes and impact",
      format: "pdf",
      sections: [
        {
          id: "section-1",
          title: "Executive Summary",
          description: "Overview of annual performance and key achievements",
          dataSource: "manual_entry",
          visualizationType: "text"
        },
        {
          id: "section-2",
          title: "Goals and Objectives",
          description: "Assessment of progress toward stated goals",
          dataSource: "project_goals",
          visualizationType: "table"
        },
        {
          id: "section-3",
          title: "Performance Metrics",
          description: "Yearly trends in key performance indicators",
          dataSource: "dashboard_metrics",
          visualizationType: "chart",
          chartType: "line"
        },
        {
          id: "section-4",
          title: "Financial Summary",
          description: "Annual financial report and budget analysis",
          dataSource: "financial_records",
          visualizationType: "chart",
          chartType: "bar"
        },
        {
          id: "section-5",
          title: "Impact Assessment",
          description: "Analysis of project impact and outcomes",
          dataSource: "impact_data",
          visualizationType: "text"
        }
      ],
      deliverySchedule: {
        frequency: "annually",
        dayOfMonth: 30,
        dayOfWeek: "Friday",
        recipients: [
          "Grant Administrator",
          "Executive Director",
          "Board of Directors",
          "Funding Organization"
        ]
      },
      contractDeliverable: true,
      dueDate: "2025-12-30"
    });
    
    return reports;
  };
  
  // Function to add a new report template
  const addReportTemplate = () => {
    const newReport: ReportTemplate = {
      id: `report-${Date.now()}`,
      name: "New Report Template",
      description: "Enter description here",
      format: "pdf",
      sections: [{
        id: `section-${Date.now()}`,
        title: "Report Section",
        description: "Enter section description",
        dataSource: "manual_entry",
        visualizationType: "text"
      }],
      deliverySchedule: {
        frequency: "quarterly",
        recipients: ["Project Manager"]
      },
      contractDeliverable: false
    };
    
    setReportTemplates([...reportTemplates, newReport]);
  };
  
  // Function to add a new dashboard metric
  const addDashboardMetric = () => {
    const newMetric: DashboardMetric = {
      id: `metric-${Date.now()}`,
      name: "New Metric",
      description: "Enter metric description",
      value: 0,
      unit: "",
      status: "info",
      dataSource: "manual_entry",
      visualization: "number"
    };
    
    setDashboardMetrics([...dashboardMetrics, newMetric]);
  };
  
  // Function to delete a dashboard metric
  const deleteMetric = (metricId: string) => {
    const updatedMetrics = dashboardMetrics.filter(metric => metric.id !== metricId);
    setDashboardMetrics(updatedMetrics);
  };
  
  // Function to delete a report template
  const deleteReportTemplate = (reportId: string) => {
    const updatedReports = reportTemplates.filter(report => report.id !== reportId);
    setReportTemplates(updatedReports);
  };
  
  // Function to render the metric cards
  const renderDashboardMetrics = () => {
    if (dashboardMetrics.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No metrics have been created yet. Click the button below to add your first metric.
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {dashboardMetrics.map((metric) => (
          <Grid item xs={12} md={6} lg={4} key={metric.id}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Typography variant="h6" noWrap sx={{ fontSize: '1rem' }}>
                    {metric.name}
                  </Typography>
                }
                action={
                  <IconButton size="small" onClick={() => deleteMetric(metric.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {metric.value}{metric.unit ? metric.unit : ''}
                    </Typography>
                    {metric.previousValue !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {metric.trend === 'up' ? (
                          <TrendUpIcon fontSize="small" color="success" />
                        ) : metric.trend === 'down' ? (
                          <TrendDownIcon fontSize="small" color="error" />
                        ) : (
                          <TrendFlatIcon fontSize="small" color="action" />
                        )}
                        <Typography 
                          variant="caption" 
                          color={
                            metric.trend === 'up' ? 'success.main' :
                            metric.trend === 'down' ? 'error.main' :
                            'text.secondary'
                          }
                          sx={{ ml: 0.5 }}
                        >
                          {metric.trendPercentage !== undefined ? `${metric.trendPercentage}%` : ''} {metric.trend !== 'flat' ? 'change' : ''}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Chip 
                    label={metric.status} 
                    size="small"
                    color={
                      metric.status === 'success' ? 'success' :
                      metric.status === 'warning' ? 'warning' :
                      metric.status === 'danger' ? 'error' :
                      'info'
                    }
                  />
                </Box>
                
                {metric.target !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Progress to target</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metric.value} / {metric.target}{metric.unit}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(((typeof metric.value === 'number' && typeof metric.target === 'number') ? (metric.value / metric.target * 100) : 0), 100)} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
                
                {metric.aiInsight && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="info.dark">
                      <strong>AI Insight:</strong> {metric.aiInsight}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Function to refresh metrics with animation
  const refreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Update metrics with slightly changed values to simulate real data refresh
      const refreshedMetrics = dashboardMetrics.map(metric => {
        const randomChange = Math.random() * 10 - 5; // Random change between -5 and 5
        const newValue = typeof metric.value === 'number' ? 
          Math.max(0, Math.min(100, metric.value + randomChange)) : 
          metric.value;
          
        const previousValue = metric.value;
        const trendValue = newValue > previousValue ? 'up' : newValue < previousValue ? 'down' : 'flat';
        const trendPercentage = typeof previousValue === 'number' ? 
          Math.abs(Math.round(((newValue as number - previousValue as number) / (previousValue as number)) * 100)) : 0;
        
        return {
          ...metric,
          value: newValue,
          previousValue,
          trend: trendValue as 'up' | 'down' | 'flat',
          trendPercentage,
          aiInsight: generateAIInsight(metric.name, newValue as number, trendValue)
        };
      });
      
      setDashboardMetrics(refreshedMetrics);
      updateGrantData({ dashboardMetrics: refreshedMetrics });
      setIsRefreshing(false);
    }, 1500); // Simulate processing delay
  };
  
  // Function to generate AI insights based on metric name and value
  const generateAIInsight = (name: string, value: number, trend: string): string => {
    const insights = [
      `${name} is trending ${trend === 'up' ? 'positively' : trend === 'down' ? 'negatively' : 'steadily'}.`,
      `Recent changes in ${name.toLowerCase()} suggest ${trend === 'up' ? 'improvement' : trend === 'down' ? 'potential issues' : 'stability'}.`,
      `Based on historical patterns, ${name.toLowerCase()} is ${value > 80 ? 'performing exceptionally well' : value > 60 ? 'performing well' : value > 40 ? 'performing adequately' : 'needs attention'}.`,
      `${trend === 'up' ? 'Improvement' : trend === 'down' ? 'Decline' : 'Stability'} in ${name.toLowerCase()} correlates with recent project activities.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  };
  
  // Generate data for project trend chart
  const generateProjectTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const progressFactor = Math.min(100, (index + 1) * 16); // Progressive increase
      const randomFactor = Math.random() * 10;
      
      return {
        month,
        progress: Math.min(100, progressFactor + randomFactor - 5),
        budget: Math.min(100, (index + 1) * 15 + randomFactor),
        dataCollection: Math.min(100, progressFactor - 5 + randomFactor)
      };
    });
  };
  
  // Generate entity contribution data for pie chart
  const generateEntityContributionData = () => {
    const entities = grantData.collaboratingEntities || [];
    if (entities.length === 0) {
      return [
        { name: 'Lead Organization', value: 60 },
        { name: 'Partner A', value: 25 },
        { name: 'Partner B', value: 15 }
      ];
    }
    
    return entities.map(entity => {
      const baseValue = entity.role === 'lead' ? 50 : 
                        entity.role === 'partner' ? 25 :
                        entity.role === 'evaluator' ? 15 : 10;
      const randomFactor = Math.random() * 10;
      
      return {
        name: entity.name,
        value: baseValue + randomFactor
      };
    });
  };
  
  // Generate milestone status data for bar chart
  const generateMilestoneStatusData = () => {
    const statuses = ['completed', 'in_progress', 'not_started', 'delayed'];
    const milestones = grantData.projectMilestones || [];
    
    if (milestones.length === 0) {
      return [
        { status: 'Completed', count: 2 },
        { status: 'In Progress', count: 3 },
        { status: 'Not Started', count: 4 },
        { status: 'Delayed', count: 1 }
      ];
    }
    
    const counts = statuses.map(status => {
      return {
        status: status === 'completed' ? 'Completed' : 
                status === 'in_progress' ? 'In Progress' : 
                status === 'not_started' ? 'Not Started' : 'Delayed',
        count: milestones.filter(m => m.status === status).length || 0
      };
    });
    
    return counts;
  };

  // Function to open report preview
  const openReportPreview = (reportId: string) => {
    setSelectedReportId(reportId);
    setReportPreviewOpen(true);
  };

  // Function to render the report templates
  const renderReportTemplates = () => {
    if (reportTemplates.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No report templates have been created yet. Click the button below to create your first report template.
        </Alert>
      );
    }
    
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Report Name</strong></TableCell>
              <TableCell><strong>Format</strong></TableCell>
              <TableCell><strong>Frequency</strong></TableCell>
              <TableCell><strong>Contract Deliverable</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportTemplates.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {report.format === 'pdf' ? (
                      <FileTextIcon style={{ color: '#d32f2f', marginRight: 8 }} />
                    ) : report.format === 'dashboard' ? (
                      <DashboardIcon style={{ color: '#2196f3', marginRight: 8 }} />
                    ) : report.format === 'excel' ? (
                      <TableChartIcon style={{ color: '#388e3c', marginRight: 8 }} />
                    ) : (
                      <ChartIcon style={{ color: '#ff9800', marginRight: 8 }} />
                    )}
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{report.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{report.description}</Typography>
                    </div>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={report.format}
                    size="small"
                    color={
                      report.format === 'pdf' ? 'error' :
                      report.format === 'dashboard' ? 'primary' :
                      report.format === 'excel' ? 'success' :
                      'warning'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                    {report.deliverySchedule.frequency}
                  </Box>
                </TableCell>
                <TableCell>
                  {report.contractDeliverable ? (
                    <Chip 
                      label="Required"
                      size="small"
                      color="warning"
                    />
                  ) : (
                    <Chip 
                      label="Optional"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openReportPreview(report.id)} sx={{ mr: 1 }} title="Preview Report">
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => deleteReportTemplate(report.id)} title="Delete Report">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Create mock report preview dialog
  const renderReportPreview = () => {
    const report = reportTemplates.find(r => r.id === selectedReportId);
    if (!report) return null;
    
    return (
      <Dialog
        open={reportPreviewOpen}
        onClose={() => setReportPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{report.name} - Preview</Typography>
            <Chip 
              label={report.format.toUpperCase()}
              color={report.format === 'pdf' ? 'error' : report.format === 'dashboard' ? 'primary' : 'default'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {report.sections.map((section, index) => (
            <Box key={section.id} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>{section.title}</Typography>
              <Typography variant="body2" paragraph color="text.secondary">{section.description}</Typography>
              
              {section.visualizationType === 'chart' && section.chartType === 'bar' && (
                <Box sx={{ height: 250, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={generateMilestoneStatusData()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Milestones" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {section.visualizationType === 'chart' && section.chartType === 'pie' && (
                <Box sx={{ height: 250, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateEntityContributionData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {generateEntityContributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'][index % 5]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {section.visualizationType === 'chart' && section.chartType === 'line' && (
                <Box sx={{ height: 250, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generateProjectTrendData()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="progress" stroke="#8884d8" activeDot={{ r: 8 }} name="Progress" />
                      <Line type="monotone" dataKey="budget" stroke="#82ca9d" name="Budget" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {section.visualizationType === 'table' && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Due Date</strong></TableCell>
                        <TableCell><strong>Responsible</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grantData.projectMilestones?.slice(0, 5).map((milestone) => (
                        <TableRow key={milestone.id}>
                          <TableCell>{milestone.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={milestone.status}
                              size="small"
                              color={
                                milestone.status === 'completed' ? 'success' :
                                milestone.status === 'in_progress' ? 'primary' :
                                milestone.status === 'delayed' ? 'error' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>{milestone.dueDate}</TableCell>
                          <TableCell>{milestone.responsibleParties?.[0] || 'N/A'}</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No milestone data available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {section.visualizationType === 'text' && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', mb: 2 }}>
                  <Typography variant="body2">
                    {index === 0 ? 
                      'Executive summary content would appear here, generated automatically from project data and supplemented with AI analysis of trends and patterns.' :
                      'Content for this text section would be populated from project data and prepared for the report.'}
                  </Typography>
                </Paper>
              )}
              
              {section.visualizationType === 'metric' && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">{dashboardMetrics[0]?.value || 75}%</Typography>
                      <Typography variant="body2">Overall Progress</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">{dashboardMetrics[3]?.value || 95}%</Typography>
                      <Typography variant="body2">Data Compliance</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">{dashboardMetrics[1]?.value || 35}%</Typography>
                      <Typography variant="body2">Budget Used</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
              
              {index < report.sections.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportPreviewOpen(false)}>Close</Button>
          <Button variant="contained" color="primary" startIcon={<FileTextIcon />}>
            Download {report.format.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Render report preview dialog */}
      {renderReportPreview()}
      
      <Box sx={{ mb: 3 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>AI-Powered Project Tracking</AlertTitle>
          The AI Dashboard automatically monitors your grant project and provides real-time insights. 
          It also generates scheduled reports based on contract deliverables.
        </Alert>
        
        <Tabs 
          value={tabIndex} 
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Dashboard Metrics" icon={<AnalyticsIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Automated Reports" icon={<ScheduleIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Notifications & Alerts" icon={<NotificationsIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
        
        {tabIndex === 0 && (
          <Box>
            {/* Real-time project overview chart */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Project Overview</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Real-time visualization of project progress, budget utilization, and key performance indicators.
              </Typography>
              <Box sx={{ height: 300, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={generateProjectTrendData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="progress" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Progress" />
                    <Area type="monotone" dataKey="budget" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Budget Utilization" />
                    <Area type="monotone" dataKey="dataCollection" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} name="Data Collection" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Last updated: Today at 09:45 AM</Typography>
                <Button size="small" startIcon={<UpdateIcon />}>Refresh</Button>
              </Box>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="h6">Dashboard Metrics</Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<UpdateIcon />}
                  sx={{ mr: 1 }}
                  onClick={() => refreshMetrics()}
                >
                  Refresh Data
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={addDashboardMetric}
                >
                  Add Metric
                </Button>
              </Box>
            </Box>
            
            {renderDashboardMetrics()}
            
            <Box sx={{ mt: 4, textAlign: 'right' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={grantData.trackingEnabled || false}
                    onChange={(e) => updateGrantData({ trackingEnabled: e.target.checked })}
                  />
                }
                label="Enable real-time tracking"
              />
              
              {grantData.trackingEnabled && (
                <FormControl size="small" sx={{ ml: 2, minWidth: 120 }}>
                  <InputLabel>Update Frequency</InputLabel>
                  <Select
                    value={grantData.trackingFrequency || 'daily'}
                    label="Update Frequency"
                    onChange={(e) => updateGrantData({ 
                      trackingFrequency: e.target.value as 'hourly' | 'daily' | 'weekly'
                    })}
                    size="small"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
        )}
        
        {tabIndex === 1 && (
          <Box>
            {/* Report analytics visualization */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Report Analytics</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Distribution of automated reports by type and delivery frequency.
                  </Typography>
                </Box>
                <Chip 
                  label={`${reportTemplates.length} Total Reports`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" textAlign="center" gutterBottom>Reports by Type</Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'PDF', value: reportTemplates.filter(r => r.format === 'pdf').length || 1 },
                            { name: 'Dashboard', value: reportTemplates.filter(r => r.format === 'dashboard').length || 1 },
                            { name: 'Excel', value: reportTemplates.filter(r => r.format === 'excel').length || 0 },
                            { name: 'Other', value: reportTemplates.filter(r => !['pdf', 'dashboard', 'excel'].includes(r.format)).length || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          <Cell fill="#d32f2f" />
                          <Cell fill="#2196f3" />
                          <Cell fill="#388e3c" />
                          <Cell fill="#ff9800" />
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" textAlign="center" gutterBottom>Reports by Frequency</Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { frequency: 'Daily', count: reportTemplates.filter(r => r.deliverySchedule?.frequency === 'daily').length || 0 },
                          { frequency: 'Weekly', count: reportTemplates.filter(r => r.deliverySchedule?.frequency === 'weekly').length || 1 },
                          { frequency: 'Monthly', count: reportTemplates.filter(r => r.deliverySchedule?.frequency === 'monthly').length || 1 },
                          { frequency: 'Quarterly', count: reportTemplates.filter(r => r.deliverySchedule?.frequency === 'quarterly').length || 1 },
                          { frequency: 'Annually', count: reportTemplates.filter(r => r.deliverySchedule?.frequency === 'annually').length || 0 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="frequency" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#3f51b5" name="Reports" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="h6">Automated Reports</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={addReportTemplate}
              >
                Create New Report
              </Button>
            </Box>
            
            {renderReportTemplates()}
            
            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="subtitle2">Automated Report Generation</Typography>
                <Typography variant="body2">
                  Reports will be automatically generated according to their schedule and sent to the specified recipients.
                  Contract deliverables will include notifications to ensure timely submission.
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}
        
        {tabIndex === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Set up notifications and alerts to keep stakeholders informed about important project events.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Milestone Notifications" />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      Automatically notify stakeholders when milestones are approaching or completed.
                    </Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Milestone approaching (7 days)"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Milestone completed"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Milestone delayed"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Report Reminders" />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      Send reminders for upcoming report deadlines and deliverables.
                    </Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Report due soon (14 days)"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Report due very soon (3 days)"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Report overdue"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Data Collection Alerts" />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      Get alerts about data collection issues or incomplete submissions.
                    </Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Missing data submissions"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Data quality issues detected"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Daily data collection summary"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="AI-Generated Insights" />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      Receive AI-generated insights and recommendations about your project.
                    </Typography>
                    
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Project trends and patterns"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Risk identification"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Performance improvement suggestions"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Entity collaboration visualization */}
            <Box sx={{ mt: 4, mb: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Entity Collaboration Analysis</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  AI analysis of contribution and coordination between collaborating entities.
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" textAlign="center" gutterBottom>Entity Contribution</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={generateEntityContributionData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={(entry) => entry.name}
                          >
                            {generateEntityContributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'][index % 5]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" textAlign="center" gutterBottom>Milestone Status</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={generateMilestoneStatusData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#8884d8" name="Milestones" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="contained"
                color="primary"
              >
                Save Notification Settings
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
