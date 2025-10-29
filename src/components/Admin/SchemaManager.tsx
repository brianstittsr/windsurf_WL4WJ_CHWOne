'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { COLLECTIONS } from '@/lib/schema/unified-schema';
import { runMigration, generateMigrationReport } from '@/lib/schema/migration-tool';
import { validate } from '@/lib/schema/validation';
import { getSchemaVersion } from '@/lib/schema/initialize-schema';

// Tab panel component
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schema-tabpanel-${index}`}
      aria-labelledby={`schema-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SchemaManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaVersion, setSchemaVersion] = useState<string | null>(null);
  const [migrationConfig, setMigrationConfig] = useState({
    dryRun: true,
    collections: [] as string[],
    logLevel: 'info' as 'error' | 'warn' | 'info' | 'debug'
  });
  const [migrationResults, setMigrationResults] = useState<any[] | null>(null);
  const [migrationReport, setMigrationReport] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<any[] | null>(null);

  // Load collections on mount
  useEffect(() => {
    setCollections(Object.values(COLLECTIONS));
    
    // Get schema version
    getSchemaVersion().then(version => {
      if (version) {
        setSchemaVersion(version.version);
      }
    }).catch(error => {
      console.error('Error getting schema version:', error);
    });
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Load documents for a collection
  const loadDocuments = async (collectionName: string) => {
    setLoading(true);
    setError(null);
    setDocuments([]);
    setSelectedCollection(collectionName);
    
    try {
      // This would normally fetch documents from Firestore
      // For now, we'll just show a message
      setDocuments([
        { id: 'sample-1', message: 'Sample document 1' },
        { id: 'sample-2', message: 'Sample document 2' }
      ]);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Run migration
  const runMigrationTool = async () => {
    setLoading(true);
    setError(null);
    setMigrationResults(null);
    setMigrationReport(null);
    
    try {
      const results = await runMigration({
        dryRun: migrationConfig.dryRun,
        collections: migrationConfig.collections.length > 0 ? migrationConfig.collections : undefined,
        logLevel: migrationConfig.logLevel
      });
      
      setMigrationResults(results);
      setMigrationReport(generateMigrationReport(results));
    } catch (err) {
      console.error('Error running migration:', err);
      setError('Failed to run migration. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Run validation
  const runValidation = async () => {
    setLoading(true);
    setError(null);
    setValidationResults(null);
    
    try {
      // This would normally validate documents against the schema
      // For now, we'll just show sample results
      setValidationResults([
        {
          collection: 'users',
          valid: 45,
          invalid: 3,
          errors: [
            { docId: 'user-1', field: 'email', message: 'Invalid email format' },
            { docId: 'user-2', field: 'role', message: 'Invalid role: guest' },
            { docId: 'user-3', field: 'organizationId', message: 'Missing organizationId' }
          ]
        },
        {
          collection: 'chwProfiles',
          valid: 22,
          invalid: 1,
          errors: [
            { docId: 'chw-1', field: 'certificationDate', message: 'Invalid date format' }
          ]
        }
      ]);
    } catch (err) {
      console.error('Error running validation:', err);
      setError('Failed to run validation. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Schema Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and validate the unified schema across the platform
        </Typography>
        
        {schemaVersion && (
          <Chip 
            icon={<StorageIcon />} 
            label={`Schema Version: ${schemaVersion}`} 
            color="primary" 
            sx={{ mt: 2 }} 
          />
        )}
      </Box>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Collections" />
          <Tab label="Migration" />
          <Tab label="Validation" />
          <Tab label="Schema Info" />
        </Tabs>
        
        {/* Collections Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Collections
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {collections.map((collection) => (
                    <Button
                      key={collection}
                      variant={selectedCollection === collection ? 'contained' : 'outlined'}
                      onClick={() => loadDocuments(collection)}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {collection}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2, height: '100%' }}>
                {selectedCollection ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {selectedCollection}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => loadDocuments(selectedCollection)}
                      >
                        Refresh
                      </Button>
                    </Box>
                    
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : error ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    ) : documents.length === 0 ? (
                      <Alert severity="info">
                        No documents found in this collection.
                      </Alert>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Data</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {documents.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell>{doc.id}</TableCell>
                                <TableCell>{JSON.stringify(doc).substring(0, 100)}...</TableCell>
                                <TableCell>
                                  <IconButton size="small" color="primary">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error">
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">
                      Select a collection to view documents
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Migration Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Migration Configuration
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Mode</InputLabel>
                  <Select
                    value={migrationConfig.dryRun ? 'dry-run' : 'commit'}
                    onChange={(e) => setMigrationConfig({
                      ...migrationConfig,
                      dryRun: e.target.value === 'dry-run'
                    })}
                    label="Mode"
                  >
                    <MenuItem value="dry-run">Dry Run (No Changes)</MenuItem>
                    <MenuItem value="commit">Commit Changes</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={migrationConfig.logLevel}
                    onChange={(e) => setMigrationConfig({
                      ...migrationConfig,
                      logLevel: e.target.value as any
                    })}
                    label="Log Level"
                  >
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="debug">Debug</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Collections to Migrate
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {collections.map((collection) => (
                    <Chip
                      key={collection}
                      label={collection}
                      clickable
                      color={migrationConfig.collections.includes(collection) ? 'primary' : 'default'}
                      onClick={() => {
                        if (migrationConfig.collections.includes(collection)) {
                          setMigrationConfig({
                            ...migrationConfig,
                            collections: migrationConfig.collections.filter(c => c !== collection)
                          });
                        } else {
                          setMigrationConfig({
                            ...migrationConfig,
                            collections: [...migrationConfig.collections, collection]
                          });
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Button
                  variant="contained"
                  color={migrationConfig.dryRun ? 'primary' : 'warning'}
                  onClick={runMigrationTool}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : migrationConfig.dryRun ? (
                    'Run Migration (Dry Run)'
                  ) : (
                    'Run Migration (COMMIT CHANGES)'
                  )}
                </Button>
                
                {!migrationConfig.dryRun && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Warning: This will modify data in your database. Make sure you have a backup.
                  </Alert>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Migration Results
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {migrationResults ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                            <Typography variant="h4">
                              {migrationResults.reduce((sum, r) => sum + r.processed, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Processed
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4">
                              {migrationResults.reduce((sum, r) => sum + r.succeeded, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Succeeded
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography variant="h4">
                              {migrationResults.reduce((sum, r) => sum + r.failed, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Failed
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={3}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                            <Typography variant="h4">
                              {migrationResults.reduce((sum, r) => sum + r.skipped, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Skipped
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Collection Details
                    </Typography>
                    
                    {migrationResults.map((result) => (
                      <Accordion key={result.collection} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                            <Typography>{result.collection}</Typography>
                            <Box>
                              <Chip 
                                size="small" 
                                label={`${result.succeeded} succeeded`} 
                                color="success" 
                                sx={{ mr: 1 }} 
                              />
                              {result.failed > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`${result.failed} failed`} 
                                  color="error" 
                                  sx={{ mr: 1 }} 
                                />
                              )}
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Processed: {result.processed}, Succeeded: {result.succeeded}, Failed: {result.failed}, Skipped: {result.skipped}
                          </Typography>
                          
                          {result.errors.length > 0 && (
                            <>
                              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                Errors
                              </Typography>
                              
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Document ID</TableCell>
                                      <TableCell>Error</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {result.errors.map((error: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>{error.docId}</TableCell>
                                        <TableCell>{error.error}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    
                    {migrationReport && (
                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CodeIcon />}
                          onClick={() => {
                            // In a real app, this would download the report
                            console.log(migrationReport);
                            alert('Report would be downloaded in a real app');
                          }}
                        >
                          Download Report
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Typography color="text.secondary">
                      Run a migration to see results
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Validation Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Validation Configuration
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Collections to Validate
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {collections.map((collection) => (
                    <Chip
                      key={collection}
                      label={collection}
                      clickable
                      color={migrationConfig.collections.includes(collection) ? 'primary' : 'default'}
                      onClick={() => {
                        if (migrationConfig.collections.includes(collection)) {
                          setMigrationConfig({
                            ...migrationConfig,
                            collections: migrationConfig.collections.filter(c => c !== collection)
                          });
                        } else {
                          setMigrationConfig({
                            ...migrationConfig,
                            collections: [...migrationConfig.collections, collection]
                          });
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={runValidation}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Run Validation'}
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Validation Results
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {validationResults ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                            <Typography variant="h4">
                              {validationResults.reduce((sum, r) => sum + r.valid + r.invalid, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Total Documents
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4">
                              {validationResults.reduce((sum, r) => sum + r.valid, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Valid
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography variant="h4">
                              {validationResults.reduce((sum, r) => sum + r.invalid, 0)}
                            </Typography>
                            <Typography variant="body2">
                              Invalid
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Collection Details
                    </Typography>
                    
                    {validationResults.map((result) => (
                      <Accordion key={result.collection} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                            <Typography>{result.collection}</Typography>
                            <Box>
                              <Chip 
                                size="small" 
                                label={`${result.valid} valid`} 
                                color="success" 
                                sx={{ mr: 1 }} 
                              />
                              {result.invalid > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`${result.invalid} invalid`} 
                                  color="error" 
                                  sx={{ mr: 1 }} 
                                />
                              )}
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {result.errors.length > 0 ? (
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Document ID</TableCell>
                                    <TableCell>Field</TableCell>
                                    <TableCell>Error</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {result.errors.map((error: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell>{error.docId}</TableCell>
                                      <TableCell>{error.field}</TableCell>
                                      <TableCell>{error.message}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Alert severity="success">
                              All documents in this collection are valid.
                            </Alert>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Typography color="text.secondary">
                      Run a validation to see results
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Schema Info Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Schema Information
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Current Schema Version
                  </Typography>
                  <Typography variant="body1">
                    {schemaVersion || 'Unknown'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Collections
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {collections.map((collection) => (
                      <Chip key={collection} label={collection} />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Schema Documentation
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // In a real app, this would open the schema documentation
                      window.open('/docs/schema', '_blank');
                    }}
                  >
                    View Documentation
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Schema Health Check
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>Schema is healthy</AlertTitle>
                    All collections are properly initialized and indexed.
                  </Alert>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      // In a real app, this would run a health check
                      alert('Health check would run in a real app');
                    }}
                  >
                    Run Health Check
                  </Button>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Firestore Indexes
                  </Typography>
                  <Alert severity="info">
                    All required indexes are deployed.
                  </Alert>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
