'use client';

import {
  ReportConfig,
  Report,
  Dataset,
  DatasetColumn,
  ReportSection,
  Visualization,
  ColumnStatistics,
  ReportStyle,
  StatisticsLevel
} from '@/types/bmad.types';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type ChartData = { labels: string[]; datasets: { label: string; data: number[] }[] };

const KPI_SECTION_ID = 'kpi-metrics';
const MAX_CHART_CATEGORIES = 10;
const MAX_PDF_TABLE_ROWS = 60;

/** Strips the light markdown emphasis used in section content so PDF text reads cleanly. */
function stripMarkdown(value: string): string {
  return value.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value.trim());
  return NaN;
}

function numericValues(rows: Record<string, unknown>[], column: string): number[] {
  return rows
    .map((row) => toNumber(row?.[column]))
    .filter((n) => Number.isFinite(n));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

class ReportGenerationService {
  /**
   * Generate a report from the selected datasets, honouring the requested
   * report style, cover page preference and statistics depth.
   */
  async generateReport(config: ReportConfig, datasets: Dataset[]): Promise<Report> {
    try {
      const reportId = uuidv4();
      const style: ReportStyle = config.reportStyle || 'text';
      const statisticsLevel: StatisticsLevel = config.statisticsLevel || 'basic';

      const visualizations = this.buildVisualizations(datasets);
      const sections = this.buildSections(config, datasets, style, statisticsLevel, visualizations);

      const finalConfig: ReportConfig = {
        ...config,
        id: config.id || `config-${reportId}`,
        datasets: datasets.map((dataset) => dataset.id),
        reportStyle: style,
        statisticsLevel,
        includeCoverPage: config.includeCoverPage ?? true,
        sections,
        visualizations,
        status: 'complete',
        updatedAt: new Date()
      };

      return {
        id: reportId,
        config: finalConfig,
        generatedContent: sections,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: config.userId || 'unknown',
        status: 'complete'
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

  // ---------------------------------------------------------------------------
  // Section builders
  // ---------------------------------------------------------------------------

  private buildSections(
    config: ReportConfig,
    datasets: Dataset[],
    style: ReportStyle,
    statisticsLevel: StatisticsLevel,
    visualizations: Visualization[]
  ): ReportSection[] {
    const sections: ReportSection[] = [];
    let order = 0;

    const push = (section: Omit<ReportSection, 'id' | 'order'> & { id?: string }) => {
      sections.push({
        id: section.id || `section-${order + 1}`,
        order: order++,
        title: section.title,
        type: section.type,
        content: section.content,
        visualizationId: section.visualizationId,
        tableData: section.tableData,
        tableColumns: section.tableColumns
      });
    };

    push({
      title: 'Executive Summary',
      type: 'summary',
      content: this.buildExecutiveSummary(config, datasets, style)
    });

    push({
      id: KPI_SECTION_ID,
      title: 'Key Metrics',
      type: 'table',
      tableColumns: ['Metric', 'Value'],
      tableData: this.buildKeyMetrics(datasets)
    });

    if (config.recommendation) {
      push({
        title: 'Recommendation',
        type: 'summary',
        content: config.recommendation
      });
    }

    // One-pagers stay short: summary, metrics, one chart, findings.
    if (style === 'onepager') {
      const headline = visualizations[0];
      if (headline) {
        push({ title: headline.title, type: 'visualization', visualizationId: headline.id });
      }
      push({ title: 'Key Findings', type: 'summary', content: this.buildKeyFindings(datasets) });
      if (statisticsLevel !== 'none') {
        this.pushStatisticsSections(push, datasets, statisticsLevel, 8);
      }
      return sections;
    }

    if (style === 'dashboard') {
      visualizations.forEach((viz) => {
        push({ title: viz.title, type: 'visualization', visualizationId: viz.id });
      });
      push({ title: 'Key Findings', type: 'summary', content: this.buildKeyFindings(datasets) });
      if (statisticsLevel !== 'none') {
        this.pushStatisticsSections(push, datasets, statisticsLevel);
      }
      return sections;
    }

    // Text report: narrative first, charts last.
    push({ title: 'Dataset Overview', type: 'text', content: this.buildDatasetOverview(datasets) });
    push({ title: 'Column Profiles', type: 'text', content: this.buildColumnProfiles(datasets) });
    push({ title: 'Key Findings', type: 'summary', content: this.buildKeyFindings(datasets) });
    if (statisticsLevel !== 'none') {
      this.pushStatisticsSections(push, datasets, statisticsLevel);
    }
    visualizations.forEach((viz) => {
      push({ title: viz.title, type: 'visualization', visualizationId: viz.id });
    });

    return sections;
  }

  private pushStatisticsSections(
    push: (section: Omit<ReportSection, 'id' | 'order'> & { id?: string }) => void,
    datasets: Dataset[],
    statisticsLevel: StatisticsLevel,
    maxRows?: number
  ): void {
    const stats = this.buildStatistics(datasets);
    if (stats.length === 0) return;

    const limited = maxRows ? stats.slice(0, maxRows) : stats;

    const basicColumns = ['Dataset', 'Column', 'Type', 'Count', 'Missing', 'Unique', 'Min', 'Max', 'Mean'];
    push({
      title: 'Basic Statistics',
      type: 'table',
      tableColumns: basicColumns,
      tableData: limited.map((stat) => ({
        Dataset: stat.dataset,
        Column: stat.column,
        Type: stat.type,
        Count: this.formatNumber(stat.count),
        Missing: this.formatNumber(stat.missing),
        Unique: this.formatNumber(stat.unique),
        Min: stat.min !== undefined ? this.formatNumber(stat.min) : '—',
        Max: stat.max !== undefined ? this.formatNumber(stat.max) : '—',
        Mean: stat.mean !== undefined ? this.formatNumber(stat.mean) : '—'
      }))
    });

    if (statisticsLevel !== 'advanced') return;

    const numericStats = limited.filter((stat) => stat.type === 'number' && stat.stdDev !== undefined);
    if (numericStats.length > 0) {
      const advancedColumns = ['Column', 'Median', 'Std Dev', 'Variance', 'Q1', 'Q3', 'IQR', 'Skewness', 'Kurtosis', 'Outliers'];
      push({
        title: 'Advanced Statistics',
        type: 'table',
        tableColumns: advancedColumns,
        tableData: numericStats.map((stat) => ({
          Column: `${stat.dataset} · ${stat.column}`,
          Median: stat.median !== undefined ? this.formatNumber(stat.median) : '—',
          'Std Dev': stat.stdDev !== undefined ? this.formatNumber(stat.stdDev) : '—',
          Variance: stat.variance !== undefined ? this.formatNumber(stat.variance) : '—',
          Q1: stat.q1 !== undefined ? this.formatNumber(stat.q1) : '—',
          Q3: stat.q3 !== undefined ? this.formatNumber(stat.q3) : '—',
          IQR: stat.iqr !== undefined ? this.formatNumber(stat.iqr) : '—',
          Skewness: stat.skewness !== undefined ? this.formatNumber(stat.skewness) : '—',
          Kurtosis: stat.kurtosis !== undefined ? this.formatNumber(stat.kurtosis) : '—',
          Outliers: stat.outlierCount !== undefined ? this.formatNumber(stat.outlierCount) : '—'
        }))
      });
    }

    const categorical = limited.filter((stat) => stat.type !== 'number' && stat.topValue);
    if (categorical.length > 0) {
      push({
        title: 'Categorical Distribution',
        type: 'table',
        tableColumns: ['Column', 'Distinct Values', 'Most Common', 'Occurrences', 'Share'],
        tableData: categorical.map((stat) => ({
          Column: `${stat.dataset} · ${stat.column}`,
          'Distinct Values': this.formatNumber(stat.unique),
          'Most Common': stat.topValue || '—',
          Occurrences: stat.topValueCount !== undefined ? this.formatNumber(stat.topValueCount) : '—',
          Share:
            stat.topValueCount !== undefined && stat.count > 0
              ? `${((stat.topValueCount / stat.count) * 100).toFixed(1)}%`
              : '—'
        }))
      });
    }

    const correlations = this.buildCorrelations(datasets);
    if (correlations.length > 0) {
      push({
        title: 'Correlation Analysis',
        type: 'table',
        tableColumns: ['Dataset', 'Column A', 'Column B', 'Pearson r', 'Strength'],
        tableData: correlations
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------------------------

  /**
   * Computes per-column statistics. Basic counts come from the stored column
   * metadata (full dataset); distribution measures are derived from the stored
   * preview sample, which is all the row-level data available client side.
   */
  private buildStatistics(datasets: Dataset[]): ColumnStatistics[] {
    const results: ColumnStatistics[] = [];

    datasets.forEach((dataset) => {
      const rows = (dataset.previewData || []) as Record<string, unknown>[];

      (dataset.columns || []).forEach((column) => {
        const stat: ColumnStatistics = {
          dataset: dataset.name,
          column: column.name,
          type: column.type,
          count: dataset.rowCount || rows.length,
          missing: column.missingCount ?? 0,
          unique: column.uniqueValues ?? 0,
          min: column.min,
          max: column.max,
          mean: column.mean,
          median: column.median
        };

        if (column.type === 'number') {
          Object.assign(stat, this.describeNumeric(rows, column));
        } else {
          Object.assign(stat, this.describeCategorical(rows, column));
        }

        results.push(stat);
      });
    });

    return results;
  }

  private describeNumeric(rows: Record<string, unknown>[], column: DatasetColumn): Partial<ColumnStatistics> {
    const values = numericValues(rows, column.name);
    if (values.length < 2) return {};

    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const q1 = percentile(sorted, 0.25);
    const q3 = percentile(sorted, 0.75);
    const iqr = q3 - q1;

    let skewness: number | undefined;
    let kurtosis: number | undefined;
    if (stdDev > 0) {
      skewness = values.reduce((sum, v) => sum + ((v - mean) / stdDev) ** 3, 0) / n;
      kurtosis = values.reduce((sum, v) => sum + ((v - mean) / stdDev) ** 4, 0) / n - 3;
    }

    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outlierCount = values.filter((v) => v < lowerFence || v > upperFence).length;

    return {
      median: column.median ?? percentile(sorted, 0.5),
      stdDev,
      variance,
      q1,
      q3,
      iqr,
      skewness,
      kurtosis,
      outlierCount
    };
  }

  private describeCategorical(rows: Record<string, unknown>[], column: DatasetColumn): Partial<ColumnStatistics> {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const raw = row?.[column.name];
      if (raw === null || raw === undefined || raw === '') return;
      const key = String(raw);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    if (counts.size === 0) return {};

    let topValue = '';
    let topValueCount = 0;
    counts.forEach((count, value) => {
      if (count > topValueCount) {
        topValue = value;
        topValueCount = count;
      }
    });

    return { topValue, topValueCount };
  }

  private buildCorrelations(datasets: Dataset[]): Record<string, string>[] {
    const results: Record<string, string>[] = [];

    datasets.forEach((dataset) => {
      const rows = (dataset.previewData || []) as Record<string, unknown>[];
      const numericColumns = (dataset.columns || []).filter((col) => col.type === 'number');

      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const a = numericColumns[i].name;
          const b = numericColumns[j].name;
          const pairs = rows
            .map((row) => [toNumber(row?.[a]), toNumber(row?.[b])])
            .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

          if (pairs.length < 3) continue;

          const meanA = pairs.reduce((sum, [x]) => sum + x, 0) / pairs.length;
          const meanB = pairs.reduce((sum, [, y]) => sum + y, 0) / pairs.length;
          let covariance = 0;
          let varA = 0;
          let varB = 0;
          pairs.forEach(([x, y]) => {
            covariance += (x - meanA) * (y - meanB);
            varA += (x - meanA) ** 2;
            varB += (y - meanB) ** 2;
          });

          if (varA === 0 || varB === 0) continue;
          const r = covariance / Math.sqrt(varA * varB);
          const magnitude = Math.abs(r);
          const strength =
            magnitude >= 0.7 ? 'Strong' : magnitude >= 0.4 ? 'Moderate' : magnitude >= 0.2 ? 'Weak' : 'Negligible';

          results.push({
            Dataset: dataset.name,
            'Column A': a,
            'Column B': b,
            'Pearson r': r.toFixed(3),
            Strength: `${strength} ${r >= 0 ? 'positive' : 'negative'}`
          });
        }
      }
    });

    return results.sort((x, y) => Math.abs(Number(y['Pearson r'])) - Math.abs(Number(x['Pearson r']))).slice(0, 15);
  }

  // ---------------------------------------------------------------------------
  // Narrative builders
  // ---------------------------------------------------------------------------

  private buildKeyMetrics(datasets: Dataset[]): Record<string, string>[] {
    const totalRows = datasets.reduce((sum, dataset) => sum + (dataset.rowCount || 0), 0);
    const allColumns = datasets.flatMap((dataset) => dataset.columns || []);
    const numericCount = allColumns.filter((col) => col.type === 'number').length;
    const dateCount = allColumns.filter((col) => col.type === 'date').length;
    const textCount = allColumns.filter((col) => col.type === 'string').length;
    const missingTotal = allColumns.reduce((sum, col) => sum + (col.missingCount || 0), 0);
    const cells = totalRows * Math.max(allColumns.length, 1);
    const completeness = cells > 0 ? ((1 - missingTotal / cells) * 100).toFixed(1) : '100.0';

    return [
      { Metric: 'Datasets', Value: this.formatNumber(datasets.length) },
      { Metric: 'Total Records', Value: this.formatNumber(totalRows) },
      { Metric: 'Total Columns', Value: this.formatNumber(allColumns.length) },
      { Metric: 'Numeric Columns', Value: this.formatNumber(numericCount) },
      { Metric: 'Date Columns', Value: this.formatNumber(dateCount) },
      { Metric: 'Text Columns', Value: this.formatNumber(textCount) },
      { Metric: 'Missing Values', Value: this.formatNumber(missingTotal) },
      { Metric: 'Data Completeness', Value: `${completeness}%` }
    ];
  }

  private buildExecutiveSummary(config: ReportConfig, datasets: Dataset[], style: ReportStyle): string {
    const datasetNames = datasets.map((dataset) => dataset.name).join(', ');
    const totalRows = datasets.reduce((sum, dataset) => sum + (dataset.rowCount || 0), 0);
    const totalColumns = datasets.reduce((sum, dataset) => sum + (dataset.columns || []).length, 0);

    const parts: string[] = [];
    if (config.description) parts.push(config.description);

    parts.push(
      `This ${style === 'onepager' ? 'one-page summary' : style === 'dashboard' ? 'dashboard report' : 'report'} analyzes ${datasets.length} dataset${datasets.length === 1 ? '' : 's'} containing ${totalRows.toLocaleString()} record${totalRows === 1 ? '' : 's'} across ${totalColumns} column${totalColumns === 1 ? '' : 's'}.`
    );

    if (datasetNames) parts.push(`Datasets included: ${datasetNames}.`);

    return parts.join('\n\n');
  }

  private buildDatasetOverview(datasets: Dataset[]): string {
    return datasets
      .map((dataset) => {
        const columns = dataset.columns || [];
        const numeric = columns.filter((col) => col.type === 'number').map((col) => col.name);
        const dates = columns.filter((col) => col.type === 'date').map((col) => col.name);
        const text = columns.filter((col) => col.type === 'string').map((col) => col.name);

        return [
          `${dataset.name} (${dataset.format.toUpperCase()}, ${(dataset.rowCount || 0).toLocaleString()} rows, ${columns.length} columns)`,
          `  Numeric columns: ${numeric.join(', ') || 'None'}`,
          `  Date columns: ${dates.join(', ') || 'None'}`,
          `  Text columns: ${text.join(', ') || 'None'}`
        ].join('\n');
      })
      .join('\n\n');
  }

  private buildColumnProfiles(datasets: Dataset[]): string {
    const profiles: string[] = [];

    datasets.forEach((dataset) => {
      (dataset.columns || []).forEach((col) => {
        const parts: string[] = [`${col.name} (${col.type})`];
        if (col.type === 'number') {
          if (col.min !== undefined) parts.push(`min ${this.formatNumber(col.min)}`);
          if (col.max !== undefined) parts.push(`max ${this.formatNumber(col.max)}`);
          if (col.mean !== undefined) parts.push(`mean ${this.formatNumber(col.mean)}`);
          if (col.median !== undefined) parts.push(`median ${this.formatNumber(col.median)}`);
        }
        if (col.uniqueValues !== undefined) parts.push(`${col.uniqueValues.toLocaleString()} unique`);
        if (col.missingCount) parts.push(`${col.missingCount.toLocaleString()} missing`);
        profiles.push(parts.join(' • '));
      });
    });

    return profiles.join('\n');
  }

  private buildKeyFindings(datasets: Dataset[]): string {
    const findings: string[] = [];

    datasets.forEach((dataset) => {
      const columns = dataset.columns || [];

      columns
        .filter((col) => col.type === 'number' && col.mean !== undefined)
        .slice(0, 6)
        .forEach((col) => {
          const range =
            col.min !== undefined && col.max !== undefined
              ? ` (range ${this.formatNumber(col.min)} to ${this.formatNumber(col.max)})`
              : '';
          findings.push(`The average ${col.name} is ${this.formatNumber(col.mean as number)}${range}.`);
        });

      const incomplete = columns
        .filter((col) => (col.missingCount || 0) > 0)
        .sort((a, b) => (b.missingCount || 0) - (a.missingCount || 0))
        .slice(0, 3);

      incomplete.forEach((col) => {
        const pct = dataset.rowCount ? (((col.missingCount || 0) / dataset.rowCount) * 100).toFixed(1) : '0.0';
        findings.push(`${col.name} is missing ${(col.missingCount || 0).toLocaleString()} values (${pct}% of records).`);
      });
    });

    return findings.length > 0
      ? findings.map((finding) => `- ${finding}`).join('\n')
      : 'No numeric findings are available for the selected datasets.';
  }

  // ---------------------------------------------------------------------------
  // Visualizations
  // ---------------------------------------------------------------------------

  private buildVisualizations(datasets: Dataset[]): Visualization[] {
    const visualizations: Visualization[] = [];

    datasets.forEach((dataset) => {
      const columns = dataset.columns || [];
      const categoryColumns = columns.filter((col) => col.type === 'string').slice(0, 2);
      const numericColumns = columns.filter((col) => col.type === 'number').slice(0, 2);

      if (numericColumns.length === 0) {
        // No measures: chart record counts per category instead.
        const category = categoryColumns[0];
        if (!category) return;
        const data = this.buildCountChartData(dataset, category);
        if (!data) return;
        visualizations.push({
          id: `viz-${dataset.id}-count`,
          type: 'bar',
          title: `Record count by ${category.name}`,
          description: `Number of records per ${category.name} in ${dataset.name}`,
          data,
          datasetId: dataset.id,
          dimensions: [category.name],
          measures: ['count']
        });
        return;
      }

      numericColumns.forEach((numericColumn) => {
        const category = categoryColumns[0];
        const data = this.buildChartData(dataset, category, numericColumn);
        if (!data) return;
        visualizations.push({
          id: `viz-${dataset.id}-${numericColumn.name}`,
          type: 'bar',
          title: `${numericColumn.name} by ${category ? category.name : 'total'}`,
          description: `Aggregated ${numericColumn.name} from ${dataset.name}`,
          data,
          datasetId: dataset.id,
          dimensions: category ? [category.name] : [],
          measures: [numericColumn.name]
        });
      });
    });

    return visualizations;
  }

  private buildChartData(
    dataset: Dataset,
    categoryColumn: DatasetColumn | undefined,
    numericColumn: DatasetColumn
  ): ChartData | null {
    const rows = (dataset.previewData || []) as Record<string, unknown>[];
    if (rows.length === 0) return null;

    const aggregated = new Map<string, number>();

    rows.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const category = categoryColumn ? String(row[categoryColumn.name] ?? 'Unknown') : 'Total';
      const value = toNumber(row[numericColumn.name]);
      if (!Number.isFinite(value)) return;
      aggregated.set(category, (aggregated.get(category) || 0) + value);
    });

    if (aggregated.size === 0) return null;

    const sorted = Array.from(aggregated.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CHART_CATEGORIES);

    return {
      labels: sorted.map(([label]) => label),
      datasets: [{ label: numericColumn.name, data: sorted.map(([, value]) => value) }]
    };
  }

  private buildCountChartData(dataset: Dataset, categoryColumn: DatasetColumn): ChartData | null {
    const rows = (dataset.previewData || []) as Record<string, unknown>[];
    if (rows.length === 0) return null;

    const counts = new Map<string, number>();
    rows.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const key = String(row[categoryColumn.name] ?? 'Unknown');
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    if (counts.size === 0) return null;

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CHART_CATEGORIES);

    return {
      labels: sorted.map(([label]) => label),
      datasets: [{ label: 'Records', data: sorted.map(([, value]) => value) }]
    };
  }

  private formatNumber(value: number): string {
    if (!Number.isFinite(value)) return '—';
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  // ---------------------------------------------------------------------------
  // PDF export
  // ---------------------------------------------------------------------------

  /**
   * Renders the report to a PDF and returns a blob URL. The caller is
   * responsible for revoking the URL once the download has been triggered.
   */
  async exportToPdf(report: Report): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('PDF export is only available in the browser');
    }

    try {
      const doc = new jsPDF();
      const margin = 16;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 22;
      const style: ReportStyle = report.config.reportStyle || 'text';
      const accent: [number, number, number] = [0, 113, 227];

      let y = margin + 8;

      // jsPDF measures the page in mm but font sizes in points, so convert
      // before advancing the cursor or lines overlap.
      const PT_TO_MM = 0.3528;
      const lineHeight = (): number => doc.getFontSize() * PT_TO_MM * doc.getLineHeightFactor();

      const ensureSpace = (needed: number) => {
        if (y + needed > bottomLimit) {
          doc.addPage();
          y = margin + 8;
        }
      };

      const writeText = (text: string, size: number, fontStyle: 'normal' | 'bold' | 'italic', gap = 4) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(stripMarkdown(text), contentWidth) as string[];
        lines.forEach((line) => {
          ensureSpace(lineHeight());
          doc.text(line, margin, y);
          y += lineHeight();
        });
        y += gap;
      };

      if (report.config.includeCoverPage ?? true) {
        this.renderCoverPage(doc, report, margin, pageWidth, pageHeight, accent, style);
        doc.addPage();
        y = margin + 8;
      }

      // Report heading (repeated at the top of the body for context).
      doc.setTextColor(29, 29, 31);
      writeText(report.config.title || 'Untitled Report', 18, 'bold', 2);
      doc.setTextColor(110, 110, 115);
      writeText(
        `${style === 'onepager' ? 'One-page summary' : style === 'dashboard' ? 'Dashboard report' : 'Detailed report'}  ·  Generated ${new Date(report.updatedAt).toLocaleString()}`,
        9,
        'normal',
        6
      );
      doc.setTextColor(29, 29, 31);

      (report.config.sections || []).forEach((section) => {
        ensureSpace(18);

        doc.setDrawColor(accent[0], accent[1], accent[2]);
        doc.setLineWidth(0.8);
        doc.line(margin, y - 4, margin + 22, y - 4);
        doc.setLineWidth(0.2);
        writeText(section.title, 13, 'bold', 3);

        if (section.type === 'text' || section.type === 'summary') {
          if (section.content) writeText(section.content, 10, 'normal', 7);
          return;
        }

        if (section.type === 'table' && section.tableColumns && section.tableData) {
          if (section.id === KPI_SECTION_ID && style !== 'text') {
            y = this.renderKpiCards(doc, section.tableData, margin, y, contentWidth, accent, ensureSpace);
            return;
          }
          y = this.renderTable(doc, section, margin, y, accent);
          return;
        }

        if (section.type === 'visualization') {
          const visualization = report.config.visualizations?.find((v) => v.id === section.visualizationId);
          if (!visualization) return;
          const chartHeight = style === 'dashboard' ? 62 : 52;
          ensureSpace(chartHeight + 16);
          if (visualization.description) writeText(visualization.description, 9, 'italic', 3);
          y = this.renderBarChart(doc, visualization.data as ChartData, margin, y, contentWidth, chartHeight, accent);
          y += 8;
        }
      });

      this.renderFooters(doc, margin, pageWidth, pageHeight, report.config.title || 'Report');

      const output = doc.output('bloburl');
      return typeof output === 'string' ? output : output.toString();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private renderCoverPage(
    doc: jsPDF,
    report: Report,
    margin: number,
    pageWidth: number,
    pageHeight: number,
    accent: [number, number, number],
    style: ReportStyle
  ): void {
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, 0, pageWidth, 76, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('CHWOne Analytics', margin, 30);

    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(report.config.title || 'Untitled Report', pageWidth - margin * 2) as string[];
    let titleY = 48;
    titleLines.slice(0, 2).forEach((line) => {
      doc.text(line, margin, titleY);
      titleY += 12;
    });

    doc.setTextColor(29, 29, 31);
    let y = 100;

    if (report.config.description) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(report.config.description, pageWidth - margin * 2) as string[];
      lines.slice(0, 6).forEach((line) => {
        doc.text(line, margin, y);
        y += 7;
      });
      y += 8;
    }

    const styleLabel =
      style === 'onepager' ? 'One-page summary' : style === 'dashboard' ? 'Dashboard report' : 'Detailed text report';

    const details: [string, string][] = [
      ['Report type', styleLabel],
      ['Statistics', (report.config.statisticsLevel || 'basic').replace(/^\w/, (c) => c.toUpperCase())],
      ['Datasets', String(report.config.datasets?.length ?? 0)],
      ['Sections', String(report.config.sections?.length ?? 0)],
      ['Generated', new Date(report.updatedAt).toLocaleString()],
      ['Prepared by', report.userId || 'Unknown']
    ];

    doc.setDrawColor(210, 210, 215);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    details.forEach(([label, value]) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(110, 110, 115);
      doc.text(label.toUpperCase(), margin, y);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(29, 29, 31);
      doc.text(value, margin + 55, y);
      y += 9;
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(134, 134, 139);
    doc.text('Confidential — for internal program use only.', margin, pageHeight - 20);
    doc.setTextColor(29, 29, 31);
  }

  private renderKpiCards(
    doc: jsPDF,
    metrics: Record<string, unknown>[],
    margin: number,
    startY: number,
    contentWidth: number,
    accent: [number, number, number],
    ensureSpace: (needed: number) => void
  ): number {
    const perRow = 4;
    const gap = 4;
    const cardWidth = (contentWidth - gap * (perRow - 1)) / perRow;
    const cardHeight = 22;
    let y = startY;

    metrics.forEach((metric, index) => {
      const column = index % perRow;
      if (column === 0) {
        ensureSpace(cardHeight + 4);
        y = index === 0 ? y : y + cardHeight + gap;
      }
      const x = margin + column * (cardWidth + gap);

      doc.setFillColor(245, 245, 247);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(110, 110, 115);
      doc.text(String(metric.Metric ?? '').toUpperCase(), x + 3, y + 7, { maxWidth: cardWidth - 6 });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(String(metric.Value ?? '—'), x + 3, y + 17, { maxWidth: cardWidth - 6 });
    });

    doc.setTextColor(29, 29, 31);
    return y + cardHeight + 10;
  }

  private renderTable(
    doc: jsPDF,
    section: ReportSection,
    margin: number,
    startY: number,
    accent: [number, number, number]
  ): number {
    const headers = section.tableColumns || [];
    const rows = (section.tableData || []).slice(0, MAX_PDF_TABLE_ROWS).map((row) =>
      headers.map((column) => String((row as Record<string, unknown>)[column] ?? ''))
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 1.8, overflow: 'linebreak', textColor: [29, 29, 31] },
      headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 250] },
      theme: 'grid'
    });

    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? startY;
    return finalY + 10;
  }

  private renderBarChart(
    doc: jsPDF,
    data: ChartData | undefined,
    x: number,
    y: number,
    width: number,
    height: number,
    accent: [number, number, number]
  ): number {
    const labels = data?.labels || [];
    const values = data?.datasets?.[0]?.data || [];

    if (labels.length === 0 || values.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(134, 134, 139);
      doc.text('No chart data available for this section.', x, y + 4);
      doc.setTextColor(29, 29, 31);
      return y + 10;
    }

    const plotHeight = height - 12;
    const baseline = y + plotHeight;
    const max = Math.max(...values, 0);

    doc.setDrawColor(210, 210, 215);
    doc.line(x, baseline, x + width, baseline);

    const slot = width / labels.length;
    const barWidth = Math.min(slot * 0.6, 16);

    labels.forEach((label, index) => {
      const value = values[index] ?? 0;
      const barHeight = max > 0 ? (value / max) * (plotHeight - 8) : 0;
      const barX = x + slot * index + (slot - barWidth) / 2;

      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.rect(barX, baseline - barHeight, barWidth, barHeight, 'F');

      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(29, 29, 31);
      doc.text(this.formatNumber(value), barX + barWidth / 2, baseline - barHeight - 1.5, { align: 'center' });

      doc.setTextColor(110, 110, 115);
      const shortLabel = label.length > 12 ? `${label.slice(0, 11)}…` : label;
      doc.text(shortLabel, barX + barWidth / 2, baseline + 5, { align: 'center' });
    });

    doc.setTextColor(29, 29, 31);
    return baseline + 10;
  }

  private renderFooters(doc: jsPDF, margin: number, pageWidth: number, pageHeight: number, title: string): void {
    const pageCount = doc.getNumberOfPages();
    const startPage = 1;

    for (let i = startPage; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(134, 134, 139);
      doc.text(title.slice(0, 60), margin, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    doc.setTextColor(29, 29, 31);
  }

  // ---------------------------------------------------------------------------
  // Persistence placeholders (reports are written from the Reports page)
  // ---------------------------------------------------------------------------

  async saveReport(report: Report): Promise<Report> {
    return { ...report, updatedAt: new Date() };
  }

  async getReport(reportId: string): Promise<Report | null> {
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
          }
        ],
        visualizations: [],
        status: 'complete',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
      },
      generatedContent: [
        {
          id: 'section-1',
          title: 'Introduction',
          content: 'This is the introduction section of the report.',
          type: 'text',
          order: 0
        }
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      userId: 'user-1',
      status: 'complete'
    };
  }

  async getUserReports(userId: string): Promise<Report[]> {
    return [
      {
        id: 'report-1',
        config: {
          id: 'config-1',
          title: 'Monthly Sales Analysis',
          description: 'Analysis of sales data for the current month',
          status: 'complete',
          createdAt: new Date(Date.now() - 86400000 * 7),
          updatedAt: new Date(Date.now() - 86400000 * 6)
        },
        createdAt: new Date(Date.now() - 86400000 * 7),
        updatedAt: new Date(Date.now() - 86400000 * 6),
        userId,
        status: 'complete'
      }
    ];
  }
}

export const reportGenerationService = new ReportGenerationService();
