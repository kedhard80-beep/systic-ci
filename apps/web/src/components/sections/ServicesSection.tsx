"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Camera, Fingerprint, ShieldAlert,
  Server, Home, Network, Cable, LayoutGrid, Battery,
  Lightbulb, ArrowRight, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SERVICES_COURANT_FAIBLE, SERVICES_COURANT_FORT } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Camera, Fingerprint, ShieldAlert, Server, Home, Network,
  Cable, LayoutGrid, Battery, Lightbulb,
  Shield, Zap,
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

type TabKey = "faible" | "fort";

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("faible");

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge: string }[] = [
    { key: "faible", label: "Courant Faible", icon: Shield, badge: "Sécurité & Réseaux" },
    { key: "fort", label: "Courant Fort", icon: Zap, badge: "Électricité & Énergie" },
  ];

  const services = activeTab === "faible" ? SERVICES_COURANT_FAIBLE : SERVICES_COURANT_FORT;

  return (
    <section
      className="section-padding bg-white dark:bg-[#0A1630]"
      aria-labelledby="services-heading"
    >
      <div className="container-section">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            className="section-tag mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Nos Métiers
          </motion.span>
          <motion.h2
            id="services-heading"
            className="section-heading mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Expertise complète en{" "}
            <span className="text-gradient-blue">ingénierie technologique</span>
          </motion.h2>
          <motion.p
            className="section-sub mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Deux pôles complémentaires pour couvrir l&apos;ensemble de vos besoins en
            sécurité électronique et en infrastructure électrique.
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {tabs.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-heading font-bold text-sm transition-all duration-200",
                activeTab === key
                  ? key === "faible"
                    ? "bg-primary border-primary text-white shadow-glow-blue"
                    : "bg-accent border-accent text-white shadow-glow-red"
                  : "border-border text-grey-text dark:text-white/60 hover:border-primary hover:text-primary"
              )}
              aria-pressed={activeTab === key}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
              {activeTab === key && (
                <Badge
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 text-white border-0 font-normal"
                >
                  {badge}
                </Badge>
              )}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => {
              const Icon = iconMap[service.icon] || Shield;
              const isAccent = activeTab === "fort";

              return (
                <motion.article
                  key={service.id}
                  variants={itemVariants}
                  className="group card-interactive p-6 flex flex-col"
                  aria-label={service.title}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                      isAccent
                        ? "bg-accent/10 group-hover:bg-accent group-hover:shadow-glow-red"
                        : "bg-primary/10 group-hover:bg-primary group-hover:shadow-glow-blue"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-colors duration-300",
                        isAccent
                          ? "text-accent group-hover:text-white"
                          : "text-primary group-hover:text-white"
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading font-bold text-lg text-grey-anthracite dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed mb-4 flex-1">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-5">
                    {service.features.slice(0, 4).map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-xs text-grey-text dark:text-white/50">
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 flex-shrink-0",
                            isAccent ? "text-accent" : "text-primary"
                          )}
                          aria-hidden="true"
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <Link
                    href={`/metiers/${activeTab === "faible" ? "courant-faible" : "courant-fort"}#${service.id}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-heading font-bold transition-all duration-200",
                      isAccent
                        ? "text-accent hover:text-accent/80"
                        : "text-primary hover:text-primary/80"
                    )}
                    aria-label={`En savoir plus sur ${service.title}`}
                  >
                    En savoir plus
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/metiers"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-primary text-primary font-heading font-bold hover:bg-primary hover:text-white transition-all duration-200 group"
          >
            Voir tous nos services
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
