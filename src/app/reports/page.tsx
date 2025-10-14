'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Dialog, 
  DialogContent,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { 
  Add as AddIcon, 
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import ConversationInterface from '@/components/Reports/ConversationInterface';
import ReportPreview from '@/components/Reports/ReportPreview';
import { Report, ReportConfig } from '@/types/bmad.types';
import { reportGenerationService } from '@/services/bmad/ReportGenerationService';
import { v4 as uuidv4 } from 'uuid';

// Mock reports for development
const mockReports: Report[] = [
  {
    id: 'report-1',
    config: {
      id: 'config-1',
      title: 'CHW Performance Analysis',
      description: 'Analysis of community health worker performance metrics',
      datasets: ['dataset-1'],
      sections: [
        {
          id: 'section-1',
          title: 'Executive Summary',
          content: 'This report analyzes the performance of community health workers based on key metrics including clients served, hours worked, and client satisfaction scores.',
          type: 'text',
          order: 0
        },
        {
          id: 'section-2',
          title: 'Performance Metrics',
          type: 'visualization',
          order: 1,
          visualizationId: 'viz-1'
        },
        {
          id: 'section-3',
          title: 'Key Findings',
          content: 'Based on the analysis, we found that CHWs who spent more time with fewer clients had higher satisfaction scores overall. The average satisfaction score was 4.2 out of 5.',
          type: 'summary',
          order: 2
        }
      ],
      visualizations: [
        {
          id: 'viz-1',
          type: 'bar',
          title: 'Average Clients Served per Month',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [
              {
                label: 'Clients Served',
                data: [42, 45, 48, 46, 52]
              }
            ]
          },
          datasetId: 'dataset-1',
          dimensions: ['month'],
          measures: ['clients_served']
        }
      ],
      status: 'complete',
      createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
      updatedAt: new Date(Date.now() - 86400000 * 5)
    },
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    userId: 'user-1',
    status: 'complete',
    pdfUrl: 'https://example.com/reports/report-1.pdf'
  },
  {
    id: 'report-2',
    config: {
      id: 'config-2',
      title: 'Community Health Needs Assessment',
      description: 'Analysis of community survey results and health outcomes',
      datasets: ['dataset-2', 'dataset-3'],
      sections: [
        {
          id: 'section-1',
          title: 'Introduction',
          content: 'This report presents the findings from our community health needs assessment survey combined with client health outcome data.',
          type: 'text',
          order: 0
        },
        {
          id: 'section-2',
          title: 'Survey Results',
          type: 'visualization',
          order: 1,
          visualizationId: 'viz-1'
        },
        {
          id: 'section-3',
          title: 'Health Outcomes by Region',
          type: 'visualization',
          order: 2,
          visualizationId: 'viz-2'
        }
      ],
      visualizations: [
        {
          id: 'viz-1',
          type: 'pie',
          title: 'Healthcare Access Scores',
          data: {
            labels: ['Low (1-3)', 'Medium (4-7)', 'High (8-10)'],
            datasets: [
              {
                data: [25, 45, 30]
              }
            ]
          },
          datasetId: 'dataset-3',
          dimensions: ['healthcare_access_score'],
          measures: ['count']
        },
        {
          id: 'viz-2',
          type: 'bar',
          title: 'Blood Pressure by Zip Code',
          data: {
            labels: ['28202', '28205', '28208', '28210'],
            datasets: [
              {
                label: 'Systolic',
                data: [125, 128, 132, 124]
              },
              {
                label: 'Diastolic',
                data: [82, 84, 86, 80]
              }
            ]
          },
          datasetId: 'dataset-2',
          dimensions: ['zip_code'],
          measures: ['blood_pressure_systolic', 'blood_pressure_diastolic']
        }
      ],
      status: 'complete',
      createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
      updatedAt: new Date(Date.now() - 86400000 * 8) // 8 days ago
    },
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 8),
    userId: 'user-1',
    status: 'complete',
    pdfUrl: 'https://example.com/reports/report-2.pdf'
  }
];

// Mock dataset IDs for development
const mockDatasetIds = ['dataset-1', 'dataset-2', 'dataset-3'];

// Inner component that uses the auth context
function ReportsContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        // In a real implementation, we would fetch from a database
        // For now, we'll use mock data
        setReports(mockReports);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError(`Failed to load reports: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleConfigUpdate = (config: ReportConfig) => {
    setReportConfig(config);
  };
  
  const handleGenerateReport = async (config: ReportConfig) => {
    try {
      // Create a new report
      const newReport: Report = {
        id: uuidv4(),
        config: {
          ...config,
          status: 'generating',
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: currentUser?.uid || 'unknown',
        status: 'generating'
      };
      
      // Add to reports list
      setReports(prev => [newReport, ...prev]);
      
      // Close create dialog
      setShowCreateDialog(false);
      
      // Show notification
      setNotification({
        message: 'Report generation started',
        severity: 'info'
      });
      
      // In a real implementation, we would call the report generation service
      // For now, we'll simulate a delay and then update the report status
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === newReport.id 
            ? {
                ...r,
                status: 'complete',
                config: {
                  ...r.config,
                  status: 'complete',
                  updatedAt: new Date()
                },
                updatedAt: new Date(),
                pdfUrl: `https://example.com/reports/${r.id}.pdf`
              }
            : r
        ));
        
        setNotification({
          message: 'Report generated successfully',
          severity: 'success'
        });
      }, 3000);
    } catch (err) {
      console.error('Error generating report:', err);
      setNotification({
        message: `Failed to generate report: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };
  
  const handleDeleteReport = (report: Report) => {
    // In a real implementation, we would delete from a database
    setReports(prev => prev.filter(r => r.id !== report.id));
    setNotification({
      message: `Report "${report.config.title}" deleted`,
      severity: 'info'
    });
  };
  
  const handleEditReport = (report: Report) => {
    // In a real implementation, we would show an edit dialog
    setNotification({
      message: `Report editing not implemented yet`,
      severity: 'info'
    });
  };
  
  const handleShareReport = (report: Report) => {
    // In a real implementation, we would show a share dialog
    setNotification({
      message: `Report sharing not implemented yet`,
      severity: 'info'
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (authLoading) {
    return <AnimatedLoading message="Loading Reports..." />;
  }
  
  if (!currentUser) {
    return (
      <UnifiedLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="warning">
            Please log in to access reports
          </Alert>
        </Box>
      </UnifiedLayout>
    );
  }
  
  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Create Report
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="All Reports" id="reports-tab-0" aria-controls="reports-tabpanel-0" />
          <Tab label="My Reports" id="reports-tab-1" aria-controls="reports-tabpanel-1" />
          <Tab label="Shared with Me" id="reports-tab-2" aria-controls="reports-tabpanel-2" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box role="tabpanel" hidden={tabValue !== 0} id="reports-tabpanel-0" aria-labelledby="reports-tab-0">
          <Grid container spacing={3}>
            {reports.length > 0 ? (
              reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
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
                          {report.config.title || 'Untitled Report'}
                        </Typography>
                        
                        <Chip 
                          label={report.status.toUpperCase()} 
                          color={
                            report.status === 'complete' ? 'success' :
                            report.status === 'generating' ? 'info' :
                            report.status === 'error' ? 'error' :
                            'default'
                          }
                          size="small"
                        />
                      </Box>
                      
                      {report.config.description && (
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
                          {report.config.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {report.config.datasets?.map((datasetId, index) => (
                          <Chip 
                            key={index} 
                            label={`Dataset ${index + 1}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(report.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Updated: {formatDate(report.updatedAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions>
                      <Tooltip title="View Report">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewReport(report)}
                          disabled={report.status === 'generating'}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Report">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditReport(report)}
                          disabled={report.status === 'generating'}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Share Report">
                        <IconButton 
                          size="small" 
                          onClick={() => handleShareReport(report)}
                          disabled={report.status === 'generating'}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Box sx={{ flexGrow: 1 }} />
                      
                      {report.pdfUrl && (
                        <Tooltip title="Download PDF">
                          <IconButton 
                            size="small" 
                            component="a" 
                            href={report.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <PdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Delete Report">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteReport(report)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No reports available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Create a report to get started
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {/* Create Report Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, height: 600 }}>
          <ConversationInterface
            onConfigUpdate={handleConfigUpdate}
            onGenerateReport={handleGenerateReport}
            availableDatasetIds={mockDatasetIds}
          />
        </DialogContent>
      </Dialog>
      
      {/* Report Preview Dialog */}
      <Dialog 
        open={!!selectedReport} 
        onClose={() => setSelectedReport(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedReport ? (
            <ReportPreview
              report={selectedReport}
              onEdit={() => {
                setSelectedReport(null);
                setReportConfig(selectedReport.config);
                setShowCreateDialog(true);
              }}
              onClose={() => setSelectedReport(null)}
            />
          ) : <></>}
        </DialogContent>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification ? (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : <></>}
      </Snackbar>
      </Box>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function ReportsPage() {
  return (
    <AuthProvider>
      <ReportsContent />
    </AuthProvider>
  );
}
