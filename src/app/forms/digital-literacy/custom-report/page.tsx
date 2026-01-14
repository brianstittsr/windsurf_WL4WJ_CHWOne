'use client';

import React, { useState, useRef } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLASS_SCHEDULES, COURSE_TOPICS } from '@/lib/translations/digitalLiteracy';
import { 
  FileDown, Printer, ArrowLeft, ArrowRight, Users, GraduationCap, 
  CheckCircle, TrendingUp, TrendingDown, Award, Calendar, MapPin,
  Target, Activity, BarChart3, AlertTriangle, ChevronRight, Sparkles,
  Wand2, RefreshCw, Check, X, FileText, Settings, Eye
} from 'lucide-react';
import Link from 'next/link';

// Wizard steps
type WizardStep = 'timeframe' | 'sections' | 'comments' | 'preview';

// Report sections that can be included
const REPORT_SECTIONS = [
  { id: 'executive', name: 'Executive Summary', nameEs: 'Resumen Ejecutivo', default: true },
  { id: 'attendance', name: 'Attendance Analysis', nameEs: 'Análisis de Asistencia', default: true },
  { id: 'curriculum', name: 'Curriculum Progress', nameEs: 'Progreso del Currículo', default: true },
  { id: 'geographic', name: 'Geographic Distribution', nameEs: 'Distribución Geográfica', default: true },
  { id: 'instructors', name: 'Instructor Performance', nameEs: 'Rendimiento de Instructores', default: true },
  { id: 'highlights', name: 'Highlights & Concerns', nameEs: 'Destacados y Preocupaciones', default: true },
  { id: 'recommendations', name: 'Recommendations', nameEs: 'Recomendaciones', default: true },
];

// Timeframe presets
const TIMEFRAME_PRESETS = [
  { id: 'week1', label: 'Week 1 (Jan 6-10)', startDate: '2026-01-06', endDate: '2026-01-10' },
  { id: 'week2', label: 'Week 2 (Jan 13-17)', startDate: '2026-01-13', endDate: '2026-01-17' },
  { id: 'week3', label: 'Week 3 (Jan 20-24)', startDate: '2026-01-20', endDate: '2026-01-24' },
  { id: 'week4', label: 'Week 4 (Jan 27-31)', startDate: '2026-01-27', endDate: '2026-01-31' },
  { id: 'week5', label: 'Week 5 (Feb 3-7)', startDate: '2026-02-03', endDate: '2026-02-07' },
  { id: 'week6', label: 'Week 6 (Feb 10-14)', startDate: '2026-02-10', endDate: '2026-02-14' },
  { id: 'full', label: 'Full Program (Jan 6 - Feb 14)', startDate: '2026-01-06', endDate: '2026-02-14' },
  { id: 'custom', label: 'Custom Date Range', startDate: '', endDate: '' },
];

// AI Enhancement prompts
const AI_ENHANCEMENT_OPTIONS = [
  { id: 'professional', label: 'Make more professional', icon: '💼' },
  { id: 'concise', label: 'Make more concise', icon: '✂️' },
  { id: 'detailed', label: 'Add more detail', icon: '📝' },
  { id: 'positive', label: 'Emphasize positives', icon: '✨' },
  { id: 'actionable', label: 'Make more actionable', icon: '🎯' },
];

// Generate report data based on timeframe
const generateReportData = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weeksCount = Math.ceil(daysDiff / 7);
  
  return {
    timeframe: {
      startDate: start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      endDate: end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysCount: daysDiff,
      weeksCount,
    },
    reportDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    
    executiveSummary: {
      totalStudents: 90,
      activeStudents: 86,
      averageAttendance: '87.5',
      attendanceTrend: 2.3,
      averageProficiency: '82.1',
      proficiencyTrend: 3.1,
      sessionsCompleted: weeksCount * 6,
      totalSessions: 36,
    },
    
    classAttendance: CLASS_SCHEDULES.map((cls, idx) => ({
      classId: cls.id,
      className: cls.en.split(':')[0],
      enrolled: [18, 16, 17, 15, 12, 12][idx] || 15,
      present: [16, 14, 15, 13, 11, 10][idx] || 13,
      absent: [2, 2, 2, 2, 1, 2][idx] || 2,
      attendanceRate: ['88.9', '87.5', '88.2', '86.7', '91.7', '83.3'][idx] || '86.7',
      trend: ['up', 'up', 'down', 'up', 'up', 'down'][idx] || 'up',
    })),
    
    dailyAttendance: [
      { day: 'Monday', present: 30, total: 34 },
      { day: 'Tuesday', present: 28, total: 32 },
      { day: 'Wednesday', present: 21, total: 24 },
    ],
    
    topicProgress: COURSE_TOPICS.slice(0, weeksCount).map((topic, idx) => ({
      ...topic,
      completionRate: idx < weeksCount - 1 ? 100 : 78,
      averageScore: idx < weeksCount - 1 ? 85 : 76,
      studentsCompleted: idx < weeksCount - 1 ? 90 : 70,
    })),
    
    countyData: [
      { county: 'Moore County', students: 52, attendance: '89.2', proficiency: '84.5' },
      { county: 'Montgomery County', students: 38, attendance: '86.8', proficiency: '81.2' },
    ],
    
    instructorData: [
      { name: 'María García', classes: 2, avgAttendance: '91.2', studentSatisfaction: '4.8' },
      { name: 'Carlos Rodriguez', classes: 2, avgAttendance: '87.5', studentSatisfaction: '4.6' },
      { name: 'Ana Martinez', classes: 2, avgAttendance: '89.8', studentSatisfaction: '4.9' },
    ],
    
    highlights: [
      'Strong attendance maintained across all classes',
      '5 students achieved perfect attendance during this period',
      'Topic completion rates exceeded expectations',
    ],
    concerns: [
      '2 students have missed 2+ consecutive sessions',
      'Some students struggling with advanced concepts',
      'Transportation challenges reported by 2 students',
    ],
    recommendations: [
      'Schedule follow-up calls with absent students',
      'Consider additional tutoring sessions',
      'Prepare supplementary materials for advanced topics',
    ],
  };
};

// Simulate AI enhancement
const enhanceWithAI = async (text: string, style: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const enhancements: { [key: string]: (t: string) => string } = {
    professional: (t) => `Based on our comprehensive analysis, ${t.toLowerCase()} This assessment reflects our commitment to data-driven program management and continuous improvement.`,
    concise: (t) => t.split('.').slice(0, 2).join('.') + '.',
    detailed: (t) => `${t} Furthermore, this observation is supported by quantitative metrics collected throughout the reporting period, including attendance records, proficiency assessments, and instructor evaluations.`,
    positive: (t) => `We are pleased to report that ${t.toLowerCase()} This positive outcome demonstrates the effectiveness of our program design and the dedication of our instructors and students.`,
    actionable: (t) => `${t} To build on this, we recommend implementing specific action items within the next reporting period to ensure continued progress.`,
  };
  
  return enhancements[style]?.(text) || text;
};

function CustomReportWizard() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('timeframe');
  const [reportTitle, setReportTitle] = useState('Digital Literacy Program Report');
  
  // Timeframe state
  const [selectedPreset, setSelectedPreset] = useState('week3');
  const [customStartDate, setCustomStartDate] = useState('2026-01-06');
  const [customEndDate, setCustomEndDate] = useState('2026-01-24');
  
  // Sections state
  const [selectedSections, setSelectedSections] = useState<string[]>(
    REPORT_SECTIONS.filter(s => s.default).map(s => s.id)
  );
  
  // Comments state
  const [comments, setComments] = useState({
    executive: '',
    attendance: '',
    curriculum: '',
    geographic: '',
    instructors: '',
    highlights: '',
    recommendations: '',
    closing: '',
  });
  
  // AI enhancement state
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  const [showAIOptions, setShowAIOptions] = useState<string | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);

  // Get effective dates based on preset or custom
  const getEffectiveDates = () => {
    if (selectedPreset === 'custom') {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    const preset = TIMEFRAME_PRESETS.find(p => p.id === selectedPreset);
    return { startDate: preset?.startDate || '', endDate: preset?.endDate || '' };
  };

  const { startDate, endDate } = getEffectiveDates();
  const reportData = generateReportData(startDate, endDate);

  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle AI enhancement
  const handleAIEnhance = async (field: string, style: string) => {
    setEnhancingField(field);
    setShowAIOptions(null);
    
    const currentText = comments[field as keyof typeof comments] || getDefaultComment(field);
    const enhanced = await enhanceWithAI(currentText, style);
    
    setComments(prev => ({ ...prev, [field]: enhanced }));
    setEnhancingField(null);
  };

  // Get default comment for a section
  const getDefaultComment = (field: string): string => {
    const defaults: { [key: string]: string } = {
      executive: 'The program continues to show strong engagement and positive outcomes.',
      attendance: 'Attendance patterns remain consistent with program expectations.',
      curriculum: 'Students are progressing well through the curriculum.',
      geographic: 'Both counties show comparable performance metrics.',
      instructors: 'All instructors maintained high student satisfaction ratings.',
      highlights: 'Several notable achievements were recorded during this period.',
      recommendations: 'The following actions are recommended for the next period.',
      closing: 'We appreciate the continued support of all stakeholders.',
    };
    return defaults[field] || '';
  };

  // Navigation
  const steps: WizardStep[] = ['timeframe', 'sections', 'comments', 'preview'];
  const currentStepIndex = steps.indexOf(currentStep);
  
  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };
  
  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Trend indicator component
  const TrendIndicator = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    );
  };

  // Comment input with AI enhancement
  const CommentInput = ({ field, label }: { field: string; label: string }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[#1D1D1F] font-medium">{label}</Label>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIOptions(showAIOptions === field ? null : field)}
            disabled={enhancingField === field}
            className="text-[#5856D6] hover:text-[#4B4ACF] hover:bg-[#5856D6]/10"
          >
            {enhancingField === field ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1" />
            )}
            Enhance with AI
          </Button>
          
          {showAIOptions === field && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#E5E5EA] p-2 z-10 w-56">
              {AI_ENHANCEMENT_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleAIEnhance(field, option.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5F5F7] text-sm flex items-center gap-2"
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <textarea
        value={comments[field as keyof typeof comments]}
        onChange={(e) => setComments(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={getDefaultComment(field)}
        className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Control Bar */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-[#D2D2D7] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link 
            href="/forms/digital-literacy"
            className="inline-flex items-center text-[#0071E3] hover:text-[#0077ED] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Program
          </Link>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => setCurrentStep(step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx === currentStepIndex 
                      ? 'bg-[#0071E3] text-white' 
                      : idx < currentStepIndex 
                      ? 'bg-[#34C759] text-white'
                      : 'bg-[#E5E5EA] text-[#86868B]'
                  }`}
                >
                  {idx < currentStepIndex ? <Check className="w-4 h-4" /> : idx + 1}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${idx < currentStepIndex ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {currentStep === 'preview' && (
            <Button 
              className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-6"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Export PDF
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto py-8 px-6 print:py-0 print:px-0 print:max-w-none">
        
        {/* ==================== STEP 1: TIMEFRAME ==================== */}
        {currentStep === 'timeframe' && (
          <div className="bg-white rounded-3xl shadow-lg p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[#0071E3]/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-[#0071E3]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">Select Report Timeframe</h2>
                <p className="text-[#86868B]">Choose the date range for your custom report</p>
              </div>
            </div>

            <div className="mb-8">
              <Label className="text-[#1D1D1F] font-medium mb-3 block">Report Title</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="max-w-md"
                placeholder="Enter report title..."
              />
            </div>

            <div className="mb-8">
              <Label className="text-[#1D1D1F] font-medium mb-3 block">Timeframe Preset</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIMEFRAME_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPreset === preset.id 
                        ? 'border-[#0071E3] bg-[#0071E3]/5' 
                        : 'border-[#E5E5EA] hover:border-[#D2D2D7]'
                    }`}
                  >
                    <p className={`font-medium ${selectedPreset === preset.id ? 'text-[#0071E3]' : 'text-[#1D1D1F]'}`}>
                      {preset.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedPreset === 'custom' && (
              <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[#1D1D1F] font-medium mb-2 block">Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-[#1D1D1F] font-medium mb-2 block">End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#0071E3]/5 rounded-2xl p-6">
              <p className="text-[#1D1D1F]">
                <strong>Selected Period:</strong> {reportData.timeframe.startDate} - {reportData.timeframe.endDate}
              </p>
              <p className="text-[#86868B] text-sm mt-1">
                {reportData.timeframe.daysCount} days ({reportData.timeframe.weeksCount} week{reportData.timeframe.weeksCount > 1 ? 's' : ''})
              </p>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={goNext} className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-8">
                Next: Select Sections
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: SECTIONS ==================== */}
        {currentStep === 'sections' && (
          <div className="bg-white rounded-3xl shadow-lg p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[#5856D6]/10 rounded-2xl flex items-center justify-center">
                <Settings className="w-7 h-7 text-[#5856D6]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">Select Report Sections</h2>
                <p className="text-[#86868B]">Choose which sections to include in your report</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {REPORT_SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                    selectedSections.includes(section.id)
                      ? 'border-[#34C759] bg-[#34C759]/5'
                      : 'border-[#E5E5EA] hover:border-[#D2D2D7]'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${selectedSections.includes(section.id) ? 'text-[#34C759]' : 'text-[#1D1D1F]'}`}>
                      {section.name}
                    </p>
                    <p className="text-sm text-[#86868B]">{section.nameEs}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedSections.includes(section.id) ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                  }`}>
                    {selectedSections.includes(section.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#F5F5F7] rounded-2xl p-4">
              <p className="text-sm text-[#86868B]">
                <strong>{selectedSections.length}</strong> of {REPORT_SECTIONS.length} sections selected
              </p>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={goPrev} className="rounded-full px-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={goNext} className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-8">
                Next: Add Comments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: COMMENTS ==================== */}
        {currentStep === 'comments' && (
          <div className="bg-white rounded-3xl shadow-lg p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-[#FF9500]/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#FF9500]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">Add Comments & Notes</h2>
                <p className="text-[#86868B]">Add custom commentary to each section. Use AI to enhance your writing.</p>
              </div>
            </div>

            <div className="bg-[#5856D6]/5 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#5856D6]" />
              <p className="text-sm text-[#1D1D1F]">
                <strong>AI Enhancement:</strong> Click "Enhance with AI" on any field to improve your text with different styles.
              </p>
            </div>

            <div className="space-y-2">
              {selectedSections.includes('executive') && (
                <CommentInput field="executive" label="Executive Summary Comment" />
              )}
              {selectedSections.includes('attendance') && (
                <CommentInput field="attendance" label="Attendance Analysis Comment" />
              )}
              {selectedSections.includes('curriculum') && (
                <CommentInput field="curriculum" label="Curriculum Progress Comment" />
              )}
              {selectedSections.includes('geographic') && (
                <CommentInput field="geographic" label="Geographic Distribution Comment" />
              )}
              {selectedSections.includes('instructors') && (
                <CommentInput field="instructors" label="Instructor Performance Comment" />
              )}
              {selectedSections.includes('highlights') && (
                <CommentInput field="highlights" label="Highlights & Concerns Comment" />
              )}
              {selectedSections.includes('recommendations') && (
                <CommentInput field="recommendations" label="Recommendations Comment" />
              )}
              <CommentInput field="closing" label="Closing Remarks" />
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={goPrev} className="rounded-full px-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={goNext} className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-8">
                Preview Report
                <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== STEP 4: PREVIEW ==================== */}
        {currentStep === 'preview' && (
          <div ref={reportRef}>
            {/* Report Header */}
            <div className="bg-gradient-to-r from-[#0071E3] to-[#5856D6] rounded-3xl print:rounded-none p-10 text-white mb-8" style={{ boxShadow: '0 8px 32px rgba(0,113,227,0.3)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-2">CUSTOM REPORT</p>
                  <h1 className="text-4xl font-bold tracking-tight mb-1">{reportTitle}</h1>
                  <p className="mt-3 opacity-80">
                    {reportData.timeframe.startDate} - {reportData.timeframe.endDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-3">
                    <span className="text-5xl">📊</span>
                  </div>
                  <p className="text-sm opacity-80">Generated: {reportData.reportDate}</p>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            {selectedSections.includes('executive') && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                  <BarChart3 className="w-7 h-7 text-[#0071E3]" />
                  Executive Summary
                </h2>

                {(comments.executive || getDefaultComment('executive')) && (
                  <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                    <p className="text-[#1D1D1F] leading-relaxed">
                      {comments.executive || getDefaultComment('executive')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-[#0071E3]/5 rounded-2xl p-5 text-center">
                    <Users className="w-8 h-8 text-[#0071E3] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-[#0071E3]">{reportData.executiveSummary.activeStudents}</p>
                    <p className="text-xs text-[#86868B] mt-1">Active Students</p>
                  </div>
                  <div className="bg-[#34C759]/5 rounded-2xl p-5 text-center">
                    <TrendingUp className="w-8 h-8 text-[#34C759] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-[#34C759]">{reportData.executiveSummary.averageAttendance}%</p>
                    <p className="text-xs text-[#86868B] mt-1">Avg Attendance</p>
                    <TrendIndicator value={reportData.executiveSummary.attendanceTrend} />
                  </div>
                  <div className="bg-[#5856D6]/5 rounded-2xl p-5 text-center">
                    <Award className="w-8 h-8 text-[#5856D6] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-[#5856D6]">{reportData.executiveSummary.averageProficiency}%</p>
                    <p className="text-xs text-[#86868B] mt-1">Avg Proficiency</p>
                    <TrendIndicator value={reportData.executiveSummary.proficiencyTrend} />
                  </div>
                  <div className="bg-[#FF9500]/5 rounded-2xl p-5 text-center">
                    <Calendar className="w-8 h-8 text-[#FF9500] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-[#FF9500]">{reportData.executiveSummary.sessionsCompleted}/{reportData.executiveSummary.totalSessions}</p>
                    <p className="text-xs text-[#86868B] mt-1">Sessions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Analysis */}
            {selectedSections.includes('attendance') && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-[#34C759]" />
                  Attendance Analysis
                </h2>

                {(comments.attendance || getDefaultComment('attendance')) && (
                  <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                    <p className="text-[#1D1D1F] leading-relaxed">
                      {comments.attendance || getDefaultComment('attendance')}
                    </p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#E5E5EA]">
                        <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Class</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Enrolled</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Present</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Rate</th>
                        <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.classAttendance.map((cls, idx) => (
                        <tr key={idx} className="border-b border-[#E5E5EA]">
                          <td className="py-3 px-4 font-medium text-[#1D1D1F]">{cls.className}</td>
                          <td className="py-3 px-4 text-center text-[#1D1D1F]">{cls.enrolled}</td>
                          <td className="py-3 px-4 text-center text-[#34C759] font-medium">{cls.present}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-semibold ${parseFloat(cls.attendanceRate) >= 85 ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
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
              </div>
            )}

            {/* Geographic Distribution */}
            {selectedSections.includes('geographic') && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                  <MapPin className="w-7 h-7 text-[#5856D6]" />
                  Geographic Distribution
                </h2>

                {(comments.geographic || getDefaultComment('geographic')) && (
                  <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                    <p className="text-[#1D1D1F] leading-relaxed">
                      {comments.geographic || getDefaultComment('geographic')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {reportData.countyData.map((county, idx) => (
                    <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
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
                </div>
              </div>
            )}

            {/* Instructor Performance */}
            {selectedSections.includes('instructors') && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                  <GraduationCap className="w-7 h-7 text-[#00C7BE]" />
                  Instructor Performance
                </h2>

                {(comments.instructors || getDefaultComment('instructors')) && (
                  <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                    <p className="text-[#1D1D1F] leading-relaxed">
                      {comments.instructors || getDefaultComment('instructors')}
                    </p>
                  </div>
                )}

                <div className="grid gap-4">
                  {reportData.instructorData.map((instructor, idx) => (
                    <div key={idx} className="bg-[#F5F5F7] rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#1D1D1F]">{instructor.name}</p>
                        <p className="text-sm text-[#86868B]">{instructor.classes} classes</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-bold text-[#34C759]">{instructor.avgAttendance}%</p>
                          <p className="text-xs text-[#86868B]">Attendance</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < Math.floor(parseFloat(instructor.studentSatisfaction)) ? 'text-[#FF9500]' : 'text-[#D2D2D7]'}`}>★</span>
                          ))}
                          <span className="text-sm font-medium text-[#1D1D1F] ml-1">{instructor.studentSatisfaction}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights & Concerns */}
            {selectedSections.includes('highlights') && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8 page-break-after">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                  <Activity className="w-7 h-7 text-[#FF9500]" />
                  Highlights & Concerns
                </h2>

                {(comments.highlights || getDefaultComment('highlights')) && (
                  <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                    <p className="text-[#1D1D1F] leading-relaxed">
                      {comments.highlights || getDefaultComment('highlights')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-[#34C759] mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Highlights
                    </h3>
                    <div className="space-y-3">
                      {reportData.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-[#34C759]/5 rounded-xl">
                          <ChevronRight className="w-5 h-5 text-[#34C759] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#1D1D1F]">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#FF9500] mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Concerns
                    </h3>
                    <div className="space-y-3">
                      {reportData.concerns.map((concern, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-[#FF9500]/5 rounded-xl">
                          <ChevronRight className="w-5 h-5 text-[#FF9500] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#1D1D1F]">{concern}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedSections.includes('recommendations') && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6 flex items-center gap-3">
                  <Target className="w-7 h-7 text-[#0071E3]" />
                  Recommendations
                </h2>

                {(comments.recommendations || getDefaultComment('recommendations')) && (
                  <div className="bg-[#F5F5F7] rounded-2xl p-6 mb-8">
                    <p className="text-[#1D1D1F] leading-relaxed">
                      {comments.recommendations || getDefaultComment('recommendations')}
                    </p>
                  </div>
                )}

                <div className="bg-[#0071E3]/5 rounded-2xl p-6">
                  <ol className="space-y-3">
                    {reportData.recommendations.map((rec, idx) => (
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
            )}

            {/* Closing Remarks */}
            {comments.closing && (
              <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-10 mb-8">
                <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6">Closing Remarks</h2>
                <div className="bg-[#F5F5F7] rounded-2xl p-6">
                  <p className="text-[#1D1D1F] leading-relaxed">{comments.closing}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-white rounded-3xl print:rounded-none shadow-lg print:shadow-none p-8 text-center">
              <p className="text-[#86868B] text-sm">
                Custom Report - Digital Literacy Program
              </p>
              <p className="text-[#86868B] text-sm mt-1">
                {reportData.timeframe.startDate} - {reportData.timeframe.endDate}
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

            {/* Navigation for preview */}
            <div className="print:hidden flex justify-between mt-8">
              <Button variant="outline" onClick={goPrev} className="rounded-full px-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Comments
              </Button>
              <Button onClick={handlePrint} className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-8">
                <Printer className="w-4 h-4 mr-2" />
                Print / Export PDF
              </Button>
            </div>
          </div>
        )}
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

export default function CustomReportPage() {
  return (
    <AuthProvider>
      <CustomReportWizard />
    </AuthProvider>
  );
}
