'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip
} from '@mui/material';
import {
  PhotoCamera,
  Close,
  ZoomIn,
  Download,
  Share
} from '@mui/icons-material';

interface PictureItem {
  id: string;
  title: string;
  description?: string;
  src: string;
  tags?: string[];
  dateAdded: string;
}

const SAMPLE_PICTURES: PictureItem[] = [
  {
    id: '1',
    title: 'Region 5 Team Meeting',
    description: 'Monthly CHW team meeting in Fayetteville',
    src: '/api/placeholder/400/300', // Placeholder - would be actual image
    tags: ['meeting', 'team', 'community'],
    dateAdded: '2024-01-15'
  },
  {
    id: '2',
    title: 'Community Health Fair',
    description: 'Annual health fair serving multiple counties',
    src: '/api/placeholder/400/300',
    tags: ['health fair', 'community', 'outreach'],
    dateAdded: '2024-02-20'
  },
  {
    id: '3',
    title: 'CHW Training Session',
    description: 'Professional development training for Region 5 CHWs',
    src: '/api/placeholder/400/300',
    tags: ['training', 'professional development'],
    dateAdded: '2024-03-10'
  },
  {
    id: '4',
    title: 'County Partnership Event',
    description: 'Collaboration event with local county health departments',
    src: '/api/placeholder/400/300',
    tags: ['partnership', 'collaboration', 'county'],
    dateAdded: '2024-04-05'
  }
];

interface PictureSectionProps {
  editable?: boolean;
  onUpload?: (file: File) => void;
}

export default function PictureSection({
  editable = true,
  onUpload
}: PictureSectionProps) {
  const [pictures, setPictures] = useState<PictureItem[]>(SAMPLE_PICTURES);
  const [selectedPicture, setSelectedPicture] = useState<PictureItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handlePictureClick = (picture: PictureItem) => {
    setSelectedPicture(picture);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPicture(null);
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
      setUploadDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhotoCamera color="primary" />
              Region 5 Pictures
            </Typography>
            {editable && (
              <Button
                variant="contained"
                startIcon={<PhotoCamera />}
                onClick={handleUploadClick}
              >
                Upload Picture
              </Button>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Community photos, events, and memorable moments from Region 5 CHW activities.
          </Typography>

          {pictures.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PhotoCamera sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No pictures yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload your first picture to get started
              </Typography>
              {editable && (
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={handleUploadClick}
                  sx={{ mt: 2 }}
                >
                  Upload Picture
                </Button>
              )}
            </Box>
          ) : (
            <ImageList cols={2} gap={16}>
              {pictures.map((picture) => (
                <ImageListItem
                  key={picture.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handlePictureClick(picture)}
                >
                  <Box
                    component="img"
                    src={picture.src}
                    alt={picture.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                  <ImageListItemBar
                    title={picture.title}
                    subtitle={picture.description}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePictureClick(picture);
                        }}
                      >
                        <ZoomIn />
                      </IconButton>
                    }
                  />
                  {picture.tags && (
                    <Box sx={{ p: 1 }}>
                      {picture.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            mr: 0.5,
                            mb: 0.5,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      ))}
                      {picture.tags.length > 2 && (
                        <Chip
                          label={`+${picture.tags.length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </CardContent>
      </Card>

      {/* Picture Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedPicture?.title}
          <IconButton onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPicture && (
            <Box>
              <Box
                component="img"
                src={selectedPicture.src}
                alt={selectedPicture.title}
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 2
                }}
              />

              {selectedPicture.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedPicture.description}
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date Added
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedPicture.dateAdded).toLocaleDateString()}
                  </Typography>
                </Grid>
                {selectedPicture.tags && selectedPicture.tags.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedPicture.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Share />}>Share</Button>
          <Button startIcon={<Download />}>Download</Button>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an image file to upload to the Region 5 picture gallery.
          </Typography>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="picture-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="picture-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<PhotoCamera />}
            >
              Choose File
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
