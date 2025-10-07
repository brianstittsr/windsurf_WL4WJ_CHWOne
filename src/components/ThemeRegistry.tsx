'use client';

import { ThemeProviderWrapper } from './ThemeProvider';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderWrapper>
      {children}
    </ThemeProviderWrapper>
  );
}
