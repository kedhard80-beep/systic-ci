/**
 * SYSTIC-CI — Schema.org JSON-LD structured data
 * Utilisé pour le SEO enrichi (rich snippets Google)
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.systic.ci';

// ── Organization ─────────────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SYSTIC-CI',
    legalName: 'SYSTIC Côte d\'Ivoire',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'Expert en sécurité électronique, vidéosurveillance, contrôle d\'accès, câblage et infrastructures intelligentes à Abidjan, Côte d\'Ivoire.',
    foundingDate: '2015',
    areaServed: 'CI',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plateau',
      addressLocality: 'Abidjan',
      addressCountry: 'CI',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+225-XX-XX-XX-XX',
        contactType: 'customer service',
        areaServed: 'CI',
        availableLanguage: ['French'],
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/systic-ci',
      'https://www.facebook.com/systicCI',
    ],
    knowsAbout: [
      'Sécurité électronique',
      'Vidéosurveillance',
      'Contrôle d\'accès biométrique',
      'Câblage structuré',
      'Domotique',
      'Smart Building',
      'Groupes électrogènes',
      'Formation professionnelle',
    ],
  };
}

// ── LocalBusiness ─────────────────────────────────────────────────────────────

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: 'SYSTIC-CI',
    image: `${BASE_URL}/og-image.jpg`,
    url: BASE_URL,
    telephone: '+225-XX-XX-XX-XX',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plateau',
      addressLocality: 'Abidjan',
      postalCode: '01 BP',
      addressCountry: 'CI',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.3599517,
      longitude: -4.0082563,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '13:00',
      },
    ],
  };
}

// ── WebSite (SearchAction) ────────────────────────────────────────────────────

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: BASE_URL,
    name: 'SYSTIC-CI',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ── FAQPage ───────────────────────────────────────────────────────────────────

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

// ── Course (Académie) ─────────────────────────────────────────────────────────

export function courseSchema(course: {
  name: string;
  description: string;
  provider?: string;
  url: string;
  duration?: string;
  price?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider ?? 'SYSTIC-CI Académie',
      sameAs: BASE_URL,
    },
    url: course.url,
    ...(course.duration && { timeRequired: course.duration }),
    ...(course.price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: 'XOF',
        availability: 'https://schema.org/InStock',
      },
    }),
  };
}

// ── Article (Blog) ────────────────────────────────────────────────────────────

export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image ?? `${BASE_URL}/og-image.jpg`,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.authorName ?? 'SYSTIC-CI',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SYSTIC-CI',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
  };
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// ── JsonLd composant helper ───────────────────────────────────────────────────
// Retourne les props pour un <script> JSON-LD (utiliser dans un .tsx)
export function jsonLdProps(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
