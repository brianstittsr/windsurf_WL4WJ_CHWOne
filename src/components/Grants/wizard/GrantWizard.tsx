'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileText, PieChart, Users, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { GrantWizardProvider, useGrantWizard } from '@/contexts/GrantWizardContext';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2FundingDetails } from './steps/Step2FundingDetails';
import { Step3ReportingRequirements } from './steps/Step3ReportingRequirements';
import { Step4KeyContacts } from './steps/Step4KeyContacts';
import { Step5Review } from './steps/Step5Review';
import { cn } from '@/lib/utils';

type GrantWizardProps = {
  organizationId: string;
  onComplete?: (grantId: string) => void;
};

// Inner component that uses the context - MUST be inside GrantWizardProvider
function GrantWizardContent({ organizationId, onComplete }: GrantWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { submitGrant, generatePrepopulatedData, hasPrepopulatedData, grantData } = useGrantWizard();

  const steps = [
    { title: 'Upload & Info', component: Step1BasicInfo, icon: Upload, description: 'Upload grant documents and enter basic information' },
    { title: 'Entity Details', component: Step2FundingDetails, icon: FileText, description: 'Identify collaborating organizations and entity roles' },
    { title: 'Data Collection', component: Step3ReportingRequirements, icon: PieChart, description: 'Define data collection methods and requirements' },
    { title: 'Project Planning', component: Step4KeyContacts, icon: Users, description: 'Outline project management approach and milestones' },
    { title: 'Review & Submit', component: Step5Review, icon: CheckCircle, description: 'Review analysis and submit the grant' },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      console.log('Submitting grant with data:', grantData);
      
      const grantId = await submitGrant();
      
      toast({
        title: 'Grant created successfully',
        description: 'The grant has been saved and is now available in your grants list.',
      });
      
      if (onComplete) {
        onComplete(grantId);
      } else {
        router.push(`/grants`);
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
  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
          Grant Analyzer Wizard
        </h1>
        <p className="text-[#6E6E73] text-lg max-w-2xl mx-auto">
          Complete the steps below to create a project management plan for grant collaboration
        </p>
        
        {/* Demo Prepopulate Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (!hasPrepopulatedData) {
                generatePrepopulatedData();
              }
            }}
            className="rounded-xl border-[#5856D6] text-[#5856D6] hover:bg-[#5856D6]/10 px-6"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Prepopulate Form with Sample Data
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F5F5F7] rounded-full h-2 mb-8">
        <div
          className="bg-[#0071E3] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep;
          
          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center transition-all duration-300",
                isCurrent && "scale-105",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && setCurrentStep(index)}
            >
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-md",
                  isCompleted && "bg-[#34C759] text-white",
                  isCurrent && "bg-[#0071E3] text-white ring-4 ring-[#0071E3]/20",
                  !isCompleted && !isCurrent && "bg-[#F5F5F7] text-[#6E6E73]"
                )}
              >
                <StepIcon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <span
                className={cn(
                  "text-xs md:text-sm text-center font-medium transition-colors",
                  isCurrent ? "text-[#0071E3]" : "text-[#1D1D1F]"
                )}
              >
                {step.title}
              </span>
              {isCurrent && (
                <span className="text-[10px] md:text-xs text-[#6E6E73] text-center mt-1 max-w-[100px] md:max-w-[120px] hidden md:block">
                  {step.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#D2D2D7] bg-[#F5F5F7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0071E3] flex items-center justify-center">
              <CurrentIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1D1D1F]">
                Step {currentStep + 1}: {steps[currentStep].title}
              </h2>
              <p className="text-sm text-[#6E6E73]">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <CurrentStepComponent />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
          className="rounded-xl px-6 py-2.5 border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={nextStep}
            disabled={isSubmitting}
            className="rounded-xl px-6 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="rounded-xl px-6 py-2.5 bg-[#34C759] hover:bg-[#2DB84D] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Process
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Wrapper component that provides the context
export function GrantWizard({ organizationId, onComplete }: GrantWizardProps) {
  return (
    <GrantWizardProvider organizationId={organizationId}>
      <GrantWizardContent organizationId={organizationId} onComplete={onComplete} />
    </GrantWizardProvider>
  );
}
