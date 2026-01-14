'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { CLASS_SCHEDULES, COUNTIES } from '@/lib/translations/digitalLiteracy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, GraduationCap, CheckCircle, Clock, TrendingUp, 
  BarChart3, PieChart, Calendar, MapPin, Filter, Download,
  ChevronDown, ChevronUp, Search, RefreshCw, ArrowLeft,
  Award, Target, Activity, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  classId: string;
  registrationDate: string;
  completed: boolean;
  completionDate?: string;
  attendance: { present: number; total: number };
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  checkinTime: string;
  checkinType: string;
}

interface InstructorAttendance {
  id: string;
  instructorId: string;
  instructorName: string;
  classId: string;
  className: string;
  date: string;
  checkinTime: string;
  status: string;
  minutesBeforeClass: number;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend,
  onClick 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: any; 
  color: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
}) {
  return (
    <div 
      className={`bg-white rounded-3xl border border-[#E5E5EA] p-6 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#86868B] mb-2">{title}</p>
          <p className="text-5xl font-semibold tracking-tight" style={{ color }}>{value}</p>
          {subtitle && <p className="text-sm text-[#86868B] mt-2">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              {trend.value >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#34C759]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#FF3B30] rotate-180" />
              )}
              <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4" 
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label?: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-[#86868B] font-medium">{label}</span>
          <span className="font-medium text-[#1D1D1F]">{value}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DataTable({ 
  data, 
  columns, 
  sortKey, 
  sortDir, 
  onSort,
  onRowClick 
}: { 
  data: any[]; 
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  onRowClick?: (item: any) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#D2D2D7]">
            {columns.map(col => (
              <th 
                key={col.key}
                className="text-left py-3 px-4 text-sm font-semibold text-[#6E6E73] cursor-pointer hover:text-[#1D1D1F]"
                onClick={() => onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr 
              key={item.id || idx}
              className={`border-b border-[#E5E5EA] hover:bg-[#F5F5F7] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4 text-sm text-[#1D1D1F]">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-[#6E6E73]">
          No data available | No hay datos disponibles
        </div>
      )}
    </div>
  );
}

function ProgramMetricsDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [instructorAttendance, setInstructorAttendance] = useState<InstructorAttendance[]>([]);
  
  // Filters
  const [classFilter, setClassFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const studentsRef = collection(db, 'digital_literacy_students');
        const studentsSnap = await getDocs(studentsRef);
        const studentsData: Student[] = studentsSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          email: doc.data().email || '',
          phone: doc.data().phone || '',
          county: doc.data().county || '',
          classId: doc.data().classId || '',
          registrationDate: doc.data().registrationDate || doc.data().createdAt?.toDate?.()?.toISOString() || '',
          completed: doc.data().completed || false,
          completionDate: doc.data().completionDate,
          attendance: doc.data().attendance || { present: 0, total: 0 },
        }));
        setStudents(studentsData);

        // Fetch student attendance
        const attendanceRef = collection(db, 'digital_literacy_attendance');
        const attendanceSnap = await getDocs(attendanceRef);
        const attendanceData: AttendanceRecord[] = attendanceSnap.docs.map(doc => ({
          id: doc.id,
          studentId: doc.data().studentId || '',
          studentName: doc.data().studentName || '',
          classId: doc.data().classId || '',
          className: doc.data().className || '',
          date: doc.data().date || '',
          checkinTime: doc.data().checkinTime || '',
          checkinType: doc.data().checkinType || '',
        }));
        setAttendance(attendanceData);

        // Fetch instructor attendance
        const instructorRef = collection(db, 'digital_literacy_instructor_attendance');
        const instructorSnap = await getDocs(instructorRef);
        const instructorData: InstructorAttendance[] = instructorSnap.docs.map(doc => ({
          id: doc.id,
          instructorId: doc.data().instructorId || '',
          instructorName: doc.data().instructorName || '',
          classId: doc.data().classId || '',
          className: doc.data().className || '',
          date: doc.data().date || '',
          checkinTime: doc.data().checkinTime || '',
          status: doc.data().status || '',
          minutesBeforeClass: doc.data().minutesBeforeClass || 0,
        }));
        setInstructorAttendance(instructorData);

      } catch (error) {
        console.error('Error fetching metrics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Computed metrics
  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const completedStudents = students.filter(s => s.completed).length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
    
    // Class enrollment counts
    const classEnrollments: { [key: string]: number } = {};
    students.forEach(s => {
      if (s.classId) {
        classEnrollments[s.classId] = (classEnrollments[s.classId] || 0) + 1;
      }
    });
    const fullClasses = Object.values(classEnrollments).filter(c => c >= 18).length;
    
    // County distribution
    const countyDistribution: { [key: string]: number } = {};
    students.forEach(s => {
      if (s.county) {
        countyDistribution[s.county] = (countyDistribution[s.county] || 0) + 1;
      }
    });

    // Attendance metrics
    const totalCheckins = attendance.length;
    const uniqueStudentsAttended = new Set(attendance.map(a => a.studentId)).size;
    const avgAttendanceRate = totalStudents > 0 ? Math.round((uniqueStudentsAttended / totalStudents) * 100) : 0;

    // Instructor metrics
    const totalInstructorCheckins = instructorAttendance.length;
    const earlyCheckins = instructorAttendance.filter(i => i.status === 'early').length;
    const lateCheckins = instructorAttendance.filter(i => i.status === 'late').length;
    const onTimeRate = totalInstructorCheckins > 0 
      ? Math.round(((totalInstructorCheckins - lateCheckins) / totalInstructorCheckins) * 100) 
      : 100;

    // Weekly registration trend (last 4 weeks)
    const now = new Date();
    const weeklyRegistrations: number[] = [0, 0, 0, 0];
    students.forEach(s => {
      if (s.registrationDate) {
        const regDate = new Date(s.registrationDate);
        const weeksAgo = Math.floor((now.getTime() - regDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weeksAgo >= 0 && weeksAgo < 4) {
          weeklyRegistrations[3 - weeksAgo]++;
        }
      }
    });

    return {
      totalStudents,
      completedStudents,
      completionRate,
      totalClasses: CLASS_SCHEDULES.length,
      fullClasses,
      classEnrollments,
      countyDistribution,
      totalCheckins,
      uniqueStudentsAttended,
      avgAttendanceRate,
      totalInstructorCheckins,
      earlyCheckins,
      lateCheckins,
      onTimeRate,
      weeklyRegistrations,
    };
  }, [students, attendance, instructorAttendance]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    
    if (classFilter !== 'all') {
      filtered = filtered.filter(s => s.classId === classFilter);
    }
    if (countyFilter !== 'all') {
      filtered = filtered.filter(s => s.county === countyFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortKey] || '';
      const bVal = (b as any)[sortKey] || '';
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [students, classFilter, countyFilter, searchQuery, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'County', 'Class', 'Registration Date', 'Completed'];
    const rows = filteredStudents.map(s => [
      s.name,
      s.email,
      s.phone,
      s.county,
      CLASS_SCHEDULES.find(c => c.id === s.classId)?.en || s.classId,
      s.registrationDate ? new Date(s.registrationDate).toLocaleDateString() : '',
      s.completed ? 'Yes' : 'No'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-literacy-students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#0071E3] mx-auto mb-4" />
            <p className="text-[#6E6E73]">Loading metrics... | Cargando métricas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-12">
        {/* Apple-styled Header */}
        <div className="mb-10">
          <Link 
            href="/forms/digital-literacy"
            className="inline-flex items-center text-[#0071E3] hover:text-[#0077ED] text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Program | Volver al Programa
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-[#1D1D1F] tracking-tight">
                Program Metrics Dashboard
              </h1>
              <p className="text-lg text-[#6E6E73] mt-2">
                Digital Literacy Program Analytics | Análisis del Programa de Alfabetización Digital
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-[#D2D2D7] hover:bg-[#F5F5F7] rounded-full px-6"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-6 shadow-lg"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Total Students | Total Estudiantes"
            value={metrics.totalStudents}
            subtitle={`${metrics.uniqueStudentsAttended} attended at least once`}
            icon={Users}
            color="#0071E3"
            trend={{ value: 12, label: 'this week' }}
          />
          <MetricCard
            title="Completion Rate | Tasa de Finalización"
            value={`${metrics.completionRate}%`}
            subtitle={`${metrics.completedStudents} of ${metrics.totalStudents} completed`}
            icon={Award}
            color="#34C759"
          />
          <MetricCard
            title="Attendance Rate | Tasa de Asistencia"
            value={`${metrics.avgAttendanceRate}%`}
            subtitle={`${metrics.totalCheckins} total check-ins`}
            icon={CheckCircle}
            color="#5856D6"
          />
          <MetricCard
            title="Instructor Punctuality | Puntualidad"
            value={`${metrics.onTimeRate}%`}
            subtitle={`${metrics.earlyCheckins} early, ${metrics.lateCheckins} late`}
            icon={Clock}
            color="#00C7BE"
          />
        </div>

        {/* Apple-styled Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="inline-flex bg-[#F5F5F7] p-1.5 rounded-2xl gap-1">
            <TabsTrigger 
              value="overview" 
              className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger 
              value="attendance" 
              className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger 
              value="instructors" 
              className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Instructors
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Class Enrollment */}
              <div className="bg-white rounded-3xl border border-[#E5E5EA] p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">
                  Class Enrollment | Inscripción por Clase
                </h3>
                <div className="space-y-5">
                  {CLASS_SCHEDULES.map(cls => (
                    <ProgressBar
                      key={cls.id}
                      value={metrics.classEnrollments[cls.id] || 0}
                      max={18}
                      color={metrics.classEnrollments[cls.id] >= 18 ? '#34C759' : '#0071E3'}
                      label={cls.en.replace('Class ', '').split(':')[0]}
                    />
                  ))}
                </div>
              </div>

              {/* County Distribution */}
              <div className="bg-white rounded-3xl border border-[#E5E5EA] p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">
                  County Distribution | Distribución por Condado
                </h3>
                <div className="space-y-5">
                  {COUNTIES.map(county => {
                    const count = metrics.countyDistribution[county.id] || 0;
                    const percentage = metrics.totalStudents > 0 
                      ? Math.round((count / metrics.totalStudents) * 100) 
                      : 0;
                    return (
                      <div key={county.id} className="flex items-center justify-between p-4 bg-[#F5F5F7] rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#5856D6]/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-[#5856D6]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#1D1D1F]">{county.en}</p>
                            <p className="text-sm text-[#86868B]">{county.es}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-semibold text-[#5856D6]">{count}</p>
                          <p className="text-sm text-[#86868B]">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white rounded-3xl border border-[#E5E5EA] p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">
                Weekly Registration Trend | Tendencia de Registro Semanal
              </h3>
              <div className="flex items-end justify-between h-48 gap-6">
                {['4 weeks ago', '3 weeks ago', '2 weeks ago', 'This week'].map((label, idx) => {
                  const value = metrics.weeklyRegistrations[idx];
                  const maxValue = Math.max(...metrics.weeklyRegistrations, 1);
                  const height = (value / maxValue) * 100;
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full bg-[#F5F5F7] rounded-2xl relative" style={{ height: '140px' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-[#0071E3] to-[#5856D6] rounded-2xl transition-all duration-500"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                      </div>
                      <p className="text-3xl font-semibold text-[#1D1D1F]">{value}</p>
                      <p className="text-sm text-[#86868B] text-center">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {/* Filters */}
            <Card className="border-[#D2D2D7]">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#6E6E73]" />
                    <span className="text-sm font-medium text-[#6E6E73]">Filters:</span>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E73]" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>
                  </div>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="all">All Classes</option>
                    {CLASS_SCHEDULES.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.en}</option>
                    ))}
                  </select>
                  <select
                    value={countyFilter}
                    onChange={(e) => setCountyFilter(e.target.value)}
                    className="px-4 py-2 border border-[#D2D2D7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    <option value="all">All Counties</option>
                    {COUNTIES.map(county => (
                      <option key={county.id} value={county.id}>{county.en}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card className="border-[#D2D2D7]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1D1D1F]">
                  Student List ({filteredStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={filteredStudents}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { 
                      key: 'county', 
                      label: 'County',
                      render: (item) => COUNTIES.find(c => c.id === item.county)?.en || item.county
                    },
                    { 
                      key: 'classId', 
                      label: 'Class',
                      render: (item) => CLASS_SCHEDULES.find(c => c.id === item.classId)?.en.split(':')[0] || item.classId
                    },
                    { 
                      key: 'registrationDate', 
                      label: 'Registered',
                      render: (item) => item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : '-'
                    },
                    { 
                      key: 'completed', 
                      label: 'Status',
                      render: (item) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.completed 
                            ? 'bg-[#34C759]/10 text-[#34C759]' 
                            : 'bg-[#FF9500]/10 text-[#FF9500]'
                        }`}>
                          {item.completed ? 'Completed' : 'In Progress'}
                        </span>
                      )
                    },
                  ]}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Total Check-ins"
                value={metrics.totalCheckins}
                icon={CheckCircle}
                color="#34C759"
              />
              <MetricCard
                title="Unique Students"
                value={metrics.uniqueStudentsAttended}
                icon={Users}
                color="#5856D6"
              />
              <MetricCard
                title="Avg Attendance"
                value={`${metrics.avgAttendanceRate}%`}
                icon={Target}
                color="#0071E3"
              />
            </div>

            <Card className="border-[#D2D2D7]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1D1D1F]">
                  Recent Check-ins | Registros Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={attendance.slice(0, 20)}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'className', label: 'Class' },
                    { 
                      key: 'date', 
                      label: 'Date',
                      render: (item) => item.date ? new Date(item.date).toLocaleDateString() : '-'
                    },
                    { 
                      key: 'checkinTime', 
                      label: 'Time',
                      render: (item) => item.checkinTime ? new Date(item.checkinTime).toLocaleTimeString() : '-'
                    },
                    { 
                      key: 'checkinType', 
                      label: 'Type',
                      render: (item) => (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#34C759]/10 text-[#34C759]">
                          {item.checkinType === 'end_of_class' ? 'End of Class' : item.checkinType}
                        </span>
                      )
                    },
                  ]}
                  sortKey="date"
                  sortDir="desc"
                  onSort={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Total Sessions"
                value={metrics.totalInstructorCheckins}
                icon={GraduationCap}
                color="#00C7BE"
              />
              <MetricCard
                title="Early Arrivals"
                value={metrics.earlyCheckins}
                subtitle="Arrived before class"
                icon={Clock}
                color="#34C759"
              />
              <MetricCard
                title="Late Arrivals"
                value={metrics.lateCheckins}
                subtitle="Arrived after class start"
                icon={Activity}
                color="#FF3B30"
              />
            </div>

            <Card className="border-[#D2D2D7]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1D1D1F]">
                  Instructor Check-ins | Registros de Instructores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={instructorAttendance}
                  columns={[
                    { key: 'instructorName', label: 'Instructor' },
                    { key: 'className', label: 'Class' },
                    { 
                      key: 'date', 
                      label: 'Date',
                      render: (item) => item.date ? new Date(item.date).toLocaleDateString() : '-'
                    },
                    { 
                      key: 'checkinTime', 
                      label: 'Check-in Time',
                      render: (item) => item.checkinTime ? new Date(item.checkinTime).toLocaleTimeString() : '-'
                    },
                    { 
                      key: 'minutesBeforeClass', 
                      label: 'Minutes Early',
                      render: (item) => (
                        <span className={item.minutesBeforeClass > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}>
                          {item.minutesBeforeClass > 0 ? `+${item.minutesBeforeClass}` : item.minutesBeforeClass}
                        </span>
                      )
                    },
                    { 
                      key: 'status', 
                      label: 'Status',
                      render: (item) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'early' 
                            ? 'bg-[#34C759]/10 text-[#34C759]' 
                            : item.status === 'late'
                            ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                            : 'bg-[#0071E3]/10 text-[#0071E3]'
                        }`}>
                          {item.status === 'early' ? 'Early' : item.status === 'late' ? 'Late' : 'On Time'}
                        </span>
                      )
                    },
                  ]}
                  sortKey="date"
                  sortDir="desc"
                  onSort={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default function MetricsPage() {
  return (
    <AuthProvider>
      <ProgramMetricsDashboard />
    </AuthProvider>
  );
}
