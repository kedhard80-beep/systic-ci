"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Fingerprint, Network, Shield, Bell, Wifi,
  Home, CheckCircle2, ArrowRight, ChevronRight, Zap, Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    id: "videosurveillance",
    icon: Camera,
    color: "bg-primary",
    title: "Vidéosurveillance IP",
    tagline: "Voir, enregistrer, protéger",
    description:
      "Systèmes de vidéosurveillance HD et 4K avec vision nocturne, PTZ (Pan-Tilt-Zoom), analyse comportementale par IA et stockage NVR cloud ou local. Installation intérieure, extérieure, longue distance.",
    features: [
      "Caméras HD/4K, dôme, tube, fisheye, PTZ",
      "Vision nocturne infrarouge jusqu'à 100m",
      "Analyse IA : détection d'intrusion, comptage",
      "NVR local + sauvegarde cloud AWS S3",
      "Accès à distance smartphone / PC 24h/24",
      "Couverture multi-sites sur un seul tableau de bord",
    ],
    brands: ["Hikvision", "Dahua", "Axis", "Bosch"],
    highlight: "Portée jusqu'à >10 km (PTZ longue distance)",
  },
  {
    id: "controle-acces",
    icon: Fingerprint,
    color: "bg-accent",
    title: "Contrôle d'accès",
    tagline: "Qui entre, qui sort, quand",
    description:
      "Solutions de contrôle d'accès biométrique (empreinte, facial, iris), RFID et QR code pour sécuriser les entrées, sorties et zones sensibles de vos locaux.",
    features: [
      "Lecteurs biométriques (empreinte + facial)",
      "Badges RFID, QR code, smartphone NFC",
      "Gestion des horaires et zones d'accès",
      "Journaux d'audit complets et exportables",
      "Interphonie vidéo IP, tourniquet, portail motorisé",
      "Intégration logiciel de présence/RH",
    ],
    brands: ["HID", "Suprema", "ZKTeco", "Hikvision"],
    highlight: "Jusqu'à 50 000 utilisateurs par site",
  },
  {
    id: "alarme",
    icon: Bell,
    color: "bg-primary",
    title: "Alarme anti-intrusion",
    tagline: "Alerte immédiate, réaction rapide",
    description:
      "Systèmes d'alarme filaires et sans fil avec détecteurs de mouvement, bris de glace, ouverture de porte. Télésurveillance et notification SMS/push en temps réel.",
    features: [
      "Détecteurs PIR, infrarouge, micro-ondes",
      "Détecteurs de bris de glace et contacts magnétiques",
      "Centrale d'alarme filaire / sans fil / hybride",
      "Télésurveillance 24/7 avec intervention",
      "Notification SMS, email et push mobile",
      "Compatible systèmes maison/industrie",
    ],
    brands: ["DSC", "Paradox", "Ajax", "Visonic"],
    highlight: "Temps de réponse moyen < 30 secondes",
  },
  {
    id: "reseau",
    icon: Network,
    color: "bg-accent",
    title: "Réseaux LAN & ToIP",
    tagline: "Infrastructure data & voix",
    description:
      "Conception et déploiement d'infrastructures réseau d'entreprise : câblage structuré, switches managés, VPN, VLAN, Wi-Fi professionnel et téléphonie IP (PABX/IPBX).",
    features: [
      "Câblage Cat6/Cat6A/Fibre optique certifié",
      "Switches managés, routeurs, firewalls",
      "Wi-Fi professionnel (Unifi / Ruckus / Cisco)",
      "VPN site-à-site, accès distant sécurisé",
      "PABX/IPBX — téléphonie unifiée",
      "Monitoring réseau 24/7 (Zabbix/PRTG)",
    ],
    brands: ["Cisco", "Ubiquiti", "Fortinet", "MikroTik"],
    highlight: "Certifié Fluke Networks — câblage garanti",
  },
  {
    id: "domotique",
    icon: Home,
    color: "bg-primary",
    title: "Domotique & Smart Building",
    tagline: "Le bâtiment intelligent",
    description:
      "Automatisation de bâtiments résidentiels et professionnels : éclairage, climatisation, stores, sécurité, audio multiroom, tableaux de bord centralisés.",
    features: [
      "Gestion éclairage & scénarios lumineux",
      "Climatisation et chauffage connectés",
      "Stores, volets et portails automatiques",
      "Interphonie et sécurité intégrés",
      "Tableaux de bord sur smartphone/tablette",
      "Compatibilité KNX, Z-Wave, Zigbee, Matter",
    ],
    brands: ["Legrand", "Schneider", "Somfy", "ABB"],
    highlight: "Économie d'énergie jusqu'à 30%",
  },
  {
    id: "surveillance-env",
    icon: Shield,
    color: "bg-accent",
    title: "Monitoring environnemental",
    tagline: "Datacenter & salles critiques",
    description:
      "Surveillance de température, humidité, détection d'eau, fumée et accès pour datacenters, salles serveurs, chambres froides et laboratoires.",
    features: [
      "Capteurs T°/humidité avec alertes",
      "Détection d'eau, fumée, vibrations",
      "Gestion PDU et onduleurs (UPS)",
      "Flux vidéo intégré en salle serveur",
      "Tableaux de bord temps réel & historiques",
      "Alertes multi-canal (email, SMS, WhatsApp)",
    ],
    brands: ["Raritan", "Vertiv", "APC", "Emerson"],
    highlight: "Disponibilité 99.99% garantie contractuellement",
  },
];

const PROCESS = [
  { step: "01", title: "Audit sur site", desc: "Nos ingénieurs visitent vos locaux et analysent vos besoins." },
  { step: "02", title: "Proposition technique", desc: "Devis détaillé avec plan d'implantation et matériel recommandé." },
  { step: "03", title: "Installation", desc: "Équipes terrain certifiées, travaux propres et dans les délais." },
  { step: "04", title: "Formation & remise", desc: "Prise en main avec votre équipe, documentation complète fournie." },
  { step: "05", title: "Maintenance", desc: "Contrat de maintenance préventive et curative disponible." },
];

export default function CourantFaibleClient() {
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
              <span className="text-white/60 text-sm font-heading">Courant Faible</span>
            </div>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white leading-tight mb-4">
              Courant Faible
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mb-8">
              Sécurité électronique, réseaux et domotique. Des solutions conçues pour protéger vos biens, vos personnes et vos données.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/devis">
                <button className="btn-accent">
                  Demander un devis gratuit <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-glass">Nous contacter</button>
              </Link>
            </div>
          </motion.div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Camera, value: "6", label: "Spécialités" },
              { icon: Clock, value: "7j/7", label: "Disponible" },
              { icon: Wifi, value: "500+", label: "Sites connectés" },
              { icon: Zap, value: "24h", label: "Devis gratuit" },
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
      <section className="section-padding" aria-labelledby="services-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Nos spécialités</span>
            <h2 id="services-heading" className="section-heading">6 domaines d'expertise</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — service tabs */}
            <div className="space-y-2">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all",
                    active === s.id
                      ? "bg-primary text-white shadow-glow"
                      : "bg-grey-light dark:bg-white/5 text-grey-anthracite dark:text-white hover:bg-primary/10"
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
                  {active === s.id && <ChevronRight className="w-4 h-4 ml-auto text-white/70" aria-hidden="true" />}
                </button>
              ))}
            </div>

            {/* Right — detail panel */}
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
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
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
                      <div className="text-xs text-primary font-heading font-bold">{current.highlight}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-grey-light dark:bg-navy/30" aria-labelledby="process-heading">
        <div className="container-section">
          <div className="text-center mb-12">
            <span className="section-tag mb-4">Notre méthode</span>
            <h2 id="process-heading" className="section-heading">De l'audit à la maintenance</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {PROCESS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 card-base p-6"
              >
                <div className="font-heading font-extrabold text-4xl text-primary/20 mb-3">{step.step}</div>
                <h3 className="font-heading font-bold text-base text-grey-anthracite dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-hero text-white" aria-label="Appel à l'action courant faible">
        <div className="container-section text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Un projet de sécurité électronique ?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Nos ingénieurs se déplacent gratuitement pour auditer votre site et vous proposer la meilleure solution.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/devis">
                <button className="btn-accent">
                  Devis gratuit en 24h <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/metiers/courant-fort">
                <button className="btn-glass">Voir Courant Fort</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
