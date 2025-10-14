'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Description,
  Send,
  Assessment,
  AttachFile,
  CheckCircle,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  GetApp,
  Save,
  Refresh,
  CloudDownload
} from '@mui/icons-material';
import { Project, ProjectAttachment, ProjectReport } from '@/types/platform.types';
import { useAuth } from '@/contexts/AuthContext';
import { bmadAgentService } from '@/services/bmad/BmadAgentService';
import { BmadAgentType, ReportConfig } from '@/types/bmad.types';

interface ProjectReportGeneratorProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onClose: () => void;
}

export default function ProjectReportGenerator({ project, onUpdateProject, onClose }: ProjectReportGeneratorProps) {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  type MessageRole = 'user' | 'assistant';
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ProjectReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportProgress, setReportProgress] = useState(0);
  const [showReportPreview, setShowReportPreview] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize with a welcome message
  useEffect(() => {
    setConversation([{
      role: 'assistant' as MessageRole,
      content: "Hello! I'm your BMAD Analyst assistant. I'll help you create a comprehensive report for this project. What specific aspects of the project would you like to focus on in this report?"
    }]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Get project attachments
  const attachments = project.attachments || [];

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Add user message to conversation
    const updatedConversation = [...conversation, { role: 'user' as MessageRole, content: userMessage }];
    setConversation(updatedConversation);
    setLoading(true);
    
    try {
      // Prepare context about the project and selected attachments
      let context = `Project: ${project.name}\nDescription: ${project.description}\n`;
      context += `Goals: ${project.goals.join(', ')}\n`;
      context += `Timeline: ${project.startDate.toLocaleDateString()} to ${project.endDate ? project.endDate.toLocaleDateString() : 'ongoing'}\n`;
      
      if (selectedAttachments.length > 0) {
        context += `\nSelected attachments for analysis:\n`;
        selectedAttachments.forEach(id => {
          const attachment = attachments.find(a => a.id === id);
          if (attachment) {
            context += `- ${attachment.fileName} (${attachment.description || 'No description'})\n`;
          }
        });
      }
      
      // Prepare request for BMAD agent
      const request = {
        message: `${context}\n\nUser message: ${userMessage}`,
        currentConfig: reportConfig || {
          title: reportTitle || project.name + ' Report',
          description: reportDescription || `Report for ${project.name}`,
          status: 'draft'
        }
      };
      
      // Call BMAD agent
      const response = await bmadAgentService.processInput(request);
      
      // Update report config if provided
      if (response.updatedConfig) {
        setReportConfig(response.updatedConfig);
      }
      
      // Add assistant response to conversation
      if (response.message) {
        setConversation([...updatedConversation, { role: 'assistant' as MessageRole, content: response.message }]);
      } else {
        setConversation([...updatedConversation, { role: 'assistant' as MessageRole, content: "I've updated the report configuration based on your input." }]);
      }
      
      // Clear user message
      setUserMessage('');
    } catch (error) {
      console.error('Error processing message:', error);
      setError('Failed to process your message. Please try again.');
      
      // Add error message to conversation
      setConversation([...updatedConversation, { 
        role: 'assistant' as MessageRole, 
        content: "I'm sorry, I encountered an error processing your request. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportConfig || !currentUser) return;
    
    setGeneratingReport(true);
    setReportProgress(0);
    
    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setReportProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);
      
      // Call BMAD agent to generate report
      const response = await bmadAgentService.startReportGeneration(reportConfig);
      
      // Simulate report generation (in a real app, this would be a background process)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setReportProgress(100);
      
      // Create a new report object
      const newReport: ProjectReport = {
        id: `report-${Date.now()}`,
        title: reportConfig.title || `${project.name} Report`,
        description: reportConfig.description || '',
        createdBy: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'complete',
        version: 1,
        usedAttachments: selectedAttachments,
        reportConfig: reportConfig,
        fileUrl: '/mock-report.pdf' // In a real app, this would be a generated PDF URL
      };
      
      // Update project with new report
      const updatedReports = [...(project.reports || []), newReport];
      const updatedProject = {
        ...project,
        reports: updatedReports
      };
      
      onUpdateProject(updatedProject);
      setGeneratedReport(newReport);
      
      // Add completion message to conversation
      setConversation([...conversation, { 
        role: 'assistant', 
        content: "I've successfully generated your report! You can now download it or view it online." 
      }]);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
      
      // Add error message to conversation
      setConversation([...conversation, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error generating your report. Please try again." 
      }]);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleAttachmentToggle = (attachmentId: string) => {
    setSelectedAttachments(prev => 
      prev.includes(attachmentId)
        ? prev.filter(id => id !== attachmentId)
        : [...prev, attachmentId]
    );
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const steps = ['Define Report', 'Select Data Sources', 'Chat with BMAD Analyst', 'Generate Report'];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Create Project Report with BMAD Analyst</Typography>
        <Typography variant="body2" color="text.secondary">
          Our AI assistant will guide you through creating a comprehensive report
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 2, px: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        {activeStep === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Define Your Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by providing basic information about the report you want to create
              </Typography>
              
              <TextField
                fullWidth
                label="Report Title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder={`${project.name} Report`}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Report Description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the purpose and scope of this report"
                multiline
                rows={3}
              />
            </CardContent>
          </Card>
        )}
        
        {activeStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Data Sources
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose files and attachments to include in your report analysis
              </Typography>
              
              {attachments.length === 0 ? (
                <Alert severity="info">
                  This project doesn&apos;t have any attachments yet. You can still create a report without attachments.
                </Alert>
              ) : (
                <List>
                  {attachments.map((attachment) => (
                    <React.Fragment key={attachment.id}>
                      <ListItem>
                        <ListItemIcon>
                          {attachment.fileType.includes('pdf') ? <PictureAsPdf /> : 
                           attachment.fileType.includes('image') ? <Image /> : 
                           <InsertDriveFile />}
                        </ListItemIcon>
                        <ListItemText
                          primary={attachment.fileName}
                          secondary={attachment.description || 'No description'}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedAttachments.includes(attachment.id)}
                              onChange={() => handleAttachmentToggle(attachment.id)}
                            />
                          }
                          label="Include"
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeStep === 2 && (
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Chat with BMAD Analyst
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Describe what you want in your report and ask questions about your data
              </Typography>
              
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                mb: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider' 
              }}>
                {conversation.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: message.role === 'user' ? 'primary.light' : 'background.default',
                        color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
                
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" component="span">
                        Thinking...
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Message"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask about your report or provide specific requirements"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={3}
                  disabled={loading}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || loading}
                  startIcon={<Send />}
                >
                  Send
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {activeStep === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review your report configuration and generate the final report
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Report Details
                </Typography>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="subtitle2">Title</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {reportConfig?.title || reportTitle || `${project.name} Report`}
                  </Typography>
                  
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {reportConfig?.description || reportDescription || `Report for ${project.name}`}
                  </Typography>
                  
                  <Typography variant="subtitle2">Included Attachments</Typography>
                  {selectedAttachments.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedAttachments.map(id => {
                        const attachment = attachments.find(a => a.id === id);
                        return attachment ? (
                          <Chip 
                            key={id} 
                            label={attachment.fileName} 
                            size="small" 
                            icon={<AttachFile />} 
                          />
                        ) : null;
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2">No attachments included</Typography>
                  )}
                </Paper>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {generatingReport ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Generating report... {Math.round(reportProgress)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={reportProgress} />
                </Box>
              ) : generatedReport ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Report Generated Successfully!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your report is now available for download and has been saved to the project
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {generatedReport.fileUrl && (
                      <Button
                        variant="contained"
                        startIcon={<CloudDownload />}
                        href={generatedReport.fileUrl}
                        target="_blank"
                        download
                      >
                        Download Report
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<Description />}
                      onClick={() => setShowReportPreview(true)}
                    >
                      Preview Report
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Assessment />}
                  onClick={handleGenerateReport}
                  fullWidth
                  size="large"
                  sx={{ py: 1.5 }}
                >
                  Generate Report
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : generatedReport ? (
            <Button variant="contained" onClick={onClose}>
              Finish
            </Button>
          ) : null}
        </Box>
      </Box>
      
      {/* Report Preview Dialog */}
      <Dialog
        open={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          <iframe
            src="/mock-report.pdf"
            style={{ width: '100%', height: '70vh', border: 'none' }}
            title="Report Preview"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportPreview(false)}>Close</Button>
          {generatedReport?.fileUrl && (
            <Button 
              variant="contained" 
              startIcon={<GetApp />}
              href={generatedReport.fileUrl}
              target="_blank"
              download
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
