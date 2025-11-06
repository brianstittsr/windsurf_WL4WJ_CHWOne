'use client';

import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  Avatar,
  Button,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Close as CloseIcon,
  Send as SendIcon,
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  CalendarToday
} from '@mui/icons-material';
import { AuthUser } from '@/lib/auth';
import { PlatformIdea, IdeaComment } from '@/types/idea.types';

interface IdeaDetailsDialogProps {
  idea: PlatformIdea;
  open: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onCommentAdded: () => void;
}

const IdeaDetailsDialog: React.FC<IdeaDetailsDialogProps> = ({ 
  idea, 
  open, 
  onClose, 
  currentUser,
  onCommentAdded
}) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format dates for display
  const formatDate = (date: Date | any | null | undefined) => {
    if (!date) return 'Unknown date';
    // Handle Firestore Timestamp objects by calling toDate() if available
    const dateObj = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate vote count
  const getVoteCount = () => {
    return idea.votes.reduce((total, vote) => total + vote.value, 0);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      submitted: 'default',
      under_review: 'info',
      planned: 'secondary',
      in_progress: 'warning',
      completed: 'success',
      declined: 'error',
    };
    return statusColors[status] || 'default';
  };

  // Handle vote
  const handleVote = async (value: 1 | -1) => {
    if (!currentUser) {
      alert('You must be logged in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/ideas/${idea.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }

      // Refresh idea data after voting
      onCommentAdded();
    } catch (err: any) {
      console.error('Error voting:', err);
      setError(err.message || 'Failed to submit vote');
    }
  };

  // Submit a comment
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    if (!currentUser) {
      alert('You must be logged in to comment');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${idea.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      // Clear comment field on success
      setComment('');
      // Notify parent component to refresh data
      onCommentAdded();
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ pr: 6 }}>
        {idea.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Submitted by: {idea.submittedBy.name || 'Anonymous'} ({idea.submittedBy.role})
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <CalendarToday fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
              {formatDate(idea.createdAt)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip 
              label={formatStatus(idea.status)}
              color={getStatusColor(idea.status)}
              size="small"
            />
            <Chip 
              label={idea.category.replace('_', ' ')}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {idea.description}
        </Typography>
        
        {(idea.implementationDetails && idea.status === 'completed') && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Implementation Details:
            </Typography>
            <Typography variant="body1">
              {idea.implementationDetails}
            </Typography>
            {idea.implementedAt && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Implemented on {formatDate(idea.implementedAt)}
              </Typography>
            )}
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <CommentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Comments ({idea.comments.length})
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Upvote">
              <IconButton color="primary" onClick={() => handleVote(1)} disabled={!currentUser}>
                <ThumbUp />
              </IconButton>
            </Tooltip>
            <Typography component="span" sx={{ mx: 1 }}>
              {getVoteCount()}
            </Typography>
            <Tooltip title="Downvote">
              <IconButton color="error" onClick={() => handleVote(-1)} disabled={!currentUser}>
                <ThumbDown />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Comment List */}
        {idea.comments.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ my: 2, fontStyle: 'italic' }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <List sx={{ mb: 2 }}>
            {idea.comments.map((comment: IdeaComment) => (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{comment.userName.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography component="span" variant="subtitle2">
                          {comment.userName}
                        </Typography>
                        <Typography component="span" variant="caption" color="textSecondary">
                          {formatDate(comment.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                        sx={{ display: 'inline', whiteSpace: 'pre-wrap' }}
                      >
                        {comment.content}
                        {comment.isEdited && (
                          <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                            (edited)
                          </Typography>
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {/* Comment Form */}
        {currentUser ? (
          <Box sx={{ mt: 2 }}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              inputProps={{ maxLength: 500 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ mr: 1, alignSelf: 'center' }}>
                {comment.length}/500
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleCommentSubmit}
                disabled={!comment.trim() || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 2 }}>
            Please log in to comment on ideas.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdeaDetailsDialog;
