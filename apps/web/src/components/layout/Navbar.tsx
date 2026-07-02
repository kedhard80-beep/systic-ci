"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, Phone, Mail,
  Shield, Zap, Camera, Fingerprint,
  ShieldAlert, Server, Home, Network,
  Moon, Sun, Search, User, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { useTheme } from "next-themes";
import { SysticLogo } from "@/components/ui/SysticLogo";

// ===== ICON MAP =====
const iconMap: Record<string, React.ElementType> = {
  ShieldCheck: Shield,
  Zap,
  Camera,
  Fingerprint,
  ShieldAlert,
  Server,
  Home,
  Network,
};

// ===== MEGA MENU DATA =====
const MEGA_MENU_METIERS = {
  "Courant Faible": {
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    href: "/metiers/courant-faible",
    items: [
      { label: "Vidéosurveillance IP", href: "/metiers/courant-faible#videosurveillance", icon: Camera },
      { label: "Contrôle d'Accès", href: "/metiers/courant-faible#controle-acces", icon: Fingerprint },
      { label: "Sécurité Périmétrique", href: "/metiers/courant-faible#securite", icon: ShieldAlert },
      { label: "Monitoring Datacenters", href: "/metiers/courant-faible#monitoring", icon: Server },
      { label: "Domotique & Smart Building", href: "/metiers/courant-faible#domotique", icon: Home },
      { label: "Réseaux & Téléphonie IP", href: "/metiers/courant-faible#reseaux", icon: Network },
    ],
  },
  "Courant Fort": {
    icon: Zap,
    color: "text-accent",
    bg: "bg-accent/10",
    href: "/metiers/courant-fort",
    items: [
      { label: "Câblage Électrique", href: "/metiers/courant-fort#cablage", icon: Zap },
      { label: "Tableaux TGBT", href: "/metiers/courant-fort#tableaux", icon: Shield },
      { label: "Groupes Électrogènes", href: "/metiers/courant-fort#groupes", icon: Zap },
      { label: "Éclairage Industriel", href: "/metiers/courant-fort#eclairage", icon: Zap },
    ],
  },
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownEnter = (label: string) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* TOP BAR */}
      <div className="hidden lg:block bg-navy text-white/80 text-xs py-2">
        <div className="container-section flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{SITE.phone[0]}</span>
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3" />
              <span>{SITE.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60">{SITE.hours.office}</span>
            <Badge variant="accent" size="sm" className="animate-pulse">
              Terrain 7j/7
            </Badge>
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <motion.header
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-white/90 dark:bg-navy/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-white dark:bg-navy border-b border-border"
        )}
        role="banner"
      >
        <div className="container-section">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* LOGO */}
            <Link href="/" aria-label="SYSTIC-CI — Accueil" className="hover:opacity-90 transition-opacity duration-200">
              <span className="block dark:hidden">
                <SysticLogo variant="light" height={36} />
              </span>
              <span className="hidden dark:block">
                <SysticLogo variant="dark" height={36} />
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Navigation principale"
            >
              {NAV_LINKS.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.label === "Nos Métiers" && handleDropdownEnter(link.label)}
                  onMouseLeave={() => link.label === "Nos Métiers" && handleDropdownLeave()}
                >
                  {link.label === "Nos Métiers" ? (
                    <button
                      className={cn(
                        "nav-link flex items-center gap-1 px-3 py-2 rounded-lg",
                        isActive(link.href) && "text-primary"
                      )}
                      aria-expanded={activeDropdown === link.label}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          activeDropdown === link.label && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "nav-link px-3 py-2 rounded-lg block",
                        isActive(link.href) &&
                          "text-primary bg-primary/5 font-bold"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* MEGA MENU */}
                  <AnimatePresence>
                    {link.label === "Nos Métiers" && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] rounded-2xl border border-border bg-white dark:bg-navy shadow-premium overflow-hidden"
                        role="menu"
                        onMouseEnter={() => handleDropdownEnter(link.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="grid grid-cols-2 divide-x divide-border">
                          {Object.entries(MEGA_MENU_METIERS).map(([category, data]) => (
                            <div key={category} className="p-6">
                              <Link
                                href={data.href}
                                className="flex items-center gap-2 mb-4 group/cat"
                                role="menuitem"
                              >
                                <div className={cn("p-2 rounded-lg", data.bg)}>
                                  <data.icon className={cn("w-4 h-4", data.color)} aria-hidden="true" />
                                </div>
                                <span className={cn("font-heading font-bold text-sm", data.color)}>
                                  {category}
                                </span>
                              </Link>
                              <ul className="space-y-1" role="none">
                                {data.items.map((item) => (
                                  <li key={item.href} role="none">
                                    <Link
                                      href={item.href}
                                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-grey-text dark:text-white/70 hover:text-primary dark:hover:text-white hover:bg-primary/5 transition-colors group/item"
                                      role="menuitem"
                                    >
                                      <item.icon className="w-3.5 h-3.5 text-grey-text/50 group-hover/item:text-primary transition-colors" aria-hidden="true" />
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border bg-grey-light/50 dark:bg-white/5 px-6 py-3 flex items-center justify-between">
                          <span className="text-xs text-grey-text dark:text-white/50">
                            Interventions 7j/7 à Abidjan et dans tout le pays
                          </span>
                          <Link
                            href="/contact"
                            className="text-xs font-heading font-bold text-primary hover:text-accent transition-colors"
                          >
                            Demander un devis →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                className="btn-ghost p-2 rounded-lg"
                aria-label="Rechercher"
                title="Rechercher"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                className="btn-ghost p-2 rounded-lg"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              <Link href="/auth/login">
                <Button variant="ghost-nav" size="sm">
                  <User className="w-4 h-4" aria-hidden="true" />
                  Connexion
                </Button>
              </Link>
              <Link href="/devis">
                <Button variant="accent" size="sm">
                  Demander un devis
                </Button>
              </Link>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-grey-light dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden border-t border-border bg-white dark:bg-navy"
              role="navigation"
              aria-label="Navigation mobile"
            >
              <div className="container-section py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.href}>
                    {link.label === "Nos Métiers" ? (
                      <>
                        <button
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-heading font-semibold text-sm text-grey-anthracite dark:text-white/90 hover:bg-grey-light dark:hover:bg-white/10 transition-colors"
                          )}
                          onClick={() =>
                            setExpandedMobile(
                              expandedMobile === "metiers" ? null : "metiers"
                            )
                          }
                          aria-expanded={expandedMobile === "metiers"}
                        >
                          {link.label}
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expandedMobile === "metiers" && "rotate-180"
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedMobile === "metiers" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden ml-4 mt-1 space-y-0.5"
                            >
                              {Object.entries(MEGA_MENU_METIERS).map(([cat, data]) => (
                                <div key={cat}>
                                  <Link
                                    href={data.href}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-lg font-heading font-bold text-xs tracking-wide uppercase",
                                      data.color
                                    )}
                                  >
                                    <data.icon className="w-3.5 h-3.5" />
                                    {cat}
                                  </Link>
                                  {data.items.map((item) => (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-grey-text dark:text-white/60 hover:text-primary dark:hover:text-white hover:bg-primary/5 transition-colors"
                                    >
                                      <item.icon className="w-3.5 h-3.5" />
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          "flex px-3 py-2.5 rounded-xl font-heading font-semibold text-sm transition-colors",
                          isActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-grey-anthracite dark:text-white/90 hover:bg-grey-light dark:hover:bg-white/10"
                        )}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile CTA */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-heading font-semibold hover:bg-grey-light dark:hover:bg-white/10 transition-colors"
                    >
                      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {theme === "dark" ? "Mode clair" : "Mode sombre"}
                    </button>
                    <Link href="/auth/login" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <User className="w-4 h-4" />
                        Connexion
                      </Button>
                    </Link>
                  </div>
                  <Link href="/devis" className="block">
                    <Button variant="accent" className="w-full">
                      Demander un devis
                    </Button>
                  </Link>
                  <div className="flex flex-col gap-1 pt-1">
                    <a
                      href={`tel:${SITE.phone[0].replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-sm text-grey-text dark:text-white/50 hover:text-primary"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {SITE.phone[0]}
                    </a>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="flex items-center gap-2 text-sm text-grey-text dark:text-white/50 hover:text-primary"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {SITE.email}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
