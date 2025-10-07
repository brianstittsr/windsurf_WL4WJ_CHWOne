'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { NavigateNext as NavigateNextIcon, Save as SaveIcon } from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import AIFormBuilder from '@/components/FormBuilder';
import { FormField } from '@/types/firebase/schema';

export default function FormBuilderPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [generatedFields, setGeneratedFields] = useState<FormField[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formMetadata, setFormMetadata] = useState({
    title: '',
    description: '',
    category: '',
    organization: 'general' as 'region5' | 'wl4wj' | 'general'
  });

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const handleFormGenerated = (fields: FormField[]) => {
    setGeneratedFields(fields);
    setSaveDialogOpen(true);
  };

  const handleSaveForm = async () => {
    if (!formMetadata.title.trim() || generatedFields.length === 0) {
      return;
    }

    try {
      // Here you would save to Firebase
      // For now, we'll just log and redirect
      console.log('Saving form:', {
        ...formMetadata,
        fields: generatedFields,
        createdBy: currentUser.uid
      });

      // Redirect to forms list
      router.push('/forms');
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Forms', href: '/forms' },
    { label: 'AI Builder', href: '/forms/builder' }
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbItems.map((item, index) => (
              <MuiLink
                key={index}
                component={Link}
                href={item.href}
                underline="hover"
                color="inherit"
              >
                {item.label}
              </MuiLink>
            ))}
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            AI Form Builder
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Create forms quickly using AI-powered question parsing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Simply paste your form questions, and our AI will analyze them to create appropriate form fields.
            You can then customize, preview, and save your form.
          </Typography>
        </Box>

        {/* AI Form Builder Component */}
        <AIFormBuilder
          onFormGenerated={handleFormGenerated}
        />

        {/* Save Form Dialog */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Save Your Form</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your form has {generatedFields.length} field{generatedFields.length !== 1 ? 's' : ''}.
              Please provide the basic information to save it.
            </Typography>

            <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
              <TextField
                fullWidth
                label="Form Title"
                value={formMetadata.title}
                onChange={(e) => setFormMetadata(prev => ({ ...prev, title: e.target.value }))}
                required
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formMetadata.description}
                onChange={(e) => setFormMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this form is for"
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formMetadata.category}
                  label="Category"
                  onChange={(e) => setFormMetadata(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="intake">Intake</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="evaluation">Evaluation</MenuItem>
                  <MenuItem value="followup">Follow-up</MenuItem>
                  <MenuItem value="survey">Survey</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={formMetadata.organization}
                  label="Organization"
                  onChange={(e) => setFormMetadata(prev => ({ ...prev, organization: e.target.value as any }))}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="region5">Region 5</MenuItem>
                  <MenuItem value="wl4wj">WL4WJ</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveForm}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!formMetadata.title.trim()}
            >
              Save Form
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}
