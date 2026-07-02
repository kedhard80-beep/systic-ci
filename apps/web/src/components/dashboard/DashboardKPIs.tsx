'use client';

import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Wrench, FileText, AlertCircle,
  DollarSign, Star, Activity,
} from 'lucide-react';
import { useSuperAdminDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';

function KpiCard({
  label, value, sub, icon: Icon, colorClass, index,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; colorClass: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border p-5 flex gap-4 items-start"
    >
      <span className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function SkeletonKpi() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex gap-4 items-start animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-muted rounded w-24" />
        <div className="h-6 bg-muted rounded w-32" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    </div>
  );
}

// Données statiques de démonstration utilisées quand l'API est hors-ligne
const FALLBACK_KPIS = [
  { label: 'CA mensuel', value: '12 450 000 XOF', sub: '+18% vs mois préc.', icon: DollarSign, colorClass: 'bg-primary/10 text-primary' },
  { label: 'Clients', value: '47', sub: '+5 ce mois', icon: Users, colorClass: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Interventions mois', value: '23', sub: '156 total', icon: Wrench, colorClass: 'bg-yellow-500/10 text-yellow-600' },
  { label: 'Taux conversion devis', value: '68%', sub: '34 devis total', icon: Star, colorClass: 'bg-accent/10 text-accent' },
  { label: 'Tickets ouverts', value: '8', sub: 'En attente', icon: AlertCircle, colorClass: 'bg-orange-500/10 text-orange-500' },
  { label: 'Pipeline devis', value: '9 ce mois', sub: 'Conv. 68%', icon: TrendingUp, colorClass: 'bg-primary/10 text-primary' },
  { label: 'Techniciens actifs', value: '6', sub: 'Disponibles', icon: Activity, colorClass: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Étudiants Académie', value: '24', sub: 'Inscrits', icon: FileText, colorClass: 'bg-violet-500/10 text-violet-600' },
];

export function DashboardKPIs() {
  const { data, isLoading, isError } = useSuperAdminDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonKpi key={i} />)}
      </div>
    );
  }

  // API hors-ligne ou erreur : afficher données statiques avec badge discret
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
          Données de démonstration — API non disponible
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FALLBACK_KPIS.map((kpi, i) => (
            <KpiCard key={kpi.label} {...kpi} index={i} />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data
    ? [
        {
          label: 'CA mensuel',
          value: formatCurrency(data.kpis.revenue.current),
          sub: `${data.kpis.revenue.growth >= 0 ? '+' : ''}${Math.round(data.kpis.revenue.growth)}% vs mois préc.`,
          icon: DollarSign,
          colorClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Clients',
          value: String(data.kpis.clients.total),
          sub: `+${data.kpis.clients.new} ce mois`,
          icon: Users,
          colorClass: 'bg-emerald-500/10 text-emerald-600',
        },
        {
          label: 'Interventions mois',
          value: String(data.kpis.interventions.thisMonth),
          sub: `${data.kpis.interventions.total} total`,
          icon: Wrench,
          colorClass: 'bg-yellow-500/10 text-yellow-600',
        },
        {
          label: 'Taux conversion devis',
          value: `${data.kpis.quotes.conversionRate}%`,
          sub: `${data.kpis.quotes.total} devis total`,
          icon: Star,
          colorClass: 'bg-accent/10 text-accent',
        },
        {
          label: 'Tickets ouverts',
          value: String(data.kpis.tickets.pending),
          sub: 'En attente',
          icon: AlertCircle,
          colorClass: 'bg-orange-500/10 text-orange-500',
        },
        {
          label: 'Pipeline devis',
          value: `${data.kpis.quotes.thisMonth} ce mois`,
          sub: `Conv. ${data.kpis.quotes.conversionRate}%`,
          icon: TrendingUp,
          colorClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Techniciens actifs',
          value: String(data.kpis.techniciens.active),
          sub: 'Disponibles',
          icon: Activity,
          colorClass: 'bg-emerald-500/10 text-emerald-600',
        },
        {
          label: 'Étudiants Académie',
          value: String(data.kpis.students.total),
          sub: 'Inscrits',
          icon: FileText,
          colorClass: 'bg-violet-500/10 text-violet-600',
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} {...kpi} index={i} />
      ))}
    </div>
  );
}
