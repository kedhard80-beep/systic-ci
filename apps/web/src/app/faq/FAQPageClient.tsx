"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const FAQ_DATA = [
  {
    category: "Général",
    questions: [
      {
        q: "Qu'est-ce que SYSTIC-CI ?",
        a: "SYSTIC-CI (Systèmes Technologiques & Intégration de Confiance) est une entreprise ivoirienne spécialisée en ingénierie et intégration technologique. Nous intervenons sur deux pôles : le courant faible (sécurité électronique, réseaux) et le courant fort (installations électriques, TGBT, groupes électrogènes). Nous disposons également d'une Académie de formation professionnelle.",
      },
      {
        q: "Dans quelles zones intervenez-vous ?",
        a: "Nous intervenons principalement à Abidjan et dans toute la Côte d'Ivoire. Nos équipes terrain sont basées à Angré GESTOCI (Cocody) et se déplacent sur l'ensemble du territoire. Pour les projets hors d'Abidjan, contactez-nous pour évaluer les conditions d'intervention.",
      },
      {
        q: "Quels sont vos horaires ?",
        a: "Notre bureau est ouvert du lundi au samedi de 09h00 à 18h00. Nos équipes terrain sont disponibles 7j/7 de 07h00 à 23h00 pour les interventions et dépannages urgents.",
      },
    ],
  },
  {
    category: "Devis & Tarifs",
    questions: [
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui, tous nos devis sont entièrement gratuits et sans engagement. Nos ingénieurs analysent votre projet, se déplacent si nécessaire, et vous proposent une solution adaptée à votre budget.",
      },
      {
        q: "Quel est le délai pour recevoir un devis ?",
        a: "Nous nous engageons à vous répondre sous 24 heures ouvrables après réception de votre demande. Pour les projets urgents, appelez-nous directement au 01 73 03 25 25.",
      },
      {
        q: "Proposez-vous des facilités de paiement ?",
        a: "Oui, nous proposons des plans de paiement adaptés pour les grands projets. Les modalités sont définies dans le devis et le contrat. Nous acceptons les virements bancaires, chèques, espèces et Mobile Money.",
      },
      {
        q: "Y a-t-il des frais de déplacement ?",
        a: "Pour les projets à Abidjan, les déplacements pour l'établissement du devis sont inclus. Pour les projets à l'intérieur du pays, des frais de déplacement peuvent s'appliquer et seront mentionnés dans le devis.",
      },
    ],
  },
  {
    category: "Services & Installation",
    questions: [
      {
        q: "Quelle est la durée d'une installation de vidéosurveillance ?",
        a: "La durée dépend de l'envergure du projet. Pour une installation résidentielle standard (4 à 8 caméras), comptez 1 à 2 jours. Pour un site industriel ou multi-bâtiments, plusieurs semaines peuvent être nécessaires. Nous vous fournirons un planning détaillé dans le devis.",
      },
      {
        q: "Proposez-vous une maintenance après installation ?",
        a: "Oui, nous proposons des contrats de maintenance préventive et curative. Nos techniciens effectuent des visites périodiques pour vérifier le bon fonctionnement de vos équipements et interviennent rapidement en cas de panne.",
      },
      {
        q: "Quelle garantie proposez-vous ?",
        a: "Tous nos équipements et installations bénéficient d'une garantie de 12 mois minimum. Pour les équipements de marques premium que nous installons, la garantie fabricant peut aller jusqu'à 3 à 5 ans.",
      },
      {
        q: "Les caméras de vidéosurveillance sont-elles accessibles à distance ?",
        a: "Oui, nos systèmes de vidéosurveillance IP permettent un accès à distance depuis votre smartphone, tablette ou ordinateur, 24h/24. Nous configurons cet accès lors de l'installation et vous formons à son utilisation.",
      },
      {
        q: "Peut-on relier plusieurs sites sur le même système ?",
        a: "Absolument. Nos solutions permettent la supervision centralisée de plusieurs sites simultanément. C'est une configuration que nous réalisons régulièrement pour des banques, des chaînes de stations-service et des groupes industriels.",
      },
    ],
  },
  {
    category: "Académie & Formation",
    questions: [
      {
        q: "Qui peut s'inscrire à l'Académie SYSTIC-CI ?",
        a: "Nos formations sont ouvertes à tous : électriciens souhaitant se spécialiser en sécurité électronique, techniciens cherchant à se reconvertir, étudiants en formation technique, ou professionnels voulant se perfectionner. Aucun prérequis strict, mais une base technique est conseillée pour les modules avancés.",
      },
      {
        q: "Les formations sont-elles certifiantes ?",
        a: "Oui, les participants qui valident leur formation (quiz + examen pratique) reçoivent un certificat SYSTIC-CI. Les meilleurs profils sont intégrés dans notre pool de techniciens avec un contrat de sous-traitance rémunéré.",
      },
      {
        q: "Quelle est la durée des formations ?",
        a: "Nos 6 modules ont des durées de 3 à 5 semaines. Les formations sont intensives avec 90% de pratique en laboratoire réel. Des sessions flexibles (semaine, week-end) sont proposées selon les disponibilités.",
      },
      {
        q: "Y a-t-il des débouchés après la formation ?",
        a: "Oui. Les meilleurs profils de chaque promotion rejoignent directement notre pool de techniciens SYSTIC-CI avec un contrat de sous-traitance rémunéré (période de 6 mois). De plus, une certification reconnue en Côte d'Ivoire facilite l'emploi dans le secteur.",
      },
      {
        q: "Comment s'inscrire ?",
        a: "Rendez-vous sur la page Académie de notre site pour consulter le calendrier et vous inscrire en ligne. Vous pouvez aussi nous appeler au 01 73 03 25 25 ou envoyer un email à contact@systic.ci. Les places sont limitées par session.",
      },
    ],
  },
  {
    category: "Technique",
    questions: [
      {
        q: "Quelles marques d'équipements installez-vous ?",
        a: "Nous travaillons avec des marques reconnues internationalement : Hikvision, Dahua, Honeywell pour la vidéosurveillance ; HID, Suprema pour le contrôle d'accès ; Schneider Electric, Legrand pour les équipements électriques ; Synology pour les NAS ; Cisco, Ubiquiti pour les réseaux.",
      },
      {
        q: "Que se passe-t-il en cas de coupure de courant ?",
        a: "Nos systèmes sont conçus pour fonctionner avec des solutions de backup (onduleurs UPS, batteries). Pour les installations critiques, nous intégrons des groupes électrogènes avec transfert automatique (ATS). Les caméras IP disposent également d'une alimentation PoE qui facilite le backup.",
      },
      {
        q: "Les données de vidéosurveillance sont-elles sécurisées ?",
        a: "Oui. Les enregistrements sont stockés localement sur des NAS sécurisés dans votre enceinte. Les accès distants sont chiffrés. Nous configurons des droits d'accès personnalisés et les systèmes sont protégés contre les intrusions.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className={cn(
          "font-heading font-semibold text-base transition-colors",
          open ? "text-primary" : "text-grey-anthracite dark:text-white group-hover:text-primary"
        )}>
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-grey-text flex-shrink-0 ml-4 transition-transform duration-200",
            open && "rotate-180 text-primary"
          )}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-grey-text dark:text-white/60 leading-relaxed text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPageClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = FAQ_DATA.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      ({ q, a }) =>
        (!search || q.toLowerCase().includes(search.toLowerCase()) || a.toLowerCase().includes(search.toLowerCase())) &&
        (!activeCategory || cat.category === activeCategory)
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="bg-white dark:bg-[#0A1630] min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-hero text-white py-20">
        <div className="container-section text-center">
          <motion.h1
            className="font-heading font-extrabold text-4xl md:text-6xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Questions fréquentes
          </motion.h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
            Trouvez rapidement les réponses à vos questions sur nos services, formations et tarifs.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-base"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-section py-16">
        <div className="max-w-3xl mx-auto">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all",
                !activeCategory
                  ? "bg-primary text-white"
                  : "bg-grey-light dark:bg-white/10 text-grey-text dark:text-white/60 hover:bg-primary/10 hover:text-primary"
              )}
            >
              Toutes
            </button>
            {FAQ_DATA.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category === activeCategory ? null : cat.category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all",
                  activeCategory === cat.category
                    ? "bg-primary text-white"
                    : "bg-grey-light dark:bg-white/10 text-grey-text dark:text-white/60 hover:bg-primary/10 hover:text-primary"
                )}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-grey-text dark:text-white/50 text-lg mb-4">
                Aucune question ne correspond à votre recherche.
              </p>
              <button onClick={() => setSearch("")} className="text-primary hover:underline font-heading font-semibold">
                Effacer la recherche
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map((cat) => (
                <motion.section
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  aria-labelledby={`faq-${cat.category}`}
                >
                  <h2
                    id={`faq-${cat.category}`}
                    className="font-heading font-bold text-xs tracking-widest uppercase text-primary mb-4"
                  >
                    {cat.category}
                  </h2>
                  <div className="card-base px-6">
                    {cat.questions.map(({ q, a }) => (
                      <FAQItem key={q} question={q} answer={a} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          )}

          {/* Contact fallback */}
          <motion.div
            className="mt-16 rounded-2xl bg-gradient-hero text-white p-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="font-heading font-bold text-xl mb-2">Vous n&apos;avez pas trouvé votre réponse ?</p>
            <p className="text-white/70 mb-6">Notre équipe est disponible pour répondre à toutes vos questions.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}>
                <button className="btn-accent">
                  <Phone className="w-4 h-4" />
                  {SITE.phone[0]}
                </button>
              </a>
              <Link href="/contact">
                <button className="btn-glass">
                  Nous écrire <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
