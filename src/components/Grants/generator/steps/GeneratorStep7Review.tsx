'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Target, 
  Users, 
  BarChart3, 
  DollarSign, 
  Download, 
  FileDown, 
  ChevronDown,
  Sparkles,
  Save,
  Eye
} from 'lucide-react';
import { useGrantGenerator } from '@/contexts/GrantGeneratorContext';
import { useRouter } from 'next/navigation';

export function GeneratorStep7Review() {
  const { proposalData } = useGrantGenerator();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<string>('');

  const getCompletionStatus = () => {
    const checks = {
      overview: !!(proposalData.organizationName && proposalData.projectTitle && proposalData.fundingAmount),
      need: !!(proposalData.problemStatement && proposalData.targetPopulation),
      goals: (proposalData.goals || []).length > 0,
      activities: (proposalData.activities || []).length > 0,
      outcomes: (proposalData.outcomes || []).length > 0,
      budget: (proposalData.budgetItems || []).length > 0
    };

    const completed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return { checks, completed, total, percentage: (completed / total) * 100 };
  };

  const status = getCompletionStatus();

  // Generate the full proposal text
  const generateProposalText = () => {
    const sections: string[] = [];
    
    // Title and Organization
    sections.push(`GRANT PROPOSAL`);
    sections.push(`${'='.repeat(60)}`);
    sections.push(`\nProject Title: ${proposalData.projectTitle || 'Untitled Project'}`);
    sections.push(`Organization: ${proposalData.organizationName || 'Not specified'}`);
    sections.push(`Target Funder: ${proposalData.targetFunder || 'Not specified'}`);
    sections.push(`Funding Requested: $${(proposalData.fundingAmount || 0).toLocaleString()}`);
    sections.push(`Project Duration: ${proposalData.projectDuration || 'Not specified'}`);
    sections.push(`\n${'='.repeat(60)}`);
    
    // Executive Summary
    if ((proposalData as any).executiveSummary) {
      sections.push(`\nEXECUTIVE SUMMARY`);
      sections.push(`${'-'.repeat(40)}`);
      sections.push((proposalData as any).executiveSummary);
    }
    
    // Statement of Need
    sections.push(`\nSTATEMENT OF NEED`);
    sections.push(`${'-'.repeat(40)}`);
    if (proposalData.problemStatement) {
      sections.push(`\nProblem Statement:`);
      sections.push(proposalData.problemStatement);
    }
    if (proposalData.communityNeed) {
      sections.push(`\nCommunity Need:`);
      sections.push(proposalData.communityNeed);
    }
    if (proposalData.targetPopulation) {
      sections.push(`\nTarget Population:`);
      sections.push(proposalData.targetPopulation);
    }
    if (proposalData.geographicArea) {
      sections.push(`\nGeographic Area:`);
      sections.push(proposalData.geographicArea);
    }
    if ((proposalData as any).supportingData && (proposalData as any).supportingData.length > 0) {
      sections.push(`\nSupporting Data & Statistics:`);
      ((proposalData as any).supportingData || []).forEach((data: string, i: number) => {
        sections.push(`  ${i + 1}. ${data}`);
      });
    }
    
    // Goals & Objectives
    sections.push(`\nGOALS & OBJECTIVES`);
    sections.push(`${'-'.repeat(40)}`);
    (proposalData.goals || []).forEach((goal: any, i: number) => {
      sections.push(`\nGoal ${i + 1}: ${goal.goal}`);
      if (goal.objectives && goal.objectives.length > 0) {
        goal.objectives.forEach((obj: string, j: number) => {
          sections.push(`  Objective ${i + 1}.${j + 1}: ${obj}`);
        });
      }
    });
    
    // Activities & Methods
    sections.push(`\nACTIVITIES & METHODS`);
    sections.push(`${'-'.repeat(40)}`);
    (proposalData.activities || []).forEach((activity: any, i: number) => {
      sections.push(`\n${i + 1}. ${activity.activity || activity.title || 'Activity'}`);
      if (activity.description) sections.push(`   Description: ${activity.description}`);
      if (activity.timeline) sections.push(`   Timeline: ${activity.timeline}`);
      if (activity.responsible) sections.push(`   Responsible: ${activity.responsible}`);
      if (activity.participants) sections.push(`   Participants: ${activity.participants}`);
    });
    if ((proposalData as any).implementationPlan) {
      sections.push(`\nImplementation Plan:`);
      sections.push((proposalData as any).implementationPlan);
    }
    
    // Outcomes & Evaluation
    sections.push(`\nOUTCOMES & EVALUATION`);
    sections.push(`${'-'.repeat(40)}`);
    (proposalData.outcomes || []).forEach((outcome: any, i: number) => {
      sections.push(`\nOutcome ${i + 1}: ${outcome.outcome}`);
      if (outcome.indicator) sections.push(`  Indicator: ${outcome.indicator}`);
      if (outcome.target) sections.push(`  Target: ${outcome.target}`);
      if (outcome.measurementMethod) sections.push(`  Measurement Method: ${outcome.measurementMethod}`);
      if (outcome.dataSource) sections.push(`  Data Source: ${outcome.dataSource}`);
      if (outcome.frequency) sections.push(`  Frequency: ${outcome.frequency}`);
    });
    if (proposalData.evaluationPlan) {
      sections.push(`\nEvaluation Plan:`);
      sections.push(proposalData.evaluationPlan);
    }
    
    // Budget
    sections.push(`\nBUDGET`);
    sections.push(`${'-'.repeat(40)}`);
    sections.push(`\nTotal Budget: $${(proposalData.totalBudget || 0).toLocaleString()}`);
    sections.push(`\nBudget Line Items:`);
    (proposalData.budgetItems || []).forEach((item: any, i: number) => {
      sections.push(`\n${i + 1}. ${item.category}: ${item.item}`);
      sections.push(`   Amount: $${(item.amount || 0).toLocaleString()}`);
      if (item.justification) sections.push(`   Justification: ${item.justification}`);
    });
    if (proposalData.generatedBudgetJustification) {
      sections.push(`\nBudget Narrative:`);
      sections.push(proposalData.generatedBudgetJustification);
    }
    
    sections.push(`\n${'='.repeat(60)}`);
    sections.push(`Generated on: ${new Date().toLocaleDateString()}`);
    
    return sections.join('\n');
  };

  // Download as text file
  const downloadAsText = () => {
    const text = generateProposalText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proposalData.projectTitle || 'Grant_Proposal'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate and save proposal
  const handleGenerateProposal = async () => {
    try {
      setGenerating(true);
      
      // Generate the proposal text
      const proposalText = generateProposalText();
      setGeneratedProposal(proposalText);
      
      // Save to grants list
      const savedProposal = {
        id: `proposal-${Date.now()}`,
        title: proposalData.projectTitle || 'Untitled Proposal',
        organization: proposalData.organizationName || 'Unknown Organization',
        funder: proposalData.targetFunder || 'Not specified',
        amount: proposalData.fundingAmount || proposalData.totalBudget || 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        completionPercentage: status.percentage,
        goalsCount: (proposalData.goals || []).length,
        activitiesCount: (proposalData.activities || []).length,
        outcomesCount: (proposalData.outcomes || []).length,
        budgetTotal: proposalData.totalBudget || 0,
        proposalData: proposalData,
        proposalText: proposalText
      };
      
      // Save to localStorage for now (in production, this would go to Firebase)
      const existingProposals = JSON.parse(localStorage.getItem('savedProposals') || '[]');
      existingProposals.push(savedProposal);
      localStorage.setItem('savedProposals', JSON.stringify(existingProposals));
      
      // Show preview
      setShowPreview(true);
      
    } catch (error) {
      console.error('Error generating proposal:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Download as PDF (using browser print)
  const downloadAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${proposalData.projectTitle || 'Grant Proposal'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
              h2 { color: #333; margin-top: 30px; }
              h3 { color: #555; }
              .section { margin-bottom: 20px; }
              .budget-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .budget-table th, .budget-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .budget-table th { background-color: #f5f5f5; }
              .total { font-weight: bold; font-size: 1.2em; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <pre>${generateProposalText()}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Review & Generate Proposal
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your proposal details before generating the final document
      </Typography>

      {/* Completion Status */}
      <Card sx={{ mb: 3, bgcolor: status.percentage === 100 ? 'success.light' : 'warning.light' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Proposal Completion</Typography>
              <Typography variant="body2">
                {status.completed} of {status.total} sections completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h3" fontWeight={700}>
                {Math.round(status.percentage)}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Section Status */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Section Checklist</Typography>
          <List>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.overview ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Project Overview"
                secondary={status.checks.overview ? 'Complete' : 'Incomplete - Add organization and project details'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.need ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Need Statement"
                secondary={status.checks.need ? 'Complete' : 'Incomplete - Add problem statement and target population'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.goals ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Goals & Objectives"
                secondary={status.checks.goals ? `${(proposalData.goals || []).length} goal(s) defined` : 'Incomplete - Add at least one goal'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.activities ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Activities & Methods"
                secondary={status.checks.activities ? `${(proposalData.activities || []).length} activit(ies) defined` : 'Incomplete - Add project activities'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.outcomes ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Outcomes & Evaluation"
                secondary={status.checks.outcomes ? `${(proposalData.outcomes || []).length} outcome(s) defined` : 'Incomplete - Add outcome indicators'}
              />
            </ListItem>
            <ListItem>
              <Box sx={{ mr: 2 }}>
                {status.checks.budget ? <CheckCircle color="green" size={20} /> : <AlertCircle color="orange" size={20} />}
              </Box>
              <ListItemText
                primary="Budget & Resources"
                secondary={status.checks.budget ? `$${(proposalData.totalBudget || 0).toLocaleString()} total budget` : 'Incomplete - Add budget items'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Proposal Summary */}
      <Typography variant="h6" gutterBottom>Proposal Summary</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FileText size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Project Information</Typography>
              </Box>
              <Typography variant="body2"><strong>Title:</strong> {proposalData.projectTitle || 'Not set'}</Typography>
              <Typography variant="body2"><strong>Organization:</strong> {proposalData.organizationName || 'Not set'}</Typography>
              <Typography variant="body2"><strong>Funder:</strong> {proposalData.targetFunder || 'Not set'}</Typography>
              <Typography variant="body2"><strong>Duration:</strong> {proposalData.projectDuration || 'Not set'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DollarSign size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Budget Summary</Typography>
              </Box>
              <Typography variant="h5" color="primary" fontWeight={700}>
                ${(proposalData.totalBudget || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(proposalData.budgetItems || []).length} line item(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Target size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Goals</Typography>
              </Box>
              <Typography variant="h4">{(proposalData.goals || []).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(proposalData.goals || []).reduce((sum, g) => sum + g.objectives.length, 0)} objectives
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Users size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Activities</Typography>
              </Box>
              <Typography variant="h4">{(proposalData.activities || []).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(proposalData.activities || []).reduce((sum, a) => sum + a.participants, 0)} total participants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BarChart3 size={20} />
                <Typography variant="subtitle2" fontWeight={600}>Outcomes</Typography>
              </Box>
              <Typography variant="h4">{(proposalData.outcomes || []).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                outcome indicators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Budget Breakdown */}
      {(proposalData.budgetItems || []).length > 0 && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DollarSign size={20} />
              <Typography fontWeight={600}>Budget Details (${(proposalData.totalBudget || 0).toLocaleString()})</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Item</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(proposalData.budgetItems || []).map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.item}</TableCell>
                      <TableCell align="right">${(item.amount || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>${(proposalData.totalBudget || 0).toLocaleString()}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Goals & Objectives Details */}
      {(proposalData.goals || []).length > 0 && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Target size={20} />
              <Typography fontWeight={600}>Goals & Objectives ({(proposalData.goals || []).length} goals)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {(proposalData.goals || []).map((goal: any, index: number) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>Goal {index + 1}: {goal.goal}</Typography>
                {goal.objectives && goal.objectives.length > 0 && (
                  <List dense>
                    {goal.objectives.map((obj: string, objIndex: number) => (
                      <ListItem key={objIndex}>
                        <ListItemText primary={`${index + 1}.${objIndex + 1}: ${obj}`} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Activities Details */}
      {(proposalData.activities || []).length > 0 && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={20} />
              <Typography fontWeight={600}>Activities ({(proposalData.activities || []).length} activities)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {(proposalData.activities || []).map((activity: any, index: number) => (
              <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>{index + 1}. {activity.activity || activity.title}</Typography>
                {activity.description && <Typography variant="body2" color="text.secondary">{activity.description}</Typography>}
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  {activity.timeline && <Chip size="small" label={`Timeline: ${activity.timeline}`} />}
                  {activity.participants && <Chip size="small" label={`Participants: ${activity.participants}`} />}
                  {activity.responsible && <Chip size="small" label={`Responsible: ${activity.responsible}`} />}
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Outcomes Details */}
      {(proposalData.outcomes || []).length > 0 && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChart3 size={20} />
              <Typography fontWeight={600}>Outcomes & Evaluation ({(proposalData.outcomes || []).length} outcomes)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {(proposalData.outcomes || []).map((outcome: any, index: number) => (
              <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Outcome {index + 1}: {outcome.outcome}</Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {outcome.indicator && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Indicator:</strong> {outcome.indicator}</Typography>
                    </Grid>
                  )}
                  {outcome.target && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Target:</strong> {outcome.target}</Typography>
                    </Grid>
                  )}
                  {outcome.measurementMethod && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Method:</strong> {outcome.measurementMethod}</Typography>
                    </Grid>
                  )}
                  {outcome.frequency && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Frequency:</strong> {outcome.frequency}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Generation Notice */}
      {status.percentage === 100 ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Ready to Generate!</strong> Your proposal is complete. Click "Generate Proposal" 
          to create a professional grant proposal document.
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Incomplete Sections:</strong> Some sections are not complete. You can still generate 
          a proposal, but it's recommended to complete all sections for the best results.
        </Alert>
      )}

      {/* Generate Proposal Button */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Sparkles />}
          onClick={handleGenerateProposal}
          disabled={generating}
          sx={{ minWidth: 200 }}
        >
          {generating ? 'Generating...' : 'Generate Proposal'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Eye />}
          onClick={() => {
            setGeneratedProposal(generateProposalText());
            setShowPreview(true);
          }}
        >
          Preview Proposal
        </Button>
      </Box>

      {/* Proposal Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Proposal Preview</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDown size={16} />}
                onClick={downloadAsText}
              >
                Download TXT
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Download size={16} />}
                onClick={downloadAsPDF}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap', 
            fontSize: '0.85rem',
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 1,
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            {generatedProposal || generateProposalText()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={() => {
              handleGenerateProposal();
              alert('Proposal saved! You can find it on the Grants page.');
              router.push('/grants');
            }}
          >
            Save & Go to Grants
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
