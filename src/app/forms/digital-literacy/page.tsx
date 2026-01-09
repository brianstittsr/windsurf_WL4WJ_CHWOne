'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  Dashboard as DashboardIcon,
  QrCode as QrCodeIcon,
  School as InstructorIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { 
  BilingualRegistrationForm, 
  InstructorDashboard,
  InstructorRegistrationWizard,
  AIReportWizard,
  LanguageToggle,
  Student,
  CompletionData,
} from '@/components/DigitalLiteracy';
import { Language, CLASS_SCHEDULES } from '@/lib/translations/digitalLiteracy';

// Mock students data for demonstration
const generateMockStudents = (): Student[] => {
  const names = [
    'Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Martínez',
    'Luis García', 'Carmen López', 'José Hernández', 'Rosa Díaz',
    'Miguel Torres', 'Elena Ramírez', 'Pedro Flores', 'Isabel Morales',
    'Francisco Jiménez', 'Teresa Ruiz', 'Antonio Vargas', 'Patricia Castro',
    'Manuel Ortiz', 'Lucía Mendoza'
  ];
  
  const students: Student[] = [];
  
  CLASS_SCHEDULES.forEach((schedule, classIndex) => {
    // Add 12-18 students per class
    const studentsInClass = Math.floor(Math.random() * 7) + 12;
    
    for (let i = 0; i < Math.min(studentsInClass, names.length); i++) {
      const studentId = `S${String(classIndex * 100 + i + 1).padStart(3, '0')}`;
      const name = names[i];
      const nameParts = name.toLowerCase().split(' ');
      
      students.push({
        id: studentId,
        name: name,
        email: `${nameParts[0]}.${nameParts[1]}@email.com`,
        phone: `555-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        county: Math.random() > 0.5 ? 'moore' : 'montgomery',
        classId: schedule.id,
        registrationDate: new Date(2025, 0, Math.floor(Math.random() * 5) + 1).toISOString(),
        attendance: {
          present: Math.floor(Math.random() * 5) + 10,
          total: 15,
        },
        proficiencyAssessments: generateRandomAssessments(),
        isPresent: Math.random() > 0.2,
        completed: false,
      });
    }
  });
  
  return students;
};

const generateRandomAssessments = () => {
  const assessments: Student['proficiencyAssessments'] = {};
  const levels = ['beginning', 'developing', 'proficient', 'mastery'];
  const topicCodes = ['Class1A', 'Class1B', 'Class2A', 'Class2B', 'Class3A'];
  
  // Randomly assess some topics
  topicCodes.forEach(code => {
    if (Math.random() > 0.3) {
      assessments[code] = {
        level: levels[Math.floor(Math.random() * levels.length)],
        date: new Date(2025, 0, Math.floor(Math.random() * 15) + 1).toISOString(),
        assessedBy: 'María García',
      };
    }
  });
  
  return assessments;
};

function DigitalLiteracyContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [classEnrollments, setClassEnrollments] = useState<{ [classId: string]: number }>({});

  // Initialize mock data
  useEffect(() => {
    const mockStudents = generateMockStudents();
    setStudents(mockStudents);
    
    // Calculate enrollments per class
    const enrollments: { [classId: string]: number } = {};
    mockStudents.forEach(student => {
      enrollments[student.classId] = (enrollments[student.classId] || 0) + 1;
    });
    setClassEnrollments(enrollments);
  }, []);

  const handleRegistration = async (data: any) => {
    // Simulate registration
    console.log('Registration data:', data);
    
    // Check if email already exists
    const existingStudent = students.find(s => s.email === data.email);
    if (existingStudent) {
      throw new Error('EMAIL_EXISTS');
    }
    
    // Create new student
    const newStudent: Student = {
      id: `S${String(students.length + 1).padStart(3, '0')}`,
      name: data.studentName,
      email: data.email,
      phone: data.phone,
      county: data.county,
      classId: data.classTime,
      registrationDate: data.registrationDate,
      attendance: { present: 0, total: 0 },
      proficiencyAssessments: {},
      isPresent: false,
      completed: false,
    };
    
    setStudents(prev => [...prev, newStudent]);
    setClassEnrollments(prev => ({
      ...prev,
      [data.classTime]: (prev[data.classTime] || 0) + 1,
    }));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleUpdateAttendance = (studentId: string, isPresent: boolean) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          isPresent,
          attendance: {
            ...student.attendance,
            present: isPresent 
              ? student.attendance.present + 1 
              : Math.max(0, student.attendance.present - 1),
          },
        };
      }
      return student;
    }));
  };

  const handleUpdateProficiency = (studentId: string, topicCode: string, level: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          proficiencyAssessments: {
            ...student.proficiencyAssessments,
            [topicCode]: {
              level,
              date: new Date().toISOString(),
              assessedBy: 'María García',
            },
          },
        };
      }
      return student;
    }));
  };

  const handleSaveCompletion = (data: CompletionData) => {
    setStudents(prev => prev.map(student => {
      if (student.id === data.studentId) {
        return {
          ...student,
          completed: data.completed,
          completionDate: data.completionDate,
          tabletSerial: data.tabletSerial,
          nonCompletionReason: data.nonCompletionReason,
        };
      }
      return student;
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    ));
  };

  return (
    <UnifiedLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🌐 Digital Literacy Program
          </Typography>
          <Typography variant="h5">
            Programa de Alfabetización Digital
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Bilingual Student Tracking System | Sistema Bilingüe de Seguimiento de Estudiantes
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            108 students across 6 classes (18 students per class) | 108 estudiantes en 6 clases (18 estudiantes por clase)
          </Typography>
        </Paper>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              icon={<RegisterIcon />} 
              label="Student Registration | Registro de Estudiantes" 
              iconPosition="start"
            />
            <Tab 
              icon={<InstructorIcon />} 
              label="Instructor Registration | Registro de Instructor" 
              iconPosition="start"
            />
            <Tab 
              icon={<DashboardIcon />} 
              label="Instructor Dashboard | Panel del Instructor" 
              iconPosition="start"
            />
            <Tab 
              icon={<QrCodeIcon />} 
              label="QR Codes | Códigos QR" 
              iconPosition="start"
            />
            <Tab 
              icon={<ReportsIcon />} 
              label="AI Reports | Informes IA" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <BilingualRegistrationForm 
              onSubmit={handleRegistration}
              classEnrollments={classEnrollments}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <InstructorRegistrationWizard 
              onComplete={(data) => {
                console.log('Instructor registered:', data);
                setActiveTab(2); // Go to dashboard after registration
              }}
            />
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <InstructorDashboard
              students={students}
              onUpdateStudent={handleUpdateStudent}
              onUpdateAttendance={handleUpdateAttendance}
              onUpdateProficiency={handleUpdateProficiency}
              onSaveCompletion={handleSaveCompletion}
              instructorName="María García"
              programDirector="Dr. James Wilson"
            />
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              QR Code Management | Gestión de Códigos QR
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
              Generate and print QR codes for easy access to forms | Genere e imprima códigos QR para acceso fácil a formularios
            </Typography>
            
            <Grid container spacing={3}>
              {/* Student Registration QR */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', border: '2px solid #1976d2' }}>
                  <Box sx={{ 
                    width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: '#e3f2fd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: '2px dashed #1976d2'
                  }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: '#1976d2' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Student Registration
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
                    Registro de Estudiantes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    New students scan to register for classes | Nuevos estudiantes escanean para registrarse
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => setActiveTab(0)} sx={{ mr: 1 }}>
                    View Form | Ver
                  </Button>
                  <Button variant="outlined" size="small">
                    Print | Imprimir
                  </Button>
                </Paper>
              </Grid>

              {/* Daily Check-in QR */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', border: '2px solid #4caf50' }}>
                  <Box sx={{ 
                    width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: '#e8f5e9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: '2px dashed #4caf50'
                  }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    Daily Check-in
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="success.dark">
                    Registro Diario
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Students scan daily for attendance | Estudiantes escanean diariamente para asistencia
                  </Typography>
                  <Button variant="contained" color="success" size="small" sx={{ mr: 1 }}>
                    View Form | Ver
                  </Button>
                  <Button variant="outlined" color="success" size="small">
                    Print | Imprimir
                  </Button>
                </Paper>
              </Grid>

              {/* Feedback Form QR */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', border: '2px solid #ff9800' }}>
                  <Box sx={{ 
                    width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: '#fff3e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: '2px dashed #ff9800'
                  }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: '#ff9800' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    Feedback Form
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                    Formulario de Retroalimentación
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Students provide course feedback | Estudiantes dan retroalimentación del curso
                  </Typography>
                  <Button variant="contained" color="warning" size="small" sx={{ mr: 1 }}>
                    View Form | Ver
                  </Button>
                  <Button variant="outlined" color="warning" size="small">
                    Print | Imprimir
                  </Button>
                </Paper>
              </Grid>

              {/* Progress Assessment QR */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', border: '2px solid #9c27b0' }}>
                  <Box sx={{ 
                    width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: '#f3e5f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: '2px dashed #9c27b0'
                  }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: '#9c27b0' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#9c27b0' }}>
                    Progress Assessment
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#7b1fa2' }}>
                    Evaluación de Progreso
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Weekly skill assessments | Evaluaciones semanales de habilidades
                  </Typography>
                  <Button variant="contained" size="small" sx={{ mr: 1, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}>
                    View Form | Ver
                  </Button>
                  <Button variant="outlined" size="small" sx={{ color: '#9c27b0', borderColor: '#9c27b0' }}>
                    Print | Imprimir
                  </Button>
                </Paper>
              </Grid>

              {/* Instructor Check-in QR */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', border: '2px solid #00bcd4' }}>
                  <Box sx={{ 
                    width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: '#e0f7fa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: '2px dashed #00bcd4'
                  }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: '#00bcd4' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#00bcd4' }}>
                    Instructor Check-in
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0097a7' }}>
                    Registro de Instructor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Instructors log class sessions | Instructores registran sesiones de clase
                  </Typography>
                  <Button variant="contained" size="small" sx={{ mr: 1, bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' } }}>
                    View Form | Ver
                  </Button>
                  <Button variant="outlined" size="small" sx={{ color: '#00bcd4', borderColor: '#00bcd4' }}>
                    Print | Imprimir
                  </Button>
                </Paper>
              </Grid>

              {/* Completion Certificate QR */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', border: '2px solid #f44336' }}>
                  <Box sx={{ 
                    width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: '#ffebee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 2, border: '2px dashed #f44336'
                  }}>
                    <QrCodeIcon sx={{ fontSize: 80, color: '#f44336' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="error">
                    Completion Form
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="error.dark">
                    Formulario de Finalización
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Final completion and tablet assignment | Finalización y asignación de tableta
                  </Typography>
                  <Button variant="contained" color="error" size="small" sx={{ mr: 1 }}>
                    View Form | Ver
                  </Button>
                  <Button variant="outlined" color="error" size="small">
                    Print | Imprimir
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            {/* Print All Section */}
            <Paper sx={{ p: 3, mt: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Bulk Print Options | Opciones de Impresión Masiva
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<QrCodeIcon />}>
                  Print All QR Codes | Imprimir Todos
                </Button>
                <Button variant="outlined">
                  Print Student Forms Only | Solo Formularios de Estudiantes
                </Button>
                <Button variant="outlined">
                  Print Instructor Forms Only | Solo Formularios de Instructor
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <AIReportWizard 
              onComplete={(config) => {
                console.log('Report generated:', config);
              }}
              onClose={() => setActiveTab(2)}
            />
          </Box>
        )}

        {/* Footer Stats */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {students.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students | Total Estudiantes
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {students.filter(s => s.completed).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed | Completados
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                6
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Classes | Clases
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {Object.values(classEnrollments).filter(c => c >= 18).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full Classes | Clases Completas
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </UnifiedLayout>
  );
}

export default function DigitalLiteracyPage() {
  return (
    <AuthProvider>
      <DigitalLiteracyContent />
    </AuthProvider>
  );
}
