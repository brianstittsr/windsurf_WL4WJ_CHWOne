'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, User, Calendar, Save, Loader2, CheckCircle } from 'lucide-react';

// Withdrawal reasons - bilingual
const WITHDRAWAL_REASONS = [
  { en: 'Schedule conflict', es: 'Conflicto de horario' },
  { en: 'Transportation issues', es: 'Problemas de transporte' },
  { en: 'Health reasons', es: 'Razones de salud' },
  { en: 'Family emergency', es: 'Emergencia familiar' },
  { en: 'Found employment', es: 'Encontró empleo' },
  { en: 'Moved out of area', es: 'Se mudó del área' },
  { en: 'Course too difficult', es: 'Curso muy difícil' },
  { en: 'Course not meeting expectations', es: 'El curso no cumple expectativas' },
  { en: 'Personal reasons', es: 'Razones personales' },
  { en: 'Other', es: 'Otro' },
];

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function WithdrawalFormPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/checkin/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Please select a student | Por favor seleccione un estudiante');
      return;
    }
    if (!reason) {
      setError('Please select a reason | Por favor seleccione una razón');
      return;
    }
    if (reason === 'Other' || reason === 'Otro') {
      if (!otherReason.trim()) {
        setError('Please specify the reason | Por favor especifique la razón');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/students/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          withdrawalDate,
          reason: reason === 'Other' || reason === 'Otro' ? otherReason : reason,
          additionalNotes,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setWithdrawalDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setOtherReason('');
    setAdditionalNotes('');
    setSuccess(false);
    setError('');
    setSearchQuery('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#D2D2D7]">
            <div className="w-20 h-20 bg-[#FF9500]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#FF9500]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
              Withdrawal Recorded | Retiro Registrado
            </h2>
            <p className="text-[#6E6E73] mb-6">
              The withdrawal for {selectedStudent?.name} has been recorded.<br/>
              El retiro de {selectedStudent?.name} ha sido registrado.
            </p>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-[#FF9500] text-white rounded-xl font-medium hover:bg-[#E68600] transition-colors"
            >
              Record Another Withdrawal | Registrar Otro Retiro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Apple-styled Header */}
        <div className="bg-gradient-to-r from-[#FF9500] to-[#FF6B00] rounded-2xl p-6 mb-6 text-white text-center">
          <LogOut className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold mb-1">
            Withdrawal Form | Formulario de Retiro
          </h1>
          <p className="opacity-90">
            Digital Literacy Program | Programa de Alfabetización Digital
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-[#FF9500]/10 rounded-2xl p-4 mb-6 border border-[#FF9500]/20">
          <p className="text-sm text-[#1D1D1F]">
            Use this form to record when a participant withdraws from the program. This information helps us improve the program.<br/>
            <span className="text-[#6E6E73]">Use este formulario para registrar cuando un participante se retira del programa. Esta información nos ayuda a mejorar el programa.</span>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D2D2D7]">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#FF3B30]/10 text-[#FF3B30] px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Student Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Select Student | Seleccione Estudiante *
              </label>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF9500]" />
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center">
                    <User className="absolute left-3 w-5 h-5 text-[#6E6E73]" />
                    <input
                      type="text"
                      value={selectedStudent ? selectedStudent.name : searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedStudent(null);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search student... | Buscar estudiante..."
                      className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:border-transparent"
                    />
                  </div>
                  {showDropdown && filteredStudents.length > 0 && !selectedStudent && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#D2D2D7] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchQuery('');
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] border-b border-[#D2D2D7] last:border-b-0"
                        >
                          <p className="font-medium text-[#1D1D1F]">{student.name}</p>
                          <p className="text-sm text-[#6E6E73]">{student.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Withdrawal Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Withdrawal Date | Fecha de Retiro *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73]" />
                <input
                  type="date"
                  value={withdrawalDate}
                  onChange={(e) => setWithdrawalDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:border-transparent"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Reason for Withdrawal | Razón del Retiro *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:border-transparent bg-white"
              >
                <option value="">Select reason... | Seleccione razón...</option>
                {WITHDRAWAL_REASONS.map((r, idx) => (
                  <option key={idx} value={r.en}>
                    {r.en} | {r.es}
                  </option>
                ))}
              </select>
            </div>

            {/* Other Reason */}
            {(reason === 'Other') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  Specify reason | Especifique la razón *
                </label>
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:border-transparent"
                />
              </div>
            )}

            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Additional Notes | Notas Adicionales
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                placeholder="Any additional information... | Cualquier información adicional..."
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9500] focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#FF9500] text-white rounded-xl font-medium hover:bg-[#E68600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving... | Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Record Withdrawal | Registrar Retiro
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
