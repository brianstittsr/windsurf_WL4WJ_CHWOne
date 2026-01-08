'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  TextField,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
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
  const [activeTab, setActiveTab] = useState(0);

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
      <Box>
        {/* Header with language toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            🌐 {getText('programTitle.en')}
          </Typography>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </Box>
        
        <StudentDetailView
          student={selectedStudent}
          language={language}
          currentWeek={currentWeek}
          onBack={handleBackToList}
          onUpdateProficiency={onUpdateProficiency}
          classSchedule={getClassSchedule(selectedStudent.classId, language)}
        />
      </Box>
    );
  }

  // Render completion tracking
  if (viewMode === 'completion' && selectedStudent) {
    return (
      <Box>
        {/* Header with language toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            🌐 {getText('programTitle.en')}
          </Typography>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </Box>
        
        <Button onClick={handleBackToList} sx={{ mb: 2 }}>
          ← {getText('detail.backToClassView')}
        </Button>
        
        <CompletionTracking
          student={selectedStudent}
          language={language}
          instructorName={instructorName}
          onSave={handleSaveCompletion}
          onCancel={handleBackToList}
        />
      </Box>
    );
  }

  // Render certificate
  if (viewMode === 'certificate' && selectedStudent) {
    return (
      <Box>
        {/* Header with language toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            🌐 {getText('programTitle.en')}
          </Typography>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </Box>
        
        <Certificate
          student={selectedStudent}
          instructorName={instructorName}
          programDirector={programDirector}
          startDate="January 6, 2025"
          endDate="February 14, 2025"
          onClose={handleBackToList}
        />
      </Box>
    );
  }

  // Main dashboard view
  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
        <CardContent sx={{ color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                🌐 DIGITAL LITERACY PROGRAM
              </Typography>
              <Typography variant="h6">
                PROGRAMA DE ALFABETIZACIÓN DIGITAL
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 1 }}>
              <LanguageToggle 
                currentLanguage={language} 
                onLanguageChange={handleLanguageChange}
              />
            </Box>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              {getText('dashboard.today')}: {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            <Typography variant="body2">
              {getText('dashboard.instructor')}: {instructorName}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Class Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {getText('dashboard.selectClass')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <TextField
              select
              label={getText('dashboard.currentClass')}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              sx={{ minWidth: 300 }}
            >
              {CLASS_SCHEDULES.map(schedule => (
                <MenuItem key={schedule.id} value={schedule.id}>
                  {schedule[language]}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label={`${getText('dashboard.week')} (1-6)`}
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              sx={{ minWidth: 150 }}
            >
              {[1, 2, 3, 4, 5, 6].map(week => (
                <MenuItem key={week} value={week}>
                  {getText('dashboard.week')} {week} {getText('dashboard.of')} 6
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Class Stats */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <PeopleIcon color="primary" />
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {enrolledCount}/18
                </Typography>
                <Typography variant="body2">
                  {getText('dashboard.enrolled')} {enrolledCount >= 18 && `(${getText('dashboard.full')})`}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <CheckIcon color="success" />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {presentCount}
                </Typography>
                <Typography variant="body2">
                  {getText('dashboard.presentToday')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <CancelIcon color="error" />
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {absentCount}
                </Typography>
                <Typography variant="body2">
                  {getText('dashboard.absent')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: unassessedStudents.length > 0 ? '#fff3e0' : '#e8f5e9' }}>
                <WarningIcon color={unassessedStudents.length > 0 ? 'warning' : 'success'} />
                <Typography variant="h4" fontWeight="bold" color={unassessedStudents.length > 0 ? 'warning.main' : 'success.main'}>
                  {unassessedStudents.length}
                </Typography>
                <Typography variant="body2">
                  ⚠️ {getText('dashboard.unassessed')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Proficiency Alert */}
      {showAlert && unassessedStudents.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          onClose={() => setShowAlert(false)}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" color="inherit" onClick={() => setShowAlert(false)}>
                {getText('alerts.dismissAlerts')}
              </Button>
            </Box>
          }
        >
          <Typography variant="subtitle1" fontWeight="bold">
            ⚠️ {getText('alerts.proficiencyAlert')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {getText('alerts.studentsNeedAssessment')}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {unassessedStudents.slice(0, 5).map(student => {
              const unassessedCount = currentWeekTopics.length - getAssessedCountThisWeek(student);
              return (
                <Box key={student.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                  <Typography variant="body2">
                    • {student.name} - {unassessedCount} {getText('alerts.topicsUnassessed')}
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleViewDetails(student.id)}
                  >
                    {getText('alerts.assessNow')}
                  </Button>
                </Box>
              );
            })}
            {unassessedStudents.length > 5 && (
              <Typography variant="body2" color="text.secondary">
                ...and {unassessedStudents.length - 5} more
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label={language === 'en' ? 'Attendance' : 'Asistencia'} />
          <Tab label={language === 'en' ? 'Completion' : 'Finalización'} />
        </Tabs>
      </Box>

      {/* Attendance Tab */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {classStudents.map(student => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <StudentCard
                student={student}
                language={language}
                currentWeek={currentWeek}
                onToggleAttendance={onUpdateAttendance}
                onViewDetails={handleViewDetails}
                totalTopicsThisWeek={currentWeekTopics.length}
                assessedTopicsThisWeek={getAssessedCountThisWeek(student)}
              />
            </Grid>
          ))}
          
          {classStudents.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {language === 'en' 
                    ? 'No students enrolled in this class yet.' 
                    : 'Aún no hay estudiantes inscritos en esta clase.'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Completion Tab */}
      {activeTab === 1 && (
        <Grid container spacing={2}>
          {classStudents.map(student => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {student.email}
                  </Typography>
                  
                  <Box sx={{ my: 2 }}>
                    <Chip
                      label={student.completed 
                        ? (language === 'en' ? 'Completed' : 'Completado')
                        : (language === 'en' ? 'In Progress' : 'En Progreso')
                      }
                      color={student.completed ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewCompletion(student)}
                    >
                      {language === 'en' ? 'Track Completion' : 'Seguimiento'}
                    </Button>
                    {student.completed && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleViewCertificate(student)}
                      >
                        {language === 'en' ? 'Certificate' : 'Certificado'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
