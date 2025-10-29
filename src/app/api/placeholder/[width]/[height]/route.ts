/**
 * Placeholder image API
 * 
 * Generates placeholder images of specified dimensions
 * Usage: /api/placeholder/400/300
 */

import { NextRequest, NextResponse } from 'next/server';
import { use } from 'react';

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  // Use React.use() to unwrap the params promise as recommended by Next.js 15+
  const unwrappedParams = use(params);
  const width = parseInt(unwrappedParams.width, 10) || 300;
  const height = parseInt(unwrappedParams.height, 10) || 200;
  
  // Create a simple SVG placeholder
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#888">
      ${width}×${height}
    </text>
  </svg>`;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
}
