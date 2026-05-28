import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip checks for static assets, public API routes, files, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Retrieve token from HTTP-only cookies
  const token = request.cookies.get('token')?.value;

  // 3. Verify user role from JWT token
  const user = token ? await verifyJWT(token) : null;

  // 4. Protect admin paths
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // 5. Protect sales paths
  if (pathname.startsWith('/sales')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'SALES_OFFICER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // 6. Redirect authenticated users away from Login and Root landing page
  if (pathname === '/' || pathname === '/login') {
    if (user) {
      if (user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (user.role === 'SALES_OFFICER') {
        return NextResponse.redirect(new URL('/sales/dashboard', request.url));
      }
    } else if (pathname === '/') {
      // Unauthenticated landing page redirects to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Specify matching routes for the middleware to run
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (auth api endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, css, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
