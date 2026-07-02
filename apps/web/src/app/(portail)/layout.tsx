"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Receipt, Wrench,
  MessageSquare, Bell, Download, LogOut, Menu, X,
  ChevronRight, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SysticLogo } from "@/components/ui/SysticLogo";

const NAV_ITEMS = [
  { href: "/portail", icon: LayoutDashboard, label: "Tableau de bord", exact: true },
  { href: "/portail/contrats", icon: FileText, label: "Contrats" },
  { href: "/portail/factures", icon: Receipt, label: "Factures" },
  { href: "/portail/interventions", icon: Wrench, label: "Interventions" },
  { href: "/portail/tickets", icon: MessageSquare, label: "Support" },
  { href: "/portail/telechargements", icon: Download, label: "Téléchargements" },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-[#0D1F4E] border-r border-border">
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/" onClick={onClose} className="hover:opacity-90 transition-opacity">
          <SysticLogo variant="dark" height={28} />
        </Link>
        <div className="text-[10px] text-grey-text dark:text-white/40 font-heading">Espace Client</div>
        {onClose && (
          <button onClick={onClose} className="text-grey-text dark:text-white/40 hover:text-primary" aria-label="Fermer le menu">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Navigation portail client">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-grey-text dark:text-white/60 hover:bg-grey-light dark:hover:bg-white/5 hover:text-grey-anthracite dark:hover:text-white"
              )}>
                <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" aria-hidden="true" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-heading font-semibold text-sm text-grey-anthracite dark:text-white truncate">Jean Dupont</div>
            <div className="text-[10px] text-grey-text dark:text-white/40 truncate">Client</div>
          </div>
        </div>
        <button className="flex items-center gap-2 text-xs text-grey-text dark:text-white/40 hover:text-accent transition-colors w-full">
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function PortailLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-grey-light dark:bg-[#0A1630] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-60 flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white dark:bg-[#0D1F4E] border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-grey-text dark:text-white/60 hover:text-primary"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden font-heading font-bold text-grey-anthracite dark:text-white text-sm">SYSTIC-CI</div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-grey-text dark:text-white/40 hover:text-primary" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
            </button>
            <Link href="/portail/messages">
              <button className="relative text-grey-text dark:text-white/40 hover:text-primary" aria-label="Messages">
                <MessageSquare className="w-5 h-5" />
              </button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
