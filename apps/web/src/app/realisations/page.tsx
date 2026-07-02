import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RealisationsPageClient from "./RealisationsPageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Réalisations — Portfolio SYSTIC-CI",
  description:
    "Découvrez nos projets réalisés en Côte d'Ivoire : vidéosurveillance, contrôle d'accès, réseaux, installations électriques pour banques, hôpitaux, industries et plus.",
  alternates: { canonical: `${SITE.url}/realisations` },
};

export default function RealisationsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <RealisationsPageClient />
      </main>
      <Footer />
    </>
  );
}
