// Basic resources for the platform
export {
  person,
  blog,
  gallery,
  social,
  newsletter,
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

// Social sharing configuration
export const socialSharing = {
  display: true,
  platforms: {
    x: true,
    facebook: true,
    linkedin: true,
    copyLink: true,
  }
};

// Mailchimp configuration
export const mailchimp = {
  action: "https://example.us1.list-manage.com/subscribe/post?u=123456789&id=abcdef",
  effects: {
    gradient: {
      display: true,
      tilt: 45,
      colorStart: "rgba(0, 0, 0, 0.02)",
      colorEnd: "rgba(0, 0, 0, 0.06)",
      opacity: 0.5
    }
  }
};
