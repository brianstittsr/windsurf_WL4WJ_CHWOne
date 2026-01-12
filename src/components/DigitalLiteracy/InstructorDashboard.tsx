'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Users, CheckCircle, XCircle, ArrowLeft, X } from 'lucide-react';
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

  const getText = (key: string) => t(key, language, TRANSLATIONS);

  // Filter students by selected class
  const classStudents = students.filter(s => s.classId === selectedClass);
  
  // Calculate class stats
  const enrolledCount = classStudents.length;
  const presentCount = classStudents.filter(s => s.isPresent).length;
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
          <h3 className="text-lg font-bold mb-4">
            {getText('dashboard.selectClass')}
          </h3>
          
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
          <TabsTrigger value="attendance">
            {language === 'en' ? 'Attendance' : 'Asistencia'}
          </TabsTrigger>
          <TabsTrigger value="completion">
            {language === 'en' ? 'Completion' : 'Finalización'}
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                language={language}
                currentWeek={currentWeek}
                onToggleAttendance={onUpdateAttendance}
                onViewDetails={handleViewDetails}
                totalTopicsThisWeek={currentWeekTopics.length}
                assessedTopicsThisWeek={getAssessedCountThisWeek(student)}
              />
            ))}
            
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
