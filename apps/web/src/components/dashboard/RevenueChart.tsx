'use client';

import { useSuperAdminDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';

function Bar({ value, max, month }: { value: number; max: number; month: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">
        {formatCurrency(value)}
      </span>
      <div className="w-full bg-muted/50 rounded-full h-32 flex items-end overflow-hidden">
        <div
          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-700"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{month}</span>
    </div>
  );
}

export function RevenueChart() {
  const { data, isLoading } = useSuperAdminDashboard();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 animate-pulse">
        <div className="h-5 bg-muted rounded w-48 mb-6" />
        <div className="flex gap-3 items-end h-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 bg-muted rounded-full" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const trend = (data?.revenueTrend ?? []) as { month: string; revenue: number }[];
  const max = Math.max(...trend.map((t) => t.revenue), 1);

  const monthNames: Record<string, string> = {
    '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
    '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm">Chiffre d'affaires mensuel</h3>
          <p className="text-xs text-muted-foreground mt-0.5">12 derniers mois — XOF</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {data?.kpis?.revenue?.growth >= 0 ? '+' : ''}{Math.round(data?.kpis?.revenue?.growth ?? 0)}% ce mois
        </span>
      </div>
      <div className="flex gap-2 items-end">
        {trend.map((t) => {
          const [, mm] = t.month.split('-');
          return (
            <Bar key={t.month} value={t.revenue} max={max} month={monthNames[mm] ?? mm} />
          );
        })}
      </div>
    </div>
  );
}
