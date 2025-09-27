// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclure proprement la page de login admin (avec ou sans slash)
  const isAdminLogin = /^\/admin\/login\/?$/.test(pathname);

  // Protéger les routes /admin sauf la page de login
  if (pathname.startsWith('/admin') && !isAdminLogin) {
    // Vérifier la session admin dans les cookies
    const adminSession = request.cookies.get('adminSession')?.value;

    if (!adminSession) {
      // Rediriger vers la page de connexion standard avec retour vers la cible
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Vérifier la validité de la session
      const session = JSON.parse(adminSession);
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      // Session expirée après 8 heures
      if (hoursDiff > 8) {
        const url = new URL('/auth/login', request.url);
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Session invalide -> rediriger vers login standard
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
