import type { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = {
  title: "Créer un compte — SYSTIC-CI",
  description: "Créez votre espace client SYSTIC-CI pour suivre vos projets, contrats et interventions.",
  robots: { index: false },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
