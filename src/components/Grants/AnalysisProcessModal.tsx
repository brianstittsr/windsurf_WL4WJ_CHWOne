import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogActions
} from '@mui/material';
import { useGrantWizard } from '@/contexts/GrantWizardContext';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

/**
 * A modal component that displays the document analysis process steps
 */
export default function AnalysisProcessModal() {
  const { 
    analysisSteps, 
    showAnalysisModal, 
    setShowAnalysisModal,
    isAnalyzingDocument 
  } = useGrantWizard();
  
  const [progress, setProgress] = useState(0);
  
  // Calculate progress based on steps
  useEffect(() => {
    if (analysisSteps.length > 0) {
      // Estimate progress - each step is worth a percentage of total expected steps
      const estimatedTotalSteps = 15; // Approximate number of steps for a complete process
      const currentProgress = Math.min(100, Math.round((analysisSteps.length / estimatedTotalSteps) * 100));
      setProgress(currentProgress);
    } else {
      setProgress(0);
    }
  }, [analysisSteps]);
  
  // Handle close
  const handleClose = () => {
    if (!isAnalyzingDocument) {
      setShowAnalysisModal(false);
    }
  };

  // Get icon for step based on its content
  const getStepIcon = (step: string) => {
    if (step.includes('✅')) return <CheckCircleIcon color="success" />;
    if (step.includes('❌')) return <ErrorIcon color="error" />;
    if (step.includes('⚠')) return <WarningIcon color="warning" />;
    if (step.includes('...')) return <CircularProgress size={20} />;
    return <InfoIcon color="info" />;
  };
  
  return (
    <Dialog 
      open={showAnalysisModal} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isAnalyzingDocument}
    >
      <DialogTitle>
        Document Analysis Process
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            {isAnalyzingDocument 
              ? 'Analyzing your document. This may take a moment...'
              : 'Document analysis complete. Here is a summary of the process:'}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant={isAnalyzingDocument ? "indeterminate" : "determinate"} 
            value={progress} 
            sx={{ height: 8, borderRadius: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Typography variant="caption" color="text.secondary">{progress}%</Typography>
          </Box>
        </Box>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            maxHeight: '300px', 
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}
        >
          <List dense>
            {analysisSteps.map((step, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getStepIcon(step)}
                </ListItemIcon>
                <ListItemText 
                  primary={step} 
                  primaryTypographyProps={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }} 
                />
              </ListItem>
            ))}
            {isAnalyzingDocument && (
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PlayArrowIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Processing..." 
                  primaryTypographyProps={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                  }} 
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isAnalyzingDocument}
          variant="contained"
          color="primary"
        >
          {isAnalyzingDocument ? 'Processing...' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
