'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { ReportTemplate } from '@/types/grant.types';

interface ReportSchedulerProps {
  reportTemplates: ReportTemplate[];
  onAddReport: (report: ReportTemplate) => void;
  onDeleteReport: (reportId: string) => void;
  onUpdateReport: (report: ReportTemplate) => void;
}

export function ReportScheduler({ 
  reportTemplates, 
  onAddReport, 
  onDeleteReport, 
  onUpdateReport 
}: ReportSchedulerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [reportForm, setReportForm] = useState<Partial<ReportTemplate>>({
    id: '',
    name: '',
    description: '',
    format: 'pdf',
    sections: [],
    deliverySchedule: {
      frequency: 'monthly',
      recipients: []
    },
    contractDeliverable: false
  });
  
  // Helper function to generate new report section based on standards
  const generateNewSection = () => ({
    id: `section-${Date.now()}`,
    title: 'New Section',
    description: 'Enter description here',
    dataSource: 'project_milestones',
    visualizationType: 'chart' as 'text' | 'table' | 'chart' | 'metric',
    chartType: 'bar' as 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  });
  
  // Open create/edit dialog with standardized templates
  const openReportDialog = (report?: ReportTemplate) => {
    if (report) {
      setReportForm({...report});
      setSelectedReport(report);
    } else {
      // Create new report template with standardized sections
      setReportForm({
        id: `report-${Date.now()}`,
        name: 'Quarterly Performance Report',
        description: 'Standardized performance report covering key metrics and outcomes',
        format: 'pdf',
        sections: [
          {
            id: `section-${Date.now()}-1`,
            title: 'Executive Summary',
            description: 'Overview of key findings and recommendations',
            dataSource: 'ai_analysis',
            visualizationType: 'text'
          },
          {
            id: `section-${Date.now()}-2`,
            title: 'Milestone Progress',
            description: 'Status of project milestones and timeline adherence',
            dataSource: 'project_milestones',
            visualizationType: 'chart',
            chartType: 'bar'
          },
          {
            id: `section-${Date.now()}-3`,
            title: 'Budget Utilization',
            description: 'Financial performance against projections',
            dataSource: 'budget_data',
            visualizationType: 'chart',
            chartType: 'line'
          },
          {
            id: `section-${Date.now()}-4`,
            title: 'Participant Demographics',
            description: 'Breakdown of program participants by key demographics',
            dataSource: 'form_submissions',
            visualizationType: 'chart',
            chartType: 'pie'
          },
          {
            id: `section-${Date.now()}-5`,
            title: 'Key Performance Indicators',
            description: 'Metrics tracking for core program objectives',
            dataSource: 'performance_metrics',
            visualizationType: 'table'
          }
        ],
        deliverySchedule: {
          frequency: 'quarterly',
          recipients: ['Program Director', 'Funding Agency Representative']
        },
        contractDeliverable: true
      });
      setSelectedReport(null);
    }
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Save report
  const handleSaveReport = () => {
    if (!reportForm.name || !reportForm.deliverySchedule) {
      return; // Don't save if required fields are missing
    }
    
    const completeReport = reportForm as ReportTemplate;
    
    if (selectedReport) {
      onUpdateReport(completeReport);
    } else {
      onAddReport(completeReport);
    }
    
    handleCloseDialog();
  };
  
  // Update report form
  const handleFormChange = (field: string, value: any) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update delivery schedule
  const handleScheduleChange = (field: string, value: any) => {
    setReportForm(prev => ({
      ...prev,
      deliverySchedule: {
        ...prev.deliverySchedule!,
        [field]: value
      }
    }));
  };
  
  // Add a new section to the report
  const handleAddSection = () => {
    setReportForm(prev => ({
      ...prev,
      sections: [...(prev.sections || []), generateNewSection()]
    }));
  };
  
  // Delete a section from the report
  const handleDeleteSection = (sectionId: string) => {
    setReportForm(prev => ({
      ...prev,
      sections: prev.sections?.filter(section => section.id !== sectionId)
    }));
  };
  
  // Update a section in the report
  const handleUpdateSection = (sectionId: string, field: string, value: any) => {
    setReportForm(prev => ({
      ...prev,
      sections: prev.sections?.map(section => 
        section.id === sectionId ? {...section, [field]: value} : section
      )
    }));
  };
  
  // Format the frequency for display
  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };
  
  // Get the icon for the report format
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <PdfIcon fontSize="small" />;
      case 'dashboard':
        return <DashboardIcon fontSize="small" />;
      case 'excel':
        return <FileIcon fontSize="small" />;
      default:
        return <FileIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScheduleIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Scheduled Reports</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => openReportDialog()}
        >
          Create New Report
        </Button>
      </Box>
      
      {reportTemplates.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No scheduled reports have been created yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first report to automatically generate and deliver project insights.
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => openReportDialog()}
          >
            Create Report
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Report Name</strong></TableCell>
                <TableCell><strong>Format</strong></TableCell>
                <TableCell><strong>Frequency</strong></TableCell>
                <TableCell><strong>Recipients</strong></TableCell>
                <TableCell><strong>Contract Deliverable</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportTemplates.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{report.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{report.description}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getFormatIcon(report.format)}
                      label={report.format.toUpperCase()}
                      size="small"
                      color={report.format === 'pdf' ? 'error' : 
                             report.format === 'dashboard' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatFrequency(report.deliverySchedule.frequency)}</TableCell>
                  <TableCell>
                    {report.deliverySchedule.recipients.length > 0 ? (
                      <Chip 
                        icon={<EmailIcon fontSize="small" />}
                        label={`${report.deliverySchedule.recipients.length} recipient${report.deliverySchedule.recipients.length > 1 ? 's' : ''}`}
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">No recipients</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.contractDeliverable ? (
                      <Chip label="Required" color="warning" size="small" />
                    ) : (
                      <Chip label="Optional" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <IconButton size="small" onClick={() => openReportDialog(report)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDeleteReport(report.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Create/Edit Report Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedReport ? 'Edit Report' : 'Create New Report'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Name"
                required
                value={reportForm.name || ''}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={reportForm.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Report Format</InputLabel>
                <Select
                  value={reportForm.format}
                  label="Report Format"
                  onChange={(e: SelectChangeEvent) => handleFormChange('format', e.target.value)}
                >
                  <MenuItem value="pdf">PDF Document</MenuItem>
                  <MenuItem value="dashboard">Interactive Dashboard</MenuItem>
                  <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                  <MenuItem value="presentation">Presentation Slides</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Frequency</InputLabel>
                <Select
                  value={reportForm.deliverySchedule?.frequency || 'monthly'}
                  label="Delivery Frequency"
                  onChange={(e: SelectChangeEvent) => handleScheduleChange('frequency', e.target.value)}
                >
                  <MenuItem value="once">One-time Only</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={['Project Manager', 'Grant Administrator', 'Evaluator', 'Stakeholder', 'Partner Organization']}
                value={reportForm.deliverySchedule?.recipients || []}
                onChange={(_, value) => handleScheduleChange('recipients', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    // getTagProps already includes a key prop
                    const tagProps = getTagProps({ index });
                    return (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recipients"
                    placeholder="Add recipient"
                    helperText="Enter email addresses or select from suggestions"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reportForm.contractDeliverable || false}
                    onChange={(e) => handleFormChange('contractDeliverable', e.target.checked)}
                  />
                }
                label="Contract Deliverable (required by funding agency)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Report Sections</Typography>
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={handleAddSection}
                >
                  Add Section
                </Button>
              </Box>
              
              {reportForm.sections?.map((section, index) => (
                <Paper key={section.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Section {index + 1}</Typography>
                    <IconButton size="small" onClick={() => handleDeleteSection(section.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Section Title"
                        value={section.title || ''}
                        onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={section.description || ''}
                        onChange={(e) => handleUpdateSection(section.id, 'description', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Data Source</InputLabel>
                        <Select
                          value={section.dataSource}
                          label="Data Source"
                          onChange={(e) => handleUpdateSection(section.id, 'dataSource', e.target.value)}
                        >
                          <MenuItem value="project_milestones">Project Milestones</MenuItem>
                          <MenuItem value="form_submissions">Form Submissions</MenuItem>
                          <MenuItem value="budget_data">Budget Data</MenuItem>
                          <MenuItem value="entity_activities">Entity Activities</MenuItem>
                          <MenuItem value="manual_entry">Manual Entry</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Visualization Type</InputLabel>
                        <Select
                          value={section.visualizationType || 'text'}
                          label="Visualization Type"
                          onChange={(e) => handleUpdateSection(section.id, 'visualizationType', e.target.value)}
                        >
                          <MenuItem value="text">Text Content</MenuItem>
                          <MenuItem value="chart">Chart</MenuItem>
                          <MenuItem value="table">Table</MenuItem>
                          <MenuItem value="metric">Metrics</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {section.visualizationType === 'chart' && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Chart Type</InputLabel>
                          <Select
                            value={section.chartType || 'bar'}
                            label="Chart Type"
                            onChange={(e) => handleUpdateSection(section.id, 'chartType', e.target.value)}
                          >
                            <MenuItem value="line">Line Chart</MenuItem>
                            <MenuItem value="bar">Bar Chart</MenuItem>
                            <MenuItem value="pie">Pie Chart</MenuItem>
                            <MenuItem value="scatter">Scatter Plot</MenuItem>
                            <MenuItem value="area">Area Chart</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              ))}
              
              {(!reportForm.sections || reportForm.sections.length === 0) && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No sections added yet. Click "Add Section" to create a report section.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveReport}
            disabled={!reportForm.name}
          >
            {selectedReport ? 'Update Report' : 'Create Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
