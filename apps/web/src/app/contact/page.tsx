import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactPageClient from "./ContactPageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact — SYSTIC-CI",
  description: `Contactez SYSTIC-CI pour vos projets de sécurité électronique et d'infrastructure électrique à Abidjan. ${SITE.phone[0]} — ${SITE.email}`,
  alternates: { canonical: `${SITE.url}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <ContactPageClient />
      </main>
      <Footer />
    </>
  );
}
