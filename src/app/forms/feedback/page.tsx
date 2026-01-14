'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, Loader2, ThumbsUp, Mail } from 'lucide-react';

interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
}

interface FeedbackData {
  overallRating: number;
  instructorRating: number;
  contentRating: number;
  materialsRating: number;
  paceRating: number;
  mostHelpful: string;
  improvements: string;
  wouldRecommend: boolean;
  additionalComments: string;
  anonymous: boolean;
  studentName: string;
  studentEmail: string;
}

const RATING_CATEGORIES = [
  { id: 'overall', en: 'Overall Program Experience', es: 'Experiencia General del Programa', required: true },
  { id: 'instructor', en: 'Instructor Quality', es: 'Calidad del Instructor', required: false },
  { id: 'content', en: 'Course Content', es: 'Contenido del Curso', required: false },
  { id: 'materials', en: 'Learning Materials', es: 'Materiales de Aprendizaje', required: false },
  { id: 'pace', en: 'Course Pace', es: 'Ritmo del Curso', required: false },
];

function StarRating({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string; }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#1D1D1F] mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)} className="p-1 transition-colors">
            <Star className={w-8 h-8 } />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<RegisteredStudent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 0, instructorRating: 0, contentRating: 0, materialsRating: 0, paceRating: 0,
    mostHelpful: '', improvements: '', wouldRecommend: false, additionalComments: '',
    anonymous: false, studentName: '', studentEmail: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/checkin/students');
        if (response.ok) { const data = await response.json(); setRegisteredStudents(data.students || []); }
      } catch (err) { console.error('Error:', err); }
      finally { setLoadingStudents(false); }
    };
    fetchStudents();
  }, []);

  const filteredStudents = registeredStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRatingChange = (field: keyof FeedbackData, value: number) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.overallRating === 0) { setError('Please provide an overall rating'); return; }
    setSubmitting(true); setError('');
    try {
      await fetch('/api/feedback/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feedback, timestamp: new Date().toISOString() }) });
      setSuccess(true);
    } catch (err) { console.error('Error:', err); setSuccess(true); }
    finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#D2D2D7]">
            <div className="w-20 h-20 bg-[#5856D6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ThumbsUp className="w-10 h-10 text-[#5856D6]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">Thank You! | Gracias!</h2>
            <p className="text-[#6E6E73] mb-6">Your feedback helps us improve.</p>
            <a href="/" className="inline-block px-6 py-3 bg-[#5856D6] text-white rounded-xl font-medium">Return Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-[#5856D6] to-[#AF52DE] rounded-2xl p-6 mb-6 text-white text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold mb-1">Feedback Form | Formulario</h1>
          <p className="opacity-90">Digital Literacy Program</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D2D2D7]">
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-[#FF3B30]/10 text-[#FF3B30] px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={feedback.anonymous} onChange={(e) => setFeedback(prev => ({ ...prev, anonymous: e.target.checked }))} className="w-5 h-5 rounded" />
                <span className="text-sm text-[#1D1D1F]">Submit anonymously | Enviar anónimamente</span>
              </label>
            </div>
            {!feedback.anonymous && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Select your email</label>
                {loadingStudents ? <Loader2 className="w-6 h-6 animate-spin text-[#5856D6] mx-auto" /> : registeredStudents.length > 0 ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-[#6E6E73]" />
                    <input type="text" value={selectedStudent ? selectedStudent.email : searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSelectedStudent(null); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)} placeholder="Search email..."
                      className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl" />
                    {showDropdown && filteredStudents.length > 0 && !selectedStudent && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#D2D2D7] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredStudents.map((student) => (
                          <button key={student.id} type="button" onClick={() => { setSelectedStudent(student); setFeedback(prev => ({ ...prev, studentName: student.name, studentEmail: student.email })); setSearchQuery(''); setShowDropdown(false); }}
                            className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] border-b border-[#D2D2D7] last:border-b-0">
                            <p className="font-medium text-[#1D1D1F]">{student.email}</p>
                            <p className="text-sm text-[#6E6E73]">{student.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : <div className="bg-[#0071E3]/10 text-[#0071E3] px-4 py-3 rounded-xl text-sm">No students registered.</div>}
              </div>
            )}
            <div className="border-t border-[#D2D2D7] my-6"></div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">Ratings | Calificaciones</h3>
            {RATING_CATEGORIES.map((category) => (
              <StarRating key={category.id} value={feedback[${category.id}Rating as keyof FeedbackData] as number}
                onChange={(val) => handleRatingChange(${category.id}Rating as keyof FeedbackData, val)}
                label={${category.en} | } />
            ))}
            <div className="border-t border-[#D2D2D7] my-6"></div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">Comments | Comentarios</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">What was most helpful?</label>
              <textarea value={feedback.mostHelpful} onChange={(e) => setFeedback(prev => ({ ...prev, mostHelpful: e.target.value }))} rows={2} className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl resize-none" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">What could we improve?</label>
              <textarea value={feedback.improvements} onChange={(e) => setFeedback(prev => ({ ...prev, improvements: e.target.value }))} rows={2} className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl resize-none" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Additional Comments</label>
              <textarea value={feedback.additionalComments} onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))} rows={3} className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl resize-none" />
            </div>
            <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={feedback.wouldRecommend} onChange={(e) => setFeedback(prev => ({ ...prev, wouldRecommend: e.target.checked }))} className="w-5 h-5 rounded" />
                <span className="text-sm text-[#1D1D1F]">Would you recommend this program?</span>
              </label>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 bg-[#5856D6] text-white rounded-xl font-medium hover:bg-[#4B49B8] disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Send className="w-5 h-5" /> Submit Feedback</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
