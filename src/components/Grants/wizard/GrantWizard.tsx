'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button as MuiButton, Box, Typography, Grid, Card, CardContent, Alert } from '@mui/material';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileText, PieChart, Users, CheckCircle } from 'lucide-react';
import { GrantWizardProvider, useGrantWizard } from '@/contexts/GrantWizardContext';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2FundingDetails } from './steps/Step2FundingDetails';
import { Step3ReportingRequirements } from './steps/Step3ReportingRequirements';
import { Step4KeyContacts } from './steps/Step4KeyContacts';
import { Step5Review } from './steps/Step5Review';

type GrantWizardProps = {
  organizationId: string;
  onComplete?: (grantId: string) => void;
};

export function GrantWizard({ organizationId, onComplete }: GrantWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { submitGrant } = useGrantWizard();
  
  // Create a component for the prepopulate button to use the context
  const PrepopulateButton = () => {
    const { generatePrepopulatedData, hasPrepopulatedData } = useGrantWizard();
    
    return (
      <MuiButton
        variant="outlined"
        color="secondary"
        onClick={() => {
          if (!hasPrepopulatedData) {
            generatePrepopulatedData();
          }
        }}
        sx={{ px: 3 }}
        startIcon={<CheckCircle style={{ height: 16, width: 16 }} />}
      >
        Prepopulate Form with Sample Data
      </MuiButton>
    );
  };

  const steps = [
    { title: 'Upload & Info', component: Step1BasicInfo, icon: <Upload className="h-5 w-5" />, description: 'Upload grant documents and enter basic information' },
    { title: 'Entity Details', component: Step2FundingDetails, icon: <FileText className="h-5 w-5" />, description: 'Identify collaborating organizations and entity roles' },
    { title: 'Data Collection', component: Step3ReportingRequirements, icon: <PieChart className="h-5 w-5" />, description: 'Define data collection methods and requirements' },
    { title: 'Project Planning', component: Step4KeyContacts, icon: <Users className="h-5 w-5" />, description: 'Outline project management approach and milestones' },
    { title: 'Review & Submit', component: Step5Review, icon: <CheckCircle className="h-5 w-5" />, description: 'Review analysis and submit the grant' },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      // Submit the grant using the context
      const grantId = await submitGrant();
      
      toast({
        title: 'Grant created successfully',
        description: 'The grant has been saved and is now available in your grants list.',
      });
      
      if (onComplete) {
        onComplete(grantId);
      } else {
        router.push(`/grants/${grantId}`);
      }
    } catch (error) {
      console.error('Error creating grant:', error);
      toast({
        title: 'Error creating grant',
        description: error instanceof Error ? error.message : 'There was an error creating the grant. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <GrantWizardProvider organizationId={organizationId}>
      <Box sx={{ maxWidth: '1000px', mx: 'auto', p: 2 }}>
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Grant Analyzer Wizard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Complete the steps below to create a project management plan for grant collaboration
          </Typography>
          
          {/* Demo Prepopulate Button */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <PrepopulateButton />
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ width: '100%', bgcolor: '#f0f0f0', borderRadius: 5, height: 10, mb: 4 }}>
          <Box
            sx={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              bgcolor: 'primary.main',
              height: '100%',
              borderRadius: 5,
              transition: 'width 0.5s',
            }}
          />
        </Box>

        {/* Step Indicator */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Grid item xs={12/steps.length} key={index}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  transform: index === currentStep ? 'scale(1.1)' : 'none',
                  transition: 'transform 0.3s',
                  cursor: index < currentStep ? 'pointer' : 'default',
                }}
                onClick={() => index < currentStep && setCurrentStep(index)}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 1,
                    boxShadow: 2,
                    bgcolor: index < currentStep ? 'success.main' : 
                              index === currentStep ? 'primary.main' : '#f5f5f5',
                    color: index <= currentStep ? 'white' : 'text.secondary',
                    border: index === currentStep ? '2px solid' : 'none',
                    borderColor: 'primary.light',
                  }}
                >
                  {step.icon}
                </Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    textAlign: 'center', 
                    fontWeight: index === currentStep ? 600 : 400,
                    color: index === currentStep ? 'primary.main' : 'text.primary',
                  }}
                >
                  {step.title}
                </Typography>
                {index === currentStep && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ textAlign: 'center', mt: 0.5, maxWidth: 120 }}
                  >
                    {step.description}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Current Step Content */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 1.5, color: 'primary.main' }}>
                {steps[currentStep].icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Step {currentStep + 1}: {steps[currentStep].title}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {steps[currentStep].description}
            </Typography>
            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <CurrentStepComponent />
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <MuiButton
            variant="outlined"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            startIcon={<span>←</span>}
            sx={{ px: 3, py: 1 }}
          >
            Previous
          </MuiButton>

          {currentStep < steps.length - 1 ? (
            <MuiButton 
              variant="contained"
              onClick={nextStep} 
              disabled={isSubmitting}
              endIcon={<span>→</span>}
              sx={{ px: 3, py: 1 }}
            >
              Next
            </MuiButton>
          ) : (
            <MuiButton 
              variant="contained"
              color="success"
              onClick={handleComplete} 
              disabled={isSubmitting}
              sx={{ px: 3, py: 1 }}
            >
              {isSubmitting ? (
                <>
                  <Box component={Loader2} sx={{ mr: 1, height: 20, width: 20 }} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete & Process'
              )}
            </MuiButton>
          )}
        </Box>
      </Box>
    </GrantWizardProvider>
  );
}
