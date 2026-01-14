'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
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
import { UserPlus, LayoutDashboard, QrCode, GraduationCap, FileBarChart, Printer, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import QRCode from 'qrcode';

// QR Code configurations with usage directions
const QR_CONFIGS = [
  { 
    id: 'registration', 
    path: '/forms/digital-literacy/register', 
    color: '#0071E3', 
    en: 'Student Registration', 
    es: 'Registro de Estudiantes', 
    desc: 'New students scan to register | Nuevos estudiantes escanean para registrarse',
    whenToUse: 'WHEN TO USE: Before the first class begins. New students should scan this QR code to register for the Digital Literacy Program.',
    whenToUseEs: 'CUÁNDO USAR: Antes de que comience la primera clase. Los nuevos estudiantes deben escanear este código QR para registrarse en el Programa de Alfabetización Digital.'
  },
  { 
    id: 'checkin', 
    path: '/checkin', 
    color: '#34C759', 
    en: 'Daily Check-in', 
    es: 'Registro Diario', 
    desc: 'Students scan for attendance | Estudiantes escanean para asistencia',
    whenToUse: 'WHEN TO USE: At the END of each class session. Students scan to confirm they stayed for the entire class.',
    whenToUseEs: 'CUÁNDO USAR: Al FINAL de cada sesión de clase. Los estudiantes escanean para confirmar que permanecieron durante toda la clase.'
  },
  { 
    id: 'feedback', 
    path: '/forms/feedback', 
    color: '#FF9500', 
    en: 'Feedback Form', 
    es: 'Formulario de Retroalimentación', 
    desc: 'Students provide feedback | Estudiantes dan retroalimentación',
    whenToUse: 'WHEN TO USE: After completing a class or module. Students provide feedback on their learning experience.',
    whenToUseEs: 'CUÁNDO USAR: Después de completar una clase o módulo. Los estudiantes proporcionan retroalimentación sobre su experiencia de aprendizaje.'
  },
  { 
    id: 'assessment', 
    path: '/forms/assessment', 
    color: '#5856D6', 
    en: 'Progress Assessment', 
    es: 'Evaluación de Progreso', 
    desc: 'Weekly skill assessments | Evaluaciones semanales',
    whenToUse: 'WHEN TO USE: At the end of each week. Students complete skill assessments to track their progress.',
    whenToUseEs: 'CUÁNDO USAR: Al final de cada semana. Los estudiantes completan evaluaciones de habilidades para seguir su progreso.'
  },
  { 
    id: 'instructor', 
    path: '/forms/instructor-checkin', 
    color: '#00C7BE', 
    en: 'Instructor Check-in', 
    es: 'Registro de Instructor', 
    desc: 'Instructors log sessions | Instructores registran sesiones',
    whenToUse: 'WHEN TO USE: BEFORE class starts (30 min prior). Instructors scan to confirm arrival and readiness.',
    whenToUseEs: 'CUÁNDO USAR: ANTES de que comience la clase (30 min antes). Los instructores escanean para confirmar llegada y preparación.'
  },
  { 
    id: 'completion', 
    path: '/forms/completion', 
    color: '#FF3B30', 
    en: 'Completion Form', 
    es: 'Formulario de Finalización', 
    desc: 'Final completion and tablet | Finalización y tableta',
    whenToUse: 'WHEN TO USE: At the END of the program. Students complete this form to receive their certificate and tablet.',
    whenToUseEs: 'CUÁNDO USAR: Al FINAL del programa. Los estudiantes completan este formulario para recibir su certificado y tableta.'
  },
];

// Collaborating organizations
const COLLABORATING_ORGS = [
  'NC Community Health Worker Association (NCCHWA)',
  'Moore County Health Department',
  'Montgomery County Health Department',
  'Digital Literacy Initiative Partners'
];

function DigitalLiteracyContent() {
  const [activeTab, setActiveTab] = useState('registration');
  const [students, setStudents] = useState<Student[]>([]);
  const [classEnrollments, setClassEnrollments] = useState<{ [classId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    completedStudents: 0,
    totalClasses: 6,
    fullClasses: 0
  });
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});

  // Generate QR codes on mount
  useEffect(() => {
    const generateQRCodes = async () => {
      // Wait for window to be available
      if (typeof window === 'undefined') return;
      
      const baseUrl = window.location.origin;
      console.log('[QR] Generating QR codes with base URL:', baseUrl);
      const codes: { [key: string]: string } = {};
      
      for (const config of QR_CONFIGS) {
        try {
          const url = `${baseUrl}${config.path}`;
          console.log(`[QR] Generating QR for ${config.id}:`, url);
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 256,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
              dark: config.color,
              light: '#FFFFFF'
            }
          });
          codes[config.id] = qrDataUrl;
          console.log(`[QR] Successfully generated QR for ${config.id}`);
        } catch (err) {
          console.error(`[QR] Error generating QR for ${config.id}:`, err);
        }
      }
      console.log('[QR] All QR codes generated:', Object.keys(codes));
      setQrCodes(codes);
    };
    
    // Small delay to ensure client-side hydration is complete
    const timer = setTimeout(generateQRCodes, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real data from Firebase only
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from Firebase digital_literacy_students collection
        const studentsRef = collection(db, 'digital_literacy_students');
        const snapshot = await getDocs(studentsRef);
        
        // Use real Firebase data only - no mock data fallback
        const firebaseStudents: Student[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.studentName || '',
            email: data.email || '',
            phone: data.phone || '',
            county: data.county || '',
            classId: data.classId || data.classTime || '',
            registrationDate: data.registrationDate || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            attendance: data.attendance || { present: 0, total: 0 },
            proficiencyAssessments: data.proficiencyAssessments || {},
            isPresent: data.isPresent || false,
            completed: data.completed || false,
            completionDate: data.completionDate,
            tabletSerial: data.tabletSerial,
          };
        });
        
        setStudents(firebaseStudents);
        
        // Calculate real enrollments
        const enrollments: { [classId: string]: number } = {};
        firebaseStudents.forEach(student => {
          if (student.classId) {
            enrollments[student.classId] = (enrollments[student.classId] || 0) + 1;
          }
        });
        setClassEnrollments(enrollments);
        
        // Calculate real metrics
        setMetrics({
          totalStudents: firebaseStudents.length,
          completedStudents: firebaseStudents.filter(s => s.completed).length,
          totalClasses: CLASS_SCHEDULES.length,
          fullClasses: Object.values(enrollments).filter(c => c >= 18).length
        });
      } catch (error) {
        console.error('Error fetching students:', error);
        // Show empty state on error - no mock data
        setStudents([]);
        setClassEnrollments({});
        setMetrics({
          totalStudents: 0,
          completedStudents: 0,
          totalClasses: CLASS_SCHEDULES.length,
          fullClasses: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  const handleRegistration = async (data: any) => {
    console.log('Registration data:', data);
    
    // Check if email already exists
    const existingStudent = students.find(s => s.email === data.email);
    if (existingStudent) {
      throw new Error('EMAIL_EXISTS');
    }
    
    try {
      // Save to Firebase
      const studentsRef = collection(db, 'digital_literacy_students');
      const docRef = await addDoc(studentsRef, {
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
        createdAt: serverTimestamp(),
      });
      
      // Create new student with Firebase ID
      const newStudent: Student = {
        id: docRef.id,
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
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + 1,
      }));
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      // Still add locally even if Firebase fails
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
      
      setMetrics(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + 1,
      }));
    }
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
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Apple-styled Header */}
        <div className="mb-8 bg-gradient-to-r from-[#0071E3] to-[#5856D6] rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🌐</span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Digital Literacy Program
              </h1>
              <h2 className="text-xl font-medium opacity-90">
                Programa de Alfabetización Digital
              </h2>
            </div>
          </div>
          <p className="mt-3 opacity-90">
            Bilingual Student Tracking System | Sistema Bilingüe de Seguimiento de Estudiantes
          </p>
          <p className="mt-1 text-sm opacity-75">
            {loading ? 'Loading...' : `${metrics.totalStudents} students across ${metrics.totalClasses} classes`} | 
            {loading ? ' Cargando...' : ` ${metrics.totalStudents} estudiantes en ${metrics.totalClasses} clases`}
          </p>
        </div>

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
                Scan QR codes for easy access to forms | Escanee códigos QR para acceso fácil a formularios
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {QR_CONFIGS.map((config) => (
                  <Card key={config.id} className="border-2 hover:shadow-lg transition-shadow" style={{ borderColor: config.color }}>
                    <CardContent className="p-6 text-center">
                      <div 
                        className="w-44 h-44 mx-auto mb-4 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: `${config.color}10` }}
                      >
                        {qrCodes[config.id] ? (
                          <img 
                            src={qrCodes[config.id]} 
                            alt={`QR Code for ${config.en}`}
                            className="w-40 h-40"
                          />
                        ) : (
                          <QrCode className="h-20 w-20" style={{ color: config.color }} />
                        )}
                      </div>
                      <h4 className="text-lg font-bold" style={{ color: config.color }}>{config.en}</h4>
                      <p className="font-semibold text-[#6E6E73]">{config.es}</p>
                      <p className="text-sm text-muted-foreground mt-2 mb-4">
                        {config.desc}
                      </p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button 
                          size="sm" 
                          style={{ backgroundColor: config.color }}
                          onClick={() => {
                            if (config.id === 'registration') setActiveTab('registration');
                            else if (config.id === 'feedback') window.open('/forms/feedback', '_blank');
                            else window.open(config.path, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" /> Open | Abrir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          style={{ borderColor: config.color, color: config.color }}
                          onClick={() => {
                            if (qrCodes[config.id]) {
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>${config.en} QR Code</title>
                                      <style>
                                        @media print {
                                          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                        }
                                      </style>
                                    </head>
                                    <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;padding:40px;box-sizing:border-box;">
                                      <div style="text-align:center;max-width:600px;">
                                        <h1 style="color:${config.color};font-size:36px;margin-bottom:10px;font-weight:bold;">${config.en}</h1>
                                        <h2 style="color:#6E6E73;font-size:28px;margin-bottom:30px;">${config.es}</h2>
                                        <div style="border:4px solid ${config.color};border-radius:24px;padding:30px;display:inline-block;background:white;">
                                          <img src="${qrCodes[config.id]}" style="width:400px;height:400px;display:block;" />
                                        </div>
                                        <div style="margin-top:30px;padding:20px;background:${config.color}15;border-radius:12px;">
                                          <p style="color:${config.color};font-weight:bold;font-size:16px;margin:0 0 10px 0;">${config.whenToUse}</p>
                                          <p style="color:#6E6E73;font-size:14px;margin:0;">${config.whenToUseEs}</p>
                                        </div>
                                        <p style="margin-top:20px;color:#6E6E73;font-size:14px;">${config.desc}</p>
                                        <hr style="margin:30px 0;border:none;border-top:1px solid #D2D2D7;" />
                                        <p style="color:#1D1D1F;font-weight:600;font-size:14px;margin-bottom:10px;">Collaborating Organizations | Organizaciones Colaboradoras:</p>
                                        <p style="color:#6E6E73;font-size:12px;line-height:1.6;">${COLLABORATING_ORGS.join(' • ')}</p>
                                      </div>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                setTimeout(() => printWindow.print(), 250);
                              }
                            }
                          }}
                        >
                          <Printer className="h-4 w-4 mr-1" /> Print
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Print All Section */}
              <Card className="mt-8 bg-[#F5F5F7] border-[#D2D2D7]">
                <CardContent className="p-6 text-center">
                  <h4 className="text-lg font-semibold mb-4 text-[#1D1D1F]">
                    Bulk Print Options | Opciones de Impresión Masiva
                  </h4>
                  <p className="text-sm text-[#6E6E73] mb-4">Each QR code prints on a separate page | Cada código QR se imprime en una página separada</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button 
                      className="bg-[#0071E3] hover:bg-[#0077ED]"
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          let content = `
                            <html>
                              <head>
                                <title>All QR Codes | Todos los Códigos QR</title>
                                <style>
                                  @media print {
                                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                    .page { page-break-after: always; }
                                    .page:last-child { page-break-after: auto; }
                                  }
                                </style>
                              </head>
                              <body style="font-family:system-ui;margin:0;padding:0;">
                          `;
                          QR_CONFIGS.forEach(config => {
                            if (qrCodes[config.id]) {
                              content += `
                                <div class="page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;box-sizing:border-box;">
                                  <div style="text-align:center;max-width:600px;">
                                    <h1 style="color:${config.color};font-size:36px;margin-bottom:10px;font-weight:bold;">${config.en}</h1>
                                    <h2 style="color:#6E6E73;font-size:28px;margin-bottom:30px;">${config.es}</h2>
                                    <div style="border:4px solid ${config.color};border-radius:24px;padding:30px;display:inline-block;background:white;">
                                      <img src="${qrCodes[config.id]}" style="width:400px;height:400px;display:block;" />
                                    </div>
                                    <div style="margin-top:30px;padding:20px;background:${config.color}15;border-radius:12px;">
                                      <p style="color:${config.color};font-weight:bold;font-size:16px;margin:0 0 10px 0;">${config.whenToUse}</p>
                                      <p style="color:#6E6E73;font-size:14px;margin:0;">${config.whenToUseEs}</p>
                                    </div>
                                    <p style="margin-top:20px;color:#6E6E73;font-size:14px;">${config.desc}</p>
                                    <hr style="margin:30px 0;border:none;border-top:1px solid #D2D2D7;" />
                                    <p style="color:#1D1D1F;font-weight:600;font-size:14px;margin-bottom:10px;">Collaborating Organizations | Organizaciones Colaboradoras:</p>
                                    <p style="color:#6E6E73;font-size:12px;line-height:1.6;">${COLLABORATING_ORGS.join(' • ')}</p>
                                  </div>
                                </div>
                              `;
                            }
                          });
                          content += `</body></html>`;
                          printWindow.document.write(content);
                          printWindow.document.close();
                          setTimeout(() => printWindow.print(), 250);
                        }
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Print All QR Codes | Imprimir Todos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-[#34C759] text-[#34C759] hover:bg-[#34C759]/10"
                      onClick={() => {
                        const studentConfigs = QR_CONFIGS.filter(c => 
                          ['registration', 'checkin', 'feedback', 'assessment'].includes(c.id)
                        );
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          let content = `
                            <html>
                              <head>
                                <title>Student QR Codes | Códigos QR de Estudiantes</title>
                                <style>
                                  @media print {
                                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                    .page { page-break-after: always; }
                                    .page:last-child { page-break-after: auto; }
                                  }
                                </style>
                              </head>
                              <body style="font-family:system-ui;margin:0;padding:0;">
                          `;
                          studentConfigs.forEach(config => {
                            if (qrCodes[config.id]) {
                              content += `
                                <div class="page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;box-sizing:border-box;">
                                  <div style="text-align:center;max-width:600px;">
                                    <h1 style="color:${config.color};font-size:36px;margin-bottom:10px;font-weight:bold;">${config.en}</h1>
                                    <h2 style="color:#6E6E73;font-size:28px;margin-bottom:30px;">${config.es}</h2>
                                    <div style="border:4px solid ${config.color};border-radius:24px;padding:30px;display:inline-block;background:white;">
                                      <img src="${qrCodes[config.id]}" style="width:400px;height:400px;display:block;" />
                                    </div>
                                    <div style="margin-top:30px;padding:20px;background:${config.color}15;border-radius:12px;">
                                      <p style="color:${config.color};font-weight:bold;font-size:16px;margin:0 0 10px 0;">${config.whenToUse}</p>
                                      <p style="color:#6E6E73;font-size:14px;margin:0;">${config.whenToUseEs}</p>
                                    </div>
                                    <p style="margin-top:20px;color:#6E6E73;font-size:14px;">${config.desc}</p>
                                    <hr style="margin:30px 0;border:none;border-top:1px solid #D2D2D7;" />
                                    <p style="color:#1D1D1F;font-weight:600;font-size:14px;margin-bottom:10px;">Collaborating Organizations | Organizaciones Colaboradoras:</p>
                                    <p style="color:#6E6E73;font-size:12px;line-height:1.6;">${COLLABORATING_ORGS.join(' • ')}</p>
                                  </div>
                                </div>
                              `;
                            }
                          });
                          content += `</body></html>`;
                          printWindow.document.write(content);
                          printWindow.document.close();
                          setTimeout(() => printWindow.print(), 250);
                        }
                      }}
                    >
                      Print Student Forms Only | Solo Estudiantes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-[#00C7BE] text-[#00C7BE] hover:bg-[#00C7BE]/10"
                      onClick={() => {
                        const instructorConfigs = QR_CONFIGS.filter(c => 
                          ['instructor', 'completion'].includes(c.id)
                        );
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          let content = `
                            <html>
                              <head>
                                <title>Instructor QR Codes | Códigos QR de Instructor</title>
                                <style>
                                  @media print {
                                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                    .page { page-break-after: always; }
                                    .page:last-child { page-break-after: auto; }
                                  }
                                </style>
                              </head>
                              <body style="font-family:system-ui;margin:0;padding:0;">
                          `;
                          instructorConfigs.forEach(config => {
                            if (qrCodes[config.id]) {
                              content += `
                                <div class="page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;box-sizing:border-box;">
                                  <div style="text-align:center;max-width:600px;">
                                    <h1 style="color:${config.color};font-size:36px;margin-bottom:10px;font-weight:bold;">${config.en}</h1>
                                    <h2 style="color:#6E6E73;font-size:28px;margin-bottom:30px;">${config.es}</h2>
                                    <div style="border:4px solid ${config.color};border-radius:24px;padding:30px;display:inline-block;background:white;">
                                      <img src="${qrCodes[config.id]}" style="width:400px;height:400px;display:block;" />
                                    </div>
                                    <div style="margin-top:30px;padding:20px;background:${config.color}15;border-radius:12px;">
                                      <p style="color:${config.color};font-weight:bold;font-size:16px;margin:0 0 10px 0;">${config.whenToUse}</p>
                                      <p style="color:#6E6E73;font-size:14px;margin:0;">${config.whenToUseEs}</p>
                                    </div>
                                    <p style="margin-top:20px;color:#6E6E73;font-size:14px;">${config.desc}</p>
                                    <hr style="margin:30px 0;border:none;border-top:1px solid #D2D2D7;" />
                                    <p style="color:#1D1D1F;font-weight:600;font-size:14px;margin-bottom:10px;">Collaborating Organizations | Organizaciones Colaboradoras:</p>
                                    <p style="color:#6E6E73;font-size:12px;line-height:1.6;">${COLLABORATING_ORGS.join(' • ')}</p>
                                  </div>
                                </div>
                              `;
                            }
                          });
                          content += `</body></html>`;
                          printWindow.document.write(content);
                          printWindow.document.close();
                          setTimeout(() => printWindow.print(), 250);
                        }
                      }}
                    >
                      Print Instructor Forms Only | Solo Instructor
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

        {/* Quick Stats with Link to Full Dashboard */}
        <div className="mt-8 bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
          <div className="p-4 border-b border-[#D2D2D7] flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F]">Quick Stats | Estadísticas Rápidas</h3>
            <a 
              href="/forms/digital-literacy/metrics"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0071E3] text-white rounded-lg hover:bg-[#0077ED] transition-colors text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              View Full Dashboard | Ver Panel Completo
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#D2D2D7]">
            <div className="p-6 text-center">
              <p className="text-4xl font-semibold text-[#0071E3] mb-1">
                {loading ? '...' : metrics.totalStudents}
              </p>
              <p className="text-sm text-[#6E6E73]">Total Students | Total Estudiantes</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-4xl font-semibold text-[#34C759] mb-1">
                {loading ? '...' : metrics.completedStudents}
              </p>
              <p className="text-sm text-[#6E6E73]">Completed | Completados</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-4xl font-semibold text-[#5856D6] mb-1">
                {metrics.totalClasses}
              </p>
              <p className="text-sm text-[#6E6E73]">Classes | Clases</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-4xl font-semibold text-[#FF9500] mb-1">
                {loading ? '...' : metrics.fullClasses}
              </p>
              <p className="text-sm text-[#6E6E73]">Full Classes | Clases Completas</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function DigitalLiteracyPage() {
  return (
    <AuthProvider>
      <DigitalLiteracyContent />
    </AuthProvider>
  );
}
