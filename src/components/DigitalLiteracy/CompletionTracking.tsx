'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, X } from 'lucide-react';
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
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-2">
          {getText('completion.title')} - {student.name} ({student.id})
        </h3>
        
        <hr className="my-4" />

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex justify-between items-center">
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError('')}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Completion Status */}
        <div className="mb-6">
          <Label className="font-medium mb-2 block">
            {getText('completion.didComplete')}
          </Label>
          <RadioGroup
            value={completed === null ? '' : completed ? 'yes' : 'no'}
            onValueChange={(value) => setCompleted(value === 'yes')}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" className="text-green-600" />
              <Label htmlFor="yes" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {getText('completion.yesCompleted')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" className="text-red-600" />
              <Label htmlFor="no" className="flex items-center gap-2 cursor-pointer">
                <XCircle className="h-5 w-5 text-red-600" />
                {getText('completion.noNotComplete')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* If Completed */}
        {completed === true && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-300">
            <h4 className="font-bold text-green-800 mb-4">
              {getText('completion.ifCompleted')}
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="completionDate">{getText('completion.dateCompleted')}</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tabletSerial">{getText('completion.tabletSerial')}</Label>
                <Input
                  id="tabletSerial"
                  placeholder="SN: ABC123456789"
                  value={tabletSerial}
                  onChange={(e) => setTabletSerial(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tabletIssued"
                  checked={tabletIssued} 
                  onCheckedChange={(checked) => setTabletIssued(checked as boolean)}
                />
                <Label htmlFor="tabletIssued" className="cursor-pointer">
                  {getText('completion.tabletIssued')}
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* If Not Completed */}
        {completed === false && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-300">
            <h4 className="font-bold text-red-800 mb-2">
              {getText('completion.ifNotCompleted')}
            </h4>
            
            <p className="text-sm mb-2">
              {getText('completion.reasonRequired')}
            </p>
            
            <Textarea
              value={nonCompletionReason}
              onChange={(e) => setNonCompletionReason(e.target.value)}
              placeholder={language === 'en' ? 'Enter reason...' : 'Ingrese razón...'}
              rows={3}
              className="mb-4"
            />
            
            <p className="text-sm text-muted-foreground mb-2">
              {getText('completion.commonReasons')}
            </p>
            <div className="flex flex-wrap gap-2">
              {commonReasons.map((reason, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => setNonCompletionReason(reason)}
                  className="text-xs"
                >
                  • {reason}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Instructor Signature */}
        {completed !== null && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold mb-4">
              {getText('completion.instructorSignature')}
            </h4>
            
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="instructorName">{getText('completion.instructorName')}</Label>
                <Input
                  id="instructorName"
                  value={instructorName}
                  disabled
                  className="mt-1 bg-slate-100"
                />
              </div>
              
              <div className="min-w-[150px]">
                <Label htmlFor="signatureDate">{getText('completion.date')}</Label>
                <Input
                  id="signatureDate"
                  type="date"
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            {getText('actions.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={completed === null}
          >
            {getText('actions.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
