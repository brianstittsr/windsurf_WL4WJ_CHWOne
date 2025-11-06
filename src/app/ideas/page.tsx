'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardActions, Button, 
  Tabs, Tab, Grid, Chip, CircularProgress, TextField, MenuItem, Select, 
  FormControl, InputLabel, SelectChangeEvent, IconButton, Tooltip, 
  Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, ThumbUp, ThumbDown, Comment, FilterList } from '@mui/icons-material';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { PlatformIdea, IdeaCategory, IdeaStatus } from '@/types/idea.types';
import IdeaSubmissionForm from '@/components/Ideas/IdeaSubmissionForm';
import IdeaDetailsDialog from '@/components/Ideas/IdeaDetailsDialog';

// Type for tab filtering
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Filter component
const IdeaFilterControls = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  categories: IdeaCategory[];
  selectedCategory: string;
  onCategoryChange: (event: SelectChangeEvent) => void;
}) => (
  <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
    <FilterList sx={{ mr: 1 }} />
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel id="category-filter-label">Category</InputLabel>
      <Select
        labelId="category-filter-label"
        id="category-filter"
        value={selectedCategory}
        label="Category"
        onChange={onCategoryChange}
      >
        <MenuItem value="all">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category.replace('_', ' ')}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

// Main component
export default function IdeasPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ideas, setIdeas] = useState<PlatformIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openSubmitForm, setOpenSubmitForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<PlatformIdea | null>(null);

  // Category options for the filter
  const categories: IdeaCategory[] = [
    'feature', 'usability', 'integration', 
    'accessibility', 'training', 'content', 'other'
  ];

  // Status mapping for tabs
  const tabStatuses: Array<IdeaStatus | 'all'> = [
    'all', 'submitted', 'under_review', 'planned', 'in_progress', 'completed'
  ];

  // Fetch ideas based on current filters
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for API call
      const status = tabStatuses[tabIndex] !== 'all' ? tabStatuses[tabIndex] : undefined;
      let url = '/api/ideas';
      
      // Add query parameters if needed
      if (status) {
        url += `?status=${status}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch ideas');
      }

      const data = await response.json();
      
      // Filter ideas by category if needed
      let filteredIdeas = data.ideas;
      if (selectedCategory !== 'all') {
        filteredIdeas = filteredIdeas.filter(
          (idea: PlatformIdea) => idea.category === selectedCategory
        );
      }
      
      setIdeas(filteredIdeas);
    } catch (err: any) {
      console.error('Error fetching ideas:', err);
      setError(err.message || 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and fetch ideas on mount
  useEffect(() => {
    const loadUserAndIdeas = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await fetchIdeas();
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to initialize page. Please try again later.');
        setLoading(false);
      }
    };

    loadUserAndIdeas();
  }, []);

  // Fetch ideas when tab or category filter changes
  useEffect(() => {
    fetchIdeas();
  }, [tabIndex, selectedCategory]);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Category filter change handler
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  // Vote handler
  const handleVote = async (ideaId: string, value: 1 | -1) => {
    if (!user) {
      alert('You must be logged in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/ideas/${ideaId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }

      // Refresh ideas to show updated vote count
      fetchIdeas();
    } catch (err: any) {
      console.error('Error voting:', err);
      alert(`Error: ${err.message || 'Failed to submit vote'}`);
    }
  };

  // Calculate vote count for an idea
  const getVoteCount = (idea: PlatformIdea) => {
    return idea.votes.reduce((total, vote) => total + vote.value, 0);
  };

  // Open idea details
  const handleOpenIdeaDetails = (idea: PlatformIdea) => {
    setSelectedIdea(idea);
  };

  // Close idea details
  const handleCloseIdeaDetails = () => {
    setSelectedIdea(null);
  };

  // Submit new idea
  const handleIdeaSubmission = async (ideaData: any) => {
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ideaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit idea');
      }

      // Close form and refresh ideas
      setOpenSubmitForm(false);
      fetchIdeas();
    } catch (err: any) {
      console.error('Error submitting idea:', err);
      alert(`Error: ${err.message || 'Failed to submit idea'}`);
    }
  };

  // Status chip color based on status
  const getStatusColor = (status: IdeaStatus) => {
    const statusColors: Record<IdeaStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      submitted: 'default',
      under_review: 'info',
      planned: 'secondary',
      in_progress: 'warning',
      completed: 'success',
      declined: 'error',
    };
    return statusColors[status];
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Platform Enhancement Ideas
        </Typography>

        {user && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenSubmitForm(true)}
          >
            Submit New Idea
          </Button>
        )}
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Have ideas to improve the CHWOne platform? Submit your suggestions and vote on other ideas to help us prioritize enhancements.
      </Typography>

      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Ideas" />
          <Tab label="Submitted" />
          <Tab label="Under Review" />
          <Tab label="Planned" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      <IdeaFilterControls
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : ideas.length === 0 ? (
        <Box sx={{ my: 4, p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">
            No ideas found for the selected filters.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {user ? (
              <span>Be the first to submit an idea!</span>
            ) : (
              <span>Please log in to submit ideas.</span>
            )}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {ideas.map((idea) => (
            <Grid item xs={12} md={6} key={idea.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {idea.title}
                    </Typography>
                    <Chip 
                      label={formatStatus(idea.status)}
                      color={getStatusColor(idea.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Submitted by: {idea.submittedBy.name || 'Anonymous'} ({idea.submittedBy.role})
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {idea.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={idea.category.replace('_', ' ')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {idea.organizationId && (
                      <Chip 
                        label="Organization Specific"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="Upvote">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleVote(idea.id, 1)}
                        disabled={!user}
                      >
                        <ThumbUp />
                      </IconButton>
                    </Tooltip>
                    <Typography component="span" sx={{ mx: 1 }}>
                      {getVoteCount(idea)}
                    </Typography>
                    <Tooltip title="Downvote">
                      <IconButton 
                        color="error"
                        onClick={() => handleVote(idea.id, -1)}
                        disabled={!user}
                      >
                        <ThumbDown />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box>
                    <Button 
                      endIcon={<Comment />} 
                      onClick={() => handleOpenIdeaDetails(idea)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Submission Form Dialog */}
      <Dialog 
        open={openSubmitForm} 
        onClose={() => setOpenSubmitForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Platform Enhancement Idea</DialogTitle>
        <DialogContent>
          <IdeaSubmissionForm
            currentUser={user}
            onSubmit={handleIdeaSubmission}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Idea Details Dialog */}
      {selectedIdea && (
        <IdeaDetailsDialog
          idea={selectedIdea}
          open={!!selectedIdea}
          onClose={handleCloseIdeaDetails}
          currentUser={user}
          onCommentAdded={fetchIdeas}
        />
      )}
    </Container>
  );
}
