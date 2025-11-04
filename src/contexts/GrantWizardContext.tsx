'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Grant, Organization, KeyContact, ReportingRequirement, GrantDocument } from '@/types/grant.types';

type GrantWizardContextType = {
  currentStep: number;
  totalSteps: number;
  grantData: Partial<Grant>;
  organization: Organization | null;
  setCurrentStep: (step: number) => void;
  updateGrantData: (data: Partial<Grant>) => void;
  updateOrganization: (org: Organization) => void;
  addKeyContact: (contact: KeyContact) => void;
  removeKeyContact: (contactId: string) => void;
  addReportingRequirement: (requirement: Omit<ReportingRequirement, 'id'>) => void;
  removeReportingRequirement: (requirementId: string) => void;
  resetWizard: () => void;
  submitGrant: () => Promise<string>;
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
  });
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

  const resetWizard = () => {
    setCurrentStep(0);
    setGrantData({
      organizationId,
      status: 'draft',
      reportingRequirements: [],
      keyContacts: [],
      documents: [],
    });
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
        resetWizard,
        submitGrant,
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
