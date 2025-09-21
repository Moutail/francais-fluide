// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Vérifier la session admin dans les cookies ou headers
    const adminSession = request.cookies.get('adminSession')?.value;
    
    if (!adminSession) {
      // Rediriger vers la page de connexion admin
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      // Vérifier la validité de la session
      const session = JSON.parse(adminSession);
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      // Session expirée après 8 heures
      if (hoursDiff > 8) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      // Session invalide
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
