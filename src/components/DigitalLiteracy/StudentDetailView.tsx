'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertTriangle, CheckCircle, Mail, Phone } from 'lucide-react';
import { 
  Language, 
  t, 
  TRANSLATIONS, 
  COURSE_TOPICS, 
  PROFICIENCY_LEVELS,
  getCountyName,
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

  const getProficiencyColor = (levelId: string): string => {
    const info = getProficiencyInfo(levelId, language);
    return info ? info.color : '#gray';
  };

  return (
    <div>
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {getText('detail.backToClassView')}
      </Button>

      {/* Student Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2">
            {student.name} - {classSchedule}
          </h2>
          <div className="flex gap-6 flex-wrap text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {student.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {student.phone}
            </span>
            <span>
              {getCountyName(student.county, language)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Topics by Week */}
      {Object.entries(topicsByWeek).map(([week, topics]) => {
        const weekNum = parseInt(week);
        const isCurrentWeek = weekNum === currentWeek;
        
        return (
          <Card 
            key={week} 
            className={`mb-4 ${isCurrentWeek ? 'border-2 border-orange-400' : 'border'}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold">
                  {language === 'en' ? `CLASS ${week}` : `CLASE ${week}`} ({getText('dashboard.week')} {week})
                </h3>
                {isCurrentWeek && (
                  <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {getText('detail.currentWeek')}
                  </Badge>
                )}
              </div>

              {topics.map((topic, index) => {
                const assessment = student.proficiencyAssessments[topic.code];
                const isAssessed = !!assessment;
                const topicLabel = String.fromCharCode(65 + index); // A, B, C...
                
                return (
                  <div 
                    key={topic.code}
                    className={`flex items-center justify-between py-3 ${index < topics.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {topicLabel}. {topic[language]}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 min-w-[350px]">
                      <span className="text-sm text-muted-foreground">
                        {getText('detail.proficiency')}:
                      </span>
                      
                      <Select
                        value={assessment?.level || ''}
                        onValueChange={(value) => onUpdateProficiency(student.id, topic.code, value)}
                      >
                        <SelectTrigger 
                          className="w-[180px]"
                          style={{ 
                            backgroundColor: assessment ? getProficiencyColor(assessment.level) + '20' : '#fef3c7'
                          }}
                        >
                          <SelectValue placeholder={getText('detail.selectLevel')} />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFICIENCY_LEVELS.map(level => (
                            <SelectItem 
                              key={level.id} 
                              value={level.id}
                              className="border-l-4"
                              style={{ borderLeftColor: level.color }}
                            >
                              {level[language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {isAssessed ? (
                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          ✓ {getText('detail.assessedOn')} {new Date(assessment.date).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          ⚠️ {getText('detail.notAssessed')}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Proficiency Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {getText('detail.proficiencySummary')}
          </h3>
          
          <hr className="my-4" />
          
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              {getText('detail.assessedTopics')}: {assessedTopics}/{totalTopics} ({Math.round((assessedTopics/totalTopics)*100)}%)
            </p>
            <Progress value={(assessedTopics/totalTopics)*100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PROFICIENCY_LEVELS.map(level => (
              <div 
                key={level.id}
                className="p-4 text-center rounded-lg border-l-4"
                style={{ 
                  borderLeftColor: level.color,
                  backgroundColor: level.color + '10',
                }}
              >
                <p className="text-3xl font-bold" style={{ color: level.color }}>
                  {proficiencyCounts[level.id as keyof typeof proficiencyCounts]}
                </p>
                <p className="text-sm">
                  {level[language]}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <strong>{getText('detail.notYetAssessed')}:</strong> {totalTopics - assessedTopics} {getText('detail.topics')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
