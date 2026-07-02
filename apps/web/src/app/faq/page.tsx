import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAQPageClient from "./FAQPageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ — SYSTIC-CI",
  description:
    "Toutes les réponses à vos questions sur nos services de sécurité électronique, nos formations et nos tarifs. SYSTIC-CI — Abidjan.",
  alternates: { canonical: `${SITE.url}/faq` },
};

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <FAQPageClient />
      </main>
      <Footer />
    </>
  );
}
