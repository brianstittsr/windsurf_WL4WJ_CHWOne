'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  Share as ShareIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import ShareResourceDialog from './ShareResourceDialog';
import { useRouter } from 'next/navigation';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';
import {
  SandhillsResource,
  ResourceType,
  ResourceStatus,
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  SANDHILLS_COUNTIES,
  COVERAGE_OPTIONS,
  getCountiesDisplay
} from '@/types/sandhills-resource.types';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof SandhillsResource | 'actions';
  label: string;
  sortable: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'organization', label: 'Organization', sortable: true },
  { id: 'resourceType', label: 'Type', sortable: true, width: '150px' },
  { id: 'county', label: 'County', sortable: true, width: '120px' },
  { id: 'city', label: 'City', sortable: true, width: '120px' },
  { id: 'contactPerson', label: 'Contact', sortable: true, width: '150px' },
  { id: 'currentStatus', label: 'Status', sortable: true, width: '120px' },
  { id: 'actions', label: 'Actions', sortable: false, width: '150px' }
];

const getStatusColor = (status: ResourceStatus): 'success' | 'error' | 'warning' | 'info' => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'error';
    case 'Pending Verification':
      return 'warning';
    case 'Needs Update':
      return 'info';
    default:
      return 'info';
  }
};

const getTypeColor = (type: ResourceType): string => {
  const colors: Record<string, string> = {
    "Children's Services": '#4CAF50',
    "Disability Programs": '#2196F3',
    "Domestic Violence Advocacy": '#9C27B0',
    "Education": '#FF9800',
    "Financial Services": '#607D8B',
    "Health Programs": '#E91E63',
    "Housing & Housing Repairs": '#795548',
    "Legal Aid": '#3F51B5',
    "Medical & Dental": '#00BCD4',
    "Multiple Services": '#9E9E9E',
    "Senior Services": '#FF5722',
    "Transportation": '#8BC34A',
    "Utilities": '#FFC107',
    "Other": '#757575'
  };
  return colors[type] || '#757575';
};

interface SandhillsResourcesListProps {
  onViewResource?: (resource: SandhillsResource) => void;
  onEditResource?: (resource: SandhillsResource) => void;
  embedded?: boolean;
}

export default function SandhillsResourcesList({
  onViewResource,
  onEditResource,
  embedded = false
}: SandhillsResourcesListProps) {
  const router = useRouter();
  const [resources, setResources] = useState<SandhillsResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sorting
  const [orderBy, setOrderBy] = useState<keyof SandhillsResource>('organization');
  const [order, setOrder] = useState<Order>('asc');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');
  const [countyFilter, setCountyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<SandhillsResource | null>(null);

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [resourceToShare, setResourceToShare] = useState<SandhillsResource | null>(null);

  // Fetch resources
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SandhillsResourceService.getAll();
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Sorting handler
  const handleRequestSort = (property: keyof SandhillsResource) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter and sort resources
  const filteredAndSortedResources = useMemo(() => {
    let filtered = [...resources];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.organization.toLowerCase().includes(searchLower) ||
        r.resourceDescription?.toLowerCase().includes(searchLower) ||
        r.city?.toLowerCase().includes(searchLower) ||
        r.county?.toLowerCase().includes(searchLower) ||
        r.contactPerson?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(r => r.resourceType === typeFilter);
    }
    
    // Apply county filter - check both counties array and legacy county field
    if (countyFilter) {
      filtered = filtered.filter(r => {
        // Check new counties array first
        if (r.counties && r.counties.length > 0) {
          return r.counties.includes(countyFilter) || r.counties.includes("All NC Counties");
        }
        // Fall back to legacy county field
        return r.county?.includes(countyFilter);
      });
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(r => r.currentStatus === statusFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aValue = a[orderBy] ?? '';
      const bValue = b[orderBy] ?? '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    return filtered;
  }, [resources, searchTerm, typeFilter, countyFilter, statusFilter, orderBy, order]);

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setCountyFilter('');
    setStatusFilter('');
  };

  // Delete handlers
  const handleDeleteClick = (resource: SandhillsResource) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    
    try {
      await SandhillsResourceService.delete(resourceToDelete.id);
      setResources(prev => prev.filter(r => r.id !== resourceToDelete.id));
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  // Navigation handlers
  const handleView = (resource: SandhillsResource) => {
    if (onViewResource) {
      onViewResource(resource);
    } else {
      router.push(`/sandhills-resources/${resource.id}`);
    }
  };

  const handleEdit = (resource: SandhillsResource) => {
    if (onEditResource) {
      onEditResource(resource);
    } else {
      router.push(`/sandhills-resources/${resource.id}/edit`);
    }
  };

  const handleAdd = () => {
    router.push('/sandhills-resources/new');
  };

  // Get paginated data
  const paginatedResources = filteredAndSortedResources.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Use standard county list instead of extracting from data
  // This provides a clean, consistent dropdown
  const allCountyOptions = useMemo(() => {
    return [...SANDHILLS_COUNTIES, ...COVERAGE_OPTIONS];
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Sandhills Resources
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filters
            </Button>
            <IconButton onClick={fetchResources} size="small">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              size="small"
            >
              Add Resource
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search organizations, descriptions, contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            size="small"
          />
          
          {showFilters && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Resource Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Resource Type"
                    onChange={(e) => setTypeFilter(e.target.value as ResourceType | '')}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {RESOURCE_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>County</InputLabel>
                  <Select
                    value={countyFilter}
                    label="County"
                    onChange={(e) => setCountyFilter(e.target.value)}
                  >
                    <MenuItem value="">All Counties</MenuItem>
                    {allCountyOptions.map(county => (
                      <MenuItem key={county} value={county}>{county}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value as ResourceStatus | '')}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {RESOURCE_STATUSES.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Button
                  variant="text"
                  onClick={clearFilters}
                  fullWidth
                  sx={{ height: '100%' }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Results count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredAndSortedResources.length} of {resources.length} resources
        </Typography>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={{ fontWeight: 'bold', width: headCell.width }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof SandhillsResource)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No resources found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResources.map((resource) => (
                  <TableRow
                    key={resource.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {resource.organization}
                          </Typography>
                          {resource.isVerified && (
                            <Tooltip title={`Agency Verified${resource.verifiedDate ? ` on ${resource.verifiedDate.toLocaleDateString()}` : ''}`}>
                              <Chip
                                icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                                label="Verified"
                                size="small"
                                color="success"
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.65rem',
                                  '& .MuiChip-icon': { fontSize: 14 }
                                }}
                              />
                            </Tooltip>
                          )}
                          {resource.isClaimed && (
                            <Tooltip title="Claimed by organization">
                              <Chip
                                label="Claimed"
                                size="small"
                                color="info"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                        {resource.resourceDescription && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {resource.resourceDescription}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={resource.resourceType}
                        size="small"
                        sx={{
                          bgcolor: getTypeColor(resource.resourceType),
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {getCountiesDisplay(resource.counties, resource.county)}
                      </Typography>
                    </TableCell>
                    <TableCell>{resource.city || '-'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {resource.contactPerson || '-'}
                        </Typography>
                        {resource.contactPersonPhone && (
                          <Typography variant="caption" color="text.secondary">
                            {resource.contactPersonPhone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={resource.currentStatus}
                        size="small"
                        color={getStatusColor(resource.currentStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(resource)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setResourceToShare(resource);
                              setShareDialogOpen(true);
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(resource)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(resource)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAndSortedResources.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{resourceToDelete?.organization}&quot;?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Resource Dialog */}
      <ShareResourceDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setResourceToShare(null);
        }}
        resource={resourceToShare}
      />
    </Card>
  );
}
