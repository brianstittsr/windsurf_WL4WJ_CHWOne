'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { s3Service } from '@/services/s3Service';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  s3Key: string;
  uploadedAt: Date;
  category: string;
  tags: string[];
}

interface FileUploadProps {
  organization?: 'region5' | 'wl4wj' | 'general';
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export default function FileUpload({
  organization = 'general',
  maxFileSize = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  onUploadComplete
}: FileUploadProps) {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState('');
  const [fileTags, setFileTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return false;
      }

      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type);
      });

      if (!isAllowed) {
        setError(`File type not allowed for ${file.name}. Allowed types: ${allowedTypes.join(', ')}`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon color="primary" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <DescriptionIcon color="error" />;
    }
    return <FileIcon color="action" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File, category: string, tags: string[]): Promise<UploadedFile> => {
    if (!currentUser) {
      const error = new Error('User must be logged in to upload files');
      setError(error.message);
      throw error;
    }

    try {
      const uploadOptions = {
        organization: organization as 'general' | 'region5' | 'wl4wj',
        category,
        tags,
        uploadedBy: currentUser.uid,
      };

      const result = await s3Service.uploadFile(file, uploadOptions);

      // Save file metadata to Firestore
      const fileDoc = await addDoc(collection(db, 'files'), {
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        mimeType: file.type,
        url: result.url,
        s3Key: result.key,
        s3Bucket: s3Service.getBucketInfo().name,
        storageType: 's3',
        category,
        tags,
        organization,
        uploadedBy: currentUser.uid,
        uploadedAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        permissions: {
          isPublic: false,
          allowDownload: true,
        },
        metadata: {
          checksum: '', // Would calculate this in production
          encoding: 'utf-8',
        },
        version: 1,
      });

      const uploadedFile: UploadedFile = {
        id: fileDoc.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.url,
        s3Key: result.key,
        uploadedAt: new Date(),
        category,
        tags
      };

      return uploadedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');
    const newUploadedFiles: UploadedFile[] = [];

    try {
      for (const file of files) {
        // Open dialog for file metadata
        setSelectedFile(file);
        setFileCategory('');
        setFileTags([]);
        setDialogOpen(true);

        // Wait for user to submit metadata
        await new Promise<void>((resolve) => {
          const handleDialogClose = () => {
            setDialogOpen(false);
            resolve();
          };

          // Override the dialog close handler temporarily
          const originalClose = () => setDialogOpen(false);
          setDialogOpen(true);
        });

        if (fileCategory) {
          const uploadedFile = await uploadFile(file, fileCategory, fileTags);
          newUploadedFiles.push(uploadedFile);
        }
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      setFiles([]);
      setSuccess(`Successfully uploaded ${newUploadedFiles.length} file(s)`);
      onUploadComplete?.(newUploadedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleDeleteFile = async (fileId: string, s3Key: string) => {
    try {
      // Delete from S3
      await s3Service.deleteFile(s3Key);

      // Delete from Firestore
      // Note: You would need to implement this with a deleteDoc call
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      setSuccess('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file');
    }
  };

  return (
    <Box>
      {/* Upload Area */}
      <Card
        sx={{
          border: '2px dashed',
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.action.hover,
          mb: 3
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Drag & drop files here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Maximum file size: {maxFileSize}MB. Allowed types: {allowedTypes.join(', ')}
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Files to Upload ({files.length})
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getFileIcon(file.name)}
                  </Box>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  {uploadProgress[file.name] && (
                    <Box sx={{ minWidth: 100, mr: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress[file.name]}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
                size="large"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Uploaded Files ({uploadedFiles.length})
            </Typography>
            <List>
              {uploadedFiles.map((file) => (
                <ListItem key={file.id} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getFileIcon(file.name)}
                  </Box>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {formatFileSize(file.size)} • {file.category}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {file.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleDeleteFile(file.id, file.s3Key)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* File Metadata Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          File Information
          {selectedFile && (
            <Typography variant="body2" color="text.secondary">
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={fileCategory}
              label="Category"
              onChange={(e) => setFileCategory(e.target.value)}
            >
              <MenuItem value="reports">Reports</MenuItem>
              <MenuItem value="forms">Forms</MenuItem>
              <MenuItem value="training">Training Materials</MenuItem>
              <MenuItem value="documentation">Documentation</MenuItem>
              <MenuItem value="images">Images</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={fileTags.join(', ')}
            onChange={(e) => setFileTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            sx={{ mt: 2 }}
            placeholder="health assessment, community outreach, training"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (fileCategory) {
                setDialogOpen(false);
              }
            }}
            variant="contained"
            disabled={!fileCategory}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
