import { 
  BmadAgentType, 
  BmadAgentRequest, 
  BmadAgentResponse,
  Dataset,
  AnalysisResult,
  ReportConfig,
  Report,
  TransformedDataset
} from '@/types/bmad.types';

class BmadAgentService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_BMAD_API_URL || 'https://api.bmad.ai';
    this.apiKey = process.env.NEXT_PUBLIC_BMAD_API_KEY || '';
  }

  private async callAgent(
    agentType: BmadAgentType,
    endpoint: string,
    data: BmadAgentRequest
  ): Promise<BmadAgentResponse> {
    try {
      // In development/test mode, return mock responses
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_BMAD === 'true') {
        return this.getMockResponse(agentType, endpoint, data);
      }

      const response = await fetch(`${this.apiUrl}/${agentType}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`BMAD ${agentType} API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling BMAD ${agentType} agent:`, error);
      return {
        error: `Failed to communicate with BMAD ${agentType} agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Analyst Agent Methods
  async analyzeData(datasets: Dataset[], analysisType: string): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.ANALYST,
      'analyze',
      { availableDatasets: datasets, analysisType }
    );
  }

  async transformData(
    datasets: Dataset[], 
    transformations: any[]
  ): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.ANALYST,
      'transform',
      { availableDatasets: datasets, transformations }
    );
  }

  // Orchestrator Agent Methods
  async processInput(data: BmadAgentRequest): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.ORCHESTRATOR,
      'process',
      data
    );
  }

  async startReportGeneration(config: ReportConfig): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.ORCHESTRATOR,
      'generate-report',
      { currentConfig: config }
    );
  }

  // Developer Agent Methods
  async createReport(config: ReportConfig, datasets: Dataset[]): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.DEVELOPER,
      'create-report',
      { currentConfig: config, availableDatasets: datasets }
    );
  }

  async exportToPdf(report: Report): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.DEVELOPER,
      'export-pdf',
      { report }
    );
  }

  async exportDataset(
    dataset: TransformedDataset, 
    format: 'csv' | 'excel' | 'json'
  ): Promise<BmadAgentResponse> {
    return this.callAgent(
      BmadAgentType.DEVELOPER,
      'export-dataset',
      { transformedDataset: dataset, format }
    );
  }

  // Mock responses for development/testing
  private getMockResponse(
    agentType: BmadAgentType,
    endpoint: string,
    data: BmadAgentRequest
  ): BmadAgentResponse {
    // Generate realistic mock responses based on agent type and endpoint
    switch (agentType) {
      case BmadAgentType.ANALYST:
        return this.getMockAnalystResponse(endpoint, data);
      case BmadAgentType.ORCHESTRATOR:
        return this.getMockOrchestratorResponse(endpoint, data);
      case BmadAgentType.DEVELOPER:
        return this.getMockDeveloperResponse(endpoint, data);
      default:
        return { error: 'Unknown agent type' };
    }
  }

  private getMockAnalystResponse(endpoint: string, data: BmadAgentRequest): BmadAgentResponse {
    if (endpoint === 'analyze') {
      return {
        analysisResult: {
          id: 'mock-analysis-1',
          datasetId: data.availableDatasets?.[0]?.id || 'mock-dataset',
          type: data.analysisType as any || 'summary',
          result: {
            summary: 'Mock analysis result for ' + data.availableDatasets?.[0]?.name,
            statistics: {
              mean: 42.5,
              median: 38.2,
              mode: 35,
              standardDeviation: 12.3
            }
          },
          createdAt: new Date(),
          metadata: {
            processingTime: '1.2s',
            confidence: 0.95
          }
        }
      };
    } else if (endpoint === 'transform') {
      return {
        transformedDataset: {
          ...data.availableDatasets![0],
          id: 'transformed-' + data.availableDatasets![0].id,
          name: 'Transformed ' + data.availableDatasets![0].name,
          transformations: data.transformations || [],
          sourceDatasetIds: [data.availableDatasets![0].id],
          updatedAt: new Date()
        }
      };
    }
    return {};
  }

  private getMockOrchestratorResponse(endpoint: string, data: BmadAgentRequest): BmadAgentResponse {
    if (endpoint === 'process') {
      // If this is the first message (no config yet)
      if (!data.currentConfig || Object.keys(data.currentConfig).length === 0) {
        return {
          message: "I'll help you generate a report. What kind of data are you working with, and what insights are you looking to gain?",
          updatedConfig: {
            id: 'mock-config-' + Date.now(),
            title: '',
            sections: [],
            visualizations: [],
            status: 'draft',
            createdAt: new Date()
          },
          readyToGenerate: false
        };
      } 
      // If user has provided some information
      else if (data.message && data.currentConfig) {
        const config = data.currentConfig;
        
        // Update config based on user message
        if (!config.title && data.message.length > 10) {
          config.title = `Report on ${data.message.slice(0, 20)}...`;
        }
        
        // Add a section based on user input
        if (config.sections?.length === 0 || !config.sections) {
          config.sections = [{
            id: 'section-' + Date.now(),
            title: 'Introduction',
            content: `This report analyzes ${data.message}`,
            type: 'text',
            order: 0
          }];
        }
        
        return {
          message: "I've started creating your report. Would you like to include any specific visualizations or focus on particular metrics?",
          updatedConfig: config,
          readyToGenerate: config.sections && config.sections.length > 0
        };
      }
    } else if (endpoint === 'generate-report') {
      return {
        message: "Your report is being generated. This may take a few moments.",
        updatedConfig: {
          ...data.currentConfig,
          status: 'generating'
        },
        readyToGenerate: true
      };
    }
    return {
      message: "I'm not sure how to process that request. Could you provide more details?",
      readyToGenerate: false
    };
  }

  private getMockDeveloperResponse(endpoint: string, data: BmadAgentRequest): BmadAgentResponse {
    if (endpoint === 'create-report') {
      return {
        updatedConfig: {
          ...data.currentConfig,
          status: 'complete',
          updatedAt: new Date()
        }
      };
    } else if (endpoint === 'export-pdf') {
      return {
        message: "PDF export completed successfully",
        updatedConfig: {
          ...data.currentConfig,
          status: 'complete'
        }
      };
    } else if (endpoint === 'export-dataset') {
      return {
        message: `Dataset exported successfully as ${data.format}`,
        transformedDataset: data.transformedDataset
      };
    }
    return {};
  }
}

export const bmadAgentService = new BmadAgentService();
