'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FixFormPage() {
  const [formId, setFormId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [formInfo, setFormInfo] = useState<any>(null);

  const handleFixForm = async () => {
    if (!formId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a form ID' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setFormInfo(null);

    try {
      // Get the form
      const formRef = doc(db, 'forms', formId);
      const formDoc = await getDoc(formRef);

      if (!formDoc.exists()) {
        setMessage({ type: 'error', text: 'Form not found!' });
        setLoading(false);
        return;
      }

      const formData = formDoc.data();
      
      setFormInfo({
        title: formData.title,
        description: formData.description,
        fieldsCount: formData.fields?.length || 0,
        templateId: formData.templateId
      });

      // If form has fields, no need to fix
      if (formData.fields && formData.fields.length > 0) {
        setMessage({ type: 'success', text: `Form already has ${formData.fields.length} fields. No fix needed.` });
        setLoading(false);
        return;
      }

      setMessage({ type: 'info', text: 'Form has no fields. Attempting to fix...' });

      // Check if form has a templateId
      if (!formData.templateId) {
        setMessage({ type: 'error', text: 'Form has no templateId. Cannot auto-fix. Please recreate from template.' });
        setLoading(false);
        return;
      }

      // Get all templates
      const templatesRef = collection(db, 'formTemplates');
      const templatesSnapshot = await getDocs(templatesRef);
      
      let template: any = null;
      templatesSnapshot.forEach((doc) => {
        if (doc.id === formData.templateId) {
          template = { id: doc.id, ...doc.data() };
        }
      });

      if (!template) {
        setMessage({ type: 'error', text: 'Template not found. Cannot auto-fix.' });
        setLoading(false);
        return;
      }

      // Flatten the template fields
      const flattenedFields: any[] = [];
      if (template?.schema?.sections) {
        template.schema.sections.forEach((section: any) => {
          section.fields.forEach((field: any) => {
            flattenedFields.push({
              id: field.id,
              name: field.id,
              label: field.label,
              type: field.type,
              required: field.required || false,
              placeholder: field.placeholder,
              options: field.options?.map((opt: any) => ({
                value: typeof opt === 'string' ? opt : opt.value,
                label: typeof opt === 'string' ? opt : opt.label
              })),
              validation: field.validation
            });
          });
        });
      }

      if (flattenedFields.length === 0) {
        setMessage({ type: 'error', text: 'Template has no fields. Cannot fix.' });
        setLoading(false);
        return;
      }

      // Update the form with fields
      await updateDoc(formRef, {
        fields: flattenedFields,
        updatedAt: new Date()
      });

      setFormInfo({
        ...formInfo,
        fieldsCount: flattenedFields.length
      });

      setMessage({ 
        type: 'success', 
        text: `✅ Form fixed successfully! Added ${flattenedFields.length} fields to the form.` 
      });

    } catch (error: any) {
      console.error('Error fixing form:', error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Fix Form Fields
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          This tool fixes forms that have no fields by retrieving them from the original template.
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Form ID"
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            placeholder="Enter the form ID (e.g., KKstVqlhJbS1mhMcnpI8)"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleFixForm}
            disabled={loading || !formId.trim()}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Fix Form'}
          </Button>
        </Paper>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        {formInfo && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Form Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Title" secondary={formInfo.title} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Description" secondary={formInfo.description} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Fields Count" secondary={formInfo.fieldsCount} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Template ID" secondary={formInfo.templateId || 'None'} />
              </ListItem>
            </List>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
