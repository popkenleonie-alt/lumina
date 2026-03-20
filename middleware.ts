import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isLoginApi = request.nextUrl.pathname === '/api/auth/login';
  const authCookie = request.cookies.get('lumina-auth')?.value;

  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, allow all access
  if (!sitePassword) return NextResponse.next();

  // Allow login page and login API
  if (isLoginPage || isLoginApi) return NextResponse.next();

  // Check auth
  if (authCookie === sitePassword) return NextResponse.next();

  // Redirect to login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|stickers/).*)'],
};
