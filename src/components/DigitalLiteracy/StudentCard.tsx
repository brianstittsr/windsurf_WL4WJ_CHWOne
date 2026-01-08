'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Language, t, TRANSLATIONS, getCountyName } from '@/lib/translations/digitalLiteracy';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  classId: string;
  registrationDate: string;
  attendance: {
    present: number;
    total: number;
  };
  proficiencyAssessments: {
    [topicCode: string]: {
      level: string;
      date: string;
      assessedBy: string;
    };
  };
  isPresent?: boolean;
  completed?: boolean;
  completionDate?: string;
  tabletSerial?: string;
  nonCompletionReason?: string;
}

interface StudentCardProps {
  student: Student;
  language: Language;
  currentWeek: number;
  onToggleAttendance: (studentId: string, isPresent: boolean) => void;
  onViewDetails: (studentId: string) => void;
  totalTopicsThisWeek?: number;
  assessedTopicsThisWeek?: number;
}

export default function StudentCard({
  student,
  language,
  currentWeek,
  onToggleAttendance,
  onViewDetails,
  totalTopicsThisWeek = 2,
  assessedTopicsThisWeek = 0,
}: StudentCardProps) {
  const attendancePercent = student.attendance.total > 0 
    ? Math.round((student.attendance.present / student.attendance.total) * 100)
    : 0;
  
  const needsAssessment = assessedTopicsThisWeek < totalTopicsThisWeek;
  
  const getText = (key: string) => t(key, language, TRANSLATIONS);

  return (
    <Card 
      elevation={2}
      sx={{ 
        position: 'relative',
        border: needsAssessment ? '2px solid #f59e0b' : '1px solid #e5e7eb',
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header with name and attendance toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => onToggleAttendance(student.id, !student.isPresent)}
              sx={{
                bgcolor: student.isPresent ? 'success.light' : 'error.light',
                '&:hover': {
                  bgcolor: student.isPresent ? 'success.main' : 'error.main',
                }
              }}
            >
              {student.isPresent ? (
                <PresentIcon sx={{ color: 'white', fontSize: 18 }} />
              ) : (
                <AbsentIcon sx={{ color: 'white', fontSize: 18 }} />
              )}
            </IconButton>
            <Typography variant="subtitle1" fontWeight="bold">
              {student.name}
            </Typography>
          </Box>
          
          {needsAssessment && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 16 }} />}
              label={getText('studentCard.needsAssessment')}
              size="small"
              color="warning"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* Contact info */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmailIcon sx={{ fontSize: 14 }} />
            {student.email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon sx={{ fontSize: 14 }} />
            {student.phone}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getCountyName(student.county, language)}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {getText('studentCard.attendance')}:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {student.attendance.present}/{student.attendance.total} ({attendancePercent}%)
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              {getText('studentCard.weekTopics')} {currentWeek}:
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="medium"
              color={needsAssessment ? 'warning.main' : 'success.main'}
            >
              {needsAssessment && '⚠️ '}
              {assessedTopicsThisWeek}/{totalTopicsThisWeek} {getText('studentCard.assessed')}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={student.isPresent ? 'contained' : 'outlined'}
            color={student.isPresent ? 'success' : 'error'}
            onClick={() => onToggleAttendance(student.id, !student.isPresent)}
            sx={{ flex: 1, fontSize: '0.75rem' }}
          >
            {student.isPresent ? (
              <>✓ {getText('studentCard.present')}</>
            ) : (
              getText('studentCard.absent')
            )}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewDetails(student.id)}
            startIcon={<InfoIcon sx={{ fontSize: 16 }} />}
            sx={{ flex: 1, fontSize: '0.75rem' }}
          >
            📝 {getText('studentCard.details')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
