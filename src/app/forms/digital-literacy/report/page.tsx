'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { CLASS_SCHEDULES, COUNTIES, COURSE_TOPICS } from '@/lib/translations/digitalLiteracy';
import { Button } from '@/components/ui/button';
import { 
  FileDown, Printer, ArrowLeft, Users, GraduationCap, 
  CheckCircle, Clock, TrendingUp, Award, Calendar, MapPin,
  Target, Activity, BarChart3
} from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const MOCK_DATA = {
  reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  reportPeriod: 'January 6, 2026 - February 14, 2026',
  programName: 'Digital Literacy Program',
  programNameEs: 'Programa de Alfabetización Digital',
  
  // Collaborating Organizations
  collaboratingOrgs: [
    { name: 'NC Community Health Worker Association (NCCHWA)', logo: '🏛️', role: 'Lead Organization' },
    { name: 'Moore County Health Department', logo: '🏥', role: 'Partner' },
    { name: 'Montgomery County Health Department', logo: '🏥', role: 'Partner' },
    { name: 'Digital Literacy Initiative Partners', logo: '💻', role: 'Sponsor' },
  ],
  
  // Program Milestones
  milestones: [
    { name: 'Program Launch', date: 'January 6, 2026', status: 'completed', description: 'Successfully launched 6 classes across 2 counties' },
    { name: 'Week 1 Completion', date: 'January 10, 2026', status: 'completed', description: 'All students completed basic computer skills module' },
    { name: 'Week 2 Completion', date: 'January 17, 2026', status: 'completed', description: 'Internet navigation and email basics completed' },
    { name: 'Week 3 Completion', date: 'January 24, 2026', status: 'in_progress', description: 'Online safety and security module in progress' },
    { name: 'Mid-Program Assessment', date: 'January 24, 2026', status: 'in_progress', description: 'Student proficiency assessments underway' },
    { name: 'Week 4-6 Completion', date: 'February 7, 2026', status: 'pending', description: 'Advanced topics and final assessments' },
    { name: 'Program Graduation', date: 'February 14, 2026', status: 'pending', description: 'Certificate ceremony and tablet distribution' },
  ],
  
  // Program Metrics
  programMetrics: {
    totalStudents: 90,
    activeStudents: 85,
    completedStudents: 0,
    dropoutRate: 5.6,
    averageAttendance: 87.5,
    totalClasses: 6,
    fullClasses: 4,
    totalSessions: 18,
    completedSessions: 9,
  },
  
  // Student Metrics by Class
  classMetrics: [
    { classId: 'class1', name: 'Class 1: Monday 10:00 AM', enrolled: 18, avgAttendance: 89, avgProficiency: 78 },
    { classId: 'class2', name: 'Class 2: Monday 1:00 PM', enrolled: 16, avgAttendance: 85, avgProficiency: 82 },
    { classId: 'class3', name: 'Class 3: Tuesday 10:00 AM', enrolled: 18, avgAttendance: 91, avgProficiency: 75 },
    { classId: 'class4', name: 'Class 4: Tuesday 1:00 PM', enrolled: 14, avgAttendance: 83, avgProficiency: 80 },
    { classId: 'class5', name: 'Class 5: Wednesday 10:00 AM', enrolled: 12, avgAttendance: 88, avgProficiency: 85 },
    { classId: 'class6', name: 'Class 6: Wednesday 1:00 PM', enrolled: 12, avgAttendance: 86, avgProficiency: 79 },
  ],
  
  // County Distribution
  countyMetrics: [
    { county: 'Moore County', students: 52, percentage: 58 },
    { county: 'Montgomery County', students: 38, percentage: 42 },
  ],
  
  // Instructor Metrics
  instructorMetrics: [
    { name: 'María García', classes: ['Class 1', 'Class 2'], sessionsCompleted: 6, punctualityRate: 100, avgStudentRating: 4.8 },
    { name: 'Carlos Rodriguez', classes: ['Class 3', 'Class 4'], sessionsCompleted: 6, punctualityRate: 95, avgStudentRating: 4.6 },
    { name: 'Ana Martinez', classes: ['Class 5', 'Class 6'], sessionsCompleted: 6, punctualityRate: 98, avgStudentRating: 4.9 },
  ],
  
  // Weekly Progress
  weeklyProgress: [
    { week: 1, topic: 'Basic Computer Skills', completion: 100, avgScore: 82 },
    { week: 2, topic: 'Internet & Email', completion: 100, avgScore: 78 },
    { week: 3, topic: 'Online Safety', completion: 65, avgScore: 75 },
    { week: 4, topic: 'Productivity Tools', completion: 0, avgScore: 0 },
    { week: 5, topic: 'Digital Communication', completion: 0, avgScore: 0 },
    { week: 6, topic: 'Advanced Topics', completion: 0, avgScore: 0 },
  ],
  
  // Top Performing Students
  topStudents: [
    { name: 'Elena Vasquez', class: 'Class 5', attendance: 100, proficiency: 95 },
    { name: 'Roberto Silva', class: 'Class 3', attendance: 100, proficiency: 92 },
    { name: 'Carmen Lopez', class: 'Class 1', attendance: 95, proficiency: 90 },
    { name: 'Miguel Santos', class: 'Class 2', attendance: 100, proficiency: 88 },
    { name: 'Isabella Reyes', class: 'Class 6', attendance: 95, proficiency: 87 },
  ],
  
  // Students Needing Support
  studentsNeedingSupport: [
    { name: 'Juan Mendez', class: 'Class 4', issue: 'Low attendance (60%)', recommendation: 'Follow-up call and flexible scheduling' },
    { name: 'Rosa Hernandez', class: 'Class 2', issue: 'Struggling with Week 3 content', recommendation: 'One-on-one tutoring session' },
    { name: 'Pedro Gonzalez', class: 'Class 1', issue: 'Missed 2 consecutive sessions', recommendation: 'Wellness check and makeup sessions' },
  ],
};

function ReportContent() {
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // For now, use print to PDF functionality
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Control Bar - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-[#D2D2D7] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link 
            href="/forms/digital-literacy"
            className="inline-flex items-center text-[#0071E3] hover:text-[#0077ED] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Program
          </Link>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-[#D2D2D7] rounded-full px-6"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            <Button 
              className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-6"
              onClick={handleDownloadPDF}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-[1200px] mx-auto py-8 px-6 print:py-0 print:px-0 print:max-w-none">
        
        {/* ==================== COVER PAGE ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none overflow-hidden mb-8 print:mb-0 print:min-h-screen print:flex print:flex-col print:justify-between page-break-after">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0071E3] to-[#5856D6] p-12 text-white text-center">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <span className="text-6xl">🌐</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-2">
              {MOCK_DATA.programName}
            </h1>
            <h2 className="text-3xl font-medium opacity-90 mb-6">
              {MOCK_DATA.programNameEs}
            </h2>
            <div className="inline-block bg-white/20 rounded-full px-6 py-2 backdrop-blur-sm">
              <p className="text-lg font-medium">Program Status Report</p>
            </div>
          </div>

          {/* Report Info */}
          <div className="p-12 text-center">
            <p className="text-2xl text-[#1D1D1F] font-semibold mb-2">
              Report Period: {MOCK_DATA.reportPeriod}
            </p>
            <p className="text-lg text-[#86868B]">
              Generated on {MOCK_DATA.reportDate}
            </p>
          </div>

          {/* Collaborating Organizations */}
          <div className="px-12 pb-12">
            <h3 className="text-xl font-semibold text-[#1D1D1F] text-center mb-8">
              Collaborating Organizations | Organizaciones Colaboradoras
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {MOCK_DATA.collaboratingOrgs.map((org, idx) => (
                <div key={idx} className="text-center p-6 bg-[#F5F5F7] rounded-2xl">
                  <div className="text-5xl mb-4">{org.logo}</div>
                  <p className="font-semibold text-[#1D1D1F] text-sm">{org.name}</p>
                  <p className="text-xs text-[#86868B] mt-1">{org.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#F5F5F7] p-6 text-center text-sm text-[#86868B]">
            <p>Bilingual Student Tracking System | Sistema Bilingüe de Seguimiento de Estudiantes</p>
            <p className="mt-1">Moore County & Montgomery County, North Carolina</p>
          </div>
        </div>

        {/* ==================== EXECUTIVE SUMMARY ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-12 mb-8 print:mb-0 print:min-h-screen page-break-after">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#0071E3]" />
            Executive Summary | Resumen Ejecutivo
          </h2>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#0071E3]/5 rounded-2xl p-6 text-center">
              <Users className="w-10 h-10 text-[#0071E3] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#0071E3]">{MOCK_DATA.programMetrics.totalStudents}</p>
              <p className="text-sm text-[#86868B] mt-1">Total Students</p>
            </div>
            <div className="bg-[#34C759]/5 rounded-2xl p-6 text-center">
              <TrendingUp className="w-10 h-10 text-[#34C759] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#34C759]">{MOCK_DATA.programMetrics.averageAttendance}%</p>
              <p className="text-sm text-[#86868B] mt-1">Avg Attendance</p>
            </div>
            <div className="bg-[#5856D6]/5 rounded-2xl p-6 text-center">
              <Calendar className="w-10 h-10 text-[#5856D6] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#5856D6]">{MOCK_DATA.programMetrics.completedSessions}/{MOCK_DATA.programMetrics.totalSessions}</p>
              <p className="text-sm text-[#86868B] mt-1">Sessions Completed</p>
            </div>
            <div className="bg-[#FF9500]/5 rounded-2xl p-6 text-center">
              <GraduationCap className="w-10 h-10 text-[#FF9500] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#FF9500]">{MOCK_DATA.instructorMetrics.length}</p>
              <p className="text-sm text-[#86868B] mt-1">Instructors</p>
            </div>
          </div>

          {/* Program Status */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Program Progress | Progreso del Programa</h3>
            <div className="bg-[#F5F5F7] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Completion</span>
                <span className="font-bold text-[#0071E3]">50%</span>
              </div>
              <div className="h-4 bg-[#E5E5EA] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0071E3] to-[#5856D6] rounded-full" style={{ width: '50%' }} />
              </div>
              <p className="text-sm text-[#86868B] mt-2">Week 3 of 6 in progress</p>
            </div>
          </div>

          {/* County Distribution */}
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Geographic Distribution | Distribución Geográfica</h3>
            <div className="grid grid-cols-2 gap-6">
              {MOCK_DATA.countyMetrics.map((county, idx) => (
                <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#5856D6]/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-[#5856D6]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1D1D1F]">{county.county}</p>
                    <p className="text-sm text-[#86868B]">{county.students} students ({county.percentage}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== MILESTONES ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-12 mb-8 print:mb-0 print:min-h-screen page-break-after">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-3">
            <Target className="w-8 h-8 text-[#34C759]" />
            Program Milestones | Hitos del Programa
          </h2>

          <div className="space-y-4">
            {MOCK_DATA.milestones.map((milestone, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl p-6 border-l-4 ${
                  milestone.status === 'completed' 
                    ? 'bg-[#34C759]/5 border-[#34C759]' 
                    : milestone.status === 'in_progress'
                    ? 'bg-[#FF9500]/5 border-[#FF9500]'
                    : 'bg-[#F5F5F7] border-[#D2D2D7]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.status === 'completed' 
                        ? 'bg-[#34C759] text-white' 
                        : milestone.status === 'in_progress'
                        ? 'bg-[#FF9500] text-white'
                        : 'bg-[#D2D2D7] text-white'
                    }`}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : milestone.status === 'in_progress' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1D1D1F]">{milestone.name}</h4>
                      <p className="text-sm text-[#86868B] mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#1D1D1F]">{milestone.date}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                      milestone.status === 'completed' 
                        ? 'bg-[#34C759]/20 text-[#34C759]' 
                        : milestone.status === 'in_progress'
                        ? 'bg-[#FF9500]/20 text-[#FF9500]'
                        : 'bg-[#D2D2D7]/50 text-[#86868B]'
                    }`}>
                      {milestone.status === 'completed' ? 'Completed' : milestone.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== CLASS METRICS ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-12 mb-8 print:mb-0 print:min-h-screen page-break-after">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#0071E3]" />
            Class Performance | Rendimiento por Clase
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E5E5EA]">
                  <th className="text-left py-4 px-4 font-semibold text-[#1D1D1F]">Class</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F]">Enrolled</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F]">Avg Attendance</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F]">Avg Proficiency</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F]">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.classMetrics.map((cls, idx) => (
                  <tr key={idx} className="border-b border-[#E5E5EA]">
                    <td className="py-4 px-4 font-medium text-[#1D1D1F]">{cls.name}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-semibold ${cls.enrolled >= 18 ? 'text-[#34C759]' : 'text-[#0071E3]'}`}>
                        {cls.enrolled}/18
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-semibold ${cls.avgAttendance >= 85 ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                        {cls.avgAttendance}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-semibold ${cls.avgProficiency >= 80 ? 'text-[#34C759]' : 'text-[#0071E3]'}`}>
                        {cls.avgProficiency}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-[#34C759]/10 text-[#34C759] rounded-full text-xs font-medium">
                        On Track
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly Progress */}
          <h3 className="text-xl font-semibold text-[#1D1D1F] mt-12 mb-6">Weekly Curriculum Progress | Progreso Semanal del Currículo</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_DATA.weeklyProgress.map((week, idx) => (
              <div key={idx} className={`rounded-2xl p-5 ${week.completion === 100 ? 'bg-[#34C759]/5' : week.completion > 0 ? 'bg-[#FF9500]/5' : 'bg-[#F5F5F7]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1D1D1F]">Week {week.week}</span>
                  <span className={`text-sm font-medium ${week.completion === 100 ? 'text-[#34C759]' : week.completion > 0 ? 'text-[#FF9500]' : 'text-[#86868B]'}`}>
                    {week.completion}%
                  </span>
                </div>
                <p className="text-sm text-[#86868B] mb-3">{week.topic}</p>
                <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${week.completion === 100 ? 'bg-[#34C759]' : week.completion > 0 ? 'bg-[#FF9500]' : 'bg-[#D2D2D7]'}`}
                    style={{ width: `${week.completion}%` }}
                  />
                </div>
                {week.avgScore > 0 && (
                  <p className="text-xs text-[#86868B] mt-2">Avg Score: {week.avgScore}%</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ==================== INSTRUCTOR METRICS ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-12 mb-8 print:mb-0 print:min-h-screen page-break-after">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[#00C7BE]" />
            Instructor Performance | Rendimiento de Instructores
          </h2>

          <div className="grid gap-6">
            {MOCK_DATA.instructorMetrics.map((instructor, idx) => (
              <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-[#1D1D1F]">{instructor.name}</h4>
                    <p className="text-sm text-[#86868B]">{instructor.classes.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < Math.floor(instructor.avgStudentRating) ? 'text-[#FF9500]' : 'text-[#D2D2D7]'}`}>★</span>
                    ))}
                    <span className="ml-2 font-semibold text-[#1D1D1F]">{instructor.avgStudentRating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#0071E3]">{instructor.sessionsCompleted}</p>
                    <p className="text-xs text-[#86868B]">Sessions Completed</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#34C759]">{instructor.punctualityRate}%</p>
                    <p className="text-xs text-[#86868B]">Punctuality Rate</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#FF9500]">{instructor.avgStudentRating}</p>
                    <p className="text-xs text-[#86868B]">Student Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== STUDENT HIGHLIGHTS ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-12 mb-8 print:mb-0">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-8 flex items-center gap-3">
            <Award className="w-8 h-8 text-[#FF9500]" />
            Student Highlights | Destacados de Estudiantes
          </h2>

          {/* Top Performers */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Top Performing Students | Mejores Estudiantes</h3>
            <div className="grid gap-3">
              {MOCK_DATA.topStudents.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#34C759]/5 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#34C759] text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1D1D1F]">{student.name}</p>
                      <p className="text-sm text-[#86868B]">{student.class}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="font-semibold text-[#34C759]">{student.attendance}%</p>
                      <p className="text-xs text-[#86868B]">Attendance</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0071E3]">{student.proficiency}%</p>
                      <p className="text-xs text-[#86868B]">Proficiency</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Needing Support */}
          <div>
            <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Students Needing Support | Estudiantes que Necesitan Apoyo</h3>
            <div className="grid gap-3">
              {MOCK_DATA.studentsNeedingSupport.map((student, idx) => (
                <div key={idx} className="bg-[#FF3B30]/5 rounded-xl p-4 border-l-4 border-[#FF3B30]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#1D1D1F]">{student.name}</p>
                      <p className="text-sm text-[#86868B]">{student.class}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#FF3B30]/20 text-[#FF3B30] rounded-full text-xs font-medium">
                      Needs Attention
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-[#1D1D1F]">Issue:</p>
                      <p className="text-[#86868B]">{student.issue}</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#1D1D1F]">Recommendation:</p>
                      <p className="text-[#86868B]">{student.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-8 text-center">
          <p className="text-[#86868B] text-sm">
            This report was generated by the Digital Literacy Program Management System
          </p>
          <p className="text-[#86868B] text-sm mt-1">
            Este informe fue generado por el Sistema de Gestión del Programa de Alfabetización Digital
          </p>
          <div className="flex justify-center gap-4 mt-4">
            {MOCK_DATA.collaboratingOrgs.map((org, idx) => (
              <span key={idx} className="text-2xl">{org.logo}</span>
            ))}
          </div>
          <p className="text-xs text-[#D2D2D7] mt-4">
            © 2026 NC Community Health Worker Association. All rights reserved.
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break-after {
            page-break-after: always;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DigitalLiteracyReportPage() {
  return (
    <AuthProvider>
      <ReportContent />
    </AuthProvider>
  );
}
