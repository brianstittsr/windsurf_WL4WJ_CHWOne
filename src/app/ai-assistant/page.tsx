'use client';

import React from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  Alert
} from '@mui/material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
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
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2, height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          AI Assistant
        </Typography>
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
    </UnifiedLayout>
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
