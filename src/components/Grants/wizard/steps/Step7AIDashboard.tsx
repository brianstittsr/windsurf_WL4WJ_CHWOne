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
  Stack
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
  InsertDriveFile as FileTextIcon
} from '@mui/icons-material';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import { DashboardMetric, ReportTemplate } from '@/types/grant.types';

export function Step7AIDashboard() {
  const { grantData, updateGrantData } = useGrantWizard();
  const [tabIndex, setTabIndex] = useState(0);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetric[]>(grantData.dashboardMetrics || []);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(grantData.reportTemplates || []);
  
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
                      value={Math.min(((metric.value as number / metric.target as number) * 100), 100)} 
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
                      <TableChart style={{ color: '#388e3c', marginRight: 8 }} />
                    ) : (
                      <Presentation style={{ color: '#ff9800', marginRight: 8 }} />
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
                  <IconButton size="small" onClick={() => deleteReportTemplate(report.id)}>
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

  return (
    <Box sx={{ mb: 4 }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="h6">Dashboard Metrics</Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<UpdateIcon />}
                  sx={{ mr: 1 }}
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
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
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

// Mock components for missing icons
function TableChart(props: any) {
  return <div style={props.style}>📊</div>;
}

function Presentation(props: any) {
  return <div style={props.style}>🎯</div>;
}
