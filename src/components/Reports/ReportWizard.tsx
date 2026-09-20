'use client';

import React, { useMemo, useState } from 'react';
import {
  AlignLeft,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Loader2,
  Merge,
  Sparkles,
  StickyNote,
  X
} from 'lucide-react';
import { Dataset, Report, ReportConfig, ReportStyle, StatisticsLevel } from '@/types/bmad.types';
import { reportGenerationService } from '@/services/bmad/ReportGenerationService';
import { dataProcessingService } from '@/services/bmad/DataProcessingService';

interface ReportWizardProps {
  datasets: Dataset[];
  userId: string;
  onGenerate: (report: Report) => void;
  onCancel: () => void;
}

const STEPS = ['Select Datasets', 'Merge Datasets', 'Configure Report', 'Recommendation', 'Preview & Save'];

type MergeType = 'union' | 'intersection' | 'inner' | 'left' | 'right' | 'outer';

const JOIN_TYPES: MergeType[] = ['inner', 'left', 'right', 'outer'];

const REPORT_STYLES: { value: ReportStyle; label: string; description: string; Icon: typeof FileText }[] = [
  {
    value: 'text',
    label: 'Text report',
    description: 'Narrative sections, dataset overview and column profiles.',
    Icon: AlignLeft
  },
  {
    value: 'dashboard',
    label: 'Dashboard report',
    description: 'Metric cards plus charts and graphs for every measure.',
    Icon: LayoutDashboard
  },
  {
    value: 'onepager',
    label: 'One-pager summary',
    description: 'Condensed summary, headline metrics and a single chart.',
    Icon: StickyNote
  }
];

const STATISTICS_LEVELS: { value: StatisticsLevel; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'Skip statistical tables entirely.' },
  {
    value: 'basic',
    label: 'Basic',
    description: 'Counts, missing values, unique values, min, max and mean.'
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Adds median, standard deviation, quartiles, skewness, outliers and correlations.'
  }
];

export default function ReportWizard({ datasets, userId, onGenerate, onCancel }: ReportWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<ReportConfig['format']>('pdf');
  const [theme, setTheme] = useState<ReportConfig['theme']>('professional');
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [reportStyle, setReportStyle] = useState<ReportStyle>('text');
  const [statisticsLevel, setStatisticsLevel] = useState<StatisticsLevel>('basic');
  const [recommendation, setRecommendation] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [mergeEnabled, setMergeEnabled] = useState(false);
  const [mergeType, setMergeType] = useState<MergeType>('union');
  const [mergeKeyColumns, setMergeKeyColumns] = useState<string[]>([]);
  const [mergeName, setMergeName] = useState('Merged Dataset');
  const [mergeAiReasoning, setMergeAiReasoning] = useState('');
  const [mergeAiLoading, setMergeAiLoading] = useState(false);
  const [mergeAiError, setMergeAiError] = useState<string | null>(null);
  const [mergedDataset, setMergedDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<Report | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const selectedDatasets = useMemo(
    () => datasets.filter((dataset) => selectedIds.has(dataset.id)),
    [datasets, selectedIds]
  );

  const commonColumns = useMemo(() => {
    if (selectedDatasets.length < 2) return [];
    const [first, ...rest] = selectedDatasets.map((dataset) =>
      new Set((dataset.columns || []).map((col) => col.name))
    );
    return Array.from(first).filter((column) => rest.every((set) => set.has(column)));
  }, [selectedDatasets]);

  const canMerge = selectedDatasets.length >= 2;

  const toggleDataset = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedIds.size > 0;
      case 1:
        // Merge step is optional, but joins need at least one key column.
        if (!mergeEnabled) return true;
        if (!canMerge) return false;
        if (JOIN_TYPES.includes(mergeType)) return mergeKeyColumns.length > 0;
        return true;
      case 2:
        return title.trim().length > 0;
      case 3:
        return true;
      case 4:
        return preview?.status === 'complete';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3) {
      generatePreview();
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleGetAiRecommendation = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/recommend-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasets: selectedDatasets,
          currentConfig: buildConfig(),
          userPrompt: recommendation
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to get AI recommendation');
      }

      const suggestion = result.recommendation || '';
      setAiRecommendation(suggestion);
      if (suggestion) setRecommendation(suggestion);
      if (result.suggestedConfig?.title) setTitle(result.suggestedConfig.title);
      if (result.suggestedConfig?.description) setDescription(result.suggestedConfig.description);
    } catch (err) {
      console.error('Error getting AI recommendation:', err);
      setAiError(err instanceof Error ? err.message : 'Failed to get AI recommendation');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetAiMergeRecommendation = async () => {
    if (!canMerge) return;
    setMergeAiLoading(true);
    setMergeAiError(null);
    try {
      const response = await fetch('/api/ai/recommend-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasets: selectedDatasets })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to get merge recommendation');
      }

      const allowed: MergeType[] = ['union', 'intersection', 'inner', 'left', 'right', 'outer'];
      if (allowed.includes(result.mergeType)) {
        setMergeType(result.mergeType);
      }
      if (Array.isArray(result.keyColumns)) {
        setMergeKeyColumns(result.keyColumns.filter((col: string) => commonColumns.includes(col)));
      }
      setMergeAiReasoning(result.reasoning || '');
      if (result.reportTitle && !title) setTitle(result.reportTitle);
      if (result.reportDescription && !description) setDescription(result.reportDescription);
    } catch (err) {
      console.error('Error getting merge recommendation:', err);
      setMergeAiError(err instanceof Error ? err.message : 'Failed to get merge recommendation');
    } finally {
      setMergeAiLoading(false);
    }
  };

  const buildConfig = (): ReportConfig => ({
    title: title.trim(),
    description: description.trim(),
    datasets: Array.from(selectedIds),
    format,
    theme,
    includeCoverPage,
    reportStyle,
    statisticsLevel,
    recommendation: recommendation.trim() || aiRecommendation.trim() || undefined,
    userId,
    status: 'draft'
  });

  const generatePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      let reportDatasets = selectedDatasets;

      if (mergeEnabled && canMerge) {
        const merged = await dataProcessingService.mergeDatasets(selectedDatasets, {
          mergeType,
          keyColumns: mergeKeyColumns,
          name: mergeName
        });
        setMergedDataset(merged);
        reportDatasets = [merged];
      } else {
        setMergedDataset(null);
      }

      const config = buildConfig();
      const report = await reportGenerationService.generateReport(config, reportDatasets);
      if (report.status === 'error') {
        throw new Error(report.error || 'Report generation failed');
      }
      setPreview(report);
    } catch (err) {
      console.error('Error generating preview:', err);
      setPreviewError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;
    onGenerate(preview);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, index) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                index < step
                  ? 'bg-[#34C759] text-white'
                  : index === step
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#F5F5F7] text-[#86868B]'
              }`}
            >
              {index < step ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span
              className={`text-xs ${
                index === step ? 'text-[#0071E3] font-medium' : 'text-[#86868B]'
              }`}
            >
              {label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                index < step ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderDatasetStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Select Datasets</h3>
        <p className="text-sm text-[#6E6E73]">Choose one or more datasets to include in your report.</p>
      </div>

      {datasets.length === 0 ? (
        <div className="text-center py-12 bg-[#F5F5F7] rounded-2xl">
          <BarChart3 className="w-10 h-10 text-[#86868B] mx-auto mb-3" />
          <p className="text-[#1D1D1F] font-medium">No datasets available</p>
          <p className="text-sm text-[#6E6E73]">Upload datasets first to create a report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((dataset) => {
            const isSelected = selectedIds.has(dataset.id);
            return (
              <button
                key={dataset.id}
                onClick={() => toggleDataset(dataset.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#0071E3] bg-[#0071E3]/5'
                    : 'border-[#D2D2D7] bg-white hover:bg-[#F5F5F7]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#1D1D1F] truncate">{dataset.name}</h4>
                    {dataset.description && (
                      <p className="text-sm text-[#6E6E73] line-clamp-2 mt-1">{dataset.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                        {dataset.format.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                        {(dataset.rowCount ?? 0).toLocaleString()} rows
                      </span>
                      <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                        {dataset.columns?.length ?? 0} columns
                      </span>
                      <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                        {formatFileSize(dataset.size ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-[#0071E3] bg-[#0071E3]' : 'border-[#D2D2D7]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedDatasets.length > 0 && (
        <div className="p-4 bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-2xl">
          <p className="text-sm font-medium text-[#0071E3] mb-2">
            {selectedDatasets.length} dataset{selectedDatasets.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDatasets.map((dataset) => (
              <span
                key={dataset.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#0071E3]/30 rounded-full text-sm text-[#0071E3]"
              >
                {dataset.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDataset(dataset.id);
                  }}
                  className="ml-1 hover:text-[#FF3B30]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMergeStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Merge Datasets</h3>
        <p className="text-sm text-[#6E6E73]">
          Combine multiple datasets, or let AI recommend the best way to report them together.
        </p>
      </div>

      {!canMerge ? (
        <div className="p-4 bg-[#F5F5F7] rounded-2xl text-sm text-[#6E6E73]">
          Select two or more datasets on the previous step to enable merging.
        </div>
      ) : (
        <>
          <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#D2D2D7] cursor-pointer hover:bg-[#F5F5F7] transition-colors">
            <input
              type="checkbox"
              checked={mergeEnabled}
              onChange={(e) => setMergeEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#0071E3]"
            />
            <div>
              <p className="font-medium text-[#1D1D1F]">Merge selected datasets into one combined dataset</p>
              <p className="text-xs text-[#6E6E73]">
                {selectedDatasets.length} datasets will be combined before generating the report.
              </p>
            </div>
          </label>

          {mergeEnabled && (
            <div className="space-y-4 p-4 bg-white rounded-2xl border border-[#D2D2D7]">
              <div className="space-y-2">
                <label htmlFor="merge-name" className="block text-sm font-medium text-[#1D1D1F]">
                  Merged Dataset Name
                </label>
                <input
                  id="merge-name"
                  type="text"
                  value={mergeName}
                  onChange={(e) => setMergeName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="merge-type" className="block text-sm font-medium text-[#1D1D1F]">
                    Merge Type
                  </label>
                  <select
                    id="merge-type"
                    value={mergeType}
                    onChange={(e) => setMergeType(e.target.value as typeof mergeType)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white"
                  >
                    <option value="union">Union (stack rows)</option>
                    <option value="intersection">Intersection (common columns only)</option>
                    <option value="inner">Inner Join (matching rows only)</option>
                    <option value="left">Left Join (keep all first dataset rows)</option>
                    <option value="right">Right Join (keep all second dataset rows)</option>
                    <option value="outer">Outer Join (keep all rows)</option>
                  </select>
                </div>

                {mergeType !== 'union' && mergeType !== 'intersection' && (
                  <div className="space-y-2">
                    <label htmlFor="merge-keys" className="block text-sm font-medium text-[#1D1D1F]">
                      Key Columns (Ctrl/Cmd + click to select multiple)
                    </label>
                    <select
                      id="merge-keys"
                      multiple
                      value={mergeKeyColumns}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions).map((option) => option.value);
                        setMergeKeyColumns(options);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white min-h-[120px]"
                    >
                      {commonColumns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                    {commonColumns.length === 0 && (
                      <p className="text-xs text-[#FF3B30]">No common columns found across selected datasets.</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleGetAiMergeRecommendation}
                disabled={mergeAiLoading}
                className="flex items-center gap-2 px-5 py-3 bg-[#AF52DE] text-white rounded-xl font-medium text-sm hover:bg-[#9B3DC9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mergeAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
                {mergeAiLoading ? 'Analyzing...' : 'Get AI Merge Recommendation'}
              </button>

              {mergeAiError && (
                <div className="flex items-start gap-3 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl text-sm text-[#FF3B30]">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <p>{mergeAiError}</p>
                </div>
              )}

              {mergeAiReasoning && (
                <div className="p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Merge className="w-4 h-4 text-[#34C759]" />
                    <h4 className="text-sm font-semibold text-[#34C759]">AI Merge Recommendation</h4>
                  </div>
                  <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">{mergeAiReasoning}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Configure Report</h3>
        <p className="text-sm text-[#6E6E73]">Set the title, description, and look of your report.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="report-title" className="block text-sm font-medium text-[#1D1D1F]">
          Report Title <span className="text-[#FF3B30]">*</span>
        </label>
        <input
          id="report-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Q1 Community Health Outcomes"
          className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="report-description" className="block text-sm font-medium text-[#1D1D1F]">
          Description
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Briefly describe what this report covers and why it matters."
          className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="report-format" className="block text-sm font-medium text-[#1D1D1F]">
            Format
          </label>
          <select
            id="report-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as ReportConfig['format'])}
            className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white"
          >
            <option value="pdf">PDF</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="report-theme" className="block text-sm font-medium text-[#1D1D1F]">
            Theme
          </label>
          <select
            id="report-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ReportConfig['theme'])}
            className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white"
          >
            <option value="professional">Professional</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="colorful">Colorful</option>
          </select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-[#1D1D1F] mb-2">Report type</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {REPORT_STYLES.map(({ value, label, description, Icon }) => {
            const isActive = reportStyle === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setReportStyle(value)}
                aria-pressed={isActive}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-[#0071E3] bg-[#0071E3]/5 ring-2 ring-[#0071E3]/20'
                    : 'border-[#D2D2D7] bg-white hover:bg-[#F5F5F7]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0071E3]' : 'text-[#86868B]'}`} />
                  <span className="text-sm font-semibold text-[#1D1D1F]">{label}</span>
                </div>
                <p className="text-xs text-[#6E6E73]">{description}</p>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-[#D2D2D7] cursor-pointer hover:bg-[#F5F5F7] transition-colors">
        <input
          type="checkbox"
          checked={includeCoverPage}
          onChange={(e) => setIncludeCoverPage(e.target.checked)}
          className="w-5 h-5 mt-0.5 accent-[#0071E3]"
        />
        <div>
          <p className="font-medium text-[#1D1D1F] text-sm">Include a professional cover page</p>
          <p className="text-xs text-[#6E6E73]">
            Adds a branded title page with the report type, dataset count, author and generation date.
          </p>
        </div>
      </label>

      <div className="space-y-2">
        <label htmlFor="report-statistics" className="block text-sm font-medium text-[#1D1D1F]">
          Statistics
        </label>
        <select
          id="report-statistics"
          value={statisticsLevel}
          onChange={(e) => setStatisticsLevel(e.target.value as StatisticsLevel)}
          className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white"
        >
          {STATISTICS_LEVELS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[#6E6E73]">
          {STATISTICS_LEVELS.find((level) => level.value === statisticsLevel)?.description}
        </p>
      </div>

      {selectedDatasets.length > 0 && (
        <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-3">
          <h4 className="text-sm font-semibold text-[#1D1D1F]">Selected Datasets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className="p-3 bg-white rounded-xl border border-[#D2D2D7]"
              >
                <p className="font-medium text-[#1D1D1F] text-sm truncate">{dataset.name}</p>
                <p className="text-xs text-[#6E6E73]">
                  {(dataset.rowCount ?? 0).toLocaleString()} rows • {dataset.columns?.length ?? 0} columns
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRecommendationStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Recommendation</h3>
        <p className="text-sm text-[#6E6E73]">
          Describe the insights or recommendations you want highlighted, or let AI suggest a structure.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="recommendation" className="block text-sm font-medium text-[#1D1D1F]">
          Your recommendation / focus
        </label>
        <textarea
          id="recommendation"
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          rows={4}
          placeholder="e.g., Compare blood pressure outcomes across zip codes and identify areas needing additional outreach."
          className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none text-[#1D1D1F] bg-white resize-none"
        />
      </div>

      <button
        onClick={handleGetAiRecommendation}
        disabled={aiLoading || selectedDatasets.length === 0}
        className="flex items-center gap-2 px-5 py-3 bg-[#AF52DE] text-white rounded-xl font-medium text-sm hover:bg-[#9B3DC9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {aiLoading ? 'Getting AI recommendation...' : 'Get AI Recommendation'}
      </button>

      {aiError && (
        <div className="flex items-start gap-3 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl text-sm text-[#FF3B30]">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{aiError}</p>
        </div>
      )}

      {aiRecommendation && (
        <div className="p-4 bg-[#34C759]/10 border border-[#34C759]/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#34C759]" />
            <h4 className="text-sm font-semibold text-[#34C759]">AI Recommendation</h4>
          </div>
          <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">{aiRecommendation}</p>
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Preview & Save</h3>
        <p className="text-sm text-[#6E6E73]">Review the generated report before saving.</p>
      </div>

      {previewLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin mb-3" />
          <p className="text-sm text-[#6E6E73]">Generating report preview...</p>
        </div>
      )}

      {previewError && (
        <div className="flex items-start gap-3 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl text-sm text-[#FF3B30]">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{previewError}</p>
        </div>
      )}

      {preview && !previewLoading && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-[#D2D2D7]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF2D55] rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#1D1D1F]">{preview.config.title}</h4>
                {preview.config.description && (
                  <p className="text-sm text-[#6E6E73] mt-1">{preview.config.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                    {preview.config.sections?.length ?? 0} sections
                  </span>
                  <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                    {preview.config.visualizations?.length ?? 0} visualizations
                  </span>
                  <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full">
                    {selectedDatasets.length} dataset{selectedDatasets.length === 1 ? '' : 's'}
                  </span>
                  <span className="px-2 py-0.5 bg-[#0071E3]/10 text-[#0071E3] text-xs rounded-full">
                    {REPORT_STYLES.find((s) => s.value === reportStyle)?.label}
                  </span>
                  <span className="px-2 py-0.5 bg-[#0071E3]/10 text-[#0071E3] text-xs rounded-full">
                    {STATISTICS_LEVELS.find((s) => s.value === statisticsLevel)?.label} statistics
                  </span>
                  {includeCoverPage && (
                    <span className="px-2 py-0.5 bg-[#34C759]/10 text-[#34C759] text-xs rounded-full">
                      Cover page
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#D2D2D7] bg-[#F5F5F7]">
              <h4 className="text-sm font-semibold text-[#1D1D1F]">Report Sections</h4>
            </div>
            <div className="divide-y divide-[#D2D2D7]">
              {(preview.config.sections ?? []).map((section) => (
                <div key={section.id} className="p-4">
                  <p className="font-medium text-[#1D1D1F] text-sm">{section.title}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-[#F5F5F7] text-[#6E6E73] text-xs rounded-full capitalize">
                    {section.type}
                  </span>
                  {section.content && (
                    <p className="text-sm text-[#6E6E73] mt-2 line-clamp-3 whitespace-pre-wrap">
                      {section.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return renderDatasetStep();
      case 1:
        return renderMergeStep();
      case 2:
        return renderConfigureStep();
      case 3:
        return renderRecommendationStep();
      case 4:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        {renderStepIndicator()}
        {renderStepContent()}
      </div>

      <div className="p-4 border-t border-[#D2D2D7] flex items-center justify-between bg-white">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] hover:bg-[#F5F5F7] transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D2D2D7] text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] text-white text-sm font-medium hover:bg-[#0077ED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!preview || previewLoading || previewError !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#34C759] text-white text-sm font-medium hover:bg-[#30B350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Save Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
