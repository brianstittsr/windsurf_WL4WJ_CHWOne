'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Users, CheckCircle, XCircle, ArrowLeft, X, Calendar, Clock, Eye, ToggleLeft, ToggleRight, Database } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import LanguageToggle from './LanguageToggle';
import StudentCard, { Student } from './StudentCard';
import StudentDetailView from './StudentDetailView';
import CompletionTracking, { CompletionData } from './CompletionTracking';
import Certificate from './Certificate';
import { 
  Language, 
  t, 
  TRANSLATIONS, 
  CLASS_SCHEDULES,
  COURSE_TOPICS,
  getClassSchedule,
} from '@/lib/translations/digitalLiteracy';

// Class session interface for schedule management
interface ClassSession {
  id: string;
  classId: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  week: number;
  topic: string;
  topicEs: string;
}

// Attendance record interface
interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  checkinTime: string;
}

interface InstructorDashboardProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
  onUpdateAttendance: (studentId: string, isPresent: boolean) => void;
  onUpdateProficiency: (studentId: string, topicCode: string, level: string) => void;
  onSaveCompletion: (data: CompletionData) => void;
  instructorName?: string;
  programDirector?: string;
}

export default function InstructorDashboard({
  students,
  onUpdateStudent,
  onUpdateAttendance,
  onUpdateProficiency,
  onSaveCompletion,
  instructorName = 'María García',
  programDirector = 'Dr. James Wilson',
}: InstructorDashboardProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedClass, setSelectedClass] = useState('class1');
  const [currentWeek, setCurrentWeek] = useState(3);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'completion' | 'certificate'>('list');
  const [showAlert, setShowAlert] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [classScheduleData, setClassScheduleData] = useState<ClassSession[]>([]);
  const [attendanceBySession, setAttendanceBySession] = useState<{ [key: string]: AttendanceRecord[] }>({});
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<Set<string>>(new Set());
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  
  // Mock student data for demonstration
  const mockStudents: Student[] = [
    {
      id: 'mock-1',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '910-555-0101',
      county: 'moore',
      classId: selectedClass,
      registrationDate: '2026-01-02',
      attendance: { present: 8, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'proficient', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'developing', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'mastery', date: '2026-01-13', assessedBy: instructorName },
        'Class3A': { level: 'developing', date: '2026-01-20', assessedBy: instructorName },
      },
      isPresent: true,
      completed: false,
    },
    {
      id: 'mock-2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '910-555-0102',
      county: 'montgomery',
      classId: selectedClass,
      registrationDate: '2026-01-03',
      attendance: { present: 9, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'mastery', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'proficient', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'mastery', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class3A': { level: 'proficient', date: '2026-01-20', assessedBy: instructorName },
        'Class3B': { level: 'developing', date: '2026-01-20', assessedBy: instructorName },
      },
      isPresent: true,
      completed: false,
    },
    {
      id: 'mock-3',
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '910-555-0103',
      county: 'moore',
      classId: selectedClass,
      registrationDate: '2026-01-02',
      attendance: { present: 7, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'developing', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'beginning', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'developing', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'developing', date: '2026-01-13', assessedBy: instructorName },
      },
      isPresent: false,
      completed: false,
    },
    {
      id: 'mock-4',
      name: 'José Hernández',
      email: 'jose.hernandez@email.com',
      phone: '910-555-0104',
      county: 'montgomery',
      classId: selectedClass,
      registrationDate: '2026-01-04',
      attendance: { present: 9, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'proficient', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'proficient', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'mastery', date: '2026-01-13', assessedBy: instructorName },
        'Class3A': { level: 'mastery', date: '2026-01-20', assessedBy: instructorName },
        'Class3B': { level: 'proficient', date: '2026-01-20', assessedBy: instructorName },
      },
      isPresent: true,
      completed: false,
    },
    {
      id: 'mock-5',
      name: 'Rosa López',
      email: 'rosa.lopez@email.com',
      phone: '910-555-0105',
      county: 'moore',
      classId: selectedClass,
      registrationDate: '2026-01-03',
      attendance: { present: 8, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'developing', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'proficient', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class3A': { level: 'developing', date: '2026-01-20', assessedBy: instructorName },
      },
      isPresent: true,
      completed: false,
    },
    {
      id: 'mock-6',
      name: 'Miguel Santos',
      email: 'miguel.santos@email.com',
      phone: '910-555-0106',
      county: 'montgomery',
      classId: selectedClass,
      registrationDate: '2026-01-02',
      attendance: { present: 6, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'beginning', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'beginning', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'developing', date: '2026-01-13', assessedBy: instructorName },
      },
      isPresent: false,
      completed: false,
    },
    {
      id: 'mock-7',
      name: 'Elena Vásquez',
      email: 'elena.vasquez@email.com',
      phone: '910-555-0107',
      county: 'moore',
      classId: selectedClass,
      registrationDate: '2026-01-04',
      attendance: { present: 9, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'mastery', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'mastery', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'mastery', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'mastery', date: '2026-01-13', assessedBy: instructorName },
        'Class3A': { level: 'mastery', date: '2026-01-20', assessedBy: instructorName },
        'Class3B': { level: 'proficient', date: '2026-01-20', assessedBy: instructorName },
      },
      isPresent: true,
      completed: false,
    },
    {
      id: 'mock-8',
      name: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '910-555-0108',
      county: 'montgomery',
      classId: selectedClass,
      registrationDate: '2026-01-03',
      attendance: { present: 8, total: 9 },
      proficiencyAssessments: {
        'Class1A': { level: 'proficient', date: '2026-01-06', assessedBy: instructorName },
        'Class1B': { level: 'developing', date: '2026-01-06', assessedBy: instructorName },
        'Class2A': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class2B': { level: 'proficient', date: '2026-01-13', assessedBy: instructorName },
        'Class3A': { level: 'proficient', date: '2026-01-20', assessedBy: instructorName },
      },
      isPresent: true,
      completed: false,
    },
  ];

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('digitalLiteracyLanguage');
    if (savedLang === 'en' || savedLang === 'es') {
      setLanguage(savedLang);
    }
  }, []);

  // Save language preference
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('digitalLiteracyLanguage', lang);
  };

  // Generate class schedule for the 6-week program
  useEffect(() => {
    const generateSchedule = () => {
      const schedule: ClassSession[] = [];
      const programStartDate = new Date('2026-01-06'); // Program start date
      
      // Get class info
      const classInfo = CLASS_SCHEDULES.find(c => c.id === selectedClass);
      if (!classInfo) return;
      
      // Parse day and time from class schedule
      const classText = classInfo.en;
      const dayMatch = classText.match(/Monday|Tuesday|Wednesday/);
      const timeMatch = classText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/);
      
      if (!dayMatch || !timeMatch) return;
      
      const dayOfWeek = dayMatch[0];
      const startTime = timeMatch[1];
      const endTime = timeMatch[2];
      
      // Map day to number (0=Sunday, 1=Monday, etc.)
      const dayMap: { [key: string]: number } = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3 };
      const targetDay = dayMap[dayOfWeek];
      
      // Generate 6 weeks of sessions
      for (let week = 1; week <= 6; week++) {
        const weekStart = new Date(programStartDate);
        weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
        
        // Find the correct day in this week
        const sessionDate = new Date(weekStart);
        const currentDay = sessionDate.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        sessionDate.setDate(sessionDate.getDate() + daysUntilTarget);
        
        // Get topic for this week
        const weekTopics = COURSE_TOPICS.filter(t => t.week === week);
        const topicText = weekTopics.map(t => t.en).join(' & ') || `Week ${week} Topics`;
        const topicTextEs = weekTopics.map(t => t.es).join(' & ') || `Temas Semana ${week}`;
        
        schedule.push({
          id: `${selectedClass}-week${week}`,
          classId: selectedClass,
          date: sessionDate.toISOString().split('T')[0],
          dayOfWeek,
          startTime,
          endTime,
          week,
          topic: topicText,
          topicEs: topicTextEs,
        });
      }
      
      setClassScheduleData(schedule);
    };
    
    generateSchedule();
  }, [selectedClass]);

  // Fetch today's attendance for the selected class (live data)
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const attendanceRef = collection(db, 'digital_literacy_attendance');
        const q = query(
          attendanceRef, 
          where('classId', '==', selectedClass),
          where('date', '>=', today.toISOString()),
          where('date', '<', tomorrow.toISOString())
        );
        const snapshot = await getDocs(q);
        
        const presentStudentIds = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.studentId) {
            presentStudentIds.add(data.studentId);
          }
        });
        
        setTodayAttendance(presentStudentIds);
      } catch (error) {
        console.error('Error fetching today attendance:', error);
        setTodayAttendance(new Set());
      } finally {
        setLoadingAttendance(false);
      }
    };
    
    fetchTodayAttendance();
  }, [selectedClass]);

  // Fetch all attendance data for the schedule tab
  useEffect(() => {
    const fetchAttendance = async () => {
      if (activeTab !== 'schedule') return;
      
      setLoadingSchedule(true);
      try {
        const attendanceRef = collection(db, 'digital_literacy_attendance');
        const q = query(attendanceRef, where('classId', '==', selectedClass));
        const snapshot = await getDocs(q);
        
        const records: { [key: string]: AttendanceRecord[] } = {};
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const dateKey = data.date?.split('T')[0] || '';
          
          if (!records[dateKey]) {
            records[dateKey] = [];
          }
          
          records[dateKey].push({
            id: doc.id,
            studentId: data.studentId || '',
            studentName: data.studentName || '',
            classId: data.classId || '',
            date: data.date || '',
            checkinTime: data.checkinTime || '',
          });
        });
        
        setAttendanceBySession(records);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoadingSchedule(false);
      }
    };
    
    fetchAttendance();
  }, [selectedClass, activeTab]);

  const getText = (key: string) => t(key, language, TRANSLATIONS);

  // Use mock data or live data based on toggle
  const activeStudents = useMockData ? mockStudents : students;
  
  // Filter students by selected class
  const classStudents = activeStudents.filter(s => s.classId === selectedClass);
  
  // Calculate class stats - use mock data's isPresent or live attendance data
  const enrolledCount = classStudents.length;
  const presentCount = useMockData 
    ? classStudents.filter(s => s.isPresent).length 
    : classStudents.filter(s => todayAttendance.has(s.id)).length;
  const absentCount = enrolledCount - presentCount;
  
  // Get current week topics
  const currentWeekTopics = COURSE_TOPICS.filter(t => t.week === currentWeek);
  
  // Calculate unassessed students for current week
  const unassessedStudents = classStudents.filter(student => {
    const assessedThisWeek = currentWeekTopics.filter(
      topic => student.proficiencyAssessments[topic.code]
    ).length;
    return assessedThisWeek < currentWeekTopics.length;
  });

  // Get assessed count for a student this week
  const getAssessedCountThisWeek = (student: Student): number => {
    return currentWeekTopics.filter(
      topic => student.proficiencyAssessments[topic.code]
    ).length;
  };

  const handleViewDetails = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setViewMode('detail');
    }
  };

  const handleViewCompletion = (student: Student) => {
    setSelectedStudent(student);
    setViewMode('completion');
  };

  const handleViewCertificate = (student: Student) => {
    setSelectedStudent(student);
    setViewMode('certificate');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setViewMode('list');
  };

  const handleSaveCompletion = (data: CompletionData) => {
    onSaveCompletion(data);
    setViewMode('list');
    setSelectedStudent(null);
  };

  // Render detail view
  if (viewMode === 'detail' && selectedStudent) {
    return (
      <div>
        {/* Header with language toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-600">
            🌐 {getText('programTitle.en')}
          </h2>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>
        
        <StudentDetailView
          student={selectedStudent}
          language={language}
          currentWeek={currentWeek}
          onBack={handleBackToList}
          onUpdateProficiency={onUpdateProficiency}
          classSchedule={getClassSchedule(selectedStudent.classId, language)}
        />
      </div>
    );
  }

  // Render completion tracking
  if (viewMode === 'completion' && selectedStudent) {
    return (
      <div>
        {/* Header with language toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-600">
            🌐 {getText('programTitle.en')}
          </h2>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>
        
        <Button onClick={handleBackToList} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {getText('detail.backToClassView')}
        </Button>
        
        <CompletionTracking
          student={selectedStudent}
          language={language}
          instructorName={instructorName}
          onSave={handleSaveCompletion}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // Render certificate
  if (viewMode === 'certificate' && selectedStudent) {
    return (
      <div>
        {/* Header with language toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-600">
            🌐 {getText('programTitle.en')}
          </h2>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>
        
        <Certificate
          student={selectedStudent}
          instructorName={instructorName}
          programDirector={programDirector}
          startDate="January 6, 2025"
          endDate="February 14, 2025"
          onClose={handleBackToList}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div>
      {/* Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold">
                🌐 DIGITAL LITERACY PROGRAM
              </h2>
              <h3 className="text-lg">
                PROGRAMA DE ALFABETIZACIÓN DIGITAL
              </h3>
            </div>
            <div className="bg-white/10 p-2 rounded">
              <LanguageToggle 
                currentLanguage={language} 
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-6 flex-wrap text-sm">
            <span>
              {getText('dashboard.today')}: {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span>
              {getText('dashboard.instructor')}: {instructorName}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Class Selection */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">
              {getText('dashboard.selectClass')}
            </h3>
            
            {/* Mock Data Toggle */}
            <Button
              variant={useMockData ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseMockData(!useMockData)}
              className={`flex items-center gap-2 ${useMockData ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-400 text-purple-600 hover:bg-purple-50'}`}
            >
              {useMockData ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              <Database className="h-4 w-4" />
              {useMockData 
                ? (language === 'en' ? 'Mock Data ON' : 'Datos Demo ACTIVO') 
                : (language === 'en' ? 'Use Mock Data' : 'Usar Datos Demo')}
            </Button>
          </div>
          
          {/* Mock Data Banner */}
          {useMockData && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700">
                <Database className="h-5 w-5" />
                <span className="font-medium">
                  {language === 'en' 
                    ? 'Viewing Mock Data - 8 sample students with attendance and proficiency data' 
                    : 'Viendo Datos Demo - 8 estudiantes de muestra con datos de asistencia y competencia'}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 flex-wrap mb-6">
            <div className="min-w-[300px]">
              <Label className="mb-2 block">{getText('dashboard.currentClass')}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SCHEDULES.map(schedule => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[150px]">
              <Label className="mb-2 block">{getText('dashboard.week')} (1-6)</Label>
              <Select value={String(currentWeek)} onValueChange={(v) => setCurrentWeek(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(week => (
                    <SelectItem key={week} value={String(week)}>
                      {getText('dashboard.week')} {week} {getText('dashboard.of')} 6
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 text-center bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{enrolledCount}</p>
              <p className="text-sm text-muted-foreground">{getText('dashboard.enrolled')}</p>
            </div>
            <div className="p-4 text-center bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              <p className="text-sm text-muted-foreground">{getText('dashboard.present')}</p>
            </div>
            <div className="p-4 text-center bg-red-50 rounded-lg">
              <XCircle className="h-6 w-6 mx-auto text-red-600" />
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              <p className="text-sm text-muted-foreground">{getText('dashboard.absent')}</p>
            </div>
            <div className={`p-4 text-center rounded-lg ${unassessedStudents.length > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
              <AlertTriangle className={`h-6 w-6 mx-auto ${unassessedStudents.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              <p className={`text-2xl font-bold ${unassessedStudents.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {unassessedStudents.length}
              </p>
              <p className="text-sm text-muted-foreground">⚠️ {getText('dashboard.unassessed')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proficiency Alert */}
      {showAlert && unassessedStudents.length > 0 && (
        <Alert className="mb-6 border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 font-bold">
            ⚠️ {getText('alerts.proficiencyAlert')}
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            <p className="mt-2">{getText('alerts.studentsNeedAssessment')}</p>
            <div className="mt-2 space-y-1">
              {unassessedStudents.slice(0, 5).map(student => {
                const unassessedCount = currentWeekTopics.length - getAssessedCountThisWeek(student);
                return (
                  <div key={student.id} className="flex items-center gap-2">
                    <span className="text-sm">• {student.name} - {unassessedCount} {getText('alerts.topicsUnassessed')}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(student.id)}
                    >
                      {getText('alerts.assessNow')}
                    </Button>
                  </div>
                );
              })}
              {unassessedStudents.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  ...and {unassessedStudents.length - 5} more
                </p>
              )}
            </div>
          </AlertDescription>
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute top-2 right-2"
            onClick={() => setShowAlert(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Class Schedule' : 'Horario de Clases'}
          </TabsTrigger>
          <TabsTrigger value="attendance">
            {language === 'en' ? 'Attendance' : 'Asistencia'}
          </TabsTrigger>
          <TabsTrigger value="completion">
            {language === 'en' ? 'Completion' : 'Finalización'}
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1D1D1F]">
                    {language === 'en' ? 'Class Schedule & Attendance' : 'Horario de Clases y Asistencia'}
                  </h3>
                  <p className="text-sm text-[#6E6E73]">
                    {language === 'en' 
                      ? '6-week program schedule with student check-in data' 
                      : 'Horario del programa de 6 semanas con datos de registro de estudiantes'}
                  </p>
                </div>
                <Badge variant="outline" className="text-[#0071E3] border-[#0071E3]">
                  {getClassSchedule(selectedClass, language)}
                </Badge>
              </div>

              {loadingSchedule ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#0071E3] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-[#6E6E73]">{language === 'en' ? 'Loading schedule...' : 'Cargando horario...'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#F5F5F7]">
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Week' : 'Semana'}
                        </th>
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Date' : 'Fecha'}
                        </th>
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Day' : 'Día'}
                        </th>
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Time' : 'Hora'}
                        </th>
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Topic' : 'Tema'}
                        </th>
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Check-ins' : 'Registros'}
                        </th>
                        <th className="text-left p-3 font-semibold text-[#1D1D1F] border-b border-[#D2D2D7]">
                          {language === 'en' ? 'Actions' : 'Acciones'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classScheduleData.map((session, idx) => {
                        const sessionDate = new Date(session.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = sessionDate < today;
                        const isToday = sessionDate.toDateString() === today.toDateString();
                        const checkins = attendanceBySession[session.date] || [];
                        
                        return (
                          <tr 
                            key={session.id} 
                            className={`border-b border-[#E5E5EA] hover:bg-[#F5F5F7] transition-colors ${
                              isToday ? 'bg-[#0071E3]/5' : ''
                            }`}
                          >
                            <td className="p-3">
                              <Badge 
                                variant={isToday ? 'default' : 'outline'}
                                className={isToday ? 'bg-[#0071E3]' : ''}
                              >
                                {language === 'en' ? `Week ${session.week}` : `Semana ${session.week}`}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#6E6E73]" />
                                <span className={isToday ? 'font-bold text-[#0071E3]' : ''}>
                                  {sessionDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                {isToday && (
                                  <Badge className="bg-[#34C759] text-xs">
                                    {language === 'en' ? 'Today' : 'Hoy'}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-[#1D1D1F]">
                              {language === 'es' 
                                ? session.dayOfWeek === 'Monday' ? 'Lunes' 
                                  : session.dayOfWeek === 'Tuesday' ? 'Martes' 
                                  : 'Miércoles'
                                : session.dayOfWeek}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#6E6E73]" />
                                <span>{session.startTime} - {session.endTime}</span>
                              </div>
                            </td>
                            <td className="p-3 max-w-[200px]">
                              <p className="text-sm text-[#1D1D1F] truncate" title={language === 'es' ? session.topicEs : session.topic}>
                                {language === 'es' ? session.topicEs : session.topic}
                              </p>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#6E6E73]" />
                                <span className={`font-semibold ${
                                  checkins.length > 0 ? 'text-[#34C759]' : 'text-[#6E6E73]'
                                }`}>
                                  {checkins.length} / {classStudents.length}
                                </span>
                                {isPast && checkins.length === 0 && (
                                  <Badge variant="outline" className="text-[#FF9500] border-[#FF9500] text-xs">
                                    {language === 'en' ? 'No data' : 'Sin datos'}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#0071E3] text-[#0071E3] hover:bg-[#0071E3]/10"
                                onClick={() => setSelectedSession(session)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {language === 'en' ? 'View' : 'Ver'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Session Detail Modal */}
              {selectedSession && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-[#1D1D1F]">
                            {language === 'en' ? `Week ${selectedSession.week} Attendance` : `Asistencia Semana ${selectedSession.week}`}
                          </h3>
                          <p className="text-[#6E6E73]">
                            {new Date(selectedSession.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="mb-4 p-4 bg-[#F5F5F7] rounded-lg">
                        <p className="font-semibold text-[#1D1D1F]">{language === 'es' ? selectedSession.topicEs : selectedSession.topic}</p>
                        <p className="text-sm text-[#6E6E73]">{selectedSession.startTime} - {selectedSession.endTime}</p>
                      </div>

                      <h4 className="font-semibold mb-3 text-[#1D1D1F]">
                        {language === 'en' ? 'Student Check-ins' : 'Registros de Estudiantes'} 
                        ({(attendanceBySession[selectedSession.date] || []).length})
                      </h4>

                      {(attendanceBySession[selectedSession.date] || []).length > 0 ? (
                        <div className="space-y-2">
                          {(attendanceBySession[selectedSession.date] || []).map(record => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-[#34C759]/10 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-[#34C759]" />
                                <span className="font-medium text-[#1D1D1F]">{record.studentName}</span>
                              </div>
                              <span className="text-sm text-[#6E6E73]">
                                {new Date(record.checkinTime).toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[#6E6E73]">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{language === 'en' ? 'No check-ins recorded for this session' : 'No hay registros para esta sesión'}</p>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-[#D2D2D7]">
                        <Button onClick={() => setSelectedSession(null)} className="w-full bg-[#0071E3] hover:bg-[#0077ED]">
                          {language === 'en' ? 'Close' : 'Cerrar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          {!useMockData && loadingAttendance && (
            <div className="text-center py-4 mb-4">
              <div className="animate-spin w-6 h-6 border-4 border-[#0071E3] border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-[#6E6E73] mt-2">{language === 'en' ? 'Loading attendance...' : 'Cargando asistencia...'}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStudents.map(student => {
              // Use mock data's isPresent or live attendance data
              const studentWithAttendance = useMockData 
                ? student 
                : {
                    ...student,
                    isPresent: todayAttendance.has(student.id)
                  };
              return (
                <StudentCard
                  key={student.id}
                  student={studentWithAttendance}
                  language={language}
                  currentWeek={currentWeek}
                  onToggleAttendance={onUpdateAttendance}
                  onViewDetails={handleViewDetails}
                  totalTopicsThisWeek={currentWeekTopics.length}
                  assessedTopicsThisWeek={getAssessedCountThisWeek(student)}
                />
              );
            })}
            
            {classStudents.length === 0 && (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'No students enrolled in this class yet.' 
                      : 'Aún no hay estudiantes inscritos en esta clase.'}
                  </p>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Completion Tab */}
        <TabsContent value="completion">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStudents.map(student => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <h4 className="font-bold">{student.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{student.email}</p>
                  
                  <div className="mb-4">
                    <Badge variant={student.completed ? 'default' : 'secondary'} className={student.completed ? 'bg-green-600' : ''}>
                      {student.completed 
                        ? (language === 'en' ? 'Completed' : 'Completado')
                        : (language === 'en' ? 'In Progress' : 'En Progreso')
                      }
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCompletion(student)}
                    >
                      {language === 'en' ? 'Track Completion' : 'Seguimiento'}
                    </Button>
                    {student.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleViewCertificate(student)}
                      >
                        {language === 'en' ? 'Certificate' : 'Certificado'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
