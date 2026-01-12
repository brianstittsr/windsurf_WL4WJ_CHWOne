'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, User, Calendar, MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react';
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
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-blue-600 mb-1">
            DIGITAL LITERACY PROGRAM REGISTRATION
          </h2>
          <h3 className="text-lg font-bold text-blue-700">
            REGISTRO DEL PROGRAMA DE ALFABETIZACIÓN DIGITAL
          </h3>
          
          <hr className="my-4" />
          
          <p className="text-sm text-muted-foreground mb-2">
            Please complete all fields below to register for the Digital Literacy Program.
            You will receive confirmation via email.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor complete todos los campos a continuación para registrarse en el
            Programa de Alfabetización Digital. Recibirá una confirmación por correo electrónico.
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">✓ REGISTRATION COMPLETE | REGISTRO COMPLETO</AlertTitle>
            <AlertDescription className="text-green-700">
              <p className="mt-1">Thank you for registering! You will receive a confirmation email shortly with your class details.</p>
              <p>¡Gracias por registrarse! Recibirá un correo electrónico de confirmación en breve con los detalles de su clase.</p>
              <p className="font-medium mt-2">See you in class! | ¡Nos vemos en clase!</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Class Full Error */}
        {submitStatus === 'classFull' && (
          <Alert className="mb-6 border-amber-500 bg-amber-50">
            <AlertTitle className="text-amber-800">⚠ CLASS FULL | CLASE COMPLETA</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p className="mt-1">This class has reached maximum capacity (18 students). Please select a different time.</p>
              <p>Esta clase ha alcanzado su capacidad máxima (18 estudiantes). Por favor seleccione un horario diferente.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Email Exists Error */}
        {submitStatus === 'emailExists' && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>⚠ EMAIL ALREADY REGISTERED | CORREO YA REGISTRADO</AlertTitle>
            <AlertDescription>
              <p className="mt-1">This email is already registered for a class. If you need to change your registration, please contact us.</p>
              <p>Este correo electrónico ya está registrado para una clase. Si necesita cambiar su registro, por favor contáctenos.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* General Error */}
        {submitStatus === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              An error occurred. Please try again. | Ocurrió un error. Por favor intente de nuevo.
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Registration Date */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Registration Date | Fecha de Registro
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={formData.registrationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Select the date you are registering | Seleccione la fecha en que se registra</p>
          </div>

          {/* Class Time */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Select Your Class Time | Seleccione su Horario de Clase *
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.classTime} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, classTime: value }));
                if (errors.classTime) setErrors(prev => ({ ...prev, classTime: undefined }));
              }}>
                <SelectTrigger className={`pl-10 ${errors.classTime ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="-- Select | Seleccionar --" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SCHEDULES.map((schedule) => (
                    <SelectItem 
                      key={schedule.id} 
                      value={schedule.id}
                      disabled={isClassFull(schedule.id)}
                    >
                      {schedule.en} | {schedule.es}
                      {isClassFull(schedule.id) && ' (FULL | COMPLETO)'}
                      {!isClassFull(schedule.id) && classEnrollments[schedule.id] && 
                        ` (${classEnrollments[schedule.id]}/18)`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.classTime ? (
              <p className="text-xs text-red-500">{getErrorMessage('classTime')}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Each class is limited to 18 students | Cada clase está limitada a 18 estudiantes</p>
            )}
          </div>

          {/* Student Name */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Student Name | Nombre del Estudiante *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.studentName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, studentName: e.target.value }));
                  if (errors.studentName) setErrors(prev => ({ ...prev, studentName: undefined }));
                }}
                placeholder="First Name Last Name | Nombre Apellido"
                className={`pl-10 ${errors.studentName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.studentName ? (
              <p className="text-xs text-red-500">{getErrorMessage('studentName')}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Enter your full name | Ingrese su nombre completo</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Email Address | Correo Electrónico *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="your.email@example.com"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-red-500">{getErrorMessage('email')}</p>
            ) : (
              <p className="text-xs text-muted-foreground">We will send confirmation to this email | Enviaremos confirmación a este correo</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="font-semibold">
              Phone Number | Número de Teléfono *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.phone}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, phone: e.target.value }));
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                placeholder="XXX-XXX-XXXX"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone ? (
              <p className="text-xs text-red-500">{getErrorMessage('phone')}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Include area code | Incluya código de área</p>
            )}
          </div>

          {/* County */}
          <div className="space-y-2">
            <Label className="font-semibold">
              County of Residence | Condado de Residencia *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.county} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, county: value }));
                if (errors.county) setErrors(prev => ({ ...prev, county: undefined }));
              }}>
                <SelectTrigger className={`pl-10 ${errors.county ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="-- Select Your County | Seleccione su Condado --" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTIES.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.en} | {county.es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.county && (
              <p className="text-xs text-red-500">{getErrorMessage('county')}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
