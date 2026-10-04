import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <nav className="space-x-4">
          <Link href="/admin/forms" className="text-blue-600 hover:underline">
            Forms
          </Link>
          <Link href="/admin/tags" className="text-blue-600 hover:underline">
            Tags
          </Link>
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
