import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { fonts } from "@/resources";
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ClientBootstrap from "@/components/ClientBootstrap";

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
        <Providers>
          <AuthProvider>
            {children}
            {/* Load Bootstrap JS on client */}
            <ClientBootstrap />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
