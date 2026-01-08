'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  TextField,
  Divider,
  Chip,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { 
  Language, 
  t, 
  TRANSLATIONS, 
  COURSE_TOPICS, 
  PROFICIENCY_LEVELS,
  getCountyName,
  getTopicName,
  getProficiencyInfo,
} from '@/lib/translations/digitalLiteracy';
import { Student } from './StudentCard';

interface StudentDetailViewProps {
  student: Student;
  language: Language;
  currentWeek: number;
  onBack: () => void;
  onUpdateProficiency: (studentId: string, topicCode: string, level: string) => void;
  classSchedule: string;
}

export default function StudentDetailView({
  student,
  language,
  currentWeek,
  onBack,
  onUpdateProficiency,
  classSchedule,
}: StudentDetailViewProps) {
  const getText = (key: string) => t(key, language, TRANSLATIONS);
  
  // Group topics by week
  const topicsByWeek: { [week: number]: typeof COURSE_TOPICS } = {};
  COURSE_TOPICS.forEach(topic => {
    if (!topicsByWeek[topic.week]) {
      topicsByWeek[topic.week] = [];
    }
    topicsByWeek[topic.week].push(topic);
  });

  // Calculate proficiency summary
  const assessedTopics = Object.keys(student.proficiencyAssessments).length;
  const totalTopics = COURSE_TOPICS.length;
  
  const proficiencyCounts = {
    mastery: 0,
    proficient: 0,
    developing: 0,
    beginning: 0,
  };
  
  Object.values(student.proficiencyAssessments).forEach(assessment => {
    if (assessment.level in proficiencyCounts) {
      proficiencyCounts[assessment.level as keyof typeof proficiencyCounts]++;
    }
  });

  const getProficiencyLabel = (levelId: string): string => {
    const info = getProficiencyInfo(levelId, language);
    return info ? info.name : levelId;
  };

  const getProficiencyColor = (levelId: string): string => {
    const info = getProficiencyInfo(levelId, language);
    return info ? info.color : '#gray';
  };

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={onBack}
        sx={{ mb: 2 }}
      >
        ← {getText('detail.backToClassView')}
      </Button>

      {/* Student Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {student.name} - {classSchedule}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 16 }} />
              {student.email}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 16 }} />
              {student.phone}
            </Typography>
            <Typography variant="body2">
              {getCountyName(student.county, language)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Topics by Week */}
      {Object.entries(topicsByWeek).map(([week, topics]) => {
        const weekNum = parseInt(week);
        const isCurrentWeek = weekNum === currentWeek;
        
        return (
          <Card 
            key={week} 
            sx={{ 
              mb: 2,
              border: isCurrentWeek ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {language === 'en' ? `CLASS ${week}` : `CLASE ${week}`} ({getText('dashboard.week')} {week})
                </Typography>
                {isCurrentWeek && (
                  <Chip 
                    icon={<WarningIcon sx={{ fontSize: 16 }} />}
                    label={getText('detail.currentWeek')}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>

              {topics.map((topic, index) => {
                const assessment = student.proficiencyAssessments[topic.code];
                const isAssessed = !!assessment;
                const topicLabel = String.fromCharCode(65 + index); // A, B, C...
                
                return (
                  <Box 
                    key={topic.code}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      py: 1.5,
                      borderBottom: index < topics.length - 1 ? '1px solid #e5e7eb' : 'none',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {topicLabel}. {topic[language]}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 350 }}>
                      <Typography variant="body2" color="text.secondary">
                        {getText('detail.proficiency')}:
                      </Typography>
                      
                      <TextField
                        select
                        size="small"
                        value={assessment?.level || ''}
                        onChange={(e) => onUpdateProficiency(student.id, topic.code, e.target.value)}
                        sx={{ 
                          minWidth: 180,
                          '& .MuiSelect-select': {
                            bgcolor: assessment ? getProficiencyColor(assessment.level) + '20' : '#fef3c7',
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          {getText('detail.selectLevel')}
                        </MenuItem>
                        {PROFICIENCY_LEVELS.map(level => (
                          <MenuItem 
                            key={level.id} 
                            value={level.id}
                            sx={{ 
                              borderLeft: `4px solid ${level.color}`,
                              ml: 0.5,
                            }}
                          >
                            {level[language]}
                          </MenuItem>
                        ))}
                      </TextField>
                      
                      {isAssessed ? (
                        <Chip
                          icon={<CheckIcon sx={{ fontSize: 14 }} />}
                          label={`✓ ${getText('detail.assessedOn')} ${new Date(assessment.date).toLocaleDateString()}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<WarningIcon sx={{ fontSize: 14 }} />}
                          label={`⚠️ ${getText('detail.notAssessed')}`}
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Proficiency Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {getText('detail.proficiencySummary')}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {getText('detail.assessedTopics')}: {assessedTopics}/{totalTopics} ({Math.round((assessedTopics/totalTopics)*100)}%)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(assessedTopics/totalTopics)*100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Grid container spacing={2}>
            {PROFICIENCY_LEVELS.map(level => (
              <Grid item xs={6} sm={3} key={level.id}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    borderLeft: `4px solid ${level.color}`,
                    bgcolor: level.color + '10',
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" sx={{ color: level.color }}>
                    {proficiencyCounts[level.id as keyof typeof proficiencyCounts]}
                  </Typography>
                  <Typography variant="body2">
                    {level[language]}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2, bgcolor: '#fef3c7' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" sx={{ fontSize: 18 }} />
                <strong>{getText('detail.notYetAssessed')}:</strong> {totalTopics - assessedTopics} {getText('detail.topics')}
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
