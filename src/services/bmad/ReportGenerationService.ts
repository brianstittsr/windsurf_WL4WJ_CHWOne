import { ReportConfig, Report, Dataset } from '@/types/bmad.types';
import { bmadAgentService } from './BmadAgentService';
import { v4 as uuidv4 } from 'uuid';

class ReportGenerationService {
  /**
   * Generate a report based on configuration and datasets
   */
  async generateReport(config: ReportConfig, datasets: Dataset[]): Promise<Report> {
    try {
      // Create a new report object
      const report: Report = {
        id: uuidv4(),
        config: {
          ...config,
          status: 'generating',
          updatedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: config.userId || 'unknown',
        status: 'generating'
      };
      
      // Call BMAD Developer agent to create the report
      const response = await bmadAgentService.createReport(config, datasets);
      
      if (response.error) {
        return {
          ...report,
          status: 'error',
          error: response.error
        };
      }
      
      // Update report with generated content
      return {
        ...report,
        config: response.updatedConfig || config,
        generatedContent: response.updatedConfig?.sections || [],
        status: 'complete',
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        id: uuidv4(),
        config,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: config.userId || 'unknown',
        status: 'error',
        error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Export report to PDF
   */
  async exportToPdf(report: Report): Promise<string> {
    try {
      // Call BMAD Developer agent to export to PDF
      const response = await bmadAgentService.exportToPdf(report);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // In a real implementation, this would return a URL to the PDF
      // For now, we'll return a mock URL
      return `https://storage.bmad.ai/reports/${report.id}.pdf`;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error(`Failed to export to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Save report to database
   */
  async saveReport(report: Report): Promise<Report> {
    try {
      // In a real implementation, we would save to a database
      // For now, we'll just return the report
      return {
        ...report,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error saving report:', error);
      throw new Error(`Failed to save report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<Report | null> {
    try {
      // In a real implementation, we would fetch from a database
      // For now, we'll return a mock report
      return {
        id: reportId,
        config: {
          id: `config-${reportId}`,
          title: 'Sample Report',
          description: 'This is a sample report',
          sections: [
            {
              id: 'section-1',
              title: 'Introduction',
              content: 'This is the introduction section of the report.',
              type: 'text',
              order: 0
            },
            {
              id: 'section-2',
              title: 'Data Analysis',
              content: 'This section contains data analysis.',
              type: 'visualization',
              order: 1,
              visualizationId: 'viz-1'
            }
          ],
          visualizations: [
            {
              id: 'viz-1',
              type: 'bar',
              title: 'Sample Bar Chart',
              data: {
                labels: ['Category A', 'Category B', 'Category C'],
                datasets: [
                  {
                    label: 'Values',
                    data: [65, 59, 80]
                  }
                ]
              },
              datasetId: 'dataset-1'
            }
          ],
          status: 'complete',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date()
        },
        generatedContent: [
          {
            id: 'section-1',
            title: 'Introduction',
            content: 'This is the introduction section of the report.',
            type: 'text',
            order: 0
          },
          {
            id: 'section-2',
            title: 'Data Analysis',
            content: 'This section contains data analysis.',
            type: 'visualization',
            order: 1,
            visualizationId: 'viz-1'
          }
        ],
        pdfUrl: `https://storage.bmad.ai/reports/${reportId}.pdf`,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(),
        userId: 'user-1',
        status: 'complete'
      };
    } catch (error) {
      console.error('Error getting report:', error);
      return null;
    }
  }
  
  /**
   * Get all reports for a user
   */
  async getUserReports(userId: string): Promise<Report[]> {
    try {
      // In a real implementation, we would fetch from a database
      // For now, we'll return mock reports
      return [
        {
          id: 'report-1',
          config: {
            id: 'config-1',
            title: 'Monthly Sales Analysis',
            description: 'Analysis of sales data for the current month',
            status: 'complete',
            createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
            updatedAt: new Date(Date.now() - 86400000 * 6) // 6 days ago
          },
          createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
          updatedAt: new Date(Date.now() - 86400000 * 6), // 6 days ago
          userId,
          status: 'complete',
          pdfUrl: 'https://storage.bmad.ai/reports/report-1.pdf'
        },
        {
          id: 'report-2',
          config: {
            id: 'config-2',
            title: 'Customer Satisfaction Survey Results',
            description: 'Analysis of customer satisfaction survey data',
            status: 'complete',
            createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
            updatedAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
          },
          createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
          updatedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          userId,
          status: 'complete',
          pdfUrl: 'https://storage.bmad.ai/reports/report-2.pdf'
        }
      ];
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }
}

export const reportGenerationService = new ReportGenerationService();
