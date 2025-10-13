'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Button, Card, Box, Typography, TextField, CardContent, Stack, Container, Grid, Paper, 
  MenuItem, FormControl, InputLabel, Select, Divider, List, ListItem, 
  ListItemText
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const CONTRIBUTION_SECTIONS = [
  'Executive Summary',
  'Problem Statement',
  'Solution Overview',
  'Market Analysis',
  'Target Audience',
  'Competitive Landscape',
  'Business Model',
  'Financial Projections',
  'Team & Experience',
  'Milestones & Timeline',
  'Funding Requirements',
  'Use of Funds',
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;

  // Mock project data - in real app, fetch from API
  const [project] = useState({
    id: projectId,
    title: 'Community Health Initiative Funding 2025',
    description: 'Comprehensive funding proposal for expanding CHW services',
    status: 'collecting',
  });

  const [contributions, setContributions] = useState([]);
  const [newContribution, setNewContribution] = useState({
    contributorName: '',
    contributorEmail: '',
    section: '',
    content: '',
  });

  const handleSectionChange = (event) => {
    setNewContribution({...newContribution, section: event.target.value});
  };

  const submitContribution = () => {
    if (!newContribution.contributorName || !newContribution.section || !newContribution.content) {
      return;
    }

    const contribution = {
      id: Date.now().toString(),
      contributorName: newContribution.contributorName,
      contributorEmail: newContribution.contributorEmail,
      section: newContribution.section,
      content: newContribution.content,
      submittedAt: new Date(),
    };

    setContributions([...contributions, contribution]);
    setNewContribution({
      contributorName: '',
      contributorEmail: '',
      section: '',
      content: '',
    });
  };

  const generateDocuments = () => {
    // TODO: Implement synthesis and document generation
    alert('Document generation will be implemented next!');
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Stack spacing={1} sx={{ mb: { xs: 2, md: 0 } }}>
              <Typography variant="h3">{project.title}</Typography>
              <Typography variant="body1" color="text.secondary">{project.description}</Typography>
              <Typography variant="body2" color="text.secondary">Status: {project.status}</Typography>
            </Stack>
            <Button 
              onClick={generateDocuments} 
              variant="contained" 
              color="primary" 
              size="large"
              endIcon={<ArrowForward />}
            >
              Generate Documents
            </Button>
          </Box>

          {/* Contribution Form */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Add Your Contribution</Typography>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Your Name"
                      value={newContribution.contributorName}
                      onChange={(e) => setNewContribution({...newContribution, contributorName: e.target.value})}
                      placeholder="Enter your full name"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email (optional)"
                      type="email"
                      value={newContribution.contributorEmail}
                      onChange={(e) => setNewContribution({...newContribution, contributorEmail: e.target.value})}
                      placeholder="your.email@example.com"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel id="section-select-label">Section</InputLabel>
                  <Select
                    labelId="section-select-label"
                    value={newContribution.section}
                    label="Section"
                    onChange={handleSectionChange}
                    placeholder="Select the section you want to contribute to"
                  >
                    {CONTRIBUTION_SECTIONS.map((section) => (
                      <MenuItem key={section} value={section}>{section}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Content"
                  value={newContribution.content}
                  onChange={(e) => setNewContribution({...newContribution, content: e.target.value})}
                  placeholder="Provide your detailed input for this section..."
                  multiline
                  rows={6}
                  fullWidth
                />

                <Button 
                  onClick={submitContribution} 
                  variant="contained" 
                  color="primary"
                  disabled={!newContribution.contributorName || !newContribution.section || !newContribution.content}
                >
                  Submit Contribution
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Existing Contributions */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Contributions ({contributions.length})</Typography>
              {contributions.length === 0 ? (
                <Typography color="text.secondary">No contributions yet. Be the first to add your input!</Typography>
              ) : (
                <Stack spacing={2}>
                  {contributions.map((contribution) => (
                    <Paper key={contribution.id} sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">{contribution.section}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contribution.submittedAt.toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">By: {contribution.contributorName}</Typography>
                        <Typography variant="body1">{contribution.content}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Output Options */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Output Options</Typography>
              <Typography variant="body1" paragraph>
                Once you have collected contributions, generate professional documents:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={<Typography><strong>1-Pager:</strong> Concise executive summary PDF</Typography>} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={<Typography><strong>Pitch Package:</strong> Full PowerPoint presentation</Typography>} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={<Typography><strong>Google Drive:</strong> Direct upload to your Drive</Typography>} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={<Typography><strong>Download:</strong> Zipped bundle of all documents</Typography>} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={<Typography><strong>Email:</strong> Send directly to stakeholders</Typography>} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
