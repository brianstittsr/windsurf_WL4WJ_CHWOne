'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Sparkles, 
  Settings, 
  Send, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Wand2,
  Calendar,
  Mail,
  FileBarChart,
  Brain,
  RefreshCw
} from 'lucide-react';
import { Language, t, TRANSLATIONS } from '@/lib/translations/digitalLiteracy';
import LanguageToggle from './LanguageToggle';

interface ReportRequirements {
  reportType: string;
  reportTitle: string;
  reportDescription: string;
  dateRange: { start: string; end: string };
  includeMetrics: string[];
  customRequirements: string;
  enhancedRequirements: string;
}

interface GrantAnalysis {
  reportingFrequency: string;
  reportingDeadlines: string[];
  recipientEmails: string[];
  requiredFormats: string[];
  keyMetrics: string[];
  complianceRequirements: string[];
}

interface ReportConfig {
  format: string;
  recipients: string[];
  scheduleFrequency: string;
  includeCharts: boolean;
  includeSummary: boolean;
  language: 'en' | 'es' | 'both';
}

const REPORT_TYPES = [
  { id: 'attendance', en: 'Attendance Report', es: 'Informe de Asistencia' },
  { id: 'proficiency', en: 'Proficiency Assessment Report', es: 'Informe de Evaluación de Competencia' },
  { id: 'completion', en: 'Program Completion Report', es: 'Informe de Finalización del Programa' },
  { id: 'instructor', en: 'Instructor Performance Report', es: 'Informe de Desempeño del Instructor' },
  { id: 'grant', en: 'Grant Compliance Report', es: 'Informe de Cumplimiento de Subvención' },
  { id: 'custom', en: 'Custom Report', es: 'Informe Personalizado' },
];

const METRICS_OPTIONS = [
  { id: 'enrollment', en: 'Enrollment Numbers', es: 'Números de Inscripción' },
  { id: 'attendance_rate', en: 'Attendance Rate', es: 'Tasa de Asistencia' },
  { id: 'completion_rate', en: 'Completion Rate', es: 'Tasa de Finalización' },
  { id: 'proficiency_levels', en: 'Proficiency Levels', es: 'Niveles de Competencia' },
  { id: 'tablets_distributed', en: 'Tablets Distributed', es: 'Tabletas Distribuidas' },
  { id: 'demographics', en: 'Demographics', es: 'Demografía' },
  { id: 'class_performance', en: 'Class Performance', es: 'Rendimiento de Clase' },
  { id: 'instructor_hours', en: 'Instructor Hours', es: 'Horas de Instructor' },
];

interface AIReportWizardProps {
  onComplete?: (reportConfig: any) => void;
  onClose?: () => void;
  grantData?: any;
}

export default function AIReportWizard({
  onComplete,
  onClose,
  grantData,
}: AIReportWizardProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [requirements, setRequirements] = useState<ReportRequirements>({
    reportType: '',
    reportTitle: '',
    reportDescription: '',
    dateRange: { start: '', end: '' },
    includeMetrics: [],
    customRequirements: '',
    enhancedRequirements: '',
  });

  const [grantAnalysis, setGrantAnalysis] = useState<GrantAnalysis>({
    reportingFrequency: '',
    reportingDeadlines: [],
    recipientEmails: [],
    requiredFormats: [],
    keyMetrics: [],
    complianceRequirements: [],
  });

  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    format: 'pdf',
    recipients: [],
    scheduleFrequency: 'monthly',
    includeCharts: true,
    includeSummary: true,
    language: 'both',
  });

  const [newRecipient, setNewRecipient] = useState('');

  useEffect(() => {
    const savedLang = localStorage.getItem('digitalLiteracyLanguage');
    if (savedLang === 'en' || savedLang === 'es') {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('digitalLiteracyLanguage', lang);
  };

  const getText = (key: string) => t(key, language, TRANSLATIONS);

  const steps = [
    { 
      id: 'requirements', 
      icon: FileText, 
      title: language === 'en' ? 'Report Requirements' : 'Requisitos del Informe',
    },
    { 
      id: 'enhance', 
      icon: Sparkles, 
      title: language === 'en' ? 'AI Enhancement' : 'Mejora con IA',
    },
    { 
      id: 'analyze', 
      icon: Brain, 
      title: language === 'en' ? 'Grant Analysis' : 'Análisis de Subvención',
    },
    { 
      id: 'configure', 
      icon: Settings, 
      title: language === 'en' ? 'Configuration' : 'Configuración',
    },
    { 
      id: 'generate', 
      icon: Send, 
      title: language === 'en' ? 'Generate Report' : 'Generar Informe',
    },
  ];

  const handleEnhanceWithAI = async () => {
    setIsEnhancing(true);
    
    // Simulate AI enhancement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enhanced = `${requirements.customRequirements}

AI-Enhanced Requirements:
• Include trend analysis comparing current period to previous periods
• Add visual charts for key metrics (attendance trends, proficiency distribution)
• Include executive summary with key findings and recommendations
• Add demographic breakdown by county and class
• Include instructor feedback summary
• Add compliance checklist for grant requirements
• Generate bilingual content (English/Spanish)
• Include data quality notes and any anomalies detected`;

    setRequirements(prev => ({
      ...prev,
      enhancedRequirements: enhanced,
    }));
    
    setIsEnhancing(false);
  };

  const handleAnalyzeGrant = async () => {
    setIsAnalyzing(true);
    
    // Simulate grant analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setGrantAnalysis({
      reportingFrequency: 'Monthly',
      reportingDeadlines: ['15th of each month', 'Quarterly summary by 5th'],
      recipientEmails: ['grants@foundation.org', 'program.officer@funder.org'],
      requiredFormats: ['PDF', 'Excel spreadsheet'],
      keyMetrics: [
        'Number of participants enrolled',
        'Attendance rate (minimum 80%)',
        'Completion rate',
        'Tablets distributed',
        'Proficiency improvement scores',
      ],
      complianceRequirements: [
        'Participant demographics must be reported',
        'Instructor certifications must be current',
        'Budget expenditure breakdown required',
        'Success stories (2-3 per quarter)',
      ],
    });
    
    // Auto-populate config based on analysis
    setReportConfig(prev => ({
      ...prev,
      recipients: ['grants@foundation.org', 'program.officer@funder.org'],
      scheduleFrequency: 'monthly',
    }));
    
    setIsAnalyzing(false);
  };

  const handleAddRecipient = () => {
    if (newRecipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)) {
      setReportConfig(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }));
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setReportConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }));
  };

  const handleMetricToggle = (metricId: string) => {
    setRequirements(prev => {
      if (prev.includeMetrics.includes(metricId)) {
        return { ...prev, includeMetrics: prev.includeMetrics.filter(m => m !== metricId) };
      } else {
        return { ...prev, includeMetrics: [...prev.includeMetrics, metricId] };
      }
    });
  };

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSuccess(true);
    onComplete?.({ requirements, grantAnalysis, reportConfig });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (isSuccess) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            {language === 'en' ? 'REPORT GENERATED SUCCESSFULLY' : 'INFORME GENERADO EXITOSAMENTE'}
          </h2>
          <p className="text-slate-600 mb-6">
            {language === 'en' 
              ? 'Your report has been generated and will be sent to the configured recipients.'
              : 'Su informe ha sido generado y será enviado a los destinatarios configurados.'}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              {getText('actions.close')}
            </Button>
            <Button>
              <FileBarChart className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Download Report' : 'Descargar Informe'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8" />
            <div>
              <CardTitle className="text-xl">
                {language === 'en' ? 'AI Report Generator' : 'Generador de Informes con IA'}
              </CardTitle>
              <p className="text-purple-100 text-sm">
                {language === 'en' 
                  ? 'Generate comprehensive reports with AI assistance'
                  : 'Genere informes completos con asistencia de IA'}
              </p>
            </div>
          </div>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>
        
        {/* Progress */}
        <div className="mt-4">
          <Progress value={progress} className="h-2 bg-purple-400" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-white' : 'text-purple-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-green-500' :
                    index === currentStep ? 'bg-white text-purple-600' : 'bg-purple-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Step 0: Report Requirements */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {language === 'en' ? 'Define Report Requirements' : 'Definir Requisitos del Informe'}
            </h3>
            
            <div>
              <Label>{language === 'en' ? 'Report Type' : 'Tipo de Informe'} *</Label>
              <select
                value={requirements.reportType}
                onChange={(e) => setRequirements(prev => ({ ...prev, reportType: e.target.value }))}
                className="w-full mt-1 p-2 border rounded-md border-slate-300"
              >
                <option value="">-- {language === 'en' ? 'Select Report Type' : 'Seleccionar Tipo'} --</option>
                {REPORT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type[language]}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>{language === 'en' ? 'Report Title' : 'Título del Informe'}</Label>
              <Input
                value={requirements.reportTitle}
                onChange={(e) => setRequirements(prev => ({ ...prev, reportTitle: e.target.value }))}
                placeholder={language === 'en' ? 'e.g., Q1 2025 Program Report' : 'ej., Informe del Programa Q1 2025'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Start Date' : 'Fecha de Inicio'}</Label>
                <Input
                  type="date"
                  value={requirements.dateRange.start}
                  onChange={(e) => setRequirements(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value } 
                  }))}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'End Date' : 'Fecha de Fin'}</Label>
                <Input
                  type="date"
                  value={requirements.dateRange.end}
                  onChange={(e) => setRequirements(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value } 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">
                {language === 'en' ? 'Include Metrics' : 'Incluir Métricas'}
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {METRICS_OPTIONS.map(metric => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={requirements.includeMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                    <Label htmlFor={metric.id} className="font-normal cursor-pointer">
                      {metric[language]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{language === 'en' ? 'Additional Requirements' : 'Requisitos Adicionales'}</Label>
              <Textarea
                value={requirements.customRequirements}
                onChange={(e) => setRequirements(prev => ({ ...prev, customRequirements: e.target.value }))}
                placeholder={language === 'en' 
                  ? 'Describe any specific requirements for this report...'
                  : 'Describa cualquier requisito específico para este informe...'}
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step 1: AI Enhancement */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {language === 'en' ? 'Enhance with AI' : 'Mejorar con IA'}
            </h3>
            
            <Alert className="bg-purple-50 border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                {language === 'en'
                  ? 'Use AI to enhance your report requirements with best practices and comprehensive metrics.'
                  : 'Use IA para mejorar los requisitos de su informe con mejores prácticas y métricas completas.'}
              </AlertDescription>
            </Alert>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                {language === 'en' ? 'Your Requirements:' : 'Sus Requisitos:'}
              </h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {requirements.customRequirements || (language === 'en' ? 'No custom requirements specified.' : 'No se especificaron requisitos personalizados.')}
              </p>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {language === 'en' ? 'Enhancing...' : 'Mejorando...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    {language === 'en' ? 'Enhance with AI' : 'Mejorar con IA'}
                  </>
                )}
              </Button>
            </div>

            {requirements.enhancedRequirements && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {language === 'en' ? 'AI-Enhanced Requirements:' : 'Requisitos Mejorados por IA:'}
                </h4>
                <p className="text-sm text-green-700 whitespace-pre-wrap">
                  {requirements.enhancedRequirements}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Grant Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {language === 'en' ? 'Analyze Grant Requirements' : 'Analizar Requisitos de Subvención'}
            </h3>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Brain className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {language === 'en'
                  ? 'AI will analyze your grant documents to extract reporting requirements, deadlines, and compliance needs.'
                  : 'La IA analizará sus documentos de subvención para extraer requisitos de informes, plazos y necesidades de cumplimiento.'}
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button 
                onClick={handleAnalyzeGrant}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {language === 'en' ? 'Analyzing Grant...' : 'Analizando Subvención...'}
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    {language === 'en' ? 'Analyze Grant Content' : 'Analizar Contenido de Subvención'}
                  </>
                )}
              </Button>
            </div>

            {grantAnalysis.reportingFrequency && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {language === 'en' ? 'Reporting Frequency' : 'Frecuencia de Informes'}
                    </h4>
                    <Badge>{grantAnalysis.reportingFrequency}</Badge>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'en' ? 'Report Recipients' : 'Destinatarios del Informe'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {grantAnalysis.recipientEmails.map(email => (
                        <Badge key={email} variant="outline">{email}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-2">
                    {language === 'en' ? 'Required Metrics' : 'Métricas Requeridas'}
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {grantAnalysis.keyMetrics.map((metric, i) => (
                      <li key={i}>{metric}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-2">
                    {language === 'en' ? 'Compliance Requirements' : 'Requisitos de Cumplimiento'}
                  </h4>
                  <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                    {grantAnalysis.complianceRequirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {language === 'en' ? 'Report Configuration' : 'Configuración del Informe'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Report Format' : 'Formato del Informe'}</Label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full mt-1 p-2 border rounded-md border-slate-300"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word Document</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div>
                <Label>{language === 'en' ? 'Schedule Frequency' : 'Frecuencia de Programación'}</Label>
                <select
                  value={reportConfig.scheduleFrequency}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, scheduleFrequency: e.target.value }))}
                  className="w-full mt-1 p-2 border rounded-md border-slate-300"
                >
                  <option value="once">{language === 'en' ? 'One-time' : 'Una vez'}</option>
                  <option value="weekly">{language === 'en' ? 'Weekly' : 'Semanal'}</option>
                  <option value="monthly">{language === 'en' ? 'Monthly' : 'Mensual'}</option>
                  <option value="quarterly">{language === 'en' ? 'Quarterly' : 'Trimestral'}</option>
                </select>
              </div>
            </div>

            <div>
              <Label>{language === 'en' ? 'Report Language' : 'Idioma del Informe'}</Label>
              <select
                value={reportConfig.language}
                onChange={(e) => setReportConfig(prev => ({ ...prev, language: e.target.value as any }))}
                className="w-full mt-1 p-2 border rounded-md border-slate-300"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="both">{language === 'en' ? 'Bilingual (Both)' : 'Bilingüe (Ambos)'}</option>
              </select>
            </div>

            <div>
              <Label>{language === 'en' ? 'Email Recipients' : 'Destinatarios de Correo'}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="email@example.com"
                />
                <Button onClick={handleAddRecipient} variant="outline">
                  {language === 'en' ? 'Add' : 'Agregar'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {reportConfig.recipients.map(email => (
                  <Badge 
                    key={email} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveRecipient(email)}
                  >
                    {email} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={reportConfig.includeCharts}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeCharts: checked as boolean }))}
                />
                <Label htmlFor="includeCharts" className="font-normal cursor-pointer">
                  {language === 'en' ? 'Include visual charts and graphs' : 'Incluir gráficos y tablas visuales'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSummary"
                  checked={reportConfig.includeSummary}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeSummary: checked as boolean }))}
                />
                <Label htmlFor="includeSummary" className="font-normal cursor-pointer">
                  {language === 'en' ? 'Include executive summary' : 'Incluir resumen ejecutivo'}
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generate */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {language === 'en' ? 'Review & Generate Report' : 'Revisar y Generar Informe'}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  {language === 'en' ? 'Report Summary' : 'Resumen del Informe'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">{language === 'en' ? 'Type:' : 'Tipo:'}</span> {REPORT_TYPES.find(t => t.id === requirements.reportType)?.[language] || '-'}</div>
                  <div><span className="text-slate-500">{language === 'en' ? 'Format:' : 'Formato:'}</span> {reportConfig.format.toUpperCase()}</div>
                  <div><span className="text-slate-500">{language === 'en' ? 'Frequency:' : 'Frecuencia:'}</span> {reportConfig.scheduleFrequency}</div>
                  <div><span className="text-slate-500">{language === 'en' ? 'Language:' : 'Idioma:'}</span> {reportConfig.language}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  {language === 'en' ? 'Metrics Included' : 'Métricas Incluidas'}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {requirements.includeMetrics.map(metricId => {
                    const metric = METRICS_OPTIONS.find(m => m.id === metricId);
                    return <Badge key={metricId} variant="secondary">{metric?.[language] || metricId}</Badge>;
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  {language === 'en' ? 'Recipients' : 'Destinatarios'}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {reportConfig.recipients.map(email => (
                    <Badge key={email} variant="outline">{email}</Badge>
                  ))}
                  {reportConfig.recipients.length === 0 && (
                    <span className="text-sm text-slate-500">
                      {language === 'en' ? 'No recipients configured' : 'Sin destinatarios configurados'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button 
                onClick={handleGenerateReport}
                disabled={isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {language === 'en' ? 'Generating Report...' : 'Generando Informe...'}
                  </>
                ) : (
                  <>
                    <FileBarChart className="h-5 w-5 mr-2" />
                    {language === 'en' ? 'Generate Report' : 'Generar Informe'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : () => setCurrentStep(prev => prev - 1)}
            disabled={isSubmitting || isEnhancing || isAnalyzing}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 0 ? getText('actions.cancel') : getText('actions.back')}
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={isEnhancing || isAnalyzing}
            >
              {getText('actions.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
