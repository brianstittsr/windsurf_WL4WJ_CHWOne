'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
  Toolbar,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { datasetService } from '@/services/DatasetService';
import { Dataset, DatasetRecord } from '@/types/dataset.types';

interface DataTabProps {
  dataset: Dataset;
  onRefresh: () => void;
}

export default function DataTab({ dataset, onRefresh }: DataTabProps) {
  const [records, setRecords] = useState<DatasetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<DatasetRecord | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, [dataset.id, page, rowsPerPage, searchQuery]);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await datasetService.queryRecords({
        datasetId: dataset.id,
        page: page + 1,
        pageSize: rowsPerPage,
        search: searchQuery || undefined
      });

      setRecords(result.records);
      setTotalRecords(result.total);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRecords(records.map(r => r.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, record: DatasetRecord) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRecord(null);
  };

  const handleAddRecord = () => {
    // Initialize with empty values for all fields
    const initialData: Record<string, any> = {};
    dataset.schema.fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setNewRecordData(initialData);
    setAddDialogOpen(true);
  };

  const handleSaveNewRecord = async () => {
    try {
      await datasetService.createRecord(
        dataset.id,
        {
          datasetId: dataset.id,
          data: newRecordData,
          status: 'active'
        },
        'current-user-id' // TODO: Get from auth
      );
      setAddDialogOpen(false);
      setNewRecordData({});
      loadRecords();
      onRefresh();
    } catch (err) {
      console.error('Error creating record:', err);
      setError('Failed to create record');
    }
  };

  const handleEditRecord = () => {
    if (selectedRecord) {
      setNewRecordData(selectedRecord.data);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSaveEditRecord = async () => {
    if (!selectedRecord) return;

    try {
      await datasetService.updateRecord(
        selectedRecord.id,
        { data: newRecordData },
        'current-user-id' // TODO: Get from auth
      );
      setEditDialogOpen(false);
      setNewRecordData({});
      setSelectedRecord(null);
      loadRecords();
    } catch (err) {
      console.error('Error updating record:', err);
      setError('Failed to update record');
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await datasetService.deleteRecord(selectedRecord.id, 'current-user-id');
        loadRecords();
        onRefresh();
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record');
      }
    }
    handleMenuClose();
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedRecords.length} record(s)?`)) {
      try {
        await Promise.all(
          selectedRecords.map(id => datasetService.deleteRecord(id, 'current-user-id'))
        );
        setSelectedRecords([]);
        loadRecords();
        onRefresh();
      } catch (err) {
        console.error('Error deleting records:', err);
        setError('Failed to delete records');
      }
    }
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Toolbar sx={{ pl: 0, pr: 0, mb: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          {selectedRecords.length > 0 && (
            <Chip
              label={`${selectedRecords.length} selected`}
              onDelete={() => setSelectedRecords([])}
              color="primary"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedRecords.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              size="small"
            >
              Delete Selected
            </Button>
          )}
          <IconButton onClick={loadRecords} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRecord}
          >
            Add Record
          </Button>
        </Box>
      </Toolbar>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRecords.length > 0 && selectedRecords.length < records.length}
                  checked={records.length > 0 && selectedRecords.length === records.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {dataset.schema.fields.slice(0, 5).map((field) => (
                <TableCell key={field.id}>
                  <strong>{field.label}</strong>
                </TableCell>
              ))}
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={dataset.schema.fields.length + 3} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={dataset.schema.fields.length + 3} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => handleSelectRecord(record.id)}
                    />
                  </TableCell>
                  {dataset.schema.fields.slice(0, 5).map((field) => (
                    <TableCell key={field.id}>
                      {renderCellValue(record.data[field.name])}
                    </TableCell>
                  ))}
                  <TableCell>
                    {record.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, record)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalRecords}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditRecord}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteRecord} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Record Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dataset.schema.fields.map((field) => (
              <TextField
                key={field.id}
                label={field.label}
                value={newRecordData[field.name] || ''}
                onChange={(e) => setNewRecordData({
                  ...newRecordData,
                  [field.name]: e.target.value
                })}
                required={field.required}
                type={field.type === 'number' ? 'number' : 'text'}
                fullWidth
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNewRecord} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dataset.schema.fields.map((field) => (
              <TextField
                key={field.id}
                label={field.label}
                value={newRecordData[field.name] || ''}
                onChange={(e) => setNewRecordData({
                  ...newRecordData,
                  [field.name]: e.target.value
                })}
                required={field.required}
                type={field.type === 'number' ? 'number' : 'text'}
                fullWidth
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEditRecord} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
