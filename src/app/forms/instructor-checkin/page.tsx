'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { CLASS_SCHEDULES } from '@/lib/translations/digitalLiteracy';
import { CheckCircle, Loader2, Clock, User, Calendar, AlertCircle, GraduationCap } from 'lucide-react';

interface RegisteredInstructor {
  id: string;
  name: string;
  email: string;
}

// Helper to determine which class is active based on current day and time
// For instructors, we allow check-in 30 minutes BEFORE class starts
function getActiveClassForInstructor(): { classId: string; className: string; isActive: boolean; classStartTime: string } | null {
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

  // Morning class: 10:00 AM - 12:00 PM
  // Instructor can check in from 9:30 AM (30 min before) until 10:30 AM (30 min after start)
  // Afternoon class: 1:00 PM - 3:00 PM
  // Instructor can check in from 12:30 PM (30 min before) until 1:30 PM (30 min after start)

  const morningPreStart = 9 * 60 + 30; // 9:30 AM = 570 minutes
  const morningEnd = 10 * 60 + 30; // 10:30 AM = 630 minutes
  const afternoonPreStart = 12 * 60 + 30; // 12:30 PM = 750 minutes
  const afternoonEnd = 13 * 60 + 30; // 1:30 PM = 810 minutes

  if (currentTime >= morningPreStart && currentTime <= morningEnd) {
    const schedule = CLASS_SCHEDULES.find(s => s.id === daySchedule.morning);
    return {
      classId: daySchedule.morning,
      className: schedule?.en || daySchedule.morning,
      isActive: true,
      classStartTime: '10:00 AM'
    };
  }

  if (currentTime >= afternoonPreStart && currentTime <= afternoonEnd) {
    const schedule = CLASS_SCHEDULES.find(s => s.id === daySchedule.afternoon);
    return {
      classId: daySchedule.afternoon,
      className: schedule?.en || daySchedule.afternoon,
      isActive: true,
      classStartTime: '1:00 PM'
    };
  }

  return null; // No active class at this time
}

export default function InstructorCheckinPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [isEarly, setIsEarly] = useState(false);
  const [isLate, setIsLate] = useState(false);
  
  const [activeClass, setActiveClass] = useState<{ classId: string; className: string; isActive: boolean; classStartTime: string } | null>(null);
  const [registeredInstructors, setRegisteredInstructors] = useState<RegisteredInstructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [checkinTime, setCheckinTime] = useState<Date | null>(null);

  // Check for active class and fetch registered instructors
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Determine active class for instructor check-in
        const active = getActiveClassForInstructor();
        setActiveClass(active);

        if (active) {
          // Fetch registered instructors
          const instructorsRef = collection(db, 'digital_literacy_instructors');
          const snapshot = await getDocs(instructorsRef);
          
          const instructors: RegisteredInstructor[] = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.data().instructorName || '',
            email: doc.data().email || ''
          }));
          
          setRegisteredInstructors(instructors);
        }
      } catch (err) {
        console.error('Error initializing instructor check-in:', err);
        setError('Failed to load class information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Filter instructors based on search
  const filteredInstructors = registeredInstructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckin = async () => {
    if (!selectedInstructor || !activeClass) return;

    setSubmitting(true);
    setError(null);

    try {
      const instructor = registeredInstructors.find(i => i.id === selectedInstructor);
      if (!instructor) {
        throw new Error('Instructor not found');
      }

      // Check if instructor already checked in today for this class
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendanceRef = collection(db, 'digital_literacy_instructor_attendance');
      const existingQuery = query(
        attendanceRef,
        where('instructorId', '==', selectedInstructor),
        where('classId', '==', activeClass.classId),
        where('date', '>=', today.toISOString()),
        where('date', '<', tomorrow.toISOString())
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.docs.length > 0) {
        setAlreadyCheckedIn(true);
        setSubmittedName(instructor.name);
        setSubmitted(true);
        return;
      }

      // Determine if early or late
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      // Morning class starts at 10:00 AM (600 min), Afternoon at 1:00 PM (780 min)
      const morningStart = 10 * 60;
      const afternoonStart = 13 * 60;
      
      let classStartMinutes = activeClass.classStartTime === '10:00 AM' ? morningStart : afternoonStart;
      
      const minutesBeforeClass = classStartMinutes - currentTime;
      const isEarlyCheckin = minutesBeforeClass > 0;
      const isLateCheckin = minutesBeforeClass < 0;
      
      setIsEarly(isEarlyCheckin);
      setIsLate(isLateCheckin);
      setCheckinTime(now);

      // Record instructor attendance
      await addDoc(attendanceRef, {
        instructorId: selectedInstructor,
        instructorName: instructor.name,
        instructorEmail: instructor.email,
        classId: activeClass.classId,
        className: activeClass.className,
        classStartTime: activeClass.classStartTime,
        date: new Date().toISOString(),
        checkinTime: new Date().toISOString(),
        checkinType: 'start_of_class', // Indicates start-of-class check-in
        minutesBeforeClass: minutesBeforeClass,
        status: isEarlyCheckin ? 'early' : (isLateCheckin ? 'late' : 'on_time'),
        createdAt: serverTimestamp(),
      });

      setSubmittedName(instructor.name);
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
          <Loader2 className="w-10 h-10 animate-spin text-[#00C7BE] mx-auto mb-4" />
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
            Instructor check-in is available 30 minutes before class starts.
          </p>
          <p className="text-[#6E6E73]">
            El registro de instructor está disponible 30 minutos antes del inicio de clase.
          </p>
          <div className="mt-6 p-4 bg-[#F5F5F7] rounded-xl">
            <p className="text-sm font-semibold text-[#1D1D1F] mb-2">Check-in Windows | Ventanas de Registro:</p>
            <ul className="text-sm text-[#6E6E73] space-y-1">
              <li>Morning | Mañana: 9:30 AM - 10:30 AM</li>
              <li>Afternoon | Tarde: 12:30 PM - 1:30 PM</li>
            </ul>
            <p className="text-sm font-semibold text-[#1D1D1F] mt-4 mb-2">Class Days | Días de Clase:</p>
            <ul className="text-sm text-[#6E6E73] space-y-1">
              <li>Monday | Lunes</li>
              <li>Tuesday | Martes</li>
              <li>Wednesday | Miércoles</li>
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
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            alreadyCheckedIn ? 'bg-[#FF9500]/10' : isLate ? 'bg-[#FF3B30]/10' : 'bg-[#00C7BE]/10'
          }`}>
            <CheckCircle className={`w-10 h-10 ${
              alreadyCheckedIn ? 'text-[#FF9500]' : isLate ? 'text-[#FF3B30]' : 'text-[#00C7BE]'
            }`} />
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
                {isLate ? 'Check-in Recorded (Late)' : isEarly ? 'Check-in Successful (Early!)' : 'Check-in Successful!'}
              </h1>
              <h2 className="text-xl text-[#6E6E73] mb-4">
                {isLate ? '¡Registro Registrado (Tarde)!' : isEarly ? '¡Registro Exitoso (Temprano)!' : '¡Registro Exitoso!'}
              </h2>
              <p className="text-[#6E6E73]">
                {isEarly ? (
                  <>Great job, <span className="font-semibold text-[#00C7BE]">{submittedName}</span>! You're prepared and ready.</>
                ) : isLate ? (
                  <>Noted, <span className="font-semibold text-[#FF3B30]">{submittedName}</span>. Please try to arrive earlier next time.</>
                ) : (
                  <>Thank you, <span className="font-semibold text-[#1D1D1F]">{submittedName}</span>! Your attendance has been recorded.</>
                )}
              </p>
              {checkinTime && (
                <p className="text-sm text-[#6E6E73] mt-2">
                  Checked in at: {checkinTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </>
          )}
          <div className={`mt-6 p-4 rounded-xl ${
            isLate ? 'bg-[#FF3B30]/5' : 'bg-[#00C7BE]/5'
          }`}>
            <p className={`text-sm font-medium ${isLate ? 'text-[#FF3B30]' : 'text-[#00C7BE]'}`}>
              {activeClass.className}
            </p>
            <p className="text-sm text-[#6E6E73]">
              Class starts at {activeClass.classStartTime}
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
            <span className="text-4xl">👨‍🏫</span>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F]">
                Instructor Check-in
              </h1>
              <h2 className="text-lg text-[#6E6E73]">
                Registro de Instructor
              </h2>
            </div>
          </div>
          <p className="text-[#6E6E73] text-sm">
            Start-of-class attendance | Asistencia al inicio de clase
          </p>
        </div>

        {/* Active Class Info */}
        <div className="bg-[#00C7BE]/10 rounded-2xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#00C7BE]" />
            <span className="font-semibold text-[#00C7BE]">Active Class | Clase Activa</span>
          </div>
          <p className="text-[#1D1D1F] font-medium">{activeClass.className}</p>
          <p className="text-sm text-[#6E6E73]">
            Class starts at {activeClass.classStartTime} | La clase comienza a las {activeClass.classStartTime}
          </p>
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
              className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7BE] focus:border-transparent"
            />
          </div>

          {/* Instructor List */}
          <div className="max-h-64 overflow-y-auto border border-[#D2D2D7] rounded-xl mb-6">
            {filteredInstructors.length === 0 ? (
              <div className="p-4 text-center text-[#6E6E73]">
                {registeredInstructors.length === 0 
                  ? 'No instructors registered | No hay instructores registrados'
                  : 'No matching instructors | No hay instructores que coincidan'}
              </div>
            ) : (
              filteredInstructors.map((instructor) => (
                <button
                  key={instructor.id}
                  onClick={() => setSelectedInstructor(instructor.id)}
                  className={`w-full p-4 text-left border-b border-[#D2D2D7] last:border-b-0 transition-colors ${
                    selectedInstructor === instructor.id
                      ? 'bg-[#00C7BE]/10'
                      : 'hover:bg-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedInstructor === instructor.id
                        ? 'bg-[#00C7BE] text-white'
                        : 'bg-[#F5F5F7] text-[#6E6E73]'
                    }`}>
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        selectedInstructor === instructor.id ? 'text-[#00C7BE]' : 'text-[#1D1D1F]'
                      }`}>
                        {instructor.name}
                      </p>
                      <p className="text-sm text-[#6E6E73]">{instructor.email}</p>
                    </div>
                    {selectedInstructor === instructor.id && (
                      <CheckCircle className="w-5 h-5 text-[#00C7BE] ml-auto" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCheckin}
            disabled={!selectedInstructor || submitting}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-colors ${
              selectedInstructor && !submitting
                ? 'bg-[#00C7BE] hover:bg-[#00B5AD]'
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
            Check in before class starts to confirm readiness
          </p>
          <p className="text-center text-sm text-[#6E6E73]">
            Regístrese antes de que comience la clase para confirmar preparación
          </p>
        </div>
      </div>
    </div>
  );
}
