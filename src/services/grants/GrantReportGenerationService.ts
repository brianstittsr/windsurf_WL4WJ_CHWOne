import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { ReportTemplate, DashboardMetric, Grant } from '@/types/grant.types';

interface ReportData {
  grantData: Partial<Grant>;
  metrics: DashboardMetric[];
  generatedDate: Date;
}

interface GeneratedReport {
  success: boolean;
  reportId: string;
  format: string;
  data?: Blob;
  downloadUrl?: string;
  error?: string;
}

class GrantReportGenerationService {
  /**
   * Generate a report based on template and grant data
   */
  async generateReport(
    template: ReportTemplate,
    reportData: ReportData
  ): Promise<GeneratedReport> {
    try {
      const reportId = `report-${Date.now()}`;
      
      switch (template.format) {
        case 'pdf':
          return await this.generatePdfReport(template, reportData, reportId);
        case 'excel':
          return await this.generateExcelReport(template, reportData, reportId);
        case 'dashboard':
          return await this.generateDashboardReport(template, reportData, reportId);
        case 'presentation':
          return await this.generatePresentationReport(template, reportData, reportId);
        default:
          throw new Error(`Unsupported report format: ${template.format}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        reportId: '',
        format: template.format,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate PDF report
   */
  private async generatePdfReport(
    template: ReportTemplate,
    reportData: ReportData,
    reportId: string
  ): Promise<GeneratedReport> {
    try {
      const doc = new jsPDF();
      const { grantData, metrics, generatedDate } = reportData;
      
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Title Page
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(template.name, margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Grant: ${grantData.basicInfo?.grantName || 'Untitled Grant'}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Generated: ${generatedDate.toLocaleDateString()}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Funding Agency: ${grantData.basicInfo?.fundingAgency || 'N/A'}`, margin, yPosition);
      yPosition += 15;

      // Description
      if (template.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const descLines = doc.splitTextToSize(template.description, contentWidth);
        doc.text(descLines, margin, yPosition);
        yPosition += (descLines.length * 5) + 10;
      }

      // Add a line separator
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Generate sections
      for (const section of template.sections || []) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Section Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPosition);
        yPosition += 10;

        // Section Description
        if (section.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const sectionDescLines = doc.splitTextToSize(section.description, contentWidth);
          doc.text(sectionDescLines, margin, yPosition);
          yPosition += (sectionDescLines.length * 5) + 8;
        }

        // Generate content based on visualization type
        switch (section.visualizationType) {
          case 'text':
            yPosition = this.addTextContent(doc, section, reportData, margin, yPosition, contentWidth);
            break;
          case 'table':
            yPosition = this.addTableContent(doc, section, reportData, margin, yPosition, contentWidth);
            break;
          case 'metric':
            yPosition = this.addMetricContent(doc, section, metrics, margin, yPosition, contentWidth);
            break;
          case 'chart':
            yPosition = this.addChartPlaceholder(doc, section, margin, yPosition, contentWidth);
            break;
        }

        yPosition += 15;
      }

      // Footer on last page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount} | ${template.name}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Convert to blob
      const pdfBlob = doc.output('blob');

      return {
        success: true,
        reportId,
        format: 'pdf',
        data: pdfBlob,
        downloadUrl: URL.createObjectURL(pdfBlob)
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Add text content to PDF
   */
  private addTextContent(
    doc: jsPDF,
    section: any,
    reportData: ReportData,
    margin: number,
    yPosition: number,
    contentWidth: number
  ): number {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let content = '';
    
    // Generate content based on data source
    switch (section.dataSource) {
      case 'project_milestones':
        content = this.generateMilestoneText(reportData.grantData);
        break;
      case 'form_submissions':
        content = this.generateSubmissionText(reportData.grantData);
        break;
      case 'budget_data':
        content = this.generateBudgetText(reportData.grantData);
        break;
      case 'entity_activities':
        content = this.generateEntityText(reportData.grantData);
        break;
      default:
        content = 'Content will be populated based on data collection.';
    }

    const lines = doc.splitTextToSize(content, contentWidth);
    doc.text(lines, margin, yPosition);
    return yPosition + (lines.length * 5) + 5;
  }

  /**
   * Add table content to PDF
   */
  private addTableContent(
    doc: jsPDF,
    section: any,
    reportData: ReportData,
    margin: number,
    yPosition: number,
    contentWidth: number
  ): number {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Simple table rendering
    const tableData = this.getTableData(section.dataSource, reportData);
    
    if (tableData.length === 0) {
      doc.text('No data available', margin, yPosition);
      return yPosition + 10;
    }

    // Draw table headers
    doc.setFont('helvetica', 'bold');
    const headers = Object.keys(tableData[0]);
    const colWidth = contentWidth / headers.length;
    
    headers.forEach((header, index) => {
      doc.text(header, margin + (index * colWidth), yPosition);
    });
    
    yPosition += 7;
    doc.setFont('helvetica', 'normal');

    // Draw table rows
    tableData.forEach((row) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      headers.forEach((header, index) => {
        const value = String(row[header] || '');
        const truncated = value.length > 20 ? value.substring(0, 17) + '...' : value;
        doc.text(truncated, margin + (index * colWidth), yPosition);
      });
      
      yPosition += 6;
    });

    return yPosition + 5;
  }

  /**
   * Add metric content to PDF
   */
  private addMetricContent(
    doc: jsPDF,
    section: any,
    metrics: DashboardMetric[],
    margin: number,
    yPosition: number,
    contentWidth: number
  ): number {
    doc.setFontSize(10);
    
    const relevantMetrics = metrics.slice(0, 4); // Show top 4 metrics
    const metricsPerRow = 2;
    const metricWidth = contentWidth / metricsPerRow;

    relevantMetrics.forEach((metric, index) => {
      const col = index % metricsPerRow;
      const row = Math.floor(index / metricsPerRow);
      const x = margin + (col * metricWidth);
      const y = yPosition + (row * 25);

      // Metric box
      doc.setDrawColor(200);
      doc.setFillColor(245, 245, 245);
      doc.rect(x, y, metricWidth - 10, 20, 'FD');

      // Metric label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 5, y + 7);

      // Metric value
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(String(metric.value), x + 5, y + 15);
    });

    return yPosition + (Math.ceil(relevantMetrics.length / metricsPerRow) * 25) + 10;
  }

  /**
   * Add chart placeholder to PDF
   */
  private addChartPlaceholder(
    doc: jsPDF,
    section: any,
    margin: number,
    yPosition: number,
    contentWidth: number
  ): number {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    
    // Draw placeholder box
    doc.setDrawColor(150);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 60, 'FD');
    
    // Add text
    doc.text(
      `[${section.chartType?.toUpperCase() || 'CHART'} VISUALIZATION]`,
      margin + (contentWidth / 2),
      yPosition + 30,
      { align: 'center' }
    );
    
    doc.setFontSize(8);
    doc.text(
      'Chart will be generated from live data',
      margin + (contentWidth / 2),
      yPosition + 38,
      { align: 'center' }
    );

    return yPosition + 65;
  }

  /**
   * Generate Excel report
   */
  private async generateExcelReport(
    template: ReportTemplate,
    reportData: ReportData,
    reportId: string
  ): Promise<GeneratedReport> {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'CHWOne Platform';
      workbook.created = new Date();
      
      // Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.addRow(['Grant Report']);
      summarySheet.addRow(['Report Name:', template.name]);
      summarySheet.addRow(['Grant:', reportData.grantData.basicInfo?.grantName || 'N/A']);
      summarySheet.addRow(['Funding Agency:', reportData.grantData.basicInfo?.fundingAgency || 'N/A']);
      summarySheet.addRow(['Generated:', reportData.generatedDate.toLocaleDateString()]);
      summarySheet.addRow([]);
      
      // Style the header
      summarySheet.getCell('A1').font = { size: 16, bold: true };
      summarySheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      summarySheet.getCell('A1').font = { ...summarySheet.getCell('A1').font, color: { argb: 'FFFFFFFF' } };

      // Add data sheets for each section
      for (const section of template.sections || []) {
        const sheet = workbook.addWorksheet(section.title.substring(0, 30)); // Excel sheet name limit
        
        sheet.addRow([section.title]);
        sheet.getCell('A1').font = { size: 14, bold: true };
        sheet.addRow([section.description]);
        sheet.addRow([]);
        
        // Add data based on source
        const tableData = this.getTableData(section.dataSource, reportData);
        if (tableData.length > 0) {
          const headers = Object.keys(tableData[0]);
          sheet.addRow(headers);
          
          // Style headers
          const headerRow = sheet.lastRow;
          if (headerRow) {
            headerRow.font = { bold: true };
            headerRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE7E6E6' }
            };
          }
          
          // Add data rows
          tableData.forEach(row => {
            sheet.addRow(headers.map(h => row[h]));
          });
          
          // Auto-fit columns
          sheet.columns.forEach(column => {
            column.width = 15;
          });
        } else {
          sheet.addRow(['No data available']);
        }
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const excelBlob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      return {
        success: true,
        reportId,
        format: 'excel',
        data: excelBlob,
        downloadUrl: URL.createObjectURL(excelBlob)
      };
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  }

  /**
   * Generate dashboard report (returns configuration for interactive dashboard)
   */
  private async generateDashboardReport(
    template: ReportTemplate,
    reportData: ReportData,
    reportId: string
  ): Promise<GeneratedReport> {
    // Dashboard reports are interactive and don't generate a file
    // Instead, return configuration for rendering
    return {
      success: true,
      reportId,
      format: 'dashboard',
      downloadUrl: `/grants/reports/${reportId}/dashboard`
    };
  }

  /**
   * Generate presentation report (PowerPoint)
   */
  private async generatePresentationReport(
    template: ReportTemplate,
    reportData: ReportData,
    reportId: string
  ): Promise<GeneratedReport> {
    // Placeholder for future PowerPoint generation using pptxgenjs
    return {
      success: false,
      reportId,
      format: 'presentation',
      error: 'Presentation generation coming soon'
    };
  }

  /**
   * Helper: Generate milestone text
   */
  private generateMilestoneText(grantData: Partial<Grant>): string {
    const milestones = grantData.projectMilestones || [];
    if (milestones.length === 0) {
      return 'No milestones have been defined for this grant.';
    }

    let text = `This grant includes ${milestones.length} project milestones:\n\n`;
    milestones.forEach((milestone, index) => {
      text += `${index + 1}. ${milestone.title} - Target: ${milestone.targetDate}\n`;
      text += `   ${milestone.description}\n\n`;
    });
    return text;
  }

  /**
   * Helper: Generate submission text
   */
  private generateSubmissionText(grantData: Partial<Grant>): string {
    const methods = grantData.dataCollectionMethods || [];
    if (methods.length === 0) {
      return 'No data collection methods have been configured.';
    }

    let text = `Data is being collected through ${methods.length} methods:\n\n`;
    methods.forEach((method, index) => {
      text += `${index + 1}. ${method.methodName} (${method.frequency})\n`;
      text += `   Collecting ${method.dataPoints?.length || 0} data points\n\n`;
    });
    return text;
  }

  /**
   * Helper: Generate budget text
   */
  private generateBudgetText(grantData: Partial<Grant>): string {
    const funding = grantData.fundingDetails;
    if (!funding) {
      return 'Budget information not available.';
    }

    return `Total Grant Amount: $${funding.totalAmount?.toLocaleString() || '0'}\n` +
           `Start Date: ${funding.startDate || 'TBD'}\n` +
           `End Date: ${funding.endDate || 'TBD'}\n\n` +
           `Budget allocation and expenditure tracking will be detailed in subsequent reports.`;
  }

  /**
   * Helper: Generate entity text
   */
  private generateEntityText(grantData: Partial<Grant>): string {
    const entities = grantData.collaboratingEntities || [];
    if (entities.length === 0) {
      return 'No collaborating entities have been added.';
    }

    let text = `This grant involves ${entities.length} collaborating entities:\n\n`;
    entities.forEach((entity, index) => {
      text += `${index + 1}. ${entity.name} (${entity.role})\n`;
      if (entity.responsibilities) {
        text += `   Responsibilities: ${entity.responsibilities}\n`;
      }
      text += '\n';
    });
    return text;
  }

  /**
   * Helper: Get table data based on source
   */
  private getTableData(dataSource: string, reportData: ReportData): any[] {
    switch (dataSource) {
      case 'project_milestones':
        return (reportData.grantData.projectMilestones || []).map(m => ({
          'Milestone': m.title,
          'Target Date': m.targetDate,
          'Status': 'In Progress',
          'Responsible': m.responsibleEntity || 'TBD'
        }));
      
      case 'form_submissions':
        return (reportData.grantData.dataCollectionMethods || []).map(m => ({
          'Method': m.methodName,
          'Frequency': m.frequency,
          'Data Points': m.dataPoints?.length || 0,
          'Status': 'Active'
        }));
      
      case 'budget_data':
        return [{
          'Category': 'Total Grant',
          'Amount': `$${reportData.grantData.fundingDetails?.totalAmount?.toLocaleString() || '0'}`,
          'Spent': '$0',
          'Remaining': `$${reportData.grantData.fundingDetails?.totalAmount?.toLocaleString() || '0'}`
        }];
      
      case 'entity_activities':
        return (reportData.grantData.collaboratingEntities || []).map(e => ({
          'Entity': e.name,
          'Role': e.role,
          'Contact': e.contactPerson || 'N/A',
          'Status': 'Active'
        }));
      
      default:
        return [];
    }
  }
}

export const grantReportGenerationService = new GrantReportGenerationService();
