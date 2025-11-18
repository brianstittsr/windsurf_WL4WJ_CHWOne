'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  Stack,
  InputAdornment,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GroupWork as GroupWorkIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import QRCodeGenerator, { FormQRCode } from '@/components/QRCode/QRCodeGenerator';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { FIELD_TYPES, FIELD_TYPE_CATEGORIES, getAllCategories, getFieldTypesByCategory } from '@/constants/formFieldTypes';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string; // Support all Qualtrics-style field types
  required: boolean;
  placeholder?: string;
  options?: string[];
  category?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  cols?: number;
  accept?: string; // For file uploads
  multiple?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  organization?: 'region5' | 'wl4wj' | 'general';
  qrCodeEnabled: boolean;
  publicUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function FormsManagement() {
  const { currentUser } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    organization: 'general' as 'region5' | 'wl4wj' | 'general',
    qrCodeEnabled: false,
    publicUrl: '',
    fields: [] as FormField[]
  });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'category' | 'organization' | 'status' | 'none'>('none');

  useEffect(() => {
    fetchForms();
  }, [currentUser]);

  const fetchForms = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const formsRef = collection(db, 'forms');
      const q = query(formsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedForms: Form[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedForms.push({
          id: doc.id,
          title: data.title || data.name || 'Untitled Form',
          description: data.description || '',
          category: data.category || 'general',
          tags: data.tags || data.metadata?.tags || [],
          organization: data.organization || 'general',
          qrCodeEnabled: data.qrCodeEnabled || false,
          publicUrl: data.publicUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/public/${doc.id}`,
          fields: data.fields || [],
          status: data.status || 'draft',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      setForms(fetchedForms);
      console.log('Fetched forms:', fetchedForms.length);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to save forms');
      return;
    }

    try {
      const formToSave = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        organization: formData.organization,
        qrCodeEnabled: formData.qrCodeEnabled,
        publicUrl: formData.publicUrl,
        fields: formData.fields,
        status: 'draft' as const,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      if (modalType === 'create') {
        // Create new form
        const formsRef = collection(db, 'forms');
        await addDoc(formsRef, {
          ...formToSave,
          createdAt: serverTimestamp()
        });
        console.log('Form created successfully');
      } else if (modalType === 'edit' && selectedForm) {
        // Update existing form
        const formRef = doc(db, 'forms', selectedForm.id);
        await updateDoc(formRef, formToSave);
        console.log('Form updated successfully');
      }

      // Refresh the forms list
      await fetchForms();
      
      setShowModal(false);
      setSelectedForm(null);
      resetForm();
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: [],
      organization: 'general',
      qrCodeEnabled: false,
      publicUrl: '',
      fields: []
    });
  };

  const openModal = (type: 'create' | 'edit' | 'view', form?: Form) => {
    setModalType(type);
    setSelectedForm(form || null);
    if (form) {
      setFormData({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags,
        organization: form.organization || 'general',
        qrCodeEnabled: form.qrCodeEnabled,
        publicUrl: form.publicUrl || '',
        fields: form.fields
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'text',
      required: false
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };

  const removeField = (fieldId: string) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(field => field.id !== fieldId)
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      const formRef = doc(db, 'forms', formId);
      await deleteDoc(formRef);
      console.log('Form deleted successfully');
      
      // Refresh the forms list
      await fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getOrganizationColor = (org?: string) => {
    switch (org) {
      case 'region5': return 'primary';
      case 'wl4wj': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      'intake': 'primary',
      'health': 'success',
      'training': 'warning',
      'evaluation': 'info',
      'followup': 'secondary'
    };
    return colors[category] || 'default';
  };

  // Filtering and searching logic
  const filteredForms = forms.filter(form => {
    const matchesSearch = searchQuery === '' ||
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === '' || form.category === filterCategory;
    const matchesStatus = filterStatus === '' || form.status === filterStatus;
    const matchesOrganization = filterOrganization === '' || form.organization === filterOrganization;

    return matchesSearch && matchesCategory && matchesStatus && matchesOrganization;
  });

  // Grouping logic
  const groupedForms = filteredForms.reduce((groups, form) => {
    let groupKey = 'all';
    if (groupBy !== 'none') {
      groupKey = form[groupBy] || 'uncategorized';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(form);
    return groups;
  }, {} as Record<string, Form[]>);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Forms Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage custom forms for data collection
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openModal('create')}
          size="large"
        >
          New Form Wizard
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Search & Filter Forms
          </Typography>

          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search forms by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <ClearIcon
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSearchQuery('')}
                      />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="intake">Intake</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="evaluation">Evaluation</MenuItem>
                  <MenuItem value="followup">Follow-up</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Organization Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={filterOrganization}
                  label="Organization"
                  onChange={(e) => setFilterOrganization(e.target.value)}
                >
                  <MenuItem value="">All Organizations</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="region5">Region 5</MenuItem>
                  <MenuItem value="wl4wj">WL4WJ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Group By */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  label="Group By"
                  onChange={(e) => setGroupBy(e.target.value as any)}
                >
                  <MenuItem value="none">No Grouping</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="organization">Organization</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {(filterCategory || filterStatus || filterOrganization || searchQuery) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {searchQuery && (
                  <Chip
                    label={`Search: "${searchQuery}"`}
                    onDelete={() => setSearchQuery('')}
                    size="small"
                  />
                )}
                {filterCategory && (
                  <Chip
                    label={`Category: ${filterCategory}`}
                    onDelete={() => setFilterCategory('')}
                    size="small"
                    color="primary"
                  />
                )}
                {filterStatus && (
                  <Chip
                    label={`Status: ${filterStatus}`}
                    onDelete={() => setFilterStatus('')}
                    size="small"
                    color={getStatusColor(filterStatus)}
                  />
                )}
                {filterOrganization && (
                  <Chip
                    label={`Organization: ${filterOrganization}`}
                    onDelete={() => setFilterOrganization('')}
                    size="small"
                    color={getOrganizationColor(filterOrganization)}
                  />
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {filteredForms.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtered Forms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {forms.filter(f => f.status === 'published').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published Forms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {forms.reduce((sum, form) => sum + form.fields.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Fields
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Forms Display - Grouped or Table */}
      {groupBy === 'none' ? (
        // Table View
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Forms ({filteredForms.length})
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>QR Code</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow key={form.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="action" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {form.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {form.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.category}
                          size="small"
                          color={getCategoryColor(form.category)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {form.tags.slice(0, 2).map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                          ))}
                          {form.tags.length > 2 && (
                            <Chip label={`+${form.tags.length - 2}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.organization || 'General'}
                          size="small"
                          color={getOrganizationColor(form.organization)}
                        />
                      </TableCell>
                      <TableCell>
                        {form.qrCodeEnabled ? (
                          <FormQRCode
                            formId={form.id}
                            formTitle={form.title}
                            isEnabled={form.qrCodeEnabled}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Disabled
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.status}
                          color={getStatusColor(form.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {form.createdAt.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => openModal('view', form)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => openModal('edit', form)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        // Grouped View
        <Box>
          {Object.entries(groupedForms).map(([groupKey, groupForms]) => (
            <Accordion key={groupKey} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {groupKey === 'all' ? 'All Forms' : `${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}: ${groupKey}`}
                  <Chip
                    label={`${groupForms.length} form${groupForms.length !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {groupForms.map((form) => (
                    <Grid item xs={12} md={6} lg={4} key={form.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <DescriptionIcon color="action" />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {form.title}
                              </Typography>
                            </Box>
                            <Chip
                              label={form.status}
                              color={getStatusColor(form.status)}
                              size="small"
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {form.description}
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip
                              label={form.category}
                              size="small"
                              color={getCategoryColor(form.category)}
                            />
                            {form.organization && (
                              <Chip
                                label={form.organization}
                                size="small"
                                color={getOrganizationColor(form.organization)}
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {form.tags.map((tag, index) => (
                              <Chip key={index} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            Created: {form.createdAt.toLocaleDateString()} • {form.fields.length} fields
                          </Typography>

                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => openModal('view', form)}
                              fullWidth
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => openModal('edit', form)}
                              fullWidth
                            >
                              Edit
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Form Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {modalType === 'create' ? 'Create New Form' :
           modalType === 'edit' ? 'Edit Form' : 'View Form'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Form Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  disabled={modalType === 'view'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    disabled={modalType === 'view'}
                  >
                    <MenuItem value="intake">Intake</MenuItem>
                    <MenuItem value="health">Health</MenuItem>
                    <MenuItem value="training">Training</MenuItem>
                    <MenuItem value="evaluation">Evaluation</MenuItem>
                    <MenuItem value="followup">Follow-up</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={formData.organization}
                    label="Organization"
                    onChange={(e) => setFormData({...formData, organization: e.target.value as any})}
                    disabled={modalType === 'view'}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="region5">Region 5</MenuItem>
                    <MenuItem value="wl4wj">WL4WJ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <QRCodeGenerator
                    formId={selectedForm?.id || 'new'}
                    formTitle={formData.title}
                    isEnabled={formData.qrCodeEnabled}
                    publicUrl={formData.publicUrl}
                    onToggle={(enabled) => {
                      setFormData(prev => ({ ...prev, qrCodeEnabled: enabled }));
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      QR Code Access
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enable QR code to allow public access without authentication
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Form Fields */}
              {modalType !== 'view' && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addField}
                    >
                      Add Field
                    </Button>
                  </Box>

                  {formData.fields.map((field, index) => (
                    <Card key={field.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Field Label"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Field Type</InputLabel>
                              <Select
                                value={field.type}
                                label="Field Type"
                                onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                              >
                                {getAllCategories().map((category) => [
                                  <MenuItem key={`header-${category}`} disabled sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'primary.main' }}>
                                    {category}
                                  </MenuItem>,
                                  ...getFieldTypesByCategory(category).map((fieldType) => (
                                    <MenuItem key={fieldType.value} value={fieldType.value} sx={{ pl: 3 }}>
                                      {fieldType.label}
                                    </MenuItem>
                                  ))
                                ])}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <TextField
                              fullWidth
                              label="Field Name"
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Required</InputLabel>
                              <Select
                                value={field.required ? 'yes' : 'no'}
                                label="Required"
                                onChange={(e) => updateField(field.id, { required: e.target.value === 'yes' })}
                              >
                                <MenuItem value="yes">Yes</MenuItem>
                                <MenuItem value="no">No</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => removeField(field.id)}
                            >
                              Remove
                            </Button>
                          </Grid>
                          
                          {/* Options for fields that need them */}
                          {['select', 'radio', 'checkbox', 'image-choice', 'button-choice', 'matrix-single', 'matrix-multiple', 'matrix-dropdown', 'rank-order'].includes(field.type) && (
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Options (comma-separated)"
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => updateField(field.id, { 
                                  options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt) 
                                })}
                                size="small"
                                placeholder="Option 1, Option 2, Option 3"
                                helperText="Enter options separated by commas"
                              />
                            </Grid>
                          )}
                          
                          {/* Placeholder for text-based fields */}
                          {['text', 'textarea', 'email', 'url', 'phone', 'number', 'decimal', 'currency', 'percentage'].includes(field.type) && (
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Placeholder Text"
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                size="small"
                                placeholder="Enter placeholder text..."
                              />
                            </Grid>
                          )}
                          
                          {/* Min/Max for numeric fields */}
                          {['number', 'decimal', 'currency', 'percentage', 'slider', 'rating-scale'].includes(field.type) && (
                            <>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="Minimum Value"
                                  type="number"
                                  value={field.min || ''}
                                  onChange={(e) => updateField(field.id, { min: parseFloat(e.target.value) || undefined })}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="Maximum Value"
                                  type="number"
                                  value={field.max || ''}
                                  onChange={(e) => updateField(field.id, { max: parseFloat(e.target.value) || undefined })}
                                  size="small"
                                />
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>
              )}

              {modalType === 'view' && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Form Fields
                  </Typography>
                  {formData.fields.map((field) => (
                    <Box key={field.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        {field.label} ({field.type})
                        {field.required && <span style={{ color: 'red' }}> *</span>}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Name: {field.name}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>
              {modalType === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {modalType !== 'view' && (
              <Button type="submit" variant="contained">
                {modalType === 'create' ? 'Create Form' : 'Save Changes'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => openModal('create')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
