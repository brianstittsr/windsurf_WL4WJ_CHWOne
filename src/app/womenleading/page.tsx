import type { Metadata } from 'next';
import WomenLeadingHome from '@/components/WomenLeading/WomenLeadingHome';

export const metadata: Metadata = {
  title: 'Women Leading for Wellness & Justice - Mujeres Liderando',
  description:
    'Women Leading for Wellness & Justice - Mujeres Liderando por el Bienestar y la Justicia. Together, we are the difference.',
};

export default function WomenLeadingPage() {
  return <WomenLeadingHome />;
}
