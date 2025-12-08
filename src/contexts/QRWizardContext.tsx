'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { QRTrackingWizardState, PlatformCapabilities, ProgramDetails, DataRequirements, ParticipantDataUpload, FormCustomization, QRCodeStrategy, WorkflowsTraining, ImplementationPlan } from '@/types/qr-tracking-wizard.types';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

interface QRWizardContextType {
  wizardState: QRTrackingWizardState;
  currentStep: number;
  isStepCompleted: (step: number) => boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateStep1: (data: PlatformCapabilities) => Promise<void>;
  updateStep2: (data: ProgramDetails) => Promise<void>;
  updateStep3: (data: DataRequirements) => Promise<void>;
  updateStep4: (data: ParticipantDataUpload) => Promise<void>;
  updateStep5: (data: FormCustomization) => Promise<void>;
  updateStep6: (data: QRCodeStrategy) => Promise<void>;
  updateStep7: (data: WorkflowsTraining) => Promise<void>;
  updateStep8: (data: ImplementationPlan) => Promise<void>;
  saveWizard: () => Promise<void>;
  loadWizard: (wizardId: string) => Promise<void>;
  resetWizard: () => void;
}

const QRWizardContext = createContext<QRWizardContextType | undefined>(undefined);

const INITIAL_WIZARD_STATE: QRTrackingWizardState = {
  currentStep: 1,
  completedSteps: [],
  status: 'draft'
};

export function QRWizardProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [wizardState, setWizardState] = useState<QRTrackingWizardState>(INITIAL_WIZARD_STATE);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-save wizard state every 30 seconds
  useEffect(() => {
    if (wizardState.wizardId && wizardState.status !== 'draft') {
      const timer = setTimeout(() => {
        saveWizard();
      }, 30000);
      setAutoSaveTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [wizardState]);

  const isStepCompleted = useCallback((step: number): boolean => {
    return wizardState.completedSteps.includes(step);
  }, [wizardState.completedSteps]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 8) {
      setWizardState(prev => ({
        ...prev,
        currentStep: step
      }));
    }
  }, []);

  const nextStep = useCallback(() => {
    setWizardState(prev => {
      const newStep = Math.min(prev.currentStep + 1, 8);
      const completedSteps = prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStep];
      
      return {
        ...prev,
        currentStep: newStep,
        completedSteps,
        status: 'in_progress' as const
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  }, []);

  const updateStep1 = useCallback(async (data: PlatformCapabilities) => {
    setWizardState(prev => ({
      ...prev,
      step1_platform: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep2 = useCallback(async (data: ProgramDetails) => {
    setWizardState(prev => ({
      ...prev,
      step2_program: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep3 = useCallback(async (data: DataRequirements) => {
    setWizardState(prev => ({
      ...prev,
      step3_data: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep4 = useCallback(async (data: ParticipantDataUpload) => {
    setWizardState(prev => ({
      ...prev,
      step4_participants: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep5 = useCallback(async (data: FormCustomization) => {
    setWizardState(prev => ({
      ...prev,
      step5_forms: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep6 = useCallback(async (data: QRCodeStrategy) => {
    setWizardState(prev => ({
      ...prev,
      step6_qr_strategy: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep7 = useCallback(async (data: WorkflowsTraining) => {
    setWizardState(prev => ({
      ...prev,
      step7_workflows: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const updateStep8 = useCallback(async (data: ImplementationPlan) => {
    setWizardState(prev => ({
      ...prev,
      step8_implementation: data,
      updatedAt: serverTimestamp() as any
    }));
  }, []);

  const saveWizard = useCallback(async () => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      const wizardId = wizardState.wizardId || `wizard_${Date.now()}`;
      const wizardRef = doc(db, 'qrTrackingWizards', wizardId);

      const dataToSave = {
        ...wizardState,
        wizardId,
        organizationId: currentUser.uid,
        createdBy: currentUser.uid,
        updatedAt: serverTimestamp(),
        ...(wizardState.createdAt ? {} : { createdAt: serverTimestamp() })
      };

      await setDoc(wizardRef, dataToSave, { merge: true });

      setWizardState(prev => ({
        ...prev,
        wizardId
      }));

      console.log('Wizard saved successfully:', wizardId);
    } catch (error) {
      console.error('Error saving wizard:', error);
      throw error;
    }
  }, [wizardState, currentUser]);

  const loadWizard = useCallback(async (wizardId: string) => {
    try {
      const wizardRef = doc(db, 'qrTrackingWizards', wizardId);
      const wizardSnap = await getDoc(wizardRef);

      if (wizardSnap.exists()) {
        const data = wizardSnap.data() as QRTrackingWizardState;
        setWizardState(data);
        console.log('Wizard loaded successfully:', wizardId);
      } else {
        console.error('Wizard not found:', wizardId);
      }
    } catch (error) {
      console.error('Error loading wizard:', error);
      throw error;
    }
  }, []);

  const resetWizard = useCallback(() => {
    setWizardState(INITIAL_WIZARD_STATE);
  }, []);

  const value: QRWizardContextType = {
    wizardState,
    currentStep: wizardState.currentStep,
    isStepCompleted,
    goToStep,
    nextStep,
    previousStep,
    updateStep1,
    updateStep2,
    updateStep3,
    updateStep4,
    updateStep5,
    updateStep6,
    updateStep7,
    updateStep8,
    saveWizard,
    loadWizard,
    resetWizard
  };

  return (
    <QRWizardContext.Provider value={value}>
      {children}
    </QRWizardContext.Provider>
  );
}

export function useQRWizard() {
  const context = useContext(QRWizardContext);
  if (context === undefined) {
    throw new Error('useQRWizard must be used within a QRWizardProvider');
  }
  return context;
}
