'use client';

import React, { useState, useCallback } from 'react';
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
import { cn } from '@/lib/utils';
import {
  Search, Plus, ChevronDown, ChevronUp, ExternalLink, CheckCircle, 
  AlertTriangle, Loader2, Info, Building2
} from 'lucide-react';

// US States for dropdown
const US_STATES = [
  { code: 'NC', name: 'North Carolina' },
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
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
];

// NTEE Categories
const NTEE_CATEGORIES = [
  { code: 'all', name: 'All Categories' },
  { code: '4', name: 'Health' },
  { code: '5', name: 'Human Services' },
  { code: '2', name: 'Education' },
  { code: '7', name: 'Public, Societal Benefit' },
  { code: '1', name: 'Arts, Culture & Humanities' },
  { code: '3', name: 'Environment & Animals' },
  { code: '6', name: 'International, Foreign Affairs' },
  { code: '8', name: 'Religion Related' },
];

interface SearchResult {
  ein: string;
  organizationName: string;
  city: string;
  state: string;
  nteeCode: string;
  subsectionCode: number;
  assetAmount: number;
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
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
  latestFiling?: {
    taxYear: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
  } | null;
}

interface NonprofitSearchClaimProps {
  onClaim: (organization: OrganizationDetail) => void;
  onSkip: () => void;
}

export function NonprofitSearchClaim({ onClaim, onSkip }: NonprofitSearchClaimProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState('NC');
  const [nteeCode, setNteeCode] = useState('all');
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  const handleSearch = useCallback(async (page: number = 0) => {
    if (!searchTerm.trim() && !state) {
      setError('Please enter a search term or select a state');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/nonprofit-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm, state, nteeCode: nteeCode === 'all' ? undefined : nteeCode, page })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Search failed');

      setResults(data.organizations || []);
      setTotalResults(data.totalResults || 0);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, state, nteeCode]);

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

  const handleClaim = async (ein: string) => {
    setClaiming(ein);
    
    try {
      let orgDetail = selectedOrg;
      if (!orgDetail || orgDetail.ein !== ein) {
        const response = await fetch(`/api/nonprofit-search?ein=${ein}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        orgDetail = data.organization;
      }

      if (orgDetail) {
        onClaim(orgDetail);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim organization');
    } finally {
      setClaiming(null);
    }
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center">
          <Search className="h-8 w-8 text-teal-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Find Your Organization</h3>
        <p className="text-sm text-slate-500 mt-1">
          Search the IRS database to find and claim your nonprofit organization
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="text-xs">Organization Name or EIN</Label>
              <Input
                id="search"
                placeholder="Enter name or EIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {US_STATES.map(s => (
                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
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
          
          {/* Category Filter */}
          <div className="mt-3">
            <Label className="text-xs">Category (Optional)</Label>
            <Select value={nteeCode} onValueChange={setNteeCode}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {NTEE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.code || 'all'} value={cat.code}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Found <strong>{totalResults.toLocaleString()}</strong> organizations
          </p>
          
          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            {results.map((org) => (
              <div key={org.ein} className="border-b last:border-b-0">
                <div 
                  className={cn(
                    'p-3 hover:bg-slate-50 cursor-pointer transition-colors',
                    expandedRow === org.ein && 'bg-slate-50'
                  )}
                  onClick={() => handleViewDetails(org.ein)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <p className="font-medium text-slate-900 truncate">{org.organizationName}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{org.city}, {org.state}</span>
                        <Badge variant="outline" className="text-xs">
                          501(c)({org.subsectionCode})
                        </Badge>
                        <span>EIN: {org.ein}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(org.ein);
                        }}
                        disabled={claiming === org.ein}
                      >
                        {claiming === org.ein ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Claim
                          </>
                        )}
                      </Button>
                      {expandedRow === org.ein ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedRow === org.ein && (
                  <div className="px-3 pb-3 bg-slate-50 border-t">
                    {loadingDetail ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    ) : selectedOrg && selectedOrg.ein === org.ein ? (
                      <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                        <div>
                          <p className="text-slate-500">Address</p>
                          <p className="font-medium">{selectedOrg.address}</p>
                          <p className="font-medium">{selectedOrg.city}, {selectedOrg.state} {selectedOrg.zipCode}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Financial Info</p>
                          <p>Assets: {formatCurrency(selectedOrg.assetAmount)}</p>
                          <p>Revenue: {formatCurrency(selectedOrg.revenueAmount)}</p>
                        </div>
                        {selectedOrg.latestFiling && (
                          <div className="col-span-2">
                            <a 
                              href={selectedOrg.latestFiling.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
                            >
                              View Form 990 ({selectedOrg.latestFiling.taxYear}) <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>

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
        </div>
      )}

      {/* Initial State / No Results */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-6">
          <Alert className="bg-blue-50 border-blue-200 max-w-md mx-auto">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              <strong>Data Source:</strong> ProPublica Nonprofit Explorer aggregates IRS Form 990 data for 501(c)(3) organizations.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Skip Option */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Can&apos;t find your organization?
          </p>
          <Button variant="outline" onClick={onSkip}>
            Register Manually Instead
          </Button>
        </div>
      </div>
    </div>
  );
}
