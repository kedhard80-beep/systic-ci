import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AcademiePageClient from "./AcademiePageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Académie SYSTIC-CI — Formations en sécurité électronique",
  description:
    "Formez-vous aux métiers de la sécurité électronique et de l'électricité à Abidjan. 6 modules certifiants, 90% de pratique. Les meilleurs profils rejoignent notre équipe.",
  alternates: { canonical: `${SITE.url}/academie` },
  keywords: ["formation sécurité électronique Abidjan", "certification vidéosurveillance CI", "formation contrôle accès", "école technique Côte d'Ivoire"],
};

export default function AcademiePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <AcademiePageClient />
      </main>
      <Footer />
    </>
  );
}
