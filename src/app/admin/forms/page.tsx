'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthSession } from '@/lib/auth';

interface Form {
  id: string;
  name: string;
  description?: string;
  tags: string[];
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch('/api/forms');
        if (!res.ok) throw new Error('Failed to load forms');
        const data = await res.json();
        setForms(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  if (loading) return <p>Loading forms…</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Sign‑In Forms</h2>
      <Link href="/admin/forms/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6">
        Create New Form
      </Link>

      {forms.length === 0 ? (
        <p>No forms found. Click "Create New Form" to get started.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Tags</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-4 py-2 font-medium">{f.name}</td>
                <td className="px-4 py-2">{f.description || '-'}</td>
                <td className="px-4 py-2">
                  {f.tags.map((t) => (
                    <span key={t} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-1">
                      {t}
                    </span>
                  )) || '-'}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <Link href={`/admin/forms/${f.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <Link href={`/admin/forms/${f.id}/preview`} className="text-green-600 hover:underline">Preview</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
