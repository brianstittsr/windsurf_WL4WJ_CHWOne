'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Assessment,
  Description,
  GetApp,
  MoreVert,
  Add,
  Visibility,
  Delete,
  History,
  Update
} from '@mui/icons-material';
import { Project, ProjectReport } from '@/types/platform.types';
import ProjectReportGenerator from './ProjectReportGenerator';

interface ProjectReportsProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
}

export default function ProjectReports({ project, onUpdateProject }: ProjectReportsProps) {
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Initialize reports array if it doesn't exist
  const reports = project.reports || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, reportId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveReportId(reportId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveReportId(null);
  };

  const handleViewReport = (report: ProjectReport) => {
    setSelectedReport(report);
    setShowReportPreview(true);
    handleMenuClose();
  };

  const handleDeleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    const updatedProject = {
      ...project,
      reports: updatedReports
    };
    onUpdateProject(updatedProject);
    handleMenuClose();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment /> Project Reports
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowReportGenerator(true)}
            size="small"
          >
            Create Report
          </Button>
        </Box>

        {reports.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No reports have been created for this project yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => setShowReportGenerator(true)}
            >
              Create New Report
            </Button>
          </Box>
        ) : (
          <List>
            {reports.map((report) => (
              <React.Fragment key={report.id}>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {report.title}
                        {report.version > 1 && (
                          <Chip 
                            label={`v${report.version}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {report.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created {formatDate(report.createdAt)} • Updated {formatDate(report.updatedAt)}
                        </Typography>
                        {report.usedAttachments && report.usedAttachments.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Used {report.usedAttachments.length} attachment{report.usedAttachments.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {report.fileUrl && (
                      <Tooltip title="Download">
                        <Box component="span" sx={{ display: 'inline-block' }}>
                          <IconButton edge="end" aria-label="download" onClick={() => window.open(report.fileUrl, '_blank')}>
                            <GetApp />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    )}
                    <Tooltip title="View">
                      <IconButton edge="end" aria-label="view" onClick={() => handleViewReport(report)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      edge="end" 
                      aria-label="more" 
                      onClick={(e) => handleMenuOpen(e, report.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      {/* Report Generator Dialog */}
      <Dialog 
        open={showReportGenerator} 
        onClose={() => setShowReportGenerator(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <ProjectReportGenerator 
          project={project} 
          onUpdateProject={onUpdateProject} 
          onClose={() => setShowReportGenerator(false)} 
        />
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog
        open={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedReport?.title}</DialogTitle>
        <DialogContent>
          <iframe
            src={selectedReport?.fileUrl || '/mock-report.pdf'}
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title="Report Preview"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportPreview(false)}>Close</Button>
          {selectedReport?.fileUrl && (
            <Button 
              variant="contained" 
              startIcon={<GetApp />}
              onClick={() => window.open(selectedReport.fileUrl, '_blank')}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Report Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const report = reports.find(r => r.id === activeReportId);
          if (report) handleViewReport(report);
        }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Create a new version of the report
          const report = reports.find(r => r.id === activeReportId);
          if (report) {
            setSelectedReport(report);
            setShowReportGenerator(true);
            handleMenuClose();
          }
        }}>
          <ListItemIcon>
            <Update fontSize="small" />
          </ListItemIcon>
          <ListItemText>Update Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // View version history
          handleMenuClose();
        }}>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>Version History</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (activeReportId) handleDeleteReport(activeReportId);
        }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Report</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}
