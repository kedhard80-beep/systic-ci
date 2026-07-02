import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
// URL de l'API (dev local ou prod déployée)
const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try { return new URL(raw).origin; } catch { return raw; }
})();

const nextConfig: NextConfig = {
  // ===== PERFORMANCE =====
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),

  // ===== IMAGES =====
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
    dangerouslyAllowSVG: false,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.systic.ci" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },

  // ===== EXPERIMENTAL =====
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "date-fns",
    ],
    // Optimisation CSS critique inline (améliore LCP)
    optimizeCss: true,
  },

  // ===== HEADERS (security) =====
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              isDev
                ? "connect-src 'self' http://localhost:4000 ws://localhost:* http://localhost:3001"
                : `connect-src 'self' ${apiOrigin} ${apiOrigin.replace("https://", "wss://")} https://api.systic.ci wss://api.systic.ci`,
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ===== REDIRECTS =====
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/formations", destination: "/academie", permanent: true },
      { source: "/formation", destination: "/academie", permanent: true },
    ];
  },

  // ===== REWRITES (API proxy for dev) =====
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
