import { useRouter } from 'next/navigation';
'use client';
import { useEffect, useState } from 'react';

interface Form {
  id: string;
  name: string;
  description?: string;
  tags: string[];
}

export default function PreviewPage() {
  const router = useRouter();
  const [formId] = router.query as { formId: string };
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) return;
    async function fetchQR() {
      try {
        const res = await fetch(`/api/qr/${formId}`);
        if (!res.ok) throw new Error('Failed to generate QR');
        const blob = await res.blob();
        setQrUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchQR();
  }, [formId]);

  if (loading) return <p>Generating QR…</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Preview QR Code for {formId}</h2>
      {qrUrl ? (<img src={qrUrl} alt="QR Code" className="w-48 h-48" />) : (<p>Unable to generate QR</p>)}
    </div>
  );
}
