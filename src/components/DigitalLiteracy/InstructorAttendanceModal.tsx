'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save, User, Calendar, MapPin, GraduationCap, Loader2 } from 'lucide-react';

// Class/Unit options
const UNITS = [
  { id: 'unit1', label: 'Unidad 1: Introducción a Navegando el Mundo Digital' },
  { id: 'unit2', label: 'Unidad 2: Conociendo las computadoras y Dispositivos móviles' },
  { id: 'unit3', label: 'Unidad 3: Habilidades Básicas de Internet' },
  { id: 'unit4', label: 'Unidad 4: Correo Electrónico y comunicación' },
  { id: 'unit5', label: 'Unidad 5: Conceptos Básicos de Redes Sociales' },
  { id: 'unit6', label: 'Unidad 6: Utilización de Servicios en Línea' },
  { id: 'unit7', label: 'Unidad 7: Creación de Contenido Digital con Google Suite' },
  { id: 'unit8', label: 'Unidad 8: Herramientas Digitales para la Vida Diaria' },
  { id: 'unit9', label: 'Unidad 9: Seguridad y Privacidad en Línea' },
  { id: 'unit10', label: 'Unidad 10: Revisión del Curso y Aplicaciones Prácticas' },
];

const LOCATIONS = [
  { id: 'moore', label: 'Moore County' },
  { id: 'montgomery', label: 'Montgomery County' },
];

const TOPICS = [
  'Introduction to Digital World',
  'Computer Basics',
  'Internet Skills',
  'Email Communication',
  'Social Media',
  'Online Services',
  'Google Suite',
  'Digital Tools',
  'Online Security',
  'Course Review',
  'Device Delivery',
];

interface Student {
  id: string;
  name: string;
  email: string;
  present: boolean;
}

interface AttendanceRecord {
  instructorName: string;
  date: string;
  location: string;
  topic: string;
  unitsCompleted: string[];
  students: Student[];
}

interface InstructorAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (record: AttendanceRecord) => Promise<void>;
  programId?: string;
}

export default function InstructorAttendanceModal({
  open,
  onClose,
  onSave,
  programId,
}: InstructorAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [instructorName, setInstructorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState('');
  const [unitsCompleted, setUnitsCompleted] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // Fetch registered students
  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkin/students');
      if (response.ok) {
        const data = await response.json();
        const studentList = (data.students || []).map((s: any) => ({
          ...s,
          present: false,
        }));
        setAllStudents(studentList);
        setStudents(studentList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePresent = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, present: !s.present } : s
      )
    );
  };

  const handleSelectAll = () => {
    const allPresent = students.every(s => s.present);
    setStudents(prev => prev.map(s => ({ ...s, present: !allPresent })));
  };

  const handleToggleUnit = (unitId: string) => {
    setUnitsCompleted(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSave = async () => {
    if (!instructorName || !date || !location || !topic) {
      setError('Please fill in all required fields');
      return;
    }

    const presentStudents = students.filter(s => s.present);
    if (presentStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const record: AttendanceRecord = {
        instructorName,
        date,
        location,
        topic,
        unitsCompleted,
        students: presentStudents,
      };

      if (onSave) {
        await onSave(record);
      } else {
        // Default save to API
        const response = await fetch('/api/attendance/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...record,
            programId,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save attendance');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setInstructorName('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setTopic('');
    setUnitsCompleted([]);
    setStudents(allStudents.map(s => ({ ...s, present: false })));
    setError('');
    setSuccess(false);
  };

  const presentCount = students.filter(s => s.present).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Record Class Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {success ? (
            <Alert className="my-4 border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">
                Attendance recorded successfully for {presentCount} students!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Class Details */}
              <h4 className="font-semibold mb-3">Class Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="instructorName">Instructor Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="instructorName"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      className="pl-10"
                      placeholder="Enter instructor name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Location *</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Topic *</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Units Completed */}
              <h4 className="font-semibold mb-3">Units Completed</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {UNITS.map((unit) => (
                  <Badge
                    key={unit.id}
                    variant={unitsCompleted.includes(unit.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleToggleUnit(unit.id)}
                  >
                    {unit.id.replace('unit', 'Unit ')}
                  </Badge>
                ))}
              </div>

              <hr className="my-4" />

              {/* Student Attendance */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">
                  Student Attendance ({presentCount} / {students.length})
                </h4>
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  {students.every(s => s.present) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : students.length > 0 ? (
                <ScrollArea className="h-[300px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={students.length > 0 && students.every(s => s.present)}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow 
                          key={student.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleTogglePresent(student.id)}
                        >
                          <TableCell>
                            <Checkbox checked={student.present} />
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell className="text-center">
                            {student.present && (
                              <Badge className="bg-green-600">Present</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertDescription>
                    No students registered. Please register students first.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || success}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Attendance ({presentCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
