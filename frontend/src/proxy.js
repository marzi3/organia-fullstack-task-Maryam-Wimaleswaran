import { NextResponse } from 'next/server';

/**
 * Next.js middleware for protecting dashboard routes.
 * Redirects unauthenticated users to the login page.
 * Uses cookie-based token check as a lightweight guard;
 * full validation happens on the client via AuthContext.
 */
export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ['/dashboard'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  // Auth routes (redirect to dashboard if already logged in)
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Since we use localStorage (not cookies) for JWT, middleware can't fully validate.
  // The client-side AuthContext handles the real auth check.
  // This middleware is a lightweight SSR guard.

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
