import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourantFaibleClient from "./CourantFaibleClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Courant Faible — Sécurité électronique & Réseaux | SYSTIC-CI",
  description:
    "Vidéosurveillance IP, contrôle d'accès biométrique, alarmes, domotique, réseaux LAN et téléphonie IP. Solutions de sécurité électronique à Abidjan, Côte d'Ivoire.",
  alternates: { canonical: `${SITE.url}/metiers/courant-faible` },
  keywords: ["vidéosurveillance Abidjan", "contrôle d'accès Côte d'Ivoire", "alarme intrusion", "réseau LAN entreprise", "domotique CI"],
};

export default function CourantFaiblePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <CourantFaibleClient />
      </main>
      <Footer />
    </>
  );
}
