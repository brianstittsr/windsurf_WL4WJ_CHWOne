import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function WomenLeadingHomepage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the scraped homepage content
    window.location.href = '/womenleading/pages/index.html';
  }, []);

  return <div>Redirecting...</div>;
}