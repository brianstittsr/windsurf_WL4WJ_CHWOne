'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { CLASS_SCHEDULES } from '@/lib/translations/digitalLiteracy';
import { CheckCircle, Loader2, Clock, User, Calendar, AlertCircle } from 'lucide-react';

interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  classId: string;
}

// Helper to determine which class is active based on current day and time
function getActiveClass(): { classId: string; className: string; isActive: boolean } | null {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // Convert to minutes since midnight

  // Class schedule mapping
  // Monday (1): Class 1 (10:00-12:00), Class 2 (13:00-15:00)
  // Tuesday (2): Class 3 (10:00-12:00), Class 4 (13:00-15:00)
  // Wednesday (3): Class 5 (10:00-12:00), Class 6 (13:00-15:00)

  const scheduleMap: { [key: number]: { morning: string; afternoon: string } } = {
    1: { morning: 'class1', afternoon: 'class2' }, // Monday
    2: { morning: 'class3', afternoon: 'class4' }, // Tuesday
    3: { morning: 'class5', afternoon: 'class6' }, // Wednesday
  };

  const daySchedule = scheduleMap[dayOfWeek];
  if (!daySchedule) {
    return null; // No classes on this day
  }

  // Morning class: 10:00 AM - 12:00 PM (600 - 720 minutes)
  // Afternoon class: 1:00 PM - 3:00 PM (780 - 900 minutes)
  // Allow check-in during class time and up to 30 minutes after class ends

  const morningStart = 10 * 60; // 10:00 AM = 600 minutes
  const morningEnd = 12 * 60 + 30; // 12:30 PM = 750 minutes (30 min grace period)
  const afternoonStart = 13 * 60; // 1:00 PM = 780 minutes
  const afternoonEnd = 15 * 60 + 30; // 3:30 PM = 930 minutes (30 min grace period)

  if (currentTime >= morningStart && currentTime <= morningEnd) {
    const schedule = CLASS_SCHEDULES.find(s => s.id === daySchedule.morning);
    return {
      classId: daySchedule.morning,
      className: schedule?.en || daySchedule.morning,
      isActive: true
    };
  }

  if (currentTime >= afternoonStart && currentTime <= afternoonEnd) {
    const schedule = CLASS_SCHEDULES.find(s => s.id === daySchedule.afternoon);
    return {
      classId: daySchedule.afternoon,
      className: schedule?.en || daySchedule.afternoon,
      isActive: true
    };
  }

  return null; // No active class at this time
}

export default function DailyCheckinPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  
  const [activeClass, setActiveClass] = useState<{ classId: string; className: string; isActive: boolean } | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  // Check for active class and fetch registered students
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Determine active class
        const active = getActiveClass();
        setActiveClass(active);

        if (active) {
          // Fetch students registered for this class
          const studentsRef = collection(db, 'digital_literacy_students');
          const q = query(studentsRef, where('classId', '==', active.classId));
          const snapshot = await getDocs(q);
          
          const students: RegisteredStudent[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            email: doc.data().email || '',
            classId: doc.data().classId || ''
          }));
          
          setRegisteredStudents(students);
        }
      } catch (err) {
        console.error('Error initializing check-in:', err);
        setError('Failed to load class information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Filter students based on search
  const filteredStudents = registeredStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckin = async () => {
    if (!selectedStudent || !activeClass) return;

    setSubmitting(true);
    setError(null);

    try {
      const student = registeredStudents.find(s => s.id === selectedStudent);
      if (!student) {
        throw new Error('Student not found');
      }

      // Check if student already checked in today for this class
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendanceRef = collection(db, 'digital_literacy_attendance');
      const existingQuery = query(
        attendanceRef,
        where('studentId', '==', selectedStudent),
        where('classId', '==', activeClass.classId),
        where('date', '>=', today.toISOString()),
        where('date', '<', tomorrow.toISOString())
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.docs.length > 0) {
        setAlreadyCheckedIn(true);
        setSubmittedName(student.name);
        setSubmitted(true);
        return;
      }

      // Record attendance
      await addDoc(attendanceRef, {
        studentId: selectedStudent,
        studentName: student.name,
        studentEmail: student.email,
        classId: activeClass.classId,
        className: activeClass.className,
        date: new Date().toISOString(),
        checkinTime: new Date().toISOString(),
        checkinType: 'end_of_class', // Indicates this is end-of-class check-in
        createdAt: serverTimestamp(),
      });

      setSubmittedName(student.name);
      setSubmitted(true);
    } catch (err) {
      console.error('Error checking in:', err);
      setError('Failed to record attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#34C759] mx-auto mb-4" />
          <p className="text-[#6E6E73]">Loading... | Cargando...</p>
        </div>
      </div>
    );
  }

  // No active class
  if (!activeClass) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FF9500]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-[#FF9500]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
            No Active Class
          </h1>
          <h2 className="text-xl text-[#6E6E73] mb-4">
            No Hay Clase Activa
          </h2>
          <p className="text-[#6E6E73] mb-4">
            Check-in is only available during class hours.
          </p>
          <p className="text-[#6E6E73]">
            El registro solo está disponible durante las horas de clase.
          </p>
          <div className="mt-6 p-4 bg-[#F5F5F7] rounded-xl">
            <p className="text-sm font-semibold text-[#1D1D1F] mb-2">Class Schedule | Horario de Clases:</p>
            <ul className="text-sm text-[#6E6E73] space-y-1">
              <li>Monday | Lunes: 10:00 AM - 12:00 PM, 1:00 PM - 3:00 PM</li>
              <li>Tuesday | Martes: 10:00 AM - 12:00 PM, 1:00 PM - 3:00 PM</li>
              <li>Wednesday | Miércoles: 10:00 AM - 12:00 PM, 1:00 PM - 3:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#34C759]" />
          </div>
          {alreadyCheckedIn ? (
            <>
              <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
                Already Checked In!
              </h1>
              <h2 className="text-xl text-[#6E6E73] mb-4">
                ¡Ya Registrado!
              </h2>
              <p className="text-[#6E6E73]">
                <span className="font-semibold text-[#1D1D1F]">{submittedName}</span>, 
                you have already checked in for today's class.
              </p>
              <p className="text-[#6E6E73] mt-2">
                Ya te has registrado para la clase de hoy.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
                Check-in Successful!
              </h1>
              <h2 className="text-xl text-[#6E6E73] mb-4">
                ¡Registro Exitoso!
              </h2>
              <p className="text-[#6E6E73]">
                Thank you, <span className="font-semibold text-[#1D1D1F]">{submittedName}</span>! 
                Your attendance has been recorded.
              </p>
              <p className="text-[#6E6E73] mt-2">
                Gracias, <span className="font-semibold text-[#1D1D1F]">{submittedName}</span>! 
                Tu asistencia ha sido registrada.
              </p>
            </>
          )}
          <div className="mt-6 p-4 bg-[#34C759]/5 rounded-xl">
            <p className="text-sm text-[#34C759] font-medium">
              {activeClass.className}
            </p>
            <p className="text-sm text-[#6E6E73]">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">✅</span>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F]">
                Daily Check-in
              </h1>
              <h2 className="text-lg text-[#6E6E73]">
                Registro Diario
              </h2>
            </div>
          </div>
          <p className="text-[#6E6E73] text-sm">
            End-of-class attendance | Asistencia al final de clase
          </p>
        </div>

        {/* Active Class Info */}
        <div className="bg-[#34C759]/10 rounded-2xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#34C759]" />
            <span className="font-semibold text-[#34C759]">Active Class | Clase Activa</span>
          </div>
          <p className="text-[#1D1D1F] font-medium">{activeClass.className}</p>
          <p className="text-sm text-[#6E6E73]">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Check-in Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 text-center">
            Select Your Name | Seleccione Su Nombre
          </h3>

          {error && (
            <div className="mb-4 p-4 bg-[#FF3B30]/10 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF3B30] flex-shrink-0" />
              <p className="text-sm text-[#FF3B30]">{error}</p>
            </div>
          )}

          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email... | Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent"
            />
          </div>

          {/* Student List */}
          <div className="max-h-64 overflow-y-auto border border-[#D2D2D7] rounded-xl mb-6">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-[#6E6E73]">
                {registeredStudents.length === 0 
                  ? 'No students registered for this class | No hay estudiantes registrados para esta clase'
                  : 'No matching students | No hay estudiantes que coincidan'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full p-4 text-left border-b border-[#D2D2D7] last:border-b-0 transition-colors ${
                    selectedStudent === student.id
                      ? 'bg-[#34C759]/10'
                      : 'hover:bg-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedStudent === student.id
                        ? 'bg-[#34C759] text-white'
                        : 'bg-[#F5F5F7] text-[#6E6E73]'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        selectedStudent === student.id ? 'text-[#34C759]' : 'text-[#1D1D1F]'
                      }`}>
                        {student.name}
                      </p>
                      <p className="text-sm text-[#6E6E73]">{student.email}</p>
                    </div>
                    {selectedStudent === student.id && (
                      <CheckCircle className="w-5 h-5 text-[#34C759] ml-auto" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCheckin}
            disabled={!selectedStudent || submitting}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-colors ${
              selectedStudent && !submitting
                ? 'bg-[#34C759] hover:bg-[#2DB84D]'
                : 'bg-[#D2D2D7] cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking in... | Registrando...
              </span>
            ) : (
              'Check In | Registrarse'
            )}
          </button>

          <p className="text-center text-sm text-[#6E6E73] mt-4">
            Check in at the end of class to confirm attendance
          </p>
          <p className="text-center text-sm text-[#6E6E73]">
            Regístrese al final de la clase para confirmar asistencia
          </p>
        </div>
      </div>
    </div>
  );
}
