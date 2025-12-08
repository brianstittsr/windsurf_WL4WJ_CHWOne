'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useQRWizard } from '@/contexts/QRWizardContext';
import Step1PlatformDiscovery from './steps/Step1PlatformDiscovery';
import Step2ProgramDetails from './steps/Step2ProgramDetails';
import Step3DataRequirements from './steps/Step3DataRequirements';
import Step4ParticipantUpload from './steps/Step4ParticipantUpload';
import Step5FormCustomization from './steps/Step5FormCustomization';
import Step6QRCodeStrategy from './steps/Step6QRCodeStrategy';
import Step7WorkflowsTraining from './steps/Step7WorkflowsTraining';
import Step8ImplementationPlan from './steps/Step8ImplementationPlan';

const WIZARD_STEPS = [
  {
    label: 'Platform Discovery',
    description: 'Assess your platform capabilities'
  },
  {
    label: 'Program Details',
    description: 'Define your program structure'
  },
  {
    label: 'Data Requirements',
    description: 'Customize data collection needs'
  },
  {
    label: 'Participant Upload',
    description: 'Import participant data'
  },
  {
    label: 'Form Customization',
    description: 'Design custom forms'
  },
  {
    label: 'QR Code Strategy',
    description: 'Set up QR code system'
  },
  {
    label: 'Workflows & Training',
    description: 'Create operational materials'
  },
  {
    label: 'Implementation Plan',
    description: 'Finalize launch strategy'
  }
];

export default function QRTrackingWizard() {
  const {
    currentStep,
    isStepCompleted,
    goToStep,
    nextStep,
    previousStep,
    saveWizard,
    wizardState
  } = useQRWizard();

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveWizard();
      setSaveMessage('Progress saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Error saving progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStepClick = (step: number) => {
    // Allow navigation to completed steps or the next step
    if (isStepCompleted(step) || step === currentStep || step === currentStep + 1) {
      goToStep(step);
    }
  };

  const canGoNext = () => {
    // Add validation logic here for each step
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PlatformDiscovery />;
      case 2:
        return <Step2ProgramDetails />;
      case 3:
        return <Step3DataRequirements />;
      case 4:
        return <Step4ParticipantUpload />;
      case 5:
        return <Step5FormCustomization />;
      case 6:
        return <Step6QRCodeStrategy />;
      case 7:
        return <Step7WorkflowsTraining />;
      case 8:
        return <Step8ImplementationPlan />;
      default:
        return <Box p={4}><Typography>Unknown Step</Typography></Box>;
    }
  };

  const completedStepsCount = wizardState.completedSteps.length;
  const progressPercentage = (completedStepsCount / 8) * 100;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              QR Code Participant Tracking Wizard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete the steps below to create a project management plan for participant tracking
            </Typography>
          </Box>
          <Tooltip title="Save Progress">
            <IconButton
              onClick={handleSave}
              disabled={saving}
              color="primary"
              size="large"
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completedStepsCount} of 8 steps completed ({Math.round(progressPercentage)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Save Message */}
        {saveMessage && (
          <Alert
            severity={saveMessage.includes('Error') ? 'error' : 'success'}
            sx={{ mb: 2 }}
            onClose={() => setSaveMessage(null)}
          >
            {saveMessage}
          </Alert>
        )}
      </Box>

      {/* Stepper */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Stepper activeStep={currentStep - 1} alternativeLabel>
          {WIZARD_STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const completed = isStepCompleted(stepNumber);
            const active = currentStep === stepNumber;

            return (
              <Step key={step.label} completed={completed}>
                <StepButton
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={!completed && stepNumber > currentStep + 1}
                >
                  <StepLabel
                    StepIconProps={{
                      icon: completed ? <CheckIcon /> : stepNumber
                    }}
                  >
                    <Typography variant="subtitle2">{step.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepLabel>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Step {currentStep}: {WIZARD_STEPS[currentStep - 1].label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {WIZARD_STEPS[currentStep - 1].description}
          </Typography>
        </Box>

        {renderStepContent()}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={previousStep}
          disabled={currentStep === 1}
          size="large"
        >
          Previous
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </Button>

          <Button
            variant="contained"
            endIcon={<NextIcon />}
            onClick={nextStep}
            disabled={currentStep === 8 || !canGoNext()}
            size="large"
          >
            {currentStep === 8 ? 'Complete' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
