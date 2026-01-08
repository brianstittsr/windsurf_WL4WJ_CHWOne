'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { 
  CLASS_SCHEDULES, 
  COUNTIES, 
  t, 
  Language 
} from '@/lib/translations/digitalLiteracy';

interface RegistrationFormData {
  registrationDate: string;
  classTime: string;
  studentName: string;
  email: string;
  phone: string;
  county: string;
}

interface BilingualRegistrationFormProps {
  onSubmit?: (data: RegistrationFormData) => Promise<void>;
  classEnrollments?: { [classId: string]: number };
}

export default function BilingualRegistrationForm({ 
  onSubmit,
  classEnrollments = {}
}: BilingualRegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    registrationDate: new Date().toISOString().split('T')[0],
    classTime: '',
    studentName: '',
    email: '',
    phone: '',
    county: '',
  });
  
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'classFull' | 'emailExists'>('idle');

  const MAX_STUDENTS_PER_CLASS = 18;

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};
    
    if (!formData.classTime) {
      newErrors.classTime = 'required';
    }
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'required';
    } else if (!/^\d{3}[-.]?\d{3}[-.]?\d{4}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'invalid';
    }
    
    if (!formData.county) {
      newErrors.county = 'required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if class is full
    const currentEnrollment = classEnrollments[formData.classTime] || 0;
    if (currentEnrollment >= MAX_STUDENTS_PER_CLASS) {
      setSubmitStatus('classFull');
      return;
    }
    
    setSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSubmitStatus('success');
      // Reset form on success
      setFormData({
        registrationDate: new Date().toISOString().split('T')[0],
        classTime: '',
        studentName: '',
        email: '',
        phone: '',
        county: '',
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_EXISTS') {
        setSubmitStatus('emailExists');
      } else {
        setSubmitStatus('error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof RegistrationFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getErrorMessage = (field: keyof RegistrationFormData): string => {
    const error = errors[field];
    if (!error) return '';
    
    if (error === 'required') {
      return 'This field is required | Este campo es requerido';
    }
    if (error === 'invalid' && field === 'email') {
      return 'Please enter a valid email | Por favor ingrese un correo válido';
    }
    if (error === 'invalid' && field === 'phone') {
      return 'Please enter a valid phone number | Por favor ingrese un número válido';
    }
    return '';
  };

  const isClassFull = (classId: string): boolean => {
    return (classEnrollments[classId] || 0) >= MAX_STUDENTS_PER_CLASS;
  };

  return (
    <Card elevation={3} sx={{ maxWidth: 700, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            DIGITAL LITERACY PROGRAM REGISTRATION
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary.dark">
            REGISTRO DEL PROGRAMA DE ALFABETIZACIÓN DIGITAL
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Please complete all fields below to register for the Digital Literacy Program.
            You will receive confirmation via email.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Por favor complete todos los campos a continuación para registrarse en el
            Programa de Alfabetización Digital. Recibirá una confirmación por correo electrónico.
          </Typography>
        </Box>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              ✓ REGISTRATION COMPLETE | REGISTRO COMPLETO
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Thank you for registering! You will receive a confirmation email shortly with your class details.
            </Typography>
            <Typography variant="body2">
              ¡Gracias por registrarse! Recibirá un correo electrónico de confirmación en breve con los detalles de su clase.
            </Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
              See you in class! | ¡Nos vemos en clase!
            </Typography>
          </Alert>
        )}

        {/* Class Full Error */}
        {submitStatus === 'classFull' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              ⚠ CLASS FULL | CLASE COMPLETA
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This class has reached maximum capacity (18 students). Please select a different time.
            </Typography>
            <Typography variant="body2">
              Esta clase ha alcanzado su capacidad máxima (18 estudiantes). Por favor seleccione un horario diferente.
            </Typography>
          </Alert>
        )}

        {/* Email Exists Error */}
        {submitStatus === 'emailExists' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              ⚠ EMAIL ALREADY REGISTERED | CORREO YA REGISTRADO
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This email is already registered for a class. If you need to change your registration, please contact us.
            </Typography>
            <Typography variant="body2">
              Este correo electrónico ya está registrado para una clase. Si necesita cambiar su registro, por favor contáctenos.
            </Typography>
          </Alert>
        )}

        {/* General Error */}
        {submitStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              An error occurred. Please try again. | Ocurrió un error. Por favor intente de nuevo.
            </Typography>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Registration Date */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Registration Date | Fecha de Registro
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={formData.registrationDate}
              onChange={handleChange('registrationDate')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Select the date you are registering | Seleccione la fecha en que se registra"
            />
          </Box>

          {/* Class Time */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Select Your Class Time | Seleccione su Horario de Clase *
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.classTime}
              onChange={handleChange('classTime')}
              error={!!errors.classTime}
              helperText={
                errors.classTime 
                  ? getErrorMessage('classTime')
                  : 'Each class is limited to 18 students | Cada clase está limitada a 18 estudiantes'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="" disabled>
                -- Select | Seleccionar --
              </MenuItem>
              {CLASS_SCHEDULES.map((schedule) => (
                <MenuItem 
                  key={schedule.id} 
                  value={schedule.id}
                  disabled={isClassFull(schedule.id)}
                >
                  {schedule.en} | {schedule.es}
                  {isClassFull(schedule.id) && ' (FULL | COMPLETO)'}
                  {!isClassFull(schedule.id) && classEnrollments[schedule.id] && 
                    ` (${classEnrollments[schedule.id]}/18)`
                  }
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Student Name */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Student Name | Nombre del Estudiante *
            </Typography>
            <TextField
              fullWidth
              value={formData.studentName}
              onChange={handleChange('studentName')}
              placeholder="First Name Last Name | Nombre Apellido"
              error={!!errors.studentName}
              helperText={
                errors.studentName 
                  ? getErrorMessage('studentName')
                  : 'Enter your full name | Ingrese su nombre completo'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Email Address */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Email Address | Correo Electrónico *
            </Typography>
            <TextField
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="your.email@example.com"
              error={!!errors.email}
              helperText={
                errors.email 
                  ? getErrorMessage('email')
                  : 'We will send confirmation to this email | Enviaremos confirmación a este correo'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Phone Number */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Phone Number | Número de Teléfono *
            </Typography>
            <TextField
              fullWidth
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="XXX-XXX-XXXX"
              error={!!errors.phone}
              helperText={
                errors.phone 
                  ? getErrorMessage('phone')
                  : 'Include area code | Incluya código de área'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* County */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              County of Residence | Condado de Residencia *
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.county}
              onChange={handleChange('county')}
              error={!!errors.county}
              helperText={errors.county ? getErrorMessage('county') : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="" disabled>
                -- Select Your County | Seleccione su Condado --
              </MenuItem>
              {COUNTIES.map((county) => (
                <MenuItem key={county.id} value={county.id}>
                  {county.en} | {county.es}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ 
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              }
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Registering... | Registrando...
              </>
            ) : (
              'Register | Registrarse'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
