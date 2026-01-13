'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Course } from '@/types/training.types';
import Link from 'next/link';

// Mock courses for development
const mockCourses: Course[] = [
  {
    id: 'course-1',
    organizationId: 'org-1',
    title: 'Community Health Worker Fundamentals',
    description: 'A comprehensive introduction to the role and responsibilities of Community Health Workers.',
    thumbnail: '/images/courses/chw-fundamentals.jpg',
    modules: [],
    price: 99.99,
    isPublished: true,
    requiresApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    createdBy: 'user-1',
    category: 'Healthcare',
    tags: ['CHW', 'Fundamentals', 'Healthcare'],
    level: 'beginner',
    duration: 300,
    enrollmentCount: 125,
    completionRate: 78,
    averageRating: 4.7,
    reviewCount: 42,
    isPublic: true,
    learningObjectives: [
      'Understand the role of CHWs in community health',
      'Learn basic health assessment techniques',
      'Develop communication skills for patient interaction'
    ],
    featured: true
  },
  {
    id: 'course-2',
    organizationId: 'org-1',
    title: 'Health Equity and Social Determinants',
    description: 'Explore the social determinants of health and strategies to address health inequities.',
    thumbnail: '/images/courses/health-equity.jpg',
    modules: [],
    price: 129.99,
    isPublished: true,
    requiresApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    createdBy: 'user-1',
    category: 'Healthcare',
    tags: ['Health Equity', 'Social Determinants', 'Public Health'],
    level: 'intermediate',
    duration: 420,
    enrollmentCount: 87,
    completionRate: 65,
    averageRating: 4.5,
    reviewCount: 28,
    isPublic: true,
    learningObjectives: [
      'Identify key social determinants of health',
      'Analyze health disparities in different communities',
      'Develop strategies to promote health equity'
    ],
    featured: false
  },
  {
    id: 'course-3',
    organizationId: 'org-2',
    title: 'Mental Health First Aid',
    description: 'Learn to identify, understand and respond to signs of mental health challenges.',
    thumbnail: '/images/courses/mental-health.jpg',
    modules: [],
    price: 149.99,
    isPublished: true,
    requiresApproval: true,
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 15),
    createdBy: 'user-2',
    category: 'Mental Health',
    tags: ['Mental Health', 'First Aid', 'Crisis Intervention'],
    level: 'intermediate',
    duration: 480,
    enrollmentCount: 210,
    completionRate: 82,
    averageRating: 4.9,
    reviewCount: 65,
    isPublic: true,
    learningObjectives: [
      'Recognize signs of mental health challenges',
      'Learn appropriate intervention techniques',
      'Develop skills to support individuals in crisis'
    ],
    featured: true
  }
];

// Inner component that uses the auth context
function TrainingContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        // In a real implementation, we would fetch from a database
        // For now, we'll use mock data
        setCourses(mockCourses);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError(`Failed to load courses: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const featuredCourses = filteredCourses.filter(course => course.featured);
  const allCourses = filteredCourses;
  const myCourses = currentUser ? filteredCourses.filter(course => course.organizationId === 'org-1') : [];

  if (authLoading) {
    return <AnimatedLoading message="Loading Training Portal..." />;
  }

  return (
    <AdminLayout>
      <Box sx={{ py: 4, px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Training Portal
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Enhance your skills and knowledge with our comprehensive training courses designed for healthcare professionals and community health workers.
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Search courses by title, description, or tags..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: 600, mx: 'auto' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="training tabs">
            <Tab label="Featured Courses" id="training-tab-0" aria-controls="training-tabpanel-0" />
            <Tab label="All Courses" id="training-tab-1" aria-controls="training-tabpanel-1" />
            {currentUser && <Tab label="My Courses" id="training-tab-2" aria-controls="training-tabpanel-2" />}
            {currentUser && <Tab label="Organizations" id="training-tab-3" aria-controls="training-tabpanel-3" />}
          </Tabs>
        </Box>
        
        {/* Tab Panels */}
        <Box role="tabpanel" hidden={tabValue !== 0} id="training-tabpanel-0" aria-labelledby="training-tab-0">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : featuredCourses.length > 0 ? (
            <Grid container spacing={3}>
              {featuredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No featured courses found
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 1} id="training-tabpanel-1" aria-labelledby="training-tab-1">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : allCourses.length > 0 ? (
            <Grid container spacing={3}>
              {allCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No courses found
              </Typography>
            </Box>
          )}
        </Box>
        
        {currentUser && (
          <Box role="tabpanel" hidden={tabValue !== 2} id="training-tabpanel-2" aria-labelledby="training-tab-2">
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : myCourses.length > 0 ? (
              <Grid container spacing={3}>
                {myCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard course={course} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  You haven&apos;t enrolled in any courses yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => setTabValue(1)}
                >
                  Browse Courses
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {currentUser && (
          <Box role="tabpanel" hidden={tabValue !== 3} id="training-tabpanel-3" aria-labelledby="training-tab-3">
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Organizations feature coming soon
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                component={Link}
                href="/training/organizations/new"
              >
                Create Organization
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
}

// Course Card Component
function CourseCard({ course }: { course: Course }) {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}>
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail || '/images/course-placeholder.jpg'}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" noWrap>
            {course.title}
          </Typography>
          <Chip 
            label={`$${course.price.toFixed(2)}`} 
            color="primary" 
            size="small" 
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {course.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          {course.tags.slice(0, 3).map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {course.duration} min • {course.level}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {course.enrollmentCount} enrolled
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button 
          variant="contained" 
          fullWidth
          component={Link}
          href={`/training/courses/${course.id}`}
        >
          View Course
        </Button>
      </Box>
    </Card>
  );
}

// Export the wrapped component with AuthProvider
export default function TrainingPage() {
  return (
    <AuthProvider>
      <TrainingContent />
    </AuthProvider>
  );
}
