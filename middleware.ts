import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith('/login');
  const isLanding = path === '/';
  const isUsersPage = path.startsWith('/users');

  // Landing siempre pública
  if (isLanding) return NextResponse.next();

  // Si no está logueado y no es auth page → redirige al login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Si está logueado y va al login → redirige a transacciones
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/transacciones', req.url));
  }

  // Si intenta acceder a /users y no es ADMIN → redirige a transacciones
  if (isLoggedIn && isUsersPage && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/transacciones', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};