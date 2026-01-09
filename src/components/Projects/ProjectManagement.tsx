'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  CircularProgress,
  LinearProgress,
  Fab,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ProjectAttachments from './ProjectAttachments';
import ProjectReports from './ProjectReports';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { Project, ProjectStatus, ProjectOutcome, Grant, GrantStatus } from '@/types/platform.types';

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grantId: '',
    status: ProjectStatus.PLANNING,
    startDate: '',
    endDate: '',
    targetPopulation: '',
    goals: '',
    budget: 0,
    assignedCHWs: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch projects from Firebase
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, orderBy('createdAt', 'desc'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          grantId: data.grantId || undefined,
          status: data.status || ProjectStatus.PLANNING,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : (data.endDate ? new Date(data.endDate) : undefined),
          targetPopulation: data.targetPopulation || '',
          goals: data.goals || [],
          budget: data.budget || 0,
          spentAmount: data.spentAmount || 0,
          assignedCHWs: data.assignedCHWs || [],
          outcomes: data.outcomes || [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
        } as Project;
      });
      setProjects(projectsData);

      // Fetch grants from Firebase
      const grantsRef = collection(db, 'grants');
      const grantsQuery = query(grantsRef, orderBy('createdAt', 'desc'));
      const grantsSnapshot = await getDocs(grantsQuery);
      const grantsData = grantsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          amount: data.amount || 0,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
          description: data.description || '',
          fundingSource: data.fundingSource || '',
          status: data.status || GrantStatus.ACTIVE,
          projectIds: data.projectIds || [],
          requirements: data.requirements || [],
          reportingSchedule: data.reportingSchedule || [],
          contactPerson: data.contactPerson || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date()
        } as Grant;
      });
      setGrants(grantsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        grantId: formData.grantId || undefined,
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        targetPopulation: formData.targetPopulation,
        goals: formData.goals.split(',').map(g => g.trim()).filter(g => g),
        budget: formData.budget,
        spentAmount: selectedProject?.spentAmount || 0,
        assignedCHWs: formData.assignedCHWs,
        outcomes: selectedProject?.outcomes || [],
        updatedAt: new Date()
      };

      if (selectedProject) {
        // Update existing project in Firebase
        const projectRef = doc(db, 'projects', selectedProject.id);
        await updateDoc(projectRef, projectData);
        
        // Update local state
        setProjects(prev => prev.map(p => 
          p.id === selectedProject.id 
            ? { ...p, ...projectData, id: selectedProject.id } as Project
            : p
        ));
      } else {
        // Create new project in Firebase
        const projectsRef = collection(db, 'projects');
        const newProjectData = {
          ...projectData,
          createdAt: new Date()
        };
        const docRef = await addDoc(projectsRef, newProjectData);
        
        // Add to local state
        const newProject: Project = {
          ...newProjectData,
          id: docRef.id,
          startDate: new Date(formData.startDate),
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          createdAt: new Date(),
          outcomes: []
        };
        setProjects(prev => [newProject, ...prev]);
      }

      setShowModal(false);
      setSelectedProject(null);
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      grantId: '',
      status: ProjectStatus.PLANNING,
      startDate: '',
      endDate: '',
      targetPopulation: '',
      goals: '',
      budget: 0,
      assignedCHWs: []
    });
  };
  
  const handleViewProject = (project: Project) => {
    setViewingProject(project);
    setShowDetailsDialog(true);
  };

  const editProject = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      grantId: project.grantId || '',
      status: project.status,
      startDate: project.startDate.toISOString().split('T')[0],
      endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
      targetPopulation: project.targetPopulation,
      goals: project.goals.join(', '),
      budget: project.budget,
      assignedCHWs: project.assignedCHWs
    });
    setShowModal(true);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'success';
      case ProjectStatus.PLANNING: return 'info';
      case ProjectStatus.ON_HOLD: return 'warning';
      case ProjectStatus.COMPLETED: return 'primary';
      case ProjectStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const calculateProgress = (project: Project) => {
    if (!project.endDate) return 0;
    const total = project.endDate.getTime() - project.startDate.getTime();
    const elapsed = Date.now() - project.startDate.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getBudgetUtilization = (project: Project) => {
    return project.budget > 0 ? (project.spentAmount / project.budget) * 100 : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Project Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage community health projects and track outcomes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          New Project
        </Button>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {projects.filter(p => p.status === ProjectStatus.ACTIVE).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {projects.filter(p => p.status === ProjectStatus.COMPLETED).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {projects.filter(p => p.grantId).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grant-Funded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Project Portfolio
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Grant</TableCell>
                  <TableCell>Timeline</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>CHWs</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => {
                  const grant = grants.find(g => g.id === project.grantId);
                  const progress = calculateProgress(project);
                  const budgetUtilization = getBudgetUtilization(project);

                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {project.targetPopulation}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status.replace(/_/g, ' ')}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {grant ? (
                          <Box>
                            <Typography variant="body2">{grant.title}</Typography>
                            <Chip
                              label={`$${grant.amount.toLocaleString()}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No grant
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">
                              {project.startDate.toLocaleDateString()}
                            </Typography>
                            {project.endDate && (
                              <Typography variant="body2" color="text.secondary">
                                to {project.endDate.toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${project.budget.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Spent: ${project.spentAmount.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(budgetUtilization, 100)}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                            color={budgetUtilization > 90 ? 'error' : budgetUtilization > 75 ? 'warning' : 'success'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 35 }}>
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.assignedCHWs.length}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => editProject(project)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<TimelineIcon />}
                            onClick={() => handleViewProject(project)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Project Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject ? 'Edit Project' : 'New Project'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as ProjectStatus})}
                >
                  {Object.values(ProjectStatus).map(status => (
                    <MenuItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Associated Grant"
                  value={formData.grantId}
                  onChange={(e) => setFormData({...formData, grantId: e.target.value})}
                >
                  <MenuItem value="">No grant association</MenuItem>
                  {grants.map(grant => (
                    <MenuItem key={grant.id} value={grant.id}>
                      {grant.title} (${grant.amount.toLocaleString()})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Population"
                  value={formData.targetPopulation}
                  onChange={(e) => setFormData({...formData, targetPopulation: e.target.value})}
                  placeholder="e.g., Low-income families, Seniors, etc."
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date (Optional)"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Budget"
                  value={formData.budget.toString()}
                  onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Project Goals (comma-separated)"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="e.g., Improve health outcomes, Increase access to care, Reduce hospitalizations"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedProject ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowModal(true)}
      >
        <AddIcon />
      </Fab>
      
      {/* Project Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        {viewingProject && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{viewingProject.name}</Typography>
                <Chip
                  label={viewingProject.status.replace(/_/g, ' ')}
                  color={getStatusColor(viewingProject.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>Description</Typography>
                <Typography variant="body1">{viewingProject.description}</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Project Details</Typography>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Target Population" 
                            secondary={viewingProject.targetPopulation} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Timeline" 
                            secondary={`${viewingProject.startDate.toLocaleDateString()} to ${viewingProject.endDate ? viewingProject.endDate.toLocaleDateString() : 'Ongoing'}`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Budget" 
                            secondary={`$${viewingProject.budget.toLocaleString()} (Spent: $${viewingProject.spentAmount.toLocaleString()})`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Goals" 
                            secondary={
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {viewingProject.goals.map((goal, index) => (
                                  <Chip key={index} label={goal} size="small" />
                                ))}
                              </Box>
                            } 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {/* Project Outcomes */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Project Outcomes</Typography>
                      {viewingProject.outcomes && viewingProject.outcomes.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Metric</TableCell>
                                <TableCell align="right">Target</TableCell>
                                <TableCell align="right">Current</TableCell>
                                <TableCell align="right">Progress</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {viewingProject.outcomes.map((outcome, index) => (
                                <TableRow key={index}>
                                  <TableCell>{outcome.metric}</TableCell>
                                  <TableCell align="right">{outcome.target} {outcome.unit}</TableCell>
                                  <TableCell align="right">{outcome.current} {outcome.unit}</TableCell>
                                  <TableCell align="right">
                                    <LinearProgress
                                      variant="determinate"
                                      value={Math.min((outcome.current / outcome.target) * 100, 100)}
                                      sx={{ height: 8, borderRadius: 4 }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography color="text.secondary">No outcomes recorded yet</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Project Attachments */}
                <Grid item xs={12}>
                  <ProjectAttachments 
                    project={viewingProject} 
                    onUpdateProject={(updatedProject) => {
                      // Update the project in the projects array
                      const updatedProjects = projects.map(p => 
                        p.id === updatedProject.id ? updatedProject : p
                      );
                      setProjects(updatedProjects);
                      setViewingProject(updatedProject);
                    }} 
                  />
                </Grid>
                
                {/* Project Reports */}
                <Grid item xs={12}>
                  <ProjectReports 
                    project={viewingProject} 
                    onUpdateProject={(updatedProject) => {
                      // Update the project in the projects array
                      const updatedProjects = projects.map(p => 
                        p.id === updatedProject.id ? updatedProject : p
                      );
                      setProjects(updatedProjects);
                      setViewingProject(updatedProject);
                    }} 
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setShowDetailsDialog(false);
                  editProject(viewingProject);
                }}
              >
                Edit Project
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
