"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera, Shield, Zap, Network, Home, Server,
  Building2, Phone, Mail, MapPin, CheckCircle2,
  ArrowRight, ArrowLeft, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import apiClient, { getApiError } from "@/lib/api/client";

const SERVICES_OPTIONS = [
  { id: "videosurveillance", label: "Vidéosurveillance IP", icon: Camera, pole: "faible" },
  { id: "controle-acces", label: "Contrôle d'Accès", icon: Shield, pole: "faible" },
  { id: "securite-perimetrique", label: "Sécurité Périmétrique", icon: Shield, pole: "faible" },
  { id: "monitoring-datacenter", label: "Monitoring Datacenter", icon: Server, pole: "faible" },
  { id: "domotique", label: "Domotique & Smart Building", icon: Home, pole: "faible" },
  { id: "reseaux", label: "Réseaux & Téléphonie IP", icon: Network, pole: "faible" },
  { id: "cablage-electrique", label: "Câblage Électrique", icon: Zap, pole: "fort" },
  { id: "tableaux-electriques", label: "Tableaux TGBT", icon: Zap, pole: "fort" },
  { id: "groupes-electrogenes", label: "Groupes Électrogènes", icon: Zap, pole: "fort" },
  { id: "eclairage-industriel", label: "Éclairage Industriel", icon: Zap, pole: "fort" },
  { id: "formation", label: "Formation Académie", icon: Shield, pole: "academie" },
];

const BUDGETS = [
  "Moins de 500 000 XOF",
  "500 000 – 2 000 000 XOF",
  "2 000 000 – 10 000 000 XOF",
  "Plus de 10 000 000 XOF",
  "À définir selon devis",
];

const DELAIS = [
  "Urgent (moins d'1 semaine)",
  "Court terme (1–4 semaines)",
  "Moyen terme (1–3 mois)",
  "Long terme (plus de 3 mois)",
  "Pas encore défini",
];

const devisSchema = z.object({
  services: z.array(z.string()).min(1, "Sélectionnez au moins un service"),
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone requis"),
  entreprise: z.string().optional(),
  secteur: z.string().optional(),
  adresse: z.string().optional(),
  budget: z.string().optional(),
  delai: z.string().optional(),
  description: z.string().min(20, "Décrivez votre projet (min. 20 caractères)"),
  rgpd: z.literal(true, { errorMap: () => ({ message: "Requis" }) }),
});

type DevisFormData = z.infer<typeof devisSchema>;

const STEPS = [
  { id: 1, label: "Services", icon: Shield },
  { id: 2, label: "Informations", icon: Building2 },
  { id: 3, label: "Projet", icon: MapPin },
  { id: 4, label: "Envoi", icon: Send },
];

export default function DevisPageClient() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors, isSubmitting } } = useForm<DevisFormData>({
    resolver: zodResolver(devisSchema),
    defaultValues: { services: [] },
  });

  const goToStep3 = async () => {
    const valid = await trigger(["nom", "email", "telephone"]);
    if (valid) setStep(3);
  };

  const goToStep4 = async () => {
    const valid = await trigger(["description"]);
    if (valid) setStep(4);
  };

  const toggleService = (id: string) => {
    const updated = selectedServices.includes(id)
      ? selectedServices.filter((s) => s !== id)
      : [...selectedServices, id];
    setSelectedServices(updated);
    setValue("services", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: DevisFormData) => {
    setSubmitError(null);
    try {
      await apiClient.post("/crm/public-devis", {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        entreprise: data.entreprise,
        services: data.services,
        budget: data.budget,
        delai: data.delai,
        description: data.description,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(getApiError(err));
    }
  };

  const canNextStep1 = selectedServices.length > 0;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A1630] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-grey-anthracite dark:text-white mb-4">
            Demande reçue !
          </h1>
          <p className="text-grey-text dark:text-white/60 text-lg mb-2">
            Votre demande de devis a bien été enregistrée.
          </p>
          <p className="text-grey-text dark:text-white/60 mb-8">
            Un ingénieur SYSTIC-CI vous contactera sous{" "}
            <strong className="text-primary">24 heures</strong> pour établir votre devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}>
              <Button variant="accent">
                <Phone className="w-4 h-4" />
                Appeler maintenant
              </Button>
            </a>
            <a href="/">
              <Button variant="outline">Retour à l&apos;accueil</Button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-light dark:bg-[#0A1630]">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-14 md:py-20">
        <div className="container-section text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-extrabold text-4xl md:text-5xl mb-4"
          >
            Demande de devis
          </motion.h1>
          <p className="text-white/70 text-lg">
            Devis gratuit · Réponse sous 24h · Sans engagement
          </p>
        </div>
      </div>

      <div className="container-section py-12">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={cn(
                "flex flex-col items-center gap-1",
                step >= s.id ? "opacity-100" : "opacity-40"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 font-heading font-bold text-sm transition-all",
                  step === s.id
                    ? "border-primary bg-primary text-white"
                    : step > s.id
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border bg-white dark:bg-navy/40 text-grey-text"
                )}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <span className="text-xs font-heading font-semibold text-grey-text dark:text-white/60 hidden sm:block">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 max-w-16 transition-all",
                  step > s.id ? "bg-emerald-500" : "bg-border"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">

              {/* ===== STEP 1 — Services ===== */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <div className="card-base p-8">
                    <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-2">
                      Quels services vous intéressent ?
                    </h2>
                    <p className="text-grey-text dark:text-white/60 mb-6">
                      Sélectionnez un ou plusieurs services. Vous pouvez en choisir autant que nécessaire.
                    </p>

                    {["faible", "fort", "academie"].map((pole) => {
                      const items = SERVICES_OPTIONS.filter((s) => s.pole === pole);
                      const labels: Record<string, string> = {
                        faible: "Courant Faible — Sécurité Électronique & Réseaux",
                        fort: "Courant Fort — Installations Électriques",
                        academie: "Académie SYSTIC-CI — Formation",
                      };
                      return (
                        <div key={pole} className="mb-6">
                          <h3 className={cn(
                            "font-heading font-bold text-sm tracking-wide uppercase mb-3",
                            pole === "fort" ? "text-accent" : "text-primary"
                          )}>
                            {labels[pole]}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.map(({ id, label, icon: Icon }) => {
                              const selected = selectedServices.includes(id);
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => toggleService(id)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                                    selected
                                      ? pole === "fort"
                                        ? "border-accent bg-accent/5 text-accent"
                                        : "border-primary bg-primary/5 text-primary"
                                      : "border-border hover:border-primary/30 text-grey-anthracite dark:text-white/80 hover:bg-grey-light dark:hover:bg-white/5"
                                  )}
                                  aria-pressed={selected}
                                >
                                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                  <span className="font-heading font-semibold text-sm">{label}</span>
                                  {selected && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" aria-hidden="true" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {errors.services && (
                      <p className="text-accent text-sm mt-2" role="alert">{errors.services.message}</p>
                    )}

                    <div className="flex justify-end mt-6">
                      <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={() => canNextStep1 && setStep(2)}
                        disabled={!canNextStep1}
                        className="group"
                      >
                        Continuer ({selectedServices.length} sélectionné{selectedServices.length > 1 ? "s" : ""})
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 2 — Informations ===== */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <div className="card-base p-8">
                    <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-6">
                      Vos informations
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nom" className="form-label">Nom & Prénom *</label>
                        <input id="nom" {...register("nom")} className="form-input" placeholder="Jean Kouassi" />
                        {errors.nom && <p className="text-accent text-xs mt-1">{errors.nom.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input id="email" type="email" {...register("email")} className="form-input" placeholder="jean@entreprise.ci" />
                        {errors.email && <p className="text-accent text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="telephone" className="form-label">Téléphone *</label>
                        <input id="telephone" type="tel" {...register("telephone")} className="form-input" placeholder="07 00 00 00 00" />
                        {errors.telephone && <p className="text-accent text-xs mt-1">{errors.telephone.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="entreprise" className="form-label">Entreprise / Organisation</label>
                        <input id="entreprise" {...register("entreprise")} className="form-input" placeholder="Votre société" />
                      </div>
                      <div>
                        <label htmlFor="secteur" className="form-label">Secteur d&apos;activité</label>
                        <select id="secteur" {...register("secteur")} className="form-input bg-white dark:bg-navy/30">
                          <option value="">Choisir...</option>
                          {["Banque & Finance", "Santé & Clinique", "BTP & Immobilier", "Industrie & Usine", "Administration", "Commerce & Distribution", "Résidentiel", "Autre"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="adresse" className="form-label">Adresse du site</label>
                        <input id="adresse" {...register("adresse")} className="form-input" placeholder="Quartier, Commune, Abidjan" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="w-4 h-4" /> Retour
                      </Button>
                      <Button type="button" variant="default" size="lg" onClick={goToStep3} className="group">
                        Continuer <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 3 — Projet ===== */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <div className="card-base p-8">
                    <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-6">
                      Votre projet
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="description" className="form-label">Description du projet *</label>
                        <textarea
                          id="description"
                          {...register("description")}
                          rows={5}
                          className="form-input resize-none"
                          placeholder="Décrivez votre projet : surface à couvrir, nombre de bâtiments, besoins spécifiques, contraintes techniques..."
                        />
                        {errors.description && <p className="text-accent text-xs mt-1">{errors.description.message}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="budget" className="form-label">Budget estimé</label>
                          <select id="budget" {...register("budget")} className="form-input bg-white dark:bg-navy/30">
                            <option value="">Non défini</option>
                            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="delai" className="form-label">Délai souhaité</label>
                          <select id="delai" {...register("delai")} className="form-input bg-white dark:bg-navy/30">
                            <option value="">Non défini</option>
                            {DELAIS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-4 h-4" /> Retour
                      </Button>
                      <Button type="button" variant="default" size="lg" onClick={goToStep4} className="group">
                        Vérifier & Envoyer <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 4 — Envoi ===== */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <div className="card-base p-8">
                    <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-6">
                      Vérification & envoi
                    </h2>

                    {/* Récap services */}
                    <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="font-heading font-bold text-sm text-primary mb-2">Services sélectionnés</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((id) => {
                          const s = SERVICES_OPTIONS.find(o => o.id === id);
                          return s ? <Badge key={id} variant="outline">{s.label}</Badge> : null;
                        })}
                      </div>
                    </div>

                    {/* RGPD */}
                    <div className="mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("rgpd")}
                          className="mt-0.5 w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm text-grey-text dark:text-white/60">
                          J&apos;accepte que mes données soient utilisées pour traiter ma demande de devis
                          conformément à la politique de confidentialité de SYSTIC-CI. *
                        </span>
                      </label>
                      {errors.rgpd && <p className="text-accent text-xs mt-1 ml-7">{errors.rgpd.message}</p>}
                    </div>

                    {submitError && (
                      <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm" role="alert">
                        {submitError}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(3)}>
                        <ArrowLeft className="w-4 h-4" /> Retour
                      </Button>
                      <Button type="submit" variant="accent" size="lg" loading={isSubmitting}>
                        <Send className="w-4 h-4" />
                        Envoyer ma demande
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* Info banner */}
        <div className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row gap-4 text-sm text-grey-text dark:text-white/50">
          {[
            { icon: Phone, text: SITE.phone[0] },
            { icon: Mail, text: SITE.email },
            { icon: CheckCircle2, text: "Réponse sous 24h garantie" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
