'use client';
import { useState } from 'react';
import Link from 'next/link';

interface FormField {
  label: string;
  name: string;
  type: string;
  required: boolean;
}

export default function NewFormPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>(''); // comma separated
  const [fields, setFields] = useState<FormField[]>([
    { label: 'First Name', name: 'firstName', type: 'text', required: true },
    { label: 'Last Name', name: 'lastName', type: 'text', required: true },
    { label: 'Email', name: 'email', type: 'email', required: true },
    { label: 'Phone', name: 'phone', type: 'tel', required: false },
    { label: 'Zip Code', name: 'zipCode', type: 'text', required: false },
  ]);

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          fields,
        }),
      });
      if (!res.ok) throw new Error('Failed to create form');
      const data = await res.json();
      window.location.href = `/admin/forms/${data.id}`;
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Create New Sign‑In Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Form Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 p-2"
          />
        </div>
        {/* Fields table – in a real app you’d allow editing each field */}
        <div>
          <h3 className="text-sm font-medium">Form Fields</h3>
          <table className="mt-1 w-full border">
            <thead>
              <tr>
                <th className="border p-2 text-left">Label</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Required</th>
              </tr>
            </thead>
            <tbody>{fields.map((f, i) => (
              <tr key={i} className="border-t">
                <td className="border p-2">{f.label}</td>
                <td className="border p-2">{f.name}</td>
                <td className="border p-2">{f.type}</td>
                <td className="border p-2">{f.required ? 'Yes' : 'No'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <button type="submit" disabled={submitting} className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {submitting ? 'Creating…' : 'Create Form'}
        </button>
      </form>
    </div>
  );
}
