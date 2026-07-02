"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText, Receipt, Wrench, MessageSquare, Bell,
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Download, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useUser } from "@/lib/store/auth.store";
import {
  useClientInvoices,
  useClientInterventions,
  useClientContracts,
  useClientTickets,
  usePortailNotifications,
} from "@/hooks/usePortailClient";

/* ─── Types locaux ─── */
interface StatusConfig {
  style: string;
  label: string;
}
const STATUS_MAP: Record<string, StatusConfig> = {
  TERMINEE:   { style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Terminée" },
  PLANIFIEE:  { style: "bg-primary/10 text-primary", label: "Planifiée" },
  EN_COURS:   { style: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", label: "En cours" },
  EN_ATTENTE: { style: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", label: "En attente" },
  PAYEE:      { style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Payée" },
  ANNULEE:    { style: "bg-grey-text/10 text-grey-text", label: "Annulée" },
};

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0D1F4E] rounded-2xl p-5 border border-border shadow-sm animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-grey-light dark:bg-white/10 mb-4" />
      <div className="h-8 w-16 bg-grey-light dark:bg-white/10 rounded mb-2" />
      <div className="h-4 w-28 bg-grey-light dark:bg-white/5 rounded" />
    </div>
  );
}

export default function PortailDashboard() {
  const user = useUser();

  const { data: interventionsData, isLoading: loadingInt } = useClientInterventions({ limit: 3 });
  const { data: invoicesData, isLoading: loadingInv }     = useClientInvoices({ limit: 3 });
  const { data: contractsData }                            = useClientContracts({ limit: 5 });
  const { data: ticketsData }                              = useClientTickets({ limit: 5 });
  const { data: notificationsData }                        = usePortailNotifications();

  const interventions = interventionsData?.data ?? [];
  const invoices      = invoicesData?.data ?? [];
  const contracts     = contractsData?.data ?? [];
  const tickets       = ticketsData?.data ?? [];
  const notifications = notificationsData?.data ?? [];

  // KPIs calculés depuis les données API
  const kpis = [
    {
      label: "Contrats actifs",
      value: contracts.filter((c: any) => c.status === 'ACTIF').length || contracts.length || "—",
      icon: FileText, color: "bg-primary/10 text-primary", trend: null,
    },
    {
      label: "Factures en attente",
      value: invoices.filter((i: any) => i.status === 'EN_ATTENTE').length || "—",
      icon: Receipt, color: "bg-yellow-500/10 text-yellow-500",
      trend: (() => {
        const pending = invoices.filter((i: any) => i.status === 'EN_ATTENTE');
        const total = pending.reduce((s: number, i: any) => s + (i.totalTTC ?? 0), 0);
        return total > 0 ? formatCurrency(total) : null;
      })(),
    },
    {
      label: "Interventions ce mois",
      value: interventions.length || "—",
      icon: Wrench, color: "bg-emerald-500/10 text-emerald-500", trend: null,
    },
    {
      label: "Tickets ouverts",
      value: tickets.filter((t: any) => t.status !== 'FERME' && t.status !== 'RESOLU').length || "—",
      icon: MessageSquare, color: "bg-accent/10 text-accent", trend: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-grey-anthracite dark:text-white mb-1">
          Bonjour, {user?.firstName ?? "Client"} 👋
        </h1>
        <p className="text-grey-text dark:text-white/50 text-sm">
          {"Espace client SYSTIC-CI"} ·{" "}
          {new Date().toLocaleDateString("fr-CI", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loadingInt || loadingInv
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-[#0D1F4E] rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                {kpi.trend && (
                  <span className="text-xs text-grey-text dark:text-white/40 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" aria-hidden="true" /> {kpi.trend}
                  </span>
                )}
              </div>
              <div className="font-heading font-extrabold text-3xl text-grey-anthracite dark:text-white mb-1">
                {String(kpi.value)}
              </div>
              <div className="text-sm text-grey-text dark:text-white/50">{kpi.label}</div>
            </div>
          ))
        }
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent interventions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-heading font-bold text-base text-grey-anthracite dark:text-white">Interventions récentes</h2>
            <Link href="/portail/interventions" className="text-xs text-primary hover:underline font-heading font-semibold flex items-center gap-1">
              Voir tout <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {loadingInt ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-grey-light dark:bg-white/10 rounded" />
                    <div className="h-4 w-48 bg-grey-light dark:bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-grey-light dark:bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : interventions.length > 0 ? (
            <div className="divide-y divide-border">
              {interventions.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-heading font-bold text-grey-text dark:text-white/40">{item.numero ?? item.id}</span>
                      {item.status && (
                        <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full ${STATUS_MAP[item.status]?.style ?? ''}`}>
                          {STATUS_MAP[item.status]?.label ?? item.status}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white truncate">
                      {item.type ?? item.title ?? "Intervention"}
                    </div>
                    <div className="text-xs text-grey-text dark:text-white/40 mt-0.5">
                      {item.scheduledAt ? formatDate(item.scheduledAt) : "—"}
                      {item.technicien && ` · ${item.technicien.user?.firstName ?? ''} ${item.technicien.user?.lastName ?? ''}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-grey-text dark:text-white/40">
              Aucune intervention pour le moment.
            </div>
          )}

          <div className="p-4 border-t border-border">
            <Link href="/portail/interventions">
              <button className="btn-primary text-sm w-full">
                Voir toutes les interventions <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Factures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-heading font-bold text-sm text-grey-anthracite dark:text-white">Factures</h2>
              <Link href="/portail/factures" className="text-xs text-primary hover:underline font-heading font-semibold">Voir tout</Link>
            </div>

            {loadingInv ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-grey-light dark:bg-white/10 rounded" />
                    <div className="h-4 w-40 bg-grey-light dark:bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : invoices.length > 0 ? (
              <div className="divide-y divide-border">
                {invoices.slice(0, 3).map((inv: any) => (
                  <div key={inv.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-heading font-bold text-grey-text dark:text-white/40 mb-0.5">{inv.numero ?? inv.id}</div>
                        <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white">{inv.description ?? "Facture"}</div>
                      </div>
                      {inv.status && (
                        <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${STATUS_MAP[inv.status]?.style ?? ''}`}>
                          {STATUS_MAP[inv.status]?.label ?? inv.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-heading font-bold text-sm text-grey-anthracite dark:text-white">
                        {formatCurrency(inv.totalTTC ?? inv.amount ?? 0)}
                      </span>
                      {inv.dueDate && (
                        <span className="text-[10px] text-grey-text dark:text-white/40">Échéance {formatDate(inv.dueDate)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-grey-text dark:text-white/40 text-center">Aucune facture.</div>
            )}

            <div className="p-3 border-t border-border">
              <Link href="/portail/factures">
                <button className="w-full flex items-center justify-center gap-1.5 text-xs font-heading font-semibold text-primary hover:underline">
                  <Download className="w-3.5 h-3.5" aria-hidden="true" /> Télécharger les factures
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-heading font-bold text-sm text-grey-anthracite dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4" aria-hidden="true" /> Notifications
              </h2>
              {notifications.length > 0 && (
                <span className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full bg-accent text-white">
                  {notifications.length}
                </span>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.slice(0, 4).map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 flex-shrink-0">
                      {n.type === "SUCCESS" && <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
                      {n.type === "WARNING" && <AlertCircle className="w-4 h-4 text-yellow-500" aria-hidden="true" />}
                      {(n.type === "INFO" || !n.type) && <Bell className="w-4 h-4 text-primary" aria-hidden="true" />}
                    </div>
                    <div>
                      <div className="text-xs text-grey-anthracite dark:text-white leading-relaxed">{n.message ?? n.title}</div>
                      <div className="text-[10px] text-grey-text dark:text-white/30 mt-0.5">
                        {n.createdAt ? formatRelativeTime(n.createdAt) : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-sm text-grey-text dark:text-white/40 text-center">Aucune notification.</div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border shadow-sm p-5"
      >
        <h2 className="font-heading font-bold text-base text-grey-anthracite dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: MessageSquare, label: "Nouveau ticket", href: "/portail/tickets/nouveau", color: "text-primary" },
            { icon: Receipt, label: "Payer une facture", href: "/portail/factures", color: "text-yellow-500" },
            { icon: Download, label: "Télécharger docs", href: "/portail/telechargements", color: "text-emerald-500" },
            { icon: Clock, label: "Planifier une visite", href: "/contact", color: "text-accent" },
          ].map(({ icon: Icon, label, href, color }) => (
            <Link key={href} href={href}>
              <button className="w-full flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-grey-light dark:hover:bg-white/5 transition-colors text-center">
                <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                <span className="text-xs font-heading font-semibold text-grey-anthracite dark:text-white leading-tight">{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
