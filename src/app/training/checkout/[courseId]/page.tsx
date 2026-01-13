'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import AnimatedLoading from '@/components/Common/AnimatedLoading';
import PaymentForm from '@/components/Training/PaymentForm';
import { Course } from '@/types/training.types';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

// Mock course for development
const mockCourse: Course = {
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
};

// Inner component that uses the auth context
function CheckoutContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const steps = ['Review Order', 'Payment', 'Confirmation'];

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

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !currentUser) {
      router.push(`/login?redirect=/training/checkout/${params.courseId}`);
    }
  }, [authLoading, currentUser, router, params.courseId]);

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    
    // Simulate enrollment creation
    setTimeout(() => {
      setEnrollmentId(`enrollment_${Math.random().toString(36).substring(2, 15)}`);
      setActiveStep(2); // Move to confirmation step
    }, 1500);
  };

  const handleCancelPayment = () => {
    setActiveStep(0); // Go back to review step
  };

  if (authLoading || loading) {
    return <AnimatedLoading message="Loading Checkout..." />;
  }

  if (!course) {
    return (
      <AdminLayout>
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error">Course not found</Alert>
          <Button
            component={Link}
            href="/training"
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
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
          Checkout
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Review Your Order
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 3 }}>
                  <Box sx={{ width: 120, height: 80, position: 'relative', borderRadius: 1, overflow: 'hidden', mr: 2 }}>
                    <Image
                      src={course.thumbnail || '/images/course-placeholder.jpg'}
                      alt={course.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="h6">{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.level} • {course.duration} minutes • {course.modules.length} modules
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setActiveStep(1)}
                  sx={{ mt: 2 }}
                >
                  Proceed to Payment
                </Button>
              </Paper>
            )}
            
            {activeStep === 1 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <PaymentForm
                  courseId={course.id}
                  amount={course.price}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancelPayment}
                />
              </Paper>
            )}
            
            {activeStep === 2 && (
              <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                {!enrollmentId ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Processing your enrollment...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ py: 4 }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'success.light', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      mx: 'auto',
                      mb: 3
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      Payment Successful!
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 4 }}>
                      Thank you for your purchase. You are now enrolled in {course.title}.
                    </Typography>
                    
                    <Button
                      variant="contained"
                      component={Link}
                      href={`/training/courses/${course.id}/learn`}
                      size="large"
                    >
                      Start Learning
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Order Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Course Price</Typography>
                <Typography>${course.price.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${course.price.toFixed(2)}</Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                What You&apos;ll Get
              </Typography>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  • Full lifetime access to the course
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  • Access on mobile and desktop
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  • Certificate of completion
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  • 30-day money-back guarantee
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function CheckoutPage() {
  return (
    <AuthProvider>
      <CheckoutContent />
    </AuthProvider>
  );
}
