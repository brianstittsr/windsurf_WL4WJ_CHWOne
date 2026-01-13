'use client';

import React from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  WorkOutline as WorkOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import ChatInterface from '@/components/AI/ChatInterface';

// Inner component that uses the auth context
function AiAssistantContent() {
  const { currentUser, loading: authLoading } = useAuth();
  
  if (authLoading) {
    return <AnimatedLoading message="Loading AI Assistant..." />;
  }
  
  return (
    <AdminLayout>
      <Box sx={{ py: 4, px: 2, height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          AI Assistant
        </Typography>
        <Chip 
          label="NEW: CHW Levels Information" 
          color="primary" 
          variant="outlined" 
          icon={<VerifiedUserIcon />} 
          sx={{ fontWeight: 'bold' }} 
        />
      </Box>
      
      <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
        <Typography variant="h6" gutterBottom>
          Now with WL4WJ CHW Certification Information
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Our AI Assistant can now answer questions about CHW certification levels, requirements, training programs, and career pathways based on WL4WJ standards.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Try asking questions like:
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <SchoolIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="What are the different CHW certification levels?" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <VerifiedUserIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="What are the requirements for advanced level certification?" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <WorkOutlineIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="What career pathways are available for CHWs?" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PsychologyIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Tell me about WL4WJ training programs" />
          </ListItem>
        </List>
      </Box>
      
      {!currentUser ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please log in to use the AI Assistant
        </Alert>
      ) : null}
      
      <Paper sx={{ height: 'calc(100% - 80px)', overflow: 'hidden' }}>
        <ChatInterface />
      </Paper>
      </Box>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function AiAssistantPage() {
  return (
    <AuthProvider>
      <AiAssistantContent />
    </AuthProvider>
  );
}
