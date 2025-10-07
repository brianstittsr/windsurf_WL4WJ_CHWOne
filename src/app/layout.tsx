import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { CognitoAuthProvider } from '@/lib/auth/CognitoAuthContext';
import { fonts } from "@/resources";
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';

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
      </head>
      <body className={`${fonts.heading.variable} ${fonts.body.variable} ${fonts.label.variable} ${fonts.code.variable}`}>
        <ThemeRegistry>
          <CognitoAuthProvider>
            {children}
          </CognitoAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
