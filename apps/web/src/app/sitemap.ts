/**
 * SYSTIC-CI — Sitemap dynamique Next.js App Router
 * Accessible : /sitemap.xml
 */
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.systic.ci';

// Pages statiques corporate
const STATIC_PAGES: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { url: '/',            priority: 1.0, changeFrequency: 'weekly'  },
  { url: '/entreprise',  priority: 0.9, changeFrequency: 'monthly' },
  { url: '/metiers',     priority: 0.9, changeFrequency: 'monthly' },
  { url: '/academie',    priority: 0.85, changeFrequency: 'weekly' },
  { url: '/realisations', priority: 0.8, changeFrequency: 'monthly' },
  { url: '/blog',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/carrieres',   priority: 0.7, changeFrequency: 'weekly'  },
  { url: '/contact',     priority: 0.7, changeFrequency: 'yearly'  },
  { url: '/devis',       priority: 0.9, changeFrequency: 'yearly'  },
  { url: '/faq',         priority: 0.6, changeFrequency: 'monthly' },
];

// Sous-pages métiers
const METIERS_PAGES = [
  '/metiers/courant-faible',
  '/metiers/courant-fort',
  '/metiers/videosurveilance',
  '/metiers/controle-acces',
  '/metiers/cablage',
  '/metiers/smart-building',
  '/metiers/groupes-electrogenes',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_PAGES.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const metiersEntries = METIERS_PAGES.map((url) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...metiersEntries];
}
