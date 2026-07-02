"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export default function CTASection() {
  return (
    <section className="section-padding bg-white dark:bg-[#0A1630]" aria-label="Appel à l'action">
      <div className="container-section">
        <motion.div
          className="relative rounded-3xl bg-gradient-hero overflow-hidden p-10 md:p-16 text-center text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent/20 blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/30 blur-[80px]" />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-heading font-semibold mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Équipes disponibles maintenant
            </motion.div>

            <motion.h2
              className="font-heading font-extrabold text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Prêt à sécuriser vos installations ?
            </motion.h2>
            <motion.p
              className="text-white/70 text-lg max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Contactez-nous pour un devis gratuit et personnalisé. Nos ingénieurs
              analysent vos besoins et vous proposent une solution adaptée sous{" "}
              <strong className="text-white">24 heures</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/devis">
                <Button
                  variant="accent"
                  size="xl"
                  className="group shadow-glow-red font-bold"
                >
                  Demander un devis gratuit
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}>
                <Button variant="glass" size="xl" className="group">
                  <Phone className="w-5 h-5" />
                  Appeler maintenant
                </Button>
              </a>
              <a
                href={SITE.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="glass" size="xl">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </Button>
              </a>
            </motion.div>

            {/* Info chips */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Réponse sous 24h
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                {SITE.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                {SITE.phone[0]} / {SITE.phone[1]}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
