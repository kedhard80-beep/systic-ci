"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, ArrowRight, CheckCircle2, ArrowLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordClient() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const email = watch("email", "");

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0D1F4E] rounded-3xl shadow-xl border border-border p-8">

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white mb-1">Mot de passe oublié</h1>
              <p className="text-sm text-grey-text dark:text-white/50">
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label htmlFor="email-forgot" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">
                  Adresse email
                </label>
                <input
                  id="email-forgot"
                  type="email"
                  {...register("email")}
                  placeholder="votre@email.com"
                  className={cn("form-input", errors.email && "border-accent")}
                />
                {errors.email && <p className="text-xs text-accent mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Envoi...</>
                ) : (
                  <>Envoyer le lien <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-2">Email envoyé !</h2>
            <p className="text-sm text-grey-text dark:text-white/60 mb-1">
              Un lien de réinitialisation a été envoyé à
            </p>
            <p className="text-sm font-heading font-semibold text-primary mb-6">{email}</p>
            <p className="text-xs text-grey-text dark:text-white/40 mb-6">
              Vérifiez votre boîte de réception et vos spams. Le lien expire dans 1 heure.
            </p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border text-center">
          <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-grey-text dark:text-white/50 hover:text-primary transition-colors font-heading font-semibold">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Retour à la connexion
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-grey-text dark:text-white/30 mt-4 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" aria-hidden="true" /> Connexion sécurisée SSL/TLS
      </p>
    </motion.div>
  );
}
