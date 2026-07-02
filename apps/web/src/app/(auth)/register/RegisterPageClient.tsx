"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, UserPlus, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  prenom: z.string().min(2, "Prénom requis"),
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone requis"),
  entreprise: z.string().optional(),
  password: z.string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  confirmPassword: z.string(),
  rgpd: z.literal(true, { errorMap: () => ({ message: "Consentement requis" }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (v: string) => v.length >= 8 },
  { label: "Une majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Un chiffre", test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPageClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterForm) => {
    await new Promise((r) => setTimeout(r, 1200));
    console.log("Register:", data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-[#0D1F4E] rounded-3xl shadow-xl border border-border p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-2">Compte créé !</h2>
          <p className="text-grey-text dark:text-white/60 mb-6">Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception.</p>
          <Link href="/login">
            <button className="btn-primary w-full">Se connecter <ArrowRight className="w-4 h-4" /></button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
      <div className="bg-white dark:bg-[#0D1F4E] rounded-3xl shadow-xl border border-border p-8">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <UserPlus className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white mb-1">Créer un compte</h1>
          <p className="text-sm text-grey-text dark:text-white/50">Espace Client SYSTIC-CI</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prenom" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Prénom *</label>
              <input id="prenom" {...register("prenom")} placeholder="Jean" className={cn("form-input", errors.prenom && "border-accent")} />
              {errors.prenom && <p className="text-xs text-accent mt-1">{errors.prenom.message}</p>}
            </div>
            <div>
              <label htmlFor="nom-register" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Nom *</label>
              <input id="nom-register" {...register("nom")} placeholder="Dupont" className={cn("form-input", errors.nom && "border-accent")} />
              {errors.nom && <p className="text-xs text-accent mt-1">{errors.nom.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email-register" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Email *</label>
            <input id="email-register" type="email" {...register("email")} placeholder="jean@entreprise.com" className={cn("form-input", errors.email && "border-accent")} />
            {errors.email && <p className="text-xs text-accent mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="telephone-register" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Téléphone *</label>
              <input id="telephone-register" {...register("telephone")} placeholder="+225 07 XX XX XX" className={cn("form-input", errors.telephone && "border-accent")} />
              {errors.telephone && <p className="text-xs text-accent mt-1">{errors.telephone.message}</p>}
            </div>
            <div>
              <label htmlFor="entreprise-register" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Entreprise</label>
              <input id="entreprise-register" {...register("entreprise")} placeholder="Ma Société SARL" className="form-input" />
            </div>
          </div>

          <div>
            <label htmlFor="password-register" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Mot de passe *</label>
            <div className="relative">
              <input
                id="password-register"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className={cn("form-input pr-10", errors.password && "border-accent")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-text dark:text-white/40" aria-label={showPassword ? "Masquer" : "Afficher"}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password rules */}
            <div className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const ok = passwordValue ? rule.test(passwordValue) : false;
                return (
                  <div key={rule.label} className={cn("flex items-center gap-1.5 text-xs", ok ? "text-emerald-500" : "text-grey-text dark:text-white/40")}>
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    {rule.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">Confirmer le mot de passe *</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="••••••••"
                className={cn("form-input pr-10", errors.confirmPassword && "border-accent")}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-text dark:text-white/40" aria-label={showConfirm ? "Masquer" : "Afficher"}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-accent mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-start gap-3">
            <input id="rgpd-register" type="checkbox" {...register("rgpd")} className="w-4 h-4 mt-0.5 accent-primary" />
            <label htmlFor="rgpd-register" className="text-xs text-grey-text dark:text-white/60">
              J&apos;accepte les <Link href="/privacy" className="text-primary hover:underline">conditions d&apos;utilisation</Link> et la politique de confidentialité de SYSTIC-CI. *
            </label>
          </div>
          {errors.rgpd && <p className="text-xs text-accent">{errors.rgpd.message}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Création...</>
            ) : (
              <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-grey-text dark:text-white/50 mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline font-heading font-semibold">Se connecter</Link>
        </p>
      </div>
      <p className="text-center text-xs text-grey-text dark:text-white/30 mt-4 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" aria-hidden="true" /> Connexion sécurisée SSL/TLS
      </p>
    </motion.div>
  );
}
