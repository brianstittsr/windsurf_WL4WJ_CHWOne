'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button as MuiButton, Box, Typography, Stepper, Step, StepLabel, Paper, Alert } from '@mui/material';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3, 
  FileCheck, 
  Sparkles 
} from 'lucide-react';
import { GrantGeneratorProvider, useGrantGenerator } from '@/contexts/GrantGeneratorContext';

// Import wizard steps
import { GeneratorStep1Overview } from './steps/GeneratorStep1Overview';
import { GeneratorStep2NeedStatement } from './steps/GeneratorStep2NeedStatement';
import { GeneratorStep3Goals } from './steps/GeneratorStep3Goals';
import { GeneratorStep4Activities } from './steps/GeneratorStep4Activities';
import { GeneratorStep5Outcomes } from './steps/GeneratorStep5Outcomes';
import { GeneratorStep6Budget } from './steps/GeneratorStep6Budget';
import { GeneratorStep7Review } from './steps/GeneratorStep7Review';

type GrantGeneratorWizardProps = {
  organizationId: string;
  onComplete?: (proposalId: string) => void;
};

function GrantGeneratorWizardContent({ organizationId, onComplete }: GrantGeneratorWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { generateProposal, proposalData } = useGrantGenerator();

  const steps = [
    { 
      title: 'Project Overview', 
      component: GeneratorStep1Overview, 
      icon: <FileText className="h-5 w-5" />,
      description: 'Basic project information and organization details'
    },
    { 
      title: 'Need Statement', 
      component: GeneratorStep2NeedStatement, 
      icon: <Target className="h-5 w-5" />,
      description: 'Define the problem and community need'
    },
    { 
      title: 'Goals & Objectives', 
      component: GeneratorStep3Goals, 
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Set SMART goals and measurable objectives'
    },
    { 
      title: 'Activities & Methods', 
      component: GeneratorStep4Activities, 
      icon: <Users className="h-5 w-5" />,
      description: 'Define project activities and implementation plan'
    },
    { 
      title: 'Outcomes & Evaluation', 
      component: GeneratorStep5Outcomes, 
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Outcome-based evaluation and data collection'
    },
    { 
      title: 'Budget & Resources', 
      component: GeneratorStep6Budget, 
      icon: <FileCheck className="h-5 w-5" />,
      description: 'Budget justification and resource allocation'
    },
    { 
      title: 'Review & Generate', 
      component: GeneratorStep7Review, 
      icon: <Sparkles className="h-5 w-5" />,
      description: 'Review and generate final proposal'
    },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Generate the proposal using AI
      const proposalId = await generateProposal();
      
      toast({
        title: 'Proposal generated successfully',
        description: 'Your grant proposal has been created and is ready for review.',
      });
      
      if (onComplete) {
        onComplete(proposalId);
      } else {
        router.push(`/grants/proposals/${proposalId}`);
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: 'Error generating proposal',
        description: error instanceof Error ? error.message : 'There was an error generating the proposal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles className="h-6 w-6" />
          AI Grant Proposal Generator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a professional, outcome-based grant proposal with AI assistance
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.title}>
              <StepLabel
                optional={
                  <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {step.description}
                  </Typography>
                }
              >
                {step.title}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* AI Assistant Info */}
      <Alert severity="info" icon={<Sparkles />} sx={{ mb: 3 }}>
        <strong>AI-Powered Writing:</strong> Our AI will help you craft compelling narratives, 
        ensure outcome-based evaluation methods, and format your proposal professionally.
      </Alert>

      {/* Step Content */}
      <Paper sx={{ p: 4, mb: 3, minHeight: '400px' }}>
        <CurrentStepComponent />
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MuiButton
          variant="outlined"
          onClick={prevStep}
          disabled={currentStep === 0}
          sx={{ px: 3, py: 1 }}
        >
          Previous
        </MuiButton>

        <Typography variant="body2" color="text.secondary">
          Step {currentStep + 1} of {steps.length}
        </Typography>

        {currentStep < steps.length - 1 ? (
          <MuiButton
            variant="contained"
            onClick={nextStep}
            sx={{ px: 3, py: 1 }}
          >
            Next
          </MuiButton>
        ) : (
          <MuiButton
            variant="contained"
            color="success"
            onClick={handleGenerate}
            disabled={isGenerating}
            startIcon={isGenerating ? undefined : <Sparkles />}
            sx={{ px: 3, py: 1 }}
          >
            {isGenerating ? 'Generating...' : 'Generate Proposal'}
          </MuiButton>
        )}
      </Box>
    </Box>
  );
}

export function GrantGeneratorWizard(props: GrantGeneratorWizardProps) {
  return (
    <GrantGeneratorProvider organizationId={props.organizationId}>
      <GrantGeneratorWizardContent {...props} />
    </GrantGeneratorProvider>
  );
}
