'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import EmpowerSurveyManagement from '@/components/Surveys/EmpowerSurveyManagement';

export default function SurveysPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <MainLayout>
      <EmpowerSurveyManagement />
    </MainLayout>
  );
}
