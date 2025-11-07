'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
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
  
  // Document analysis methods
  analyzeDocument: (file: File) => Promise<{success: boolean; error?: string; note?: string; steps?: string[]}>;
  analysisSteps: string[];
  addAnalysisStep: (step: string) => void;
  clearAnalysisSteps: () => void;
  showAnalysisModal: boolean;
  setShowAnalysisModal: (show: boolean) => void;
  isAnalyzingDocument: boolean;
  
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
    entityRelationshipNotes: '',
    formTemplates: [],
    reportTemplates: [],
    dashboardMetrics: []
  });
  
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false);
  const [hasPrepopulatedData, setHasPrepopulatedData] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const addAnalysisStep = useCallback((step: string) => {
    setAnalysisSteps(prev => [...prev, step]);
  }, []);

  const clearAnalysisSteps = useCallback(() => {
    setAnalysisSteps([]);
  }, []);

  const totalSteps = 7; // Updated for all 7 wizard steps

  const updateGrantData = (data: Partial<Grant>) => {
    console.log('Updating grant data with:', data);
    // Use a callback to ensure we're working with the latest state
    setGrantData(prev => {
      const updatedData = { ...prev, ...data };
      console.log('Updated grant data:', updatedData);
      return updatedData;
    });
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

  // Document Analysis Function using OpenAI API
  const analyzeDocument = async (file: File): Promise<{success: boolean; error?: string; note?: string; steps?: string[]}> => {
    try {
      // Reset steps and show the modal
      clearAnalysisSteps();
      setShowAnalysisModal(true);
      setIsAnalyzingDocument(true);
      
      addAnalysisStep('Starting document analysis process');
      
      // Validate file
      if (!file) {
        addAnalysisStep('❌ Error: No file provided');
        throw new Error('No file provided for analysis');
      }
      
      addAnalysisStep(`File received: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      
      
      // Check file type
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
      const isTxt = file.name.toLowerCase().endsWith('.txt');
      
      addAnalysisStep(`Detected file format: ${isPdf ? 'PDF' : isDoc ? 'Word Document' : isTxt ? 'Text file' : 'Unknown'}`);
      
      if (!isPdf && !isDoc && !isTxt) {
        addAnalysisStep('❌ Error: Unsupported file format');
        return {
          success: false,
          error: 'Unsupported file format. Please upload a PDF, Word document, or text file.',
          steps: analysisSteps
        };
      }
      
      // We'll now handle PDFs through the API with the improved PDF.js-extract library
      // No special client-side handling needed anymore
      if (isPdf) {
        addAnalysisStep('Processing PDF document');
        addAnalysisStep('Using pdf.js-extract for text extraction');
      }
      
      // Prepare for API call
      addAnalysisStep('Preparing document for AI analysis');
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending document for AI analysis:', file.name, 'type:', file.type, 'size:', Math.round(file.size / 1024), 'KB');
      addAnalysisStep('Sending document to OpenAI API');
      
      // Call the OpenAI API endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        addAnalysisStep('❌ Error: API request timed out after 60 seconds');
      }, 60000); // 60 second timeout
      
      try {
        // Call API with timeout controller
        const response = await fetch('/api/ai/analyze-grant', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        addAnalysisStep('Received response from API');
        
        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          addAnalysisStep(`❌ API Error: ${response.status} ${response.statusText}`);
          throw new Error(`API Error: ${response.status}`);
        }
        
        addAnalysisStep('Parsing API response');
        const result = await response.json();
        console.log('API Response:', result); // Log the full response for debugging
        
        if (!result.success) {
          console.error(`Analysis failed: ${result.error || 'Unknown error'}`);
          addAnalysisStep(`❌ Analysis failed: ${result.error || 'Unknown error'}`);
          return { 
            success: false, 
            error: result.error || 'The document could not be analyzed. Please try a different document.',
            steps: analysisSteps 
          };
        }
        
        // If there's a note, it means we're using mock data
        if (result.note) {
          console.warn(result.note);
          // Check if it's due to an API error
          if (result.note.includes('Anthropic API error')) {
            addAnalysisStep(`⚠ Anthropic API error: Check your API key`);
          } else {
            addAnalysisStep(`⚠ Note: ${result.note}`);
          }
        }
        
        // Check if we got meaningful data
        addAnalysisStep('Validating extracted data');
        if (!result.analyzedData || Object.keys(result.analyzedData).length === 0) {
          addAnalysisStep('❌ Error: No structured data was extracted');
          return { 
            success: false, 
            error: 'Document was processed but no grant data was extracted. Please try a different document.',
            steps: analysisSteps 
          };
        }
        
        // Process the analyzed data
        addAnalysisStep('Processing extracted data');
        const extractedData = processAnalyzedData(result.analyzedData);
        console.log('Processed data for form population:', extractedData);
        
        // Check if we got meaningful fields
        addAnalysisStep('Validating key grant fields');
        if (!extractedData.name && !extractedData.description && !extractedData.fundingSource) {
          addAnalysisStep('❌ Error: Required grant fields could not be extracted');
          return { 
            success: false, 
            error: 'Document was processed but no grant data could be extracted. Please try a different document.',
            steps: analysisSteps 
          };
        }
        
        // Update the grant data with the extracted information
        addAnalysisStep('✅ Data validation successful');
        addAnalysisStep('Populating form fields with extracted data');
        updateGrantData(extractedData);
        console.log('Updated grant data:', extractedData);
        setHasPrepopulatedData(true);
        
        addAnalysisStep('✅ Document analysis complete');
        return { 
          success: true,
          steps: analysisSteps 
        };
        
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          addAnalysisStep('❌ Error: Request timed out after 60 seconds');
          return { 
            success: false, 
            error: 'Analysis request timed out. Please try a smaller document or try again later.',
            steps: analysisSteps
          };
        }
        addAnalysisStep(`❌ API error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        throw fetchError;
      }
      
    } catch (error: unknown) {
      console.error('Error analyzing document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addAnalysisStep(`❌ Error during document analysis: ${errorMessage}`);
      
      // Check if it's an API response error
      if (error instanceof Response || (error as any)?.status >= 400) {
        const status = (error as any)?.status || 'unknown';
        let errorDetail = '';
        
        try {
          // Try to get the error details from the response
          const errorData = await (error as Response).json();
          errorDetail = errorData?.error || errorData?.details || JSON.stringify(errorData);
          addAnalysisStep(`❌ API error (${status}): ${errorDetail}`);
        } catch (e) {
          addAnalysisStep(`❌ API error (${status}): Could not parse error details`);
        }
        
        return {
          success: false,
          error: `API error: ${errorDetail || 'Document processing failed'}`,
          steps: analysisSteps
        };
      }
      
      // For other errors
      addAnalysisStep('❌ Document analysis failed - please try again');
      return {
        success: false,
        error: 'Document analysis failed. Please ensure you have a valid Anthropic API key configured.',
        steps: analysisSteps
      };
    } finally {
      setIsAnalyzingDocument(false);
    }
  };

  // Process the Anthropic API analysis results into our grant data structure
  const processAnalyzedData = (apiData: any): Partial<Grant> => {
    try {
      console.log('Processing Anthropic analysis data:', apiData);
      
      // Initialize the extracted data
      const extractedData: Partial<Grant> = {
        name: apiData.grantName || apiData.title || apiData.name || '',
        description: apiData.description || apiData.purpose || '',
        startDate: apiData.startDate || '',
        endDate: apiData.endDate || '',
        fundingSource: apiData.fundingSource || '',
        grantNumber: apiData.grantNumber || '',
        totalBudget: apiData.totalBudget || apiData.budget || 0,
      };
      
      // Process collaborating entities
      if (apiData.entities || apiData.collaboratingEntities) {
        const entities = apiData.entities || apiData.collaboratingEntities || [];
        extractedData.collaboratingEntities = entities.map((entity: any, index: number) => ({
          id: `entity-${Date.now()}-${index}`,
          name: entity.name || `Entity ${index + 1}`,
          role: entity.role || 'partner',
          description: entity.description || '',
          contactName: entity.contactName || entity.contact?.name || '',
          contactEmail: entity.contactEmail || entity.contact?.email || '',
          contactPhone: entity.contactPhone || entity.contact?.phone || '',
          responsibilities: entity.responsibilities || []
        }));
      }
      
      // Process data collection methods
      if (apiData.dataCollectionMethods || apiData.methods) {
        const methods = apiData.dataCollectionMethods || apiData.methods || [];
        extractedData.dataCollectionMethods = methods.map((method: any, index: number) => ({
          id: `method-${Date.now()}-${index}`,
          name: method.name || `Method ${index + 1}`,
          description: method.description || '',
          frequency: method.frequency || 'monthly',
          responsibleEntity: method.responsibleEntity || method.responsible || '',
          dataPoints: method.dataPoints || method.data || [],
          tools: method.tools || method.instruments || []
        }));
      }
      
      // Process project milestones
      if (apiData.milestones || apiData.projectMilestones) {
        const milestones = apiData.milestones || apiData.projectMilestones || [];
        extractedData.projectMilestones = milestones.map((milestone: any, index: number) => ({
          id: `milestone-${Date.now()}-${index}`,
          name: milestone.name || `Milestone ${index + 1}`,
          description: milestone.description || '',
          dueDate: milestone.dueDate || milestone.date || '',
          status: milestone.status || 'not_started',
          responsibleParties: milestone.responsibleParties || milestone.responsible || [],
          dependencies: milestone.dependencies || []
        }));
      }
      
      // Process analysis recommendations
      if (apiData.recommendations || apiData.analysisRecommendations) {
        const recommendations = apiData.recommendations || apiData.analysisRecommendations || [];
        extractedData.analysisRecommendations = recommendations.map((rec: any, index: number) => ({
          id: `rec-${Date.now()}-${index}`,
          area: rec.area || 'general',
          description: rec.description || '',
          priority: rec.priority || 'medium',
          implementationSteps: rec.implementationSteps || rec.steps || []
        }));
      }
      
      // If API didn't return all expected data, add some minimal placeholder data
      if (!extractedData.collaboratingEntities?.length) {
        extractedData.collaboratingEntities = [{
          id: `entity-${Date.now()}-1`,
          name: 'Lead Organization',
          role: 'lead',
          description: 'Primary grant administrator',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          responsibilities: ['Grant administration']
        }];
      }
      
      return extractedData;
    } catch (error) {
      console.error('Error processing API data:', error);
      // Return a minimal dataset if processing fails
      return {
        name: apiData?.name || apiData?.title || 'New Grant',
        description: apiData?.description || ''
      };
    }
  };
  
  // Helper function to extract data from document (fallback for development/testing)
  const extractDataFromDocument = async (file: File): Promise<Partial<Grant>> => {
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Check for key terms in the filename to determine grant type
    const fileName = file.name.toLowerCase();
    const isHealth = fileName.includes('health') || Math.random() > 0.6;
    const isEducation = !isHealth && (fileName.includes('education') || Math.random() > 0.5);
    const isCommunity = !isHealth && !isEducation;
    
    // Check for key terms to determine funding source type
    const isFederal = fileName.includes('federal') || Math.random() > 0.6;
    const isState = !isFederal && (fileName.includes('state') || Math.random() > 0.5);
    const isFoundation = !isFederal && !isState;
    
    // Create more comprehensive collaborating entities
    const collabEntities: CollaboratingEntity[] = [
      {
        id: `entity-${Date.now()}-1`,
        name: isHealth ? 'Regional Health Department' : 
              isEducation ? 'State Education Agency' :
              isCommunity ? 'Community Development Corporation' : 'Lead Organization',
        role: 'lead',
        description: 'Primary grant administrator responsible for overall program management, financial oversight, and compliance with funding requirements.',
        contactName: 'Dr. Alexandra Johnson',
        contactEmail: 'alexandra.johnson@rhd.org',
        contactPhone: '(555) 123-4567',
        responsibilities: ['Grant administration', 'Financial oversight', 'Compliance reporting', 'Program evaluation', 'Stakeholder coordination']
      },
      {
        id: `entity-${Date.now()}-2`,
        name: isHealth ? 'Community Health Worker Association' : 
              isEducation ? 'Metropolitan School District' :
              isCommunity ? 'Neighborhood Development Alliance' : 'Implementation Partner',
        role: 'partner',
        description: 'Primary service delivery partner responsible for direct implementation of grant activities and community engagement strategies.',
        contactName: 'Samuel Rivera, MPH',
        contactEmail: 'srivera@chwa.org',
        contactPhone: '(555) 987-6543',
        responsibilities: ['Service delivery', 'Community outreach', 'Data collection', 'Staff training', 'Direct participant engagement']
      },
      {
        id: `entity-${Date.now()}-3`,
        name: isHealth ? 'Health Metrics Institute' : 
              isEducation ? 'Educational Research Consortium' :
              isCommunity ? 'Urban Planning Analytics' : 'Evaluation Partner',
        role: 'evaluator',
        description: 'Independent evaluator responsible for measuring outcomes and providing analysis of program effectiveness.',
        contactName: 'Dr. Priya Sharma',
        contactEmail: 'psharma@hmi.edu',
        contactPhone: '(555) 456-7890',
        responsibilities: ['Outcome measurement', 'Data analysis', 'Evaluation report development', 'Research methodology design']
      },
      {
        id: `entity-${Date.now()}-4`,
        name: isHealth ? 'Patient Advocacy Coalition' : 
              isEducation ? 'Parent-Teacher Association' :
              isCommunity ? 'Resident Advisory Council' : 'Stakeholder Representative',
        role: 'stakeholder',
        description: 'Representative organization for program beneficiaries, providing community voice and feedback in program implementation.',
        contactName: 'Maria Gonzalez',
        contactEmail: 'mgonzalez@pacadvocacy.org',
        contactPhone: '(555) 234-5678',
        responsibilities: ['Community feedback collection', 'Beneficiary representation', 'Advisory committee participation', 'Program accessibility review']
      }
    ];
    
    // Create more detailed data collection methods
    const methods: DataCollectionMethod[] = [
      {
        id: `method-${Date.now()}-1`,
        name: isHealth ? 'Patient Encounter Tracking' :
              isEducation ? 'Student Performance Monitoring' :
              'Participant Service Tracking',
        description: 'Comprehensive system for recording all participant interactions, services provided, and immediate outcomes.',
        frequency: 'daily',
        responsibleEntity: collabEntities[1].name,
        dataPoints: [
          'Participant ID', 
          'Service date', 
          'Service duration', 
          'Service type', 
          'Provider information',
          'Service location',
          'Immediate outcomes',
          'Follow-up needed'
        ],
        tools: ['Mobile data collection app', 'Electronic records system', 'Backup paper forms']
      },
      {
        id: `method-${Date.now()}-2`,
        name: isHealth ? 'Health Outcome Assessments' :
              isEducation ? 'Academic Progress Evaluation' :
              'Program Impact Measurement',
        description: 'Structured evaluation of key program outcomes measured against established baselines and targets.',
        frequency: 'monthly',
        responsibleEntity: collabEntities[2].name,
        dataPoints: [
          'Outcome indicators', 
          'Baseline measurements', 
          'Target metrics', 
          'Variance analysis',
          'Demographic breakdown',
          'Geographic distribution',
          'Comparative benchmarks'
        ],
        tools: ['Statistical analysis software', 'Survey platform', 'Visualization tools']
      },
      {
        id: `method-${Date.now()}-3`,
        name: isHealth ? 'Community Health Surveys' :
              isEducation ? 'Stakeholder Feedback Collection' :
              'Participant Experience Assessment',
        description: 'Regular collection of feedback from program participants and stakeholders regarding service quality and impact.',
        frequency: 'quarterly',
        responsibleEntity: collabEntities[3].name,
        dataPoints: [
          'Satisfaction scores', 
          'Qualitative feedback', 
          'Service improvement suggestions', 
          'Reported impact',
          'Unmet needs identification',
          'Accessibility barriers'
        ],
        tools: ['Online survey tool', 'Focus group protocols', 'Interview guides', 'Feedback management system']
      },
      {
        id: `method-${Date.now()}-4`,
        name: isHealth ? 'Cost-Benefit Analysis' :
              isEducation ? 'Resource Utilization Assessment' :
              'Program Efficiency Evaluation',
        description: 'Systematic analysis of program costs relative to measured outcomes and benefits.',
        frequency: 'annually',
        responsibleEntity: collabEntities[0].name,
        dataPoints: [
          'Program expenditures', 
          'Cost per participant', 
          'Return on investment', 
          'Cost-effectiveness ratio',
          'Resource allocation efficiency',
          'Comparative cost analysis'
        ],
        tools: ['Financial analysis software', 'Economic modeling tools', 'Cost tracking system']
      }
    ];
    
    // Create project milestones
    const today = new Date();
    const milestones: ProjectMilestone[] = [
      {
        id: `milestone-${Date.now()}-1`,
        name: 'Project Kickoff',
        description: 'Initial planning meeting with all stakeholders',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14).toISOString().split('T')[0],
        status: 'not_started',
        responsibleParties: [collabEntities[0].name],
        dependencies: []
      },
      {
        id: `milestone-${Date.now()}-2`,
        name: 'Staff Training',
        description: 'Training for all staff involved in grant implementation',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30).toISOString().split('T')[0],
        status: 'not_started',
        responsibleParties: [collabEntities[0].name, collabEntities[1].name],
        dependencies: ['Project Kickoff']
      },
      {
        id: `milestone-${Date.now()}-3`,
        name: 'Service Launch',
        description: 'Begin service delivery to participants',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45).toISOString().split('T')[0],
        status: 'not_started',
        responsibleParties: [collabEntities[1].name],
        dependencies: ['Staff Training']
      }
    ];
    
    // Create analysis recommendations
    const recommendations: AnalysisRecommendation[] = [
      {
        id: `rec-${Date.now()}-1`,
        area: 'governance',
        description: 'Establish bi-weekly coordination meetings between all partner organizations',
        priority: 'high',
        implementationSteps: [
          'Set up recurring calendar invites',
          'Create agenda template',
          'Assign roles for meeting facilitation',
          'Establish documentation process'
        ]
      },
      {
        id: `rec-${Date.now()}-2`,
        area: 'data_collection',
        description: 'Implement standardized data collection protocols across all partners',
        priority: 'medium',
        implementationSteps: [
          'Develop data dictionary',
          'Create shared data collection forms',
          'Train staff on protocols',
          'Establish quality control process'
        ]
      }
    ];
    
    // Set grant details
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    // Return all extracted data
    return {
      name: file.name.split('.')[0],
      description: `This grant focuses on ${isHealth ? 'health services' : isEducation ? 'education programs' : 'community development'} and aims to improve outcomes for target populations through collaborative implementation.`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      fundingSource: isFederal ? 'Federal Government' : isState ? 'State Government' : isFoundation ? 'Private Foundation' : 'Corporate Sponsor',
      grantNumber: `G-${Date.now().toString().substring(7, 13)}`,
      totalBudget: Math.floor(Math.random() * 500000) + 100000,
      collaboratingEntities: collabEntities,
      dataCollectionMethods: methods,
      projectMilestones: milestones,
      analysisRecommendations: recommendations,
      entityRelationshipNotes: 'Partners will coordinate through regular meetings and shared project management tools.'
    };
  };

  // Generate prepopulated data for demo purposes
  const generatePrepopulatedData = () => {
    // Sample data for demonstration
    const sampleData: Partial<Grant> = {
      name: "Community Health Worker Training Initiative",
      description: "A collaborative program to train and deploy community health workers in underserved areas",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year from now
      fundingSource: "Federal Health Resources Administration",
      grantNumber: "CHW-2025-1234",
      totalBudget: 450000,
      
      // Collaborating entities
      collaboratingEntities: [
        {
          id: "entity-1",
          name: "Regional Health Department",
          role: "lead",
          description: "Primary grant administrator",
          contactName: "Alex Johnson",
          contactEmail: "alex@rhd.org",
          contactPhone: "555-123-4567",
          responsibilities: ["Grant administration", "Financial oversight", "Reporting"]
        },
        {
          id: "entity-2",
          name: "Community Outreach Partners",
          role: "partner",
          description: "Service delivery partner",
          contactName: "Maria Rodriguez",
          contactEmail: "maria@cop.org",
          contactPhone: "555-987-6543",
          responsibilities: ["Service delivery", "Data collection", "Community engagement"]
        }
      ],
      
      // Data collection methods
      dataCollectionMethods: [
        {
          id: "method-1",
          name: "Training Attendance Tracking",
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
        analyzeDocument,
        isAnalyzingDocument,
        // New analysis tracking properties
        analysisSteps,
        addAnalysisStep,
        clearAnalysisSteps,
        showAnalysisModal,
        setShowAnalysisModal,
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
