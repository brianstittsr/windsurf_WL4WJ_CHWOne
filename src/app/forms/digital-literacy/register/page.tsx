'use client';

import React, { useState, useEffect } from 'react';
import { BilingualRegistrationForm } from '@/components/DigitalLiteracy';
import { CLASS_SCHEDULES } from '@/lib/translations/digitalLiteracy';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function StudentRegistrationPage() {
  const [classEnrollments, setClassEnrollments] = useState<{ [classId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  // Fetch current enrollments from Firebase
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const studentsRef = collection(db, 'digital_literacy_students');
        const snapshot = await getDocs(studentsRef);
        
        const enrollments: { [classId: string]: number } = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const classId = data.classId || data.classTime;
          if (classId) {
            enrollments[classId] = (enrollments[classId] || 0) + 1;
          }
        });
        setClassEnrollments(enrollments);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, []);

  const handleRegistration = async (data: any) => {
    // Check if email already exists
    const studentsRef = collection(db, 'digital_literacy_students');
    const snapshot = await getDocs(studentsRef);
    const existingStudent = snapshot.docs.find(doc => doc.data().email === data.email);
    
    if (existingStudent) {
      throw new Error('EMAIL_EXISTS');
    }
    
    // Save to Firebase
    await addDoc(studentsRef, {
      name: data.studentName,
      email: data.email,
      phone: data.phone,
      county: data.county,
      classId: data.classTime,
      registrationDate: data.registrationDate,
      attendance: { present: 0, total: 0 },
      proficiencyAssessments: {},
      isPresent: false,
      completed: false,
      createdAt: serverTimestamp(),
    });
    
    // Update local enrollments
    setClassEnrollments(prev => ({
      ...prev,
      [data.classTime]: (prev[data.classTime] || 0) + 1,
    }));
    
    setSubmittedName(data.studentName);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0071E3] mx-auto mb-4" />
          <p className="text-[#6E6E73]">Loading... | Cargando...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#34C759]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
            Registration Successful!
          </h1>
          <h2 className="text-xl text-[#6E6E73] mb-4">
            ¡Registro Exitoso!
          </h2>
          <p className="text-[#6E6E73] mb-6">
            Thank you, <span className="font-semibold text-[#1D1D1F]">{submittedName}</span>! 
            You will receive a confirmation email shortly.
          </p>
          <p className="text-[#6E6E73]">
            Gracias, <span className="font-semibold text-[#1D1D1F]">{submittedName}</span>! 
            Recibirá un correo de confirmación pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🌐</span>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F]">
                Digital Literacy Program
              </h1>
              <h2 className="text-lg text-[#6E6E73]">
                Programa de Alfabetización Digital
              </h2>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <BilingualRegistrationForm 
          onSubmit={handleRegistration}
          classEnrollments={classEnrollments}
        />
      </div>
    </div>
  );
}
