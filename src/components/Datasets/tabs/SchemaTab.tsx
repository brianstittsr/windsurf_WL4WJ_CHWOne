'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { Dataset, DatasetField, DatasetFieldType } from '@/types/dataset.types';
import { datasetService } from '@/services/DatasetService';

const FIELD_TYPES: DatasetFieldType[] = [
  'string',
  'number',
  'boolean',
  'date',
  'datetime',
  'email',
  'phone',
  'url',
  'text',
  'select',
  'multiselect',
  'file',
  'json',
  'array'
];

interface SchemaTabProps {
  dataset: Dataset;
  onRefresh: () => void;
}

export default function SchemaTab({ dataset, onRefresh }: SchemaTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<DatasetField | null>(null);
  const [fieldData, setFieldData] = useState<Partial<DatasetField>>({
    name: '',
    label: '',
    type: 'string',
    required: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddField = () => {
    setEditingField(null);
    setFieldData({
      name: '',
      label: '',
      type: 'string',
      required: false
    });
    setDialogOpen(true);
  };

  const handleEditField = (field: DatasetField) => {
    setEditingField(field);
    setFieldData(field);
    setDialogOpen(true);
  };

  const handleSaveField = async () => {
    if (!fieldData.name || !fieldData.label) {
      setError('Field name and label are required');
      return;
    }

    try {
      const updatedFields = editingField
        ? dataset.schema.fields.map(f =>
            f.id === editingField.id ? { ...f, ...fieldData } : f
          )
        : [
            ...dataset.schema.fields,
            {
              ...fieldData,
              id: `field_${Date.now()}`,
              displayOrder: dataset.schema.fields.length
            } as DatasetField
          ];

      await datasetService.updateDataset(
        dataset.id,
        {
          schema: {
            ...dataset.schema,
            fields: updatedFields
          }
        },
        'current-user-id' // TODO: Get from auth
      );

      setDialogOpen(false);
      setFieldData({});
      setEditingField(null);
      onRefresh();
    } catch (err) {
      console.error('Error saving field:', err);
      setError('Failed to save field');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const updatedFields = dataset.schema.fields.filter(f => f.id !== fieldId);

      await datasetService.updateDataset(
        dataset.id,
        {
          schema: {
            ...dataset.schema,
            fields: updatedFields
          }
        },
        'current-user-id'
      );

      onRefresh();
    } catch (err) {
      console.error('Error deleting field:', err);
      setError('Failed to delete field');
    }
  };

  const getFieldTypeColor = (type: DatasetFieldType) => {
    const colors: Record<string, any> = {
      string: 'default',
      number: 'primary',
      boolean: 'secondary',
      date: 'info',
      email: 'success',
      select: 'warning'
    };
    return colors[type] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Dataset Schema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage fields and validation rules for this dataset
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddField}
        >
          Add Field
        </Button>
      </Box>

      {/* Schema Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Schema Version
            </Typography>
            <Typography variant="body1">{dataset.schema.version}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Fields
            </Typography>
            <Typography variant="body1">{dataset.schema.fields.length}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Required Fields
            </Typography>
            <Typography variant="body1">
              {dataset.schema.fields.filter(f => f.required).length}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Fields Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell><strong>Field Name</strong></TableCell>
              <TableCell><strong>Label</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Required</strong></TableCell>
              <TableCell><strong>Searchable</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.schema.fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No fields defined. Add your first field to get started.
                </TableCell>
              </TableRow>
            ) : (
              dataset.schema.fields.map((field) => (
                <TableRow key={field.id} hover>
                  <TableCell>
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {field.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>
                    <Chip
                      label={field.type}
                      size="small"
                      color={getFieldTypeColor(field.type) as any}
                    />
                  </TableCell>
                  <TableCell>
                    {field.required ? (
                      <Chip label="Yes" size="small" color="error" />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    {field.isSearchable ? (
                      <Chip label="Yes" size="small" color="primary" />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditField(field)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Field Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingField ? 'Edit Field' : 'Add New Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Field Name"
              value={fieldData.name || ''}
              onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
              placeholder="e.g., email_address"
              helperText="Use lowercase with underscores"
              required
              fullWidth
            />
            <TextField
              label="Field Label"
              value={fieldData.label || ''}
              onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
              placeholder="e.g., Email Address"
              helperText="Display name for this field"
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={fieldData.type || 'string'}
                onChange={(e) => setFieldData({ ...fieldData, type: e.target.value as DatasetFieldType })}
                label="Field Type"
              >
                {FIELD_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={fieldData.description || ''}
              onChange={(e) => setFieldData({ ...fieldData, description: e.target.value })}
              multiline
              rows={2}
              placeholder="Optional description"
              fullWidth
            />
            <TextField
              label="Placeholder"
              value={fieldData.placeholder || ''}
              onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
              placeholder="Optional placeholder text"
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={fieldData.required || false}
                  onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                />
              }
              label="Required Field"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={fieldData.isSearchable || false}
                  onChange={(e) => setFieldData({ ...fieldData, isSearchable: e.target.checked })}
                />
              }
              label="Searchable"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={fieldData.isSortable || false}
                  onChange={(e) => setFieldData({ ...fieldData, isSortable: e.target.checked })}
                />
              }
              label="Sortable"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveField} variant="contained">
            {editingField ? 'Save Changes' : 'Add Field'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
