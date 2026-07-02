/**
 * SYSTIC-CI — Middleware Next.js
 * Protection des routes par rôle + redirection auth
 */

import { NextRequest, NextResponse } from 'next/server';

// Routes publiques (pas de token requis)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/blog',
  '/academie',
  '/realisations',
  '/carrieres',
  '/contact',
  '/devis',
  '/faq',
  '/entreprise',
  '/metiers',
];

// Préfixes de routes par rôle
const ROLE_ROUTES: Record<string, string[]> = {
  SUPER_ADMIN: ['/dashboard', '/crm', '/admin'],
  DIRECTION:   ['/dashboard', '/crm', '/admin'],
  COMMERCIAL:  ['/dashboard', '/crm'],
  TECHNICIEN:  ['/technicien'],
  CLIENT:      ['/portail'],
  ETUDIANT:    ['/portail', '/academie'],
  FORMATEUR:   ['/dashboard'],
  PARTENAIRE:  ['/portail'],
};

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
}

function isAuthRoute(pathname: string): boolean {
  return ['/login', '/register', '/forgot-password', '/reset-password'].some(
    (r) => pathname.startsWith(r),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les assets statiques et API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // fichiers statiques
  ) {
    return NextResponse.next();
  }

  // Lire le token depuis les cookies (httpOnly) ou le header
  // En mode SPA on utilise localStorage → le middleware ne peut pas y accéder.
  // On utilise un cookie léger "systic_role" posé côté client au login.
  const role = request.cookies.get('systic_role')?.value ?? null;
  const hasToken = request.cookies.get('systic_auth')?.value ?? null;

  const isAuthenticated = !!(hasToken && role);

  // Si la route est publique → laisser passer
  if (isPublicRoute(pathname)) {
    // Si déjà authentifié et sur une page auth → rediriger vers le bon portail
    if (isAuthenticated && isAuthRoute(pathname)) {
      const redirect = getHomeForRole(role);
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return NextResponse.next();
  }

  // Route protégée sans token → login
  if (!isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Vérification d'accès par rôle
  const allowedPrefixes = ROLE_ROUTES[role] ?? [];
  const hasAccess = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!hasAccess) {
    // Rediriger vers le portail du rôle (pas un 403)
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  return NextResponse.next();
}

function getHomeForRole(role: string | null): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'DIRECTION':
    case 'COMMERCIAL':
    case 'FORMATEUR':
      return '/dashboard';
    case 'TECHNICIEN':
      return '/technicien';
    case 'CLIENT':
    case 'PARTENAIRE':
      return '/portail';
    case 'ETUDIANT':
      return '/academie';
    default:
      return '/';
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
