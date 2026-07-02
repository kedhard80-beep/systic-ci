"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Settings, Lightbulb, Power, Activity,
  CheckCircle2, ArrowRight, ChevronRight, Shield, Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    id: "cablage-bt",
    icon: Zap,
    color: "bg-accent",
    title: "Câblage BT/HTA",
    tagline: "Distribution électrique complète",
    description:
      "Conception et réalisation d'installations électriques basse tension (BT) et haute tension A (HTA) pour tous types de bâtiments : immeubles, usines, villas, centres commerciaux.",
    features: [
      "Câblage BT et HTA selon normes NF C 15-100",
      "Colonnes montantes et réseaux de distribution",
      "Chemins de câbles, goulottes et conduits",
      "Mise à la terre et liaisons équipotentielles",
      "Tableaux divisionnaires et sous-répartiteurs",
      "Plans unifilaires et dossiers techniques complets",
    ],
    brands: ["Nexans", "Legrand", "Schneider", "Prysmian"],
    highlight: "Conforme NF C 15-100 & CEI 60364",
  },
  {
    id: "tgbt",
    icon: Settings,
    color: "bg-accent",
    title: "Tableaux TGBT & Armoires",
    tagline: "Le cœur de votre installation",
    description:
      "Étude, fabrication et installation de tableaux généraux basse tension (TGBT), armoires électriques industrielles et tableaux divisionnaires sur mesure.",
    features: [
      "TGBT industriels et tertiaires sur mesure",
      "Armoires de distribution et motorisation",
      "Tableaux de compensation d'énergie réactive",
      "Variateurs de vitesse et démarreurs",
      "Disjoncteurs différentiels, fusibles, relais",
      "Essais et vérifications avant mise en service",
    ],
    brands: ["Schneider Electric", "ABB", "Siemens", "Legrand"],
    highlight: "Jusqu'à 6 000 A — tous calibres",
  },
  {
    id: "groupes-electrogenes",
    icon: Power,
    color: "bg-accent",
    title: "Groupes électrogènes",
    tagline: "Continuité d'alimentation garantie",
    description:
      "Fourniture, installation et maintenance de groupes électrogènes pour la continuité d'alimentation électrique en cas de coupure. Transfert automatique (ATS) inclus.",
    features: [
      "Groupes diesel et gaz de 10 à 2 000 kVA",
      "Armoires ATS (transfert automatique)",
      "Onduleurs (UPS) pour équipements sensibles",
      "Insonorisation et ventilation adaptées",
      "Contrats de maintenance préventive",
      "Télésurveillance à distance en temps réel",
    ],
    brands: ["FG Wilson", "Cummins", "Perkins", "Sdmo"],
    highlight: "Démarrage automatique < 10 secondes",
  },
  {
    id: "eclairage",
    icon: Lightbulb,
    color: "bg-accent",
    title: "Éclairage LED industriel",
    tagline: "Efficacité & économies d'énergie",
    description:
      "Étude et réalisation de projets d'éclairage intérieur et extérieur avec technologies LED dernière génération. Éclairage de sécurité et de secours inclus.",
    features: [
      "Audit et calcul d'éclairement (logiciel DIALux)",
      "Luminaires LED haute efficacité (IP65/IP66)",
      "Gestion technique du bâtiment (GTB)",
      "Éclairage de sécurité (BAES/BAEH)",
      "Variation d'éclairage et détection de présence",
      "Économie d'énergie jusqu'à 70% vs fluorescent",
    ],
    brands: ["Philips Lighting", "Osram", "Trilux", "Disano"],
    highlight: "Retour sur investissement moyen 18 mois",
  },
];

const CERTIFICATIONS = [
  "NF C 15-100 (installations BT)",
  "CEI 60364 (sécurité électrique)",
  "UTE C 15-712 (solaire PV)",
  "ISO 9001 (qualité)",
  "CONSUEL (conformité)",
  "CT-CI (Côte d'Ivoire)",
];

export default function CourantFortClient() {
  const [active, setActive] = useState(SERVICES[0].id);
  const current = SERVICES.find((s) => s.id === active)!;

  return (
    <div className="bg-white dark:bg-[#0A1630]">
      {/* Hero */}
      <div className="bg-gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          aria-hidden="true"
        />
        <div className="container-section relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="section-tag !bg-white/10 !border-white/20 !text-white">Nos Métiers</span>
              <ChevronRight className="w-4 h-4 text-white/40" />
              <span className="text-white/60 text-sm font-heading">Courant Fort</span>
            </div>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white leading-tight mb-4">
              Courant Fort
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mb-8">
              Électricité industrielle et tertiaire. Du câblage BT/HTA aux groupes électrogènes en passant par les tableaux TGBT et l&apos;éclairage LED.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/devis">
                <button className="btn-accent">
                  Demander un devis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-glass">Nous contacter</button>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Zap, value: "4", label: "Spécialités" },
              { icon: Clock, value: "7j/7", label: "Disponible" },
              { icon: Activity, value: "6000A", label: "Calibre max" },
              { icon: Shield, value: "NF/CEI", label: "Certifications" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass-dark rounded-xl p-4 text-center border border-white/10">
                <Icon className="w-5 h-5 text-white/40 mx-auto mb-2" aria-hidden="true" />
                <div className="font-heading font-extrabold text-2xl text-white">{value}</div>
                <div className="text-xs text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services explorer */}
      <section className="section-padding" aria-labelledby="cf-services-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Nos prestations</span>
            <h2 id="cf-services-heading" className="section-heading">4 pôles d'excellence</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all",
                    active === s.id
                      ? "bg-accent text-white shadow-lg"
                      : "bg-grey-light dark:bg-white/5 text-grey-anthracite dark:text-white hover:bg-accent/10"
                  )}
                  aria-pressed={active === s.id}
                >
                  <div className={cn("p-2 rounded-xl flex-shrink-0", active === s.id ? "bg-white/20" : s.color)}>
                    <s.icon className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <div className={cn("font-heading font-bold text-sm", active !== s.id && "text-grey-anthracite dark:text-white")}>{s.title}</div>
                    <div className={cn("text-xs", active === s.id ? "text-white/70" : "text-grey-text dark:text-white/50")}>{s.tagline}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="card-base p-8 h-full"
                >
                  <div className={`inline-flex p-3 rounded-2xl ${current.color} mb-5`}>
                    <current.icon className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-2">{current.title}</h3>
                  <p className="text-grey-text dark:text-white/60 mb-6 leading-relaxed">{current.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {current.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-sm text-grey-text dark:text-white/70">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-5">
                    <div>
                      <div className="text-xs text-grey-text dark:text-white/40 mb-1">Marques partenaires</div>
                      <div className="flex flex-wrap gap-2">
                        {current.brands.map((b) => (
                          <span key={b} className="text-xs font-heading font-bold px-2 py-1 rounded-lg bg-grey-light dark:bg-white/10 text-grey-anthracite dark:text-white">{b}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-accent font-heading font-bold">{current.highlight}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section-padding bg-grey-light dark:bg-navy/30" aria-labelledby="certif-heading">
        <div className="container-section">
          <div className="text-center mb-10">
            <span className="section-tag mb-4">Conformité & qualité</span>
            <h2 id="certif-heading" className="section-heading">Certifications & normes</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CERTIFICATIONS.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl card-base"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="font-heading font-bold text-sm text-grey-anthracite dark:text-white">{c}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-hero text-white" aria-label="Appel à l'action courant fort">
        <div className="container-section text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Un projet d&apos;installation électrique ?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Nos ingénieurs en génie électrique vous accompagnent de la conception à la mise en service, en conformité avec les normes en vigueur.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/devis">
                <button className="btn-accent">
                  Devis gratuit <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/metiers/courant-faible">
                <button className="btn-glass">Voir Courant Faible</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
