import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "**",
      },
    ],
  },
  // Optimize static asset handling
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Improve asset caching
  staticPageGenerationTimeout: 120,
  // Disable compression during development for faster builds
  compress: process.env.NODE_ENV === 'production',
  // Improve error handling
  onDemandEntries: {
    // Keep pages in memory for longer during development
    maxInactiveAge: 60 * 1000,
    // Number of pages to keep in memory
    pagesBufferLength: 5,
  },
  // Configure webpack to resolve @once-ui-system/components to our local implementation
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@once-ui-system/components': path.resolve(__dirname, 'src/once-ui-system/components.tsx'),
    };
    return config;
  },
};

export default nextConfig;
