'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Mail, Phone, Info } from 'lucide-react';
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
    <Card className={`relative hover:shadow-lg transition-shadow ${needsAssessment ? 'border-2 border-orange-400' : 'border'}`}>
      <CardContent className="p-4">
        {/* Header with name and attendance toggle */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleAttendance(student.id, !student.isPresent)}
              className={`p-1.5 rounded-full ${student.isPresent ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {student.isPresent ? (
                <CheckCircle className="h-4 w-4 text-white" />
              ) : (
                <XCircle className="h-4 w-4 text-white" />
              )}
            </button>
            <span className="font-bold">{student.name}</span>
          </div>
          
          {needsAssessment && (
            <Badge variant="outline" className="text-xs border-orange-400 text-orange-600 bg-orange-50">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {getText('studentCard.needsAssessment')}
            </Badge>
          )}
        </div>

        {/* Contact info */}
        <div className="mb-3 space-y-0.5">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {student.email}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {student.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {getCountyName(student.county, language)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {getText('studentCard.attendance')}:
            </p>
            <p className="text-sm font-medium">
              {student.attendance.present}/{student.attendance.total} ({attendancePercent}%)
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {getText('studentCard.weekTopics')} {currentWeek}:
            </p>
            <p className={`text-sm font-medium ${needsAssessment ? 'text-orange-600' : 'text-green-600'}`}>
              {needsAssessment && '⚠️ '}
              {assessedTopicsThisWeek}/{totalTopicsThisWeek} {getText('studentCard.assessed')}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={student.isPresent ? 'default' : 'outline'}
            className={`flex-1 text-xs ${student.isPresent ? 'bg-green-600 hover:bg-green-700' : 'border-red-400 text-red-600 hover:bg-red-50'}`}
            onClick={() => onToggleAttendance(student.id, !student.isPresent)}
          >
            {student.isPresent ? (
              <>✓ {getText('studentCard.present')}</>
            ) : (
              getText('studentCard.absent')
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => onViewDetails(student.id)}
          >
            <Info className="h-3 w-3 mr-1" />
            📝 {getText('studentCard.details')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
