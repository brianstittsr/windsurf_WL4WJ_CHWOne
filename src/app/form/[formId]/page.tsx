'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface FormField {
  label: string;
  name: string;
  field_type: string;
  required: boolean;
}

interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = (params?.formId as string) || '';

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    const data: Record<string, any> = {};
    form.fields.forEach((f) => {
      const el = document.getElementsByName(f.name)[0] as HTMLInputElement | null;
      if (el) data[f.name] = el.value;
    });

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, data }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatusMsg('Thank you for signing in!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading form…</p>;
  if (!form) return <p>Form not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">{form.name}</h1>
      {statusMsg && <p className="mb-4 text-green-600">{statusMsg}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map((f) => (
          <div key={f.name}>
            <label className="block font-medium mb-1">{f.label}{f.required && ' *'}</label>
            <input
              type={f.field_type === 'email' ? 'email' : f.field_type}
              name={f.name}
              required={f.required}
              className="w-full border rounded p-2"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? 'Submitting…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
