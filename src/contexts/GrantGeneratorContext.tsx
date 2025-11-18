'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for the Grant Proposal
export interface ProposalData {
  // Step 1: Overview
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  projectTitle: string;
  fundingAmount: number;
  projectDuration: string;
  targetFunder: string;
  
  // Step 2: Need Statement
  problemStatement: string;
  communityNeed: string;
  targetPopulation: string;
  geographicArea: string;
  dataSupporting: string[];
  
  // Step 3: Goals & Objectives
  goals: Array<{
    id: string;
    goal: string;
    objectives: Array<{
      id: string;
      objective: string;
      measurable: boolean;
      timebound: boolean;
    }>;
  }>;
  
  // Step 4: Activities
  activities: Array<{
    id: string;
    name: string;
    description: string;
    timeline: string;
    responsible: string;
    participants: number;
  }>;
  
  // Step 5: Outcomes & Evaluation
  outcomes: Array<{
    id: string;
    outcome: string;
    indicator: string;
    measurementMethod: string;
    dataSource: string;
    frequency: string;
    target: string;
  }>;
  evaluationPlan: string;
  
  // Step 6: Budget
  budgetItems: Array<{
    id: string;
    category: string;
    item: string;
    amount: number;
    justification: string;
  }>;
  totalBudget: number;
  
  // Generated content
  generatedNarrative?: string;
  generatedEvaluation?: string;
  generatedBudgetJustification?: string;
}

interface GrantGeneratorContextType {
  proposalData: Partial<ProposalData>;
  updateProposalData: (data: Partial<ProposalData>) => void;
  uploadLogo: (file: File) => Promise<string>;
  generateProposal: () => Promise<string>;
  generateSection: (section: string) => Promise<string>;
}

const GrantGeneratorContext = createContext<GrantGeneratorContextType | undefined>(undefined);

export function GrantGeneratorProvider({ 
  children, 
  organizationId 
}: { 
  children: ReactNode; 
  organizationId: string;
}) {
  const [proposalData, setProposalData] = useState<Partial<ProposalData>>({
    organizationId,
    goals: [],
    activities: [],
    outcomes: [],
    budgetItems: [],
    dataSupporting: []
  });

  const updateProposalData = (data: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...data }));
  };

  const uploadLogo = async (file: File): Promise<string> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);

      // Upload to server
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.logoUrl) {
        updateProposalData({ organizationLogo: result.logoUrl });
        return result.logoUrl;
      } else {
        throw new Error(result.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const generateSection = async (section: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/generate-proposal-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          section,
          proposalData
        })
      });

      const result = await response.json();
      
      if (result.success && result.content) {
        return result.content;
      } else {
        throw new Error(result.error || 'Failed to generate section');
      }
    } catch (error) {
      console.error('Error generating section:', error);
      throw error;
    }
  };

  const generateProposal = async (): Promise<string> => {
    try {
      console.log('Generating full proposal with AI...');
      
      const response = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposalData
        })
      });

      const result = await response.json();
      
      if (result.success && result.proposalId) {
        console.log('Proposal generated successfully:', result.proposalId);
        return result.proposalId;
      } else {
        throw new Error(result.error || 'Failed to generate proposal');
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw error;
    }
  };

  return (
    <GrantGeneratorContext.Provider
      value={{
        proposalData,
        updateProposalData,
        uploadLogo,
        generateProposal,
        generateSection
      }}
    >
      {children}
    </GrantGeneratorContext.Provider>
  );
}

export function useGrantGenerator() {
  const context = useContext(GrantGeneratorContext);
  if (context === undefined) {
    throw new Error('useGrantGenerator must be used within a GrantGeneratorProvider');
  }
  return context;
}
