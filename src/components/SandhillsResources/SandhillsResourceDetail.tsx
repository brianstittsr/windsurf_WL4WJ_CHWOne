'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Chip,
  Button,
  Link as MuiLink,
  Paper
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  VerifiedUser as ClaimIcon
} from '@mui/icons-material';
import ShareResourceDialog from './ShareResourceDialog';
import ClaimResourceDialog from './ClaimResourceDialog';
import { useRouter } from 'next/navigation';
import { SandhillsResourceService } from '@/services/SandhillsResourceService';
import {
  SandhillsResource,
  ResourceStatus
} from '@/types/sandhills-resource.types';

interface SandhillsResourceDetailProps {
  resourceId: string;
  onEdit?: (resource: SandhillsResource) => void;
  onDelete?: (resource: SandhillsResource) => void;
  onBack?: () => void;
}

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

const getTypeColor = (type: string): string => {
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

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isLink?: boolean;
  isEmail?: boolean;
  isPhone?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, isLink, isEmail, isPhone }) => {
  if (!value) return null;
  
  let displayValue: React.ReactNode = value;
  
  if (isLink && value) {
    const href = value.startsWith('http') ? value : `https://${value}`;
    displayValue = (
      <MuiLink href={href} target="_blank" rel="noopener noreferrer">
        {value}
      </MuiLink>
    );
  } else if (isEmail && value) {
    displayValue = (
      <MuiLink href={`mailto:${value}`}>
        {value}
      </MuiLink>
    );
  } else if (isPhone && value) {
    displayValue = (
      <MuiLink href={`tel:${value.replace(/\D/g, '')}`}>
        {value}
      </MuiLink>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1">
          {displayValue}
        </Typography>
      </Box>
    </Box>
  );
};

export default function SandhillsResourceDetail({
  resourceId,
  onEdit,
  onDelete,
  onBack
}: SandhillsResourceDetailProps) {
  const router = useRouter();
  const [resource, setResource] = useState<SandhillsResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [resourceId]);

  const fetchResource = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SandhillsResourceService.getById(resourceId);
      if (data) {
        setResource(data);
      } else {
        setError('Resource not found');
      }
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/sandhills-resources');
    }
  };

  const handleEdit = () => {
    if (resource) {
      if (onEdit) {
        onEdit(resource);
      } else {
        router.push(`/sandhills-resources/${resourceId}/edit`);
      }
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    
    if (window.confirm(`Are you sure you want to delete "${resource.organization}"?`)) {
      try {
        await SandhillsResourceService.delete(resourceId);
        if (onDelete) {
          onDelete(resource);
        } else {
          router.push('/sandhills-resources');
        }
      } catch (err) {
        console.error('Error deleting resource:', err);
        setError('Failed to delete resource');
      }
    }
  };

  const handleVerify = async () => {
    if (!resource) return;
    try {
      const response = await fetch(`/api/sandhills-resources/${resourceId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'admin' })
      });
      if (response.ok) {
        fetchResource(); // Refresh to show the badge
      } else {
        setError('Failed to verify resource');
      }
    } catch (err) {
      console.error('Error verifying resource:', err);
      setError('Failed to verify resource');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !resource) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error || 'Resource not found'}</Alert>
          <Button onClick={handleBack} sx={{ mt: 2 }} startIcon={<BackIcon />}>
            Back to List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <IconButton onClick={handleBack} sx={{ mr: 2, mt: -0.5 }}>
              <BackIcon />
            </IconButton>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {resource.organization}
                </Typography>
                {resource.isVerified && (
                  <Chip
                    icon={<CheckIcon />}
                    label="Agency Verified"
                    color="success"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                {resource.isClaimed && (
                  <Chip
                    label="Claimed"
                    color="info"
                  />
                )}
              </Box>
              {resource.isVerified && resource.verifiedDate && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                  ✓ Verified on {resource.verifiedDate.toLocaleDateString()}
                </Typography>
              )}
              <Stack direction="row" spacing={1}>
                <Chip
                  label={resource.resourceType}
                  sx={{
                    bgcolor: getTypeColor(resource.resourceType),
                    color: 'white'
                  }}
                />
                <Chip
                  label={resource.currentStatus}
                  color={getStatusColor(resource.currentStatus)}
                />
              </Stack>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {!resource.isVerified && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleVerify}
              >
                Mark Verified
              </Button>
            )}
            {!resource.isClaimed && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<ClaimIcon />}
                onClick={() => setClaimDialogOpen(true)}
              >
                Claim
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={() => setShareDialogOpen(true)}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Left Column - Contact & Location */}
          <Grid item xs={12} md={6}>
            {/* Location Section */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1 }} /> Location
              </Typography>
              
              {resource.address && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {resource.address}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mb: 1 }}>
                {[resource.city, resource.state, resource.zip].filter(Boolean).join(', ')}
              </Typography>
              {resource.county && (
                <Typography variant="body2" color="text.secondary">
                  {resource.county} County
                </Typography>
              )}
            </Paper>

            {/* Contact Section */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1 }} /> Contact Information
              </Typography>
              
              <InfoRow
                icon={<BusinessIcon fontSize="small" />}
                label="Contact Person"
                value={resource.contactPerson}
              />
              <InfoRow
                icon={<PhoneIcon fontSize="small" />}
                label="Phone"
                value={resource.contactPersonPhone}
                isPhone
              />
              <InfoRow
                icon={<EmailIcon fontSize="small" />}
                label="Email"
                value={resource.contactPersonEmail}
                isEmail
              />
              <InfoRow
                icon={<WebsiteIcon fontSize="small" />}
                label="Website"
                value={resource.website}
                isLink
              />
              
              {resource.generalContactName && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <InfoRow
                    icon={<BusinessIcon fontSize="small" />}
                    label="General Contact"
                    value={resource.generalContactName}
                  />
                  <InfoRow
                    icon={<PhoneIcon fontSize="small" />}
                    label="General Phone"
                    value={resource.generalContactPhone}
                    isPhone
                  />
                </>
              )}
              
              {resource.lastContactDate && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <InfoRow
                    icon={<CalendarIcon fontSize="small" />}
                    label="Last Contact Date"
                    value={resource.lastContactDate}
                  />
                </>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Description & Details */}
          <Grid item xs={12} md={6}>
            {/* Description Section */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1 }} /> Resource Description
              </Typography>
              
              {resource.department && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">{resource.department}</Typography>
                </Box>
              )}
              
              {resource.resourceDescription ? (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {resource.resourceDescription}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  No description provided
                </Typography>
              )}
            </Paper>

            {/* Eligibility Section */}
            {resource.eligibility && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CheckIcon sx={{ mr: 1 }} /> Eligibility Requirements
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {resource.eligibility}
                </Typography>
              </Paper>
            )}

            {/* How to Apply Section */}
            {resource.howToApply && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1 }} /> How to Apply
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {resource.howToApply}
                </Typography>
              </Paper>
            )}

            {/* Notes Section */}
            {resource.notes && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Notes
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {resource.notes}
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Metadata */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {resource.createdAt?.toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last Updated: {resource.updatedAt?.toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      {/* Share Resource Dialog */}
      <ShareResourceDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        resource={resource}
      />

      {/* Claim Resource Dialog */}
      <ClaimResourceDialog
        open={claimDialogOpen}
        onClose={() => setClaimDialogOpen(false)}
        resource={resource}
        onClaimSubmitted={() => fetchResource()}
      />
    </Card>
  );
}
