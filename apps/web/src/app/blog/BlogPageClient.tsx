"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Tag, Clock, ChevronRight, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Static blog posts — will be replaced by CMS/API data
const POSTS = [
  {
    slug: "guide-vidéosurveillance-entreprise-abidjan",
    category: "Sécurité",
    title: "Guide complet : installer un système de vidéosurveillance pour votre entreprise à Abidjan",
    excerpt: "Tout ce qu'il faut savoir avant d'installer des caméras de surveillance dans vos locaux professionnels en Côte d'Ivoire : réglementation, technologie, coûts et maintenance.",
    readTime: "8 min",
    date: "2025-12-10",
    featured: true,
    tags: ["Vidéosurveillance", "Guide", "Abidjan"],
  },
  {
    slug: "controle-acces-biometrique-entreprise",
    category: "Sécurité",
    title: "Contrôle d'accès biométrique : quelles solutions pour les entreprises ivoiriennes ?",
    excerpt: "Empreinte digitale, reconnaissance faciale, badge RFID... Comparatif des technologies de contrôle d'accès adaptées au contexte africain.",
    readTime: "6 min",
    date: "2025-11-28",
    featured: false,
    tags: ["Contrôle d'accès", "Biométrie"],
  },
  {
    slug: "coupures-courant-abidjan-solutions",
    category: "Électricité",
    title: "Coupures de courant à Abidjan : les meilleures solutions pour protéger votre activité",
    excerpt: "Groupe électrogène, onduleur UPS, batterie solaire... Guide pratique pour choisir la bonne solution de continuité d'alimentation selon votre budget.",
    readTime: "7 min",
    date: "2025-11-15",
    featured: false,
    tags: ["Électricité", "Groupe électrogène", "UPS"],
  },
  {
    slug: "fibre-optique-reseau-entreprise-cote-ivoire",
    category: "Réseaux",
    title: "Fibre optique vs cuivre : quel câblage réseau choisir pour votre entreprise ?",
    excerpt: "Débit, distance, coût, durabilité... Analyse comparative pour vous aider à faire le bon choix d'infrastructure réseau en Côte d'Ivoire.",
    readTime: "5 min",
    date: "2025-10-30",
    featured: false,
    tags: ["Réseaux", "Fibre optique"],
  },
  {
    slug: "academie-systic-ci-formation-securite-electronique",
    category: "Formation",
    title: "Pourquoi se former à la sécurité électronique en 2025 ? Le marché ivoirien en plein essor",
    excerpt: "Le marché de la sécurité électronique en Côte d'Ivoire croît de 15% par an. Opportunités, salaires et débouchés pour les techniciens formés.",
    readTime: "4 min",
    date: "2025-10-12",
    featured: false,
    tags: ["Formation", "Carrière", "Académie"],
  },
  {
    slug: "domotique-abidjan-smart-home",
    category: "Domotique",
    title: "La domotique arrive à Abidjan : les premières maisons connectées en Côte d'Ivoire",
    excerpt: "Éclairage automatique, climatisation connectée, sécurité intégrée... Comment la domotique transforme les immeubles et villas d'Abidjan.",
    readTime: "5 min",
    date: "2025-09-20",
    featured: false,
    tags: ["Domotique", "Smart Home"],
  },
];

const CATEGORIES = ["Tous", "Sécurité", "Électricité", "Réseaux", "Formation", "Domotique"];

export default function BlogPageClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");

  const filtered = POSTS.filter(
    (p) =>
      (category === "Tous" || p.category === category) &&
      (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <div className="bg-white dark:bg-[#0A1630] min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-hero text-white py-20">
        <div className="container-section text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-tag !bg-white/10 !border-white/20 !text-white mb-4 inline-flex">
              <BookOpen className="w-4 h-4" aria-hidden="true" /> Blog & Actualités
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl mb-4">
              Ressources &amp; Conseils
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
              Guides pratiques, actualités et retours d&apos;expérience sur la sécurité électronique, les réseaux et l&apos;électricité en Côte d&apos;Ivoire.
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-section py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all",
                category === cat
                  ? "bg-primary text-white"
                  : "bg-grey-light dark:bg-white/10 text-grey-text dark:text-white/60 hover:bg-primary/10 hover:text-primary"
              )}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-8 mb-10 group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-heading font-bold px-3 py-1 rounded-full bg-accent text-white">À la une</span>
              <span className="text-xs font-heading font-semibold text-primary">{featured.category}</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-grey-anthracite dark:text-white mb-3 leading-tight">
              {featured.title}
            </h2>
            <p className="text-grey-text dark:text-white/60 text-lg leading-relaxed mb-6">{featured.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-grey-text dark:text-white/40">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {featured.readTime}
                </span>
                <div className="flex gap-2">
                  {featured.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-xs text-grey-text dark:text-white/40">
                      <Tag className="w-3 h-3" aria-hidden="true" /> {t}
                    </span>
                  ))}
                </div>
              </div>
              <Link href={`/blog/${featured.slug}`}>
                <button className="flex items-center gap-2 text-sm font-heading font-semibold text-primary hover:gap-3 transition-all">
                  Lire l&apos;article <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="card-base p-6 h-full hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-heading font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{post.category}</span>
                      <span className="flex items-center gap-1 text-xs text-grey-text dark:text-white/40">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {post.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-grey-anthracite dark:text-white mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2 flex-wrap">
                        {post.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs text-grey-text dark:text-white/40 flex items-center gap-1">
                            <Tag className="w-3 h-3" aria-hidden="true" /> {t}
                          </span>
                        ))}
                      </div>
                      <ChevronRight className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-grey-text dark:text-white/50 text-lg mb-4">Aucun article trouvé.</p>
            <button onClick={() => { setSearch(""); setCategory("Tous"); }} className="text-primary hover:underline font-heading font-semibold">
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
