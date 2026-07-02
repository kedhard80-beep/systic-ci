import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogPageClient from "./BlogPageClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog — Actualités sécurité électronique | SYSTIC-CI",
  description:
    "Conseils, guides et actualités sur la sécurité électronique, les réseaux et l'électricité en Côte d'Ivoire. Restez informé avec SYSTIC-CI.",
  alternates: { canonical: `${SITE.url}/blog` },
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <BlogPageClient />
      </main>
      <Footer />
    </>
  );
}
