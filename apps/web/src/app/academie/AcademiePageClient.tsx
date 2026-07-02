"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Fingerprint, Network, Zap, Cpu, BookOpen,
  CheckCircle2, ArrowRight, Award, Users, Clock, Star,
  Play, Download, BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    id: "m1",
    code: "M1",
    icon: Camera,
    color: "bg-primary",
    title: "Vidéosurveillance & CCTV",
    duration: "4 semaines",
    level: "Débutant → Avancé",
    price: "Sur devis",
    description:
      "Maîtrisez la conception et le déploiement de systèmes de vidéosurveillance IP. Caméras analogiques, IP, dôme, PTZ, NVR/DVR, accès à distance.",
    skills: [
      "Choix et dimensionnement des caméras",
      "Installation câblage et PoE",
      "Configuration NVR/DVR (Hikvision, Dahua)",
      "Accès à distance et cloud",
      "Maintenance préventive",
    ],
    outcomes: "Technicien vidéosurveillance certifié",
  },
  {
    id: "m2",
    code: "M2",
    icon: Fingerprint,
    color: "bg-accent",
    title: "Contrôle d'accès & biométrie",
    duration: "3 semaines",
    level: "Intermédiaire",
    price: "Sur devis",
    description:
      "Installez et configurez des systèmes de contrôle d'accès modernes : lecteurs RFID, biométriques, interphonie vidéo, gestion des habilitations.",
    skills: [
      "Lecteurs biométriques (ZKTeco, Suprema, HID)",
      "Câblage RS485 & TCP/IP",
      "Logiciels de gestion des accès",
      "Intégration interphonie vidéo",
      "Configuration des profils et horaires",
    ],
    outcomes: "Technicien contrôle d'accès certifié",
  },
  {
    id: "m3",
    code: "M3",
    icon: Network,
    color: "bg-primary",
    title: "Réseaux informatiques",
    duration: "5 semaines",
    level: "Débutant → Avancé",
    price: "Sur devis",
    description:
      "Concevez et déployez des réseaux d'entreprise : câblage structuré, switches, routeurs, Wi-Fi, VPN. Préparation aux certifications Cisco / CompTIA Network+.",
    skills: [
      "Câblage Cat6/Fibre optique certifié Fluke",
      "Switches managés (Cisco/Ubiquiti)",
      "Configuration VLANs, routage, NAT",
      "Wi-Fi professionnel UniFi",
      "Sécurité réseau et VPN",
    ],
    outcomes: "Technicien réseau certifié",
  },
  {
    id: "m4",
    code: "M4",
    icon: Zap,
    color: "bg-accent",
    title: "Électricité basse tension",
    duration: "4 semaines",
    level: "Débutant → Intermédiaire",
    price: "Sur devis",
    description:
      "Réalisez des installations électriques BT conformes aux normes NF C 15-100. Tableaux divisionnaires, prises, luminaires, protection différentielle.",
    skills: [
      "Lecture de plans et schémas unifilaires",
      "Câblage HO7V-U/R/K et alimentation",
      "Tableaux divisionnaires et disjoncteurs",
      "Mise à la terre et liaisons équipotentielles",
      "Contrôle et réception CONSUEL",
    ],
    outcomes: "Électricien BT habilité B1/B2",
  },
  {
    id: "m5",
    code: "M5",
    icon: Cpu,
    color: "bg-primary",
    title: "Domotique & Smart Building",
    duration: "3 semaines",
    level: "Intermédiaire",
    price: "Sur devis",
    description:
      "Programmez des systèmes domotiques et smart building : éclairage connecté, volets, climatisation, KNX, Zigbee, intégration assistant vocal.",
    skills: [
      "Protocoles KNX, Z-Wave, Zigbee",
      "Programmation ETS (KNX)",
      "Intégration Legrand/Schneider/Somfy",
      "Configuration tableaux de bord (Home Assistant)",
      "Diagnostic et dépannage",
    ],
    outcomes: "Technicien domotique certifié",
  },
  {
    id: "m6",
    code: "M6",
    icon: BookOpen,
    color: "bg-accent",
    title: "Alarme & détection incendie",
    duration: "3 semaines",
    level: "Intermédiaire",
    price: "Sur devis",
    description:
      "Installez des systèmes d'alarme anti-intrusion et de détection incendie (SSI/SMSI). Centrales, détecteurs, sirènes, report d'alarme.",
    skills: [
      "Systèmes anti-intrusion (DSC, Paradox, Ajax)",
      "Détection incendie (SSI type 1 à 4)",
      "Câblage et raccordement des détecteurs",
      "Paramétrage des centrales et zones",
      "Maintenance et tests annuels",
    ],
    outcomes: "Technicien alarme & SSI certifié",
  },
];

const PERKS = [
  { icon: Award, title: "Certificat officiel", desc: "Délivré à la validation de l'examen final" },
  { icon: Users, title: "Pool techniciens", desc: "Les meilleurs profils rejoignent notre équipe" },
  { icon: Clock, title: "Horaires flexibles", desc: "Sessions semaine et week-end disponibles" },
  { icon: Star, title: "90% de pratique", desc: "Atelier équipé en matériel réel" },
  { icon: Play, title: "Vidéos & cours", desc: "Accès aux supports de cours en ligne" },
  { icon: Download, title: "Ressources PDF", desc: "Documentation technique téléchargeable" },
  { icon: BadgeCheck, title: "Formateurs certifiés", desc: "Ingénieurs terrain + formateurs diplômés" },
  { icon: Zap, title: "Offre d'emploi", desc: "Contrat 6 mois pour les meilleurs profils" },
];

export default function AcademiePageClient() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const current = MODULES.find((m) => m.id === activeModule);

  return (
    <div className="bg-white dark:bg-[#0A1630]">

      {/* Hero */}
      <div className="bg-gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          aria-hidden="true"
        />
        <div className="container-section relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-heading font-semibold mb-6">
              <Award className="w-4 h-4 text-accent" aria-hidden="true" />
              Académie SYSTIC-CI — Formations certifiantes
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white leading-tight mb-4">
              Devenez technicien{" "}
              <span className="text-accent">certifié</span>
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
              6 modules de formation en sécurité électronique et électricité. 90% de pratique en atelier réel. Les meilleurs profils rejoignent directement l&apos;équipe SYSTIC-CI.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="#modules">
                <button className="btn-accent">
                  Voir les modules <ArrowRight className="w-4 h-4" />
                </button>
              </a>
              <Link href="/contact">
                <button className="btn-glass">S&apos;inscrire</button>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-3xl mx-auto">
            {[
              { value: "6", label: "Modules certifiants" },
              { value: "90%", label: "Pratique en atelier" },
              { value: "3-5", label: "Semaines/module" },
              { value: "100%", label: "Débouchés garantis" },
            ].map(({ value, label }) => (
              <div key={label} className="glass-dark rounded-xl p-4 text-center border border-white/10">
                <div className="font-heading font-extrabold text-2xl text-white">{value}</div>
                <div className="text-xs text-white/50 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <section id="modules" className="section-padding" aria-labelledby="modules-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Catalogue</span>
            <h2 id="modules-heading" className="section-heading">Nos 6 modules de formation</h2>
            <p className="section-sub mx-auto">Cliquez sur un module pour voir le détail du programme.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <button
                  onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                  className={cn(
                    "w-full text-left card-base p-6 transition-all hover:-translate-y-1",
                    activeModule === mod.id && "ring-2 ring-primary"
                  )}
                  aria-expanded={activeModule === mod.id}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${mod.color} p-3 rounded-2xl`}>
                      <mod.icon className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="font-heading font-extrabold text-xs text-grey-text dark:text-white/30">{mod.code}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-grey-anthracite dark:text-white mb-2">{mod.title}</h3>
                  <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed mb-4">{mod.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-xs text-grey-text dark:text-white/40">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {mod.duration}
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs font-heading font-bold transition-colors",
                      activeModule === mod.id ? "text-primary" : "text-grey-text dark:text-white/40"
                    )}>
                      {activeModule === mod.id ? "Fermer ↑" : "Voir le programme →"}
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {activeModule === mod.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="card-base p-6 mt-2 border-t-2 border-primary">
                        <h4 className="font-heading font-bold text-sm text-grey-anthracite dark:text-white mb-3">Compétences acquises</h4>
                        <ul className="space-y-2 mb-4">
                          {mod.skills.map((s) => (
                            <li key={s} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="text-sm text-grey-text dark:text-white/70">{s}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <div>
                            <div className="text-xs text-grey-text dark:text-white/40">Niveau</div>
                            <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white">{mod.level}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-primary font-heading font-bold">{mod.outcomes}</div>
                          </div>
                        </div>
                        <Link href="/contact">
                          <button className="btn-primary w-full mt-4 text-sm">
                            S&apos;inscrire à ce module <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="section-padding bg-grey-light dark:bg-navy/30" aria-labelledby="avantages-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Pourquoi nous choisir ?</span>
            <h2 id="avantages-heading" className="section-heading">8 raisons de se former chez SYSTIC-CI</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card-base p-5 text-center"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <perk.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="font-heading font-bold text-sm text-grey-anthracite dark:text-white mb-1">{perk.title}</div>
                <div className="text-xs text-grey-text dark:text-white/50">{perk.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Career path */}
      <section className="section-padding" aria-labelledby="career-heading">
        <div className="container-section max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Débouchés</span>
            <h2 id="career-heading" className="section-heading">Votre parcours après la formation</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "1", title: "Formation intensive", desc: "3 à 5 semaines avec 90% de pratique en atelier réel équipé.", color: "bg-primary" },
              { step: "2", title: "Évaluation & certification", desc: "Quiz de validation + examen pratique devant jury. Certificat SYSTIC-CI délivré.", color: "bg-primary" },
              { step: "3", title: "Sélection des meilleurs profils", desc: "Les 30% meilleurs de chaque promotion sont sélectionnés pour rejoindre notre pool.", color: "bg-accent" },
              { step: "4", title: "Contrat de sous-traitance rémunéré", desc: "6 mois renouvelables avec nos équipes terrain. Rémunération à la mission.", color: "bg-accent" },
              { step: "5", title: "Évolution de carrière", desc: "Technicien senior, chef d'équipe, formateur ou création de votre propre entreprise.", color: "bg-primary" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-heading font-bold text-sm`}>{item.step}</div>
                <div className="card-base p-4 flex-1">
                  <div className="font-heading font-bold text-grey-anthracite dark:text-white mb-1">{item.title}</div>
                  <div className="text-sm text-grey-text dark:text-white/60">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-hero text-white" aria-label="Inscription académie">
        <div className="container-section text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Award className="w-12 h-12 text-accent mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Lancez votre carrière dans la tech
            </h2>
            <p className="text-white/70 text-lg max-w-lg mx-auto mb-8">
              Les prochaines sessions sont ouvertes. Places limitées par promotion.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/contact">
                <button className="btn-accent">
                  S&apos;inscrire maintenant <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/devis">
                <button className="btn-glass">Formation en entreprise</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
