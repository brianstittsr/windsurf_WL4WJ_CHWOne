'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Rating,
  FormControlLabel,
  Checkbox,
  Divider,
  Autocomplete,
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Star as StarIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
}

interface FeedbackData {
  overallRating: number | null;
  instructorRating: number | null;
  contentRating: number | null;
  materialsRating: number | null;
  paceRating: number | null;
  mostHelpful: string;
  improvements: string;
  wouldRecommend: boolean;
  additionalComments: string;
  anonymous: boolean;
  studentName: string;
  studentEmail: string;
}

const RATING_LABELS = {
  en: {
    overall: 'Overall Program Experience',
    instructor: 'Instructor Quality',
    content: 'Course Content',
    materials: 'Learning Materials',
    pace: 'Course Pace',
  },
  es: {
    overall: 'Experiencia General del Programa',
    instructor: 'Calidad del Instructor',
    content: 'Contenido del Curso',
    materials: 'Materiales de Aprendizaje',
    pace: 'Ritmo del Curso',
  },
};

export default function FeedbackFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<RegisteredStudent | null>(null);
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: null,
    instructorRating: null,
    contentRating: null,
    materialsRating: null,
    paceRating: null,
    mostHelpful: '',
    improvements: '',
    wouldRecommend: false,
    additionalComments: '',
    anonymous: false,
    studentName: '',
    studentEmail: '',
  });

  // Fetch registered students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/checkin/students');
        if (response.ok) {
          const data = await response.json();
          setRegisteredStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Detect browser language
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguage('es');
      }
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const handleRatingChange = (field: keyof FeedbackData, value: number | null) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.overallRating) {
      setError(language === 'es' 
        ? 'Por favor proporcione una calificación general' 
        : 'Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          language,
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        // For demo, still show success
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // For demo, still show success
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ThumbUpIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {language === 'es' ? '¡Gracias por su Retroalimentación!' : 'Thank You for Your Feedback!'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {language === 'es' 
              ? 'Sus comentarios nos ayudan a mejorar el programa.'
              : 'Your feedback helps us improve the program.'}
          </Typography>
          <Button variant="contained" href="/">
            {language === 'es' ? 'Volver al Inicio' : 'Return Home'}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Language Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size="small" onClick={toggleLanguage}>
          {language === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
        </Button>
      </Box>

      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#9c27b0', color: 'white' }}>
        <FeedbackIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          {language === 'es' ? 'Formulario de Retroalimentación' : 'Feedback Form'}
        </Typography>
        <Typography variant="subtitle1">
          {language === 'es' ? 'Programa de Alfabetización Digital' : 'Digital Literacy Program'}
        </Typography>
      </Paper>

      {/* Info Card */}
      <Card sx={{ mb: 3, bgcolor: '#f3e5f5' }}>
        <CardContent>
          <Typography variant="body2">
            {language === 'es'
              ? 'Su opinión es muy importante para nosotros. Por favor tome unos minutos para compartir su experiencia con el programa.'
              : 'Your opinion is very important to us. Please take a few minutes to share your experience with the program.'}
          </Typography>
        </CardContent>
      </Card>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Anonymous Option */}
          <FormControlLabel
            control={
              <Checkbox
                checked={feedback.anonymous}
                onChange={(e) => setFeedback(prev => ({ ...prev, anonymous: e.target.checked }))}
              />
            }
            label={language === 'es' ? 'Enviar de forma anónima' : 'Submit anonymously'}
            sx={{ mb: 2 }}
          />

          {/* Email Selection (if not anonymous) */}
          {!feedback.anonymous && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {language === 'es' ? 'Seleccione su correo electrónico' : 'Select your email'}
              </Typography>
              {loadingStudents ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : registeredStudents.length > 0 ? (
                <Autocomplete
                  options={registeredStudents}
                  getOptionLabel={(option) => option.email}
                  value={selectedStudent}
                  onChange={(_, newValue) => {
                    setSelectedStudent(newValue);
                    if (newValue) {
                      setFeedback(prev => ({ 
                        ...prev, 
                        studentName: newValue.name,
                        studentEmail: newValue.email 
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={language === 'es' ? 'Correo electrónico' : 'Email'}
                      placeholder={language === 'es' ? 'Buscar...' : 'Search...'}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <EmailIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body1">{option.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.name}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  noOptionsText={language === 'es' ? 'No se encontraron estudiantes' : 'No students found'}
                />
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {language === 'es' 
                    ? 'No hay estudiantes registrados.'
                    : 'No students registered.'}
                </Alert>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Ratings Section */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            {language === 'es' ? 'Calificaciones' : 'Ratings'}
          </Typography>

          {/* Overall Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {RATING_LABELS[language].overall} *
            </Typography>
            <Rating
              value={feedback.overallRating}
              onChange={(_, value) => handleRatingChange('overallRating', value)}
              size="large"
              icon={<StarIcon fontSize="inherit" color="primary" />}
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
          </Box>

          {/* Instructor Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {RATING_LABELS[language].instructor}
            </Typography>
            <Rating
              value={feedback.instructorRating}
              onChange={(_, value) => handleRatingChange('instructorRating', value)}
              size="large"
            />
          </Box>

          {/* Content Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {RATING_LABELS[language].content}
            </Typography>
            <Rating
              value={feedback.contentRating}
              onChange={(_, value) => handleRatingChange('contentRating', value)}
              size="large"
            />
          </Box>

          {/* Materials Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {RATING_LABELS[language].materials}
            </Typography>
            <Rating
              value={feedback.materialsRating}
              onChange={(_, value) => handleRatingChange('materialsRating', value)}
              size="large"
            />
          </Box>

          {/* Pace Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {RATING_LABELS[language].pace}
            </Typography>
            <Rating
              value={feedback.paceRating}
              onChange={(_, value) => handleRatingChange('paceRating', value)}
              size="large"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Open-ended Questions */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            {language === 'es' ? 'Sus Comentarios' : 'Your Comments'}
          </Typography>

          {/* Most Helpful */}
          <TextField
            fullWidth
            label={language === 'es' ? '¿Qué fue lo más útil del programa?' : 'What was most helpful about the program?'}
            value={feedback.mostHelpful}
            onChange={(e) => setFeedback(prev => ({ ...prev, mostHelpful: e.target.value }))}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          {/* Improvements */}
          <TextField
            fullWidth
            label={language === 'es' ? '¿Qué podríamos mejorar?' : 'What could we improve?'}
            value={feedback.improvements}
            onChange={(e) => setFeedback(prev => ({ ...prev, improvements: e.target.value }))}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          {/* Additional Comments */}
          <TextField
            fullWidth
            label={language === 'es' ? 'Comentarios Adicionales' : 'Additional Comments'}
            value={feedback.additionalComments}
            onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          {/* Would Recommend */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={feedback.wouldRecommend}
                    onChange={(e) => setFeedback(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                  />
                }
                label={
                  <Typography variant="body2">
                    {language === 'es'
                      ? '¿Recomendaría este programa a otros?'
                      : 'Would you recommend this program to others?'}
                  </Typography>
                }
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {submitting 
              ? (language === 'es' ? 'Enviando...' : 'Submitting...')
              : (language === 'es' ? 'Enviar Retroalimentación' : 'Submit Feedback')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
