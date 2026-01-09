'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useParams, useSearchParams } from 'next/navigation';

// Class information for the Digital Literacy program
const CLASS_INFO: Record<string, { title: string; titleSpanish: string; unitsEn: string[]; unitsEs: string[] }> = {
  'class1': {
    title: 'Class 1',
    titleSpanish: 'Clase 1',
    unitsEn: [
      'Unit 1: Introduction to Navigating the Digital World',
      'Unit 2: Getting to know computers and mobile devices',
    ],
    unitsEs: [
      'Unidad 1: Introducción a Navegando el Mundo Digital',
      'Unidad 2: Conociendo las computadoras y Dispositivos móviles',
    ],
  },
  'class2': {
    title: 'Class 2',
    titleSpanish: 'Clase 2',
    unitsEn: [
      'Unit 3: Basic Internet Skills',
      'Unit 4: Email and Communication',
    ],
    unitsEs: [
      'Unidad 3: Habilidades Básicas de Internet',
      'Unidad 4: Correo Electrónico y comunicación',
    ],
  },
  'class3': {
    title: 'Class 3',
    titleSpanish: 'Clase 3',
    unitsEn: [
      'Unit 5: Basic Social Media Concepts',
      'Unit 6: Using Online Services',
    ],
    unitsEs: [
      'Unidad 5: Conceptos Básicos de Redes Sociales',
      'Unidad 6: Utilización de Servicios en Línea',
    ],
  },
  'class4': {
    title: 'Class 4',
    titleSpanish: 'Clase 4',
    unitsEn: [
      'Unit 7: Creating Digital Content with Google Suite',
      'Unit 8: Digital Tools for Daily Life',
    ],
    unitsEs: [
      'Unidad 7: Creación de Contenido Digital con Google Suite',
      'Unidad 8: Herramientas Digitales para la Vida Diaria',
    ],
  },
  'class5': {
    title: 'Class 5',
    titleSpanish: 'Clase 5',
    unitsEn: [
      'Unit 9: Online Security and Privacy',
      'Unit 10: Course Review and Practical Applications',
    ],
    unitsEs: [
      'Unidad 9: Seguridad y Privacidad en Línea',
      'Unidad 10: Revisión del Curso y Aplicaciones Prácticas',
    ],
  },
  'class6': {
    title: 'Class 6',
    titleSpanish: 'Clase 6',
    unitsEn: ['Digital Device Delivery'],
    unitsEs: ['Entrega de Dispositivo digital'],
  },
};

type CheckInStatus = 'idle' | 'loading' | 'success' | 'error' | 'not_found';

// Location options
const LOCATIONS = [
  { id: 'moore', en: 'Moore County', es: 'Condado de Moore' },
  { id: 'montgomery', en: 'Montgomery County', es: 'Condado de Montgomery' },
];

interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function ClassCheckInPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const classId = params.classId as string;
  const locationParam = searchParams.get('location');
  
  const [selectedStudent, setSelectedStudent] = useState<RegisteredStudent | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [studentName, setStudentName] = useState('');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [currentDate] = useState(new Date());
  const [location, setLocation] = useState(locationParam || '');

  // Detect browser language
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      }
    }
  }, []);

  // Fetch registered students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/checkin/students?classId=${classId}`);
        if (response.ok) {
          const data = await response.json();
          setRegisteredStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [classId]);

  const classInfo = CLASS_INFO[classId];

  const handleCheckIn = async () => {
    if (!selectedStudent) {
      setErrorMessage(language === 'es' 
        ? 'Por favor seleccione su nombre de la lista'
        : 'Please select your name from the list');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          location: location || locationParam,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setStudentName(selectedStudent.name);
        setCheckInTime(new Date());
      } else if (data.error === 'already_checked_in') {
        setStatus('success');
        setStudentName(selectedStudent.name);
        setCheckInTime(new Date(data.checkInTime));
        setErrorMessage(language === 'es'
          ? 'Ya está registrado para esta clase'
          : 'You are already checked in for this class');
      } else {
        setStatus('error');
        setErrorMessage(data.message || (language === 'es' ? 'Error al registrar' : 'Check-in failed'));
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setStatus('error');
      setErrorMessage(language === 'es'
        ? 'Error de conexión. Por favor intente de nuevo.'
        : 'Connection error. Please try again.');
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  if (!classInfo) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          {language === 'es' ? 'Clase no encontrada' : 'Class not found'}
        </Alert>
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
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#1976d2', color: 'white' }}>
        <SchoolIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          {language === 'es' ? 'Navegando el Mundo Digital' : 'Navigating the Digital World'}
        </Typography>
        <Typography variant="subtitle1">
          Fiesta Family Services
        </Typography>
      </Paper>

      {/* Class Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {language === 'es' ? classInfo.titleSpanish : classInfo.title}
          </Typography>
          <Divider sx={{ my: 1 }} />
          {(language === 'es' ? classInfo.unitsEs : classInfo.unitsEn).map((unit, index) => (
            <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • {unit}
            </Typography>
          ))}
        </CardContent>
      </Card>

      {/* Date and Location Info */}
      <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" fontSize="small" />
              <Typography variant="body2">
                {currentDate.toLocaleDateString(language === 'es' ? 'es-US' : 'en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            {location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" fontSize="small" />
                <Typography variant="body2">
                  {LOCATIONS.find(l => l.id === location)?.[language] || location}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Check-in Form or Success Message */}
      {status === 'success' ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" color="success.main" gutterBottom>
            {language === 'es' ? '¡Registro Exitoso!' : 'Check-in Successful!'}
          </Typography>
          {studentName && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              {language === 'es' ? 'Bienvenido/a' : 'Welcome'}, {studentName}!
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary">
            {language === 'es' ? classInfo.titleSpanish : classInfo.title}
          </Typography>
          {checkInTime && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {checkInTime.toLocaleString(language === 'es' ? 'es-US' : 'en-US')}
            </Typography>
          )}
          {errorMessage && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom textAlign="center">
            {language === 'es' ? 'Registrar Asistencia' : 'Check In'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {language === 'es'
              ? 'Seleccione su nombre de la lista para registrar su asistencia'
              : 'Select your name from the list to record your attendance'}
          </Typography>

          {/* Student Dropdown */}
          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : registeredStudents.length > 0 ? (
            <Autocomplete
              options={registeredStudents}
              getOptionLabel={(option) => option.email}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={language === 'es' ? 'Seleccione su correo electrónico' : 'Select your email'}
                  placeholder={language === 'es' ? 'Buscar...' : 'Search...'}
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
                    <Typography variant="body1">{option.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.name}
                    </Typography>
                  </Box>
                </li>
              )}
              sx={{ mb: 2 }}
              disabled={status === 'loading'}
              noOptionsText={language === 'es' ? 'No se encontraron estudiantes' : 'No students found'}
            />
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {language === 'es' 
                ? 'No hay estudiantes registrados para esta clase. Por favor regístrese primero.'
                : 'No students registered for this class. Please register first.'}
              <Button 
                size="small" 
                sx={{ ml: 1 }}
                href="/forms/digital-literacy"
              >
                {language === 'es' ? 'Registrarse' : 'Register'}
              </Button>
            </Alert>
          )}

          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckIn}
            disabled={status === 'loading' || !selectedStudent}
            sx={{ py: 1.5 }}
          >
            {status === 'loading' ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              language === 'es' ? 'Registrar Asistencia' : 'Check In'
            )}
          </Button>
        </Paper>
      )}

      {/* Footer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {language === 'es'
            ? '¿Problemas? Contacte al instructor'
            : 'Having issues? Contact your instructor'}
        </Typography>
      </Box>
    </Container>
  );
}
