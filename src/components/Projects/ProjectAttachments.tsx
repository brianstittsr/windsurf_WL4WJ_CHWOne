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
  TextField,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  AttachFile,
  Description,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  TableChart,
  Code,
  Delete,
  GetApp,
  Add,
  Edit,
  CloudUpload
} from '@mui/icons-material';
import { Project, ProjectAttachment } from '@/types/platform.types';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectAttachmentsProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
}

export default function ProjectAttachments({ project, onUpdateProject }: ProjectAttachmentsProps) {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [fileTags, setFileTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize attachments array if it doesn't exist
  const attachments = project.attachments || [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !currentUser) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // In a real app, you would upload to Firebase Storage or another service
      // This is a mock implementation
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create a new attachment object
      const newAttachment: ProjectAttachment = {
        id: `attachment-${Date.now()}`,
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
        fileSize: fileToUpload.size,
        uploadedBy: currentUser.uid,
        uploadedAt: new Date(),
        description: fileDescription,
        url: URL.createObjectURL(fileToUpload), // In a real app, this would be a Firebase Storage URL
        tags: fileTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };

      // Update the project with the new attachment
      const updatedProject = {
        ...project,
        attachments: [...attachments, newAttachment]
      };

      onUpdateProject(updatedProject);
      
      // Reset form
      setFileToUpload(null);
      setFileDescription('');
      setFileTags('');
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    const updatedAttachments = attachments.filter(attachment => attachment.id !== attachmentId);
    const updatedProject = {
      ...project,
      attachments: updatedAttachments
    };
    onUpdateProject(updatedProject);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PictureAsPdf color="error" />;
    if (fileType.includes('image')) return <Image color="primary" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <TableChart color="success" />;
    if (fileType.includes('word') || fileType.includes('document')) return <Description color="primary" />;
    if (fileType.includes('json') || fileType.includes('xml') || fileType.includes('html')) return <Code />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFile /> Project Attachments
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowUploadDialog(true)}
            size="small"
          >
            Add Attachment
          </Button>
        </Box>

        {attachments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No attachments added to this project yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => setShowUploadDialog(true)}
            >
              Upload File
            </Button>
          </Box>
        ) : (
          <List>
            {attachments.map((attachment) => (
              <React.Fragment key={attachment.id}>
                <ListItem>
                  <ListItemIcon>
                    {getFileIcon(attachment.fileType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={attachment.fileName}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {attachment.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(attachment.fileSize)} • Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {attachment.tags?.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Download">
                      <IconButton edge="end" aria-label="download" href={attachment.url} target="_blank" download={attachment.fileName}>
                        <GetApp />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAttachment(attachment.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Project Attachment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {fileToUpload ? (
              <Box sx={{ mb: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getFileIcon(fileToUpload.type)}
                  <Typography sx={{ ml: 1 }}>{fileToUpload.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(fileToUpload.size)}
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 5, border: '1px dashed', borderColor: 'divider' }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUpload sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
                  <Typography>Click to select file or drag and drop</Typography>
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                  />
                </Box>
              </Button>
            )}

            <TextField
              margin="normal"
              fullWidth
              label="Description"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Tags (comma separated)"
              value={fileTags}
              onChange={(e) => setFileTags(e.target.value)}
              placeholder="data, report, financial, etc."
            />

            {uploadError && (
              <Box sx={{ mt: 2 }}>
                <Typography color="error">{uploadError}</Typography>
              </Box>
            )}

            {uploading && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <CircularProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!fileToUpload || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
