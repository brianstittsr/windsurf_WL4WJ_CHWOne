'use client';

import { Dataset, DatasetColumn, TransformedDataset } from '@/types/bmad.types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const MAX_PREVIEW_ROWS = 100;

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return false;
    const n = Number(trimmed);
    return !isNaN(n) && isFinite(n);
  }
  return false;
}

function isBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const s = value.toLowerCase().trim();
    return s === 'true' || s === 'false' || s === 'yes' || s === 'no' || s === '1' || s === '0';
  }
  return false;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.trim());
  return NaN;
}

function inferType(values: unknown[]): DatasetColumn['type'] {
  const nonEmpty = values.filter((v) => !isEmpty(v));
  if (nonEmpty.length === 0) return 'string';

  const allNumber = nonEmpty.every(isNumeric);
  if (allNumber) return 'number';

  const allBoolean = nonEmpty.every(isBoolean);
  if (allBoolean) return 'boolean';

  const allDate = nonEmpty.every((v) => {
    if (v instanceof Date) return true;
    if (typeof v === 'string') {
      const d = new Date(v);
      return !isNaN(d.getTime());
    }
    return false;
  });
  if (allDate) return 'date';

  return 'string';
}

function buildColumns(rows: Record<string, unknown>[], headers: string[]): DatasetColumn[] {
  if (rows.length === 0) {
    return headers.map((h) => ({
      name: String(h),
      type: 'string' as const,
      nullable: true,
      missingCount: 0,
      uniqueValues: 0,
    }));
  }

  return headers.map((header) => {
    const key = String(header);
    const values = rows.map((r) => r[key]);
    const missingCount = values.filter(isEmpty).length;
    const nonEmpty = values.filter((v) => !isEmpty(v));
    const type = inferType(values);
    const unique = new Set(nonEmpty.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))));
    const column: DatasetColumn = {
      name: key,
      type,
      nullable: missingCount > 0,
      missingCount,
      uniqueValues: unique.size,
    };

    if (type === 'number') {
      const nums = nonEmpty.map(toNumber).filter((n) => !isNaN(n));
      if (nums.length > 0) {
        nums.sort((a, b) => a - b);
        column.min = Math.min(...nums);
        column.max = Math.max(...nums);
        column.mean = nums.reduce((s, n) => s + n, 0) / nums.length;
        const mid = Math.floor(nums.length / 2);
        column.median = nums.length % 2 === 0
          ? (nums[mid - 1] + nums[mid]) / 2
          : nums[mid];
      }
    }

    return column;
  });
}

class DataProcessingService {
  async getSheetNames(file: File): Promise<string[]> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') return [];
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    return workbook.SheetNames;
  }

  async processFile(file: File, sheetName?: string): Promise<{ success: boolean; data: Dataset }> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let headers: string[] = [];
    let rows: Record<string, unknown>[] = [];
    let format: Dataset['format'] = 'csv';

    if (ext === 'xlsx' || ext === 'xls') {
      format = 'excel';
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const targetSheet = sheetName && workbook.SheetNames.includes(sheetName)
        ? sheetName
        : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[targetSheet];
      const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
      if (raw.length === 0) {
        headers = [];
        rows = [];
      } else {
        headers = raw[0].map((h) => String(h));
        rows = raw.slice(1).map((r) => {
          const row: Record<string, unknown> = {};
          headers.forEach((h, i) => {
            row[h] = r[i];
          });
          return row;
        });
      }
    } else if (ext === 'csv') {
      format = 'csv';
      const text = await file.text();
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      headers = parsed.meta.fields || [];
      rows = parsed.data;
    } else if (ext === 'json') {
      format = 'json';
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON file must contain an array of objects');
      }
      rows = parsed as Record<string, unknown>[];
      const keySet = new Set<string>();
      rows.forEach((r) => Object.keys(r).forEach((k) => keySet.add(k)));
      headers = Array.from(keySet);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
    const columns = buildColumns(rows, headers);

    const dataset: Dataset = {
      id: uuidv4(),
      name: file.name,
      description: '',
      format,
      size: file.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      columns,
      rowCount: rows.length,
      userId: 'current-user',
      previewData: previewRows,
    };

    return { success: true, data: dataset };
  }

  async getDatasetById(id: string): Promise<Dataset> {
    return this.mockDataset();
  }

  async getUserDatasets(userId: string): Promise<Dataset[]> {
    return [this.mockDataset()];
  }

  async previewMerge(dataset1Id: string, dataset2Id: string): Promise<any> {
    return {
      mergedData: [
        { id: 1, name: 'Item 1', value1: 10, value2: 20, combined: '30' },
        { id: 2, name: 'Item 2', value1: 15, value2: 25, combined: '40' }
      ]
    };
  }

  async mergeDatasets(
    datasets: Dataset[],
    strategy: {
      mergeType: 'union' | 'intersection' | 'inner' | 'left' | 'outer' | 'right';
      keyColumns?: string[];
      name?: string;
    }
  ): Promise<Dataset> {
    if (datasets.length < 2) {
      throw new Error('At least two datasets are required to merge');
    }

    const mergeType = strategy.mergeType || 'union';
    let mergedRows: Record<string, unknown>[] = [];
    let mergedColumns: string[] = [];
    let rowCount = 0;

    if (mergeType === 'union') {
      datasets.forEach((dataset) => {
        mergedRows = mergedRows.concat(dataset.previewData || []);
        rowCount += dataset.rowCount || 0;
      });
      const columnSet = new Set<string>();
      datasets.forEach((dataset) => dataset.columns.forEach((col) => columnSet.add(col.name)));
      mergedColumns = Array.from(columnSet);
    } else if (mergeType === 'intersection') {
      const commonColumns = datasets
        .map((dataset) => new Set(dataset.columns.map((col) => col.name)))
        .reduce((common, current) => new Set([...common].filter((c) => current.has(c))));
      mergedColumns = Array.from(commonColumns);
      datasets.forEach((dataset) => {
        mergedRows = mergedRows.concat((dataset.previewData || []).map((row) => {
          const filtered: Record<string, unknown> = {};
          mergedColumns.forEach((col) => {
            filtered[col] = (row as Record<string, unknown>)[col];
          });
          return filtered;
        }));
        rowCount += dataset.rowCount || 0;
      });
    } else {
      // Join operations (inner, left, right, outer) work on the first two datasets for now
      const [leftDataset, rightDataset] = datasets;
      const keyColumns = strategy.keyColumns || [];
      const leftRows = leftDataset.previewData || [];
      const rightRows = rightDataset.previewData || [];
      const rightColumns = rightDataset.columns.map((col) => col.name).filter((c) => !keyColumns.includes(c));

      const rightIndex = new Map<string, Record<string, unknown>[]>();
      rightRows.forEach((row) => {
        const key = keyColumns.map((k) => String((row as Record<string, unknown>)[k] ?? '')).join('::');
        if (!rightIndex.has(key)) rightIndex.set(key, []);
        rightIndex.get(key)!.push(row as Record<string, unknown>);
      });

      const matchedRightKeys = new Set<string>();

      leftRows.forEach((leftRow) => {
        const key = keyColumns.map((k) => String((leftRow as Record<string, unknown>)[k] ?? '')).join('::');
        const matches = rightIndex.get(key) || [];
        if (matches.length > 0) {
          matchedRightKeys.add(key);
          matches.forEach((rightRow) => {
            mergedRows.push(this.combineJoinRows(leftRow as Record<string, unknown>, rightRow, keyColumns, rightColumns));
          });
        } else if (mergeType === 'left' || mergeType === 'outer') {
          mergedRows.push(this.combineJoinRows(leftRow as Record<string, unknown>, {}, keyColumns, rightColumns));
        }
      });

      if (mergeType === 'right' || mergeType === 'outer') {
        rightRows.forEach((rightRow) => {
          const key = keyColumns.map((k) => String((rightRow as Record<string, unknown>)[k] ?? '')).join('::');
          if (!matchedRightKeys.has(key)) {
            mergedRows.push(this.combineJoinRows({}, rightRow as Record<string, unknown>, keyColumns, rightColumns));
          }
        });
      }

      rowCount = mergedRows.length;
      const columnSet = new Set<string>();
      leftDataset.columns.forEach((col) => columnSet.add(col.name));
      rightColumns.forEach((col) => columnSet.add(col));
      mergedColumns = Array.from(columnSet);
    }

    const previewRows = mergedRows.slice(0, MAX_PREVIEW_ROWS);
    const columns = buildColumns(mergedRows, mergedColumns);
    const totalSize = datasets.reduce((sum, dataset) => sum + (dataset.size || 0), 0);

    const sourceNames = datasets.map((dataset) => dataset.name).join(', ');
    return {
      id: uuidv4(),
      name: strategy.name || `Merged Dataset (${mergeType})`,
      description: `Merged ${datasets.length} datasets (${sourceNames}) using ${mergeType} merge.`,
      format: 'json',
      size: totalSize,
      createdAt: new Date(),
      updatedAt: new Date(),
      columns,
      rowCount,
      userId: datasets[0].userId,
      previewData: previewRows,
      metadata: {
        mergeType,
        sourceDatasetIds: datasets.map((dataset) => dataset.id),
        sourceNames
      }
    };
  }

  private combineJoinRows(
    leftRow: Record<string, unknown>,
    rightRow: Record<string, unknown>,
    keyColumns: string[],
    rightColumns: string[]
  ): Record<string, unknown> {
    const combined: Record<string, unknown> = { ...leftRow };
    rightColumns.forEach((col) => {
      const value = rightRow[col];
      combined[col] = value !== undefined ? value : null;
    });
    keyColumns.forEach((key) => {
      if (combined[key] === undefined) {
        combined[key] = rightRow[key] !== undefined ? rightRow[key] : null;
      }
    });
    return combined;
  }

  private mockDataset(): Dataset {
    return {
      id: uuidv4(),
      name: 'Mock Dataset',
      description: 'A mock dataset for testing',
      format: 'csv',
      size: 1024,
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: [
        { name: 'id', type: 'number', nullable: false, uniqueValues: 10, missingCount: 0 },
        { name: 'name', type: 'string', nullable: true, uniqueValues: 8, missingCount: 2 }
      ],
      rowCount: 10,
      userId: 'user123',
      previewData: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
    };
  }
}

const dataProcessingService = new DataProcessingService();
export { dataProcessingService };
export default dataProcessingService;
