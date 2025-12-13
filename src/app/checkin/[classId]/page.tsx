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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';

// Class information for the Digital Literacy program
const CLASS_INFO: Record<string, { title: string; titleSpanish: string; units: string[] }> = {
  'class1': {
    title: 'Class 1',
    titleSpanish: 'Clase 1',
    units: [
      'Unidad 1: Introducción a Navegando el Mundo Digital',
      'Unidad 2: Conociendo las computadoras y Dispositivos móviles',
    ],
  },
  'class2': {
    title: 'Class 2',
    titleSpanish: 'Clase 2',
    units: [
      'Unidad 3: Habilidades Básicas de Internet',
      'Unidad 4: Correo Electrónico y comunicación',
    ],
  },
  'class3': {
    title: 'Class 3',
    titleSpanish: 'Clase 3',
    units: [
      'Unidad 5: Conceptos Básicos de Redes Sociales',
      'Unidad 6: Utilización de Servicios en Línea',
    ],
  },
  'class4': {
    title: 'Class 4',
    titleSpanish: 'Clase 4',
    units: [
      'Unidad 7: Creación de Contenido Digital con Google Suite',
      'Unidad 8: Herramientas Digitales para la Vida Diaria',
    ],
  },
  'class5': {
    title: 'Class 5',
    titleSpanish: 'Clase 5',
    units: [
      'Unidad 9: Seguridad y Privacidad en Línea',
      'Unidad 10: Revisión del Curso y Aplicaciones Prácticas',
    ],
  },
  'class6': {
    title: 'Class 6',
    titleSpanish: 'Clase 6',
    units: ['Entrega de Dispositivo digital (Digital Device Delivery)'],
  },
};

type CheckInStatus = 'idle' | 'loading' | 'success' | 'error' | 'not_found';

export default function ClassCheckInPage() {
  const params = useParams();
  const classId = params.classId as string;
  
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [studentName, setStudentName] = useState('');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  // Detect browser language
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      }
    }
  }, []);

  const classInfo = CLASS_INFO[classId];

  const handleCheckIn = async () => {
    if (!identifier.trim()) {
      setErrorMessage(language === 'es' 
        ? 'Por favor ingrese su correo electrónico o número de teléfono'
        : 'Please enter your email or phone number');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Call API to check in student
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          identifier: identifier.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setStudentName(data.studentName);
        setCheckInTime(new Date());
      } else if (data.error === 'not_found') {
        setStatus('not_found');
        setErrorMessage(language === 'es'
          ? 'No se encontró un estudiante con este correo/teléfono. ¿Ya se registró?'
          : 'No student found with this email/phone. Have you registered?');
      } else if (data.error === 'already_checked_in') {
        setStatus('success');
        setStudentName(data.studentName);
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
          Navegando el Mundo Digital
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
          {classInfo.units.map((unit, index) => (
            <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • {unit}
            </Typography>
          ))}
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
              ? 'Ingrese su correo electrónico o número de teléfono registrado'
              : 'Enter your registered email or phone number'}
          </Typography>

          <TextField
            fullWidth
            label={language === 'es' ? 'Correo Electrónico o Teléfono' : 'Email or Phone Number'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={language === 'es' ? 'ejemplo@email.com o (555) 555-5555' : 'example@email.com or (555) 555-5555'}
            disabled={status === 'loading'}
            sx={{ mb: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCheckIn();
              }
            }}
          />

          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {status === 'not_found' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errorMessage}
              <Button size="small" sx={{ ml: 1 }}>
                {language === 'es' ? 'Registrarse' : 'Register'}
              </Button>
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckIn}
            disabled={status === 'loading'}
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
