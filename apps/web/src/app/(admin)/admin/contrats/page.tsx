"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Search, RefreshCw, CalendarDays, Plus, ChevronDown, Wrench, Receipt, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Contrat {
  id: string;
  reference: string;
  titre?: string;
  clientId?: string;
  client?: { nom: string };
  typeContrat?: string;
  montantHT?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}
function fmtMoney(v?: number) {
  if (!v) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(v);
}

const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40",
  ACTIF: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  EXPIRE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  RESILIE: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
};

const EMPTY = { clientId: "", titre: "", typeContrat: "MAINTENANCE", startDate: "", endDate: "", montantHT: "", description: "" };
const INTR_EMPTY = { clientId: "", type: "MAINTENANCE", scheduledAt: "", estimatedDuration: "", description: "", adresse: "", priority: "NORMALE" };
interface InvoiceItem { description: string; quantity: number; unitPrice: number; }

type ModalType = "" | "create" | "status" | "intervention" | "facture";

export default function AdminContratsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalType>("");
  const [selected, setSelected] = useState<Contrat | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Intervention form (from contract)
  const [intrForm, setIntrForm] = useState(INTR_EMPTY);

  // Facture form (from contract)
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
    queryKey: ["admin-contrats", search],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      const res = await apiClient.get<{ data: Contrat[]; meta: { total: number } }>(`/contracts?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const contrats = data?.data ?? [];

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openStatus(c: Contrat) { setSelected(c); setNewStatus(c.status ?? "ACTIF"); setErr(""); setModal("status"); }

  function openPlanifierIntervention(c: Contrat) {
    setSelected(c);
    setIntrForm({
      clientId: c.clientId ?? "",
      type: "MAINTENANCE",
      scheduledAt: "",
      estimatedDuration: "",
      description: `Intervention dans le cadre du contrat ${c.reference}${c.titre ? ` — ${c.titre}` : ""}`,
      adresse: "",
      priority: "NORMALE",
    });
    setErr("");
    setModal("intervention");
  }

  function openGenererFacture(c: Contrat) {
    setSelected(c);
    setFactForm({ clientId: c.clientId ?? "", dueDate: "", notes: `Contrat ${c.reference}`, tvaRate: "18" });
    setFactItems([{
      description: c.titre ?? `Prestation contrat ${c.reference}`,
      quantity: 1,
      unitPrice: c.montantHT ?? 0,
    }]);
    setErr("");
    setModal("facture");
  }

  const f = (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const fi = (k: keyof typeof INTR_EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setIntrForm(prev => ({ ...prev, [k]: e.target.value }));

  const ff = (k: keyof typeof factForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFactForm(prev => ({ ...prev, [k]: e.target.value }));

  function updateFactItem(i: number, k: keyof InvoiceItem, v: string) {
    setFactItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: k === "description" ? v : Number(v) } : item));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/contracts", {
        clientId: form.clientId, titre: form.titre, typeContrat: form.typeContrat,
        startDate: form.startDate, endDate: form.endDate,
        montantHT: Number(form.montantHT), description: form.description || undefined,
      });
      qc.invalidateQueries({ queryKey: ["admin-contrats"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleStatusChange() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.patch(`/contracts/${selected.id}/status`, { status: newStatus });
      qc.invalidateQueries({ queryKey: ["admin-contrats"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleCreateIntervention(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/interventions", {
        clientId: intrForm.clientId,
        type: intrForm.type,
        scheduledAt: new Date(intrForm.scheduledAt).toISOString(),
        estimatedDuration: intrForm.estimatedDuration ? Number(intrForm.estimatedDuration) : undefined,
        description: intrForm.description || undefined,
        adresse: intrForm.adresse || undefined,
        priority: intrForm.priority,
        contractId: selected?.id,
      });
      qc.invalidateQueries({ queryKey: ["admin-interventions"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleCreateFacture(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/invoices", {
        clientId: factForm.clientId,
        items: factItems,
        dueDate: factForm.dueDate || undefined,
        notes: factForm.notes || undefined,
        tvaRate: Number(factForm.tvaRate),
        contractId: selected?.id,
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
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Contrats</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta?.total ?? 0} contrats</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouveau contrat
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
        <input type="search" placeholder="Rechercher un contrat..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : contrats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><FileText className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucun contrat</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouveau contrat
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Référence", "Client", "Type", "Montant HT", "Période", "Statut", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contrats.map(c => (
                <tr key={c.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
                      <div>
                        <span className="font-heading font-semibold text-grey-anthracite dark:text-white text-xs">{c.reference}</span>
                        {c.titre && <p className="text-[11px] text-grey-text dark:text-white/40 truncate max-w-[120px]">{c.titre}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{c.client?.nom ?? "—"}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">{c.typeContrat ?? "—"}</td>
                  <td className="px-4 py-4 text-xs font-heading font-semibold text-grey-anthracite dark:text-white">{fmtMoney(c.montantHT)}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">
                    <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{fmt(c.startDate)} → {fmt(c.endDate)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", STATUS_COLORS[c.status ?? ""] ?? "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {c.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openStatus(c)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors" title="Changer statut">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openPlanifierIntervention(c)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-grey-text hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        title="Planifier une intervention">
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openGenererFacture(c)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-grey-text hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        title="Générer une facture">
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create contract modal */}
      <AdminModal open={modal === "create"} onClose={() => setModal("")} title="Nouveau contrat" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select value={form.clientId} onChange={f("clientId")} required className={inputCls}>
              <option value="">Sélectionner un client...</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Titre du contrat *</label><input value={form.titre} onChange={f("titre")} required placeholder="Ex: Contrat maintenance annuel" className={inputCls} /></div>
          <div>
            <label className={labelCls}>Type de contrat</label>
            <select value={form.typeContrat} onChange={f("typeContrat")} className={inputCls}>
              <option value="MAINTENANCE">Maintenance</option><option value="INSTALLATION">Installation</option>
              <option value="SURVEILLANCE">Surveillance</option><option value="FORMATION">Formation</option><option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Date de début *</label><input type="date" value={form.startDate} onChange={f("startDate")} required className={inputCls} /></div>
            <div><label className={labelCls}>Date de fin *</label><input type="date" value={form.endDate} onChange={f("endDate")} required className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Montant HT (XOF) *</label><input type="number" value={form.montantHT} onChange={f("montantHT")} required min="0" placeholder="Ex: 500000" className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={f("description")} rows={3} placeholder="Détails du contrat..." className={inputCls + " resize-none"} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Créer le contrat"}</button>
          </div>
        </form>
      </AdminModal>

      {/* Status modal */}
      <AdminModal open={modal === "status"} onClose={() => setModal("")} title="Changer le statut" size="sm">
        <div className="space-y-4">
          <p className="text-xs text-grey-text dark:text-white/50">Contrat : <strong className="text-grey-anthracite dark:text-white">{selected?.reference}</strong></p>
          <div>
            <label className={labelCls}>Nouveau statut</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={inputCls}>
              <option value="BROUILLON">Brouillon</option><option value="ACTIF">Actif</option>
              <option value="EXPIRE">Expiré</option><option value="RESILIE">Résilié</option>
            </select>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button onClick={handleStatusChange} disabled={saving} className={btnPrimary}>{saving ? "Mise à jour..." : "Confirmer"}</button>
          </div>
        </div>
      </AdminModal>

      {/* Planifier intervention modal */}
      <AdminModal open={modal === "intervention"} onClose={() => setModal("")} title="Planifier une intervention" size="lg">
        {selected && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40">
            <p className="text-xs font-heading font-semibold text-amber-700 dark:text-amber-400">Contrat {selected.reference}</p>
            {selected.client?.nom && <p className="text-xs text-grey-text dark:text-white/50 mt-0.5">{selected.client.nom}</p>}
          </div>
        )}
        <form onSubmit={handleCreateIntervention} className="space-y-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select value={intrForm.clientId} onChange={fi("clientId")} required className={inputCls}>
              <option value="">Sélectionner un client...</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type *</label>
              <select value={intrForm.type} onChange={fi("type")} className={inputCls}>
                <option value="INSTALLATION">Installation</option><option value="MAINTENANCE">Maintenance</option>
                <option value="DEPANNAGE">Dépannage</option><option value="AUDIT">Audit</option><option value="FORMATION">Formation</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Priorité</label>
              <select value={intrForm.priority} onChange={fi("priority")} className={inputCls}>
                <option value="BASSE">Basse</option><option value="NORMALE">Normale</option>
                <option value="HAUTE">Haute</option><option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Date prévue *</label><input type="datetime-local" value={intrForm.scheduledAt} onChange={fi("scheduledAt")} required className={inputCls} /></div>
            <div><label className={labelCls}>Durée estimée (min)</label><input type="number" value={intrForm.estimatedDuration} onChange={fi("estimatedDuration")} min="0" placeholder="Ex: 120" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Adresse</label><input value={intrForm.adresse} onChange={fi("adresse")} placeholder="Lieu de l'intervention" className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={intrForm.description} onChange={fi("description")} rows={2} className={inputCls + " resize-none"} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Planifier l'intervention"}</button>
          </div>
        </form>
      </AdminModal>

      {/* Générer facture modal */}
      <AdminModal open={modal === "facture"} onClose={() => setModal("")} title="Générer une facture" size="lg">
        {selected && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/40">
            <p className="text-xs font-heading font-semibold text-emerald-700 dark:text-emerald-400">Contrat {selected.reference}</p>
            {selected.client?.nom && <p className="text-xs text-grey-text dark:text-white/50 mt-0.5">{selected.client.nom}</p>}
          </div>
        )}
        <form onSubmit={handleCreateFacture} className="space-y-4">
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
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Générer la facture"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
