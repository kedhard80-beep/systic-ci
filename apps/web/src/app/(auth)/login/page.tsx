import { Suspense } from "react";
import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Connexion — SYSTIC-CI",
  description: "Accédez à votre espace client SYSTIC-CI.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}
