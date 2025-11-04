'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileText, PieChart, Users, CheckCircle } from 'lucide-react';
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
    { title: 'Upload & Info', component: Step1BasicInfo, icon: <Upload className="h-5 w-5" />, description: 'Upload grant documents and enter basic information' },
    { title: 'Funding Details', component: Step2FundingDetails, icon: <FileText className="h-5 w-5" />, description: 'Enter financial information and funding sources' },
    { title: 'Reporting Setup', component: Step3ReportingRequirements, icon: <PieChart className="h-5 w-5" />, description: 'Configure reporting requirements and schedules' },
    { title: 'Key Contacts', component: Step4KeyContacts, icon: <Users className="h-5 w-5" />, description: 'Add team members and grant contacts' },
    { title: 'Review & Process', component: Step5Review, icon: <CheckCircle className="h-5 w-5" />, description: 'Review information and submit for processing' },
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
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Grant Analyzer Wizard</h2>
          <p className="text-gray-600">Complete the steps below to upload, process, and set up your grant</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index === currentStep ? 'scale-110 transition-transform duration-300' : ''}`}
              onClick={() => index < currentStep && setCurrentStep(index)}
              style={{ cursor: index < currentStep ? 'pointer' : 'default' }}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-2 transition-all duration-300 ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-blue-600 text-white border-2 border-blue-300' : 
                  'bg-gray-100 text-gray-400'
                }`}
              >
                {step.icon || (index + 1)}
              </div>
              <span className={`text-sm font-medium text-center ${index === currentStep ? 'text-blue-600' : 'text-gray-600'}`}>
                {step.title}
              </span>
              {index === currentStep && (
                <span className="text-xs text-gray-500 text-center mt-1 max-w-[120px]">{step.description}</span>
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            {steps[currentStep].icon && <span className="mr-2">{steps[currentStep].icon}</span>}
            Step {currentStep + 1}: {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
          <div className="border-t border-gray-100 pt-6">
            <CurrentStepComponent />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100"
          >
            ← Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={nextStep} 
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
            >
              Next →
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete & Process'
              )}
            </Button>
          )}
        </div>
      </div>
    </GrantWizardProvider>
  );
}
