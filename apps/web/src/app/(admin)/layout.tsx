"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, TrendingUp, FileText, Receipt,
  Wrench, Package, BookOpen, Settings, Bell, Menu, X,
  Shield, ChevronRight, LogOut, User, FolderOpen,
  Building2, Megaphone, Briefcase, BarChart3, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenStorage } from "@/lib/api/client";
import { SysticLogo } from "@/components/ui/SysticLogo";

const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord", exact: true },
      { href: "/crm", icon: TrendingUp, label: "CRM — Pipeline" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/admin/clients", icon: Building2, label: "Clients" },
      { href: "/admin/devis", icon: FileText, label: "Devis" },
      { href: "/admin/contrats", icon: FolderOpen, label: "Contrats" },
      { href: "/admin/factures", icon: Receipt, label: "Factures" },
      { href: "/admin/interventions", icon: Wrench, label: "Interventions" },
      { href: "/admin/stocks", icon: Package, label: "Stocks" },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/academie", icon: BookOpen, label: "Académie" },
      { href: "/admin/blog", icon: Megaphone, label: "Blog" },
      { href: "/admin/carrieres", icon: Briefcase, label: "Carrières" },
      { href: "/admin/portfolio", icon: BarChart3, label: "Portfolio" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/users", icon: Users, label: "Utilisateurs" },
      { href: "/admin/tickets", icon: MessageSquare, label: "Tickets" },
      { href: "/admin/settings", icon: Settings, label: "Paramètres" },
    ],
  },
];

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    TokenStorage.clear();
    router.push("/login");
  };

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-[#0D1F4E] border-r border-border overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
        <Link href="/" onClick={onClose} className="hover:opacity-90 transition-opacity">
          <SysticLogo variant="dark" height={28} />
        </Link>
        <div className="text-[10px] text-grey-text dark:text-white/40 font-heading">Administration</div>
        {onClose && (
          <button onClick={onClose} className="text-grey-text dark:text-white/40 hover:text-primary lg:hidden" aria-label="Fermer le menu">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-5" aria-label="Navigation admin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-grey-text dark:text-white/30 px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
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
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-heading font-semibold text-sm text-grey-anthracite dark:text-white truncate">Admin</div>
            <div className="text-[10px] text-grey-text dark:text-white/40 truncate">Super Admin</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-grey-text dark:text-white/40 hover:text-accent transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-grey-light dark:bg-[#0A1630] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-60 flex-shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-64 h-full">
            <AdminSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-[#0D1F4E] border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-grey-text dark:text-white/60 hover:text-primary"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden font-heading font-bold text-grey-anthracite dark:text-white text-sm">SYSTIC-CI Admin</div>

          <div className="hidden lg:flex items-center gap-1 text-xs text-grey-text dark:text-white/40">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="font-heading font-semibold text-primary">Back-Office</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-grey-text dark:text-white/40 hover:text-primary transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
