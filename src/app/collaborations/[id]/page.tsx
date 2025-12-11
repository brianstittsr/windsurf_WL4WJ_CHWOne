'use client';

import React, { useState, useEffect } from 'react';
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
  Payment as PaymentIcon
} from '@mui/icons-material';
import UnifiedLayout from '@/components/Layout/UnifiedLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Grant } from '@/lib/schema/unified-schema';

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
  const { currentUser, loading: authLoading } = useAuth();
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
    const budget = (grant as any)?.budget || 0;
    return { totalInvoiced, totalPaid, remaining: budget - totalInvoiced };
  };

  if (authLoading || loading) {
    return <AnimatedLoading message="Loading Collaboration..." />;
  }

  if (!currentUser) {
    return null;
  }

  if (!grant) {
    return (
      <UnifiedLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error">Collaboration not found</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/collaborations')} sx={{ mt: 2 }}>
            Back to Collaborations
          </Button>
        </Box>
      </UnifiedLayout>
    );
  }

  const progress = calculateProgress();
  const progressStatus = getProgressStatus(progress);
  const entities = (grant as any).collaboratingEntities || [];
  const milestones = (grant as any).projectMilestones || [];
  const dataCollectionMethods = (grant as any).dataCollectionMethods || [];
  const formTemplates = (grant as any).formTemplates || [];

  return (
    <UnifiedLayout>
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
          </CardContent>
        </Card>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Documents" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="Forms & Data" icon={<FormIcon />} iconPosition="start" />
            <Tab label="Datasets" icon={<DatasetIcon />} iconPosition="start" />
            <Tab label="AI Reports" icon={<AIIcon />} iconPosition="start" />
            <Tab label="Partners" icon={<GroupsIcon />} iconPosition="start" />
            <Tab label="Billing / Invoices" icon={<ReceiptIcon />} iconPosition="start" />
            <Tab label="Milestones / Tasks" icon={<TaskIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Original Grant Document" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The original grant document that was uploaded and analyzed.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExportDocument('original')}
                    >
                      Download Original
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="AI Analyzed Grant Document" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The structured data extracted by AI from the grant document.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExportDocument('analyzed')}
                    >
                      Download Analyzed
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Forms & Data Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Data Collection Forms</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FormIcon />}
                onClick={handleGenerateParticipantForm}
              >
                Generate Participant Tracking Form
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowFormDialog(true)}
              >
                Create Additional Form
              </Button>
            </Box>
          </Box>

          {formTemplates.length > 0 ? (
            <Grid container spacing={2}>
              {formTemplates.map((form: any, index: number) => (
                <Grid item xs={12} md={6} key={form.id || index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {form.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {form.description || 'No description'}
                          </Typography>
                        </Box>
                        <Chip label={form.purpose || 'data'} size="small" />
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => handleViewForm(form)}>View Form</Button>
                        <Button size="small" variant="outlined" onClick={() => handleEditForm(form)}>Edit</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No forms have been created yet. Use the buttons above to generate forms for this collaboration.
            </Alert>
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

        {/* Datasets Tab */}
        <TabPanel value={tabValue} index={2}>
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
        <TabPanel value={tabValue} index={3}>
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
        <TabPanel value={tabValue} index={4}>
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

        {/* Billing / Invoices Tab */}
        <TabPanel value={tabValue} index={5}>
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
        </TabPanel>

        {/* Milestones / Tasks Tab */}
        <TabPanel value={tabValue} index={6}>
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
      </Box>
    </UnifiedLayout>
  );
}

export default function CollaborationDetailPage() {
  return (
    <AuthProvider>
      <CollaborationDetailContent />
    </AuthProvider>
  );
}
