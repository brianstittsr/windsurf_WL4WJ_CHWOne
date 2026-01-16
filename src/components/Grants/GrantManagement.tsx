'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GrantWizard } from '@/components/Grants/wizard/GrantWizard';
import { GrantWizardProvider } from '@/contexts/GrantWizardContext';
import { GrantGeneratorWizard } from '@/components/Grants/generator/GrantGeneratorWizard';
import { GrantGeneratorProvider } from '@/contexts/GrantGeneratorContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  FileText, 
  LayoutDashboard, 
  ClipboardList,
  Eye,
  DollarSign,
  Building2,
  Calendar,
  Download,
  Trash2,
  X,
  Loader2,
  Users,
  BarChart3,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createGrant, getActiveGrantsCount } from '@/lib/schema/data-access';
import { Grant } from '@/lib/schema/unified-schema';
import { Grant as WizardGrant } from '@/types/grant.types';
import { Timestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

export default function GrantManagement() {
  const router = useRouter();
  
  type ExtendedGrant = Grant & Partial<WizardGrant>;
  const [grants, setGrants] = useState<ExtendedGrant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<ExtendedGrant | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWizardDialog, setShowWizardDialog] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showFormGeneratorDialog, setShowFormGeneratorDialog] = useState(false);
  const [showDashboardGeneratorDialog, setShowDashboardGeneratorDialog] = useState(false);
  const [formGeneratorGrant, setFormGeneratorGrant] = useState<ExtendedGrant | null>(null);
  const [dashboardGeneratorGrant, setDashboardGeneratorGrant] = useState<ExtendedGrant | null>(null);
  const [generatingForms, setGeneratingForms] = useState(false);
  const [generatingDashboard, setGeneratingDashboard] = useState(false);
  const [generatedForms, setGeneratedForms] = useState<any[]>([]);
  const [generatedDashboard, setGeneratedDashboard] = useState<any>(null);

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      const { getGrants } = await import('@/lib/schema/data-access');
      const result = await getGrants();
      
      if (result.success && result.grants) {
        const normalizedGrants = result.grants.map((g: any) => ({
          ...g,
          title: g.title || g.name || 'Untitled Grant',
          amount: g.amount || g.totalBudget || 0,
          fundingSource: g.fundingSource || 'Not specified',
          projectIds: g.projectIds || [],
          requirements: g.requirements || [],
          reportingSchedule: g.reportingSchedule || [],
          contactPerson: g.contactPerson || 'Not specified'
        }));
        setGrants(normalizedGrants);
      } else {
        setGrants([]);
      }
    } catch (error) {
      console.error('Error fetching grants:', error);
      setGrants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#34C759]/10 text-[#34C759]';
      case 'pending': return 'bg-[#FF9500]/10 text-[#FF9500]';
      case 'completed': return 'bg-[#0071E3]/10 text-[#0071E3]';
      case 'cancelled': return 'bg-[#FF3B30]/10 text-[#FF3B30]';
      default: return 'bg-[#86868B]/10 text-[#86868B]';
    }
  };

  const calculateUtilization = (grant: Grant) => {
    const totalProjects = grant.projectIds.length;
    return totalProjects > 0 ? 100 : 0;
  };

  const getUpcomingReporting = (grant: ExtendedGrant) => {
    if (grant.reportingSchedule && grant.reportingSchedule.length > 0) {
      const upcoming = grant.reportingSchedule.filter(r => !r.completed);
      if (upcoming.length > 0) {
        return { ...upcoming[0], source: 'schedule' };
      }
    }
    
    const milestones = (grant as any).projectMilestones || [];
    if (milestones.length > 0) {
      const upcomingMilestones = milestones
        .filter((m: any) => m.status !== 'completed' && m.dueDate)
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      if (upcomingMilestones.length > 0) {
        return {
          dueDate: upcomingMilestones[0].dueDate,
          type: upcomingMilestones[0].name || upcomingMilestones[0].title || 'Milestone',
          source: 'milestone'
        };
      }
    }
    
    return null;
  };

  const formatDate = (date: any): string => {
    if (!date) return 'Not specified';
    try {
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
      }
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      return 'Not specified';
    } catch (e) {
      return 'Not specified';
    }
  };

  const handleDownloadAnalysisPDF = (grant: ExtendedGrant) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number): number => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Grant Analysis Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(16);
    doc.text(grant.title || 'Untitled Grant', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grant Overview', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (grant.description) {
      yPos = addWrappedText(`Description: ${grant.description}`, margin, yPos, contentWidth);
      yPos += 3;
    }

    doc.text(`Funding Source: ${grant.fundingSource || 'Not specified'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Amount: $${(grant.amount || 0).toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Grant Number: ${grant.grantNumber || 'N/A'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Start Date: ${formatDate(grant.startDate)}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`End Date: ${formatDate(grant.endDate)}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Contact: ${grant.contactPerson || 'Not specified'}`, margin, yPos);
    yPos += 12;

    const fileName = `grant-analysis-${(grant.title || 'untitled').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleOpenFormGenerator = (grant: ExtendedGrant) => {
    setFormGeneratorGrant(grant);
    setGeneratedForms([]);
    setShowFormGeneratorDialog(true);
  };

  const handleGenerateForms = async () => {
    if (!formGeneratorGrant) return;
    
    setGeneratingForms(true);
    try {
      const grantContext = {
        title: formGeneratorGrant.title || formGeneratorGrant.name,
        description: formGeneratorGrant.description,
        dataCollectionMethods: formGeneratorGrant.dataCollectionMethods || [],
        projectMilestones: formGeneratorGrant.projectMilestones || [],
        collaboratingEntities: formGeneratorGrant.collaboratingEntities || [],
        requirements: formGeneratorGrant.requirements || []
      };

      const response = await fetch('/api/ai/generate-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantContext })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedForms(result.forms || []);
      } else {
        const sampleForms = generateSampleForms(formGeneratorGrant);
        setGeneratedForms(sampleForms);
      }
    } catch (error) {
      console.error('Error generating forms:', error);
      const sampleForms = generateSampleForms(formGeneratorGrant);
      setGeneratedForms(sampleForms);
    } finally {
      setGeneratingForms(false);
    }
  };

  const generateSampleForms = (grant: ExtendedGrant) => {
    const forms: any[] = [];
    
    forms.push({
      id: `form-intake-${Date.now()}`,
      name: 'Participant Intake Form',
      description: `Intake form for ${grant.title || 'grant'} participants`,
      purpose: 'intake',
      fields: [
        { id: 'f1', name: 'participant_name', label: 'Participant Name', type: 'text', required: true },
        { id: 'f2', name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
        { id: 'f3', name: 'contact_email', label: 'Email Address', type: 'email', required: true },
        { id: 'f4', name: 'contact_phone', label: 'Phone Number', type: 'phone', required: false },
        { id: 'f5', name: 'address', label: 'Address', type: 'textarea', required: false },
        { id: 'f6', name: 'consent', label: 'I consent to participate in this program', type: 'checkbox', required: true }
      ]
    });

    (grant.dataCollectionMethods || []).forEach((method, index) => {
      forms.push({
        id: `form-method-${Date.now()}-${index}`,
        name: `${method.name} Tracking Form`,
        description: method.description || `Form for tracking ${method.name}`,
        purpose: 'tracking',
        frequency: method.frequency,
        fields: [
          { id: 'f1', name: 'date', label: 'Date', type: 'date', required: true },
          { id: 'f2', name: 'participant_id', label: 'Participant ID', type: 'text', required: true },
          ...(method.dataPoints || []).map((dp, i) => ({
            id: `f${i + 3}`,
            name: dp.toLowerCase().replace(/\s+/g, '_'),
            label: dp,
            type: 'text',
            required: true
          })),
          { id: 'fn', name: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
        ]
      });
    });

    forms.push({
      id: `form-progress-${Date.now()}`,
      name: 'Progress Report Form',
      description: 'Monthly/Quarterly progress report for grant reporting',
      purpose: 'reporting',
      fields: [
        { id: 'f1', name: 'reporting_period', label: 'Reporting Period', type: 'select', required: true, options: ['Monthly', 'Quarterly', 'Annual'] },
        { id: 'f2', name: 'start_date', label: 'Period Start Date', type: 'date', required: true },
        { id: 'f3', name: 'end_date', label: 'Period End Date', type: 'date', required: true },
        { id: 'f4', name: 'participants_served', label: 'Number of Participants Served', type: 'number', required: true },
        { id: 'f5', name: 'activities_completed', label: 'Activities Completed', type: 'textarea', required: true },
        { id: 'f6', name: 'challenges', label: 'Challenges Encountered', type: 'textarea', required: false },
        { id: 'f7', name: 'next_steps', label: 'Next Steps', type: 'textarea', required: true }
      ]
    });

    return forms;
  };

  const handleSaveGeneratedForms = async () => {
    if (!formGeneratorGrant || generatedForms.length === 0) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      await updateGrant(formGeneratorGrant.id, {
        formTemplates: [...(formGeneratorGrant.formTemplates || []), ...generatedForms]
      } as any);
      
      setGrants(prev => prev.map(g => 
        g.id === formGeneratorGrant.id 
          ? { ...g, formTemplates: [...(g.formTemplates || []), ...generatedForms] }
          : g
      ));
      
      setShowFormGeneratorDialog(false);
      alert('Forms saved successfully!');
    } catch (error) {
      console.error('Error saving forms:', error);
      alert('Failed to save forms. Please try again.');
    }
  };

  const handleOpenDashboardGenerator = (grant: ExtendedGrant) => {
    setDashboardGeneratorGrant(grant);
    setGeneratedDashboard(null);
    setShowDashboardGeneratorDialog(true);
  };

  const handleGenerateDashboard = async () => {
    if (!dashboardGeneratorGrant) return;
    
    setGeneratingDashboard(true);
    try {
      const grantContext = {
        title: dashboardGeneratorGrant.title || dashboardGeneratorGrant.name,
        description: dashboardGeneratorGrant.description,
        dataCollectionMethods: dashboardGeneratorGrant.dataCollectionMethods || [],
        projectMilestones: dashboardGeneratorGrant.projectMilestones || [],
        reportingSchedule: dashboardGeneratorGrant.reportingSchedule || [],
        formTemplates: dashboardGeneratorGrant.formTemplates || [],
        amount: dashboardGeneratorGrant.amount || dashboardGeneratorGrant.totalBudget || 0
      };

      const response = await fetch('/api/ai/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantContext })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedDashboard(result.dashboard);
      } else {
        const sampleDashboard = generateSampleDashboard(dashboardGeneratorGrant);
        setGeneratedDashboard(sampleDashboard);
      }
    } catch (error) {
      console.error('Error generating dashboard:', error);
      const sampleDashboard = generateSampleDashboard(dashboardGeneratorGrant);
      setGeneratedDashboard(sampleDashboard);
    } finally {
      setGeneratingDashboard(false);
    }
  };

  const generateSampleDashboard = (grant: ExtendedGrant) => {
    const milestones = grant.projectMilestones || [];
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    
    return {
      id: `dashboard-${Date.now()}`,
      name: `${grant.title || 'Grant'} Dashboard`,
      description: 'Real-time tracking dashboard for grant performance',
      metrics: [
        {
          id: 'kpi-1',
          name: 'Total Participants',
          value: 0,
          target: 100,
          unit: 'participants',
          status: 'info'
        },
        {
          id: 'kpi-2',
          name: 'Budget Utilization',
          value: 0,
          target: grant.amount || grant.totalBudget || 0,
          unit: 'USD',
          status: 'success'
        },
        {
          id: 'kpi-3',
          name: 'Milestone Progress',
          value: completedMilestones,
          target: milestones.length || 5,
          unit: 'milestones',
          status: completedMilestones > 0 ? 'success' : 'warning'
        },
        {
          id: 'kpi-4',
          name: 'Reports Submitted',
          value: (grant.reportingSchedule || []).filter(r => r.completed).length,
          target: (grant.reportingSchedule || []).length || 4,
          unit: 'reports',
          status: 'info'
        }
      ],
      charts: [
        { id: 'chart-1', name: 'Participant Enrollment Over Time', type: 'line' },
        { id: 'chart-2', name: 'Services by Type', type: 'pie' },
        { id: 'chart-3', name: 'Monthly Activity Summary', type: 'bar' }
      ],
      tables: [
        { id: 'table-1', name: 'Recent Activities', columns: ['Date', 'Activity', 'Participants', 'Status'] }
      ]
    };
  };

  const handleSaveGeneratedDashboard = async () => {
    if (!dashboardGeneratorGrant || !generatedDashboard) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      await updateGrant(dashboardGeneratorGrant.id, {
        dashboardMetrics: generatedDashboard.metrics,
        dashboardConfig: generatedDashboard
      } as any);
      
      setGrants(prev => prev.map(g => 
        g.id === dashboardGeneratorGrant.id 
          ? { ...g, dashboardMetrics: generatedDashboard.metrics, dashboardConfig: generatedDashboard }
          : g
      ));
      
      setShowDashboardGeneratorDialog(false);
      alert('Dashboard saved successfully!');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert('Failed to save dashboard. Please try again.');
    }
  };

  const handleDeleteGrant = async (grant: ExtendedGrant) => {
    if (!confirm(`Are you sure you want to delete "${grant.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { deleteGrant } = await import('@/lib/schema/data-access');
      const result = await deleteGrant(grant.id);
      
      if (result.success) {
        setGrants(prev => prev.filter(g => g.id !== grant.id));
      } else {
        alert('Failed to delete grant. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting grant:', error);
      alert('Failed to delete grant. Please try again.');
    }
  };

  const handleExportGrant = (grant: ExtendedGrant) => {
    const exportData = {
      ...grant,
      exportedAt: new Date().toISOString(),
      exportFormat: 'CHWOne Grant Export v1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grant-${grant.title?.replace(/\s+/g, '-').toLowerCase() || grant.id}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#FF9500] animate-spin mx-auto mb-3" />
          <p className="text-[#6E6E73] text-sm">Loading grants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Grant Management</h2>
          <p className="text-[#6E6E73] mt-1">Manage funding sources and track grant utilization</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowWizardDialog(true)}
            className="rounded-xl bg-[#5856D6] hover:bg-[#4B49B8] text-white px-5"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Grant Analyzer
          </Button>
          <Button
            onClick={() => setShowGeneratorDialog(true)}
            className="rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white px-5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Grant Creator
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5 text-center hover:shadow-lg transition-shadow">
          <p className="text-4xl font-semibold text-[#34C759] mb-1">{grants.length}</p>
          <p className="text-sm text-[#48484A]">Active Grants/MOUs</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5 text-center hover:shadow-lg transition-shadow">
          <p className="text-4xl font-semibold text-[#FF9500] mb-1">
            ${grants.reduce((sum, g) => sum + g.amount, 0).toLocaleString()}
          </p>
          <p className="text-sm text-[#48484A]">Total Funding</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5 text-center hover:shadow-lg transition-shadow">
          <p className="text-4xl font-semibold text-[#5856D6] mb-1">
            {grants.reduce((sum, g) => sum + g.projectIds.length, 0)}
          </p>
          <p className="text-sm text-[#48484A]">Projects Funded</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5 text-center hover:shadow-lg transition-shadow">
          <p className="text-4xl font-semibold text-[#0071E3] mb-1">
            {grants.filter(g => getUpcomingReporting(g)).length}
          </p>
          <p className="text-sm text-[#48484A]">Pending Reports</p>
        </div>
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {grants.map((grant) => {
          const utilization = calculateUtilization(grant);
          const upcomingReport = getUpcomingReporting(grant);

          return (
            <div key={grant.id} className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#1D1D1F]">{grant.title}</h3>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusStyle(grant.status))}>
                        {grant.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-[#6E6E73] line-clamp-2">{grant.description}</p>
                  </div>
                </div>

                {/* Grant Info Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#86868B]" />
                    <div>
                      <p className="text-sm font-semibold text-[#1D1D1F]">${grant.amount.toLocaleString()}</p>
                      <p className="text-xs text-[#86868B]">Funding Amount</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#86868B]" />
                    <div>
                      <p className="text-sm font-semibold text-[#1D1D1F]">{grant.fundingSource}</p>
                      <p className="text-xs text-[#86868B]">Funding Source</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#86868B]" />
                    <div>
                      <p className="text-sm font-semibold text-[#1D1D1F]">{formatDate(grant.endDate)}</p>
                      <p className="text-xs text-[#86868B]">End Date</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1D1D1F] mb-1">
                      {(grant as any).projectMilestones?.length || grant.projectIds?.length || 0} {(grant as any).projectMilestones?.length ? 'Milestones' : 'Projects'}
                    </p>
                    <div className="w-full bg-[#E5E5EA] rounded-full h-1">
                      <div 
                        className="bg-[#0071E3] h-1 rounded-full transition-all" 
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push(`/collaborations/${grant.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0071E3] bg-[#0071E3]/10 rounded-lg hover:bg-[#0071E3]/20 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenFormGenerator(grant)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#5856D6] bg-[#5856D6]/10 rounded-lg hover:bg-[#5856D6]/20 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Generate Forms
                  </button>
                  <button
                    onClick={() => handleOpenDashboardGenerator(grant)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#32ADE6] bg-[#32ADE6]/10 rounded-lg hover:bg-[#32ADE6]/20 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleExportGrant(grant)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#6E6E73] bg-[#F5F5F7] rounded-lg hover:bg-[#E5E5EA] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteGrant(grant)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#FF3B30] bg-[#FF3B30]/10 rounded-lg hover:bg-[#FF3B30]/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                {/* Requirements Section */}
                {(grant.requirements?.length > 0 || upcomingReport) && (
                  <div className="mt-4 pt-4 border-t border-[#D2D2D7]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grant.requirements && grant.requirements.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-[#1D1D1F] mb-2">Requirements</p>
                          <div className="flex flex-wrap gap-1">
                            {grant.requirements.map((req, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-[#F5F5F7] text-[#6E6E73] rounded-md">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {upcomingReport && (
                        <div className="bg-[#0071E3]/5 rounded-xl p-3">
                          <p className="text-sm font-semibold text-[#0071E3]">
                            Next {upcomingReport.source === 'milestone' ? 'Milestone' : 'Report'} Due
                          </p>
                          <p className="text-sm text-[#1D1D1F]">
                            {formatDate(upcomingReport.dueDate)} - {upcomingReport.type}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {grants.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#D2D2D7] p-12 text-center">
            <div className="w-16 h-16 bg-[#FF9500]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#FF9500]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">No grants yet</h3>
            <p className="text-[#6E6E73] mb-6">Get started by analyzing an existing grant or creating a new one.</p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setShowWizardDialog(true)}
                className="rounded-xl bg-[#5856D6] hover:bg-[#4B49B8] text-white px-5"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Grant Analyzer
              </Button>
              <Button
                onClick={() => setShowGeneratorDialog(true)}
                className="rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white px-5"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Grant Creator
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grant Analyzer Wizard Dialog */}
      <Dialog open={showWizardDialog} onOpenChange={setShowWizardDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto p-0 bg-[#F5F5F7] rounded-2xl">
          <button
            onClick={() => setShowWizardDialog(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-4">
            <GrantWizardProvider>
              <GrantWizard 
                organizationId="general"
                onComplete={(grantId) => {
                  setShowWizardDialog(false);
                  fetchGrants();
                }}
              />
            </GrantWizardProvider>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Generator Wizard Dialog */}
      <Dialog open={showGeneratorDialog} onOpenChange={setShowGeneratorDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto p-0 bg-[#F5F5F7] rounded-2xl">
          <button
            onClick={() => setShowGeneratorDialog(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-4">
            <GrantGeneratorProvider organizationId="general">
              <GrantGeneratorWizard 
                organizationId="general"
                onComplete={(proposalId) => {
                  setShowGeneratorDialog(false);
                }}
              />
            </GrantGeneratorProvider>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Generator Dialog */}
      <Dialog open={showFormGeneratorDialog} onOpenChange={setShowFormGeneratorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-[#F5F5F7] rounded-2xl">
          <button
            onClick={() => setShowFormGeneratorDialog(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-6 h-6 text-[#5856D6]" />
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Form Generator</h2>
            </div>
            <p className="text-[#6E6E73]">Generate data collection forms based on grant requirements</p>
          </div>

          {formGeneratorGrant && (
            <>
              <div className="bg-[#0071E3]/5 border border-[#0071E3]/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#0071E3] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1D1D1F]">Grant: {formGeneratorGrant.title}</p>
                    <p className="text-sm text-[#6E6E73]">
                      {formGeneratorGrant.dataCollectionMethods?.length || 0} data collection methods • 
                      {formGeneratorGrant.projectMilestones?.length || 0} milestones
                    </p>
                  </div>
                </div>
              </div>

              {generatedForms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#6E6E73] mb-6">
                    Click the button below to analyze the grant and generate appropriate data collection forms.
                  </p>
                  <Button
                    onClick={handleGenerateForms}
                    disabled={generatingForms}
                    className="rounded-xl bg-[#5856D6] hover:bg-[#4B49B8] text-white px-6 py-3"
                  >
                    {generatingForms ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Forms...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Forms with AI
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">
                    Generated Forms ({generatedForms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {generatedForms.map((form, index) => (
                      <div key={form.id || index} className="bg-white rounded-xl border border-[#D2D2D7] p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-[#1D1D1F]">{form.name}</h4>
                          <span className="px-2 py-1 text-xs bg-[#5856D6]/10 text-[#5856D6] rounded-full">
                            {form.purpose}
                          </span>
                        </div>
                        <p className="text-sm text-[#6E6E73] mb-3">{form.description}</p>
                        <p className="text-xs text-[#86868B]">{form.fields?.length || 0} fields</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {form.fields?.slice(0, 4).map((field: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-[#F5F5F7] text-[#6E6E73] rounded">
                              {field.label}
                            </span>
                          ))}
                          {form.fields?.length > 4 && (
                            <span className="px-2 py-0.5 text-xs bg-[#F5F5F7] text-[#6E6E73] rounded">
                              +{form.fields.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedForms([])}
                      className="rounded-xl"
                    >
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleSaveGeneratedForms}
                      className="rounded-xl bg-[#34C759] hover:bg-[#2DB84D] text-white"
                    >
                      Save Forms to Grant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dashboard Generator Dialog */}
      <Dialog open={showDashboardGeneratorDialog} onOpenChange={setShowDashboardGeneratorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-[#F5F5F7] rounded-2xl">
          <button
            onClick={() => setShowDashboardGeneratorDialog(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-6 h-6 text-[#32ADE6]" />
              <h2 className="text-xl font-semibold text-[#1D1D1F]">AI Dashboard Generator</h2>
            </div>
            <p className="text-[#6E6E73]">Generate a real-time tracking dashboard based on grant reporting requirements</p>
          </div>

          {dashboardGeneratorGrant && (
            <>
              <div className="bg-[#0071E3]/5 border border-[#0071E3]/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#0071E3] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1D1D1F]">Grant: {dashboardGeneratorGrant.title}</p>
                    <p className="text-sm text-[#6E6E73]">
                      Budget: ${(dashboardGeneratorGrant.amount || dashboardGeneratorGrant.totalBudget || 0).toLocaleString()} • 
                      {dashboardGeneratorGrant.reportingSchedule?.length || 0} reporting items • 
                      {dashboardGeneratorGrant.formTemplates?.length || 0} forms
                    </p>
                  </div>
                </div>
              </div>

              {!generatedDashboard ? (
                <div className="text-center py-8">
                  <p className="text-[#6E6E73] mb-6">
                    Click the button below to analyze the grant and generate a customized dashboard with KPIs, charts, and tables.
                  </p>
                  <Button
                    onClick={handleGenerateDashboard}
                    disabled={generatingDashboard}
                    className="rounded-xl bg-[#32ADE6] hover:bg-[#2A9BD4] text-white px-6 py-3"
                  >
                    {generatingDashboard ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Dashboard...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Dashboard with AI
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{generatedDashboard.name}</h3>
                  <p className="text-sm text-[#6E6E73] mb-6">{generatedDashboard.description}</p>

                  {/* KPI Metrics */}
                  <h4 className="font-semibold text-[#1D1D1F] mb-3">
                    Key Performance Indicators ({generatedDashboard.metrics?.length || 0})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {generatedDashboard.metrics?.map((metric: any, index: number) => (
                      <div key={metric.id || index} className="bg-white rounded-xl border border-[#D2D2D7] p-4 text-center">
                        <p className="text-2xl font-bold text-[#0071E3]">{metric.value}</p>
                        <p className="text-sm font-medium text-[#1D1D1F]">{metric.name}</p>
                        <p className="text-xs text-[#6E6E73]">Target: {metric.target} {metric.unit}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <h4 className="font-semibold text-[#1D1D1F] mb-3">
                    Charts ({generatedDashboard.charts?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {generatedDashboard.charts?.map((chart: any, index: number) => (
                      <div key={chart.id || index} className="bg-white rounded-xl border border-[#D2D2D7] p-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-[#1D1D1F] text-sm">{chart.name}</p>
                          <span className="px-2 py-0.5 text-xs bg-[#F5F5F7] text-[#6E6E73] rounded">
                            {chart.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tables */}
                  <h4 className="font-semibold text-[#1D1D1F] mb-3">
                    Data Tables ({generatedDashboard.tables?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {generatedDashboard.tables?.map((table: any, index: number) => (
                      <div key={table.id || index} className="bg-white rounded-xl border border-[#D2D2D7] p-4">
                        <p className="font-medium text-[#1D1D1F] text-sm mb-2">{table.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {table.columns?.map((col: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-[#F5F5F7] text-[#6E6E73] rounded">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedDashboard(null)}
                      className="rounded-xl"
                    >
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleSaveGeneratedDashboard}
                      className="rounded-xl bg-[#34C759] hover:bg-[#2DB84D] text-white"
                    >
                      Save Dashboard to Grant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
