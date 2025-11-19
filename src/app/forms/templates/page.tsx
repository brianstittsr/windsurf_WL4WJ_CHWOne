'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Box,
  Tabs,
  Tab,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Close as CloseIcon,
  FileCopy as FileCopyIcon,
  Edit as EditIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BmadFormWizard } from '@/components/Forms';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Import template data
import attendanceSheetTemplate from '@/data/formTemplates/attendanceSheet.json';
import trainingAttendanceTemplate from '@/data/formTemplates/trainingAttendance.json';
import chwOnboardingTemplate from '@/data/formTemplates/chwOnboarding.json';
import clientOnboardingTemplate from '@/data/formTemplates/clientOnboarding.json';

// Template categories
const categories = [
  { id: 'all', label: 'All Templates' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'survey', label: 'Survey' },
  { id: 'other', label: 'Other' }
];

// Combine all templates
const allTemplates = [
  attendanceSheetTemplate,
  trainingAttendanceTemplate,
  chwOnboardingTemplate,
  clientOnboardingTemplate
];

// Template card component
function TemplateCard({ template, onUse, onPreview, copying }: { 
  template: any, 
  onUse: (template: any) => void,
  onPreview: (template: any) => void,
  copying: boolean
}) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => onPreview(template)}>
        <CardMedia
          component="img"
          height="140"
          image={template.metadata.thumbnailUrl || '/images/templates/default-template.svg'}
          alt={template.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div">
            {template.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {template.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {template.metadata.tags.slice(0, 3).map((tag: string) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
        <Button 
          variant="contained" 
          fullWidth
          onClick={() => onUse(template)}
          startIcon={<FileCopyIcon />}
          disabled={copying}
        >
          {copying ? 'Copying...' : 'Use Template'}
        </Button>
      </Box>
    </Card>
  );
}

// Main content component
function TemplatesContent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState(allTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<string | undefined>(undefined);
  const [copying, setCopying] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [copiedTemplateName, setCopiedTemplateName] = useState('');
  
  // Filter templates based on category and search query
  useEffect(() => {
    let templates = [...allTemplates];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query) ||
        template.metadata.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredTemplates(templates);
  }, [selectedCategory, searchQuery]);
  
  // Handle category change
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Helper function to create dataset from form template
  const createDatasetFromForm = (formId: string, template: any) => {
    // Extract all fields from all sections to create dataset columns
    const fields: any[] = [];
    
    template.schema.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        fields.push({
          id: field.id,
          name: field.name || field.id,
          label: field.label,
          type: field.type,
          description: field.helpText || '',
          required: field.required || false,
          section: section.title
        });
      });
    });

    // Add metadata fields
    fields.unshift(
      {
        id: 'submission_id',
        name: 'submission_id',
        label: 'Submission ID',
        type: 'text',
        description: 'Unique identifier for this submission',
        required: true,
        section: 'Metadata'
      },
      {
        id: 'submitted_at',
        name: 'submitted_at',
        label: 'Submitted At',
        type: 'datetime',
        description: 'Timestamp when the form was submitted',
        required: true,
        section: 'Metadata'
      },
      {
        id: 'submitted_by',
        name: 'submitted_by',
        label: 'Submitted By',
        type: 'text',
        description: 'User ID of the person who submitted the form',
        required: true,
        section: 'Metadata'
      }
    );

    return {
      name: `${template.name} - Responses`,
      description: `Dataset for storing responses from "${template.name}" form`,
      formId: formId,
      userId: currentUser?.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fields: fields,
      records: [],
      metadata: {
        sourceForm: template.name,
        sourceFormId: formId,
        autoGenerated: true,
        category: template.category,
        tags: [...(template.metadata.tags || []), 'form-responses']
      },
      status: 'active'
    };
  };

  // Handle template use
  const handleUseTemplate = async (template: any) => {
    if (!currentUser) {
      alert('Please sign in to use templates');
      return;
    }

    setCopying(true);
    try {
      // Create a copy of the template for the user
      const { id, ...templateWithoutId } = template; // Remove id from template
      const newForm = {
        ...templateWithoutId,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft',
        isTemplate: false,
        templateId: template.id, // Reference to the original template
        metadata: {
          ...template.metadata,
          copiedFrom: template.name,
          copiedAt: new Date().toISOString()
        }
      };

      // Save form to Firestore
      const formsRef = collection(db, 'forms');
      const formDocRef = await addDoc(formsRef, newForm);

      console.log('Form copied successfully:', formDocRef.id);

      // Create complementary dataset for form responses
      const datasetData = createDatasetFromForm(formDocRef.id, template);
      const datasetsRef = collection(db, 'datasets');
      const datasetDocRef = await addDoc(datasetsRef, datasetData);

      console.log('Dataset created successfully:', datasetDocRef.id);

      // Update form with dataset reference
      const formDocRef2 = doc(db, 'forms', formDocRef.id);
      await updateDoc(formDocRef2, {
        datasetId: datasetDocRef.id
      });

      console.log('Form updated with dataset reference');

      // Show success message
      setCopiedTemplateName(template.name);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error copying template:', error);
      alert('Failed to copy template. Please try again.');
    } finally {
      setCopying(false);
    }
  };

  // Handle success dialog close
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    // Redirect to forms management page
    router.push('/forms');
  };
  
  // Handle template preview
  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };
  
  // Handle wizard completion
  const handleWizardComplete = (formId: string) => {
    console.log('Form generated:', formId);
    setWizardOpen(false);
    // In a real implementation, this would redirect to the new form
  };
  
  // Open wizard with specific category
  const handleOpenWizardWithCategory = (category: string) => {
    setWizardCategory(category);
    setWizardOpen(true);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Form Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose from our pre-built templates or create a custom form with the AI Wizard
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search templates..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setWizardOpen(true)}
          >
            Create with AI Wizard
          </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="template categories"
        >
          {categories.map(category => (
            <Tab 
              key={category.id} 
              label={category.label} 
              value={category.id} 
              id={`tab-${category.id}`}
              aria-controls={`tabpanel-${category.id}`}
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Featured Templates Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Featured Templates
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Attendance Sheet Templates */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  Attendance Sheets
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Track attendance for meetings, trainings, and events
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handlePreviewTemplate(attendanceSheetTemplate)}
                  >
                    Basic
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handlePreviewTemplate(trainingAttendanceTemplate)}
                  >
                    Training
                  </Button>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => handleOpenWizardWithCategory('attendance')}
                  startIcon={<AddIcon />}
                >
                  Create Custom Attendance Sheet
                </Button>
              </Box>
            </Card>
          </Grid>
          
          {/* Onboarding Templates */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  Onboarding Forms
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Streamline the onboarding process for CHWs and clients
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handlePreviewTemplate(chwOnboardingTemplate)}
                  >
                    CHW
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handlePreviewTemplate(clientOnboardingTemplate)}
                  >
                    Client
                  </Button>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => handleOpenWizardWithCategory('onboarding')}
                  startIcon={<AddIcon />}
                >
                  Create Custom Onboarding Form
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* All Templates Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          All Templates
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {filteredTemplates.length > 0 ? (
          <Grid container spacing={3}>
            {filteredTemplates.map(template => (
              <Grid item key={template.id} xs={12} sm={6} md={4}>
                <TemplateCard 
                  template={template} 
                  onUse={handleUseTemplate} 
                  onPreview={handlePreviewTemplate}
                  copying={copying}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No templates found matching your criteria
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              sx={{ mt: 2 }}
            >
              Clear filters
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Template Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              {selectedTemplate.name}
              <IconButton
                aria-label="close"
                onClick={() => setPreviewOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {selectedTemplate.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Template Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Category:</strong> {selectedTemplate.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Tags:</strong> {selectedTemplate.metadata.tags.join(', ')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Form Structure
              </Typography>
              
              {selectedTemplate.schema.sections.map((section: any) => (
                <Box key={section.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {section.title}
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2 }}>
                    {section.fields.map((field: any) => (
                      <Box component="li" key={field.id} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                          <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                            ({field.type})
                          </Box>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewOpen(false)} disabled={copying}>
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setPreviewOpen(false);
                }}
                startIcon={<FileCopyIcon />}
                disabled={copying}
              >
                {copying ? 'Copying...' : 'Use Template'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pt: 4,
          pb: 2,
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          Template Copied Successfully! 🎉
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
            Template <strong>"{copiedTemplateName}"</strong> has been copied to your forms with a complementary dataset for responses!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            You can now edit and customize your new form.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 3 }}>
          <Button
            onClick={handleSuccessDialogClose}
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            View My Forms
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* AI Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          BMAD AI Form Wizard
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
            initialCategory={wizardCategory}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

// Wrap the content with AuthProvider
export default function TemplatesPage() {
  return (
    <AuthProvider>
      <TemplatesContent />
    </AuthProvider>
  );
}
