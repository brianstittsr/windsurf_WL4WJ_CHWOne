'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import TestModeToggle with no SSR to avoid hydration issues
const TestModeToggle = dynamic(
  () => import('@/components/Common/TestModeToggle'),
  { ssr: false }
);

export default function TestModeWrapper() {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <TestModeToggle />;
}
