'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress,
  Tooltip,
  TablePagination,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { PlatformIdea, IdeaStatus, IdeaPriority } from '@/types/idea.types';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface AdminUpdateDialogProps {
  open: boolean;
  idea: PlatformIdea | null;
  onClose: () => void;
  onUpdate: (updates: any) => Promise<void>;
  loading: boolean;
}

const AdminUpdateDialog = ({ open, idea, onClose, onUpdate, loading }: AdminUpdateDialogProps) => {
  const [status, setStatus] = useState<IdeaStatus>('submitted');
  const [priority, setPriority] = useState<IdeaPriority | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [implementationDetails, setImplementationDetails] = useState('');

  useEffect(() => {
    if (idea) {
      setStatus(idea.status);
      setPriority(idea.priority || '');
      setAdminNotes(idea.adminNotes || '');
      setImplementationDetails(idea.implementationDetails || '');
    }
  }, [idea]);

  const handleSubmit = async () => {
    const updates = {
      status,
      ...(priority ? { priority } : {}),
      adminNotes: adminNotes.trim() || undefined,
      ...(status === 'completed' ? { implementationDetails: implementationDetails.trim() } : {})
    };
    
    await onUpdate(updates);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Idea Status</DialogTitle>
      <DialogContent>
        {idea && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">{idea.title}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Submitted by: {idea.submittedBy.name} ({idea.submittedBy.role})
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as IdeaPriority | '')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Admin Notes"
              multiline
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Internal notes (only visible to admins)"
            />
            
            {status === 'completed' && (
              <TextField
                label="Implementation Details"
                multiline
                rows={3}
                value={implementationDetails}
                onChange={(e) => setImplementationDetails(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Details about the implementation (visible to users)"
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AdminIdeas() {
  const { currentUser, userProfile } = useAuth();
  const [ideas, setIdeas] = useState<PlatformIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<PlatformIdea | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would include proper filtering on the server side
      const response = await fetch('/api/ideas');
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      
      const data = await response.json();
      setIdeas(data.ideas);
    } catch (err: any) {
      console.error('Error fetching ideas:', err);
      setError(err.message || 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleUpdateIdea = async (updates: any) => {
    if (!selectedIdea) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/ideas/${selectedIdea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update idea');
      }
      
      // Close dialog and refresh ideas
      setDialogOpen(false);
      fetchIdeas();
    } catch (err: any) {
      console.error('Error updating idea:', err);
      setError(err.message || 'Failed to update idea');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page on filter change
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page on search change
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter(idea => 
      (statusFilter === 'all' || idea.status === statusFilter) &&
      (search === '' || 
        idea.title.toLowerCase().includes(search.toLowerCase()) || 
        idea.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      // Sort by priority (critical > high > medium > low > undefined)
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1, undefined: 0 };
      const priorityA = a.priority ? priorityOrder[a.priority] : 0;
      const priorityB = b.priority ? priorityOrder[b.priority] : 0;
      
      // If priorities are different, sort by priority
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // Otherwise sort by creation date (newest first)
      const getTimeValue = (date: Date | any) => {
        if (typeof date.toDate === 'function') {
          return date.toDate().getTime();
        }
        return new Date(date).getTime();
      };
      
      return getTimeValue(b.createdAt) - getTimeValue(a.createdAt);
    });

  // Apply pagination
  const displayedIdeas = filteredIdeas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Format status for display
  const formatStatus = (status: IdeaStatus) => {
    return status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
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
  
  // Priority chip color based on priority
  const getPriorityColor = (priority: IdeaPriority) => {
    const priorityColors: Record<IdeaPriority, 'default' | 'primary' | 'secondary' | 'error' | 'warning'> = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      critical: 'error',
    };
    return priorityColors[priority];
  };
  
  // Format date for display
  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    // Handle Firestore Timestamp objects by calling toDate() if available
    const dateObj = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get vote count
  const getVoteCount = (idea: PlatformIdea) => {
    return idea.votes.reduce((total, vote) => total + vote.value, 0);
  };
  
  // Handle opening the update dialog
  const handleOpenUpdateDialog = (idea: PlatformIdea) => {
    setSelectedIdea(idea);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Platform Enhancement Ideas
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl sx={{ minWidth: '150px' }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
            size="small"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : displayedIdeas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No ideas found matching the current filters.
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Votes</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedIdeas.map((idea) => (
                  <TableRow key={idea.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {idea.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block" noWrap>
                        By {idea.submittedBy.name} ({idea.submittedBy.role})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatStatus(idea.status)}
                        color={getStatusColor(idea.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {idea.priority ? (
                        <Chip 
                          label={idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)}
                          color={getPriorityColor(idea.priority)}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Not set
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getVoteCount(idea)}</TableCell>
                    <TableCell>{formatDate(idea.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`/ideas?id=${idea.id}`, '_blank')}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenUpdateDialog(idea)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {idea.status === 'submitted' && (
                          <>
                            <Tooltip title="Move to Under Review">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleUpdateIdea({ status: 'under_review' })}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Decline">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleUpdateIdea({ status: 'declined' })}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={filteredIdeas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      
      <AdminUpdateDialog
        open={dialogOpen}
        idea={selectedIdea}
        onClose={() => setDialogOpen(false)}
        onUpdate={handleUpdateIdea}
        loading={updating}
      />
    </Box>
  );
}
