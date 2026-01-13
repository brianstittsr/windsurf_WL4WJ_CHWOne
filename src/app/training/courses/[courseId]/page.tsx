'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Rating,
  Avatar,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import { Course, Module, ContentBlock } from '@/types/training.types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// Mock course for development
const mockCourse: Course = {
  id: 'course-1',
  organizationId: 'org-1',
  title: 'Community Health Worker Fundamentals',
  description: 'A comprehensive introduction to the role and responsibilities of Community Health Workers. This course covers the essential skills and knowledge needed to be an effective CHW, including communication, community assessment, health education, and more.',
  thumbnail: '/images/courses/chw-fundamentals.jpg',
  modules: [
    {
      id: 'module-1',
      courseId: 'course-1',
      title: 'Introduction to Community Health Work',
      description: 'Learn about the history, role, and importance of Community Health Workers in the healthcare system.',
      order: 0,
      content: [
        {
          id: 'content-1',
          moduleId: 'module-1',
          type: 'video',
          title: 'The Role of CHWs in Modern Healthcare',
          content: 'https://example.com/videos/chw-role.mp4',
          order: 0,
          duration: 15,
          required: true
        },
        {
          id: 'content-2',
          moduleId: 'module-1',
          type: 'text',
          title: 'History and Evolution of Community Health Work',
          content: '<h2>The Origins of Community Health Work</h2><p>Community Health Workers have been an integral part of healthcare systems around the world for decades...</p>',
          order: 1,
          required: true
        }
      ],
      quizzes: [
        {
          id: 'quiz-1',
          moduleId: 'module-1',
          title: 'Module 1 Assessment',
          description: 'Test your understanding of the role and history of Community Health Workers.',
          questions: [],
          passingScore: 70,
          maxAttempts: 3,
          randomizeQuestions: true,
          showCorrectAnswers: true,
          order: 2,
          required: true
        }
      ],
      completionRequirements: [
        {
          id: 'req-1',
          moduleId: 'module-1',
          type: 'view_content',
          value: 'content-1',
          completed: false
        },
        {
          id: 'req-2',
          moduleId: 'module-1',
          type: 'view_content',
          value: 'content-2',
          completed: false
        },
        {
          id: 'req-3',
          moduleId: 'module-1',
          type: 'complete_quiz',
          value: 'quiz-1',
          completed: false
        }
      ],
      duration: 60,
      isPublished: true,
      isLocked: false
    },
    {
      id: 'module-2',
      courseId: 'course-1',
      title: 'Communication Skills for CHWs',
      description: 'Develop effective communication skills for interacting with patients, healthcare providers, and community members.',
      order: 1,
      content: [
        {
          id: 'content-3',
          moduleId: 'module-2',
          type: 'video',
          title: 'Effective Communication Techniques',
          content: 'https://example.com/videos/communication.mp4',
          order: 0,
          duration: 20,
          required: true
        },
        {
          id: 'content-4',
          moduleId: 'module-2',
          type: 'pdf',
          title: 'Communication Handbook',
          content: 'https://example.com/pdfs/communication-handbook.pdf',
          order: 1,
          required: false
        }
      ],
      quizzes: [
        {
          id: 'quiz-2',
          moduleId: 'module-2',
          title: 'Communication Skills Assessment',
          description: 'Test your understanding of effective communication techniques.',
          questions: [],
          passingScore: 70,
          maxAttempts: 3,
          randomizeQuestions: true,
          showCorrectAnswers: true,
          order: 2,
          required: true
        }
      ],
      completionRequirements: [
        {
          id: 'req-4',
          moduleId: 'module-2',
          type: 'view_content',
          value: 'content-3',
          completed: false
        },
        {
          id: 'req-5',
          moduleId: 'module-2',
          type: 'complete_quiz',
          value: 'quiz-2',
          completed: false
        }
      ],
      duration: 90,
      isPublished: true,
      isLocked: true,
      unlockCondition: {
        type: 'previous_module',
        value: 'module-1'
      }
    },
    {
      id: 'module-3',
      courseId: 'course-1',
      title: 'Health Assessment and Screening',
      description: 'Learn basic health assessment techniques and screening procedures used by CHWs.',
      order: 2,
      content: [
        {
          id: 'content-5',
          moduleId: 'module-3',
          type: 'video',
          title: 'Basic Health Assessment Techniques',
          content: 'https://example.com/videos/health-assessment.mp4',
          order: 0,
          duration: 25,
          required: true
        },
        {
          id: 'content-6',
          moduleId: 'module-3',
          type: 'assignment',
          title: 'Health Assessment Practice',
          content: 'Complete a mock health assessment using the provided template.',
          order: 1,
          required: true
        }
      ],
      quizzes: [],
      completionRequirements: [
        {
          id: 'req-6',
          moduleId: 'module-3',
          type: 'view_content',
          value: 'content-5',
          completed: false
        },
        {
          id: 'req-7',
          moduleId: 'module-3',
          type: 'submit_assignment',
          value: 'content-6',
          completed: false
        }
      ],
      duration: 120,
      isPublished: true,
      isLocked: true,
      unlockCondition: {
        type: 'previous_module',
        value: 'module-2'
      }
    }
  ],
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
    'Develop communication skills for patient interaction',
    'Identify common health issues in communities',
    'Create effective health education materials'
  ],
  featured: true
};

// Mock reviews
const mockReviews = [
  {
    id: 'review-1',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userAvatar: '/images/avatars/avatar1.jpg',
    rating: 5,
    comment: 'This course provided an excellent foundation for my work as a CHW. The communication skills module was particularly helpful.',
    date: new Date(Date.now() - 86400000 * 10)
  },
  {
    id: 'review-2',
    userId: 'user-3',
    userName: 'Michael Chen',
    userAvatar: '/images/avatars/avatar2.jpg',
    rating: 4,
    comment: 'Very informative content. I would have liked more practical examples, but overall a great course.',
    date: new Date(Date.now() - 86400000 * 15)
  },
  {
    id: 'review-3',
    userId: 'user-4',
    userName: 'Latisha Williams',
    userAvatar: '/images/avatars/avatar3.jpg',
    rating: 5,
    comment: 'The health assessment module was incredibly detailed and helpful. I feel much more confident in my skills now.',
    date: new Date(Date.now() - 86400000 * 20)
  }
];

// Inner component that uses the auth context
function CourseDetailContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        // In a real implementation, we would fetch from a database
        // For now, we'll use mock data
        setCourse(mockCourse);
      } catch (err) {
        console.error('Error loading course:', err);
        setError(`Failed to load course: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [params.courseId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/training/courses/' + params.courseId);
      return;
    }

    setEnrolling(true);
    
    try {
      // In a real implementation, we would call an API to enroll the user
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to the course content page
      router.push(`/training/courses/${params.courseId}/learn`);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(`Failed to enroll in course: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setEnrolling(false);
      setShowEnrollDialog(false);
    }
  };

  if (authLoading || loading) {
    return <AnimatedLoading message="Loading Course..." />;
  }

  if (!course) {
    return (
      <AdminLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error">Course not found</Alert>
          <Button
            component={Link}
            href="/training"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Courses
          </Button>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ py: 4, px: 2 }}>
        {/* Back Button */}
        <Button
          component={Link}
          href="/training"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Courses
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Course Header */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
              {course.title}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              {course.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip icon={<StarIcon />} label={`${course.averageRating} (${course.reviewCount} reviews)`} />
              <Chip icon={<PeopleIcon />} label={`${course.enrollmentCount} enrolled`} />
              <Chip icon={<TimeIcon />} label={`${course.duration} minutes`} />
              <Chip icon={<SchoolIcon />} label={course.level} />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {course.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Box>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={() => setShowEnrollDialog(true)}
            >
              Enroll Now - ${course.price.toFixed(2)}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative', width: '100%', height: 240, borderRadius: 2, overflow: 'hidden' }}>
              <Image
                src={course.thumbnail || '/images/course-placeholder.jpg'}
                alt={course.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
          </Grid>
        </Grid>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="course tabs">
            <Tab label="Curriculum" id="course-tab-0" aria-controls="course-tabpanel-0" />
            <Tab label="Objectives" id="course-tab-1" aria-controls="course-tabpanel-1" />
            <Tab label="Reviews" id="course-tab-2" aria-controls="course-tabpanel-2" />
          </Tabs>
        </Box>
        
        {/* Curriculum Tab */}
        <Box role="tabpanel" hidden={tabValue !== 0} id="course-tabpanel-0" aria-labelledby="course-tab-0">
          <Typography variant="h5" sx={{ mb: 3 }}>
            Course Curriculum
          </Typography>
          
          <List>
            {course.modules.map((module, index) => (
              <React.Fragment key={module.id}>
                <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                  <ListItem
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      py: 2
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          Module {index + 1}: {module.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'primary.contrastText', opacity: 0.8 }}>
                          {module.duration} minutes • {module.content.length + module.quizzes.length} items
                        </Typography>
                      }
                    />
                    {module.isLocked && (
                      <Chip 
                        label="Locked" 
                        color="default" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItem>
                  
                  <List disablePadding>
                    {module.content.map((content) => (
                      <ListItem key={content.id} sx={{ pl: 4 }}>
                        <ListItemIcon>
                          {content.type === 'video' && <PlayIcon />}
                          {content.type === 'assignment' && <AssignmentIcon />}
                          {(content.type === 'text' || content.type === 'pdf') && <AssignmentIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={content.title}
                          secondary={`${content.type} • ${content.duration || 'N/A'} minutes${content.required ? ' • Required' : ''}`}
                        />
                      </ListItem>
                    ))}
                    
                    {module.quizzes.map((quiz) => (
                      <ListItem key={quiz.id} sx={{ pl: 4 }}>
                        <ListItemIcon>
                          <QuizIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={quiz.title}
                          secondary={`Quiz • ${quiz.questions.length} questions${quiz.required ? ' • Required' : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </React.Fragment>
            ))}
          </List>
        </Box>
        
        {/* Objectives Tab */}
        <Box role="tabpanel" hidden={tabValue !== 1} id="course-tabpanel-1" aria-labelledby="course-tab-1">
          <Typography variant="h5" sx={{ mb: 3 }}>
            Learning Objectives
          </Typography>
          
          <List>
            {course.learningObjectives.map((objective, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={objective} />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Reviews Tab */}
        <Box role="tabpanel" hidden={tabValue !== 2} id="course-tabpanel-2" aria-labelledby="course-tab-2">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Student Reviews
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={course.averageRating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {course.averageRating.toFixed(1)} ({course.reviewCount} reviews)
              </Typography>
            </Box>
          </Box>
          
          {mockReviews.map((review) => (
            <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar src={review.userAvatar} alt={review.userName} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1">{review.userName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={review.rating} size="small" readOnly />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2">{review.comment}</Typography>
            </Paper>
          ))}
        </Box>
        
        {/* Enrollment Dialog */}
        <Dialog
          open={showEnrollDialog}
          onClose={() => !enrolling && setShowEnrollDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Enroll in {course.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to enroll in this course for ${course.price.toFixed(2)}.
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              This will give you full access to all course materials, quizzes, and assignments.
            </Typography>
            
            {!currentUser && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You need to be logged in to enroll in this course.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => !enrolling && setShowEnrollDialog(false)} 
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Processing...' : 'Confirm Enrollment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function CourseDetailPage() {
  return (
    <AuthProvider>
      <CourseDetailContent />
    </AuthProvider>
  );
}
