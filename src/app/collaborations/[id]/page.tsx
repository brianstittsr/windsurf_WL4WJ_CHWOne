'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  LinearProgress,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
  Analytics as AnalyticsIcon,
  Assignment as FormIcon,
  Storage as DatasetIcon,
  Assessment as ReportIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Link as LinkIcon,
  SmartToy as AIIcon,
  Receipt as ReceiptIcon,
  TaskAlt as TaskIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  History as HistoryIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  Feedback as FeedbackIcon,
  ExitToApp as ExitToAppIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Grant } from '@/lib/schema/unified-schema';
import { 
  ProgramForm, 
  ProgramType, 
  createDefaultProgramDatasets, 
  getProgramTypeLabel,
  DEFAULT_INSTRUCTOR_FIELDS,
  DEFAULT_STUDENT_FIELDS,
  DEFAULT_NONPROFIT_FIELDS,
  generateMockInstructorData,
  generateMockStudentData,
  generateMockNonprofitData
} from '@/types/program-form.types';
import { Switch, FormControlLabel } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ProgramMetricsDashboard from '@/components/Programs/ProgramMetricsDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function CollaborationDetailContent() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const collaborationId = params?.id as string;

  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormType, setNewFormType] = useState('intake');
  const [showFormViewDialog, setShowFormViewDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [editingForm, setEditingForm] = useState(false);
  
  // Milestone state
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    status: 'not_started',
    completionDescription: '',
    completedAt: '',
    completedBy: ''
  });
  const [showMilestoneHistory, setShowMilestoneHistory] = useState(false);
  const [selectedMilestoneHistory, setSelectedMilestoneHistory] = useState<any>(null);
  const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false);
  const [changeRequestForm, setChangeRequestForm] = useState({
    milestoneId: '',
    changeDescription: '',
    proposedChanges: {} as any
  });
  
  // Invoice state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    description: '',
    amount: '',
    linkedMilestoneId: '',
    dueDate: '',
    notes: '',
    submittedBy: ''
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [milestoneChanges, setMilestoneChanges] = useState<any[]>([]);
  
  // Program Form state
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [programForms, setProgramForms] = useState<ProgramForm[]>([]);
  const [newProgramForm, setNewProgramForm] = useState({
    name: 'Digital Literacy Program',
    description: 'A comprehensive digital literacy training program for community members',
    programType: 'digital_literacy' as ProgramType,
    enableInstructorDataset: true,
    enableStudentDataset: true,
    enableNonprofitDataset: true,
  });
  const [selectedProgram, setSelectedProgram] = useState<ProgramForm | null>(null);
  const [showProgramViewDialog, setShowProgramViewDialog] = useState(false);
  const [showMockData, setShowMockData] = useState(false);
  const [mockInstructorData, setMockInstructorData] = useState<Record<string, any>[]>([]);
  const [mockStudentData, setMockStudentData] = useState<Record<string, any>[]>([]);
  const [mockNonprofitData, setMockNonprofitData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser && collaborationId) {
      fetchCollaboration();
    }
  }, [currentUser, authLoading, collaborationId, router]);

  const fetchCollaboration = async () => {
    try {
      const { getGrantById } = await import('@/lib/schema/data-access');
      const result = await getGrantById(collaborationId);

      if (result.success && result.grant) {
        setGrant(result.grant);
      }
    } catch (error) {
      console.error('Error fetching collaboration:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (): number => {
    const milestones = (grant as any)?.projectMilestones || [];
    if (milestones.length === 0) {
      // Calculate based on dates
      const start = grant?.startDate?.toDate()?.getTime() || Date.now();
      const end = grant?.endDate?.toDate()?.getTime() || Date.now();
      const now = Date.now();
      const total = end - start;
      const elapsed = now - start;
      return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    }
    const completed = milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getProgressStatus = (progress: number): { color: string; label: string } => {
    if (progress >= 75) return { color: 'success', label: 'On Track' };
    if (progress >= 50) return { color: 'primary', label: 'In Progress' };
    if (progress >= 25) return { color: 'warning', label: 'Behind Schedule' };
    return { color: 'error', label: 'At Risk' };
  };

  const handleExportDocument = (type: 'original' | 'analyzed') => {
    const exportData = type === 'original' 
      ? { type: 'original', grantId: grant?.id, title: grant?.title }
      : { type: 'analyzed', ...grant, analyzedAt: new Date().toISOString() };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-grant-${grant?.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateParticipantForm = () => {
    // Navigate to forms page with pre-filled data
    router.push(`/forms/new?template=participant-tracking&grantId=${collaborationId}`);
  };

  const handleCreateForm = () => {
    if (newFormName) {
      router.push(`/forms/new?name=${encodeURIComponent(newFormName)}&type=${newFormType}&grantId=${collaborationId}`);
      setShowFormDialog(false);
      setNewFormName('');
    }
  };

  const handleViewForm = (form: any) => {
    setSelectedForm(form);
    setEditingForm(false);
    setShowFormViewDialog(true);
  };

  const handleEditForm = (form: any) => {
    setSelectedForm(form);
    setEditingForm(true);
    setShowFormViewDialog(true);
  };

  const handleSaveFormChanges = async () => {
    if (!selectedForm || !grant) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const updatedTemplates = formTemplates.map((f: any) => 
        f.id === selectedForm.id ? selectedForm : f
      );
      await updateGrant(grant.id, { formTemplates: updatedTemplates } as any);
      setGrant({ ...grant, formTemplates: updatedTemplates } as any);
      setShowFormViewDialog(false);
      setEditingForm(false);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const handleDeleteFormTemplate = async (form: any) => {
    if (!grant || !confirm(`Are you sure you want to delete the form "${form.name}"?`)) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentTemplates = (grant as any).formTemplates || [];
      const updatedTemplates = currentTemplates.filter((f: any) => f.id !== form.id);
      
      await updateGrant(grant.id, { formTemplates: updatedTemplates } as any);
      setGrant({ ...grant, formTemplates: updatedTemplates } as any);
    } catch (error) {
      console.error('Error deleting form template:', error);
      alert('Failed to delete form. Please try again.');
    }
  };

  // ============ MILESTONE HANDLERS ============
  const resetMilestoneForm = () => {
    setMilestoneForm({
      name: '',
      description: '',
      dueDate: '',
      assignedTo: '',
      status: 'not_started',
      completionDescription: '',
      completedAt: '',
      completedBy: ''
    });
    setEditingMilestone(null);
  };

  const handleOpenMilestoneDialog = (milestone?: any) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setMilestoneForm({
        name: milestone.name || milestone.title || '',
        description: milestone.description || '',
        dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
        assignedTo: milestone.assignedTo || '',
        status: milestone.status || 'not_started',
        completionDescription: milestone.completionDescription || '',
        completedAt: milestone.completedAt || '',
        completedBy: milestone.completedBy || ''
      });
    } else {
      resetMilestoneForm();
    }
    setShowMilestoneDialog(true);
  };

  const handleSaveMilestone = async () => {
    if (!grant || !milestoneForm.name) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentMilestones = (grant as any).projectMilestones || [];
      
      const milestoneData = {
        id: editingMilestone?.id || `milestone_${Date.now()}`,
        name: milestoneForm.name,
        title: milestoneForm.name,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate,
        assignedTo: milestoneForm.assignedTo,
        status: milestoneForm.status,
        completionDescription: milestoneForm.completionDescription,
        completedAt: milestoneForm.status === 'completed' ? (milestoneForm.completedAt || new Date().toISOString()) : null,
        completedBy: milestoneForm.status === 'completed' ? milestoneForm.completedBy : null,
        updatedAt: new Date().toISOString(),
        changeHistory: editingMilestone?.changeHistory || []
      };

      // If editing and there are changes, add to change history
      if (editingMilestone) {
        const changes: string[] = [];
        if (editingMilestone.name !== milestoneForm.name) changes.push(`Name changed from "${editingMilestone.name}" to "${milestoneForm.name}"`);
        if (editingMilestone.description !== milestoneForm.description) changes.push('Description updated');
        if (editingMilestone.dueDate !== milestoneForm.dueDate) changes.push(`Due date changed to ${milestoneForm.dueDate}`);
        if (editingMilestone.status !== milestoneForm.status) changes.push(`Status changed from "${editingMilestone.status}" to "${milestoneForm.status}"`);
        
        if (changes.length > 0) {
          milestoneData.changeHistory = [
            ...(editingMilestone.changeHistory || []),
            {
              id: `change_${Date.now()}`,
              timestamp: new Date().toISOString(),
              changedBy: currentUser?.email || 'Unknown',
              changes,
              status: 'pending_approval',
              approvedBy: null,
              approvedAt: null
            }
          ];
        }
      }

      let updatedMilestones;
      if (editingMilestone) {
        updatedMilestones = currentMilestones.map((m: any) => 
          m.id === editingMilestone.id ? milestoneData : m
        );
      } else {
        updatedMilestones = [...currentMilestones, milestoneData];
      }

      await updateGrant(grant.id, { projectMilestones: updatedMilestones } as any);
      setGrant({ ...grant, projectMilestones: updatedMilestones } as any);
      setShowMilestoneDialog(false);
      resetMilestoneForm();
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!grant || !confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentMilestones = (grant as any).projectMilestones || [];
      const updatedMilestones = currentMilestones.filter((m: any) => m.id !== milestoneId);
      
      await updateGrant(grant.id, { projectMilestones: updatedMilestones } as any);
      setGrant({ ...grant, projectMilestones: updatedMilestones } as any);
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const handleMarkMilestoneComplete = async (milestone: any) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      ...milestoneForm,
      name: milestone.name || milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      assignedTo: milestone.assignedTo,
      status: 'completed',
      completionDescription: '',
      completedAt: new Date().toISOString(),
      completedBy: currentUser?.email || ''
    });
    setShowMilestoneDialog(true);
  };

  const handleViewMilestoneHistory = (milestone: any) => {
    setSelectedMilestoneHistory(milestone);
    setShowMilestoneHistory(true);
  };

  const handleApproveChange = async (milestone: any, changeId: string) => {
    if (!grant) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentMilestones = (grant as any).projectMilestones || [];
      
      const updatedMilestones = currentMilestones.map((m: any) => {
        if (m.id === milestone.id) {
          return {
            ...m,
            changeHistory: m.changeHistory?.map((ch: any) => 
              ch.id === changeId 
                ? { ...ch, status: 'approved', approvedBy: currentUser?.email, approvedAt: new Date().toISOString() }
                : ch
            )
          };
        }
        return m;
      });
      
      await updateGrant(grant.id, { projectMilestones: updatedMilestones } as any);
      setGrant({ ...grant, projectMilestones: updatedMilestones } as any);
      
      // Update the selected milestone history view
      const updatedMilestone = updatedMilestones.find((m: any) => m.id === milestone.id);
      setSelectedMilestoneHistory(updatedMilestone);
    } catch (error) {
      console.error('Error approving change:', error);
    }
  };

  const handleRejectChange = async (milestone: any, changeId: string, reason?: string) => {
    if (!grant) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentMilestones = (grant as any).projectMilestones || [];
      
      const updatedMilestones = currentMilestones.map((m: any) => {
        if (m.id === milestone.id) {
          return {
            ...m,
            changeHistory: m.changeHistory?.map((ch: any) => 
              ch.id === changeId 
                ? { ...ch, status: 'rejected', rejectedBy: currentUser?.email, rejectedAt: new Date().toISOString(), rejectionReason: reason }
                : ch
            )
          };
        }
        return m;
      });
      
      await updateGrant(grant.id, { projectMilestones: updatedMilestones } as any);
      setGrant({ ...grant, projectMilestones: updatedMilestones } as any);
      
      const updatedMilestone = updatedMilestones.find((m: any) => m.id === milestone.id);
      setSelectedMilestoneHistory(updatedMilestone);
    } catch (error) {
      console.error('Error rejecting change:', error);
    }
  };

  // ============ INVOICE HANDLERS ============
  const resetInvoiceForm = () => {
    setInvoiceForm({
      description: '',
      amount: '',
      linkedMilestoneId: '',
      dueDate: '',
      notes: '',
      submittedBy: ''
    });
    setEditingInvoice(null);
  };

  const handleOpenInvoiceDialog = (invoice?: any) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setInvoiceForm({
        description: invoice.description || '',
        amount: invoice.amount?.toString() || '',
        linkedMilestoneId: invoice.linkedMilestoneId || '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        notes: invoice.notes || '',
        submittedBy: invoice.submittedBy || ''
      });
    } else {
      resetInvoiceForm();
    }
    setShowInvoiceDialog(true);
  };

  const handleSaveInvoice = async () => {
    if (!grant || !invoiceForm.description || !invoiceForm.amount) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentInvoices = (grant as any).invoices || [];
      
      const invoiceData = {
        id: editingInvoice?.id || `INV-${Date.now().toString().slice(-6)}`,
        invoiceNumber: editingInvoice?.invoiceNumber || `INV-${String(currentInvoices.length + 1).padStart(4, '0')}`,
        description: invoiceForm.description,
        amount: parseFloat(invoiceForm.amount),
        linkedMilestoneId: invoiceForm.linkedMilestoneId,
        linkedMilestoneName: milestones.find((m: any) => m.id === invoiceForm.linkedMilestoneId)?.name || '',
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes,
        submittedBy: invoiceForm.submittedBy || currentUser?.email,
        status: editingInvoice?.status || 'draft',
        createdAt: editingInvoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        billComId: editingInvoice?.billComId || null,
        billComStatus: editingInvoice?.billComStatus || null,
        paidAt: editingInvoice?.paidAt || null
      };

      let updatedInvoices;
      if (editingInvoice) {
        updatedInvoices = currentInvoices.map((inv: any) => 
          inv.id === editingInvoice.id ? invoiceData : inv
        );
      } else {
        updatedInvoices = [...currentInvoices, invoiceData];
      }

      await updateGrant(grant.id, { invoices: updatedInvoices } as any);
      setGrant({ ...grant, invoices: updatedInvoices } as any);
      setInvoices(updatedInvoices);
      setShowInvoiceDialog(false);
      resetInvoiceForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!grant || !confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentInvoices = (grant as any).invoices || [];
      const updatedInvoices = currentInvoices.filter((inv: any) => inv.id !== invoiceId);
      
      await updateGrant(grant.id, { invoices: updatedInvoices } as any);
      setGrant({ ...grant, invoices: updatedInvoices } as any);
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleSubmitToBillCom = async (invoice: any) => {
    if (!grant) return;
    
    try {
      // Simulate Bill.com API integration
      // In production, this would call the actual Bill.com API
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentInvoices = (grant as any).invoices || [];
      
      const updatedInvoices = currentInvoices.map((inv: any) => {
        if (inv.id === invoice.id) {
          return {
            ...inv,
            status: 'submitted',
            billComId: `BC-${Date.now().toString().slice(-8)}`,
            billComStatus: 'pending',
            submittedAt: new Date().toISOString()
          };
        }
        return inv;
      });
      
      await updateGrant(grant.id, { invoices: updatedInvoices } as any);
      setGrant({ ...grant, invoices: updatedInvoices } as any);
      setInvoices(updatedInvoices);
      
      alert('Invoice submitted to Bill.com successfully! Invoice ID: ' + updatedInvoices.find((i: any) => i.id === invoice.id)?.billComId);
    } catch (error) {
      console.error('Error submitting to Bill.com:', error);
      alert('Failed to submit invoice to Bill.com');
    }
  };

  const handleMarkInvoicePaid = async (invoice: any) => {
    if (!grant) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentInvoices = (grant as any).invoices || [];
      
      const updatedInvoices = currentInvoices.map((inv: any) => {
        if (inv.id === invoice.id) {
          return {
            ...inv,
            status: 'paid',
            billComStatus: 'paid',
            paidAt: new Date().toISOString()
          };
        }
        return inv;
      });
      
      await updateGrant(grant.id, { invoices: updatedInvoices } as any);
      setGrant({ ...grant, invoices: updatedInvoices } as any);
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'submitted': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = () => {
    const grantInvoices = (grant as any)?.invoices || [];
    const totalInvoiced = grantInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
    const totalPaid = grantInvoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
    // Use amount, totalBudget, or budget field (whichever exists)
    const budget = (grant as any)?.amount || (grant as any)?.totalBudget || (grant as any)?.budget || 0;
    return { totalInvoiced, totalPaid, remaining: budget - totalInvoiced, budget };
  };

  // ============ PROGRAM FORM HANDLERS ============
  const handleCreateProgramForm = async () => {
    if (!grant || !newProgramForm.name) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentPrograms = (grant as any).programForms || [];
      
      // Create the program form with datasets
      const datasets = createDefaultProgramDatasets(newProgramForm.name);
      
      // Disable datasets based on user selection
      if (!newProgramForm.enableInstructorDataset) {
        datasets.instructor.enabled = false;
      }
      if (!newProgramForm.enableStudentDataset) {
        datasets.student.enabled = false;
      }
      if (!newProgramForm.enableNonprofitDataset) {
        datasets.nonprofit.enabled = false;
      }
      
      const programForm: ProgramForm = {
        id: `program_${Date.now()}`,
        collaborationId: grant.id,
        name: newProgramForm.name,
        description: newProgramForm.description,
        programType: newProgramForm.programType,
        status: 'active',
        datasets,
        createdBy: currentUser?.email || '',
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };
      
      const updatedPrograms = [...currentPrograms, programForm];
      
      await updateGrant(grant.id, { programForms: updatedPrograms } as any);
      setGrant({ ...grant, programForms: updatedPrograms } as any);
      setProgramForms(updatedPrograms);
      setShowProgramDialog(false);
      
      // Reset form
      setNewProgramForm({
        name: 'Digital Literacy Program',
        description: 'A comprehensive digital literacy training program for community members',
        programType: 'digital_literacy',
        enableInstructorDataset: true,
        enableStudentDataset: true,
        enableNonprofitDataset: true,
      });
    } catch (error) {
      console.error('Error creating program form:', error);
    }
  };

  const handleViewProgram = (program: ProgramForm) => {
    setSelectedProgram(program);
    setShowProgramViewDialog(true);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!grant || !confirm('Are you sure you want to delete this program and all its datasets?')) return;
    
    try {
      const { updateGrant } = await import('@/lib/schema/data-access');
      const currentPrograms = (grant as any).programForms || [];
      const updatedPrograms = currentPrograms.filter((p: ProgramForm) => p.id !== programId);
      
      await updateGrant(grant.id, { programForms: updatedPrograms } as any);
      setGrant({ ...grant, programForms: updatedPrograms } as any);
      setProgramForms(updatedPrograms);
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handleNavigateToDataset = (program: ProgramForm, datasetType: 'instructor' | 'student' | 'nonprofit') => {
    const dataset = program.datasets[datasetType];
    if (dataset && dataset.enabled) {
      router.push(`/datasets/program/${program.id}/${datasetType}`);
    }
  };

  const handleToggleMockData = (enabled: boolean) => {
    setShowMockData(enabled);
    if (enabled) {
      // Generate mock data when toggle is turned on
      setMockInstructorData(generateMockInstructorData(5));
      setMockStudentData(generateMockStudentData(10));
      setMockNonprofitData(generateMockNonprofitData(3));
    } else {
      // Clear mock data when toggle is turned off
      setMockInstructorData([]);
      setMockStudentData([]);
      setMockNonprofitData([]);
    }
  };

  if (authLoading || loading) {
    return <AnimatedLoading message="Loading Collaboration..." />;
  }

  if (!currentUser) {
    return null;
  }

  if (!grant) {
    return (
      <AdminLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error">Collaboration not found</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/collaborations')} sx={{ mt: 2 }}>
            Back to Collaborations
          </Button>
        </Box>
      </AdminLayout>
    );
  }

  const progress = calculateProgress();
  const progressStatus = getProgressStatus(progress);
  const entities = (grant as any).collaboratingEntities || [];
  const milestones = (grant as any).projectMilestones || [];
  const dataCollectionMethods = (grant as any).dataCollectionMethods || [];
  const formTemplates = (grant as any).formTemplates || [];
  
  // Check if user is a nonprofit - hide billing/invoices tab for nonprofits
  const isNonprofit = userProfile?.organizationType === 'Nonprofit' || 
                      userProfile?.role === 'NONPROFIT_STAFF' ||
                      userProfile?.roles?.includes('NONPROFIT_STAFF' as any);

  return (
    <AdminLayout>
      <Box sx={{ py: 4, px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.push('/collaborations')}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {grant.title}
            </Typography>
            <Typography color="text.secondary">
              {grant.description}
            </Typography>
          </Box>
          <Chip 
            label={grant.status} 
            color={grant.status === 'active' ? 'success' : 'default'}
            size="medium"
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SchoolIcon />}
            onClick={() => setShowProgramDialog(true)}
            sx={{ ml: 1 }}
          >
            Digital Literacy Program
          </Button>
        </Box>

        {/* Grant Metrics Tracker */}
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon color="primary" />
                <Typography variant="h6">Grant Metrics Tracker</Typography>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Progress */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      size={120}
                      thickness={4}
                      sx={{ color: `${progressStatus.color}.main` }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {progress}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Complete
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={progressStatus.label} 
                    color={progressStatus.color as any}
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>

              {/* Key Metrics */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {milestones.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Milestones
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {milestones.filter((m: any) => m.status === 'completed').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completed
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {milestones.filter((m: any) => m.status === 'in_progress').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In Progress
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {entities.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Partners
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Timeline */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {grant.startDate?.toDate().toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {grant.endDate?.toDate().toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Billing & Invoicing Summary */}
            <Divider sx={{ my: 3 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ReceiptIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Billing & Invoicing Status</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${calculateInvoiceTotals().budget.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Budget
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {((grant as any).invoices || []).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Invoices
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      ${calculateInvoiceTotals().totalInvoiced.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invoiced
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      ${calculateInvoiceTotals().totalPaid.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Paid
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      ${calculateInvoiceTotals().remaining.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Remaining
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Invoice Status Breakdown */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<ReceiptIcon />}
                  label={`${((grant as any).invoices || []).filter((i: any) => i.status === 'draft').length} Draft`}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  icon={<SendIcon />}
                  label={`${((grant as any).invoices || []).filter((i: any) => i.status === 'submitted').length} Submitted`}
                  color="info"
                  size="small"
                />
                <Chip 
                  icon={<PaymentIcon />}
                  label={`${((grant as any).invoices || []).filter((i: any) => i.status === 'paid').length} Paid`}
                  color="success"
                  size="small"
                />
                {calculateInvoiceTotals().budget > 0 && (
                  <Chip 
                    label={`${Math.round((calculateInvoiceTotals().totalPaid / calculateInvoiceTotals().budget) * 100)}% Budget Utilized`}
                    color={calculateInvoiceTotals().totalPaid / calculateInvoiceTotals().budget > 0.8 ? 'warning' : 'default'}
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs - Billing/Invoices tab hidden for nonprofit users */}
        <Paper sx={{ mb: 3, position: 'relative', zIndex: 'auto' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Documents" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="Forms & Data" icon={<FormIcon />} iconPosition="start" />
            <Tab label="Programs" icon={<SchoolIcon />} iconPosition="start" />
            <Tab label="Datasets" icon={<DatasetIcon />} iconPosition="start" />
            <Tab label="AI Reports" icon={<AIIcon />} iconPosition="start" />
            <Tab label="Partners" icon={<GroupsIcon />} iconPosition="start" />
            {!isNonprofit && <Tab label="Billing / Invoices" icon={<ReceiptIcon />} iconPosition="start" />}
            <Tab label="Milestones / Tasks" icon={<TaskIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Apple-styled Documents Tab */}
        <TabPanel value={tabValue} index={0}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Grant Document */}
            <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#D2D2D7] bg-[#F5F5F7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center">
                    <DocumentIcon sx={{ color: 'white', fontSize: 22 }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">Original Grant Document</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#6E6E73] mb-4">
                  The original grant document that was uploaded and analyzed.
                </p>
                <button
                  onClick={() => handleExportDocument('original')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
                >
                  <DownloadIcon sx={{ fontSize: 18 }} />
                  Download Original
                </button>
              </div>
            </div>

            {/* AI Analyzed Grant Document */}
            <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#D2D2D7] bg-[#F5F5F7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5856D6] rounded-xl flex items-center justify-center">
                    <AIIcon sx={{ color: 'white', fontSize: 22 }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">AI Analyzed Grant Document</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#6E6E73] mb-4">
                  The structured data extracted by AI from the grant document.
                </p>
                <button
                  onClick={() => handleExportDocument('analyzed')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5856D6] text-white rounded-xl font-medium text-sm hover:bg-[#4B49B8] transition-colors"
                >
                  <DownloadIcon sx={{ fontSize: 18 }} />
                  Download Analyzed
                </button>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Apple-styled Forms & Data Tab */}
        <TabPanel value={tabValue} index={1}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Data Collection Forms</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateParticipantForm}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0071E3] text-white rounded-xl font-medium text-sm hover:bg-[#0077ED] transition-colors"
              >
                <FormIcon sx={{ fontSize: 18 }} />
                Generate Participant Tracking Form
              </button>
              <button
                onClick={() => setShowFormDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D2D2D7] text-[#1D1D1F] rounded-xl font-medium text-sm hover:bg-[#F5F5F7] transition-colors"
              >
                <AddIcon sx={{ fontSize: 18 }} />
                Create Additional Form
              </button>
            </div>
          </div>

          {formTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formTemplates.map((form: any, index: number) => (
                <div key={form.id || index} className="bg-white rounded-2xl border border-[#D2D2D7] p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-[#1D1D1F]">{form.name}</h3>
                      <p className="text-sm text-[#6E6E73] mt-1">{form.description || 'No description'}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#F5F5F7] text-[#6E6E73] rounded-full text-xs font-medium">
                      {form.purpose || 'data'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button 
                      onClick={() => handleViewForm(form)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0071E3] bg-[#0071E3]/10 rounded-lg hover:bg-[#0071E3]/20 transition-colors"
                    >
                      <ViewIcon sx={{ fontSize: 16 }} />
                      View
                    </button>
                    <button 
                      onClick={() => handleEditForm(form)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#5856D6] bg-[#5856D6]/10 rounded-lg hover:bg-[#5856D6]/20 transition-colors"
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                      Edit
                    </button>
                    {form.datasetId && (
                      <button 
                        onClick={() => router.push(`/datasets/${form.datasetId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#34C759] bg-[#34C759]/10 rounded-lg hover:bg-[#34C759]/20 transition-colors"
                      >
                        <DatasetIcon sx={{ fontSize: 16 }} />
                        Data
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteFormTemplate(form)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#FF3B30] bg-[#FF3B30]/10 rounded-lg hover:bg-[#FF3B30]/20 transition-colors"
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0071E3]/5 rounded-2xl p-6 text-center">
              <p className="text-[#0071E3] font-medium">No forms have been created yet. Use the buttons above to generate forms for this collaboration.</p>
            </div>
          )}

          {/* Data Collection Methods */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Data Collection Methods</Typography>
          {dataCollectionMethods.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell><strong>Frequency</strong></TableCell>
                    <TableCell><strong>Responsible Entity</strong></TableCell>
                    <TableCell><strong>Data Points</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataCollectionMethods.map((method: any, index: number) => (
                    <TableRow key={method.id || index}>
                      <TableCell>{method.name}</TableCell>
                      <TableCell>
                        <Chip label={method.frequency} size="small" />
                      </TableCell>
                      <TableCell>{method.responsibleEntity}</TableCell>
                      <TableCell>
                        {method.dataPoints?.slice(0, 3).join(', ')}
                        {method.dataPoints?.length > 3 && '...'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No data collection methods defined.</Alert>
          )}
        </TabPanel>

        {/* Programs Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Program Forms</Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SchoolIcon />}
              onClick={() => setShowProgramDialog(true)}
            >
              Create Program Form
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Program forms allow you to track data at multiple levels: Instructor, Student, and Nonprofit. 
            Each program creates separate datasets for comprehensive reporting.
          </Alert>

          {((grant as any).programForms || []).length > 0 ? (
            <Grid container spacing={3}>
              {((grant as any).programForms || []).map((program: ProgramForm) => (
                <Grid item xs={12} md={6} key={program.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon color="secondary" />
                          <Typography variant="h6">{program.name}</Typography>
                        </Box>
                      }
                      subheader={program.description}
                      action={
                        <Chip 
                          label={program.status} 
                          color={program.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Multi-Level Datasets
                      </Typography>
                      
                      <Grid container spacing={1}>
                        {/* Instructor Dataset */}
                        <Grid item xs={12}>
                          <Paper 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              bgcolor: program.datasets.instructor.enabled ? 'primary.50' : 'grey.100',
                              opacity: program.datasets.instructor.enabled ? 1 : 0.6
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>I</Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Instructor Dataset
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {program.datasets.instructor.fields.length} fields
                                </Typography>
                              </Box>
                            </Box>
                            {program.datasets.instructor.enabled && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleNavigateToDataset(program, 'instructor')}
                              >
                                View Data
                              </Button>
                            )}
                          </Paper>
                        </Grid>

                        {/* Student Dataset */}
                        <Grid item xs={12}>
                          <Paper 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              bgcolor: program.datasets.student.enabled ? 'success.50' : 'grey.100',
                              opacity: program.datasets.student.enabled ? 1 : 0.6
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>S</Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Student Dataset
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {program.datasets.student.fields.length} fields
                                </Typography>
                              </Box>
                            </Box>
                            {program.datasets.student.enabled && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleNavigateToDataset(program, 'student')}
                              >
                                View Data
                              </Button>
                            )}
                          </Paper>
                        </Grid>

                        {/* Nonprofit Dataset */}
                        <Grid item xs={12}>
                          <Paper 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              bgcolor: program.datasets.nonprofit.enabled ? 'warning.50' : 'grey.100',
                              opacity: program.datasets.nonprofit.enabled ? 1 : 0.6
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>N</Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Nonprofit Dataset
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {program.datasets.nonprofit.fields.length} fields
                                </Typography>
                              </Box>
                            </Box>
                            {program.datasets.nonprofit.enabled && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleNavigateToDataset(program, 'nonprofit')}
                              >
                                View Data
                              </Button>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewProgram(program)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteProgram(program.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No Program Forms Created
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a program form to track data at instructor, student, and nonprofit levels.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SchoolIcon />}
                onClick={() => setShowProgramDialog(true)}
              >
                Create Digital Literacy Program
              </Button>
            </Card>
          )}
        </TabPanel>

        {/* Datasets Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Linked Datasets</Typography>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={() => router.push(`/datasets?grantId=${collaborationId}`)}
            >
              View All Datasets
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Datasets are automatically created when forms are submitted. Link existing datasets or create new ones for this collaboration.
          </Alert>

          <Grid container spacing={2}>
            {dataCollectionMethods.map((method: any, index: number) => (
              <Grid item xs={12} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <DatasetIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {method.name} Dataset
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Data collected via {method.frequency} {method.name.toLowerCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`${method.dataPoints?.length || 0} fields`} size="small" />
                      <Chip label={method.frequency} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* AI Reports Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">AI Generated Reports</Typography>
            <Button
              variant="contained"
              startIcon={<AIIcon />}
              onClick={() => router.push(`/reports/generate?grantId=${collaborationId}`)}
            >
              Generate New Report
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Progress Summary Report"
                  subheader="Auto-generated based on milestone completion"
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      This report provides an AI-generated summary of project progress, 
                      including milestone status, timeline adherence, and recommendations.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                      Download PDF
                    </Button>
                    <Button variant="outlined">View Online</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Partner Contribution Report"
                  subheader="Analysis of partner activities and deliverables"
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Detailed breakdown of each partner's contributions, 
                      responsibilities fulfilled, and collaboration metrics.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                      Download PDF
                    </Button>
                    <Button variant="outlined">View Online</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Data Collection Report"
                  subheader="Summary of collected data and compliance"
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overview of data collection activities, submission rates, 
                      data quality metrics, and compliance status.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                      Download PDF
                    </Button>
                    <Button variant="outlined">View Online</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Funder Report"
                  subheader="Formatted report for grant funders"
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive report formatted according to funder requirements,
                      including financials, outcomes, and impact metrics.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>
                      Download PDF
                    </Button>
                    <Button variant="outlined">View Online</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Partners Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" sx={{ mb: 3 }}>Collaborating Organizations</Typography>
          
          <Grid container spacing={3}>
            {entities.map((entity: any, index: number) => (
              <Grid item xs={12} md={6} key={entity.id || index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 60, 
                          height: 60,
                          bgcolor: entity.role === 'lead' ? 'primary.main' : 
                                   entity.role === 'partner' ? 'success.main' :
                                   entity.role === 'evaluator' ? 'warning.main' : 'grey.500'
                        }}
                      >
                        {entity.name?.charAt(0) || 'O'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {entity.name}
                        </Typography>
                        <Chip 
                          label={entity.role} 
                          size="small" 
                          color={entity.role === 'lead' ? 'primary' : 'default'}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {entity.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Contact Information</Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {entity.contactName || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {entity.contactEmail || 'Not specified'}
                    </Typography>
                    {entity.contactPhone && (
                      <Typography variant="body2">
                        <strong>Phone:</strong> {entity.contactPhone}
                      </Typography>
                    )}

                    {entity.responsibilities?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Responsibilities</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {entity.responsibilities.map((resp: string, i: number) => (
                            <Chip key={i} label={resp} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {entities.length === 0 && (
            <Alert severity="info">No collaborating organizations defined for this grant.</Alert>
          )}
        </TabPanel>

        {/* Billing / Invoices Tab - Hidden for nonprofit users */}
        {!isNonprofit && <TabPanel value={tabValue} index={6}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Billing & Invoices</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenInvoiceDialog()}
            >
              Create Invoice
            </Button>
          </Box>

          {/* Budget Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ${(grant as any).budget?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Budget</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${calculateInvoiceTotals().totalInvoiced.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Invoiced</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    ${calculateInvoiceTotals().totalPaid.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Paid</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    ${calculateInvoiceTotals().remaining.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Remaining</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Invoices Table */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Invoice History</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Invoice #</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Linked Milestone</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Bill.com ID</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((grant as any).invoices || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No invoices have been created yet. Click "Create Invoice" to add one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  ((grant as any).invoices || []).map((invoice: any) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {invoice.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {invoice.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {invoice.linkedMilestoneName ? (
                          <Chip label={invoice.linkedMilestoneName} size="small" variant="outlined" />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${invoice.amount?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={invoice.status} 
                          size="small" 
                          color={getInvoiceStatusColor(invoice.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.billComId ? (
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {invoice.billComId}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenInvoiceDialog(invoice)}
                            title="Edit Invoice"
                            disabled={invoice.status === 'paid'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {invoice.status === 'draft' && (
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleSubmitToBillCom(invoice)}
                              title="Submit to Bill.com"
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                          )}
                          {invoice.status === 'submitted' && (
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleMarkInvoicePaid(invoice)}
                              title="Mark as Paid"
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          )}
                          {invoice.status === 'draft' && (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              title="Delete Invoice"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Payment Schedule */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>Payment Schedule by Milestone</Typography>
          {milestones.length > 0 ? (
            <Grid container spacing={2}>
              {milestones.map((milestone: any, index: number) => {
                const linkedInvoices = ((grant as any).invoices || []).filter((inv: any) => inv.linkedMilestoneId === milestone.id);
                const totalForMilestone = linkedInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
                return (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2">{milestone.name || milestone.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'Not set'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${totalForMilestone.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {linkedInvoices.length} invoice(s)
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Alert severity="info">
              No milestones defined. Create milestones to link invoices to specific project deliverables.
            </Alert>
          )}
        </TabPanel>}

        {/* Milestones / Tasks Tab - index adjusts based on whether Invoices tab is shown */}
        <TabPanel value={tabValue} index={isNonprofit ? 6 : 7}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Milestones & Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMilestoneDialog()}
            >
              Add Milestone
            </Button>
          </Box>

          {/* Milestones Progress */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Progress</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {milestones.filter((m: any) => m.status === 'completed').length} / {milestones.length} completed
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={milestones.length > 0 ? (milestones.filter((m: any) => m.status === 'completed').length / milestones.length) * 100 : 0}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>

          {/* Milestones List */}
          {milestones.length > 0 ? (
            <Grid container spacing={2}>
              {milestones.map((milestone: any, index: number) => (
                <Grid item xs={12} key={milestone.id || index}>
                  <Card sx={{ 
                    borderLeft: 4, 
                    borderColor: milestone.status === 'completed' ? 'success.main' : 
                                 milestone.status === 'in_progress' ? 'warning.main' : 'grey.300'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {milestone.status === 'completed' ? (
                              <CheckCircleIcon color="success" />
                            ) : milestone.status === 'in_progress' ? (
                              <PlayIcon color="warning" />
                            ) : (
                              <ScheduleIcon color="disabled" />
                            )}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {milestone.name || milestone.title}
                            </Typography>
                            {milestone.changeHistory?.some((ch: any) => ch.status === 'pending_approval') && (
                              <Chip label="Pending Approval" size="small" color="warning" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {milestone.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip 
                              label={milestone.status?.replace('_', ' ') || 'not started'} 
                              size="small"
                              color={milestone.status === 'completed' ? 'success' : 
                                     milestone.status === 'in_progress' ? 'warning' : 'default'}
                            />
                            {milestone.dueDate && (
                              <Typography variant="caption" color="text.secondary">
                                <CalendarIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </Typography>
                            )}
                            {milestone.assignedTo && (
                              <Typography variant="caption" color="text.secondary">
                                <GroupsIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {milestone.assignedTo}
                              </Typography>
                            )}
                            {milestone.completedAt && (
                              <Typography variant="caption" color="success.main">
                                <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                          {milestone.completionDescription && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Completion Notes:</strong> {milestone.completionDescription}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenMilestoneDialog(milestone)}
                            title="Edit milestone"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {milestone.status !== 'completed' && (
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleMarkMilestoneComplete(milestone)}
                              title="Mark complete"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
                          {milestone.changeHistory?.length > 0 && (
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleViewMilestoneHistory(milestone)}
                              title="View change history"
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            title="Delete milestone"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Tasks under this milestone */}
                      {milestone.tasks && milestone.tasks.length > 0 && (
                        <Box sx={{ mt: 2, pl: 4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Tasks ({milestone.tasks.filter((t: any) => t.completed).length}/{milestone.tasks.length})
                          </Typography>
                          <List dense>
                            {milestone.tasks.map((task: any, taskIndex: number) => (
                              <ListItem key={taskIndex} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  {task.completed ? (
                                    <CheckCircleIcon fontSize="small" color="success" />
                                  ) : (
                                    <ScheduleIcon fontSize="small" color="disabled" />
                                  )}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={task.name || task.title}
                                  primaryTypographyProps={{ 
                                    variant: 'body2',
                                    sx: { textDecoration: task.completed ? 'line-through' : 'none' }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No milestones have been defined for this collaboration. Click "Add Milestone" to create project milestones and track progress.
            </Alert>
          )}

          {/* Quick Add Task */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Quick Add Task</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Enter task description..."
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Assign to Milestone</InputLabel>
                <Select label="Assign to Milestone">
                  {milestones.map((m: any, i: number) => (
                    <MenuItem key={i} value={m.id || i}>{m.name || m.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Task
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Create Form Dialog */}
        <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Additional Form</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Form Name"
              value={newFormName}
              onChange={(e) => setNewFormName(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Form Type</InputLabel>
              <Select
                value={newFormType}
                label="Form Type"
                onChange={(e) => setNewFormType(e.target.value)}
              >
                <MenuItem value="intake">Intake Form</MenuItem>
                <MenuItem value="progress">Progress Report</MenuItem>
                <MenuItem value="assessment">Assessment</MenuItem>
                <MenuItem value="feedback">Feedback Survey</MenuItem>
                <MenuItem value="reporting">Reporting Form</MenuItem>
                <MenuItem value="data">Data Collection</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFormDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateForm} disabled={!newFormName}>
              Create Form
            </Button>
          </DialogActions>
        </Dialog>

        {/* Form View/Edit Dialog */}
        <Dialog 
          open={showFormViewDialog} 
          onClose={() => setShowFormViewDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            {editingForm ? 'Edit Form' : 'View Form'}: {selectedForm?.name}
          </DialogTitle>
          <DialogContent>
            {selectedForm && (
              <Box sx={{ mt: 2 }}>
                {/* Form Name */}
                <TextField
                  fullWidth
                  label="Form Name"
                  value={selectedForm.name || ''}
                  onChange={(e) => setSelectedForm({ ...selectedForm, name: e.target.value })}
                  disabled={!editingForm}
                  sx={{ mb: 2 }}
                />

                {/* Form Description */}
                <TextField
                  fullWidth
                  label="Description"
                  value={selectedForm.description || ''}
                  onChange={(e) => setSelectedForm({ ...selectedForm, description: e.target.value })}
                  disabled={!editingForm}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

                {/* Form Purpose */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Purpose</InputLabel>
                  <Select
                    value={selectedForm.purpose || 'data'}
                    label="Purpose"
                    onChange={(e) => setSelectedForm({ ...selectedForm, purpose: e.target.value })}
                    disabled={!editingForm}
                  >
                    <MenuItem value="intake">Intake</MenuItem>
                    <MenuItem value="tracking">Tracking</MenuItem>
                    <MenuItem value="reporting">Reporting</MenuItem>
                    <MenuItem value="data">Data Collection</MenuItem>
                  </Select>
                </FormControl>

                {/* Form Fields */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Form Fields ({selectedForm.fields?.length || 0})
                </Typography>
                
                {selectedForm.fields?.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Label</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Required</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedForm.fields.map((field: any, index: number) => (
                          <TableRow key={field.id || index}>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>
                              <Chip label={field.type} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              {field.required ? (
                                <Chip label="Required" size="small" color="error" />
                              ) : (
                                <Chip label="Optional" size="small" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No fields defined for this form.</Alert>
                )}

                {/* Frequency if available */}
                {selectedForm.frequency && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Collection Frequency:</strong> {selectedForm.frequency}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFormViewDialog(false)}>
              {editingForm ? 'Cancel' : 'Close'}
            </Button>
            {editingForm ? (
              <Button variant="contained" onClick={handleSaveFormChanges}>
                Save Changes
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => setEditingForm(true)}>
                Edit Form
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Milestone Create/Edit Dialog */}
        <Dialog 
          open={showMilestoneDialog} 
          onClose={() => { setShowMilestoneDialog(false); resetMilestoneForm(); }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Milestone Name"
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={milestoneForm.assignedTo}
                    label="Assigned To"
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, assignedTo: e.target.value })}
                  >
                    {entities.map((entity: any, i: number) => (
                      <MenuItem key={i} value={entity.name}>{entity.name} ({entity.role})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={milestoneForm.status}
                    label="Status"
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                  >
                    <MenuItem value="not_started">Not Started</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {milestoneForm.status === 'completed' && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Completed By</InputLabel>
                      <Select
                        value={milestoneForm.completedBy}
                        label="Completed By"
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, completedBy: e.target.value })}
                      >
                        {entities.map((entity: any, i: number) => (
                          <MenuItem key={i} value={entity.contactEmail || entity.name}>
                            {entity.contactName || entity.name}
                          </MenuItem>
                        ))}
                        <MenuItem value={currentUser?.email || ''}>{currentUser?.email} (Me)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Completion Description"
                      value={milestoneForm.completionDescription}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, completionDescription: e.target.value })}
                      multiline
                      rows={3}
                      placeholder="Describe how this milestone was completed..."
                      helperText="Provide details about the work completed, deliverables, and any relevant notes."
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowMilestoneDialog(false); resetMilestoneForm(); }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveMilestone}
              disabled={!milestoneForm.name}
            >
              {editingMilestone ? 'Save Changes' : 'Create Milestone'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Milestone Change History Dialog */}
        <Dialog
          open={showMilestoneHistory}
          onClose={() => setShowMilestoneHistory(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon />
              Change History: {selectedMilestoneHistory?.name || selectedMilestoneHistory?.title}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedMilestoneHistory?.changeHistory?.length > 0 ? (
              <List>
                {selectedMilestoneHistory.changeHistory.map((change: any, index: number) => (
                  <ListItem 
                    key={change.id || index}
                    sx={{ 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      borderLeft: 3,
                      borderColor: change.status === 'approved' ? 'success.main' : 
                                   change.status === 'rejected' ? 'error.main' : 'warning.main',
                      mb: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {new Date(change.timestamp).toLocaleString()}
                      </Typography>
                      <Chip 
                        label={change.status?.replace('_', ' ')} 
                        size="small"
                        color={change.status === 'approved' ? 'success' : 
                               change.status === 'rejected' ? 'error' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Changed by: {change.changedBy}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Changes:</Typography>
                      <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                        {change.changes?.map((c: string, i: number) => (
                          <li key={i}><Typography variant="body2">{c}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                    {change.status === 'approved' && (
                      <Typography variant="caption" color="success.main">
                        Approved by {change.approvedBy} on {new Date(change.approvedAt).toLocaleString()}
                      </Typography>
                    )}
                    {change.status === 'rejected' && (
                      <Typography variant="caption" color="error.main">
                        Rejected by {change.rejectedBy}: {change.rejectionReason || 'No reason provided'}
                      </Typography>
                    )}
                    {change.status === 'pending_approval' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApproveChange(selectedMilestoneHistory, change.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => {
                            const reason = prompt('Please provide a reason for rejection:');
                            if (reason !== null) {
                              handleRejectChange(selectedMilestoneHistory, change.id, reason);
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No change history available for this milestone.</Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowMilestoneHistory(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Invoice Create/Edit Dialog */}
        <Dialog
          open={showInvoiceDialog}
          onClose={() => { setShowInvoiceDialog(false); resetInvoiceForm(); }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingInvoice ? `Edit Invoice ${editingInvoice.invoiceNumber}` : 'Create New Invoice'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  required
                  placeholder="Describe the services or deliverables being invoiced..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount ($)"
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  required
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Link to Milestone</InputLabel>
                  <Select
                    value={invoiceForm.linkedMilestoneId}
                    label="Link to Milestone"
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, linkedMilestoneId: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {milestones.map((m: any, i: number) => (
                      <MenuItem key={i} value={m.id}>{m.name || m.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Submitted By</InputLabel>
                  <Select
                    value={invoiceForm.submittedBy}
                    label="Submitted By"
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, submittedBy: e.target.value })}
                  >
                    {entities.map((entity: any, i: number) => (
                      <MenuItem key={i} value={entity.contactEmail || entity.name}>
                        {entity.contactName || entity.name}
                      </MenuItem>
                    ))}
                    <MenuItem value={currentUser?.email || ''}>{currentUser?.email} (Me)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Any additional notes or payment instructions..."
                />
              </Grid>
            </Grid>
            
            {/* Bill.com Integration Info */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Bill.com Integration:</strong> After saving, you can submit this invoice to Bill.com for payment processing. 
                The invoice status will be updated automatically when payment is received.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowInvoiceDialog(false); resetInvoiceForm(); }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveInvoice}
              disabled={!invoiceForm.description || !invoiceForm.amount}
            >
              {editingInvoice ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Program Form Dialog */}
        <Dialog 
          open={showProgramDialog} 
          onClose={() => setShowProgramDialog(false)}
          maxWidth="sm"
          fullWidth
          container={() => document.body}
          sx={{
            '& .MuiDialog-container': {
              alignItems: 'flex-start',
              paddingTop: '5vh'
            }
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              marginTop: 0
            }
          }}
        >
          {/* Header */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            color: 'white',
            px: 3,
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SchoolIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Create Program Form
              </Typography>
            </Box>
          </Box>
          
          <DialogContent sx={{ p: 3 }}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '0.875rem' }
              }}
            >
              Program forms create multi-level datasets for tracking data at the instructor, student, and nonprofit levels.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Program Name"
                value={newProgramForm.name}
                onChange={(e) => setNewProgramForm({ ...newProgramForm, name: e.target.value })}
                required
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Description"
                value={newProgramForm.description}
                onChange={(e) => setNewProgramForm({ ...newProgramForm, description: e.target.value })}
                multiline
                rows={2}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Program Type</InputLabel>
                <Select
                  value={newProgramForm.programType}
                  label="Program Type"
                  onChange={(e) => setNewProgramForm({ ...newProgramForm, programType: e.target.value as ProgramType })}
                >
                  <MenuItem value="digital_literacy">Digital Literacy Program</MenuItem>
                  <MenuItem value="health_education">Health Education Program</MenuItem>
                  <MenuItem value="workforce_development">Workforce Development Program</MenuItem>
                  <MenuItem value="community_outreach">Community Outreach Program</MenuItem>
                  <MenuItem value="youth_program">Youth Program</MenuItem>
                  <MenuItem value="senior_services">Senior Services Program</MenuItem>
                  <MenuItem value="custom">Custom Program</MenuItem>
                </Select>
              </FormControl>

              {/* Enable Datasets Section */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Enable Datasets
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Select which datasets to create for this program.
                </Typography>
              </Box>

              {/* Instructor Dataset Toggle */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: newProgramForm.enableInstructorDataset ? '#eff6ff' : '#f9fafb',
                  border: '1px solid',
                  borderColor: newProgramForm.enableInstructorDataset ? '#3b82f6' : '#e5e7eb',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#3b82f6' }
                }}
                onClick={() => setNewProgramForm({ ...newProgramForm, enableInstructorDataset: !newProgramForm.enableInstructorDataset })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#3b82f6', width: 36, height: 36, fontSize: '0.875rem' }}>I</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Instructor Dataset
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Track instructor info, certifications, classes taught
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={newProgramForm.enableInstructorDataset ? 'Enabled' : 'Disabled'} 
                  size="small"
                  sx={{ 
                    bgcolor: newProgramForm.enableInstructorDataset ? '#3b82f6' : '#e5e7eb',
                    color: newProgramForm.enableInstructorDataset ? 'white' : '#6b7280',
                    fontWeight: 500
                  }}
                />
              </Paper>

              {/* Student Dataset Toggle */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: newProgramForm.enableStudentDataset ? '#f0fdf4' : '#f9fafb',
                  border: '1px solid',
                  borderColor: newProgramForm.enableStudentDataset ? '#22c55e' : '#e5e7eb',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#22c55e' }
                }}
                onClick={() => setNewProgramForm({ ...newProgramForm, enableStudentDataset: !newProgramForm.enableStudentDataset })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#22c55e', width: 36, height: 36, fontSize: '0.875rem' }}>S</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Student Dataset
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Track enrollment, progress, completion, satisfaction
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={newProgramForm.enableStudentDataset ? 'Enabled' : 'Disabled'} 
                  size="small"
                  sx={{ 
                    bgcolor: newProgramForm.enableStudentDataset ? '#22c55e' : '#e5e7eb',
                    color: newProgramForm.enableStudentDataset ? 'white' : '#6b7280',
                    fontWeight: 500
                  }}
                />
              </Paper>

              {/* Nonprofit Dataset Toggle */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: newProgramForm.enableNonprofitDataset ? '#fefce8' : '#f9fafb',
                  border: '1px solid',
                  borderColor: newProgramForm.enableNonprofitDataset ? '#f59e0b' : '#e5e7eb',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#f59e0b' }
                }}
                onClick={() => setNewProgramForm({ ...newProgramForm, enableNonprofitDataset: !newProgramForm.enableNonprofitDataset })}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#f59e0b', width: 36, height: 36, fontSize: '0.875rem' }}>N</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Nonprofit Dataset
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Aggregate reporting with totals, metrics, outcomes
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={newProgramForm.enableNonprofitDataset ? 'Enabled' : 'Disabled'} 
                  size="small"
                  sx={{ 
                    bgcolor: newProgramForm.enableNonprofitDataset ? '#f59e0b' : '#e5e7eb',
                    color: newProgramForm.enableNonprofitDataset ? 'white' : '#6b7280',
                    fontWeight: 500
                  }}
                />
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setShowProgramDialog(false)} sx={{ color: '#6b7280' }}>Cancel</Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleCreateProgramForm}
              disabled={!newProgramForm.name || (!newProgramForm.enableInstructorDataset && !newProgramForm.enableStudentDataset && !newProgramForm.enableNonprofitDataset)}
            >
              Create Program
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Program Details Dialog - Rendered via Portal */}
        {typeof document !== 'undefined' && createPortal(
          <Dialog 
            open={showProgramViewDialog} 
            onClose={() => setShowProgramViewDialog(false)}
            maxWidth="lg"
            fullWidth
          >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="secondary" />
                {selectedProgram?.name}
              </Box>
              <IconButton onClick={() => setShowProgramViewDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedProgram && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {selectedProgram.description}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showMockData}
                        onChange={(e) => handleToggleMockData(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label="Show Mock Data"
                  />
                </Box>

                {/* Apple-styled Tools & Forms Section */}
                <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-[#D2D2D7] bg-[#F5F5F7]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#5856D6] rounded-xl flex items-center justify-center">
                        <SchoolIcon sx={{ color: 'white', fontSize: 22 }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1D1D1F]">Program Tools & Forms</h3>
                        <p className="text-sm text-[#6E6E73]">Quick access to student and instructor tools</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Student Tools */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">📱</span>
                          <span className="text-sm font-semibold text-[#34C759]">For Students</span>
                        </div>
                        <div className="space-y-2">
                          <button 
                            onClick={() => window.open('/checkin/class1?location=moore', '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <QrCodeIcon sx={{ fontSize: 20, color: '#34C759' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#34C759]">QR Code Attendance Check-in</span>
                          </button>
                          <button 
                            onClick={() => window.open('/progress/demo-student', '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <CheckCircleIcon sx={{ fontSize: 20, color: '#34C759' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#34C759]">Progress Tracking (10 Units)</span>
                          </button>
                          <button 
                            onClick={() => window.open('/forms/feedback', '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <FeedbackIcon sx={{ fontSize: 20, color: '#34C759' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#34C759]">Participant Feedback Form</span>
                          </button>
                        </div>
                      </div>

                      {/* Instructor Tools */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">👨‍🏫</span>
                          <span className="text-sm font-semibold text-[#0071E3]">For Instructors</span>
                        </div>
                        <div className="space-y-2">
                          <button 
                            onClick={() => window.open('/forms/digital-literacy', '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <GroupsIcon sx={{ fontSize: 20, color: '#0071E3' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#0071E3]">Student Registration (Bilingual)</span>
                          </button>
                          <button 
                            onClick={() => {/* TODO: Open QR Generator modal */}}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <QrCodeIcon sx={{ fontSize: 20, color: '#0071E3' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#0071E3]">Generate Class QR Codes</span>
                          </button>
                          <button 
                            onClick={() => window.open('/forms/withdrawal', '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <ExitToAppIcon sx={{ fontSize: 20, color: '#0071E3' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#0071E3]">Withdrawal Tracking</span>
                          </button>
                          <button 
                            onClick={() => window.open('/forms/asset-tracking', '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F7] rounded-xl text-left hover:bg-[#E5E5EA] transition-colors group"
                          >
                            <ComputerIcon sx={{ fontSize: 20, color: '#0071E3' }} />
                            <span className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#0071E3]">Computer Asset Tracking</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Grid container spacing={3}>
                  {/* Instructor Dataset Details */}
                  {selectedProgram.datasets.instructor.enabled && (
                    <Grid item xs={12}>
                      <Card>
                        <CardHeader
                          avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>I</Avatar>}
                          title="Instructor Dataset"
                          subheader={selectedProgram.datasets.instructor.description}
                          action={
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleNavigateToDataset(selectedProgram, 'instructor')}
                            >
                              View Data
                            </Button>
                          }
                        />
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Fields ({selectedProgram.datasets.instructor.fields.length})</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {selectedProgram.datasets.instructor.fields.map((field) => (
                              <Chip 
                                key={field.id} 
                                label={field.label} 
                                size="small" 
                                variant="outlined"
                                color={field.required ? 'primary' : 'default'}
                              />
                            ))}
                          </Box>
                          
                          {/* Mock Data Table */}
                          {showMockData && mockInstructorData.length > 0 && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.main' }}>
                                Sample Data ({mockInstructorData.length} records)
                              </Typography>
                              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell><strong>ID</strong></TableCell>
                                      <TableCell><strong>Name</strong></TableCell>
                                      <TableCell><strong>Organization</strong></TableCell>
                                      <TableCell><strong>Status</strong></TableCell>
                                      <TableCell><strong>Classes</strong></TableCell>
                                      <TableCell><strong>Students</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {mockInstructorData.map((row, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{row.instructor_id}</TableCell>
                                        <TableCell>{row.instructor_name}</TableCell>
                                        <TableCell>{row.organization}</TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={row.certification_status} 
                                            size="small" 
                                            color={row.certification_status === 'Certified' ? 'success' : 'default'}
                                          />
                                        </TableCell>
                                        <TableCell>{row.classes_taught}</TableCell>
                                        <TableCell>{row.students_trained}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Student Dataset Details */}
                  {selectedProgram.datasets.student.enabled && (
                    <Grid item xs={12}>
                      <Card>
                        <CardHeader
                          avatar={<Avatar sx={{ bgcolor: 'success.main' }}>S</Avatar>}
                          title="Student Dataset"
                          subheader={selectedProgram.datasets.student.description}
                          action={
                            <Button 
                              variant="contained" 
                              size="small"
                              color="success"
                              onClick={() => handleNavigateToDataset(selectedProgram, 'student')}
                            >
                              View Data
                            </Button>
                          }
                        />
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Fields ({selectedProgram.datasets.student.fields.length})</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {selectedProgram.datasets.student.fields.map((field) => (
                              <Chip 
                                key={field.id} 
                                label={field.label} 
                                size="small" 
                                variant="outlined"
                                color={field.required ? 'success' : 'default'}
                              />
                            ))}
                          </Box>
                          
                          {/* Mock Data Table */}
                          {showMockData && mockStudentData.length > 0 && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.main' }}>
                                Sample Data ({mockStudentData.length} records)
                              </Typography>
                              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell><strong>ID</strong></TableCell>
                                      <TableCell><strong>Name</strong></TableCell>
                                      <TableCell><strong>Status</strong></TableCell>
                                      <TableCell><strong>Pre-Score</strong></TableCell>
                                      <TableCell><strong>Post-Score</strong></TableCell>
                                      <TableCell><strong>Modules</strong></TableCell>
                                      <TableCell><strong>Hours</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {mockStudentData.map((row, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{row.student_id}</TableCell>
                                        <TableCell>{row.student_name}</TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={row.status} 
                                            size="small" 
                                            color={
                                              row.status === 'Completed' ? 'success' : 
                                              row.status === 'In Progress' ? 'info' : 
                                              row.status === 'Dropped' ? 'error' : 'default'
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>{row.pre_assessment_score}</TableCell>
                                        <TableCell>{row.post_assessment_score || '-'}</TableCell>
                                        <TableCell>{row.modules_completed}/8</TableCell>
                                        <TableCell>{row.hours_completed}h</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Nonprofit Dataset Details */}
                  {selectedProgram.datasets.nonprofit.enabled && (
                    <Grid item xs={12}>
                      <Card>
                        <CardHeader
                          avatar={<Avatar sx={{ bgcolor: 'warning.main' }}>N</Avatar>}
                          title="Nonprofit Dataset"
                          subheader={selectedProgram.datasets.nonprofit.description}
                          action={
                            <Button 
                              variant="contained" 
                              size="small"
                              color="warning"
                              onClick={() => handleNavigateToDataset(selectedProgram, 'nonprofit')}
                            >
                              View Data
                            </Button>
                          }
                        />
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Fields ({selectedProgram.datasets.nonprofit.fields.length})</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {selectedProgram.datasets.nonprofit.fields.map((field) => (
                              <Chip 
                                key={field.id} 
                                label={field.label} 
                                size="small" 
                                variant="outlined"
                                color={field.required ? 'warning' : 'default'}
                              />
                            ))}
                          </Box>
                          
                          {/* Mock Data Table */}
                          {showMockData && mockNonprofitData.length > 0 && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.main' }}>
                                Sample Data ({mockNonprofitData.length} records)
                              </Typography>
                              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell><strong>Organization</strong></TableCell>
                                      <TableCell><strong>Period</strong></TableCell>
                                      <TableCell><strong>Instructors</strong></TableCell>
                                      <TableCell><strong>Enrolled</strong></TableCell>
                                      <TableCell><strong>Completed</strong></TableCell>
                                      <TableCell><strong>Classes</strong></TableCell>
                                      <TableCell><strong>Satisfaction</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {mockNonprofitData.map((row, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{row.nonprofit_name}</TableCell>
                                        <TableCell>
                                          <Chip label={row.reporting_period} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{row.total_instructors}</TableCell>
                                        <TableCell>{row.total_students_enrolled}</TableCell>
                                        <TableCell>{row.total_students_completed}</TableCell>
                                        <TableCell>{row.total_classes_held}</TableCell>
                                        <TableCell>{row.avg_satisfaction_score}/5</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProgramViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>,
          document.body
        )}
      </Box>
    </AdminLayout>
  );
}

export default function CollaborationDetailPage() {
  return (
    <AuthProvider>
      <CollaborationDetailContent />
    </AuthProvider>
  );
}
