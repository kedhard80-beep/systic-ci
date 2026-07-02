"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield, Target, Users, Award, MapPin,
  CheckCircle2, ArrowRight, Zap, Clock, Star,
} from "lucide-react";
import Link from "next/link";

const VALEURS = [
  {
    icon: Shield,
    title: "Fiabilité",
    description:
      "Nous tenons nos engagements. Chaque installation est réalisée dans les délais convenus, avec les équipements de qualité certifiés.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Target,
    title: "Excellence technique",
    description:
      "Nos ingénieurs sont formés en continu aux dernières technologies. Nous ne proposons que des solutions éprouvées sur le terrain.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Proximité client",
    description:
      "Équipes terrain disponibles 7j/7. Un interlocuteur dédié pour chaque projet, de la conception à la maintenance.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Award,
    title: "Formation & transfert",
    description:
      "Notre Académie forme la prochaine génération de techniciens ivoiriens. Nous croyons au développement local du capital humain.",
    color: "bg-accent/10 text-accent",
  },
];

const EXPERTISE = [
  "Vidéosurveillance IP longue distance",
  "Contrôle d'accès biométrique",
  "Sécurité périmétrique HT",
  "Monitoring environnemental datacenter",
  "Domotique & Smart Building",
  "Réseaux LAN/VLAN & Téléphonie IP",
  "Câblage électrique HTA/BT",
  "Tableaux TGBT & Armoires",
  "Groupes électrogènes",
  "Éclairage LED industriel",
];

const SECTEURS_CLIENTS = [
  "Banques & Institutions financières",
  "Cliniques & Hôpitaux",
  "Stations-service & Distributeurs",
  "Usines & Sites industriels",
  "Promoteurs immobiliers & BTP",
  "Administrations & Gouvernement",
  "Entreprises & PME",
  "Résidences privées",
];

export default function EntreprisePageClient() {
  return (
    <div className="bg-white dark:bg-[#0A1630]">

      {/* ===== HERO ===== */}
      <section className="bg-gradient-hero text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} aria-hidden="true" />
        <div className="container-section relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-heading font-semibold mb-6">
              À propos de SYSTIC-CI
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white leading-tight mb-6">
              Systèmes Technologiques &<br />
              <span className="text-accent">Intégration de Confiance</span>
            </h1>
            <p className="text-white/70 text-xl leading-relaxed mb-8 max-w-2xl">
              Entreprise ivoirienne spécialisée en ingénierie et intégration technologique.
              Depuis notre création, nous protégeons les entreprises, administrations et
              résidences d&apos;Abidjan et de toute la Côte d&apos;Ivoire.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <button className="btn-accent">
                  Nous contacter
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/realisations">
                <button className="btn-glass">
                  Voir nos réalisations
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== IDENTITÉ ===== */}
      <section className="section-padding" aria-labelledby="identite-heading">
        <div className="container-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-tag mb-4">Notre mission</span>
              <h2 id="identite-heading" className="section-heading mb-6">
                Sécuriser et connecter{" "}
                <span className="text-gradient-blue">l&apos;Afrique moderne</span>
              </h2>
              <p className="text-grey-text dark:text-white/60 text-lg leading-relaxed mb-6">
                SYSTIC-CI est née d&apos;une conviction : les entreprises et institutions
                ivoiriennes méritent des solutions de sécurité électronique et d&apos;infrastructure
                électrique au niveau des meilleurs standards internationaux, déployées et
                maintenues par des équipes locales compétentes.
              </p>
              <p className="text-grey-text dark:text-white/60 text-lg leading-relaxed mb-8">
                Nous intervenons sur deux pôles complémentaires — le{" "}
                <strong className="text-primary">courant faible</strong> (sécurité électronique,
                réseaux, domotique) et le{" "}
                <strong className="text-accent">courant fort</strong> (installations électriques,
                TGBT, groupes électrogènes) — avec des équipes certifiées disponibles{" "}
                <strong>7 jours sur 7</strong>.
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: MapPin, text: "Angré GESTOCI, Abidjan" },
                  { icon: Clock, text: "Terrain 7j/7 · 07h–23h" },
                  { icon: Star, text: "Formateurs certifiés" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-grey-light dark:bg-white/10 text-sm font-heading font-semibold text-grey-anthracite dark:text-white">
                    <Icon className="w-4 h-4 text-primary" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: "500+", label: "Projets réalisés", icon: Shield, color: "bg-primary" },
                { value: "7j/7", label: "Disponibilité terrain", icon: Clock, color: "bg-accent" },
                { value: "10+", label: "Domaines d'expertise", icon: Award, color: "bg-primary" },
                { value: "8", label: "Secteurs couverts", icon: Users, color: "bg-accent" },
              ].map(({ value, label, icon: Icon, color }) => (
                <div key={label} className="card-base p-6 text-center">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="font-heading font-extrabold text-3xl text-grey-anthracite dark:text-white mb-1">
                    {value}
                  </div>
                  <div className="text-sm text-grey-text dark:text-white/50">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== VALEURS ===== */}
      <section className="section-padding bg-grey-light dark:bg-navy/30" aria-labelledby="valeurs-heading">
        <div className="container-section">
          <div className="text-center mb-16">
            <span className="section-tag mb-4">Nos valeurs</span>
            <h2 id="valeurs-heading" className="section-heading mb-4">
              Ce qui nous distingue
            </h2>
            <p className="section-sub mx-auto">
              Quatre principes fondamentaux qui guident chaque décision, chaque projet,
              chaque relation client.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALEURS.map((valeur, i) => (
              <motion.div
                key={valeur.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-base p-8 group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl ${valeur.color} flex items-center justify-center mb-5`}>
                  <valeur.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-xl text-grey-anthracite dark:text-white mb-3">
                  {valeur.title}
                </h3>
                <p className="text-grey-text dark:text-white/60 leading-relaxed">
                  {valeur.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXPERTISE ===== */}
      <section className="section-padding" aria-labelledby="expertise-heading">
        <div className="container-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <span className="section-tag mb-4">Nos expertises</span>
              <h2 id="expertise-heading" className="section-heading mb-6">
                10 domaines de compétences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERTISE.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-sm text-grey-text dark:text-white/70"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <span className="section-tag mb-4">Nos secteurs clients</span>
              <h2 className="section-heading mb-6">
                Nous intervenons partout
              </h2>
              <div className="space-y-3">
                {SECTEURS_CLIENTS.map((secteur, i) => (
                  <motion.div
                    key={secteur}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white">
                      {secteur}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section-padding bg-gradient-hero text-white" aria-label="Appel à l'action entreprise">
        <div className="container-section text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Zap className="w-12 h-12 text-accent mx-auto mb-6" aria-hidden="true" />
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl mb-4">
              Travaillons ensemble
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
              Votre projet mérite une expertise technique de premier niveau. Contactez
              nos ingénieurs pour une analyse gratuite de vos besoins.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/devis">
                <button className="btn-accent">
                  Demander un devis gratuit
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-glass">Nous contacter</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
