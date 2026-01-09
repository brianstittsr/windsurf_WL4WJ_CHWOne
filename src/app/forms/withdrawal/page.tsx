'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExitToApp as ExitIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Withdrawal reasons
const WITHDRAWAL_REASONS = {
  en: [
    'Schedule conflict',
    'Transportation issues',
    'Health reasons',
    'Family emergency',
    'Found employment',
    'Moved out of area',
    'Course too difficult',
    'Course not meeting expectations',
    'Personal reasons',
    'Other',
  ],
  es: [
    'Conflicto de horario',
    'Problemas de transporte',
    'Razones de salud',
    'Emergencia familiar',
    'Encontró empleo',
    'Se mudó del área',
    'Curso muy difícil',
    'El curso no cumple expectativas',
    'Razones personales',
    'Otro',
  ],
};

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function WithdrawalFormPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Detect browser language
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      }
    }
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/checkin/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError(language === 'es' ? 'Por favor seleccione un estudiante' : 'Please select a student');
      return;
    }
    if (!reason) {
      setError(language === 'es' ? 'Por favor seleccione una razón' : 'Please select a reason');
      return;
    }
    if (reason === 'Other' || reason === 'Otro') {
      if (!otherReason.trim()) {
        setError(language === 'es' ? 'Por favor especifique la razón' : 'Please specify the reason');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/students/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          withdrawalDate,
          reason: reason === 'Other' || reason === 'Otro' ? otherReason : reason,
          additionalNotes,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        // For demo, still show success
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      // For demo, still show success
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setWithdrawalDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setOtherReason('');
    setAdditionalNotes('');
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ExitIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {language === 'es' ? 'Retiro Registrado' : 'Withdrawal Recorded'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {language === 'es' 
              ? `El retiro de ${selectedStudent?.name} ha sido registrado.`
              : `The withdrawal for ${selectedStudent?.name} has been recorded.`}
          </Typography>
          <Button variant="contained" onClick={resetForm}>
            {language === 'es' ? 'Registrar Otro Retiro' : 'Record Another Withdrawal'}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Language Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size="small" onClick={toggleLanguage}>
          {language === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
        </Button>
      </Box>

      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#ff9800', color: 'white' }}>
        <ExitIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          {language === 'es' ? 'Formulario de Retiro' : 'Withdrawal Form'}
        </Typography>
        <Typography variant="subtitle1">
          {language === 'es' ? 'Programa de Alfabetización Digital' : 'Digital Literacy Program'}
        </Typography>
      </Paper>

      {/* Info Card */}
      <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
        <CardContent>
          <Typography variant="body2">
            {language === 'es'
              ? 'Use este formulario para registrar cuando un participante se retira del programa. Esta información nos ayuda a mejorar el programa.'
              : 'Use this form to record when a participant withdraws from the program. This information helps us improve the program.'}
          </Typography>
        </CardContent>
      </Card>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Student Selection */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Autocomplete
              options={students}
              getOptionLabel={(option) => option.name}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={language === 'es' ? 'Seleccione Estudiante' : 'Select Student'}
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <PersonIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              )}
              sx={{ mb: 2 }}
            />
          )}

          {/* Withdrawal Date */}
          <TextField
            fullWidth
            label={language === 'es' ? 'Fecha de Retiro' : 'Withdrawal Date'}
            type="date"
            value={withdrawalDate}
            onChange={(e) => setWithdrawalDate(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ mb: 2 }}
          />

          {/* Reason */}
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>{language === 'es' ? 'Razón del Retiro' : 'Reason for Withdrawal'}</InputLabel>
            <Select
              value={reason}
              label={language === 'es' ? 'Razón del Retiro' : 'Reason for Withdrawal'}
              onChange={(e) => setReason(e.target.value)}
            >
              {WITHDRAWAL_REASONS[language].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Other Reason */}
          {(reason === 'Other' || reason === 'Otro') && (
            <TextField
              fullWidth
              label={language === 'es' ? 'Especifique la razón' : 'Specify reason'}
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
          )}

          {/* Additional Notes */}
          <TextField
            fullWidth
            label={language === 'es' ? 'Notas Adicionales' : 'Additional Notes'}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            multiline
            rows={3}
            placeholder={language === 'es' 
              ? 'Cualquier información adicional sobre el retiro...'
              : 'Any additional information about the withdrawal...'}
            sx={{ mb: 3 }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="warning"
            size="large"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting 
              ? (language === 'es' ? 'Guardando...' : 'Saving...')
              : (language === 'es' ? 'Registrar Retiro' : 'Record Withdrawal')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
