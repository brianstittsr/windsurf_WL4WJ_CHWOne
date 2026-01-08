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
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  Dashboard as DashboardIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import { 
  BilingualRegistrationForm, 
  InstructorDashboard,
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
            variant="fullWidth"
          >
            <Tab 
              icon={<RegisterIcon />} 
              label="Student Registration | Registro de Estudiantes" 
              iconPosition="start"
            />
            <Tab 
              icon={<DashboardIcon />} 
              label="Instructor Dashboard | Panel del Instructor" 
              iconPosition="start"
            />
            <Tab 
              icon={<QrCodeIcon />} 
              label="QR Code | Código QR" 
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

        {activeTab === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
              <Box 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  mx: 'auto', 
                  mb: 3,
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #1976d2',
                  borderRadius: 2,
                }}
              >
                <QrCodeIcon sx={{ fontSize: 120, color: '#1976d2' }} />
              </Box>
              
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                SCAN TO REGISTER
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                ESCANEAR PARA REGISTRARSE
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1">
                Digital Literacy Program
              </Typography>
              <Typography variant="body1" color="primary">
                Programa de Alfabetización Digital
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Point your phone camera at this QR code to open the registration form.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Apunte la cámara de su teléfono a este código QR para abrir el formulario de registro.
              </Typography>
              
              <Button 
                variant="contained" 
                sx={{ mt: 3 }}
                onClick={() => setActiveTab(0)}
              >
                Go to Registration | Ir al Registro
              </Button>
            </Paper>
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
