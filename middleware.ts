import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the preferred language from the cookie
  const language = request.cookies.get('NEXT_LOCALE')?.value || 'en';
  
  // Set the language in the response headers
  const response = NextResponse.next();
  response.headers.set('x-language', language);
  
  return response;
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - static files with extensions
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
