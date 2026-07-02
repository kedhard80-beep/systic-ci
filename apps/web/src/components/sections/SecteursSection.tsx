"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Landmark, Fuel, Heart, Factory, Building2,
  Briefcase, BookOpen, Home, MapPin,
} from "lucide-react";
import { SECTEURS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Landmark, Fuel, Heart, Factory, Building2,
  Briefcase, University: BookOpen, Home,
};

export default function SecteursSection() {
  return (
    <section
      className="section-padding bg-navy text-white overflow-hidden"
      aria-labelledby="secteurs-heading"
    >
      <div className="container-section">
        <div className="text-center mb-16">
          <motion.span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 font-heading font-semibold text-xs tracking-widest uppercase mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Secteurs d&apos;intervention
          </motion.span>
          <motion.h2
            id="secteurs-heading"
            className="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Nous intervenons dans{" "}
            <span className="text-accent">tous les secteurs</span>
          </motion.h2>
          <motion.p
            className="text-white/60 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            De la banque à l&apos;industrie, du résidentiel à l&apos;institutionnel,
            nos équipes s&apos;adaptent à chaque environnement.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SECTEURS.map(({ label, icon }, index) => {
            const Icon = iconMap[icon] || Home;
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 text-center cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <span className="font-heading font-semibold text-sm text-white/80 leading-tight">
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Location */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-2 text-white/50 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <MapPin className="w-4 h-4 text-accent" />
          <span>Basés à Abidjan · Interventions dans tout le pays</span>
        </motion.div>
      </div>
    </section>
  );
}
