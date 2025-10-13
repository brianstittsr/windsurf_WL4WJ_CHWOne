import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { CognitoAuthProvider } from '@/lib/auth/CognitoAuthContext';
import { fonts } from "@/resources";
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import FirebaseInitializer from '@/components/FirebaseInitializer';
import TestModeWrapper from '@/components/Common/TestModeWrapper';

export const metadata: Metadata = {
  title: 'CHWOne - Community Health Worker Management Platform',
  description: 'Women Leading for Wellness and Justice Community Health Worker Management Platform',
  keywords: 'community health workers, CHW, healthcare, North Carolina, wellness, justice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Preload the first carousel image for faster initial load */}
        <link 
          rel="preload" 
          href="/images/carousel/community-health-workers.webp" 
          as="image" 
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>
        {/* Test Mode Toggle - Only appears in development */}
        <TestModeWrapper />
        
        <ThemeRegistry>
          <CognitoAuthProvider>
            <FirebaseInitializer />
            {children}
          </CognitoAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
