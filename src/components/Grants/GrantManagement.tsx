'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GrantWizard } from '@/components/Grants/wizard/GrantWizard';
import { GrantWizardProvider } from '@/contexts/GrantWizardContext';
import { GrantGeneratorWizard } from '@/components/Grants/generator/GrantGeneratorWizard';
import { GrantGeneratorProvider } from '@/contexts/GrantGeneratorContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Groups as GroupsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Sparkles, FileText, LayoutDashboard, ClipboardList } from 'lucide-react';
import { createGrant, getActiveGrantsCount } from '@/lib/schema/data-access';
import { Grant } from '@/lib/schema/unified-schema';
import { Grant as WizardGrant } from '@/types/grant.types';
import { Timestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

export default function GrantManagement() {
  const router = useRouter();
  
  // Extended grant type that handles both unified-schema and wizard grant types
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
      // Import getGrants from data-access
      const { getGrants } = await import('@/lib/schema/data-access');
      
      // Fetch grants from Firebase
      const result = await getGrants();
      
      if (result.success && result.grants) {
        console.log('Fetched grants from Firebase:', result.grants.length);
        // Normalize grant data to handle both naming conventions
        const normalizedGrants = result.grants.map((g: any) => ({
          ...g,
          // Ensure title is set (from title or name)
          title: g.title || g.name || 'Untitled Grant',
          // Ensure amount is set (from amount or totalBudget)
          amount: g.amount || g.totalBudget || 0,
          // Ensure fundingSource is set
          fundingSource: g.fundingSource || 'Not specified',
          // Ensure projectIds exists
          projectIds: g.projectIds || [],
          // Ensure requirements exists
          requirements: g.requirements || [],
          // Ensure reportingSchedule exists
          reportingSchedule: g.reportingSchedule || [],
          // Ensure contactPerson is set
          contactPerson: g.contactPerson || 'Not specified'
        }));
        setGrants(normalizedGrants);
      } else {
        console.error('Error fetching grants:', result.error);
        setGrants([]);
      }
    } catch (error) {
      console.error('Error fetching grants:', error);
      setGrants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const calculateUtilization = (grant: Grant) => {
    const totalProjects = grant.projectIds.length;
    const activeProjects = totalProjects; // For now, assume all are active
    return totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0;
  };

  const getUpcomingReporting = (grant: ExtendedGrant) => {
    // First check if there's a defined reporting schedule
    if (grant.reportingSchedule && grant.reportingSchedule.length > 0) {
      const upcoming = grant.reportingSchedule.filter(r => !r.completed);
      if (upcoming.length > 0) {
        return { ...upcoming[0], source: 'schedule' };
      }
    }
    
    // Fall back to milestones if no reporting schedule is defined
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
  
  // Get reporting schedule items (from schedule or milestones)
  const getReportingScheduleItems = (grant: ExtendedGrant) => {
    // If reporting schedule exists, use it
    if (grant.reportingSchedule && grant.reportingSchedule.length > 0) {
      return { items: grant.reportingSchedule, source: 'schedule' };
    }
    
    // Fall back to milestones
    const milestones = (grant as any).projectMilestones || [];
    if (milestones.length > 0) {
      const milestoneReports = milestones
        .filter((m: any) => m.dueDate)
        .map((m: any) => ({
          dueDate: m.dueDate,
          type: m.name || m.title || 'Milestone Report',
          completed: m.status === 'completed',
          description: m.description
        }));
      return { items: milestoneReports, source: 'milestone' };
    }
    
    return { items: [], source: null };
  };

  // Helper function to format dates (handles both Timestamp and string)
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

  // Generate and download PDF analysis report
  const handleDownloadAnalysisPDF = (grant: ExtendedGrant) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number): number => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Grant Analysis Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Grant Title
    doc.setFontSize(16);
    doc.text(grant.title || 'Untitled Grant', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Generated date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Grant Overview Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grant Overview', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Description
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

    // Collaborating Entities Section
    if (grant.collaboratingEntities && grant.collaboratingEntities.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Collaborating Entities', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      grant.collaboratingEntities.forEach((entity, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${entity.name} (${entity.role})`, margin, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        if (entity.description) {
          yPos = addWrappedText(`   ${entity.description}`, margin, yPos, contentWidth - 10);
        }
        if (entity.contactName) {
          doc.text(`   Contact: ${entity.contactName} (${entity.contactEmail || ''})`, margin, yPos);
          yPos += lineHeight;
        }
        yPos += 3;
      });
      yPos += 5;
    }

    // Project Milestones Section
    if (grant.projectMilestones && grant.projectMilestones.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Milestones', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      grant.projectMilestones.forEach((milestone, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${milestone.name}`, margin, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.text(`   Due: ${formatDate(milestone.dueDate)} | Status: ${milestone.status?.replace(/_/g, ' ') || 'not started'}`, margin, yPos);
        yPos += lineHeight;
        if (milestone.description) {
          yPos = addWrappedText(`   ${milestone.description}`, margin, yPos, contentWidth - 10);
        }
        yPos += 3;
      });
      yPos += 5;
    }

    // Data Collection Methods Section
    if (grant.dataCollectionMethods && grant.dataCollectionMethods.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Collection Methods', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      grant.dataCollectionMethods.forEach((method, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${method.name} (${method.frequency})`, margin, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        if (method.description) {
          yPos = addWrappedText(`   ${method.description}`, margin, yPos, contentWidth - 10);
        }
        if (method.tools && method.tools.length > 0) {
          doc.text(`   Tools: ${method.tools.join(', ')}`, margin, yPos);
          yPos += lineHeight;
        }
        yPos += 3;
      });
    }

    // Save the PDF
    const fileName = `grant-analysis-${(grant.title || 'untitled').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Open Form Generator for a grant
  const handleOpenFormGenerator = (grant: ExtendedGrant) => {
    setFormGeneratorGrant(grant);
    setGeneratedForms([]);
    setShowFormGeneratorDialog(true);
  };

  // Generate forms for a grant using AI
  const handleGenerateForms = async () => {
    if (!formGeneratorGrant) return;
    
    setGeneratingForms(true);
    try {
      // Build context from grant data
      const grantContext = {
        title: formGeneratorGrant.title || formGeneratorGrant.name,
        description: formGeneratorGrant.description,
        dataCollectionMethods: formGeneratorGrant.dataCollectionMethods || [],
        projectMilestones: formGeneratorGrant.projectMilestones || [],
        collaboratingEntities: formGeneratorGrant.collaboratingEntities || [],
        requirements: formGeneratorGrant.requirements || []
      };

      // Call OpenAI to generate forms
      const response = await fetch('/api/ai/generate-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantContext })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedForms(result.forms || []);
      } else {
        // Generate sample forms if API fails
        const sampleForms = generateSampleForms(formGeneratorGrant);
        setGeneratedForms(sampleForms);
      }
    } catch (error) {
      console.error('Error generating forms:', error);
      // Generate sample forms as fallback
      const sampleForms = generateSampleForms(formGeneratorGrant);
      setGeneratedForms(sampleForms);
    } finally {
      setGeneratingForms(false);
    }
  };

  // Generate sample forms based on grant data
  const generateSampleForms = (grant: ExtendedGrant) => {
    const forms: any[] = [];
    
    // Create intake form
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

    // Create forms based on data collection methods
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

    // Create progress report form
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

  // Save generated forms to grant
  const handleSaveGeneratedForms = async () => {
    if (!formGeneratorGrant || generatedForms.length === 0) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      await updateGrant(formGeneratorGrant.id, {
        formTemplates: [...(formGeneratorGrant.formTemplates || []), ...generatedForms]
      } as any);
      
      // Update local state
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

  // Open Dashboard Generator for a grant
  const handleOpenDashboardGenerator = (grant: ExtendedGrant) => {
    setDashboardGeneratorGrant(grant);
    setGeneratedDashboard(null);
    setShowDashboardGeneratorDialog(true);
  };

  // Generate dashboard for a grant using AI
  const handleGenerateDashboard = async () => {
    if (!dashboardGeneratorGrant) return;
    
    setGeneratingDashboard(true);
    try {
      // Build context from grant data
      const grantContext = {
        title: dashboardGeneratorGrant.title || dashboardGeneratorGrant.name,
        description: dashboardGeneratorGrant.description,
        dataCollectionMethods: dashboardGeneratorGrant.dataCollectionMethods || [],
        projectMilestones: dashboardGeneratorGrant.projectMilestones || [],
        reportingSchedule: dashboardGeneratorGrant.reportingSchedule || [],
        formTemplates: dashboardGeneratorGrant.formTemplates || [],
        amount: dashboardGeneratorGrant.amount || dashboardGeneratorGrant.totalBudget || 0
      };

      // Call OpenAI to generate dashboard
      const response = await fetch('/api/ai/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantContext })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedDashboard(result.dashboard);
      } else {
        // Generate sample dashboard if API fails
        const sampleDashboard = generateSampleDashboard(dashboardGeneratorGrant);
        setGeneratedDashboard(sampleDashboard);
      }
    } catch (error) {
      console.error('Error generating dashboard:', error);
      // Generate sample dashboard as fallback
      const sampleDashboard = generateSampleDashboard(dashboardGeneratorGrant);
      setGeneratedDashboard(sampleDashboard);
    } finally {
      setGeneratingDashboard(false);
    }
  };

  // Generate sample dashboard based on grant data
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
          status: 'info',
          linkedForm: 'Participant Intake Form'
        },
        {
          id: 'kpi-2',
          name: 'Budget Utilization',
          value: 0,
          target: grant.amount || grant.totalBudget || 0,
          unit: 'USD',
          status: 'success',
          visualization: 'percentage'
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
        {
          id: 'chart-1',
          name: 'Participant Enrollment Over Time',
          type: 'line',
          xAxisField: 'date',
          yAxisField: 'count',
          linkedForm: 'Participant Intake Form'
        },
        {
          id: 'chart-2',
          name: 'Services by Type',
          type: 'pie',
          dataField: 'service_type',
          linkedForm: 'Service Tracking Form'
        },
        {
          id: 'chart-3',
          name: 'Monthly Activity Summary',
          type: 'bar',
          xAxisField: 'month',
          yAxisField: 'activities',
          linkedForm: 'Progress Report Form'
        }
      ],
      tables: [
        {
          id: 'table-1',
          name: 'Recent Activities',
          columns: ['Date', 'Activity', 'Participants', 'Status'],
          linkedForm: 'Progress Report Form'
        }
      ]
    };
  };

  // Save generated dashboard to grant
  const handleSaveGeneratedDashboard = async () => {
    if (!dashboardGeneratorGrant || !generatedDashboard) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      await updateGrant(dashboardGeneratorGrant.id, {
        dashboardMetrics: generatedDashboard.metrics,
        dashboardConfig: generatedDashboard
      } as any);
      
      // Update local state
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

  // Delete a grant
  const handleDeleteGrant = async (grant: ExtendedGrant) => {
    if (!confirm(`Are you sure you want to delete "${grant.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { deleteGrant } = await import('@/lib/schema/data-access');
      const result = await deleteGrant(grant.id);
      
      if (result.success) {
        // Remove from local state
        setGrants(prev => prev.filter(g => g.id !== grant.id));
        console.log('Grant deleted successfully:', grant.id);
      } else {
        console.error('Error deleting grant:', result.error);
        alert('Failed to delete grant. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting grant:', error);
      alert('Failed to delete grant. Please try again.');
    }
  };

  // Export grant data as JSON
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Grant Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage funding sources and track grant utilization
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AssessmentIcon />}
            onClick={() => setShowWizardDialog(true)}
            size="large"
          >
            Launch Grant Analyzer
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Sparkles size={20} />}
            onClick={() => setShowGeneratorDialog(true)}
            size="large"
          >
            Launch Grant Creator
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.filter(g => g.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Grants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${grants.reduce((sum, g) => sum + g.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Funding
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.reduce((sum, g) => sum + g.projectIds.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects Funded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {grants.filter(g => getUpcomingReporting(g)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grants List */}
      {grants.map((grant) => {
        const utilization = calculateUtilization(grant);
        const upcomingReport = getUpcomingReporting(grant);

        return (
          <Card key={grant.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {grant.title}
                    </Typography>
                    <Chip
                      label={grant.status.replace(/_/g, ' ')}
                      color={getStatusColor(grant.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {grant.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${grant.amount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Funding Amount
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {grant.fundingSource}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Funding Source
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDate(grant.endDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            End Date
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {(grant as any).projectMilestones?.length || grant.projectIds?.length || 0} {(grant as any).projectMilestones?.length ? 'Milestones' : 'Projects'}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(utilization, 100)}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      router.push(`/collaborations/${grant.id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<ClipboardList size={16} />}
                    onClick={() => handleOpenFormGenerator(grant)}
                  >
                    Generate Forms
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="info"
                    startIcon={<LayoutDashboard size={16} />}
                    onClick={() => handleOpenDashboardGenerator(grant)}
                  >
                    Generate Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportGrant(grant)}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteGrant(grant)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>

              {/* Requirements and Reporting */}
              <Box sx={{ mt: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Requirements & Reporting Schedule
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Requirements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {grant.requirements && grant.requirements.length > 0 ? (
                            grant.requirements.map((req, index) => (
                              <Chip key={index} label={req} size="small" variant="outlined" />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              No requirements defined
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Contact Person: {grant.contactPerson || 'Not specified'}
                        </Typography>
                        {(() => {
                          const scheduleInfo = getReportingScheduleItems(grant);
                          if (upcomingReport) {
                            return (
                              <Alert severity="info" sx={{ mt: 1 }}>
                                Next {upcomingReport.source === 'milestone' ? 'milestone' : 'report'} due: {formatDate(upcomingReport.dueDate)} ({upcomingReport.type})
                                {upcomingReport.source === 'milestone' && (
                                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                    (Based on milestone schedule)
                                  </Typography>
                                )}
                              </Alert>
                            );
                          } else if (scheduleInfo.items.length > 0) {
                            return (
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {scheduleInfo.items.length} {scheduleInfo.source === 'milestone' ? 'milestone' : 'reporting'} items scheduled
                                </Typography>
                                {scheduleInfo.source === 'milestone' && (
                                  <Chip 
                                    label="Using milestone dates" 
                                    size="small" 
                                    variant="outlined" 
                                    color="info"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            );
                          } else {
                            return (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No reporting schedule or milestones defined
                              </Typography>
                            );
                          }
                        })()}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </CardContent>
          </Card>
        );
      })}


      {/* Grant Analyzer Wizard Dialog */}
      <Dialog 
        open={showWizardDialog} 
        onClose={() => setShowWizardDialog(false)} 
        maxWidth="xl" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': { 
            borderRadius: '12px',
            maxHeight: '90vh', 
            overflow: 'auto',
            backgroundColor: '#f8fafc' // Light background for better contrast with wizard content
          }
        }}
      >
        {/* No DialogTitle for cleaner look - title is inside the wizard */}
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{ 
            position: 'relative',
            pt: 2, 
            px: 2, 
            pb: 2,
          }}>
            {/* Close button in top-right corner */}
            <IconButton 
              onClick={() => setShowWizardDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                bgcolor: 'white',
                boxShadow: 1,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <GrantWizardProvider>
              <GrantWizard 
                organizationId="general"
                onComplete={(grantId) => {
                  console.log('Grant created:', grantId);
                  setShowWizardDialog(false);
                  fetchGrants();
                }}
              />
            </GrantWizardProvider>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Grant Generator Wizard Dialog */}
      <Dialog 
        open={showGeneratorDialog} 
        onClose={() => setShowGeneratorDialog(false)} 
        maxWidth="xl" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': { 
            borderRadius: '12px',
            maxHeight: '90vh', 
            overflow: 'auto',
            backgroundColor: '#f8fafc'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box sx={{ 
            position: 'relative',
            pt: 2, 
            px: 2, 
            pb: 2,
          }}>
            {/* Close button in top-right corner */}
            <IconButton 
              onClick={() => setShowGeneratorDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                bgcolor: 'white',
                boxShadow: 1,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <GrantGeneratorProvider organizationId="general">
              <GrantGeneratorWizard 
                organizationId="general"
                onComplete={(proposalId) => {
                  console.log('Proposal created:', proposalId);
                  setShowGeneratorDialog(false);
                  // Optionally navigate to proposal view or refresh grants
                }}
              />
            </GrantGeneratorProvider>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Grant Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': { 
            borderRadius: '12px',
            maxHeight: '90vh', 
            overflow: 'auto'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Close button */}
            <IconButton 
              onClick={() => setShowDetailsDialog(false)}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                bgcolor: 'white',
                boxShadow: 1,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {selectedGrant && (
              <>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedGrant.title}
                    </Typography>
                    <Chip
                      label={selectedGrant.status?.replace(/_/g, ' ') || 'draft'}
                      color={getStatusColor(selectedGrant.status || 'draft') as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {selectedGrant.description || 'No description available'}
                  </Typography>
                </Box>

                {/* Grant Info Grid */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Funding Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Amount:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${(selectedGrant.amount || 0).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Source:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {selectedGrant.fundingSource || 'Not specified'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Grant Number:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {selectedGrant.grantNumber || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Timeline
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Start Date:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatDate(selectedGrant.startDate)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">End Date:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatDate(selectedGrant.endDate)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Contact:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {selectedGrant.contactPerson || 'Not specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Collaborating Entities */}
                {selectedGrant.collaboratingEntities && selectedGrant.collaboratingEntities.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Collaborating Entities
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedGrant.collaboratingEntities.map((entity, index) => (
                        <Grid item xs={12} md={6} key={entity.id || index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <GroupsIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {entity.name}
                                </Typography>
                                <Chip label={entity.role} size="small" variant="outlined" />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {entity.description}
                              </Typography>
                              {entity.contactName && (
                                <Typography variant="caption" color="text.secondary">
                                  Contact: {entity.contactName} ({entity.contactEmail})
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Project Milestones */}
                {selectedGrant.projectMilestones && selectedGrant.projectMilestones.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Project Milestones
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedGrant.projectMilestones.map((milestone, index) => (
                        <Card variant="outlined" key={milestone.id || index}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {milestone.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {milestone.description}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip 
                                  label={milestone.status?.replace(/_/g, ' ') || 'not started'} 
                                  size="small" 
                                  color={milestone.status === 'completed' ? 'success' : milestone.status === 'in_progress' ? 'primary' : 'default'}
                                />
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Due: {formatDate(milestone.dueDate)}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Data Collection Methods */}
                {selectedGrant.dataCollectionMethods && selectedGrant.dataCollectionMethods.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Data Collection Methods
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedGrant.dataCollectionMethods.map((method, index) => (
                        <Grid item xs={12} md={6} key={method.id || index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {method.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {method.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={method.frequency} size="small" variant="outlined" />
                                {method.tools && method.tools.map((tool, i) => (
                                  <Chip key={i} label={tool} size="small" />
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FileText size={18} />}
                    onClick={() => handleDownloadAnalysisPDF(selectedGrant)}
                  >
                    Download Analysis PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportGrant(selectedGrant)}
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="contained"
                    href={`/collaborations/${selectedGrant.id}`}
                  >
                    View Collaboration
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Form Generator Dialog */}
      <Dialog
        open={showFormGeneratorDialog}
        onClose={() => setShowFormGeneratorDialog(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <IconButton
            onClick={() => setShowFormGeneratorDialog(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'white',
              boxShadow: 1,
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClipboardList size={24} />
              Form Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate data collection forms based on grant requirements
            </Typography>
          </Box>

          {formGeneratorGrant && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Grant: {formGeneratorGrant.title}
                </Typography>
                <Typography variant="body2">
                  {formGeneratorGrant.dataCollectionMethods?.length || 0} data collection methods • 
                  {formGeneratorGrant.projectMilestones?.length || 0} milestones
                </Typography>
              </Alert>

              {generatedForms.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Click the button below to analyze the grant and generate appropriate data collection forms.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGenerateForms}
                    disabled={generatingForms}
                    startIcon={generatingForms ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                  >
                    {generatingForms ? 'Generating Forms...' : 'Generate Forms with AI'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Generated Forms ({generatedForms.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {generatedForms.map((form, index) => (
                      <Grid item xs={12} md={6} key={form.id || index}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {form.name}
                              </Typography>
                              <Chip label={form.purpose} size="small" color="primary" variant="outlined" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {form.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {form.fields?.length || 0} fields
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {form.fields?.slice(0, 4).map((field: any, i: number) => (
                                <Chip key={i} label={field.label} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                              ))}
                              {form.fields?.length > 4 && (
                                <Chip label={`+${form.fields.length - 4} more`} size="small" sx={{ fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="outlined" onClick={() => setGeneratedForms([])}>
                      Regenerate
                    </Button>
                    <Button variant="contained" color="success" onClick={handleSaveGeneratedForms}>
                      Save Forms to Grant
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dashboard Generator Dialog */}
      <Dialog
        open={showDashboardGeneratorDialog}
        onClose={() => setShowDashboardGeneratorDialog(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <IconButton
            onClick={() => setShowDashboardGeneratorDialog(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'white',
              boxShadow: 1,
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LayoutDashboard size={24} />
              AI Dashboard Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate a real-time tracking dashboard based on grant reporting requirements
            </Typography>
          </Box>

          {dashboardGeneratorGrant && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Grant: {dashboardGeneratorGrant.title}
                </Typography>
                <Typography variant="body2">
                  Budget: ${(dashboardGeneratorGrant.amount || dashboardGeneratorGrant.totalBudget || 0).toLocaleString()} • 
                  {dashboardGeneratorGrant.reportingSchedule?.length || 0} reporting items • 
                  {dashboardGeneratorGrant.formTemplates?.length || 0} forms
                </Typography>
              </Alert>

              {!generatedDashboard ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Click the button below to analyze the grant and generate a customized dashboard with KPIs, charts, and tables.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGenerateDashboard}
                    disabled={generatingDashboard}
                    startIcon={generatingDashboard ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                  >
                    {generatingDashboard ? 'Generating Dashboard...' : 'Generate Dashboard with AI'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {generatedDashboard.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {generatedDashboard.description}
                  </Typography>

                  {/* KPI Metrics */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Key Performance Indicators ({generatedDashboard.metrics?.length || 0})
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {generatedDashboard.metrics?.map((metric: any, index: number) => (
                      <Grid item xs={12} sm={6} md={3} key={metric.id || index}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {metric.value}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {metric.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Target: {metric.target} {metric.unit}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Charts */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Charts ({generatedDashboard.charts?.length || 0})
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {generatedDashboard.charts?.map((chart: any, index: number) => (
                      <Grid item xs={12} md={4} key={chart.id || index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {chart.name}
                              </Typography>
                              <Chip label={chart.type} size="small" variant="outlined" />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Linked to: {chart.linkedForm}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Tables */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Data Tables ({generatedDashboard.tables?.length || 0})
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {generatedDashboard.tables?.map((table: any, index: number) => (
                      <Grid item xs={12} md={6} key={table.id || index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              {table.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {table.columns?.map((col: string, i: number) => (
                                <Chip key={i} label={col} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="outlined" onClick={() => setGeneratedDashboard(null)}>
                      Regenerate
                    </Button>
                    <Button variant="contained" color="success" onClick={handleSaveGeneratedDashboard}>
                      Save Dashboard to Grant
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
