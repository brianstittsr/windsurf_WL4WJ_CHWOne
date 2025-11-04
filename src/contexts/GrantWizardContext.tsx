'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Grant, 
  Organization, 
  KeyContact, 
  ReportingRequirement, 
  GrantDocument,
  CollaboratingEntity,
  DataCollectionMethod,
  ProjectMilestone,
  AnalysisRecommendation
} from '@/types/grant.types';

type GrantWizardContextType = {
  currentStep: number;
  totalSteps: number;
  grantData: Partial<Grant>;
  organization: Organization | null;
  setCurrentStep: (step: number) => void;
  updateGrantData: (data: Partial<Grant>) => void;
  updateOrganization: (org: Organization) => void;
  
  // Key Contacts methods
  addKeyContact: (contact: KeyContact) => void;
  removeKeyContact: (contactId: string) => void;
  
  // Reporting methods
  addReportingRequirement: (requirement: Omit<ReportingRequirement, 'id'>) => void;
  removeReportingRequirement: (requirementId: string) => void;
  
  // Entity methods
  addCollaboratingEntity: (entity: Omit<CollaboratingEntity, 'id'>) => void;
  updateCollaboratingEntity: (entityId: string, data: Partial<CollaboratingEntity>) => void;
  removeCollaboratingEntity: (entityId: string) => void;
  
  // Data collection methods
  addDataCollectionMethod: (method: Omit<DataCollectionMethod, 'id'>) => void;
  updateDataCollectionMethod: (methodId: string, data: Partial<DataCollectionMethod>) => void;
  removeDataCollectionMethod: (methodId: string) => void;
  
  // Project milestone methods
  addProjectMilestone: (milestone: Omit<ProjectMilestone, 'id'>) => void;
  updateProjectMilestone: (milestoneId: string, data: Partial<ProjectMilestone>) => void;
  removeProjectMilestone: (milestoneId: string) => void;
  
  // Analysis recommendation methods
  addAnalysisRecommendation: (recommendation: Omit<AnalysisRecommendation, 'id'>) => void;
  updateAnalysisRecommendation: (recommendationId: string, data: Partial<AnalysisRecommendation>) => void;
  removeAnalysisRecommendation: (recommendationId: string) => void;
  
  // Reset and submit methods
  resetWizard: () => void;
  submitGrant: () => Promise<string>;
  
  // Prepopulated data flag
  hasPrepopulatedData: boolean;
  generatePrepopulatedData: () => void;
};

const GrantWizardContext = createContext<GrantWizardContextType | undefined>(undefined);

export const GrantWizardProvider: React.FC<{ children: ReactNode; organizationId?: string }> = ({
  children,
  organizationId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [grantData, setGrantData] = useState<Partial<Grant>>({
    organizationId,
    status: 'draft',
    reportingRequirements: [],
    keyContacts: [],
    documents: [],
    collaboratingEntities: [],
    dataCollectionMethods: [],
    projectMilestones: [],
    analysisRecommendations: [],
    entityRelationshipNotes: ''
  });
  
  const [hasPrepopulatedData, setHasPrepopulatedData] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const totalSteps = 5;

  const updateGrantData = (data: Partial<Grant>) => {
    setGrantData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const updateOrganization = (org: Organization) => {
    setOrganization(org);
  };

  const addKeyContact = (contact: KeyContact) => {
    setGrantData((prev) => ({
      ...prev,
      keyContacts: [...(prev.keyContacts || []), contact],
    }));
  };

  const removeKeyContact = (contactId: string) => {
    setGrantData((prev) => ({
      ...prev,
      keyContacts: (prev.keyContacts || []).filter((c) => c.id !== contactId),
    }));
  };

  const addReportingRequirement = (requirement: Omit<ReportingRequirement, 'id'>) => {
    const newRequirement = {
      ...requirement,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setGrantData((prev) => ({
      ...prev,
      reportingRequirements: [...(prev.reportingRequirements || []), newRequirement],
    }));
  };

  const removeReportingRequirement = (requirementId: string) => {
    setGrantData((prev) => ({
      ...prev,
      reportingRequirements: (prev.reportingRequirements || []).filter((r) => r.id !== requirementId),
    }));
  };

  // Entity management methods
  const addCollaboratingEntity = (entity: Omit<CollaboratingEntity, 'id'>) => {
    const newEntity = {
      ...entity,
      id: Math.random().toString(36).substr(2, 9),
    };

    setGrantData((prev) => ({
      ...prev,
      collaboratingEntities: [...(prev.collaboratingEntities || []), newEntity],
    }));
  };

  const updateCollaboratingEntity = (entityId: string, data: Partial<CollaboratingEntity>) => {
    setGrantData((prev) => {
      const entities = [...(prev.collaboratingEntities || [])];
      const index = entities.findIndex(e => e.id === entityId);
      if (index !== -1) {
        entities[index] = { ...entities[index], ...data };
      }
      return { ...prev, collaboratingEntities: entities };
    });
  };

  const removeCollaboratingEntity = (entityId: string) => {
    setGrantData((prev) => ({
      ...prev,
      collaboratingEntities: (prev.collaboratingEntities || []).filter(e => e.id !== entityId),
    }));
  };

  // Data collection methods
  const addDataCollectionMethod = (method: Omit<DataCollectionMethod, 'id'>) => {
    const newMethod = {
      ...method,
      id: Math.random().toString(36).substr(2, 9),
    };

    setGrantData((prev) => ({
      ...prev,
      dataCollectionMethods: [...(prev.dataCollectionMethods || []), newMethod],
    }));
  };

  const updateDataCollectionMethod = (methodId: string, data: Partial<DataCollectionMethod>) => {
    setGrantData((prev) => {
      const methods = [...(prev.dataCollectionMethods || [])];
      const index = methods.findIndex(m => m.id === methodId);
      if (index !== -1) {
        methods[index] = { ...methods[index], ...data };
      }
      return { ...prev, dataCollectionMethods: methods };
    });
  };

  const removeDataCollectionMethod = (methodId: string) => {
    setGrantData((prev) => ({
      ...prev,
      dataCollectionMethods: (prev.dataCollectionMethods || []).filter(m => m.id !== methodId),
    }));
  };

  // Project milestone methods
  const addProjectMilestone = (milestone: Omit<ProjectMilestone, 'id'>) => {
    const newMilestone = {
      ...milestone,
      id: Math.random().toString(36).substr(2, 9),
    };

    setGrantData((prev) => ({
      ...prev,
      projectMilestones: [...(prev.projectMilestones || []), newMilestone],
    }));
  };

  const updateProjectMilestone = (milestoneId: string, data: Partial<ProjectMilestone>) => {
    setGrantData((prev) => {
      const milestones = [...(prev.projectMilestones || [])];
      const index = milestones.findIndex(m => m.id === milestoneId);
      if (index !== -1) {
        milestones[index] = { ...milestones[index], ...data };
      }
      return { ...prev, projectMilestones: milestones };
    });
  };

  const removeProjectMilestone = (milestoneId: string) => {
    setGrantData((prev) => ({
      ...prev,
      projectMilestones: (prev.projectMilestones || []).filter(m => m.id !== milestoneId),
    }));
  };

  // Analysis recommendation methods
  const addAnalysisRecommendation = (recommendation: Omit<AnalysisRecommendation, 'id'>) => {
    const newRecommendation = {
      ...recommendation,
      id: Math.random().toString(36).substr(2, 9),
    };

    setGrantData((prev) => ({
      ...prev,
      analysisRecommendations: [...(prev.analysisRecommendations || []), newRecommendation],
    }));
  };

  const updateAnalysisRecommendation = (recommendationId: string, data: Partial<AnalysisRecommendation>) => {
    setGrantData((prev) => {
      const recommendations = [...(prev.analysisRecommendations || [])];
      const index = recommendations.findIndex(r => r.id === recommendationId);
      if (index !== -1) {
        recommendations[index] = { ...recommendations[index], ...data };
      }
      return { ...prev, analysisRecommendations: recommendations };
    });
  };

  const removeAnalysisRecommendation = (recommendationId: string) => {
    setGrantData((prev) => ({
      ...prev,
      analysisRecommendations: (prev.analysisRecommendations || []).filter(r => r.id !== recommendationId),
    }));
  };

  // Generate prepopulated data for demo purposes
  const generatePrepopulatedData = () => {
    // Sample data for demonstration
    const sampleData: Partial<Grant> = {
      name: "Community Health Worker Training Initiative",
      description: "A collaborative project to train and deploy community health workers in underserved areas",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // One year from now
      fundingSource: "National Health Foundation",
      grantNumber: "CHW-2025-038",
      totalBudget: 450000,
      
      // Collaborating entities
      collaboratingEntities: [
        {
          id: "entity-1",
          name: "Regional Health Department",
          role: "lead",
          description: "Primary grant administrator and program overseer",
          contactName: "Dr. Sarah Johnson",
          contactEmail: "sjohnson@regionalhd.org",
          contactPhone: "555-123-4567",
          responsibilities: ["Program administration", "Reporting", "Financial oversight"]
        },
        {
          id: "entity-2",
          name: "Community Outreach Partners",
          role: "partner",
          description: "Local non-profit focused on community health education",
          contactName: "Michael Rodriguez",
          contactEmail: "mrodriguez@cop.org",
          contactPhone: "555-987-6543",
          responsibilities: ["CHW recruitment", "Training delivery", "Community engagement"]
        }
      ],
      
      // Data collection methods
      dataCollectionMethods: [
        {
          id: "method-1",
          name: "Training Attendance Records",
          description: "Digital check-in system for all training sessions",
          frequency: "weekly",
          responsibleEntity: "Community Outreach Partners",
          dataPoints: ["Participant name", "Session date", "Session duration", "Completion status"],
          tools: ["Digital attendance app", "Backup paper records"]
        },
        {
          id: "method-2",
          name: "Health Outcome Surveys",
          description: "Quarterly assessment of health outcomes in target communities",
          frequency: "quarterly",
          responsibleEntity: "Regional Health Department",
          dataPoints: ["Community health indicators", "Service utilization rates", "Patient satisfaction"],
          tools: ["Electronic survey platform", "In-person interviews"]
        }
      ],
      
      // Project milestones
      projectMilestones: [
        {
          id: "milestone-1",
          name: "Training Curriculum Development",
          description: "Complete all training materials and instructor guides",
          dueDate: new Date(Date.now() + 2592000000).toISOString().split('T')[0], // 30 days from now
          status: "not_started",
          responsibleParties: ["Regional Health Department", "Community Outreach Partners"],
          dependencies: []
        },
        {
          id: "milestone-2",
          name: "First Cohort Training",
          description: "Complete training for first group of 25 CHWs",
          dueDate: new Date(Date.now() + 7776000000).toISOString().split('T')[0], // 90 days from now
          status: "not_started",
          responsibleParties: ["Community Outreach Partners"],
          dependencies: ["Training Curriculum Development"]
        }
      ],
      
      // Analysis recommendations
      analysisRecommendations: [
        {
          id: "rec-1",
          area: "governance",
          description: "Establish a joint steering committee with representatives from both organizations",
          priority: "high",
          implementationSteps: ["Identify representatives", "Schedule monthly meetings", "Create communication protocols"]
        },
        {
          id: "rec-2",
          area: "data_collection",
          description: "Implement a shared data platform accessible to both entities",
          priority: "medium",
          implementationSteps: ["Evaluate platform options", "Configure access controls", "Train staff on data entry protocols"]
        }
      ],
      
      entityRelationshipNotes: "The Regional Health Department will serve as the primary grant administrator with financial oversight responsibilities. Community Outreach Partners will lead the training and implementation aspects with regular reporting to RHD. A joint steering committee will meet monthly to review progress and address any challenges."
    };
    
    setGrantData(prev => ({
      ...prev,
      ...sampleData
    }));
    
    setHasPrepopulatedData(true);
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setGrantData({
      organizationId,
      status: 'draft',
      reportingRequirements: [],
      keyContacts: [],
      documents: [],
      collaboratingEntities: [],
      dataCollectionMethods: [],
      projectMilestones: [],
      analysisRecommendations: [],
      entityRelationshipNotes: ''
    });
    setHasPrepopulatedData(false);
  };

  const submitGrant = async (): Promise<string> => {
    try {
      // This will be implemented in the grant service
      console.log('Submitting grant:', grantData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'grant-123'; // Return the new grant ID
    } catch (error) {
      console.error('Error submitting grant:', error);
      throw error;
    }
  };

  return (
    <GrantWizardContext.Provider
      value={{
        currentStep,
        totalSteps,
        grantData,
        organization,
        setCurrentStep,
        updateGrantData,
        updateOrganization,
        addKeyContact,
        removeKeyContact,
        addReportingRequirement,
        removeReportingRequirement,
        addCollaboratingEntity,
        updateCollaboratingEntity,
        removeCollaboratingEntity,
        addDataCollectionMethod,
        updateDataCollectionMethod,
        removeDataCollectionMethod,
        addProjectMilestone,
        updateProjectMilestone,
        removeProjectMilestone,
        addAnalysisRecommendation,
        updateAnalysisRecommendation,
        removeAnalysisRecommendation,
        resetWizard,
        submitGrant,
        hasPrepopulatedData,
        generatePrepopulatedData,
      }}
    >
      {children}
    </GrantWizardContext.Provider>
  );
};

export const useGrantWizard = (): GrantWizardContextType => {
  const context = useContext(GrantWizardContext);
  if (!context) {
    throw new Error('useGrantWizard must be used within a GrantWizardProvider');
  }
  return context;
};
