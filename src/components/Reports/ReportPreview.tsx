'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Report, ReportSection, Visualization } from '@/types/bmad.types';
import { reportGenerationService } from '@/services/bmad/ReportGenerationService';

interface ReportPreviewProps {
  report: Report;
  onEdit: () => void;
  onClose: () => void;
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

export default function ReportPreview({
  report,
  onEdit,
  onClose
}: ReportPreviewProps) {
  const [tabValue, setTabValue] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleExportToPdf = async () => {
    setExportLoading(true);
    setExportError(null);
    
    try {
      const pdfUrl = await reportGenerationService.exportToPdf(report);
      setExportUrl(pdfUrl);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportError(`Failed to export to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExportLoading(false);
    }
  };
  
  const renderSectionContent = (section: ReportSection) => {
    switch (section.type) {
      case 'text':
        return (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {section.content}
          </Typography>
        );
      
      case 'visualization':
        const visualization = report.config.visualizations?.find(v => v.id === section.visualizationId);
        if (!visualization) {
          return (
            <Alert severity="warning">
              Visualization not found
            </Alert>
          );
        }
        return renderVisualization(visualization);
      
      case 'table':
        if (!section.tableData || !section.tableColumns) {
          return (
            <Alert severity="warning">
              Table data not found
            </Alert>
          );
        }
        return (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {section.tableColumns.map((column, index) => (
                    <th key={index} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {section.tableColumns!.map((column, colIndex) => (
                      <td key={colIndex} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        {String(row[column] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        );
      
      case 'summary':
        return (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1">
              {section.content}
            </Typography>
          </Box>
        );
      
      default:
        return (
          <Alert severity="info">
            Unknown section type: {section.type}
          </Alert>
        );
    }
  };
  
  const renderVisualization = (visualization: Visualization) => {
    // In a real implementation, we would use Chart.js or another library
    // For now, we'll just render a placeholder
    return (
      <Box 
        sx={{ 
          height: 300, 
          bgcolor: 'background.default', 
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          {visualization.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {visualization.description || `${visualization.type.charAt(0).toUpperCase() + visualization.type.slice(1)} chart`}
        </Typography>
        
        <Box 
          sx={{ 
            width: '100%', 
            height: 200, 
            bgcolor: 'action.hover',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {visualization.type.toUpperCase()} Chart Visualization
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {visualization.dimensions?.map((dim, index) => (
            <Chip key={index} label={dim} size="small" color="primary" variant="outlined" />
          ))}
          
          {visualization.measures?.map((measure, index) => (
            <Chip key={index} label={measure} size="small" color="secondary" variant="outlined" />
          ))}
        </Box>
      </Box>
    );
  };
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {report.config.title || 'Untitled Report'}
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit Report">
              <IconButton onClick={onEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export to PDF">
              <IconButton 
                onClick={handleExportToPdf}
                disabled={exportLoading}
              >
                {exportLoading ? <CircularProgress size={24} /> : <PdfIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share Report">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        
        {report.config.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {report.config.description}
          </Typography>
        )}
        
        {exportError && (
          <Alert severity="error" onClose={() => setExportError(null)} sx={{ mb: 2 }}>
            {exportError}
          </Alert>
        )}
        
        {exportUrl && (
          <Alert 
            severity="success" 
            onClose={() => setExportUrl(null)} 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                startIcon={<DownloadIcon />}
                href={exportUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </Button>
            }
          >
            PDF export successful!
          </Alert>
        )}
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Preview" id="report-tab-0" aria-controls="report-tabpanel-0" />
          <Tab label="Details" id="report-tab-1" aria-controls="report-tabpanel-1" />
        </Tabs>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          {report.status === 'generating' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">
                Generating Report...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a few moments
              </Typography>
            </Box>
          ) : report.status === 'error' ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {report.error || 'An error occurred while generating the report'}
            </Alert>
          ) : report.generatedContent ? (
            <Box sx={{ p: 2 }}>
              {report.config.sections?.map((section, index) => (
                <Box key={section.id} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {section.title}
                  </Typography>
                  
                  {renderSectionContent(section)}
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No report content available
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Details
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={report.status.toUpperCase()} 
                color={
                  report.status === 'complete' ? 'success' :
                  report.status === 'generating' ? 'info' :
                  report.status === 'error' ? 'error' :
                  'default'
                }
                sx={{ ml: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {new Date(report.createdAt).toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(report.updatedAt).toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Datasets
              </Typography>
              <Box sx={{ mt: 1 }}>
                {report.config.datasets && report.config.datasets.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {report.config.datasets.map((datasetId, index) => (
                      <Chip key={index} label={`Dataset ${index + 1}`} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No datasets specified
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Sections
              </Typography>
              <Box sx={{ mt: 1 }}>
                {report.config.sections && report.config.sections.length > 0 ? (
                  <Stack spacing={1}>
                    {report.config.sections.map((section, index) => (
                      <Chip 
                        key={index} 
                        label={`${index + 1}. ${section.title}`} 
                        icon={<VisibilityIcon />}
                        onClick={() => {
                          setTabValue(0); // Switch to preview tab
                          // In a real implementation, we would scroll to the section
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No sections defined
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
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
