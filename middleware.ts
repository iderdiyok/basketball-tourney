import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check if this is a scorer route
  if (request.nextUrl.pathname.startsWith('/scorer')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/scorer/:path*',
  ],
};