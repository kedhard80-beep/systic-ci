"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle2,
  MessageCircle, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

// ===== FORM SCHEMA =====
const contactSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  entreprise: z.string().optional(),
  sujet: z.enum(["devis", "information", "support", "academie", "autre"], {
    required_error: "Veuillez choisir un sujet",
  }),
  message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
  rgpd: z.literal(true, {
    errorMap: () => ({ message: "Veuillez accepter la politique de confidentialité" }),
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const SUJETS = [
  { value: "devis", label: "Demande de devis" },
  { value: "information", label: "Demande d'information" },
  { value: "support", label: "Support technique" },
  { value: "academie", label: "Inscription Académie" },
  { value: "autre", label: "Autre" },
];

export default function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    await new Promise((r) => setTimeout(r, 1500));
    console.log("Contact form:", data);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="bg-white dark:bg-[#0A1630] min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-hero text-white py-20 md:py-28">
        <div className="container-section text-center">
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-heading font-semibold mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Contactez-nous
          </motion.span>
          <motion.h1
            className="font-heading font-extrabold text-4xl md:text-6xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Parlons de votre projet
          </motion.h1>
          <motion.p
            className="text-white/70 text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Notre équipe répond sous 24h. Devis gratuit et sans engagement.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="container-section py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white">
              Nos coordonnées
            </h2>

            {[
              {
                icon: Phone,
                label: "Téléphone",
                content: SITE.phone.join(" · "),
                href: `tel:${SITE.phone[0].replace(/\s/g, "")}`,
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Mail,
                label: "Email",
                content: SITE.email,
                href: `mailto:${SITE.email}`,
                color: "bg-primary/10 text-primary",
              },
              {
                icon: MessageCircle,
                label: "WhatsApp",
                content: "Discutez avec nous",
                href: SITE.social.whatsapp,
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                icon: MapPin,
                label: "Adresse",
                content: SITE.address.full,
                href: `https://maps.google.com/?q=Angré+GESTOCI+Abidjan`,
                color: "bg-accent/10 text-accent",
              },
              {
                icon: Clock,
                label: "Horaires",
                content: `${SITE.hours.office}\n${SITE.hours.field}`,
                color: "bg-grey-light text-grey-text",
              },
            ].map(({ icon: Icon, label, content, href, color }) => (
              <div key={label} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-bold text-sm text-grey-anthracite dark:text-white mb-0.5">
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-grey-text dark:text-white/60 hover:text-primary transition-colors whitespace-pre-line"
                    >
                      {content}
                    </a>
                  ) : (
                    <p className="text-sm text-grey-text dark:text-white/60 whitespace-pre-line">
                      {content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="rounded-2xl bg-grey-light dark:bg-navy/50 h-48 flex items-center justify-center border border-border">
              <div className="text-center text-grey-text dark:text-white/40">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-heading font-semibold">Angré GESTOCI</p>
                <p className="text-xs">Abidjan, Cocody</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-3">
                  Message envoyé !
                </h2>
                <p className="text-grey-text dark:text-white/60 mb-6">
                  Nous vous répondrons dans les meilleurs délais (sous 24h).
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Envoyer un autre message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="card-base p-8">
                  <h2 className="font-heading font-bold text-2xl text-grey-anthracite dark:text-white mb-6">
                    Envoyez-nous un message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Nom */}
                    <div>
                      <label htmlFor="nom" className="form-label">
                        Nom & Prénom <span className="text-accent">*</span>
                      </label>
                      <input
                        id="nom"
                        {...register("nom")}
                        className="form-input"
                        placeholder="Jean Kouassi"
                        aria-invalid={!!errors.nom}
                        aria-describedby={errors.nom ? "nom-error" : undefined}
                      />
                      {errors.nom && (
                        <p id="nom-error" className="text-accent text-xs mt-1" role="alert">
                          {errors.nom.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-accent">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="form-input"
                        placeholder="jean@entreprise.ci"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-accent text-xs mt-1" role="alert">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label htmlFor="telephone" className="form-label">
                        Téléphone
                      </label>
                      <input
                        id="telephone"
                        type="tel"
                        {...register("telephone")}
                        className="form-input"
                        placeholder="07 00 00 00 00"
                      />
                    </div>

                    {/* Entreprise */}
                    <div>
                      <label htmlFor="entreprise" className="form-label">
                        Entreprise
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text/50" />
                        <input
                          id="entreprise"
                          {...register("entreprise")}
                          className="form-input pl-10"
                          placeholder="Votre entreprise"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sujet */}
                  <div className="mb-4">
                    <label htmlFor="sujet" className="form-label">
                      Sujet <span className="text-accent">*</span>
                    </label>
                    <select
                      id="sujet"
                      {...register("sujet")}
                      className="form-input bg-white dark:bg-navy/30"
                      aria-invalid={!!errors.sujet}
                    >
                      <option value="">Choisir un sujet</option>
                      {SUJETS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {errors.sujet && (
                      <p className="text-accent text-xs mt-1" role="alert">
                        {errors.sujet.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <label htmlFor="message" className="form-label">
                      Message <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="message"
                      {...register("message")}
                      rows={5}
                      className="form-input resize-none"
                      placeholder="Décrivez votre projet ou votre question..."
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-accent text-xs mt-1" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* RGPD */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        {...register("rgpd")}
                        className="mt-0.5 w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        aria-invalid={!!errors.rgpd}
                      />
                      <span className="text-sm text-grey-text dark:text-white/60">
                        J&apos;accepte que mes données soient utilisées pour traiter ma demande
                        conformément à la{" "}
                        <a href="/legal/confidentialite" className="text-primary hover:underline">
                          politique de confidentialité
                        </a>{" "}
                        de SYSTIC-CI.{" "}
                        <span className="text-accent">*</span>
                      </span>
                    </label>
                    {errors.rgpd && (
                      <p className="text-accent text-xs mt-1 ml-7" role="alert">
                        {errors.rgpd.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer le message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
