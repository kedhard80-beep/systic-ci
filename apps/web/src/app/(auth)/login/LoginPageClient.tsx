"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Shield, ArrowRight, KeyRound } from "lucide-react";
import { cn, getApiError } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  remember: z.boolean().optional(),
});

const twoFASchema = z.object({
  code: z.string().length(6, "Code à 6 chiffres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type TwoFAForm = z.infer<typeof twoFASchema>;

// Redirection selon le rôle utilisateur
function getRoleRedirect(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'DIRECTION':
    case 'COMMERCIAL':
    case 'FORMATEUR':
      return '/dashboard';
    case 'TECHNICIEN':
      return '/technicien';
    case 'CLIENT':
    case 'PARTENAIRE':
      return '/portail';
    case 'ETUDIANT':
      return '/academie';
    default:
      return '/dashboard';
  }
}

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, verify2FA } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [partialToken, setPartialToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Message si session expirée
  const sessionExpired = searchParams.get('session') === 'expired';

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const twoFAForm = useForm<TwoFAForm>({ resolver: zodResolver(twoFASchema) });

  const onLogin = async (data: LoginForm) => {
    setError(null);
    try {
      const result = await login(data.email, data.password, data.remember);
      if ('twoFARequired' in result && result.twoFARequired) {
        setPartialToken(result.partialToken);
        setStep('2fa');
        return;
      }
      // Redirect selon le rôle
      const user = useAuthStore.getState().user;
      const redirect = searchParams.get('redirect') ?? getRoleRedirect(user?.role ?? '');
      router.push(redirect);
    } catch (err) {
      setError(getApiError(err) || 'Email ou mot de passe incorrect.');
    }
  };

  const on2FA = async (data: TwoFAForm) => {
    setError(null);
    try {
      await verify2FA(data.code, partialToken);
      const user = useAuthStore.getState().user;
      const redirect = searchParams.get('redirect') ?? getRoleRedirect(user?.role ?? '');
      router.push(redirect);
    } catch (err) {
      setError(getApiError(err) || 'Code invalide ou expiré.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      {/* Card */}
      <div className="bg-white dark:bg-[#0D1F4E] rounded-3xl shadow-xl border border-border p-8">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Shield className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white mb-1">
            {step === "login" ? "Connexion" : "Vérification 2FA"}
          </h1>
          <p className="text-sm text-grey-text dark:text-white/50">
            {step === "login"
              ? "Accédez à votre espace SYSTIC-CI"
              : "Entrez le code de votre application d'authentification"}
          </p>
        </div>

        {/* Session expirée */}
        {sessionExpired && !error && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm" role="alert">
            Votre session a expiré. Veuillez vous reconnecter.
          </div>
        )}
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm" role="alert">
            {error}
          </div>
        )}

        {step === "login" ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email-login" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">
                Adresse email
              </label>
              <input
                id="email-login"
                type="email"
                autoComplete="email"
                {...loginForm.register("email")}
                placeholder="votre@email.com"
                className={cn("form-input", loginForm.formState.errors.email && "border-accent")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-accent mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password-login" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-heading font-semibold">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password-login"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                  placeholder="••••••••"
                  className={cn("form-input pr-10", loginForm.formState.errors.password && "border-accent")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-text dark:text-white/40 hover:text-primary"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-accent mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" {...loginForm.register("remember")} className="w-4 h-4 accent-primary" />
              <label htmlFor="remember" className="text-sm text-grey-text dark:text-white/60">Rester connecté</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="btn-primary w-full"
            >
              {loginForm.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Connexion...</>
              ) : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={twoFAForm.handleSubmit(on2FA)} noValidate className="space-y-4">
            <div>
              <label htmlFor="twofa-code" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1.5">
                Code à 6 chiffres
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/30" aria-hidden="true" />
                <input
                  id="twofa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  {...twoFAForm.register("code")}
                  placeholder="000000"
                  className={cn("form-input pl-9 text-center text-2xl tracking-widest font-heading", twoFAForm.formState.errors.code && "border-accent")}
                />
              </div>
              {twoFAForm.formState.errors.code && (
                <p className="text-xs text-accent mt-1">{twoFAForm.formState.errors.code.message}</p>
              )}
            </div>

            <button type="submit" disabled={twoFAForm.formState.isSubmitting} className="btn-primary w-full">
              {twoFAForm.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Vérification...</>
              ) : (
                <>Vérifier <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <button type="button" onClick={() => setStep("login")} className="w-full text-sm text-grey-text dark:text-white/50 hover:text-primary transition-colors">
              ← Retour à la connexion
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-grey-text dark:text-white/30 bg-white dark:bg-[#0D1F4E]">ou</span>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-grey-text dark:text-white/50">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline font-heading font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Security note */}
      <p className="text-center text-xs text-grey-text dark:text-white/30 mt-4 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" aria-hidden="true" />
        Connexion sécurisée SSL/TLS — Données chiffrées
      </p>
    </motion.div>
  );
}
