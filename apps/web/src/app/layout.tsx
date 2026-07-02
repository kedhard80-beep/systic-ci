import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";
import { SITE } from "@/lib/constants";
import AIAssistant from "@/components/ia/AIAssistant";
import { QueryProvider } from "@/lib/providers/QueryProvider";

// ===== METADATA =====
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "sécurité électronique Abidjan",
    "vidéosurveillance Côte d'Ivoire",
    "contrôle d'accès biométrie",
    "câblage électrique Abidjan",
    "groupes électrogènes",
    "domotique Smart Building",
    "formation sécurité électronique",
    "SYSTIC-CI",
    "informatique et sécurité",
  ],
  authors: [{ name: "SYSTIC-CI", url: SITE.url }],
  creator: "SYSTIC-CI",
  publisher: "SYSTIC-CI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — Sécurité Électronique & Informatique à Abidjan`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og-image.jpg"],
    creator: "@systic_ci",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#1A45C9" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE.url,
    languages: {
      "fr-CI": SITE.url,
      "fr-FR": SITE.url,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A45C9" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1F4E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Schema.org — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE.name,
              alternateName: "SYSTIC-CI",
              description: SITE.description,
              url: SITE.url,
              logo: `${SITE.url}/logo.png`,
              contactPoint: SITE.phone.map((phone) => ({
                "@type": "ContactPoint",
                telephone: phone,
                contactType: "customer service",
                availableLanguage: "French",
                areaServed: "CI",
              })),
              address: {
                "@type": "PostalAddress",
                streetAddress: SITE.address.street,
                addressLocality: "Abidjan",
                addressCountry: "CI",
              },
              sameAs: Object.values(SITE.social),
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "09:00",
                  closes: "18:00",
                },
              ],
            }),
          }}
        />
        {/* Schema.org — WebSite (SearchAction pour Google Sitelinks Searchbox) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: SITE.url,
              name: SITE.name,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE.url}/blog?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Schema.org — LocalBusiness (SEO local Abidjan) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": `${SITE.url}/#localbusiness`,
              name: SITE.name,
              image: `${SITE.url}/og-image.jpg`,
              url: SITE.url,
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                streetAddress: SITE.address.street,
                addressLocality: "Abidjan",
                addressCountry: "CI",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 5.3599517,
                longitude: -4.0082563,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "08:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Saturday"],
                  opens: "09:00",
                  closes: "13:00",
                },
              ],
            }),
          }}
        />
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch pour les ressources externes */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="antialiased min-h-screen bg-background font-sans">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <AIAssistant />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
