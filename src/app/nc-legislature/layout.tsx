'use client';

import AdminLayout from '@/components/Layout/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function NCLegislatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}
