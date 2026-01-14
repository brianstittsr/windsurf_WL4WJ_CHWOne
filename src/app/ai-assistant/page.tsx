'use client';

import React from 'react';
import { Bot, GraduationCap, Award, Briefcase, Brain, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import ChatInterface from '@/components/AI/ChatInterface';

// Inner component that uses the auth context
function AiAssistantContent() {
  const { currentUser, loading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#86868B] text-sm">Loading AI Assistant...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const suggestions = [
    { icon: GraduationCap, text: 'What are the different CHW certification levels?' },
    { icon: Award, text: 'What are the requirements for advanced level certification?' },
    { icon: Briefcase, text: 'What career pathways are available for CHWs?' },
    { icon: Brain, text: 'Tell me about WL4WJ training programs' },
  ];
  
  return (
    <AdminLayout>
      <div className="space-y-6 h-[calc(100vh-200px)]">
        {/* Apple-style Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#5856D6] to-[#AF52DE] rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">AI Assistant</h1>
              <p className="text-[#6E6E73]">Get intelligent help with CHW-related questions</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0071E3]/10 text-[#0071E3] text-sm font-medium rounded-full">
            <Award className="w-4 h-4" />
            NEW: CHW Levels Information
          </span>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] p-5">
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-2">
            Now with WL4WJ CHW Certification Information
          </h2>
          <p className="text-sm text-[#6E6E73] mb-4">
            Our AI Assistant can answer questions about CHW certification levels, requirements, training programs, and career pathways based on WL4WJ standards.
          </p>
          
          <div className="border-t border-[#D2D2D7] pt-4">
            <p className="text-sm font-medium text-[#1D1D1F] mb-3">Try asking questions like:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl">
                  <suggestion.icon className="w-4 h-4 text-[#0071E3] flex-shrink-0" />
                  <span className="text-sm text-[#1D1D1F]">{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Login Warning */}
        {!currentUser && (
          <div className="flex items-center gap-3 p-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#FF9500]" />
            <p className="text-sm font-medium text-[#FF9500]">Please log in to use the AI Assistant</p>
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl border border-[#D2D2D7] overflow-hidden flex-1" style={{ height: 'calc(100% - 280px)' }}>
          <ChatInterface />
        </div>
      </div>
    </AdminLayout>
  );
}

// Export the wrapped component with AuthProvider
export default function AiAssistantPage() {
  return (
    <AuthProvider>
      <AiAssistantContent />
    </AuthProvider>
  );
}
