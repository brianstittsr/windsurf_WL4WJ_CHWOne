import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading…</div>;

  // Only allow users with role admin or manager
  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <nav className="space-x-4">
          <Link href="/admin/forms" className="text-blue-600 hover:underline">
          <a>Forms</a>
</Link>
          <a href="/admin/tags" className="text-blue-600 hover:underline">Tags</a>
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
