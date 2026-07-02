import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EntreprisePageClient from "./EntreprisePageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Entreprise — SYSTIC-CI",
  description:
    "Découvrez SYSTIC-CI, entreprise ivoirienne spécialisée en ingénierie et intégration technologique. Notre histoire, nos valeurs, notre équipe et notre mission.",
  alternates: { canonical: `${SITE.url}/entreprise` },
};

export default function EntreprisePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <EntreprisePageClient />
      </main>
      <Footer />
    </>
  );
}
