'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Chip
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const organization = (searchParams.get('org') as 'region5' | 'wl4wj' | 'general') || 'general';

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const getOrganizationInfo = () => {
    switch (organization) {
      case 'region5':
        return {
          title: 'Region 5 File Upload',
          subtitle: 'Upload documents, forms, and resources for Region 5',
          color: 'primary'
        };
      case 'wl4wj':
        return {
          title: 'WL4WJ File Upload',
          subtitle: 'Upload documents, forms, and resources for Women Leading for Wellness & Justice',
          color: 'secondary'
        };
      default:
        return {
          title: 'File Upload',
          subtitle: 'Upload documents, forms, and resources',
          color: 'primary'
        };
    }
  };

  const orgInfo = getOrganizationInfo();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Upload Files', href: '/upload' }
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbItems.map((item, index) => (
              <MuiLink
                key={index}
                component={Link}
                href={item.href}
                underline="hover"
                color="inherit"
              >
                {item.label}
              </MuiLink>
            ))}
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            {orgInfo.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {orgInfo.subtitle}
          </Typography>
          {organization !== 'general' && (
            <Chip
              label={organization === 'region5' ? 'Region 5' : 'WL4WJ'}
              color={orgInfo.color as any}
              sx={{ fontSize: '0.9rem', px: 2, py: 1 }}
            />
          )}
        </Box>

        {/* File Upload Component */}
        <FileUpload
          organization={organization}
          maxFileSize={25} // 25MB for larger documents
          allowedTypes={[
            'image/*',
            'application/pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.txt',
            '.ppt',
            '.pptx',
            '.zip',
            '.csv'
          ]}
          onUploadComplete={(files) => {
            console.log('Files uploaded successfully:', files);
            // You could add additional logic here, like showing a success message
            // or redirecting to a file management page
          }}
        />
      </Container>
    </MainLayout>
  );
}
