"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Network, Zap, Home, Shield, Filter,
  MapPin, ArrowRight, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FILTERS = ["Tous", "Vidéosurveillance", "Réseaux", "Électricité", "Contrôle d'accès", "Domotique"];

const PROJECTS = [
  {
    id: 1,
    title: "Centre bancaire — Vidéosurveillance 48 caméras",
    client: "Banque privée (NDA)",
    location: "Plateau, Abidjan",
    category: "Vidéosurveillance",
    icon: Camera,
    color: "bg-primary",
    description: "Déploiement d'un système de vidéosurveillance IP complet : 48 caméras 4K dôme et extérieures, NVR centralisé, salle de supervision avec vidéomur 4x3, accès à distance sécurisé.",
    tags: ["Hikvision", "48 caméras", "Salle supervision"],
    duration: "3 semaines",
    year: "2024",
  },
  {
    id: 2,
    title: "Infrastructure réseau multi-sites — Groupe Pétrolier",
    client: "Groupe pétrolier (NDA)",
    location: "Abidjan + intérieur pays",
    category: "Réseaux",
    icon: Network,
    color: "bg-primary",
    description: "Réseau MPLS reliant 12 stations-service à un siège central. Câblage Cat6A certifié Fluke, switches managés Cisco, Wi-Fi Ubiquiti UniFi, surveillance réseau Zabbix 24/7.",
    tags: ["Cisco", "12 sites", "MPLS", "Zabbix"],
    duration: "8 semaines",
    year: "2024",
  },
  {
    id: 3,
    title: "TGBT + Groupe électrogène 200 kVA",
    client: "Clinique privée",
    location: "Cocody, Abidjan",
    category: "Électricité",
    icon: Zap,
    color: "bg-accent",
    description: "Installation d'un tableau général basse tension (TGBT) 630A, groupe électrogène Cummins 200kVA avec transfert automatique ATS. Mise aux normes complète NF C 15-100.",
    tags: ["Schneider", "200 kVA", "ATS", "NF C 15-100"],
    duration: "4 semaines",
    year: "2024",
  },
  {
    id: 4,
    title: "Contrôle d'accès biométrique — Immeuble de bureaux",
    client: "Promoteur immobilier",
    location: "Marcory, Abidjan",
    category: "Contrôle d'accès",
    icon: Shield,
    color: "bg-primary",
    description: "35 lecteurs biométriques (empreinte + facial) ZKTeco sur 7 étages, interphonie vidéo IP, gestion centralisée des accès et badges, journaux d'audit temps réel.",
    tags: ["ZKTeco", "35 lecteurs", "Interphonie IP"],
    duration: "5 semaines",
    year: "2023",
  },
  {
    id: 5,
    title: "Smart Villa — Domotique complète",
    client: "Particulier haut de gamme",
    location: "Riviera Palmeraie, Abidjan",
    category: "Domotique",
    icon: Home,
    color: "bg-primary",
    description: "Domotisation complète d'une villa 600m² : éclairage Legrand connecté, volets somfy motorisés, climatisation programmable, vidéosurveillance et alarme intégrées, pilotage smartphone.",
    tags: ["Legrand", "KNX", "Somfy", "600m²"],
    duration: "6 semaines",
    year: "2023",
  },
  {
    id: 6,
    title: "Réseau LAN + Téléphonie IP — Hôtel 4 étoiles",
    client: "Groupe hôtelier (NDA)",
    location: "Plateau, Abidjan",
    category: "Réseaux",
    icon: Network,
    color: "bg-primary",
    description: "Câblage structuré Cat6A pour 120 chambres et espaces communs, IPBX Asterisk 150 postes, Wi-Fi invités segmenté, réseau de gestion hôtelière séparé.",
    tags: ["Cat6A", "Asterisk", "120 chambres", "Wi-Fi"],
    duration: "7 semaines",
    year: "2023",
  },
  {
    id: 7,
    title: "Sécurité périmétrique — Site industriel",
    client: "Usine agroalimentaire",
    location: "Zone industrielle de Yopougon",
    category: "Vidéosurveillance",
    icon: Camera,
    color: "bg-primary",
    description: "72 caméras dont 8 PTZ longue portée pour périmètre 3km, détection intrusion IA, éclairage LED sécurité, intégration alarme et accès véhicules.",
    tags: ["Dahua", "72 caméras", "PTZ", "IA intrusion"],
    duration: "10 semaines",
    year: "2023",
  },
  {
    id: 8,
    title: "Câblage électrique — Centre commercial",
    client: "Promoteur commercial",
    location: "Adjamé, Abidjan",
    category: "Électricité",
    icon: Zap,
    color: "bg-accent",
    description: "Installation électrique complète d'un centre commercial 4 500m² : 3 TGBT, câblage 800 points, éclairage LED 1200 luminaires, groupes électrogènes 2x150kVA.",
    tags: ["Legrand", "4500m²", "LED", "2x150kVA"],
    duration: "14 semaines",
    year: "2022",
  },
];

export default function RealisationsPageClient() {
  const [filter, setFilter] = useState("Tous");
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = PROJECTS.filter((p) => filter === "Tous" || p.category === filter);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevLightbox = () => setLightboxIdx((i) => (i !== null ? Math.max(0, i - 1) : null));
  const nextLightbox = () => setLightboxIdx((i) => (i !== null ? Math.min(filtered.length - 1, i + 1) : null));

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
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white mb-4">
              Nos Réalisations
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
              500+ projets réalisés en Côte d&apos;Ivoire. Des installations qui protègent, connectent et alimentent.
            </p>
            <Link href="/devis">
              <button className="btn-accent">
                Votre projet <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container-section py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Filter className="w-4 h-4 text-grey-text dark:text-white/40 self-center mr-1" aria-hidden="true" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all",
                filter === f
                  ? "bg-primary text-white"
                  : "bg-grey-light dark:bg-white/10 text-grey-text dark:text-white/60 hover:bg-primary/10 hover:text-primary"
              )}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <button
                  onClick={() => { setSelected(project); openLightbox(i); }}
                  className="w-full text-left card-base group hover:-translate-y-1 transition-transform duration-300 overflow-hidden"
                  aria-label={`Voir le projet : ${project.title}`}
                >
                  {/* Image placeholder */}
                  <div className={`${project.color} relative h-40 flex items-center justify-center overflow-hidden`}>
                    <project.icon className="w-16 h-16 text-white/20 group-hover:text-white/30 transition-colors" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <span className="text-[10px] font-heading font-bold text-white/70 uppercase tracking-wider">{project.category}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full bg-black/30 text-white/80">{project.year}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-heading font-bold text-sm text-grey-anthracite dark:text-white leading-snug mb-1">{project.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-grey-text dark:text-white/40 mb-3">
                      <MapPin className="w-3 h-3" aria-hidden="true" /> {project.location}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full bg-grey-light dark:bg-white/10 text-grey-anthracite dark:text-white/70">{t}</span>
                      ))}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox / Detail modal */}
      <AnimatePresence>
        {lightboxIdx !== null && filtered[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Détail projet : ${filtered[lightboxIdx].title}`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0D1F4E] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              {/* Header color band */}
              <div className={`${filtered[lightboxIdx].color} h-32 flex items-center justify-center relative`}>
                {React.createElement(filtered[lightboxIdx].icon, { className: "w-16 h-16 text-white/30", "aria-hidden": true })}
                <button
                  onClick={closeLightbox}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Nav arrows */}
                {lightboxIdx > 0 && (
                  <button onClick={prevLightbox} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40" aria-label="Précédent">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {lightboxIdx < filtered.length - 1 && (
                  <button onClick={nextLightbox} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40" aria-label="Suivant">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-heading font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{filtered[lightboxIdx].category}</span>
                  <span className="text-xs text-grey-text dark:text-white/40">{filtered[lightboxIdx].year}</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-grey-anthracite dark:text-white mb-1">{filtered[lightboxIdx].title}</h3>
                <div className="flex items-center gap-1 text-sm text-grey-text dark:text-white/50 mb-4">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {filtered[lightboxIdx].location}
                </div>
                <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed mb-4">{filtered[lightboxIdx].description}</p>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {filtered[lightboxIdx].tags.map((t) => (
                      <span key={t} className="text-xs font-heading font-semibold px-2 py-1 rounded-lg bg-grey-light dark:bg-white/10 text-grey-anthracite dark:text-white">{t}</span>
                    ))}
                  </div>
                  <span className="text-xs text-grey-text dark:text-white/40">Durée : {filtered[lightboxIdx].duration}</span>
                </div>

                <Link href="/devis">
                  <button className="btn-primary w-full mt-5" onClick={closeLightbox}>
                    Projet similaire <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA bottom */}
      <section className="section-padding bg-gradient-hero text-white" aria-label="Appel à l'action portfolio">
        <div className="container-section text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">
              Votre projet sera notre prochaine réalisation
            </h2>
            <p className="text-white/70 text-lg max-w-lg mx-auto mb-8">
              Devis gratuit, audit sur site, installation par des techniciens certifiés.
            </p>
            <Link href="/devis">
              <button className="btn-accent">
                Demander un devis <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
