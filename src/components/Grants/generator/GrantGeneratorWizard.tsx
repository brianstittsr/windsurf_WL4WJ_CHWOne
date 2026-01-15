'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3, 
  FileCheck, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { GrantGeneratorProvider, useGrantGenerator } from '@/contexts/GrantGeneratorContext';
import { cn } from '@/lib/utils';

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
      icon: FileText,
      description: 'Basic project information and organization details'
    },
    { 
      title: 'Need Statement', 
      component: GeneratorStep2NeedStatement, 
      icon: Target,
      description: 'Define the problem and community need'
    },
    { 
      title: 'Goals & Objectives', 
      component: GeneratorStep3Goals, 
      icon: TrendingUp,
      description: 'Set SMART goals and measurable objectives'
    },
    { 
      title: 'Activities & Methods', 
      component: GeneratorStep4Activities, 
      icon: Users,
      description: 'Define project activities and implementation plan'
    },
    { 
      title: 'Outcomes & Evaluation', 
      component: GeneratorStep5Outcomes, 
      icon: BarChart3,
      description: 'Outcome-based evaluation and data collection'
    },
    { 
      title: 'Budget & Resources', 
      component: GeneratorStep6Budget, 
      icon: FileCheck,
      description: 'Budget justification and resource allocation'
    },
    { 
      title: 'Review & Generate', 
      component: GeneratorStep7Review, 
      icon: Sparkles,
      description: 'Review and generate final proposal'
    },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
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
  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="w-full p-4 md:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5856D6]/10 to-[#AF52DE]/10 rounded-full mb-4">
          <Sparkles className="h-5 w-5 text-[#5856D6]" />
          <span className="text-sm font-medium text-[#5856D6]">AI-Powered</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
          Grant Proposal Generator
        </h1>
        <p className="text-[#6E6E73] text-lg max-w-2xl mx-auto">
          Create a professional, outcome-based grant proposal with AI assistance
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F5F5F7] rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-[#5856D6] to-[#AF52DE] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Indicator - Horizontal Scrollable on Mobile */}
      <div className="overflow-x-auto pb-4 mb-6 -mx-4 px-4">
        <div className="flex gap-2 md:gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-7">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index < currentStep;
            
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center transition-all duration-300 min-w-[80px] md:min-w-0",
                  isCurrent && "scale-105",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => isClickable && setCurrentStep(index)}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm",
                    isCompleted && "bg-[#34C759] text-white",
                    isCurrent && "bg-gradient-to-r from-[#5856D6] to-[#AF52DE] text-white ring-4 ring-[#5856D6]/20",
                    !isCompleted && !isCurrent && "bg-[#F5F5F7] text-[#6E6E73]"
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] md:text-xs text-center font-medium transition-colors whitespace-nowrap",
                    isCurrent ? "text-[#5856D6]" : "text-[#1D1D1F]"
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Assistant Info */}
      <div className="bg-gradient-to-r from-[#5856D6]/5 to-[#AF52DE]/5 border border-[#5856D6]/20 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#5856D6] to-[#AF52DE] flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1D1D1F] mb-1">AI-Powered Writing</h3>
            <p className="text-sm text-[#6E6E73]">
              Our AI will help you craft compelling narratives, ensure outcome-based evaluation methods, and format your proposal professionally.
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-[#D2D2D7] shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#D2D2D7] bg-[#F5F5F7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#5856D6] to-[#AF52DE] flex items-center justify-center">
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
        <div className="p-6 min-h-[400px]">
          <CurrentStepComponent />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="rounded-xl px-6 py-2.5 border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm text-[#6E6E73]">
          Step {currentStep + 1} of {steps.length}
        </span>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={nextStep}
            className="rounded-xl px-6 py-2.5 bg-gradient-to-r from-[#5856D6] to-[#AF52DE] hover:opacity-90 text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-xl px-6 py-2.5 bg-[#34C759] hover:bg-[#2DB84D] text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Proposal
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function GrantGeneratorWizard(props: GrantGeneratorWizardProps) {
  return (
    <GrantGeneratorProvider organizationId={props.organizationId}>
      <GrantGeneratorWizardContent {...props} />
    </GrantGeneratorProvider>
  );
}
