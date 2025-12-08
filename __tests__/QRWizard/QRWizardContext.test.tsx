import { renderHook, act, waitFor } from '@testing-library/react';
import { QRWizardProvider, useQRWizard } from '@/contexts/QRWizardContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: { uid: 'test-user-123' },
    loading: false
  })
}));

describe('QRWizardContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <QRWizardProvider>{children}</QRWizardProvider>
    </AuthProvider>
  );

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      expect(result.current.wizardState.currentStep).toBe(1);
      expect(result.current.wizardState.completedSteps).toEqual([]);
      expect(result.current.wizardState.status).toBe('draft');
    });

    it('should have all update functions available', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      expect(typeof result.current.updateStep1).toBe('function');
      expect(typeof result.current.updateStep2).toBe('function');
      expect(typeof result.current.updateStep3).toBe('function');
      expect(typeof result.current.updateStep4).toBe('function');
      expect(typeof result.current.updateStep5).toBe('function');
      expect(typeof result.current.updateStep6).toBe('function');
      expect(typeof result.current.updateStep7).toBe('function');
      expect(typeof result.current.updateStep8).toBe('function');
    });
  });

  describe('Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should navigate to specific step', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      act(() => {
        result.current.goToStep(5);
      });

      expect(result.current.currentStep).toBe(5);
    });

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not go above step 8', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      act(() => {
        result.current.goToStep(8);
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(8);
    });
  });

  describe('Step Updates', () => {
    it('should update Step 1 data', async () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      const platformData = {
        platformName: 'Salesforce',
        platformType: 'salesforce' as const,
        formBuilder: {
          toolName: 'Salesforce Forms',
          features: {
            multipleChoice: true,
            textFields: true,
            dropdowns: true,
            fileUploads: false,
            conditionalLogic: true
          },
          preFillCapability: true,
          multiLanguageSupport: false,
          mobileResponsive: true
        },
        qrCodeGeneration: {
          hasBuiltInGenerator: true,
          canGenerateIndividual: true,
          canGenerateSingle: true,
          capabilities: {
            linkToForms: true,
            passParameters: true,
            preFillFields: true
          },
          formatOptions: {
            downloadImages: true,
            printSheets: true,
            displayOnScreen: true
          }
        },
        datasetFeatures: {
          storageType: 'crm' as const,
          capabilities: {
            autoUpdateFromForms: true,
            linkMultipleForms: true,
            generateReports: true,
            exportData: true,
            relationalData: true,
            calculatedFields: true,
            historicalTracking: true,
            dashboards: true
          },
          realTimeUpdates: true
        },
        integrationAutomation: {
          formsAutoWriteToDatasets: true,
          canTriggerWorkflows: true,
          canSendNotifications: true,
          hasAPI: true
        }
      };

      await act(async () => {
        await result.current.updateStep1(platformData);
      });

      await waitFor(() => {
        expect(result.current.wizardState.step1_platform).toEqual(platformData);
      });
    });

    it('should update Step 2 data', async () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      const programData = {
        basicInfo: {
          programName: 'CHW Training Program',
          programType: 'training' as const,
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          expectedParticipants: 50,
          description: 'Community Health Worker training'
        },
        cohortStructure: {
          hasCohorts: true,
          cohorts: [
            {
              cohortId: 'cohort-1',
              cohortName: 'Cohort A',
              startDate: '2025-01-01',
              endDate: '2025-03-31',
              maxParticipants: 25,
              currentParticipants: 0
            }
          ]
        },
        sessionSchedule: {
          hasRegularSessions: true,
          sessions: [
            {
              sessionId: 'session-1',
              sessionName: 'Week 1 Training',
              dayOfWeek: 'Monday',
              time: '09:00',
              duration: 120,
              location: 'Main Hall',
              maxCapacity: 30
            }
          ]
        },
        participantGroups: [],
        trackingRequirements: {
          attendanceTracking: true,
          sessionFeedback: true,
          progressTracking: false,
          certificateTracking: false,
          makeupSessions: false,
          withdrawalTracking: false
        }
      };

      await act(async () => {
        await result.current.updateStep2(programData);
      });

      await waitFor(() => {
        expect(result.current.wizardState.step2_program).toEqual(programData);
      });
    });
  });

  describe('Step Completion', () => {
    it('should mark step as completed', () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      act(() => {
        result.current.wizardState.completedSteps.push(1);
      });

      expect(result.current.isStepCompleted(1)).toBe(true);
      expect(result.current.isStepCompleted(2)).toBe(false);
    });
  });

  describe('Reset Wizard', () => {
    it('should reset wizard to initial state', async () => {
      const { result } = renderHook(() => useQRWizard(), { wrapper });

      // Make some changes
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      // Reset
      act(() => {
        result.current.resetWizard();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.wizardState.completedSteps).toEqual([]);
    });
  });
});
