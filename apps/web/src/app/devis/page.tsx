import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DevisPageClient from "./DevisPageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Demander un devis — SYSTIC-CI",
  description:
    "Obtenez un devis gratuit et personnalisé pour vos projets de sécurité électronique et d'infrastructure électrique. Réponse sous 24h par nos ingénieurs.",
  alternates: { canonical: `${SITE.url}/devis` },
};

export default function DevisPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <DevisPageClient />
      </main>
      <Footer />
    </>
  );
}
