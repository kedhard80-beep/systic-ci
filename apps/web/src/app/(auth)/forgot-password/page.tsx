import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Mot de passe oublié — SYSTIC-CI",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
