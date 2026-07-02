"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, Phone, Mail, MapPin, CheckCircle2, XCircle, RefreshCw, TrendingUp, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Client { id: string; nom: string; email?: string; telephone?: string; ville?: string; secteur?: string; isActive: boolean; createdAt: string; }
function fmtDate(iso: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso)); }

const EMPTY = { nom: "", entreprise: "", type: "ENTREPRISE", email: "", telephone: "", adresse: "", secteur: "", notes: "" };

export default function AdminClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [modal, setModal] = useState<"" | "create" | "edit">("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-clients", search, activeFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (activeFilter !== "") p.set("isActive", activeFilter);
      const res = await apiClient.get<{ data: Client[]; meta: { total: number } }>(`/clients?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-clients-stats"],
    queryFn: async () => {
      const res = await apiClient.get<{ total: number; active: number; newThisMonth: number }>("/clients/stats");
      return res.data;
    },
  });

  const clients = data?.data ?? [];

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openEdit(c: Client) {
    setSelected(c);
    setForm({ nom: c.nom, entreprise: "", type: "ENTREPRISE", email: c.email ?? "", telephone: c.telephone ?? "", adresse: c.ville ?? "", secteur: c.secteur ?? "", notes: "" });
    setErr(""); setModal("edit");
  }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { nom: form.nom, entreprise: form.entreprise || undefined, type: form.type as any, email: form.email || undefined, telephone: form.telephone || undefined, adresse: form.adresse || undefined, secteur: form.secteur || undefined, notes: form.notes || undefined };
      if (modal === "create") await apiClient.post("/clients", payload);
      else if (modal === "edit" && selected) await apiClient.put(`/clients/${selected.id}`, payload);
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
      qc.invalidateQueries({ queryKey: ["admin-clients-stats"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Clients</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} clients enregistrés</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouveau client
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total clients", value: stats.total, icon: Building2, color: "text-primary" },
            { label: "Clients actifs", value: stats.active, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Nouveaux ce mois", value: stats.newThisMonth, icon: TrendingUp, color: "text-accent" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-grey-light dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Icon className={cn("w-5 h-5", color)} /></div>
              <div>
                <p className="text-2xl font-heading font-extrabold text-grey-anthracite dark:text-white">{value}</p>
                <p className="text-xs text-grey-text dark:text-white/40 font-heading">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value as "" | "true" | "false")}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Tous</option><option value="true">Actifs</option><option value="false">Inactifs</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-grey-text dark:text-white/50 text-sm">{getApiError(error)}</div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Building2 className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucun client</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90"><Plus className="w-4 h-4" /> Nouveau client</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Client", "Contact", "Ville / Secteur", "Statut", "Depuis", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Building2 className="w-4 h-4 text-primary" /></div>
                      <span className="font-heading font-semibold text-grey-anthracite dark:text-white">{c.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-grey-text dark:text-white/60">
                    <div className="space-y-0.5">
                      {c.email && <div className="flex items-center gap-1.5 text-xs"><Mail className="w-3 h-3" />{c.email}</div>}
                      {c.telephone && <div className="flex items-center gap-1.5 text-xs"><Phone className="w-3 h-3" />{c.telephone}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">
                    {c.ville && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{c.ville}</div>}
                    {c.secteur && <div className="text-grey-text/60 dark:text-white/30 mt-0.5">{c.secteur}</div>}
                  </td>
                  <td className="px-4 py-4">
                    {c.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="w-3 h-3" /> Actif</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40"><XCircle className="w-3 h-3" /> Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/40">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-4">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal === "create" || modal === "edit"} onClose={() => setModal("")} title={modal === "create" ? "Nouveau client" : "Modifier le client"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Nom / Raison sociale *</label><input value={form.nom} onChange={f("nom")} required placeholder="Banque Atlantique CI" className={inputCls} /></div>
            <div><label className={labelCls}>Entreprise</label><input value={form.entreprise} onChange={f("entreprise")} placeholder="Nom complet SARL..." className={inputCls} /></div>
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type} onChange={f("type")} className={inputCls}>
                <option value="ENTREPRISE">Entreprise</option><option value="PARTICULIER">Particulier</option><option value="ADMINISTRATION">Administration</option><option value="ONG">ONG</option>
              </select>
            </div>
            <div><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={f("email")} placeholder="contact@entreprise.ci" className={inputCls} /></div>
            <div><label className={labelCls}>Téléphone</label><input value={form.telephone} onChange={f("telephone")} placeholder="+225 20 00 00 00" className={inputCls} /></div>
            <div><label className={labelCls}>Adresse</label><input value={form.adresse} onChange={f("adresse")} placeholder="Plateau, Abidjan" className={inputCls} /></div>
            <div><label className={labelCls}>Secteur d'activité</label><input value={form.secteur} onChange={f("secteur")} placeholder="Finance, Industrie..." className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Notes internes</label><textarea value={form.notes} onChange={f("notes")} rows={2} placeholder="Informations importantes sur ce client..." className={inputCls + " resize-none"} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Enregistrement..." : modal === "create" ? "Créer le client" : "Enregistrer"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
