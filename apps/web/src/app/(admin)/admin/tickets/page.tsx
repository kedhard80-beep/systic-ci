"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Search, RefreshCw, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Ticket {
  id: string;
  reference?: string;
  sujet?: string;
  status?: string;
  priority?: string;
  createdAt: string;
  client?: { nom: string };
  assignedTo?: { firstName: string; lastName: string };
}

function fmt(iso: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso)); }

const STATUS_COLORS: Record<string, string> = {
  OUVERT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EN_COURS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  EN_ATTENTE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  RESOLU: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  FERME: "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40",
};
const PRIO_COLORS: Record<string, string> = {
  BASSE: "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40",
  NORMALE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  HAUTE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CRITIQUE: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
};

const EMPTY = { sujet: "", description: "", categorie: "", priority: "NORMALE", clientId: "" };

export default function AdminTicketsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<"" | "create" | "status">("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data: clientsData } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => { const res = await apiClient.get<{ data: { id: string; nom: string }[] }>("/clients?limit=200"); return res.data.data; },
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-tickets", search, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (statusFilter) p.set("status", statusFilter);
      const res = await apiClient.get<{ data: Ticket[]; meta: { total: number } }>(`/tickets?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const tickets = data?.data ?? [];
  const open = tickets.filter(t => t.status === "OUVERT" || t.status === "EN_COURS").length;
  const resolved = tickets.filter(t => t.status === "RESOLU" || t.status === "FERME").length;

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openStatus(t: Ticket) { setSelected(t); setNewStatus(t.status ?? "OUVERT"); setErr(""); setModal("status"); }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/tickets", { sujet: form.sujet, description: form.description, categorie: form.categorie || undefined, priority: form.priority as any, clientId: form.clientId || undefined });
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleStatusChange() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.patch(`/tickets/${selected.id}/status`, { status: newStatus });
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Tickets Support</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} tickets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouveau ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ouverts", value: open, color: "text-blue-500" },
          { label: "Total", value: tickets.length, color: "text-primary" },
          { label: "Résolus", value: resolved, color: "text-emerald-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4">
            <p className={cn("text-2xl font-heading font-extrabold", color)}>{value}</p>
            <p className="text-xs text-grey-text dark:text-white/40 font-heading mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher un ticket..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Tous statuts</option>
          <option value="OUVERT">Ouvert</option><option value="EN_COURS">En cours</option><option value="RESOLU">Résolu</option><option value="FERME">Fermé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><MessageSquare className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucun ticket</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90"><Plus className="w-4 h-4" /> Nouveau ticket</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Référence", "Sujet", "Client", "Priorité", "Assigné à", "Date", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-4 h-4 text-primary" /></div>
                      <span className="font-heading font-semibold text-grey-anthracite dark:text-white text-xs">{t.reference ?? t.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-anthracite dark:text-white max-w-xs"><p className="line-clamp-2">{t.sujet ?? "—"}</p></td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{t.client?.nom ?? "—"}</td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2 py-0.5 rounded-md text-xs font-heading font-semibold", PRIO_COLORS[t.priority ?? ""] ?? "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {t.priority ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">
                    {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/40">{fmt(t.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", STATUS_COLORS[t.status ?? ""] ?? "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {t.status?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => openStatus(t)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors" title="Changer statut"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal === "create"} onClose={() => setModal("")} title="Nouveau ticket" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className={labelCls}>Sujet *</label><input value={form.sujet} onChange={f("sujet")} required placeholder="Sujet du ticket..." className={inputCls} /></div>
          <div><label className={labelCls}>Description *</label><textarea value={form.description} onChange={f("description")} required rows={4} placeholder="Décrivez le problème en détail..." className={inputCls + " resize-none"} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Catégorie</label><input value={form.categorie} onChange={f("categorie")} placeholder="Ex: Technique, Facturation..." className={inputCls} /></div>
            <div>
              <label className={labelCls}>Priorité</label>
              <select value={form.priority} onChange={f("priority")} className={inputCls}>
                <option value="BASSE">Basse</option><option value="NORMALE">Normale</option><option value="HAUTE">Haute</option><option value="CRITIQUE">Critique</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Client concerné</label>
            <select value={form.clientId} onChange={f("clientId")} className={inputCls}>
              <option value="">Aucun (ticket interne)</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Créer le ticket"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={modal === "status"} onClose={() => setModal("")} title="Changer le statut" size="sm">
        <div className="space-y-4">
          <p className="text-xs text-grey-text dark:text-white/50">Ticket : <strong className="text-grey-anthracite dark:text-white">{selected?.reference ?? selected?.id?.slice(0, 8).toUpperCase()}</strong></p>
          <div>
            <label className={labelCls}>Nouveau statut</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={inputCls}>
              <option value="OUVERT">Ouvert</option><option value="EN_COURS">En cours</option><option value="EN_ATTENTE">En attente</option><option value="RESOLU">Résolu</option><option value="FERME">Fermé</option>
            </select>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button onClick={handleStatusChange} disabled={saving} className={btnPrimary}>{saving ? "Mise à jour..." : "Confirmer"}</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
