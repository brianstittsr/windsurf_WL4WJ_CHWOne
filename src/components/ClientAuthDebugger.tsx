'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AuthDebugger to avoid SSR issues
const AuthDebugger = dynamic(() => import('@/components/AuthDebugger'), {
  ssr: false,
});

export default function ClientAuthDebugger() {
  return <AuthDebugger />;
}
