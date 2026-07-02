"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Shield, Zap, PlayCircle,
  Camera, Fingerprint, Network, CheckCircle2,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";

// ===== FLOATING TECH CARDS =====
const TECH_CARDS = [
  {
    icon: Camera,
    label: "Vidéosurveillance IP",
    sub: "HD · PTZ · >10km",
    color: "bg-primary",
    delay: 0,
    position: "top-[10%] left-[2%]",
  },
  {
    icon: Fingerprint,
    label: "Contrôle d'Accès",
    sub: "Biométrie · RFID",
    color: "bg-accent",
    delay: 0.3,
    position: "top-[35%] right-[2%]",
  },
  {
    icon: Network,
    label: "Réseaux & ToIP",
    sub: "LAN · VLAN · PABX",
    color: "bg-primary",
    delay: 0.6,
    position: "bottom-[20%] left-[3%]",
  },
  {
    icon: Zap,
    label: "Courant Fort",
    sub: "TGBT · Électrogènes",
    color: "bg-accent",
    delay: 0.9,
    position: "bottom-[10%] right-[3%]",
  },
];

const TRUST_ITEMS = [
  "Équipes certifiées",
  "Intervention 7j/7",
  "Devis gratuit 24h",
  "Garantie 12 mois",
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90svh] flex flex-col justify-center overflow-hidden bg-white dark:bg-navy pt-8"
      aria-label="Section principale — SYSTIC-CI"
    >
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Light mode: subtle blue tint top-left, white base */}
        <div className="absolute inset-0 dark:hidden bg-gradient-to-br from-[#EEF2FF] via-white to-white" />
        {/* Dark mode gradient */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#0D1F4E] via-[#0D1F4E] to-[#1A45C9]/30" />

        {/* Grid pattern — visible in both modes */}
        <div
          className="absolute inset-0 dark:opacity-[0.03] opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(26,69,201,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(26,69,201,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow orbs — toned down on light */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(26,69,201,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
            y,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(200,19,36,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* ===== FLOATING TECH CARDS (desktop) ===== */}
      {TECH_CARDS.map((card, i) => (
        <motion.div
          key={card.label}
          className={`absolute hidden xl:flex items-center gap-3 bg-white dark:bg-white/5 border border-grey-light dark:border-white/10 backdrop-blur-sm shadow-md dark:shadow-none rounded-2xl px-4 py-3 ${card.position}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.8 + card.delay, duration: 0.5, ease: "backOut" }}
          style={{
            animation: `float ${6 + i}s ease-in-out infinite`,
            animationDelay: `${card.delay}s`,
          }}
          aria-hidden="true"
        >
          <div className={`${card.color} p-2 rounded-xl`}>
            <card.icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-grey-anthracite dark:text-white text-xs font-heading font-bold">{card.label}</div>
            <div className="text-grey-text dark:text-white/50 text-[10px]">{card.sub}</div>
          </div>
        </motion.div>
      ))}

      {/* ===== MAIN CONTENT ===== */}
      <motion.div
        className="relative z-10 container-section py-24 md:py-32"
        style={{ opacity }}
      >
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-heading font-semibold mb-8">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              N°1 de la sécurité électronique à Abidjan
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-grey-anthracite dark:text-white leading-[1.05] tracking-tight mb-6"
          >
            Votre Partenaire en{" "}
            <span className="relative inline-block">
              <span className="text-gradient-red">Sécurité</span>
              {/* Underline decoration */}
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-accent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              />
            </span>
            {" "}Électronique
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-lg md:text-xl text-grey-text dark:text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            SYSTIC-CI conçoit et déploie des solutions de sécurité électronique et
            d&apos;infrastructure électrique pour les entreprises, administrations et
            particuliers. Équipes certifiées, disponibles{" "}
            <strong className="text-grey-anthracite dark:text-white font-semibold">7j/7</strong> à Abidjan.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <Link href="/devis">
              <Button variant="accent" size="lg" className="group">
                Demander un devis gratuit
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/realisations">
              <Button variant="glass" size="lg" className="group">
                <PlayCircle className="w-5 h-5" />
                Voir nos réalisations
              </Button>
            </Link>
            <a href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}>
              <Button variant="ghost" size="lg" className="text-grey-text dark:text-white/80 hover:text-grey-anthracite dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/10 gap-2">
                <Phone className="w-4 h-4" />
                {SITE.phone[0]}
              </Button>
            </a>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-grey-text dark:text-white/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ===== STATS BAND ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { value: "500+", label: "Projets réalisés", icon: Shield },
            { value: "7j/7", label: "Disponibilité terrain", icon: Zap },
            { value: "6", label: "Modules de formation", icon: CheckCircle2 },
            { value: "90%", label: "Formation pratique", icon: Shield },
          ].map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="bg-white dark:bg-white/5 rounded-2xl p-6 text-center border border-grey-light dark:border-white/10 hover:border-primary/40 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-grey-anthracite dark:text-white mb-1">
                {value}
              </div>
              <div className="text-sm text-grey-text dark:text-white/50">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-grey-text dark:text-white/30 text-xs tracking-widest uppercase">Découvrir</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-grey-light dark:border-white/20 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-primary/40 dark:bg-white/50" />
        </motion.div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="white"
            className="dark:fill-[#0D1F4E]"
            opacity="0.03"
          />
          <path
            d="M0,60 C480,20 960,80 1440,60 L1440,80 L0,80 Z"
            fill="white"
            className="dark:fill-[hsl(var(--background))]"
          />
        </svg>
      </div>
    </section>
  );
}
