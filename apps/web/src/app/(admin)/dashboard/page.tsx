"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Wrench, FileText, AlertCircle,
  CheckCircle2, Clock, ArrowUpRight, Activity,
  DollarSign, Star, BarChart3,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";

const KPI_DATA = [
  { label: "CA mensuel", value: "12 450 000 XOF", change: "+18%", icon: DollarSign, color: "bg-primary/10 text-primary", positive: true },
  { label: "Nouveaux clients", value: "47", change: "+12 ce mois", icon: Users, color: "bg-emerald-500/10 text-emerald-600", positive: true },
  { label: "Interventions/sem.", value: "23", change: "+3 vs sem. préc.", icon: Wrench, color: "bg-yellow-500/10 text-yellow-600", positive: true },
  { label: "Taux satisfaction", value: "96%", change: "+2pts", icon: Star, color: "bg-accent/10 text-accent", positive: true },
  { label: "Tickets ouverts", value: "8", change: "-4 vs hier", icon: AlertCircle, color: "bg-orange-500/10 text-orange-500", positive: true },
  { label: "Pipeline CRM", value: "48 200 000 XOF", change: "12 deals actifs", icon: TrendingUp, color: "bg-primary/10 text-primary", positive: true },
  { label: "Techniciens actifs", value: "6/8", change: "2 en congé", icon: Activity, color: "bg-emerald-500/10 text-emerald-600", positive: null },
  { label: "Factures en retard", value: "3", change: "520 000 XOF", icon: FileText, color: "bg-accent/10 text-accent", positive: false },
];

const REVENUE_MONTHS = [
  { month: "Juin", value: 8200000 },
  { month: "Juil", value: 9100000 },
  { month: "Août", value: 7800000 },
  { month: "Sep", value: 10500000 },
  { month: "Oct", value: 11200000 },
  { month: "Nov", value: 10800000 },
  { month: "Déc", value: 12450000 },
];

const RECENT_ACTIVITIES = [
  { type: "deal_won", text: "Deal gagné : Groupe Pétrolier CI — 8,2M XOF", time: "2024-12-10T09:00:00", icon: CheckCircle2, color: "text-emerald-500" },
  { type: "new_client", text: "Nouveau client : Clinique Sainte Marie enregistrée", time: "2024-12-10T08:30:00", icon: Users, color: "text-primary" },
  { type: "intervention", text: "Intervention terminée : INT-2024-0089 chez Station Total", time: "2024-12-09T17:00:00", icon: Wrench, color: "text-yellow-500" },
  { type: "invoice", text: "Facture FAC-2024-0041 payée : 245 000 XOF", time: "2024-12-09T14:20:00", icon: DollarSign, color: "text-emerald-500" },
  { type: "alert", text: "Ticket TKT-0025 urgent : Banque SGBCI — panne caméra PTZ", time: "2024-12-09T11:00:00", icon: AlertCircle, color: "text-accent" },
  { type: "training", text: "Nouvelle inscription Académie : Module M1 — 5 apprenants", time: "2024-12-08T16:00:00", icon: Star, color: "text-primary" },
];

const TOP_CLIENTS = [
  { name: "Groupe Pétrolier CI", revenue: 8200000, deals: 3 },
  { name: "Banque Atlantique", revenue: 6500000, deals: 2 },
  { name: "Usine Choco CI", revenue: 5200000, deals: 1 },
  { name: "Hôtel Ivoire Boutique", revenue: 4800000, deals: 2 },
  { name: "CFAO Motors", revenue: 3200000, deals: 1 },
];

const maxRevenue = Math.max(...REVENUE_MONTHS.map((m) => m.value));

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Tableau de bord</h1>
        <p className="text-sm text-grey-text dark:text-white/50">
          {new Date().toLocaleDateString("fr-CI", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </motion.div>

      {/* KPIs — données réelles via API */}
      <DashboardKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-bold text-base text-grey-anthracite dark:text-white">Chiffre d&apos;affaires</h2>
              <p className="text-xs text-grey-text dark:text-white/40">7 derniers mois</p>
            </div>
            <BarChart3 className="w-5 h-5 text-grey-text dark:text-white/30" aria-hidden="true" />
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-40" role="img" aria-label="Graphique CA mensuel">
            {REVENUE_MONTHS.map((m, i) => {
              const heightPct = (m.value / maxRevenue) * 100;
              const isLast = i === REVENUE_MONTHS.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-heading font-bold text-grey-text dark:text-white/40">
                    {(m.value / 1000000).toFixed(1)}M
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                    className={`w-full rounded-t-xl ${isLast ? "bg-primary" : "bg-primary/30"}`}
                    style={{ minHeight: 4 }}
                  />
                  <div className="text-[10px] text-grey-text dark:text-white/40">{m.month}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-5 shadow-sm"
        >
          <h2 className="font-heading font-bold text-base text-grey-anthracite dark:text-white mb-4">Top Clients</h2>
          <div className="space-y-3">
            {TOP_CLIENTS.map((client, i) => {
              const pct = (client.revenue / TOP_CLIENTS[0].revenue) * 100;
              return (
                <div key={client.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-heading font-bold text-grey-text dark:text-white/30 w-4">{i + 1}</span>
                      <span className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white truncate max-w-[130px]">{client.name}</span>
                    </div>
                    <span className="text-xs font-heading font-bold text-primary flex-shrink-0">{(client.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                    className="h-1.5 bg-primary/30 rounded-full"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-heading font-bold text-base text-grey-anthracite dark:text-white">Activité récente</h2>
            <Activity className="w-4 h-4 text-grey-text dark:text-white/30" aria-hidden="true" />
          </div>
          <div className="divide-y divide-border">
            {RECENT_ACTIVITIES.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-4 hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded-xl bg-grey-light dark:bg-white/5 flex items-center justify-center flex-shrink-0 ${act.color}`}>
                  <act.icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-grey-anthracite dark:text-white leading-relaxed">{act.text}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-grey-text dark:text-white/30">
                    <Clock className="w-3 h-3" aria-hidden="true" /> {formatRelativeTime(act.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
