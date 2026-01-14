'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit2, Trash2, Save, X, Calendar, Clock, Users, 
  CheckCircle, AlertCircle, Eye, FileText
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, Timestamp, serverTimestamp 
} from 'firebase/firestore';
import { CLASS_SCHEDULES, COURSE_TOPICS } from '@/lib/translations/digitalLiteracy';

// Class Session interface
export interface ClassSession {
  id: string;
  classId: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  week: number;
  topic: string;
  topicEs: string;
  instructorId?: string;
  instructorName?: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt?: any;
  updatedAt?: any;
}

// Attendance record linked to session
export interface SessionAttendance {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  checkinTime: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface ClassScheduleManagerProps {
  classId: string;
  language?: 'en' | 'es';
  onSessionSelect?: (session: ClassSession) => void;
}

export default function ClassScheduleManager({ 
  classId, 
  language = 'en',
  onSessionSelect 
}: ClassScheduleManagerProps) {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{ [sessionId: string]: SessionAttendance[] }>({});
  const [selectedSessionForView, setSelectedSessionForView] = useState<ClassSession | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<ClassSession>>({
    classId: classId,
    date: '',
    dayOfWeek: 'Monday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    week: 1,
    topic: '',
    topicEs: '',
    location: '',
    notes: '',
    status: 'scheduled',
  });

  // Fetch sessions from Firebase
  useEffect(() => {
    fetchSessions();
  }, [classId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const sessionsRef = collection(db, 'class_sessions');
      const q = query(sessionsRef, where('classId', '==', classId), orderBy('week', 'asc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Generate default sessions if none exist
        await generateDefaultSessions();
      } else {
        const sessionsData: ClassSession[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as ClassSession));
        setSessions(sessionsData);
        
        // Fetch attendance for each session
        await fetchAttendanceForSessions(sessionsData);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Generate locally if Firebase fails
      generateLocalSessions();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultSessions = async () => {
    const programStartDate = new Date('2026-01-06');
    const classInfo = CLASS_SCHEDULES.find(c => c.id === classId);
    if (!classInfo) return;

    const classText = classInfo.en;
    const dayMatch = classText.match(/Monday|Tuesday|Wednesday/);
    const timeMatch = classText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/);
    
    if (!dayMatch || !timeMatch) return;

    const dayOfWeek = dayMatch[0];
    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const dayMap: { [key: string]: number } = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3 };
    const targetDay = dayMap[dayOfWeek];

    const newSessions: ClassSession[] = [];

    for (let week = 1; week <= 6; week++) {
      const weekStart = new Date(programStartDate);
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
      
      const sessionDate = new Date(weekStart);
      const currentDay = sessionDate.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      sessionDate.setDate(sessionDate.getDate() + daysUntilTarget);

      const weekTopics = COURSE_TOPICS.filter(t => t.week === week);
      const topicText = weekTopics.map(t => t.en).join(' & ') || `Week ${week} Topics`;
      const topicTextEs = weekTopics.map(t => t.es).join(' & ') || `Temas Semana ${week}`;

      const sessionId = `${classId}-week${week}`;
      const session: ClassSession = {
        id: sessionId,
        classId,
        date: sessionDate.toISOString().split('T')[0],
        dayOfWeek,
        startTime,
        endTime,
        week,
        topic: topicText,
        topicEs: topicTextEs,
        status: 'scheduled',
      };

      // Save to Firebase
      try {
        await setDoc(doc(db, 'class_sessions', sessionId), {
          ...session,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }

      newSessions.push(session);
    }

    setSessions(newSessions);
  };

  const generateLocalSessions = () => {
    const programStartDate = new Date('2026-01-06');
    const classInfo = CLASS_SCHEDULES.find(c => c.id === classId);
    if (!classInfo) return;

    const classText = classInfo.en;
    const dayMatch = classText.match(/Monday|Tuesday|Wednesday/);
    const timeMatch = classText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/);
    
    if (!dayMatch || !timeMatch) return;

    const dayOfWeek = dayMatch[0];
    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const dayMap: { [key: string]: number } = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3 };
    const targetDay = dayMap[dayOfWeek];

    const localSessions: ClassSession[] = [];

    for (let week = 1; week <= 6; week++) {
      const weekStart = new Date(programStartDate);
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
      
      const sessionDate = new Date(weekStart);
      const currentDay = sessionDate.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      sessionDate.setDate(sessionDate.getDate() + daysUntilTarget);

      const weekTopics = COURSE_TOPICS.filter(t => t.week === week);
      const topicText = weekTopics.map(t => t.en).join(' & ') || `Week ${week} Topics`;
      const topicTextEs = weekTopics.map(t => t.es).join(' & ') || `Temas Semana ${week}`;

      localSessions.push({
        id: `${classId}-week${week}`,
        classId,
        date: sessionDate.toISOString().split('T')[0],
        dayOfWeek,
        startTime,
        endTime,
        week,
        topic: topicText,
        topicEs: topicTextEs,
        status: 'scheduled',
      });
    }

    setSessions(localSessions);
  };

  const fetchAttendanceForSessions = async (sessionsData: ClassSession[]) => {
    try {
      const attendanceRef = collection(db, 'digital_literacy_attendance');
      const q = query(attendanceRef, where('classId', '==', classId));
      const snapshot = await getDocs(q);

      const attendanceBySession: { [sessionId: string]: SessionAttendance[] } = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const dateKey = data.date?.split('T')[0] || '';
        
        // Find matching session by date
        const matchingSession = sessionsData.find(s => s.date === dateKey);
        if (matchingSession) {
          if (!attendanceBySession[matchingSession.id]) {
            attendanceBySession[matchingSession.id] = [];
          }
          attendanceBySession[matchingSession.id].push({
            id: doc.id,
            sessionId: matchingSession.id,
            studentId: data.studentId || '',
            studentName: data.studentName || '',
            classId: data.classId || '',
            date: data.date || '',
            checkinTime: data.checkinTime || '',
            status: 'present',
          });
        }
      });

      setAttendanceData(attendanceBySession);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // CREATE - Add new session
  const handleCreateSession = async () => {
    setSaving(true);
    try {
      const sessionId = `${classId}-custom-${Date.now()}`;
      const newSession: ClassSession = {
        id: sessionId,
        classId,
        date: formData.date || '',
        dayOfWeek: formData.dayOfWeek || 'Monday',
        startTime: formData.startTime || '10:00 AM',
        endTime: formData.endTime || '12:00 PM',
        week: formData.week || sessions.length + 1,
        topic: formData.topic || '',
        topicEs: formData.topicEs || '',
        location: formData.location,
        notes: formData.notes,
        status: 'scheduled',
      };

      await setDoc(doc(db, 'class_sessions', sessionId), {
        ...newSession,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSessions([...sessions, newSession].sort((a, b) => a.week - b.week));
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setSaving(false);
    }
  };

  // UPDATE - Edit existing session
  const handleUpdateSession = async () => {
    if (!editingSession) return;
    
    setSaving(true);
    try {
      const updatedSession: ClassSession = {
        ...editingSession,
        date: formData.date || editingSession.date,
        dayOfWeek: formData.dayOfWeek || editingSession.dayOfWeek,
        startTime: formData.startTime || editingSession.startTime,
        endTime: formData.endTime || editingSession.endTime,
        week: formData.week || editingSession.week,
        topic: formData.topic || editingSession.topic,
        topicEs: formData.topicEs || editingSession.topicEs,
        location: formData.location,
        notes: formData.notes,
        status: formData.status as ClassSession['status'] || editingSession.status,
      };

      await updateDoc(doc(db, 'class_sessions', editingSession.id), {
        ...updatedSession,
        updatedAt: serverTimestamp(),
      });

      setSessions(sessions.map(s => s.id === editingSession.id ? updatedSession : s));
      setEditingSession(null);
      resetForm();
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setSaving(false);
    }
  };

  // DELETE - Remove session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm(language === 'en' 
      ? 'Are you sure you want to delete this session?' 
      : '¿Está seguro de que desea eliminar esta sesión?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'class_sessions', sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      classId: classId,
      date: '',
      dayOfWeek: 'Monday',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      week: sessions.length + 1,
      topic: '',
      topicEs: '',
      location: '',
      notes: '',
      status: 'scheduled',
    });
  };

  const startEditing = (session: ClassSession) => {
    setEditingSession(session);
    setFormData({
      date: session.date,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      week: session.week,
      topic: session.topic,
      topicEs: session.topicEs,
      location: session.location || '',
      notes: session.notes || '',
      status: session.status,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      scheduled: 'bg-[#0071E3]/10 text-[#0071E3]',
      completed: 'bg-[#34C759]/10 text-[#34C759]',
      cancelled: 'bg-[#FF3B30]/10 text-[#FF3B30]',
      rescheduled: 'bg-[#FF9500]/10 text-[#FF9500]',
    };
    const labels: { [key: string]: string } = {
      scheduled: language === 'en' ? 'Scheduled' : 'Programado',
      completed: language === 'en' ? 'Completed' : 'Completado',
      cancelled: language === 'en' ? 'Cancelled' : 'Cancelado',
      rescheduled: language === 'en' ? 'Rescheduled' : 'Reprogramado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.scheduled}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071E3]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#1D1D1F]">
            {language === 'en' ? 'Class Schedule Management' : 'Gestión del Horario de Clases'}
          </h3>
          <p className="text-sm text-[#86868B]">
            {language === 'en' 
              ? 'Manage sessions, reschedule classes, and track attendance' 
              : 'Gestione sesiones, reprograme clases y rastree asistencia'}
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Session' : 'Agregar Sesión'}
        </Button>
      </div>

      {/* Create/Edit Form Modal */}
      {(isCreating || editingSession) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-[#1D1D1F]">
                {isCreating 
                  ? (language === 'en' ? 'Add New Session' : 'Agregar Nueva Sesión')
                  : (language === 'en' ? 'Edit Session' : 'Editar Sesión')}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsCreating(false); setEditingSession(null); resetForm(); }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Date' : 'Fecha'}</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Week Number' : 'Número de Semana'}</Label>
                <Select
                  value={String(formData.week)}
                  onValueChange={(v) => setFormData({ ...formData, week: parseInt(v) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'en' ? 'Day of Week' : 'Día de la Semana'}</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(v) => setFormData({ ...formData, dayOfWeek: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'en' ? 'Status' : 'Estado'}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as ClassSession['status'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'en' ? 'Start Time' : 'Hora de Inicio'}</Label>
                <Input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  placeholder="10:00 AM"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'End Time' : 'Hora de Fin'}</Label>
                <Input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="12:00 PM"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>{language === 'en' ? 'Topic (English)' : 'Tema (Inglés)'}</Label>
                <Input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>{language === 'en' ? 'Topic (Spanish)' : 'Tema (Español)'}</Label>
                <Input
                  type="text"
                  value={formData.topicEs}
                  onChange={(e) => setFormData({ ...formData, topicEs: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>{language === 'en' ? 'Location' : 'Ubicación'}</Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>{language === 'en' ? 'Notes' : 'Notas'}</Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#D2D2D7] rounded-xl resize-none h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => { setIsCreating(false); setEditingSession(null); resetForm(); }}
                className="rounded-full px-6"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                onClick={isCreating ? handleCreateSession : handleUpdateSession}
                disabled={saving}
                className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-6"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isCreating 
                  ? (language === 'en' ? 'Create Session' : 'Crear Sesión')
                  : (language === 'en' ? 'Save Changes' : 'Guardar Cambios')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session Attendance View Modal */}
      {selectedSessionForView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-semibold text-[#1D1D1F]">
                  {language === 'en' ? 'Session Attendance' : 'Asistencia de Sesión'}
                </h4>
                <p className="text-sm text-[#86868B]">
                  Week {selectedSessionForView.week} - {formatDate(selectedSessionForView.date)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSessionForView(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-[#F5F5F7] rounded-2xl p-4 mb-6">
              <p className="font-medium text-[#1D1D1F]">
                {language === 'en' ? selectedSessionForView.topic : selectedSessionForView.topicEs}
              </p>
              <p className="text-sm text-[#86868B] mt-1">
                {selectedSessionForView.startTime} - {selectedSessionForView.endTime}
              </p>
            </div>

            {attendanceData[selectedSessionForView.id]?.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium text-[#1D1D1F] mb-3">
                  {language === 'en' ? 'Students Present' : 'Estudiantes Presentes'}: {attendanceData[selectedSessionForView.id].length}
                </p>
                {attendanceData[selectedSessionForView.id].map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-[#34C759]/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#34C759]" />
                      <span className="font-medium text-[#1D1D1F]">{record.studentName}</span>
                    </div>
                    <span className="text-sm text-[#86868B]">
                      {record.checkinTime ? new Date(record.checkinTime).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-[#86868B] mx-auto mb-3" />
                <p className="text-[#86868B]">
                  {language === 'en' ? 'No attendance records for this session' : 'No hay registros de asistencia para esta sesión'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F5F5F7]">
            <tr>
              <th className="text-left py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Week' : 'Semana'}
              </th>
              <th className="text-left py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Date' : 'Fecha'}
              </th>
              <th className="text-left py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Day' : 'Día'}
              </th>
              <th className="text-left py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Time' : 'Hora'}
              </th>
              <th className="text-left py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Topic' : 'Tema'}
              </th>
              <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Attendance' : 'Asistencia'}
              </th>
              <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Status' : 'Estado'}
              </th>
              <th className="text-center py-4 px-4 font-semibold text-[#1D1D1F] text-sm">
                {language === 'en' ? 'Actions' : 'Acciones'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-[#E5E5EA] hover:bg-[#F5F5F7]/50">
                <td className="py-4 px-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-[#0071E3]/10 text-[#0071E3] rounded-full font-semibold text-sm">
                    {session.week}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#86868B]" />
                    <span className="text-[#1D1D1F]">{formatDate(session.date)}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-[#1D1D1F]">{session.dayOfWeek}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#86868B]" />
                    <span className="text-[#1D1D1F]">{session.startTime} - {session.endTime}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-[#1D1D1F] text-sm truncate max-w-[200px]" title={language === 'en' ? session.topic : session.topicEs}>
                    {language === 'en' ? session.topic : session.topicEs}
                  </p>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-[#86868B]" />
                    <span className="font-medium text-[#1D1D1F]">
                      {attendanceData[session.id]?.length || 0}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  {getStatusBadge(session.status)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSessionForView(session)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4 text-[#0071E3]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(session)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4 text-[#FF9500]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
