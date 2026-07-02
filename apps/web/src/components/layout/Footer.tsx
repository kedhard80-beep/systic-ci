import React from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock,
  Facebook, Linkedin, Youtube, MessageCircle,
  ArrowRight, Shield as ShieldIcon,
} from "lucide-react";
import { SysticLogo } from "@/components/ui/SysticLogo";
import { SITE, ACADEMIE_MODULES, SERVICES_COURANT_FAIBLE } from "@/lib/constants";

const FOOTER_LINKS = {
  "Entreprise": [
    { label: "À propos", href: "/entreprise" },
    { label: "Notre équipe", href: "/entreprise#equipe" },
    { label: "Nos valeurs", href: "/entreprise#valeurs" },
    { label: "Carrières", href: "/carrieres" },
    { label: "Partenaires", href: "/partenaires" },
  ],
  "Nos Métiers": [
    { label: "Courant Faible", href: "/metiers/courant-faible" },
    { label: "Courant Fort", href: "/metiers/courant-fort" },
    { label: "Vidéosurveillance IP", href: "/metiers/courant-faible#videosurveillance" },
    { label: "Contrôle d'Accès", href: "/metiers/courant-faible#controle-acces" },
    { label: "Groupes Électrogènes", href: "/metiers/courant-fort#groupes" },
  ],
  "Académie": [
    { label: "Présentation", href: "/academie" },
    { label: "Catalogue des formations", href: "/academie/catalogue" },
    { label: "S'inscrire", href: "/academie/inscription" },
    { label: "Certification", href: "/academie/certifications" },
    { label: "Forum", href: "/academie/forum" },
  ],
  "Support": [
    { label: "Contact", href: "/contact" },
    { label: "Demander un devis", href: "/devis" },
    { label: "FAQ", href: "/faq" },
    { label: "Portail client", href: "/client" },
    { label: "Blog", href: "/blog" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white" role="contentinfo">
      {/* CTA BAND */}
      <div className="border-b border-white/10 bg-primary/20">
        <div className="container-section py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white">
                Votre projet, notre expertise.
              </h2>
              <p className="text-white/70 mt-1">
                Obtenez un devis gratuit sous 24h. Équipes disponibles 7j/7.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-heading font-bold hover:bg-accent/90 transition-all duration-200 shadow-glow-red"
              >
                Demander un devis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/30 text-white font-heading font-bold hover:bg-white/10 transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                {SITE.phone[0]}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="container-section py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">

          {/* BRAND COLUMN */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="mb-6 inline-block hover:opacity-90 transition-opacity">
              <SysticLogo variant="dark" height={36} />
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Entreprise ivoirienne spécialisée en ingénierie et intégration
              technologique. Courant faible, courant fort et formation professionnelle.
              Équipes certifiées, disponibles 7j/7 à Abidjan.
            </p>

            {/* Contact info */}
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}
                  className="flex items-start gap-3 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 text-primary group-hover:text-accent transition-colors flex-shrink-0" />
                  <div>
                    <div>{SITE.phone[0]}</div>
                    <div>{SITE.phone[1]}</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  <Mail className="w-4 h-4 text-primary group-hover:text-accent transition-colors flex-shrink-0" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{SITE.address.full}</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <div>{SITE.hours.office}</div>
                    <div className="text-accent font-semibold">{SITE.hours.field}</div>
                  </div>
                </div>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: SITE.social.facebook, label: "Facebook" },
                { icon: Linkedin, href: SITE.social.linkedin, label: "LinkedIn" },
                { icon: Youtube, href: SITE.social.youtube, label: "YouTube" },
                { icon: MessageCircle, href: SITE.social.whatsapp, label: "WhatsApp" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* LINKS COLUMNS */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white/40 mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors hover:translate-x-0.5 inline-block duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="container-section py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <div className="flex items-center gap-1">
              <ShieldIcon className="w-3.5 h-3.5" />
              <span>
                &copy; {currentYear} SYSTIC-CI — Systèmes Technologiques & Intégration de Confiance. Tous droits réservés.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="/legal/confidentialite" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/legal/cgv" className="hover:text-white transition-colors">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
