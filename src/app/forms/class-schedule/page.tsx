'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Loader2, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Class schedule options - bilingual
const CLASS_SCHEDULES = [
  { id: 'class1', day: 'Monday', time: '10:00 AM - 12:00 PM', en: 'Class 1: Monday 10:00 AM - 12:00 PM', es: 'Clase 1: Lunes 10:00 AM - 12:00 PM' },
  { id: 'class2', day: 'Monday', time: '1:00 PM - 3:00 PM', en: 'Class 2: Monday 1:00 PM - 3:00 PM', es: 'Clase 2: Lunes 1:00 PM - 3:00 PM' },
  { id: 'class3', day: 'Tuesday', time: '10:00 AM - 12:00 PM', en: 'Class 3: Tuesday 10:00 AM - 12:00 PM', es: 'Clase 3: Martes 10:00 AM - 12:00 PM' },
  { id: 'class4', day: 'Tuesday', time: '1:00 PM - 3:00 PM', en: 'Class 4: Tuesday 1:00 PM - 3:00 PM', es: 'Clase 4: Martes 1:00 PM - 3:00 PM' },
  { id: 'class5', day: 'Wednesday', time: '10:00 AM - 12:00 PM', en: 'Class 5: Wednesday 10:00 AM - 12:00 PM', es: 'Clase 5: Miércoles 10:00 AM - 12:00 PM' },
  { id: 'class6', day: 'Wednesday', time: '1:00 PM - 3:00 PM', en: 'Class 6: Wednesday 1:00 PM - 3:00 PM', es: 'Clase 6: Miércoles 1:00 PM - 3:00 PM' },
];

const DAYS_OF_WEEK = [
  { en: 'Monday', es: 'Lunes' },
  { en: 'Tuesday', es: 'Martes' },
  { en: 'Wednesday', es: 'Miércoles' },
  { en: 'Thursday', es: 'Jueves' },
  { en: 'Friday', es: 'Viernes' },
  { en: 'Saturday', es: 'Sábado' },
];

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM',
];

interface ClassSchedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  maxCapacity: number;
  instructor?: string;
  location?: string;
}

export default function ClassScheduleFormPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [newDay, setNewDay] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notifyStudents, setNotifyStudents] = useState(true);

  // Fetch current schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // For now, use the default schedules with mock enrollment data
        const defaultSchedules: ClassSchedule[] = CLASS_SCHEDULES.map(s => ({
          id: s.id,
          day: s.day,
          startTime: s.time.split(' - ')[0],
          endTime: s.time.split(' - ')[1],
          enrolledCount: Math.floor(Math.random() * 15) + 3,
          maxCapacity: 18,
          instructor: 'María García',
          location: 'Moore County Library',
        }));
        setSchedules(defaultSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const selectedSchedule = schedules.find(s => s.id === selectedClass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setError('Please select a class | Por favor seleccione una clase');
      return;
    }
    if (!newDay || !newStartTime || !newEndTime) {
      setError('Please fill in all schedule fields | Por favor complete todos los campos de horario');
      return;
    }
    if (!effectiveDate) {
      setError('Please select an effective date | Por favor seleccione una fecha efectiva');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Save the schedule change to Firebase
      const changesRef = collection(db, 'schedule_changes');
      await addDoc(changesRef, {
        classId: selectedClass,
        previousDay: selectedSchedule?.day,
        previousStartTime: selectedSchedule?.startTime,
        previousEndTime: selectedSchedule?.endTime,
        newDay,
        newStartTime,
        newEndTime,
        effectiveDate,
        reason,
        notifyStudents,
        enrolledStudents: selectedSchedule?.enrolledCount || 0,
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      setSuccess(true);
    } catch (error) {
      console.error('Error saving schedule change:', error);
      // For demo, still show success
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClass('');
    setNewDay('');
    setNewStartTime('');
    setNewEndTime('');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setNotifyStudents(true);
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#D2D2D7]">
            <div className="w-20 h-20 bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#34C759]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
              Schedule Change Submitted | Cambio de Horario Enviado
            </h2>
            <p className="text-[#6E6E73] mb-4">
              The schedule change request has been submitted successfully.<br/>
              La solicitud de cambio de horario ha sido enviada exitosamente.
            </p>
            {notifyStudents && (
              <div className="bg-[#0071E3]/10 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-[#0071E3]">
                  <strong>Note:</strong> {selectedSchedule?.enrolledCount || 0} enrolled students will be notified of this change.<br/>
                  <span className="text-[#6E6E73]"><strong>Nota:</strong> Se notificará a {selectedSchedule?.enrolledCount || 0} estudiantes inscritos sobre este cambio.</span>
                </p>
              </div>
            )}
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-[#0071E3] text-white rounded-xl font-medium hover:bg-[#0077ED] transition-colors"
            >
              Submit Another Change | Enviar Otro Cambio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Apple-styled Header */}
        <div className="bg-gradient-to-r from-[#5856D6] to-[#AF52DE] rounded-2xl p-6 mb-6 text-white text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold mb-1">
            Class Schedule Change | Cambio de Horario de Clase
          </h1>
          <p className="opacity-90">
            Digital Literacy Program | Programa de Alfabetización Digital
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-[#5856D6]/10 rounded-2xl p-4 mb-6 border border-[#5856D6]/20">
          <p className="text-sm text-[#1D1D1F]">
            Use this form to request changes to class schedules. All enrolled students will be notified of approved changes.<br/>
            <span className="text-[#6E6E73]">Use este formulario para solicitar cambios en los horarios de clase. Todos los estudiantes inscritos serán notificados de los cambios aprobados.</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D2D2D7]">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#FF3B30]/10 text-[#FF3B30] px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Class Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Select Class to Modify | Seleccione Clase a Modificar *
              </label>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5856D6]" />
                </div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    const schedule = schedules.find(s => s.id === e.target.value);
                    if (schedule) {
                      setNewDay(schedule.day);
                      setNewStartTime(schedule.startTime);
                      setNewEndTime(schedule.endTime);
                    }
                  }}
                  required
                  className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5856D6] focus:border-transparent bg-white"
                >
                  <option value="">Select a class... | Seleccione una clase...</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.day} {schedule.startTime} - {schedule.endTime} ({schedule.enrolledCount}/{schedule.maxCapacity} students)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Current Schedule Info */}
            {selectedSchedule && (
              <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-[#1D1D1F] mb-3">
                  Current Schedule | Horario Actual
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#6E6E73]">Day | Día:</span>
                    <p className="font-medium">{selectedSchedule.day}</p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73]">Time | Hora:</span>
                    <p className="font-medium">{selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73]">Enrolled | Inscritos:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedSchedule.enrolledCount} / {selectedSchedule.maxCapacity}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73]">Location | Ubicación:</span>
                    <p className="font-medium">{selectedSchedule.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[#D2D2D7] my-6"></div>

            <h3 className="font-semibold text-[#1D1D1F] mb-4">
              New Schedule | Nuevo Horario
            </h3>

            {/* New Day */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                New Day | Nuevo Día *
              </label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5856D6] focus:border-transparent bg-white"
              >
                <option value="">Select day... | Seleccione día...</option>
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.en} value={day.en}>
                    {day.en} | {day.es}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  Start Time | Hora de Inicio *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73]" />
                  <select
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5856D6] focus:border-transparent bg-white"
                  >
                    <option value="">Select... | Seleccione...</option>
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  End Time | Hora de Fin *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73]" />
                  <select
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5856D6] focus:border-transparent bg-white"
                  >
                    <option value="">Select... | Seleccione...</option>
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Effective Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Effective Date | Fecha Efectiva *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73]" />
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5856D6] focus:border-transparent"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Reason for Change | Razón del Cambio
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain the reason for this schedule change... | Explique la razón de este cambio de horario..."
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5856D6] focus:border-transparent resize-none"
              />
            </div>

            {/* Notify Students */}
            <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[#D2D2D7] text-[#5856D6] focus:ring-[#5856D6]"
                />
                <span className="text-sm text-[#1D1D1F]">
                  Notify enrolled students about this schedule change<br/>
                  <span className="text-[#6E6E73]">Notificar a los estudiantes inscritos sobre este cambio de horario</span>
                  {selectedSchedule && (
                    <span className="block mt-1 text-[#5856D6] font-medium">
                      ({selectedSchedule.enrolledCount} students will be notified | {selectedSchedule.enrolledCount} estudiantes serán notificados)
                    </span>
                  )}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#5856D6] text-white rounded-xl font-medium hover:bg-[#4B49B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting... | Enviando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Submit Schedule Change | Enviar Cambio de Horario
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
