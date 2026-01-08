'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Language, t, TRANSLATIONS } from '@/lib/translations/digitalLiteracy';
import { Student } from './StudentCard';

interface CompletionTrackingProps {
  student: Student;
  language: Language;
  instructorName: string;
  onSave: (data: CompletionData) => void;
  onCancel: () => void;
}

export interface CompletionData {
  studentId: string;
  completed: boolean;
  completionDate?: string;
  tabletSerial?: string;
  tabletIssued?: boolean;
  nonCompletionReason?: string;
  instructorName: string;
  signatureDate: string;
}

export default function CompletionTracking({
  student,
  language,
  instructorName,
  onSave,
  onCancel,
}: CompletionTrackingProps) {
  const [completed, setCompleted] = useState<boolean | null>(student.completed ?? null);
  const [completionDate, setCompletionDate] = useState(student.completionDate || new Date().toISOString().split('T')[0]);
  const [tabletSerial, setTabletSerial] = useState(student.tabletSerial || '');
  const [tabletIssued, setTabletIssued] = useState(false);
  const [nonCompletionReason, setNonCompletionReason] = useState(student.nonCompletionReason || '');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const getText = (key: string) => t(key, language, TRANSLATIONS);

  const handleSave = () => {
    if (completed === null) {
      setError(language === 'en' ? 'Please select completion status' : 'Por favor seleccione el estado de finalización');
      return;
    }
    
    if (!completed && !nonCompletionReason.trim()) {
      setError(language === 'en' ? 'Please provide a reason for non-completion' : 'Por favor proporcione una razón de no finalización');
      return;
    }

    onSave({
      studentId: student.id,
      completed,
      completionDate: completed ? completionDate : undefined,
      tabletSerial: completed ? tabletSerial : undefined,
      tabletIssued: completed ? tabletIssued : undefined,
      nonCompletionReason: !completed ? nonCompletionReason : undefined,
      instructorName,
      signatureDate,
    });
  };

  const commonReasons = language === 'en' 
    ? [
        'Attendance below 80%',
        'Student withdrew from program',
        'Health/family emergency',
        'Transportation issues',
        'Work schedule conflict',
      ]
    : [
        'Asistencia menor al 80%',
        'Estudiante se retiró del programa',
        'Emergencia de salud/familia',
        'Problemas de transporte',
        'Conflicto de horario laboral',
      ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {getText('completion.title')} - {student.name} ({student.id})
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Completion Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            {getText('completion.didComplete')}
          </Typography>
          <RadioGroup
            value={completed === null ? '' : completed ? 'yes' : 'no'}
            onChange={(e) => setCompleted(e.target.value === 'yes')}
          >
            <FormControlLabel 
              value="yes" 
              control={<Radio color="success" />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="success" />
                  {getText('completion.yesCompleted')}
                </Box>
              }
            />
            <FormControlLabel 
              value="no" 
              control={<Radio color="error" />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon color="error" />
                  {getText('completion.noNotComplete')}
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* If Completed */}
        {completed === true && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 1, border: '1px solid #86efac' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="success.dark" gutterBottom>
              {getText('completion.ifCompleted')}
            </Typography>
            
            <TextField
              fullWidth
              label={getText('completion.dateCompleted')}
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label={getText('completion.tabletSerial')}
              placeholder="SN: ABC123456789"
              value={tabletSerial}
              onChange={(e) => setTabletSerial(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={tabletIssued} 
                  onChange={(e) => setTabletIssued(e.target.checked)}
                  color="success"
                />
              }
              label={getText('completion.tabletIssued')}
            />
          </Box>
        )}

        {/* If Not Completed */}
        {completed === false && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid #fca5a5' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="error.dark" gutterBottom>
              {getText('completion.ifNotCompleted')}
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              {getText('completion.reasonRequired')}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              value={nonCompletionReason}
              onChange={(e) => setNonCompletionReason(e.target.value)}
              placeholder={language === 'en' ? 'Enter reason...' : 'Ingrese razón...'}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {getText('completion.commonReasons')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonReasons.map((reason, index) => (
                <Button
                  key={index}
                  size="small"
                  variant="outlined"
                  onClick={() => setNonCompletionReason(reason)}
                  sx={{ fontSize: '0.75rem' }}
                >
                  • {reason}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {/* Instructor Signature */}
        {completed !== null && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {getText('completion.instructorSignature')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label={getText('completion.instructorName')}
                value={instructorName}
                disabled
                sx={{ flex: 1, minWidth: 200 }}
              />
              
              <TextField
                label={getText('completion.date')}
                type="date"
                value={signatureDate}
                onChange={(e) => setSignatureDate(e.target.value)}
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onCancel}>
            {getText('actions.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={completed === null}
          >
            {getText('actions.save')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
