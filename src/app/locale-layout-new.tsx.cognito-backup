import { Providers } from "@/components/Providers";
import { CognitoAuthProvider } from '@/lib/auth/CognitoAuthContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import { FirebaseInitializer } from '@/components';
import { TestModeWrapper } from '@/components/Common';
import { ReactNode } from "react";

interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  return (
    <html lang={params.locale}>
      <body>
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
      </body>
    </html>
  );
}
