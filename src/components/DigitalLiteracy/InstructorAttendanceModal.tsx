'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

// Class/Unit options
const UNITS = [
  { id: 'unit1', label: 'Unidad 1: Introducción a Navegando el Mundo Digital' },
  { id: 'unit2', label: 'Unidad 2: Conociendo las computadoras y Dispositivos móviles' },
  { id: 'unit3', label: 'Unidad 3: Habilidades Básicas de Internet' },
  { id: 'unit4', label: 'Unidad 4: Correo Electrónico y comunicación' },
  { id: 'unit5', label: 'Unidad 5: Conceptos Básicos de Redes Sociales' },
  { id: 'unit6', label: 'Unidad 6: Utilización de Servicios en Línea' },
  { id: 'unit7', label: 'Unidad 7: Creación de Contenido Digital con Google Suite' },
  { id: 'unit8', label: 'Unidad 8: Herramientas Digitales para la Vida Diaria' },
  { id: 'unit9', label: 'Unidad 9: Seguridad y Privacidad en Línea' },
  { id: 'unit10', label: 'Unidad 10: Revisión del Curso y Aplicaciones Prácticas' },
];

const LOCATIONS = [
  { id: 'moore', label: 'Moore County' },
  { id: 'montgomery', label: 'Montgomery County' },
];

const TOPICS = [
  'Introduction to Digital World',
  'Computer Basics',
  'Internet Skills',
  'Email Communication',
  'Social Media',
  'Online Services',
  'Google Suite',
  'Digital Tools',
  'Online Security',
  'Course Review',
  'Device Delivery',
];

interface Student {
  id: string;
  name: string;
  email: string;
  present: boolean;
}

interface AttendanceRecord {
  instructorName: string;
  date: string;
  location: string;
  topic: string;
  unitsCompleted: string[];
  students: Student[];
}

interface InstructorAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (record: AttendanceRecord) => Promise<void>;
  programId?: string;
}

export default function InstructorAttendanceModal({
  open,
  onClose,
  onSave,
  programId,
}: InstructorAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [instructorName, setInstructorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState('');
  const [unitsCompleted, setUnitsCompleted] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // Fetch registered students
  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkin/students');
      if (response.ok) {
        const data = await response.json();
        const studentList = (data.students || []).map((s: any) => ({
          ...s,
          present: false,
        }));
        setAllStudents(studentList);
        setStudents(studentList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePresent = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, present: !s.present } : s
      )
    );
  };

  const handleSelectAll = () => {
    const allPresent = students.every(s => s.present);
    setStudents(prev => prev.map(s => ({ ...s, present: !allPresent })));
  };

  const handleSave = async () => {
    if (!instructorName || !date || !location || !topic) {
      setError('Please fill in all required fields');
      return;
    }

    const presentStudents = students.filter(s => s.present);
    if (presentStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const record: AttendanceRecord = {
        instructorName,
        date,
        location,
        topic,
        unitsCompleted,
        students: presentStudents,
      };

      if (onSave) {
        await onSave(record);
      } else {
        // Default save to API
        const response = await fetch('/api/attendance/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...record,
            programId,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save attendance');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setInstructorName('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setTopic('');
    setUnitsCompleted([]);
    setStudents(allStudents.map(s => ({ ...s, present: false })));
    setError('');
    setSuccess(false);
  };

  const presentCount = students.filter(s => s.present).length;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      container={() => document.body}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">Record Class Attendance</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Attendance recorded successfully for {presentCount} students!
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Class Details */}
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Class Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField
                label="Instructor Name"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <FormControl fullWidth size="small" required>
                <InputLabel>Location</InputLabel>
                <Select
                  value={location}
                  label="Location"
                  onChange={(e) => setLocation(e.target.value)}
                  startAdornment={<LocationIcon color="action" sx={{ mr: 1 }} />}
                >
                  {LOCATIONS.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" required>
                <InputLabel>Topic</InputLabel>
                <Select
                  value={topic}
                  label="Topic"
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {TOPICS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Units Completed */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Units Completed
            </Typography>
            <Autocomplete
              multiple
              options={UNITS}
              getOptionLabel={(option) => option.label}
              value={UNITS.filter(u => unitsCompleted.includes(u.id))}
              onChange={(_, newValue) => setUnitsCompleted(newValue.map(v => v.id))}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select units covered in this class" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.id.replace('unit', 'Unit ')}
                    size="small"
                    color="primary"
                  />
                ))
              }
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Student Attendance */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Student Attendance ({presentCount} / {students.length})
              </Typography>
              <Button size="small" onClick={handleSelectAll}>
                {students.every(s => s.present) ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : students.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={students.length > 0 && students.every(s => s.present)}
                          indeterminate={students.some(s => s.present) && !students.every(s => s.present)}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell align="center"><strong>Present</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow 
                        key={student.id}
                        hover
                        onClick={() => handleTogglePresent(student.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={student.present} />
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell align="center">
                          {student.present && (
                            <Chip label="Present" size="small" color="success" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No students registered. Please register students first.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || success}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : `Save Attendance (${presentCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
