// Basic resources for the platform
export {
  person,
} from "./content";

// Font configuration for Next.js
import { Inter, JetBrains_Mono } from 'next/font/google';

export const heading = Inter({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const label = Inter({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
});

export const code = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
});

export const fonts = {
  heading,
  body,
  label,
  code,
};

// Basic configuration
export const baseURL: string = "https://chwone-platform.com";
