'use client';

import { Providers } from "@/components/Providers";
import { CognitoAuthProvider } from '@/lib/auth/CognitoAuthContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import { FirebaseInitializer } from '@/components';
import { TestModeWrapper } from '@/components/Common';

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ThemeRegistry>
      <Providers>
        <CognitoAuthProvider>
          <FirebaseInitializer />
          {/* Test Mode Toggle - Only appears in development */}
          <TestModeWrapper />
          {children}
        </CognitoAuthProvider>
      </Providers>
    </ThemeRegistry>
  );
}
