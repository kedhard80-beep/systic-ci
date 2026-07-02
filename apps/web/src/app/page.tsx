import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import AcademieSection from "@/components/sections/AcademieSection";
import SecteursSection from "@/components/sections/SecteursSection";
import CTASection from "@/components/sections/CTASection";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE.name} — Votre Partenaire en Sécurité Électronique à Abidjan`,
  description:
    "SYSTIC-CI : expert en vidéosurveillance IP, contrôle d'accès biométrie, câblage électrique, groupes électrogènes et formation professionnelle à Abidjan. Devis gratuit sous 24h.",
  alternates: {
    canonical: SITE.url,
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Section 1 — Hero */}
        <HeroSection />

        {/* Section 2 — Services */}
        <ServicesSection />

        {/* Section 3 — Académie */}
        <AcademieSection />

        {/* Section 4 — Secteurs */}
        <SecteursSection />

        {/* Section 5 — CTA */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
