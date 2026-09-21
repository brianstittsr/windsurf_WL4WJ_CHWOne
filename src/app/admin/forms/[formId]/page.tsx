'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Form {
  id: string;
  name: string;
  description?: string;
  tags: string[];
}

export default function EditFormPage() {
  const router = useRouter();
  const [formId] = router.query as { formId: string };

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!formId) return;
    async function fetchForm() {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (!res.ok) throw new Error('Failed to load form');
        setForm(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [formId]);

  if (loading) return <p>Loading form…</p>;
  if (!form) return <p>Form not found.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          description: form.description,
          tags: form.tags.join(',').split(',').map((t) => t.trim()).filter(Boolean),
          fields: form.fields, // keep existing fields
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setForm(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Edit Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Form Name *</label>
          <input
            type="text"
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full rounded border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags.join(', ')}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
            className="mt-1 block w-full rounded border-gray-300 p-2"
          />
        </div>
        <button type="submit" disabled={submitting} className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
