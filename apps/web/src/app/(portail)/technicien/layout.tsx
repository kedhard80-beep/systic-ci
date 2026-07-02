"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Package, FileText,
  LogOut, Menu, X, Shield, ChevronRight, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/technicien", icon: LayoutDashboard, label: "Missions du jour", exact: true },
  { href: "/technicien/planning", icon: CalendarDays, label: "Planning" },
  { href: "/technicien/stock", icon: Package, label: "Mon stock" },
  { href: "/technicien/rapports", icon: FileText, label: "Rapports" },
];

function TechSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="h-full flex flex-col bg-navy dark:bg-[#0D1F4E] border-r border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Wrench className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-sm text-white">SYSTIC-CI</div>
            <div className="text-[10px] text-white/40 -mt-0.5">Portail Technicien</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Navigation technicien">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all",
                active ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" aria-hidden="true" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white/60" aria-hidden="true" />
          </div>
          <div>
            <div className="font-heading font-semibold text-sm text-white">Kouamé A.</div>
            <div className="text-[10px] text-white/40">Technicien Senior</div>
          </div>
        </div>
        <button className="flex items-center gap-2 text-xs text-white/30 hover:text-accent transition-colors">
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function TechnicienLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-grey-light dark:bg-[#0A1630] flex">
      <div className="hidden lg:block w-60 flex-shrink-0 h-screen sticky top-0">
        <TechSidebar />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64"><TechSidebar onClose={() => setMobileOpen(false)} /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-navy text-white border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white/60 hover:text-white" aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden font-heading font-bold text-sm">Portail Technicien</div>
          <div className="ml-auto text-xs text-white/40">
            {new Date().toLocaleDateString("fr-CI", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
