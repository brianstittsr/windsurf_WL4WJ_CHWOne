'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon, 
  Assignment as AssignmentIcon,
  GroupWork as GroupWorkIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useGrantWizard } from '@/contexts/GrantWizardContext';

export function Step5Review() {
  const { grantData, updateGrantData } = useGrantWizard();
  const [relationshipNotes, setRelationshipNotes] = useState(grantData.entityRelationshipNotes || '');
  interface Recommendation {
    id: string;
    area: string;
    description: string;
    priority: string;
    steps: string[];
  }

  interface Risk {
    id: number;
    area: string;
    description: string;
    mitigation: string;
    impact: string;
  }

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [risks, setRisks] = useState<Risk[]>([
    { id: 1, area: 'Timeline', description: 'Potential delays in curriculum development', mitigation: 'Begin development early, establish clear milestones', impact: 'medium' },
    { id: 2, area: 'Budget', description: 'Unexpected training material costs', mitigation: 'Establish contingency budget, explore digital alternatives', impact: 'low' },
    { id: 3, area: 'Coordination', description: 'Communication challenges between entities', mitigation: 'Implement regular status meetings and shared project management tool', impact: 'high' },
  ]);

  // Save relationship notes to grant data
  useEffect(() => {
    if (relationshipNotes !== grantData.entityRelationshipNotes) {
      const debounce = setTimeout(() => {
        updateGrantData({ entityRelationshipNotes: relationshipNotes });
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [relationshipNotes, updateGrantData, grantData.entityRelationshipNotes]);

  // Generate recommendations based on grant data
  useEffect(() => {
    const generatedRecommendations: Recommendation[] = [];
    
    // Check if there are multiple entities and add governance recommendation
    if ((grantData.collaboratingEntities?.length || 0) > 1) {
      generatedRecommendations.push({
        id: 'rec-gov',
        area: 'Governance',
        description: 'Establish a joint steering committee with representatives from all collaborating entities',
        priority: 'high',
        steps: ['Identify key representatives', 'Define governance structure', 'Establish meeting cadence', 'Document decision-making protocols']
      });
    }
    
    // Add data sharing recommendation
    if ((grantData.dataCollectionMethods?.length || 0) > 0) {
      generatedRecommendations.push({
        id: 'rec-data',
        area: 'Data Collection',
        description: 'Implement a centralized data repository accessible to all authorized stakeholders',
        priority: 'medium',
        steps: ['Select appropriate platform', 'Define access controls', 'Establish data standards', 'Create training materials for data entry']
      });
    }
    
    // Add milestone tracking recommendation
    if ((grantData.projectMilestones?.length || 0) > 0) {
      generatedRecommendations.push({
        id: 'rec-timeline',
        area: 'Project Management',
        description: 'Implement monthly progress reviews with stakeholders from both entities',
        priority: 'medium',
        steps: ['Create reporting template', 'Schedule recurring meetings', 'Identify key metrics to track', 'Establish escalation process for delays']
      });
    }
    
    setRecommendations(generatedRecommendations);
  }, [grantData]);
  
  // Functions to generate project plan components
  const renderCollaborationModel = () => {
    const entities = grantData.collaboratingEntities || [];
    if (entities.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No collaborating entities defined. Add entities in the "Entity Details" tab.
        </Alert>
      );
    }
    
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Entity</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Key Responsibilities</strong></TableCell>
              <TableCell><strong>Primary Contact</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>{entity.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={entity.role.replace('_', ' ')} 
                    size="small" 
                    color={entity.role === 'lead' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {entity.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  {entity.contactName}<br />
                  <Typography variant="caption" color="text.secondary">
                    {entity.contactEmail}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  const renderDataCollectionPlan = () => {
    const methods = grantData.dataCollectionMethods || [];
    if (methods.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No data collection methods defined. Add methods in the "Data Collection" tab.
        </Alert>
      );
    }
    
    return (
      <Box>
        {methods.map((method) => (
          <Accordion key={method.id} variant="outlined" defaultExpanded={false} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">{method.name}</Typography>
                <Chip 
                  size="small" 
                  label={`${method.frequency} collection`} 
                  color="primary" 
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    {method.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Data Points:</Typography>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {method.dataPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Tools:</Typography>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {method.tools.map((tool, i) => (
                      <li key={i}>{tool}</li>
                    ))}
                  </ul>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Responsible Entity: {method.responsibleEntity}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };
  
  const renderProjectTimeline = () => {
    const milestones = grantData.projectMilestones || [];
    if (milestones.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No project milestones defined. Add milestones in the "Project Planning" tab.
        </Alert>
      );
    }
    
    // Sort milestones by due date
    const sortedMilestones = [...milestones].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Milestone</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Responsible Parties</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMilestones.map((milestone) => (
              <TableRow key={milestone.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {milestone.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {milestone.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={milestone.status.replace('_', ' ')} 
                    size="small" 
                    color={
                      milestone.status === 'completed' ? 'success' : 
                      milestone.status === 'in_progress' ? 'primary' : 
                      milestone.status === 'delayed' ? 'error' : 
                      'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {milestone.responsibleParties.join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  const renderImplementationRecommendations = () => {
    if (recommendations.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          No recommendations available. Complete previous steps to generate recommendations.
        </Alert>
      );
    }
    
    return recommendations.map((rec) => (
      <Paper key={rec.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <LightbulbIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {rec.area}
              </Typography>
              <Chip 
                size="small" 
                label={rec.priority} 
                color={
                  rec.priority === 'high' ? 'error' : 
                  rec.priority === 'medium' ? 'warning' : 
                  'info'
                }
                sx={{ ml: 2 }}
              />
            </Box>
            <Typography variant="body2" paragraph>
              {rec.description}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>Implementation Steps:</Typography>
            <List dense sx={{ pl: 2 }}>
              {rec.steps.map((step, i) => (
                <ListItem key={i} sx={{ p: 0, pb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Paper>
    ));
  };
  
  const renderRiskAssessment = () => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Risk Area</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Impact</strong></TableCell>
              <TableCell><strong>Mitigation Strategy</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {risks.map((risk) => (
              <TableRow key={risk.id}>
                <TableCell>{risk.area}</TableCell>
                <TableCell>{risk.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={risk.impact} 
                    size="small" 
                    color={
                      risk.impact === 'high' ? 'error' : 
                      risk.impact === 'medium' ? 'warning' : 
                      'default'
                    }
                  />
                </TableCell>
                <TableCell>{risk.mitigation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>Analysis Complete</AlertTitle>
        Based on your inputs, we've generated a comprehensive project management plan for the collaboration between the grant entities.
      </Alert>
      
      {/* Entity Relationship Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupWorkIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6">Entity Collaboration Model</Typography>
        </Box>
        {renderCollaborationModel()}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Relationship Notes:</Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            placeholder="Describe the working relationship between entities..."
            value={relationshipNotes}
            onChange={(e) => setRelationshipNotes(e.target.value)}
            sx={{ mb: 1 }}
          />
        </Box>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Data Collection Plan */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BarChartIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6">Data Collection Plan</Typography>
        </Box>
        {renderDataCollectionPlan()}
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Project Timeline */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimelineIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6">Project Timeline & Milestones</Typography>
        </Box>
        {renderProjectTimeline()}
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Risk Assessment */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon sx={{ mr: 1.5, color: 'warning.main' }} />
          <Typography variant="h6">Risk Assessment & Mitigation</Typography>
        </Box>
        {renderRiskAssessment()}
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Implementation Recommendations */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6">Implementation Recommendations</Typography>
        </Box>
        {renderImplementationRecommendations()}
      </Box>
    </Box>
  );
}
