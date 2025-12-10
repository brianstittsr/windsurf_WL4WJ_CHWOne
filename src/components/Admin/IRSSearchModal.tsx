'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Tooltip,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  Link,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// US States for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

// NTEE Codes (National Taxonomy of Exempt Entities)
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
  deductibilityCode: number;
  foundationCode: number;
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
  taxPeriod: string;
  classificationCodes: string;
  activityCodes: string;
}

interface OrganizationDetail {
  ein: string;
  organizationName: string;
  careOfName: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  nteeCode: string;
  subsectionCode: number;
  affiliationCode: number;
  classificationCodes: string;
  rulingDate: string;
  deductibilityCode: number;
  foundationCode: number;
  activityCodes: string;
  organizationCode: number;
  exemptStatusCode: number;
  taxPeriod: number;
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
  accountingPeriod: number;
  sortName: string | null;
  latestFiling: {
    taxPeriod: number;
    taxYear: number;
    formType: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
    totalAssets: number;
    totalLiabilities: number;
    compensationPercent: number;
  } | null;
  filingHistory: {
    taxPeriod: number;
    taxYear: number;
    formType: number;
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
  // Search form state
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState('NC');
  const [city, setCity] = useState('');
  const [nteeCode, setNteeCode] = useState('');
  
  // Results state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detail view state
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Import state
  const [importing, setImporting] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string[]>([]);
  
  // Batch import state
  const [batchImporting, setBatchImporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  
  // Auto-import state
  const [autoImporting, setAutoImporting] = useState(false);
  const [autoImportStats, setAutoImportStats] = useState({
    totalImported: 0,
    totalSkipped: 0,
    totalFailed: 0,
    currentPage: 0,
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
        body: JSON.stringify({
          searchTerm,
          state,
          city,
          nteeCode: nteeCode || undefined,
          page
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

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

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    handleSearch(page - 1);
  };

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

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch details');
      }

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
      // Fetch full details if not already loaded
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

  const handleBatchImport = async () => {
    setBatchImporting(true);
    setBatchProgress(0);
    
    const toImport = results.filter(r => !existingEINs.includes(r.ein) && !importSuccess.includes(r.ein));
    
    for (let i = 0; i < toImport.length; i++) {
      try {
        const response = await fetch(`/api/nonprofit-search?ein=${toImport[i].ein}`);
        const data = await response.json();
        
        if (data.success && data.organization) {
          await onImport(data.organization);
          setImportSuccess(prev => [...prev, toImport[i].ein]);
        }
      } catch (err) {
        console.error(`Failed to import ${toImport[i].ein}:`, err);
      }
      
      setBatchProgress(((i + 1) / toImport.length) * 100);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setBatchImporting(false);
  };

  // Auto-import: Fetches and imports 25 records at a time, page by page
  const handleAutoImport = async () => {
    setAutoImporting(true);
    setAutoImportLog([]);
    setAutoImportStats({
      totalImported: 0,
      totalSkipped: 0,
      totalFailed: 0,
      currentPage: 0,
      pagesProcessed: 0
    });

    let page = 0;
    let hasMore = true;
    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    let pagesProcessed = 0;

    const addLog = (message: string) => {
      setAutoImportLog(prev => [...prev.slice(-50), message]); // Keep last 50 log entries
    };

    addLog(`Starting auto-import for ${state ? US_STATES.find(s => s.code === state)?.name : 'all states'}...`);

    while (hasMore && autoImporting !== false) {
      try {
        addLog(`Fetching page ${page + 1}...`);
        
        // Fetch a page of results
        const response = await fetch('/api/nonprofit-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchTerm,
            state,
            city,
            nteeCode: nteeCode || undefined,
            page
          })
        });

        const data = await response.json();

        if (!data.success) {
          addLog(`Error fetching page ${page + 1}: ${data.error}`);
          break;
        }

        const orgs = data.organizations || [];
        addLog(`Found ${orgs.length} organizations on page ${page + 1}`);

        // Update results display
        setResults(orgs);
        setTotalResults(data.totalResults);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);

        // Import each organization on this page
        for (let i = 0; i < orgs.length; i++) {
          const org = orgs[i];
          
          // Check if already imported
          if (existingEINs.includes(org.ein) || importSuccess.includes(org.ein)) {
            totalSkipped++;
            addLog(`Skipped ${org.organizationName} (already imported)`);
            continue;
          }

          try {
            // Fetch full details
            const detailResponse = await fetch(`/api/nonprofit-search?ein=${org.ein}`);
            const detailData = await detailResponse.json();

            if (detailData.success && detailData.organization) {
              await onImport(detailData.organization);
              setImportSuccess(prev => [...prev, org.ein]);
              totalImported++;
              addLog(`✓ Imported: ${org.organizationName}`);
            } else {
              totalFailed++;
              addLog(`✗ Failed to get details for ${org.organizationName}`);
            }
          } catch (err) {
            totalFailed++;
            addLog(`✗ Error importing ${org.organizationName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }

          // Update stats
          setAutoImportStats({
            totalImported,
            totalSkipped,
            totalFailed,
            currentPage: page,
            pagesProcessed
          });

          // Small delay to avoid rate limiting (300ms between each org)
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        pagesProcessed++;
        page++;
        hasMore = data.hasMore && page < data.totalPages;

        setAutoImportStats({
          totalImported,
          totalSkipped,
          totalFailed,
          currentPage: page,
          pagesProcessed
        });

        if (hasMore) {
          addLog(`Completed page ${page}. Moving to next page...`);
          // Delay between pages (1 second)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (err) {
        addLog(`Error on page ${page + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        break;
      }
    }

    addLog(`Auto-import complete! Imported: ${totalImported}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`);
    setAutoImporting(false);
  };

  const stopAutoImport = () => {
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
      7: '501(c)(7) - Social Club',
      8: '501(c)(8) - Fraternal Beneficiary',
      9: '501(c)(9) - Voluntary Employees',
      10: '501(c)(10) - Domestic Fraternal',
      13: '501(c)(13) - Cemetery Company',
      14: '501(c)(14) - Credit Union',
      19: '501(c)(19) - Veterans Organization'
    };
    return descriptions[code] || `501(c)(${code})`;
  };

  const isAlreadyImported = (ein: string) => {
    return existingEINs.includes(ein) || importSuccess.includes(ein);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon color="primary" />
          <Typography variant="h6">IRS Tax Exempt Organization Search</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Search for North Carolina nonprofits using ProPublica Nonprofit Explorer data (sourced from IRS Form 990)
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Search Form */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Organization Name or EIN"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter name or EIN..."
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                size="small"
              >
                {US_STATES.map(s => (
                  <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Optional"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Category (NTEE)"
                value={nteeCode}
                onChange={(e) => setNteeCode(e.target.value)}
                size="small"
              >
                {NTEE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.code} value={cat.code}>{cat.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                onClick={() => handleSearch(0)}
                disabled={loading}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Results Summary */}
        {totalResults > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Found <strong>{totalResults.toLocaleString()}</strong> organizations
              {state && ` in ${US_STATES.find(s => s.code === state)?.name}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleBatchImport}
                disabled={batchImporting || autoImporting || results.every(r => isAlreadyImported(r.ein))}
              >
                Import Page ({results.filter(r => !isAlreadyImported(r.ein)).length})
              </Button>
              {!autoImporting ? (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<RefreshIcon />}
                  onClick={handleAutoImport}
                  disabled={batchImporting || loading}
                >
                  Auto-Import All (25/page)
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={stopAutoImport}
                >
                  Stop Auto-Import
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Auto-Import Status Panel */}
        {(autoImporting || autoImportLog.length > 0) && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: autoImporting ? 'primary.50' : 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="primary">
                {autoImporting ? '🔄 Auto-Import in Progress...' : '✅ Auto-Import Complete'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`Imported: ${autoImportStats.totalImported}`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`Skipped: ${autoImportStats.totalSkipped}`} 
                  color="default" 
                  size="small" 
                />
                <Chip 
                  icon={<WarningIcon />} 
                  label={`Failed: ${autoImportStats.totalFailed}`} 
                  color="error" 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={`Pages: ${autoImportStats.pagesProcessed}`} 
                  color="info" 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            </Box>
            
            {autoImporting && (
              <LinearProgress sx={{ mb: 2 }} />
            )}
            
            {/* Log Output */}
            <Box 
              sx={{ 
                maxHeight: 150, 
                overflow: 'auto', 
                bgcolor: 'grey.900', 
                color: 'grey.100',
                p: 1.5, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                lineHeight: 1.6
              }}
            >
              {autoImportLog.map((log, idx) => (
                <Box key={idx} sx={{ 
                  color: log.startsWith('✓') ? 'success.light' : 
                         log.startsWith('✗') ? 'error.light' : 
                         log.includes('Skipped') ? 'grey.500' : 'grey.100'
                }}>
                  {log}
                </Box>
              ))}
              {autoImportLog.length === 0 && (
                <Typography variant="caption" color="grey.500">
                  Waiting to start...
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {/* Batch Import Progress */}
        {batchImporting && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Importing organizations from current page...
            </Typography>
            <LinearProgress variant="determinate" value={batchProgress} />
          </Box>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}></TableCell>
                  <TableCell><strong>EIN</strong></TableCell>
                  <TableCell><strong>Organization Name</strong></TableCell>
                  <TableCell><strong>City</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell align="right"><strong>Assets</strong></TableCell>
                  <TableCell align="right"><strong>Revenue</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((org) => (
                  <React.Fragment key={org.ein}>
                    <TableRow 
                      hover 
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: isAlreadyImported(org.ein) ? 'action.selected' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(org.ein)}
                        >
                          {expandedRow === org.ein ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {org.ein}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {org.organizationName}
                        </Typography>
                      </TableCell>
                      <TableCell>{org.city}</TableCell>
                      <TableCell>
                        <Tooltip title={getSubsectionDescription(org.subsectionCode)}>
                          <Chip 
                            label={`501(c)(${org.subsectionCode})`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(org.assetAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(org.revenueAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isAlreadyImported(org.ein) ? (
                          <Chip 
                            icon={<CheckCircleIcon />}
                            label="Imported" 
                            size="small" 
                            color="success"
                          />
                        ) : (
                          <Chip label="New" size="small" color="info" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant={isAlreadyImported(org.ein) ? "outlined" : "contained"}
                          startIcon={importing === org.ein ? <CircularProgress size={16} /> : <AddIcon />}
                          onClick={() => handleImportSingle(org.ein)}
                          disabled={importing === org.ein || isAlreadyImported(org.ein)}
                        >
                          {isAlreadyImported(org.ein) ? 'Added' : 'Import'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Detail Row */}
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 0 }}>
                        <Collapse in={expandedRow === org.ein} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 3, bgcolor: 'grey.50' }}>
                            {loadingDetail && expandedRow === org.ein ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress />
                              </Box>
                            ) : selectedOrg && selectedOrg.ein === org.ein ? (
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="primary" gutterBottom>
                                    Organization Details
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="body2">
                                      <strong>Address:</strong> {selectedOrg.address}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>City, State ZIP:</strong> {selectedOrg.city}, {selectedOrg.state} {selectedOrg.zipCode}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>NTEE Code:</strong> {selectedOrg.nteeCode || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Ruling Date:</strong> {selectedOrg.rulingDate || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Tax Period:</strong> {selectedOrg.taxPeriod || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" color="primary" gutterBottom>
                                    Financial Information
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="body2">
                                      <strong>Total Assets:</strong> {formatCurrency(selectedOrg.assetAmount)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Total Income:</strong> {formatCurrency(selectedOrg.incomeAmount)}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Total Revenue:</strong> {formatCurrency(selectedOrg.revenueAmount)}
                                    </Typography>
                                    {selectedOrg.latestFiling && (
                                      <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2">
                                          <strong>Latest Filing ({selectedOrg.latestFiling.taxYear}):</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                          Revenue: {formatCurrency(selectedOrg.latestFiling.totalRevenue)} | 
                                          Expenses: {formatCurrency(selectedOrg.latestFiling.totalExpenses)}
                                        </Typography>
                                        <Link 
                                          href={selectedOrg.latestFiling.pdfUrl} 
                                          target="_blank"
                                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                        >
                                          View Form 990 PDF <OpenInNewIcon fontSize="small" />
                                        </Link>
                                      </>
                                    )}
                                  </Box>
                                </Grid>
                                {selectedOrg.filingHistory && selectedOrg.filingHistory.length > 1 && (
                                  <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                      Filing History (Year-over-Year)
                                    </Typography>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Tax Year</TableCell>
                                          <TableCell align="right">Revenue</TableCell>
                                          <TableCell align="right">Expenses</TableCell>
                                          <TableCell align="right">Assets</TableCell>
                                          <TableCell>Form 990</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {selectedOrg.filingHistory.slice(0, 5).map((filing, idx) => (
                                          <TableRow key={filing.taxPeriod}>
                                            <TableCell>{filing.taxYear}</TableCell>
                                            <TableCell align="right">{formatCurrency(filing.totalRevenue)}</TableCell>
                                            <TableCell align="right">{formatCurrency(filing.totalExpenses)}</TableCell>
                                            <TableCell align="right">{formatCurrency(filing.totalAssets)}</TableCell>
                                            <TableCell>
                                              <Link href={filing.pdfUrl} target="_blank" sx={{ fontSize: '0.875rem' }}>
                                                View PDF
                                              </Link>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Grid>
                                )}
                              </Grid>
                            ) : (
                              <Typography color="text.secondary">
                                Click to load organization details
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage + 1}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
            />
          </Box>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && totalResults === 0 && searchTerm && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No organizations found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}

        {/* Initial State */}
        {!loading && results.length === 0 && !searchTerm && !autoImporting && autoImportLog.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <InfoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Search for Tax Exempt Organizations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter a search term or select filters above to find nonprofits
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={handleAutoImport}
                disabled={loading}
              >
                Auto-Import All NC Nonprofits (25/page)
              </Button>
            </Box>
            
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2">
                <strong>Data Source:</strong> ProPublica Nonprofit Explorer, which aggregates IRS Form 990 data.
                This includes detailed financial information and filing history for most 501(c)(3) organizations.
              </Typography>
            </Alert>
            
            <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> North Carolina has ~84,000+ registered nonprofits. Auto-import processes 25 organizations per page.
                You can stop the import at any time and resume later - already imported organizations will be skipped.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, pl: 2 }}>
          Data from ProPublica Nonprofit Explorer • IRS Form 990 filings
        </Typography>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
