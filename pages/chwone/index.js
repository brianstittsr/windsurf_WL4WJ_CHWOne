import { useEffect } from 'react';

export default function ChwOneHomepage() {
  useEffect(() => {
    // Redirect to the original homepage content
    window.location.href = '/pages/index.html';
  }, []);

  return <div>Redirecting...</div>;
}