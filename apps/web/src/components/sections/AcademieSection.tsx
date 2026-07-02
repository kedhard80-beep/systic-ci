"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera, Server, Fingerprint, ShieldAlert, Home, Network,
  Award, Users, BookOpen, Star, ArrowRight, Trophy, Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ACADEMIE_MODULES } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Camera, Server, Fingerprint, ShieldAlert, Home, Network,
};

const perks = [
  {
    icon: BookOpen,
    label: "90% pratique",
    sub: "En laboratoire réel",
  },
  {
    icon: Users,
    label: "Formateurs ingénieurs",
    sub: "Actifs sur le terrain",
  },
  {
    icon: Trophy,
    label: "Major = kit pro offert",
    sub: "Outillage professionnel complet",
  },
  {
    icon: Briefcase,
    label: "Emploi garanti",
    sub: "Pool techniciens SYSTIC-CI",
  },
];

const levelColors: Record<string, string> = {
  Intermédiaire: "badge-blue",
  Avancé: "badge-red",
};

export default function AcademieSection() {
  return (
    <section
      className="section-padding bg-grey-light dark:bg-navy/30"
      aria-labelledby="academie-heading"
    >
      <div className="container-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT — Info */}
          <div>
            <motion.span
              className="section-tag mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Académie SYSTIC-CI
            </motion.span>

            <motion.h2
              id="academie-heading"
              className="section-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Formation professionnelle{" "}
              <span className="text-gradient-blue">certifiante</span>
            </motion.h2>

            <motion.p
              className="section-sub mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              L&apos;Académie SYSTIC-CI forme des techniciens opérationnels en sécurité
              électronique et réseaux. Formations intensives, 90% pratique, dispensées
              par des ingénieurs actifs.
            </motion.p>

            {/* Perks */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {perks.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-navy/60 border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-grey-anthracite dark:text-white">
                      {label}
                    </div>
                    <div className="text-xs text-grey-text dark:text-white/50 mt-0.5">
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Special offer */}
            <motion.div
              className="rounded-2xl bg-gradient-hero p-6 mb-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-heading font-bold text-base mb-1">
                    🏆 Major de promotion
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Le major de chaque promotion reçoit un{" "}
                    <strong className="text-white">kit d&apos;outillage professionnel complet</strong>.
                    Les meilleurs profils intègrent le{" "}
                    <strong className="text-white">pool de techniciens SYSTIC-CI</strong> avec
                    un contrat de sous-traitance rémunéré.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/academie/inscription">
                <button className="btn-primary">
                  S&apos;inscrire maintenant
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/academie">
                <button className="btn-outline">
                  Voir le catalogue
                </button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT — Modules */}
          <div>
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {ACADEMIE_MODULES.map((module, index) => {
                const Icon = iconMap[module.icon] || BookOpen;
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-navy/60 border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                  >
                    {/* Module number */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:shadow-glow-blue transition-all duration-300">
                      <span className="font-heading font-extrabold text-primary group-hover:text-white text-sm transition-colors">
                        {module.code}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-heading font-bold text-sm text-grey-anthracite dark:text-white truncate">
                          {module.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-grey-text dark:text-white/50">
                          {module.duration}
                        </span>
                        <span className="text-grey-text/30">·</span>
                        <Badge
                          variant={module.level === "Avancé" ? "accent" : "outline"}
                          size="sm"
                          className="font-normal"
                        >
                          {module.level}
                        </Badge>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-grey-text/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Inscription banner */}
            <motion.div
              className="mt-6 p-4 rounded-2xl bg-accent/10 border border-accent/20 flex items-center gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
              <p className="text-sm text-accent font-heading font-semibold">
                📅 Inscriptions ouvertes — Places limitées par session
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
