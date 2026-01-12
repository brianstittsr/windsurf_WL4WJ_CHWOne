'use client';

import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, LayoutDashboard, QrCode, GraduationCap, FileBarChart, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState('registration');
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
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-1">
              🌐 Digital Literacy Program
            </h1>
            <h2 className="text-xl font-semibold opacity-90">
              Programa de Alfabetización Digital
            </h2>
            <p className="mt-2 opacity-80">
              Bilingual Student Tracking System | Sistema Bilingüe de Seguimiento de Estudiantes
            </p>
            <p className="mt-1 text-sm opacity-70">
              108 students across 6 classes (18 students per class) | 108 estudiantes en 6 clases (18 estudiantes por clase)
            </p>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="registration" className="flex items-center gap-2 py-3 text-xs sm:text-sm">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Student Registration</span>
              <span className="sm:hidden">Register</span>
            </TabsTrigger>
            <TabsTrigger value="instructor" className="flex items-center gap-2 py-3 text-xs sm:text-sm">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Instructor Registration</span>
              <span className="sm:hidden">Instructor</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3 text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Instructor Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="qrcodes" className="flex items-center gap-2 py-3 text-xs sm:text-sm">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR Codes</span>
              <span className="sm:hidden">QR</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 py-3 text-xs sm:text-sm">
              <FileBarChart className="h-4 w-4" />
              <span className="hidden sm:inline">AI Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="registration" className="mt-6">
            <BilingualRegistrationForm 
              onSubmit={handleRegistration}
              classEnrollments={classEnrollments}
            />
          </TabsContent>

          <TabsContent value="instructor" className="mt-6">
            <InstructorRegistrationWizard 
              onComplete={(data) => {
                console.log('Instructor registered:', data);
                setActiveTab('dashboard');
              }}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <InstructorDashboard
              students={students}
              onUpdateStudent={handleUpdateStudent}
              onUpdateAttendance={handleUpdateAttendance}
              onUpdateProficiency={handleUpdateProficiency}
              onSaveCompletion={handleSaveCompletion}
              instructorName="María García"
              programDirector="Dr. James Wilson"
            />
          </TabsContent>

          <TabsContent value="qrcodes" className="mt-6">
            <div className="py-4">
              <h3 className="text-2xl font-bold text-center mb-2">
                QR Code Management | Gestión de Códigos QR
              </h3>
              <p className="text-center text-muted-foreground mb-8">
                Generate and print QR codes for easy access to forms | Genere e imprima códigos QR para acceso fácil a formularios
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Student Registration QR */}
                <Card className="border-2 border-blue-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-36 h-36 mx-auto mb-4 bg-blue-50 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500">
                      <QrCode className="h-20 w-20 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-blue-600">Student Registration</h4>
                    <p className="font-semibold text-blue-700">Registro de Estudiantes</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      New students scan to register for classes | Nuevos estudiantes escanean para registrarse
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => setActiveTab('registration')}>
                        View Form | Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Check-in QR */}
                <Card className="border-2 border-green-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-36 h-36 mx-auto mb-4 bg-green-50 flex items-center justify-center rounded-lg border-2 border-dashed border-green-500">
                      <QrCode className="h-20 w-20 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-green-600">Daily Check-in</h4>
                    <p className="font-semibold text-green-700">Registro Diario</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Students scan daily for attendance | Estudiantes escanean diariamente para asistencia
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        View Form | Ver
                      </Button>
                      <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50">
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Form QR */}
                <Card className="border-2 border-orange-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-36 h-36 mx-auto mb-4 bg-orange-50 flex items-center justify-center rounded-lg border-2 border-dashed border-orange-500">
                      <QrCode className="h-20 w-20 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-bold text-orange-600">Feedback Form</h4>
                    <p className="font-semibold text-orange-700">Formulario de Retroalimentación</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Students provide course feedback | Estudiantes dan retroalimentación del curso
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        View Form | Ver
                      </Button>
                      <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Assessment QR */}
                <Card className="border-2 border-purple-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-36 h-36 mx-auto mb-4 bg-purple-50 flex items-center justify-center rounded-lg border-2 border-dashed border-purple-500">
                      <QrCode className="h-20 w-20 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-bold text-purple-600">Progress Assessment</h4>
                    <p className="font-semibold text-purple-700">Evaluación de Progreso</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Weekly skill assessments | Evaluaciones semanales de habilidades
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        View Form | Ver
                      </Button>
                      <Button variant="outline" size="sm" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructor Check-in QR */}
                <Card className="border-2 border-cyan-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-36 h-36 mx-auto mb-4 bg-cyan-50 flex items-center justify-center rounded-lg border-2 border-dashed border-cyan-500">
                      <QrCode className="h-20 w-20 text-cyan-600" />
                    </div>
                    <h4 className="text-lg font-bold text-cyan-600">Instructor Check-in</h4>
                    <p className="font-semibold text-cyan-700">Registro de Instructor</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Instructors log class sessions | Instructores registran sesiones de clase
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        View Form | Ver
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Completion Certificate QR */}
                <Card className="border-2 border-red-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-36 h-36 mx-auto mb-4 bg-red-50 flex items-center justify-center rounded-lg border-2 border-dashed border-red-500">
                      <QrCode className="h-20 w-20 text-red-600" />
                    </div>
                    <h4 className="text-lg font-bold text-red-600">Completion Form</h4>
                    <p className="font-semibold text-red-700">Formulario de Finalización</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Final completion and tablet assignment | Finalización y asignación de tableta
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="destructive">
                        View Form | Ver
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50">
                        <Printer className="h-4 w-4 mr-1" /> Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Print All Section */}
              <Card className="mt-8 bg-slate-50">
                <CardContent className="p-6 text-center">
                  <h4 className="text-lg font-semibold mb-4">
                    Bulk Print Options | Opciones de Impresión Masiva
                  </h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button>
                      <QrCode className="h-4 w-4 mr-2" />
                      Print All QR Codes | Imprimir Todos
                    </Button>
                    <Button variant="outline">
                      Print Student Forms Only | Solo Formularios de Estudiantes
                    </Button>
                    <Button variant="outline">
                      Print Instructor Forms Only | Solo Formularios de Instructor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <AIReportWizard 
              onComplete={(config) => {
                console.log('Report generated:', config);
              }}
              onClose={() => setActiveTab('dashboard')}
            />
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <Card className="mt-6 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-around gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students | Total Estudiantes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{students.filter(s => s.completed).length}</p>
                <p className="text-sm text-muted-foreground">Completed | Completados</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-sky-600">6</p>
                <p className="text-sm text-muted-foreground">Classes | Clases</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{Object.values(classEnrollments).filter(c => c >= 18).length}</p>
                <p className="text-sm text-muted-foreground">Full Classes | Clases Completas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
