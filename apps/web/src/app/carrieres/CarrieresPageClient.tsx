"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin, Clock, Briefcase, Users, ArrowRight, Heart,
  CheckCircle2, Send, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OFFERS = [
  {
    id: "tech-videosurveillance",
    title: "Technicien Vidéosurveillance",
    type: "CDI",
    location: "Abidjan (terrain)",
    department: "Courant Faible",
    description: "Installation, paramétrage et maintenance de systèmes de vidéosurveillance IP (Hikvision, Dahua) chez nos clients entreprises et administrations.",
    requirements: [
      "Formation en électronique ou sécurité électronique",
      "Maîtrise des caméras IP et NVR/DVR",
      "Connaissance câblage réseau (RJ45, PoE)",
      "Permis B apprécié",
      "2+ ans d'expérience souhaitée",
    ],
    bonus: "Formation SYSTIC Academy incluse",
  },
  {
    id: "ingenieur-reseau",
    title: "Ingénieur Réseaux & ToIP",
    type: "CDI",
    location: "Abidjan",
    department: "Courant Faible",
    description: "Conception, déploiement et maintenance d'infrastructures réseau d'entreprise : câblage structuré, switches managés, Wi-Fi, IPBX.",
    requirements: [
      "Licence/Master en informatique réseaux",
      "Certifications Cisco CCNA/CCNP appréciées",
      "Maîtrise switching/routing, VLANs, VPN",
      "Expérience téléphonie IP (Asterisk, 3CX)",
      "3+ ans d'expérience",
    ],
    bonus: "Pack expatrié si relocalisé",
  },
  {
    id: "electricien-bt",
    title: "Électricien BT/HTA Senior",
    type: "CDI",
    location: "Abidjan (terrain)",
    department: "Courant Fort",
    description: "Réalisation d'installations électriques basse et haute tension pour chantiers industriels et tertiaires. Lecture de plans, câblage, tableaux TGBT.",
    requirements: [
      "BTS Électrotechnique ou équivalent",
      "Habilitation B2/BR/BC obligatoire",
      "Expérience TGBT et armoires industrielles",
      "Connaissance normes NF C 15-100",
      "5+ ans d'expérience terrain",
    ],
    bonus: "Prime chantier + véhicule de service",
  },
  {
    id: "formateur-securite",
    title: "Formateur — Sécurité électronique",
    type: "Temps partiel / Vacataire",
    location: "Abidjan (Académie)",
    department: "Académie",
    description: "Animation de modules de formation pratique en vidéosurveillance, contrôle d'accès et réseaux pour notre Académie SYSTIC-CI.",
    requirements: [
      "5+ ans d'expérience terrain en sécurité électronique",
      "Expérience pédagogique appréciée",
      "Maîtrise des équipements Hikvision, ZKTeco, Cisco",
      "Capacité à animer des groupes de 10-15 apprenants",
    ],
    bonus: "Rémunération à la session — très attractif",
  },
  {
    id: "commercial-b2b",
    title: "Commercial B2B — Solutions sécurité",
    type: "CDI",
    location: "Abidjan",
    department: "Commercial",
    description: "Développement du portefeuille client (entreprises, banques, administrations). Prospection, devis, négociation et suivi des contrats.",
    requirements: [
      "BTS/Licence Commerce ou technique",
      "Expérience vente BtoB en sécurité ou IT",
      "Carnet d'adresses entreprises ivoiriennes apprécié",
      "Maîtrise Excel, CRM",
      "Bon sens de la négociation",
    ],
    bonus: "Variable attractif + commissions sur CA",
  },
];

const VALUES = [
  { icon: Heart, title: "Passion & expertise", desc: "Nous recrutons des personnes passionnées par la technologie, pas seulement des diplômes." },
  { icon: Users, title: "Équipe soudée", desc: "Une culture de collaboration où chaque voix compte, des juniors aux seniors." },
  { icon: CheckCircle2, title: "Formation continue", desc: "Budget formation annuel + accès gratuit à l'Académie SYSTIC-CI pour tous." },
  { icon: Briefcase, title: "Progression rapide", desc: "Une startup qui grandit vite — les opportunités d'évolution sont réelles." },
];

const candidatureSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone requis"),
  poste: z.string().min(1, "Sélectionnez un poste"),
  motivation: z.string().min(50, "Minimum 50 caractères"),
  cv: z.any().optional(),
  rgpd: z.literal(true, { errorMap: () => ({ message: "Consentement requis" }) }),
});

type CandidatureForm = z.infer<typeof candidatureSchema>;

export default function CarrieresPageClient() {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CandidatureForm>({
    resolver: zodResolver(candidatureSchema),
  });

  const onSubmit = async (data: CandidatureForm) => {
    await new Promise((r) => setTimeout(r, 1200));
    console.log("Candidature:", data);
    setSubmitted(true);
  };

  return (
    <div className="bg-white dark:bg-[#0A1630] min-h-screen">

      {/* Hero */}
      <div className="bg-gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          aria-hidden="true"
        />
        <div className="container-section relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-heading font-semibold mb-6">
              <Users className="w-4 h-4" aria-hidden="true" /> Rejoignez SYSTIC-CI
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white mb-4">
              Construisez la sécurité de demain
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
              SYSTIC-CI recrute des techniciens, ingénieurs et commerciaux passionnés. Travaillez sur des projets d&apos;envergure en Côte d&apos;Ivoire et participez à notre mission.
            </p>
            <a href="#offres">
              <button className="btn-accent">
                Voir les postes ouverts <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Valeurs */}
      <section className="section-padding" aria-labelledby="valeurs-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Pourquoi nous rejoindre ?</span>
            <h2 id="valeurs-heading" className="section-heading">Une culture qui fait la différence</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-base p-6 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-base text-grey-anthracite dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offres */}
      <section id="offres" className="section-padding bg-grey-light dark:bg-navy/30" aria-labelledby="offres-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">{OFFERS.length} postes ouverts</span>
            <h2 id="offres-heading" className="section-heading">Nos offres d&apos;emploi</h2>
          </div>
          <div className="space-y-4">
            {OFFERS.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card-base p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-heading font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{offer.department}</span>
                      <span className="flex items-center gap-1 text-xs text-grey-text dark:text-white/50">
                        <MapPin className="w-3 h-3" aria-hidden="true" /> {offer.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-grey-text dark:text-white/50">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {offer.type}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-grey-anthracite dark:text-white mb-2">{offer.title}</h3>
                    <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed">{offer.description}</p>

                    {selectedOffer === offer.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-4"
                      >
                        <h4 className="font-heading font-semibold text-sm text-grey-anthracite dark:text-white mb-2">Profil recherché</h4>
                        <ul className="space-y-1 mb-3">
                          {offer.requirements.map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm text-grey-text dark:text-white/70">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                              {r}
                            </li>
                          ))}
                        </ul>
                        <span className="inline-flex items-center gap-1 text-xs font-heading font-bold px-3 py-1 rounded-full bg-accent/10 text-accent">
                          ✦ {offer.bonus}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 md:items-end flex-shrink-0">
                    <button
                      onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all",
                        selectedOffer === offer.id
                          ? "bg-primary/10 text-primary"
                          : "bg-grey-light dark:bg-white/10 text-grey-anthracite dark:text-white hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {selectedOffer === offer.id ? "Fermer ↑" : "Voir le détail →"}
                    </button>
                    <a href="#postuler" onClick={() => setValue("poste", offer.title)}>
                      <button className="btn-primary text-sm">
                        Postuler <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form candidature */}
      <section id="postuler" className="section-padding" aria-labelledby="postuler-heading">
        <div className="container-section max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Candidature spontanée</span>
            <h2 id="postuler-heading" className="section-heading">Postuler</h2>
            <p className="section-sub mx-auto">Envoyez votre candidature, nous répondons sous 48h ouvrables.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-base p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-2">Candidature reçue !</h3>
              <p className="text-grey-text dark:text-white/60">Notre équipe RH vous contactera sous 48h ouvrables. Merci de votre intérêt pour SYSTIC-CI.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card-base p-8 space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nom" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-2">Nom complet *</label>
                  <input id="nom" {...register("nom")} placeholder="Jean Dupont" className={cn("form-input", errors.nom && "border-accent")} />
                  {errors.nom && <p className="text-xs text-accent mt-1">{errors.nom.message}</p>}
                </div>
                <div>
                  <label htmlFor="email-carriere" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-2">Email *</label>
                  <input id="email-carriere" type="email" {...register("email")} placeholder="jean@example.com" className={cn("form-input", errors.email && "border-accent")} />
                  {errors.email && <p className="text-xs text-accent mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="telephone-carriere" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-2">Téléphone *</label>
                  <input id="telephone-carriere" {...register("telephone")} placeholder="+225 07 XX XX XX XX" className={cn("form-input", errors.telephone && "border-accent")} />
                  {errors.telephone && <p className="text-xs text-accent mt-1">{errors.telephone.message}</p>}
                </div>
                <div>
                  <label htmlFor="poste" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-2">Poste visé *</label>
                  <select id="poste" {...register("poste")} className={cn("form-input", errors.poste && "border-accent")}>
                    <option value="">Sélectionner un poste</option>
                    {OFFERS.map((o) => <option key={o.id} value={o.title}>{o.title}</option>)}
                    <option value="Candidature spontanée">Candidature spontanée</option>
                  </select>
                  {errors.poste && <p className="text-xs text-accent mt-1">{errors.poste.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-2">Lettre de motivation *</label>
                <textarea
                  id="motivation"
                  {...register("motivation")}
                  rows={5}
                  placeholder="Parlez-nous de votre parcours, vos compétences et pourquoi vous souhaitez rejoindre SYSTIC-CI..."
                  className={cn("form-input resize-none", errors.motivation && "border-accent")}
                />
                {errors.motivation && <p className="text-xs text-accent mt-1">{errors.motivation.message}</p>}
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="rgpd-carriere"
                  type="checkbox"
                  {...register("rgpd")}
                  className="w-4 h-4 mt-1 accent-primary"
                />
                <label htmlFor="rgpd-carriere" className="text-sm text-grey-text dark:text-white/60">
                  J&apos;accepte que mes données personnelles soient traitées par SYSTIC-CI dans le cadre de ma candidature, conformément à la politique RGPD. *
                </label>
              </div>
              {errors.rgpd && <p className="text-xs text-accent">{errors.rgpd.message}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Envoi en cours...</>
                ) : (
                  <><Send className="w-4 h-4" aria-hidden="true" /> Envoyer ma candidature</>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
