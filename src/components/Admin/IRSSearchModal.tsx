'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Search, Plus, RefreshCw, Info, Download, ChevronDown, ChevronUp,
  ExternalLink, CheckCircle, AlertTriangle, Loader2, X
} from 'lucide-react';

// US States for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
];

// NTEE Categories
const NTEE_CATEGORIES = [
  { code: '', name: 'All Categories' },
  { code: '1', name: 'Arts, Culture & Humanities' },
  { code: '2', name: 'Education' },
  { code: '3', name: 'Environment & Animals' },
  { code: '4', name: 'Health' },
  { code: '5', name: 'Human Services' },
  { code: '6', name: 'International, Foreign Affairs' },
  { code: '7', name: 'Public, Societal Benefit' },
  { code: '8', name: 'Religion Related' },
  { code: '9', name: 'Mutual/Membership Benefit' },
  { code: '10', name: 'Unknown/Unclassified' }
];

interface SearchResult {
  ein: string;
  organizationName: string;
  city: string;
  state: string;
  nteeCode: string;
  subsectionCode: number;
  rulingDate: string;
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
}

interface OrganizationDetail {
  ein: string;
  organizationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  nteeCode: string;
  subsectionCode: number;
  rulingDate: string;
  taxPeriod: number;
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
  latestFiling: {
    taxYear: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
  } | null;
  filingHistory: {
    taxYear: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
    totalAssets: number;
  }[];
}

interface IRSSearchModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (organization: OrganizationDetail) => Promise<void>;
  existingEINs: string[];
}

export default function IRSSearchModal({ open, onClose, onImport, existingEINs }: IRSSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState('NC');
  const [city, setCity] = useState('');
  const [nteeCode, setNteeCode] = useState('');
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  const [importing, setImporting] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string[]>([]);
  
  const [batchImporting, setBatchImporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  
  const [autoImporting, setAutoImporting] = useState(false);
  const autoImportingRef = useRef(false);
  const [autoImportStartPage, setAutoImportStartPage] = useState(0);
  const [autoImportStats, setAutoImportStats] = useState({
    totalImported: 0,
    totalSkipped: 0,
    totalFailed: 0,
    pagesProcessed: 0
  });
  const [autoImportLog, setAutoImportLog] = useState<string[]>([]);

  const handleSearch = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/nonprofit-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm, state, city, nteeCode: nteeCode || undefined, page })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Search failed');

      setResults(data.organizations);
      setTotalResults(data.totalResults);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, state, city, nteeCode]);

  const handleViewDetails = async (ein: string) => {
    if (expandedRow === ein) {
      setExpandedRow(null);
      setSelectedOrg(null);
      return;
    }

    setExpandedRow(ein);
    setLoadingDetail(true);
    
    try {
      const response = await fetch(`/api/nonprofit-search?ein=${ein}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch details');
      setSelectedOrg(data.organization);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleImportSingle = async (ein: string) => {
    setImporting(ein);
    
    try {
      let orgDetail = selectedOrg;
      if (!orgDetail || orgDetail.ein !== ein) {
        const response = await fetch(`/api/nonprofit-search?ein=${ein}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        orgDetail = data.organization;
      }

      if (orgDetail) {
        await onImport(orgDetail);
        setImportSuccess(prev => [...prev, ein]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(null);
    }
  };

  const handleAutoImport = async () => {
    setAutoImporting(true);
    autoImportingRef.current = true;
    setAutoImportLog([]);
    setAutoImportStats({ totalImported: 0, totalSkipped: 0, totalFailed: 0, pagesProcessed: 0 });

    let page = autoImportStartPage;
    let hasMore = true;
    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    let pagesProcessed = 0;
    
    const importedEINsSet = new Set([...existingEINs, ...importSuccess]);
    const logBuffer: string[] = [];
    
    const addLog = (message: string) => {
      logBuffer.push(message);
      if (logBuffer.length > 20) logBuffer.shift();
      setAutoImportLog([...logBuffer]);
    };

    addLog(`Starting auto-import for ${state ? US_STATES.find(s => s.code === state)?.name : 'all states'}...`);

    while (hasMore && autoImportingRef.current) {
      try {
        addLog(`📄 Page ${page + 1}...`);
        
        const response = await fetch('/api/nonprofit-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm, state, city, nteeCode: nteeCode || undefined, page })
        });

        const data = await response.json();
        if (!data.success) {
          addLog(`❌ Error fetching page ${page + 1}: ${data.error}`);
          break;
        }

        const orgs = data.organizations || [];
        setTotalResults(data.totalResults);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);

        let pageImported = 0;
        let pageSkipped = 0;
        
        for (let i = 0; i < orgs.length; i++) {
          if (!autoImportingRef.current) break;
          
          const org = orgs[i];
          if (importedEINsSet.has(org.ein)) {
            totalSkipped++;
            pageSkipped++;
            continue;
          }

          try {
            const detailResponse = await fetch(`/api/nonprofit-search?ein=${org.ein}`);
            const detailData = await detailResponse.json();

            if (detailData.success && detailData.organization) {
              await onImport(detailData.organization);
              importedEINsSet.add(org.ein);
              totalImported++;
              pageImported++;
            } else {
              totalFailed++;
            }
          } catch {
            totalFailed++;
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        }

        pagesProcessed++;
        page++;
        hasMore = data.hasMore && page < data.totalPages;

        setAutoImportStats({ totalImported, totalSkipped, totalFailed, pagesProcessed });
        addLog(`✅ Page ${page}: +${pageImported} imported, ${pageSkipped} skipped`);

        if (hasMore) await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        addLog(`❌ Error on page ${page + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        break;
      }
    }

    setImportSuccess(Array.from(importedEINsSet).filter(ein => !existingEINs.includes(ein)));
    addLog(`🎉 Complete! Imported: ${totalImported}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`);
    autoImportingRef.current = false;
    setAutoImporting(false);
  };

  const stopAutoImport = () => {
    autoImportingRef.current = false;
    setAutoImporting(false);
    setAutoImportLog(prev => [...prev, 'Auto-import stopped by user']);
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSubsectionDescription = (code: number) => {
    const descriptions: Record<number, string> = {
      3: '501(c)(3) - Charitable',
      4: '501(c)(4) - Social Welfare',
      5: '501(c)(5) - Labor/Agricultural',
      6: '501(c)(6) - Business League',
    };
    return descriptions[code] || `501(c)(${code})`;
  };

  const isAlreadyImported = (ein: string) => existingEINs.includes(ein) || importSuccess.includes(ein);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            IRS Tax Exempt Organization Search
          </DialogTitle>
          <DialogDescription>
            Search for North Carolina nonprofits using ProPublica Nonprofit Explorer data (sourced from IRS Form 990)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Search Form */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Organization Name or EIN</Label>
                  <Input
                    id="search"
                    placeholder="Enter name or EIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {US_STATES.map(s => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category (NTEE)</Label>
                  <Select value={nteeCode} onValueChange={setNteeCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {NTEE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.code || 'all'} value={cat.code}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => handleSearch(0)} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Results Summary & Actions */}
          {totalResults > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Found <strong>{totalResults.toLocaleString()}</strong> organizations
                {state && ` in ${US_STATES.find(s => s.code === state)?.name}`}
              </p>
              <div className="flex items-center gap-2">
                {!autoImporting ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Start Page</Label>
                      <Input
                        type="number"
                        value={autoImportStartPage + 1}
                        onChange={(e) => setAutoImportStartPage(Math.max(0, parseInt(e.target.value) - 1) || 0)}
                        className="w-20 h-8"
                        min={1}
                      />
                    </div>
                    <Button size="sm" variant="default" onClick={handleAutoImport} disabled={batchImporting || loading}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Auto-Import NC Nonprofits (25/page)
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="destructive" onClick={stopAutoImport}>
                    Stop Auto-Import
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Auto-Import Status Panel */}
          {(autoImporting || autoImportLog.length > 0) && (
            <Card className={autoImporting ? 'border-blue-200 bg-blue-50' : 'bg-slate-50'}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-blue-700">
                    {autoImporting ? '🔄 Auto-Import in Progress...' : '✅ Auto-Import Complete'}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Imported: {autoImportStats.totalImported}
                    </Badge>
                    <Badge variant="secondary">Skipped: {autoImportStats.totalSkipped}</Badge>
                    <Badge variant="destructive">Failed: {autoImportStats.totalFailed}</Badge>
                    <Badge variant="outline">Pages: {autoImportStats.pagesProcessed}</Badge>
                  </div>
                </div>
                
                {autoImporting && <Progress value={50} className="mb-3" />}
                
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs max-h-32 overflow-y-auto">
                  {autoImportLog.map((log, idx) => (
                    <div key={idx} className={cn(
                      log.startsWith('✓') || log.startsWith('✅') ? 'text-green-400' : 
                      log.startsWith('✗') || log.startsWith('❌') ? 'text-red-400' : 
                      log.includes('Skipped') ? 'text-slate-500' : 'text-slate-100'
                    )}>
                      {log}
                    </div>
                  ))}
                  {autoImportLog.length === 0 && <span className="text-slate-500">Waiting to start...</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Import Progress */}
          {batchImporting && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Importing organizations from current page...</p>
              <Progress value={batchProgress} />
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left w-10"></th>
                      <th className="p-3 text-left font-semibold">EIN</th>
                      <th className="p-3 text-left font-semibold">Organization Name</th>
                      <th className="p-3 text-left font-semibold">City</th>
                      <th className="p-3 text-left font-semibold">Type</th>
                      <th className="p-3 text-right font-semibold">Assets</th>
                      <th className="p-3 text-right font-semibold">Revenue</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                      <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((org) => (
                      <React.Fragment key={org.ein}>
                        <tr className={cn(
                          'border-t hover:bg-slate-50 transition-colors',
                          isAlreadyImported(org.ein) && 'bg-green-50'
                        )}>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(org.ein)}>
                              {expandedRow === org.ein ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </td>
                          <td className="p-3 font-mono text-xs">{org.ein}</td>
                          <td className="p-3 font-medium">{org.organizationName}</td>
                          <td className="p-3">{org.city}</td>
                          <td className="p-3">
                            <Badge variant="outline" title={getSubsectionDescription(org.subsectionCode)}>
                              501(c)({org.subsectionCode})
                            </Badge>
                          </td>
                          <td className="p-3 text-right">{formatCurrency(org.assetAmount)}</td>
                          <td className="p-3 text-right">{formatCurrency(org.revenueAmount)}</td>
                          <td className="p-3">
                            {isAlreadyImported(org.ein) ? (
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Imported
                              </Badge>
                            ) : (
                              <Badge variant="outline">New</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant={isAlreadyImported(org.ein) ? "outline" : "default"}
                              onClick={() => handleImportSingle(org.ein)}
                              disabled={importing === org.ein || isAlreadyImported(org.ein)}
                            >
                              {importing === org.ein ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  {isAlreadyImported(org.ein) ? 'Added' : 'Import'}
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                        
                        {/* Expanded Detail Row */}
                        {expandedRow === org.ein && (
                          <tr>
                            <td colSpan={9} className="p-0">
                              <div className="bg-slate-50 p-4 border-t">
                                {loadingDetail ? (
                                  <div className="flex justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                  </div>
                                ) : selectedOrg && selectedOrg.ein === org.ein ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold text-blue-600 mb-2">Organization Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Address:</strong> {selectedOrg.address}</p>
                                        <p><strong>City, State ZIP:</strong> {selectedOrg.city}, {selectedOrg.state} {selectedOrg.zipCode}</p>
                                        <p><strong>NTEE Code:</strong> {selectedOrg.nteeCode || 'N/A'}</p>
                                        <p><strong>Ruling Date:</strong> {selectedOrg.rulingDate || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-blue-600 mb-2">Financial Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Total Assets:</strong> {formatCurrency(selectedOrg.assetAmount)}</p>
                                        <p><strong>Total Income:</strong> {formatCurrency(selectedOrg.incomeAmount)}</p>
                                        <p><strong>Total Revenue:</strong> {formatCurrency(selectedOrg.revenueAmount)}</p>
                                        {selectedOrg.latestFiling && (
                                          <>
                                            <div className="border-t pt-2 mt-2">
                                              <p><strong>Latest Filing ({selectedOrg.latestFiling.taxYear}):</strong></p>
                                              <p>Revenue: {formatCurrency(selectedOrg.latestFiling.totalRevenue)} | Expenses: {formatCurrency(selectedOrg.latestFiling.totalExpenses)}</p>
                                              <a 
                                                href={selectedOrg.latestFiling.pdfUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                                              >
                                                View Form 990 PDF <ExternalLink className="h-3 w-3" />
                                              </a>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-slate-500">Click to load organization details</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || loading}
              >
                Next
              </Button>
            </div>
          )}

          {/* Initial State */}
          {!loading && results.length === 0 && !autoImporting && autoImportLog.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Info className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Search for Tax Exempt Organizations</h3>
              <p className="text-slate-500 mb-6">Enter a search term or select filters above to find nonprofits</p>
              
              <div className="flex justify-center items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Start from Page</Label>
                  <Input
                    type="number"
                    value={autoImportStartPage + 1}
                    onChange={(e) => setAutoImportStartPage(Math.max(0, parseInt(e.target.value) - 1) || 0)}
                    className="w-24"
                    min={1}
                  />
                </div>
                <Button onClick={handleAutoImport} disabled={loading} size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Auto-Import NC Nonprofits (25/page)
                </Button>
              </div>
              
              <Alert className="max-w-xl mx-auto bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Data Source:</strong> ProPublica Nonprofit Explorer, which aggregates IRS Form 990 data.
                  This includes detailed financial information and filing history for most 501(c)(3) organizations.
                </AlertDescription>
              </Alert>
              
              <Alert className="max-w-xl mx-auto mt-3 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Note:</strong> North Carolina has ~84,000+ registered nonprofits. Auto-import processes 25 organizations per page.
                  You can stop the import at any time and resume later - already imported organizations will be skipped.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <p className="text-xs text-slate-500 flex-1">
            Data from ProPublica Nonprofit Explorer • IRS Form 990 filings
          </p>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
