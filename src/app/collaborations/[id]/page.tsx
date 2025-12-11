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
  Edit as EditIcon
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
              onClick={() => {/* TODO: Add invoice creation */}}
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
                    $0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Invoiced</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    $0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Paid</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    ${(grant as any).budget?.toLocaleString() || '0'}
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
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No invoices have been created yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Payment Schedule */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>Payment Schedule</Typography>
          <Alert severity="info">
            Payment schedule will be displayed here based on grant terms and milestones.
          </Alert>
        </TabPanel>

        {/* Milestones / Tasks Tab */}
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Milestones & Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* TODO: Add milestone creation */}}
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
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {milestone.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip 
                              label={milestone.status?.replace('_', ' ') || 'pending'} 
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
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" title="Edit milestone">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {milestone.status !== 'completed' && (
                            <IconButton size="small" color="success" title="Mark complete">
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
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
