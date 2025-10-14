'use client';

import { useState } from 'react';
import { Button, Card, Box, Typography, TextField, CardContent, Stack, Container, Grid, Paper } from '@mui/material';

interface FundingProject {
  id: string;
  title: string;
  description: string;
  contributors: string[];
  status: 'draft' | 'collecting' | 'synthesizing' | 'complete';
  createdAt: Date;
}

export default function FundingDocumentsPage() {
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const createProject = () => {
    if (!newProjectTitle.trim()) return;

    const newProject: FundingProject = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDescription,
      contributors: [],
      status: 'draft',
      createdAt: new Date(),
    };

    setProjects([...projects, newProject]);
    setNewProjectTitle('');
    setNewProjectDescription('');
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h3" gutterBottom>Funding Document Synthesis</Typography>
            <Typography variant="body1">
              Create collaborative funding documents by gathering input from multiple contributors
              and synthesizing them into professional 1-pagers and pitch packages.
            </Typography>
          </Box>

          {/* Create New Project */}
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Create New Funding Project</Typography>
              <Stack spacing={3}>
                <TextField
                  label="Project Title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g., Community Health Initiative Funding 2025"
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Brief description of the funding opportunity"
                  fullWidth
                  multiline
                  rows={2}
                />
                <Button onClick={createProject} variant="contained" color="primary">
                  Create Project
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Existing Projects */}
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Your Projects</Typography>
              {projects.length === 0 ? (
                <Typography color="text.secondary">No projects yet. Create your first funding document project above.</Typography>
              ) : (
                <Stack spacing={2}>
                  {projects.map((project) => (
                    <Paper key={project.id} sx={{ p: 2 }}>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{project.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{project.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Status: {project.status} • Created: {project.createdAt.toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined">Edit</Button>
                            <Button size="small" variant="contained" color="primary">View Contributions</Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
