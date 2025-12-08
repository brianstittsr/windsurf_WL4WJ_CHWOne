'use client';

import React, { useState, useEffect } from 'react';
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
  Groups as GroupsIcon
} from '@mui/icons-material';
import { Sparkles, FileText } from 'lucide-react';
import { createGrant, getActiveGrantsCount } from '@/lib/schema/data-access';
import { Grant } from '@/lib/schema/unified-schema';
import { Grant as WizardGrant } from '@/types/grant.types';
import { Timestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

export default function GrantManagement() {
  // Extended grant type that handles both unified-schema and wizard grant types
  type ExtendedGrant = Grant & Partial<WizardGrant>;
  const [grants, setGrants] = useState<ExtendedGrant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<ExtendedGrant | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWizardDialog, setShowWizardDialog] = useState(false);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);

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
    if (!grant.reportingSchedule || grant.reportingSchedule.length === 0) return null;
    const upcoming = grant.reportingSchedule.filter(r => !r.completed);
    return upcoming.length > 0 ? upcoming[0] : null;
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
                          {grant.projectIds.length} Projects
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

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      setSelectedGrant(grant);
                      setShowDetailsDialog(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportGrant(grant)}
                  >
                    Export
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
                          {grant.requirements.map((req, index) => (
                            <Chip key={index} label={req} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Contact Person: {grant.contactPerson}
                        </Typography>
                        {upcomingReport && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Next report due: {formatDate(upcomingReport.dueDate)} ({upcomingReport.type})
                          </Alert>
                        )}
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
    </Box>
  );
}
