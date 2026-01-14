'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { CLASS_SCHEDULES, COUNTIES, COURSE_TOPICS } from '@/lib/translations/digitalLiteracy';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileDown, Printer, ArrowLeft, Users, GraduationCap, 
  CheckCircle, Clock, TrendingUp, TrendingDown, Award, Calendar, MapPin,
  Target, Activity, BarChart3, AlertTriangle, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration - in production, fetch from Firebase
const generateWeeklyData = (weekNumber: number) => {
  const baseAttendance = 85 + Math.random() * 10;
  const baseProficiency = 75 + Math.random() * 15;
  
  return {
    weekNumber,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    weekStartDate: `January ${6 + (weekNumber - 1) * 7}, 2026`,
    weekEndDate: `January ${10 + (weekNumber - 1) * 7}, 2026`,
    
    // Executive Summary Data
    executiveSummary: {
      totalStudents: 90,
      activeStudents: 90 - Math.floor(Math.random() * 5),
      newEnrollments: Math.floor(Math.random() * 3),
      dropouts: Math.floor(Math.random() * 2),
      averageAttendance: baseAttendance.toFixed(1),
      attendanceTrend: weekNumber > 1 ? (Math.random() > 0.5 ? 2.3 : -1.5) : 0,
      averageProficiency: baseProficiency.toFixed(1),
      proficiencyTrend: weekNumber > 1 ? (Math.random() > 0.3 ? 3.1 : -0.8) : 0,
      sessionsCompleted: weekNumber * 6,
      totalSessions: 36,
    },
    
    // Attendance by Class
    classAttendance: CLASS_SCHEDULES.map((cls, idx) => ({
      classId: cls.id,
      className: cls.en.split(':')[0],
      enrolled: 15 + Math.floor(Math.random() * 4),
      present: 12 + Math.floor(Math.random() * 4),
      absent: Math.floor(Math.random() * 3),
      attendanceRate: (80 + Math.random() * 18).toFixed(1),
      trend: Math.random() > 0.5 ? 'up' : 'down',
    })),
    
    // Attendance by Day
    dailyAttendance: [
      { day: 'Monday', date: `Jan ${6 + (weekNumber - 1) * 7}`, present: 28 + Math.floor(Math.random() * 5), total: 34 },
      { day: 'Tuesday', date: `Jan ${7 + (weekNumber - 1) * 7}`, present: 30 + Math.floor(Math.random() * 4), total: 34 },
      { day: 'Wednesday', date: `Jan ${8 + (weekNumber - 1) * 7}`, present: 22 + Math.floor(Math.random() * 4), total: 24 },
    ],
    
    // Topic Progress
    topicProgress: COURSE_TOPICS.filter(t => t.week <= weekNumber).map(topic => ({
      ...topic,
      completionRate: topic.week < weekNumber ? 100 : (60 + Math.random() * 35),
      averageScore: 70 + Math.random() * 25,
      studentsCompleted: topic.week < weekNumber ? 90 : Math.floor(55 + Math.random() * 30),
    })),
    
    // County Distribution
    countyData: [
      { county: 'Moore County', students: 52, attendance: (82 + Math.random() * 12).toFixed(1), proficiency: (75 + Math.random() * 15).toFixed(1) },
      { county: 'Montgomery County', students: 38, attendance: (80 + Math.random() * 15).toFixed(1), proficiency: (72 + Math.random() * 18).toFixed(1) },
    ],
    
    // Instructor Performance
    instructorData: [
      { name: 'María García', classes: 2, sessionsThisWeek: 2, avgAttendance: (85 + Math.random() * 10).toFixed(1), studentSatisfaction: (4.5 + Math.random() * 0.4).toFixed(1) },
      { name: 'Carlos Rodriguez', classes: 2, sessionsThisWeek: 2, avgAttendance: (82 + Math.random() * 12).toFixed(1), studentSatisfaction: (4.3 + Math.random() * 0.5).toFixed(1) },
      { name: 'Ana Martinez', classes: 2, sessionsThisWeek: 2, avgAttendance: (88 + Math.random() * 8).toFixed(1), studentSatisfaction: (4.6 + Math.random() * 0.3).toFixed(1) },
    ],
    
    // Highlights and Concerns
    highlights: [
      `Week ${weekNumber} saw strong attendance across all classes with an average of ${baseAttendance.toFixed(1)}%`,
      `${Math.floor(Math.random() * 5) + 3} students achieved perfect attendance this week`,
      `Topic "${COURSE_TOPICS.find(t => t.week === weekNumber)?.en || 'Current Topic'}" completion rate exceeded expectations`,
    ],
    concerns: [
      `${Math.floor(Math.random() * 3) + 1} students have missed 2+ consecutive sessions`,
      weekNumber > 2 ? 'Some students struggling with advanced concepts in Week 3 material' : 'Early identification of students needing additional support',
      'Transportation challenges reported by 2 students in Montgomery County',
    ],
    
    // Recommendations
    recommendations: [
      'Schedule follow-up calls with students who missed this week\'s sessions',
      'Consider additional tutoring sessions for students below 70% proficiency',
      'Prepare supplementary materials for next week\'s advanced topics',
    ],
  };
};

function WeeklyReportContent() {
  const [selectedWeek, setSelectedWeek] = useState(3);
  const [weekData, setWeekData] = useState(generateWeeklyData(3));
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWeekData(generateWeeklyData(selectedWeek));
  }, [selectedWeek]);

  const handlePrint = () => {
    window.print();
  };

  const TrendIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPositive ? '+' : ''}{value.toFixed(1)}{suffix}
      </span>
    );
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#86868B]">Select Week:</span>
              <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(w => (
                    <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              className="border-[#D2D2D7] rounded-full px-6"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-[1200px] mx-auto py-8 px-6 print:py-0 print:px-0 print:max-w-none">
        
        {/* ==================== HEADER ==================== */}
        <div className="bg-gradient-to-r from-[#0071E3] to-[#5856D6] rounded-3xl print:rounded-none p-10 text-white mb-8 print:mb-0" style={{ boxShadow: '0 8px 32px rgba(0,113,227,0.3)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-2">WEEKLY PROGRESS REPORT</p>
              <h1 className="text-4xl font-bold tracking-tight mb-1">
                Digital Literacy Program
              </h1>
              <h2 className="text-2xl font-medium opacity-90">
                Week {weekData.weekNumber} Summary
              </h2>
              <p className="mt-3 opacity-80">
                {weekData.weekStartDate} - {weekData.weekEndDate}
              </p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-3">
                <span className="text-5xl">📊</span>
              </div>
              <p className="text-sm opacity-80">Generated: {weekData.reportDate}</p>
            </div>
          </div>
        </div>

        {/* ==================== EXECUTIVE SUMMARY ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#0071E3]" />
            Executive Summary
          </h2>

          {/* Summary Text */}
          <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
            <p className="text-[#1D1D1F] leading-relaxed">
              <strong>Week {weekData.weekNumber} Overview:</strong> The Digital Literacy Program continues to show strong engagement 
              with <strong>{weekData.executiveSummary.activeStudents} active students</strong> across 6 classes. 
              This week's average attendance rate of <strong>{weekData.executiveSummary.averageAttendance}%</strong> 
              {weekData.executiveSummary.attendanceTrend > 0 
                ? ` represents a ${weekData.executiveSummary.attendanceTrend.toFixed(1)}% improvement from last week` 
                : weekData.executiveSummary.attendanceTrend < 0 
                ? ` shows a slight decline of ${Math.abs(weekData.executiveSummary.attendanceTrend).toFixed(1)}% from last week`
                : ' establishes our baseline for the program'}.
              Student proficiency assessments indicate an average score of <strong>{weekData.executiveSummary.averageProficiency}%</strong>, 
              demonstrating solid comprehension of the curriculum material.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#0071E3]/5 rounded-2xl p-5 text-center">
              <Users className="w-8 h-8 text-[#0071E3] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#0071E3]">{weekData.executiveSummary.activeStudents}</p>
              <p className="text-xs text-[#86868B] mt-1">Active Students</p>
            </div>
            <div className="bg-[#34C759]/5 rounded-2xl p-5 text-center">
              <TrendingUp className="w-8 h-8 text-[#34C759] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#34C759]">{weekData.executiveSummary.averageAttendance}%</p>
              <p className="text-xs text-[#86868B] mt-1">Avg Attendance</p>
              <TrendIndicator value={weekData.executiveSummary.attendanceTrend} />
            </div>
            <div className="bg-[#5856D6]/5 rounded-2xl p-5 text-center">
              <Award className="w-8 h-8 text-[#5856D6] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#5856D6]">{weekData.executiveSummary.averageProficiency}%</p>
              <p className="text-xs text-[#86868B] mt-1">Avg Proficiency</p>
              <TrendIndicator value={weekData.executiveSummary.proficiencyTrend} />
            </div>
            <div className="bg-[#FF9500]/5 rounded-2xl p-5 text-center">
              <Calendar className="w-8 h-8 text-[#FF9500] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#FF9500]">{weekData.executiveSummary.sessionsCompleted}/{weekData.executiveSummary.totalSessions}</p>
              <p className="text-xs text-[#86868B] mt-1">Sessions Completed</p>
            </div>
          </div>

          {/* Metrics Explanation */}
          <div className="border-l-4 border-[#0071E3] pl-4 py-2 bg-[#0071E3]/5 rounded-r-xl">
            <p className="text-sm text-[#1D1D1F]">
              <strong>📈 Data Insight:</strong> The metrics above represent aggregated data from all 6 classes. 
              Attendance is calculated based on daily check-ins, while proficiency scores are derived from 
              weekly assessments and hands-on exercises. A positive trend indicates improvement from the previous week.
            </p>
          </div>
        </div>

        {/* ==================== ATTENDANCE ANALYSIS ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-[#34C759]" />
            Attendance Analysis
          </h2>

          {/* Attendance by Class */}
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">Attendance by Class</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E5E5EA]">
                  <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Class</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Enrolled</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Present</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Absent</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Trend</th>
                </tr>
              </thead>
              <tbody>
                {weekData.classAttendance.map((cls, idx) => (
                  <tr key={idx} className="border-b border-[#E5E5EA]">
                    <td className="py-3 px-4 font-medium text-[#1D1D1F]">{cls.className}</td>
                    <td className="py-3 px-4 text-center text-[#1D1D1F]">{cls.enrolled}</td>
                    <td className="py-3 px-4 text-center text-[#34C759] font-medium">{cls.present}</td>
                    <td className="py-3 px-4 text-center text-[#FF3B30] font-medium">{cls.absent}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${parseFloat(cls.attendanceRate) >= 85 ? 'text-[#34C759]' : parseFloat(cls.attendanceRate) >= 75 ? 'text-[#FF9500]' : 'text-[#FF3B30]'}`}>
                        {cls.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {cls.trend === 'up' 
                        ? <TrendingUp className="w-5 h-5 text-[#34C759] mx-auto" />
                        : <TrendingDown className="w-5 h-5 text-[#FF3B30] mx-auto" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attendance Explanation */}
          <div className="border-l-4 border-[#34C759] pl-4 py-2 bg-[#34C759]/5 rounded-r-xl mb-8">
            <p className="text-sm text-[#1D1D1F]">
              <strong>📊 Analysis:</strong> Class attendance this week shows {weekData.classAttendance.filter(c => parseFloat(c.attendanceRate) >= 85).length} of 6 classes 
              meeting or exceeding our 85% target. {weekData.classAttendance.filter(c => c.trend === 'up').length} classes showed improvement from last week. 
              Classes with attendance below 80% have been flagged for instructor follow-up with absent students.
            </p>
          </div>

          {/* Daily Attendance Chart */}
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">Daily Attendance Distribution</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {weekData.dailyAttendance.map((day, idx) => (
              <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-5 text-center">
                <p className="font-semibold text-[#1D1D1F]">{day.day}</p>
                <p className="text-xs text-[#86868B] mb-3">{day.date}</p>
                <div className="relative h-24 bg-[#E5E5EA] rounded-xl overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-[#34C759] to-[#34C759]/70 rounded-xl transition-all"
                    style={{ height: `${(day.present / day.total) * 100}%` }}
                  />
                </div>
                <p className="mt-3 text-2xl font-bold text-[#34C759]">{day.present}/{day.total}</p>
                <p className="text-xs text-[#86868B]">{((day.present / day.total) * 100).toFixed(0)}% present</p>
              </div>
            ))}
          </div>

          {/* Daily Explanation */}
          <div className="border-l-4 border-[#5856D6] pl-4 py-2 bg-[#5856D6]/5 rounded-r-xl">
            <p className="text-sm text-[#1D1D1F]">
              <strong>📅 Daily Trends:</strong> Monday and Tuesday classes (4 classes each) show consistent attendance patterns. 
              Wednesday classes (2 classes) maintain strong engagement. The data suggests no significant day-of-week preference 
              affecting attendance, indicating schedule convenience for most students.
            </p>
          </div>
        </div>

        {/* ==================== CURRICULUM PROGRESS ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
            <Target className="w-7 h-7 text-[#5856D6]" />
            Curriculum Progress
          </h2>

          {/* Topic Progress */}
          <div className="space-y-4 mb-8">
            {weekData.topicProgress.map((topic, idx) => (
              <div key={idx} className={`rounded-2xl p-5 ${topic.week === weekData.weekNumber ? 'bg-[#0071E3]/5 border-2 border-[#0071E3]' : 'bg-[#F5F5F7]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      topic.completionRate === 100 ? 'bg-[#34C759] text-white' : 
                      topic.week === weekData.weekNumber ? 'bg-[#0071E3] text-white' : 'bg-[#D2D2D7] text-white'
                    }`}>
                      {topic.week}
                    </span>
                    <div>
                      <p className="font-semibold text-[#1D1D1F]">{topic.en}</p>
                      <p className="text-sm text-[#86868B]">{topic.es}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${topic.completionRate === 100 ? 'text-[#34C759]' : 'text-[#0071E3]'}`}>
                      {topic.completionRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-[#86868B]">{topic.studentsCompleted} students</p>
                  </div>
                </div>
                <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${topic.completionRate === 100 ? 'bg-[#34C759]' : 'bg-[#0071E3]'}`}
                    style={{ width: `${topic.completionRate}%` }}
                  />
                </div>
                {topic.week === weekData.weekNumber && (
                  <p className="text-xs text-[#0071E3] mt-2 font-medium">← Current Week</p>
                )}
              </div>
            ))}
          </div>

          {/* Curriculum Explanation */}
          <div className="border-l-4 border-[#FF9500] pl-4 py-2 bg-[#FF9500]/5 rounded-r-xl">
            <p className="text-sm text-[#1D1D1F]">
              <strong>📚 Curriculum Insight:</strong> Week {weekData.weekNumber} focuses on "{COURSE_TOPICS.find(t => t.week === weekData.weekNumber)?.en || 'Current Topic'}". 
              {weekData.weekNumber > 1 && ` Previous weeks' content has been fully covered with ${weekData.topicProgress.filter(t => t.completionRate === 100).length} topics at 100% completion.`}
              {' '}Students showing below 70% proficiency in any topic are scheduled for supplementary sessions.
            </p>
          </div>
        </div>

        {/* ==================== GEOGRAPHIC & INSTRUCTOR DATA ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* County Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#5856D6]" />
                Geographic Distribution
              </h3>
              {weekData.countyData.map((county, idx) => (
                <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-[#1D1D1F]">{county.county}</p>
                    <span className="text-2xl font-bold text-[#5856D6]">{county.students}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#86868B]">Attendance</p>
                      <p className="font-semibold text-[#34C759]">{county.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-[#86868B]">Proficiency</p>
                      <p className="font-semibold text-[#0071E3]">{county.proficiency}%</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-l-4 border-[#5856D6] pl-4 py-2 bg-[#5856D6]/5 rounded-r-xl">
                <p className="text-xs text-[#1D1D1F]">
                  <strong>🗺️ Regional Note:</strong> Both counties show comparable performance metrics, 
                  indicating equitable program delivery across service areas.
                </p>
              </div>
            </div>

            {/* Instructor Performance */}
            <div>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#00C7BE]" />
                Instructor Performance
              </h3>
              {weekData.instructorData.map((instructor, idx) => (
                <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-[#1D1D1F]">{instructor.name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(parseFloat(instructor.studentSatisfaction)) ? 'text-[#FF9500]' : 'text-[#D2D2D7]'}`}>★</span>
                      ))}
                      <span className="text-sm font-medium text-[#1D1D1F] ml-1">{instructor.studentSatisfaction}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="font-bold text-[#0071E3]">{instructor.classes}</p>
                      <p className="text-[#86868B]">Classes</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="font-bold text-[#34C759]">{instructor.sessionsThisWeek}</p>
                      <p className="text-[#86868B]">Sessions</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="font-bold text-[#5856D6]">{instructor.avgAttendance}%</p>
                      <p className="text-[#86868B]">Attendance</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-l-4 border-[#00C7BE] pl-4 py-2 bg-[#00C7BE]/5 rounded-r-xl">
                <p className="text-xs text-[#1D1D1F]">
                  <strong>👩‍🏫 Instructor Note:</strong> All instructors maintained high student satisfaction 
                  ratings (4.3+) this week. Attendance rates in their classes reflect effective engagement strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== HIGHLIGHTS & CONCERNS ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#FF9500]" />
            Weekly Highlights & Action Items
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Highlights */}
            <div>
              <h3 className="text-lg font-semibold text-[#34C759] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Highlights
              </h3>
              <div className="space-y-3">
                {weekData.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#34C759]/5 rounded-xl">
                    <ChevronRight className="w-5 h-5 text-[#34C759] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1D1D1F]">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div>
              <h3 className="text-lg font-semibold text-[#FF9500] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Areas of Concern
              </h3>
              <div className="space-y-3">
                {weekData.concerns.map((concern, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#FF9500]/5 rounded-xl">
                    <ChevronRight className="w-5 h-5 text-[#FF9500] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1D1D1F]">{concern}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-[#0071E3] mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommendations for Next Week
            </h3>
            <div className="bg-[#0071E3]/5 rounded-2xl p-6">
              <ol className="space-y-3">
                {weekData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#0071E3] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-[#1D1D1F]">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-8 text-center">
          <p className="text-[#86868B] text-sm">
            Weekly Report - Digital Literacy Program | Week {weekData.weekNumber} of 6
          </p>
          <p className="text-[#86868B] text-sm mt-1">
            Informe Semanal - Programa de Alfabetización Digital | Semana {weekData.weekNumber} de 6
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-2xl">🏛️</span>
            <span className="text-2xl">🏥</span>
            <span className="text-2xl">💻</span>
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

export default function WeeklyReportPage() {
  return (
    <AuthProvider>
      <WeeklyReportContent />
    </AuthProvider>
  );
}
