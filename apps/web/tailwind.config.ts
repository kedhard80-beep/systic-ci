import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== SYSTIC-CI BRAND COLORS =====
        systic: {
          blue: "#1A45C9",
          red: "#C81324",
          navy: "#0D1F4E",
        },
        // Semantic tokens
        primary: {
          DEFAULT: "#1A45C9",
          50: "#EEF2FD",
          100: "#D5DEFB",
          200: "#ABBDF7",
          300: "#819CF3",
          400: "#577BEF",
          500: "#1A45C9",
          600: "#1538A0",
          700: "#102B77",
          800: "#0A1E4E",
          900: "#0D1F4E",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C81324",
          50: "#FEF2F3",
          100: "#FDE6E8",
          200: "#FBCDD1",
          300: "#F79BA3",
          400: "#F36975",
          500: "#C81324",
          600: "#A00F1D",
          700: "#780B15",
          800: "#50070D",
          900: "#280306",
          foreground: "#FFFFFF",
        },
        navy: {
          DEFAULT: "#0D1F4E",
          foreground: "#FFFFFF",
        },
        // Neutrals
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SYSTIC greys
        grey: {
          light: "#F5F6FA",
          text: "#5B6273",
          anthracite: "#2B2F3A",
        },
      },
      fontFamily: {
        sans: ["Open Sans", "system-ui", "sans-serif"],
        heading: ["Montserrat", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-blue": "0 0 40px rgba(26, 69, 201, 0.3)",
        "glow-red": "0 0 40px rgba(200, 19, 36, 0.3)",
        "card-hover": "0 20px 60px rgba(13, 31, 78, 0.15)",
        "glass": "0 8px 32px rgba(13, 31, 78, 0.1)",
        "premium": "0 32px 64px rgba(13, 31, 78, 0.2), 0 0 0 1px rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-systic": "linear-gradient(135deg, #0D1F4E 0%, #1A45C9 50%, #0D1F4E 100%)",
        "gradient-hero": "linear-gradient(to bottom right, #0D1F4E, #1A45C9)",
        "gradient-card": "linear-gradient(135deg, rgba(26,69,201,0.05), rgba(13,31,78,0.02))",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(32px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(26, 69, 201, 0.4)" },
          "50%": { boxShadow: "0 0 60px rgba(26, 69, 201, 0.8)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "shimmer": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "count-up": {
          from: { "--num": "0" },
          to: { "--num": "var(--target)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "slide-in-left": "slide-in-left 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.6s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "marquee": "marquee 30s linear infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
