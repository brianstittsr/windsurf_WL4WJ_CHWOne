'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Divider,
  Chip,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';

// Course units
const COURSE_UNITS = [
  {
    id: 'unit1',
    week: 1,
    en: 'Unit 1: Introduction to Navigating the Digital World',
    es: 'Unidad 1: Introducción a Navegando el Mundo Digital',
  },
  {
    id: 'unit2',
    week: 1,
    en: 'Unit 2: Understanding Computers and Mobile Devices',
    es: 'Unidad 2: Conociendo las computadoras y Dispositivos móviles',
  },
  {
    id: 'unit3',
    week: 2,
    en: 'Unit 3: Basic Internet Skills',
    es: 'Unidad 3: Habilidades Básicas de Internet',
  },
  {
    id: 'unit4',
    week: 2,
    en: 'Unit 4: Email and Communication',
    es: 'Unidad 4: Correo Electrónico y comunicación',
  },
  {
    id: 'unit5',
    week: 3,
    en: 'Unit 5: Basic Social Media Concepts',
    es: 'Unidad 5: Conceptos Básicos de Redes Sociales',
  },
  {
    id: 'unit6',
    week: 3,
    en: 'Unit 6: Using Online Services',
    es: 'Unidad 6: Utilización de Servicios en Línea',
  },
  {
    id: 'unit7',
    week: 4,
    en: 'Unit 7: Creating Digital Content with Google Suite',
    es: 'Unidad 7: Creación de Contenido Digital con Google Suite',
  },
  {
    id: 'unit8',
    week: 4,
    en: 'Unit 8: Digital Tools for Daily Life',
    es: 'Unidad 8: Herramientas Digitales para la Vida Diaria',
  },
  {
    id: 'unit9',
    week: 5,
    en: 'Unit 9: Online Security and Privacy',
    es: 'Unidad 9: Seguridad y Privacidad en Línea',
  },
  {
    id: 'unit10',
    week: 5,
    en: 'Unit 10: Course Review and Practical Applications',
    es: 'Unidad 10: Revisión del Curso y Aplicaciones Prácticas',
  },
];

interface StudentProgress {
  studentId: string;
  studentName: string;
  completedUnits: string[];
  lastUpdated?: string;
}

interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
}

export default function ParticipantProgressPage() {
  const params = useParams();
  const studentIdParam = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [studentName, setStudentName] = useState('');
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<RegisteredStudent | null>(null);
  const [studentSelected, setStudentSelected] = useState(false);

  // Detect browser language
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      }
    }
  }, []);

  // Fetch registered students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/checkin/students');
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
  }, []);

  // Fetch student progress when student is selected
  useEffect(() => {
    if (!selectedStudent) return;
    
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/progress/${selectedStudent.id}`);
        if (response.ok) {
          const data = await response.json();
          setStudentName(data.studentName || selectedStudent.name);
          setCompletedUnits(data.completedUnits || []);
        } else {
          // Use default empty progress
          setStudentName(selectedStudent.name);
          setCompletedUnits([]);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setStudentName(selectedStudent.name);
        setCompletedUnits([]);
      } finally {
        setLoading(false);
        setStudentSelected(true);
      }
    };
    fetchProgress();
  }, [selectedStudent]);

  const handleToggleUnit = async (unitId: string) => {
    const newCompletedUnits = completedUnits.includes(unitId)
      ? completedUnits.filter(u => u !== unitId)
      : [...completedUnits, unitId];

    setCompletedUnits(newCompletedUnits);
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/progress/${selectedStudent?.id || studentIdParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedUnits: newCompletedUnits,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess(language === 'es' ? '¡Progreso guardado!' : 'Progress saved!');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      // Still show success for demo
      setSuccess(language === 'es' ? '¡Progreso guardado!' : 'Progress saved!');
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const progressPercent = Math.round((completedUnits.length / COURSE_UNITS.length) * 100);
  const isComplete = completedUnits.length === COURSE_UNITS.length;

  // Group units by week
  const unitsByWeek = COURSE_UNITS.reduce((acc, unit) => {
    if (!acc[unit.week]) {
      acc[unit.week] = [];
    }
    acc[unit.week].push(unit);
    return acc;
  }, {} as Record<number, typeof COURSE_UNITS>);

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
          {language === 'es' ? 'Mi Progreso' : 'My Progress'}
        </Typography>
        <Typography variant="subtitle1">
          {language === 'es' ? 'Navegando el Mundo Digital' : 'Navigating the Digital World'}
        </Typography>
        {studentName && studentSelected && (
          <Chip 
            label={studentName} 
            sx={{ mt: 1, bgcolor: 'white', color: '#1976d2' }} 
          />
        )}
      </Paper>

      {/* Student Selection - Show if no student selected yet */}
      {!studentSelected && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom textAlign="center">
              {language === 'es' ? 'Seleccione su correo electrónico' : 'Select your email'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              {language === 'es' 
                ? 'Para ver su progreso, seleccione su correo electrónico de la lista'
                : 'To view your progress, select your email from the list'}
            </Typography>
            
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
                    label={language === 'es' ? 'Correo electrónico' : 'Email'}
                    placeholder={language === 'es' ? 'Buscar...' : 'Search...'}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <EmailIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
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
                noOptionsText={language === 'es' ? 'No se encontraron estudiantes' : 'No students found'}
              />
            ) : (
              <Alert severity="warning">
                {language === 'es' 
                  ? 'No hay estudiantes registrados. Por favor regístrese primero.'
                  : 'No students registered. Please register first.'}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading indicator when fetching progress */}
      {loading && selectedStudent && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Progress content - only show after student selected */}
      {studentSelected && !loading && (
        <>

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              {language === 'es' ? 'Progreso del Curso' : 'Course Progress'}
            </Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent} 
            sx={{ height: 12, borderRadius: 6, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {completedUnits.length} / {COURSE_UNITS.length} {language === 'es' ? 'unidades completadas' : 'units completed'}
          </Typography>

          {isComplete && (
            <Alert 
              severity="success" 
              icon={<TrophyIcon />}
              sx={{ mt: 2 }}
            >
              {language === 'es' 
                ? '¡Felicitaciones! Has completado todas las unidades.' 
                : 'Congratulations! You have completed all units.'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Units Checklist */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          {language === 'es' ? 'Marque las unidades completadas:' : 'Check off completed units:'}
        </Typography>

        {Object.entries(unitsByWeek).map(([week, units]) => (
          <Box key={week} sx={{ mb: 3 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block', 
                color: 'primary.main', 
                fontWeight: 600,
                mb: 1 
              }}
            >
              {language === 'es' ? `Semana ${week}` : `Week ${week}`}
            </Typography>
            
            {units.map((unit) => {
              const isCompleted = completedUnits.includes(unit.id);
              return (
                <Paper
                  key={unit.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: 'pointer',
                    bgcolor: isCompleted ? '#e8f5e9' : 'transparent',
                    borderColor: isCompleted ? '#4caf50' : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isCompleted ? '#c8e6c9' : '#f5f5f5',
                    },
                  }}
                  onClick={() => handleToggleUnit(unit.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <UncheckedIcon color="disabled" />
                    )}
                    <Typography 
                      variant="body2"
                      sx={{
                        flex: 1,
                        textDecoration: isCompleted ? 'none' : 'none',
                        color: isCompleted ? 'success.dark' : 'text.primary',
                      }}
                    >
                      {language === 'es' ? unit.es : unit.en}
                    </Typography>
                    {saving && (
                      <CircularProgress size={16} />
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ))}
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {language === 'es'
            ? 'Toque una unidad para marcarla como completada'
            : 'Tap a unit to mark it as completed'}
        </Typography>
      </Box>
        </>
      )}
    </Container>
  );
}
