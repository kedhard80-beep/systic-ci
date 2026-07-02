"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench, Search, RefreshCw, CalendarDays, Plus, ChevronDown, Receipt, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Intervention {
  id: string;
  reference?: string;
  type: string;
  status?: string;
  priority?: string;
  scheduledAt: string;
  adresse?: string;
  clientId?: string;
  client?: { nom: string };
  techniciens?: { technicien: { user: { firstName: string; lastName: string } } }[];
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

const STATUS_COLORS: Record<string, string> = {
  PLANIFIEE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EN_COURS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  TERMINEE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  ANNULEE: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
};

const EMPTY = { clientId: "", type: "MAINTENANCE", scheduledAt: "", estimatedDuration: "", description: "", adresse: "", priority: "NORMALE" };
interface InvoiceItem { description: string; quantity: number; unitPrice: number; }

type ModalType = "" | "create" | "status" | "facture";

export default function AdminInterventionsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<ModalType>("");
  const [selected, setSelected] = useState<Intervention | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Facture from intervention
  const [factItems, setFactItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [factForm, setFactForm] = useState({ clientId: "", dueDate: "", notes: "", tvaRate: "18" });

  const { data: clientsData } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { id: string; nom: string }[] }>("/clients?limit=200");
      return res.data.data;
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-interventions", search, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (statusFilter) p.set("status", statusFilter);
      const res = await apiClient.get<{ data: Intervention[]; meta: { total: number } }>(`/interventions?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const interventions = data?.data ?? [];

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openStatus(i: Intervention) { setSelected(i); setNewStatus(i.status ?? "PLANIFIEE"); setErr(""); setModal("status"); }

  function openFacturer(intv: Intervention) {
    setSelected(intv);
    const ref = intv.reference ?? intv.id.slice(0, 8).toUpperCase();
    setFactForm({
      clientId: intv.clientId ?? "",
      dueDate: "",
      notes: `Intervention ${ref} du ${fmt(intv.scheduledAt)}`,
      tvaRate: "18",
    });
    setFactItems([{
      description: `Intervention ${intv.type.replace(/_/g, " ")} — ${ref}`,
      quantity: 1,
      unitPrice: 0,
    }]);
    setErr("");
    setModal("facture");
  }

  const f = (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const ff = (k: keyof typeof factForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFactForm(prev => ({ ...prev, [k]: e.target.value }));

  function updateFactItem(i: number, k: keyof InvoiceItem, v: string) {
    setFactItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: k === "description" ? v : Number(v) } : item));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = {
        clientId: form.clientId, type: form.type,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
        description: form.description || undefined, adresse: form.adresse || undefined, priority: form.priority,
      };
      await apiClient.post("/interventions", payload);
      qc.invalidateQueries({ queryKey: ["admin-interventions"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleStatusChange() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.patch(`/interventions/${selected.id}/status`, { status: newStatus });
      qc.invalidateQueries({ queryKey: ["admin-interventions"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleFacturer(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/invoices", {
        clientId: factForm.clientId,
        items: factItems,
        dueDate: factForm.dueDate || undefined,
        notes: factForm.notes || undefined,
        tvaRate: Number(factForm.tvaRate),
        interventionId: selected?.id,
      });
      qc.invalidateQueries({ queryKey: ["admin-factures"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  const factTotal = factItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Interventions</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} interventions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvelle intervention
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Tous statuts</option>
          <option value="PLANIFIEE">Planifiée</option><option value="EN_COURS">En cours</option>
          <option value="TERMINEE">Terminée</option><option value="ANNULEE">Annulée</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : interventions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Wrench className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune intervention</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouvelle intervention
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Référence", "Client", "Type", "Date prévue", "Technicien", "Priorité", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {interventions.map(intv => (
                <tr key={intv.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Wrench className="w-4 h-4 text-primary" /></div>
                      <span className="font-heading font-semibold text-grey-anthracite dark:text-white text-xs">
                        {intv.reference ?? intv.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{intv.client?.nom ?? "—"}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{intv.type?.replace(/_/g, " ") ?? "—"}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">
                    <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{fmt(intv.scheduledAt)}</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">
                    {intv.techniciens?.[0]
                      ? `${intv.techniciens[0].technicien.user.firstName} ${intv.techniciens[0].technicien.user.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2 py-0.5 rounded-md text-xs font-heading font-semibold",
                      intv.priority === "URGENTE" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300" :
                      intv.priority === "HAUTE" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                      "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {intv.priority?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", STATUS_COLORS[intv.status ?? ""] ?? "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {intv.status?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openStatus(intv)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors" title="Changer statut">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {intv.status === "TERMINEE" && (
                        <button
                          onClick={() => openFacturer(intv)}
                          title="Facturer cette intervention"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-grey-text hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <AdminModal open={modal === "create"} onClose={() => setModal("")} title="Nouvelle intervention" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select value={form.clientId} onChange={f("clientId")} required className={inputCls}>
              <option value="">Sélectionner un client...</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={form.type} onChange={f("type")} className={inputCls}>
                <option value="INSTALLATION">Installation</option><option value="MAINTENANCE">Maintenance</option>
                <option value="DEPANNAGE">Dépannage</option><option value="AUDIT">Audit</option><option value="FORMATION">Formation</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Priorité</label>
              <select value={form.priority} onChange={f("priority")} className={inputCls}>
                <option value="BASSE">Basse</option><option value="NORMALE">Normale</option>
                <option value="HAUTE">Haute</option><option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Date prévue *</label><input type="datetime-local" value={form.scheduledAt} onChange={f("scheduledAt")} required className={inputCls} /></div>
            <div><label className={labelCls}>Durée estimée (min)</label><input type="number" value={form.estimatedDuration} onChange={f("estimatedDuration")} min="0" placeholder="Ex: 120" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Adresse</label><input value={form.adresse} onChange={f("adresse")} placeholder="Lieu de l'intervention" className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={f("description")} rows={3} placeholder="Détails de l'intervention..." className={inputCls + " resize-none"} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Créer l'intervention"}</button>
          </div>
        </form>
      </AdminModal>

      {/* Status modal */}
      <AdminModal open={modal === "status"} onClose={() => setModal("")} title="Changer le statut" size="sm">
        <div className="space-y-4">
          <p className="text-xs text-grey-text dark:text-white/50">Intervention : <strong className="text-grey-anthracite dark:text-white">{selected?.reference ?? selected?.id?.slice(0, 8).toUpperCase()}</strong></p>
          <div>
            <label className={labelCls}>Nouveau statut</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={inputCls}>
              <option value="PLANIFIEE">Planifiée</option><option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option><option value="ANNULEE">Annulée</option>
            </select>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button onClick={handleStatusChange} disabled={saving} className={btnPrimary}>{saving ? "Mise à jour..." : "Confirmer"}</button>
          </div>
        </div>
      </AdminModal>

      {/* Facturer intervention modal */}
      <AdminModal open={modal === "facture"} onClose={() => setModal("")} title="Facturer cette intervention" size="lg">
        {selected && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/40">
            <p className="text-xs font-heading font-semibold text-emerald-700 dark:text-emerald-400">
              Intervention {selected.reference ?? selected.id.slice(0, 8).toUpperCase()} — {selected.type.replace(/_/g, " ")}
            </p>
            {selected.client?.nom && (
              <p className="text-xs text-grey-text dark:text-white/50 mt-0.5">
                {selected.client.nom} · {fmt(selected.scheduledAt)}
              </p>
            )}
          </div>
        )}
        <form onSubmit={handleFacturer} className="space-y-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select value={factForm.clientId} onChange={ff("clientId")} required className={inputCls}>
              <option value="">Sélectionner un client...</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Lignes de facturation</label>
            <div className="space-y-2">
              {factItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input placeholder="Description" value={item.description} onChange={e => updateFactItem(i, "description", e.target.value)} className={inputCls + " col-span-6"} />
                  <input type="number" placeholder="Qté" value={item.quantity} onChange={e => updateFactItem(i, "quantity", e.target.value)} min="1" className={inputCls + " col-span-2"} />
                  <input type="number" placeholder="Prix unit." value={item.unitPrice} onChange={e => updateFactItem(i, "unitPrice", e.target.value)} min="0" className={inputCls + " col-span-3"} />
                  {factItems.length > 1 && (
                    <button type="button" onClick={() => setFactItems(p => p.filter((_, idx) => idx !== i))} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setFactItems(p => [...p, { description: "", quantity: 1, unitPrice: 0 }])} className="text-xs text-primary hover:underline">
                + Ajouter une ligne
              </button>
            </div>
            <p className="text-xs text-grey-text dark:text-white/50 mt-2">
              Total HT : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(factTotal)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Date d'échéance</label><input type="date" value={factForm.dueDate} onChange={ff("dueDate")} className={inputCls} /></div>
            <div><label className={labelCls}>TVA (%)</label><input type="number" value={factForm.tvaRate} onChange={ff("tvaRate")} min="0" max="100" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Notes</label><textarea value={factForm.notes} onChange={ff("notes")} rows={2} className={inputCls + " resize-none"} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Créer la facture"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
