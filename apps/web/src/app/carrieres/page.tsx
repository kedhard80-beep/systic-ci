import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CarrieresPageClient from "./CarrieresPageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Carrières — Rejoignez l'équipe SYSTIC-CI",
  description:
    "Rejoignez une équipe d'ingénieurs et techniciens passionnés à Abidjan. Postes ouverts en sécurité électronique, réseaux et formation. Envoyez votre candidature.",
  alternates: { canonical: `${SITE.url}/carrieres` },
};

export default function CarrieresPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <CarrieresPageClient />
      </main>
      <Footer />
    </>
  );
}
