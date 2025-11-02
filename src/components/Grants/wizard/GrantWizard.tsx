'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { GrantWizardProvider } from '@/contexts/GrantWizardContext';
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

  const steps = [
    { title: 'Basic Info', component: Step1BasicInfo },
    { title: 'Funding', component: Step2FundingDetails },
    { title: 'Reporting', component: Step3ReportingRequirements },
    { title: 'Contacts', component: Step4KeyContacts },
    { title: 'Review', component: Step5Review },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      // The actual submission will be handled by the context
      const grantId = 'new-grant-id'; // Replace with actual grant ID from submission
      toast({
        title: 'Grant created successfully',
        description: 'The grant has been created and is now active.',
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
        description: 'There was an error creating the grant. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <GrantWizardProvider organizationId={organizationId}>
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm mt-1">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <CurrentStepComponent />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Grant'
              )}
            </Button>
          )}
        </div>
      </div>
    </GrantWizardProvider>
  );
}
