/**
 * SYSTIC-CI — robots.txt dynamique Next.js App Router
 * Accessible : /robots.txt
 */
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.systic.ci';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Exclure les zones privées
        disallow: [
          '/dashboard',
          '/crm',
          '/admin/',
          '/portail/',
          '/technicien/',
          '/api/',
          '/_next/',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
      {
        // Bloquer les scrapers agressifs connus
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
