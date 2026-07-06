import React from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock,
  Facebook, Linkedin, Youtube, MessageCircle,
  ArrowRight, Shield as ShieldIcon,
} from "lucide-react";
import { SysticLogo } from "@/components/ui/SysticLogo";
import { SITE, ACADEMIE_MODULES, SERVICES_COURANT_FAIBLE } from "@/lib/constants";

// Instagram & TikTok — not in Lucide, using official brand SVGs
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.27 8.27 0 004.83 1.54V7a4.85 4.85 0 01-1.06-.31z" />
    </svg>
  );
}

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
              <SysticLogo variant="dark" height={52} />
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
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-white/40 mb-3">
                Suivez-nous
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { Icon: Facebook,       href: SITE.social.facebook,  label: "Facebook",  color: "hover:bg-[#1877F2]" },
                  { Icon: IconInstagram,  href: SITE.social.instagram, label: "Instagram", color: "hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888]" },
                  { Icon: IconTikTok,     href: SITE.social.tiktok,    label: "TikTok",    color: "hover:bg-[#010101]" },
                  { Icon: Linkedin,       href: SITE.social.linkedin,  label: "LinkedIn",  color: "hover:bg-[#0A66C2]" },
                  { Icon: Youtube,        href: SITE.social.youtube,   label: "YouTube",   color: "hover:bg-[#FF0000]" },
                  { Icon: MessageCircle,  href: SITE.social.whatsapp,  label: "WhatsApp",  color: "hover:bg-[#25D366]" },
                ].map(({ Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`w-9 h-9 rounded-xl bg-white/10 ${color} flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
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
