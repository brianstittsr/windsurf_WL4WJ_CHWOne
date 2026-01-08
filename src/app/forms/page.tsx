'use client';

import React, { useState } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { 
  Box, 
  Button, 
  Typography, 
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import FormsManagement from '@/components/Forms/FormsManagement';
import BmadFormWizard from '@/components/Forms/BmadFormWizard';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';

// Inner component that uses the auth context
function FormsContent() {
  const { currentUser, loading } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (loading) {
    return <AnimatedLoading message="Loading Forms..." />;
  }

  if (!currentUser) {
    redirect('/login');
  }

  // Handle wizard completion
  const handleWizardComplete = (formId: string) => {
    console.log('Form generated:', formId);
    setWizardOpen(false);
    // Reload the page to show the new form
    window.location.reload();
  };

  // Handle create form manually button
  const handleCreateManually = () => {
    setCreateModalOpen(true);
  };

  return (
    <UnifiedLayout>
      <Box sx={{ py: 4, px: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Forms Management</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Create, manage, and analyze health assessment forms and data collection tools for Community Health Workers</Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
            <Button component={Link} href="/forms/templates" variant="outlined">Form Templates</Button>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setWizardOpen(true)}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Create with AI Wizard
            </Button>
            <Button 
              variant="outlined"
              onClick={handleCreateManually}
            >
              Create Form Manually
            </Button>
            <Button 
              component={Link}
              href="/forms/digital-literacy"
              variant="contained"
              color="secondary"
              sx={{ 
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
                }
              }}
            >
              🌐 Digital Literacy Program
            </Button>
          </Stack>
        </Box>
        
        <FormsManagement 
          openCreateModal={createModalOpen}
          onCreateModalClose={() => setCreateModalOpen(false)}
        />
      </Box>

      {/* AI Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          CHWOne AI Form Wizard
          <IconButton
            aria-label="close"
            onClick={() => setWizardOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <BmadFormWizard 
            onComplete={handleWizardComplete}
          />
        </DialogContent>
      </Dialog>
    </UnifiedLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function FormsPage() {
  return (
    <AuthProvider>
      <FormsContent />
    </AuthProvider>
  );
}
