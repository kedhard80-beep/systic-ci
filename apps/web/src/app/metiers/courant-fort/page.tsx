import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourantFortClient from "./CourantFortClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Courant Fort — Électricité industrielle & TGBT | SYSTIC-CI",
  description:
    "Installations électriques HTA/BT, tableaux TGBT, groupes électrogènes, éclairage LED industriel. Ingénierie électrique certifiée à Abidjan, Côte d'Ivoire.",
  alternates: { canonical: `${SITE.url}/metiers/courant-fort` },
  keywords: ["électricité industrielle Abidjan", "TGBT Côte d'Ivoire", "groupe électrogène CI", "installation électrique BT/HTA"],
};

export default function CourantFortPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <CourantFortClient />
      </main>
      <Footer />
    </>
  );
}
