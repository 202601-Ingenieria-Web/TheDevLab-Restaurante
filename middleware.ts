import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith('/login');
  const isLanding = path === '/';
  const isUsersPage = path.startsWith('/users');

  if (isLanding) return NextResponse.next();

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/transacciones', req.url));
  }

  if (isLoggedIn && isUsersPage && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/transacciones', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
